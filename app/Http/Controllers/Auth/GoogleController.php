<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

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
            return redirect()->route('login')->withErrors(['google' => 'Error al iniciar sesión con Google.']);
        }
    }
}
