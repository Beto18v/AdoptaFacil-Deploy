<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/register', [
            'role' => $request->query('role', 'cliente'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Validamos los datos
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'string', 'in:cliente,aliado'],
        ]);

        // 2. Buscamos al usuario (incluyendo inactivos)
        $user = User::withTrashed()->where('email', $request->email)->first();

        // 3. Si el usuario existe...
        if ($user) {
            // ... y está inactivo
            if ($user->trashed()) {
                // Lo restauramos y actualizamos
                $user->restore();
                $user->forceFill([
                    'name' => $request->name,
                    'password' => Hash::make($request->password),
                    'role' => $request->role,
                ])->save();
            } else {
                // ... y está activo, lanzamos el error
                throw ValidationException::withMessages([
                    'email' => 'Correo ya registrado.',
                ]);
            }
        } else {
            // 4. Si no existe, lo creamos
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);
        }

        // 6. Enviar email de bienvenida igual que en Google OAuth:
        // inmediato, sin depender de workers de cola en producción.
        try {
            Mail::to($user)->send(new WelcomeMail($user));
        } catch (\Exception $e) {
            // Log del error pero no fallar el registro
            \Illuminate\Support\Facades\Log::warning('Error enviando email de bienvenida: '.$e->getMessage());
        }

        // 7. Iniciamos sesión y redirigimos
        event(new Registered($user));
        Auth::login($user);

        // Redirección inteligente: si hay intended, redirige ahí
        if (session()->has('url.intended')) {
            $intended = session('url.intended');
            session()->forget('url.intended');

            return redirect($intended);
        }
        $url = route('dashboard', absolute: false);

        return redirect($url)->header('X-Inertia-Location', $url);
    }
}
