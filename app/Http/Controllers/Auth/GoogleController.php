<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect(Request $request)
    {
        $useStateless = (bool) env('GOOGLE_OAUTH_STATELESS', false);
        $selectedRole = $request->string('role')->toString();
        $role = in_array($selectedRole, ['cliente', 'aliado'], true) ? $selectedRole : null;

        $request->session()->forget('google_oauth_role');

        if ($role !== null) {
            $request->session()->put('google_oauth_role', $role);
        }

        Log::info('Google OAuth redirect start', [
            'url' => $request->fullUrl(),
            'secure' => $request->isSecure(),
            'forwarded_proto' => $request->header('x-forwarded-proto'),
            'use_stateless' => $useStateless,
            'requested_role' => $role,
        ]);

        $driver = Socialite::driver('google');
        if ($useStateless) {
            $driver = $driver->stateless();
        }

        return $driver->redirect();
    }

    public function callback(Request $request)
    {
        $useStateless = (bool) env('GOOGLE_OAUTH_STATELESS', false);
        $requestedRole = $request->session()->pull('google_oauth_role');
        $role = in_array($requestedRole, ['cliente', 'aliado'], true) ? $requestedRole : 'cliente';

        try {
            $driver = Socialite::driver('google');
            if ($useStateless) {
                $driver = $driver->stateless();
            }

            $googleUser = $driver->user();

            $googleId = (string) $googleUser->getId();
            $email = (string) $googleUser->getEmail();
            $name = (string) ($googleUser->getName() ?: $email);

            [$user, $isNewUser] = DB::transaction(function () use ($googleId, $email, $name, $role) {
                $userByGoogleId = User::query()->withTrashed()->where('google_id', $googleId)->first();
                $userByEmail = User::query()->withTrashed()->where('email', $email)->first();

                if ($userByGoogleId && $userByEmail && $userByGoogleId->getKey() !== $userByEmail->getKey()) {
                    Log::warning('Google OAuth account conflict', [
                        'google_id' => $googleId,
                        'email' => $email,
                        'user_by_google_id' => $userByGoogleId->getKey(),
                        'user_by_email' => $userByEmail->getKey(),
                    ]);

                    return [null, false];
                }

                $user = $userByGoogleId ?: $userByEmail;
                $isNewUser = false;

                if (!$user) {
                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'role' => $role,
                        'google_id' => $googleId,
                        'password' => bcrypt(uniqid()),
                        'email_verified_at' => now(),
                    ]);
                    $isNewUser = true;
                } else {
                    if (method_exists($user, 'restore') && $user->trashed()) {
                        $user->restore();
                    }

                    $updates = [];

                    if (!$user->google_id) {
                        $updates['google_id'] = $googleId;
                    }

                    if ($userByGoogleId && $user->email !== $email) {
                        $emailTaken = User::query()
                            ->where('email', $email)
                            ->whereKeyNot($user->getKey())
                            ->exists();

                        if (!$emailTaken) {
                            $updates['email'] = $email;
                        }
                    }

                    if (!empty($updates)) {
                        $user->forceFill($updates)->save();
                    }
                }

                return [$user, $isNewUser];
            });

            if (!$user) {
                return redirect()->route('login')->withErrors([
                    'google' => 'Tu cuenta de Google ya está vinculada a otro usuario. Contacta soporte si necesitas recuperar el acceso.',
                ]);
            }

            // Enviar email de bienvenida solo si es nuevo usuario
            if ($isNewUser) {
                try {
                    \Illuminate\Support\Facades\Mail::to($user)->send(new \App\Mail\WelcomeMail($user));
                } catch (\Exception $e) {
                    Log::error('Error enviando email de bienvenida (Google): ' . $e->getMessage());
                }
            }

            Auth::login($user);

            return redirect()->intended(route('dashboard'));
        } catch (\Exception $e) {
            Log::error('Google OAuth callback failed', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'url' => $request->fullUrl(),
                'secure' => $request->isSecure(),
                'forwarded_proto' => $request->header('x-forwarded-proto'),
                'use_stateless' => $useStateless,
                'has_code' => $request->has('code'),
                'has_state' => $request->has('state'),
                'state_length' => $request->has('state') ? strlen((string) $request->query('state')) : null,
                'session_driver' => config('session.driver'),
                'session_cookie' => config('session.cookie'),
                'session_cookie_present' => $request->cookies->has((string) config('session.cookie')),
                'app_url' => config('app.url'),
                'google_redirect' => config('services.google.redirect'),
                'requested_role' => $requestedRole,
            ]);

            return redirect()->route('login')->withErrors(['google' => 'Error al iniciar sesión con Google.']);
        }
    }
}
