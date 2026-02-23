<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PasswordController - Controlador de configuración de contraseña
 * 
 * Este controlador maneja específicamente el cambio de contraseña del usuario:
 * - Vista de configuración de contraseña con formulario seguro
 * - Validación de contraseña actual antes del cambio
 * - Aplicación de políticas de contraseña segura
 * - Hasheado seguro de la nueva contraseña
 * - Confirmación de cambio exitoso
 * 
 * Funcionalidades principales:
 * - Formulario de cambio de contraseña con validaciones
 * - Verificación obligatoria de contraseña actual
 * - Validación de fortaleza de nueva contraseña
 * - Confirmación de nueva contraseña para evitar errores
 * - Hasheado automático con algoritmos seguros
 * - Feedback de operación exitosa al usuario
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 * @package App\Http\Controllers\Settings
 */

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }
}
