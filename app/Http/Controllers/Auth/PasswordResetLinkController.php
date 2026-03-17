<?php

namespace App\Http\Controllers\Auth;

use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => [
                'required',
                'email',
                Rule::exists('users', 'email')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
        ], [
            'email.exists' => 'No encontramos una cuenta activa con ese correo electrónico.',
        ]);

        $user = User::query()
            ->where('email', $request->input('email'))
            ->whereNull('deleted_at')
            ->firstOrFail();

        $token = Password::broker()->createToken($user);

        Mail::to($user->email)->send(new PasswordResetMail($user, $token));

        return back()->with('status', 'Te enviamos un enlace para restablecer tu contraseña.');
    }
}
