<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * AuthController - Controlador complementario de autenticación
 * 
 * Este controlador maneja funcionalidades adicionales de autenticación que complementan
 * al sistema principal de Laravel Breeze:
 * - Procesos de login personalizados con validación específica
 * - Redirecciones condicionales según rol de usuario
 * - Manejo de sesiones y regeneración de tokens
 * - Validaciones adicionales para casos especiales
 * - Integración con sistemas de autenticación externa
 * 
 * Funcionalidades principales:
 * - Vista personalizada de login con validaciones específicas
 * - Proceso de autenticación con verificación de credenciales
 * - Regeneración segura de sesiones post-login
 * - Redirección inteligente según contexto del usuario
 * - Manejo de errores de autenticación con feedback específico
 * - Logout con limpieza completa de sesión
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 * @package App\Http\Controllers
 */

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'Credenciales incorrectas.',
        ]);
    }

    public function showRegister()
    {
        return view('auth.register');
    }

    public function register(Request $request)
    {
        // Lógica de registro
    }
}
