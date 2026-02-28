<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect(Request $request)
    {
        $useStateless = (bool) env('GOOGLE_OAUTH_STATELESS', false);

        Log::info('Google OAuth redirect start', [
            'url' => $request->fullUrl(),
            'secure' => $request->isSecure(),
            'forwarded_proto' => $request->header('x-forwarded-proto'),
            'use_stateless' => $useStateless,
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

        try {
            $driver = Socialite::driver('google');
            if ($useStateless) {
                $driver = $driver->stateless();
            }

            $googleUser = $driver->user();

            $user = User::where('email', $googleUser->getEmail())->first();


            $isNewUser = false;
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => bcrypt(uniqid()), // Random password since Google handles auth
                    'email_verified_at' => now(),
                ]);
                $isNewUser = true;
            } else {
                // Update Google ID if not set
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->getId()]);
                }
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
            ]);

            return redirect()->route('login')->withErrors(['google' => 'Error al iniciar sesión con Google.']);
        }
    }
}
