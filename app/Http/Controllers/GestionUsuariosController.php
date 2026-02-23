<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GestionUsuariosController extends Controller
{
    public function index()
    {
        // Verificar que sea admin
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Acceso denegado');
        }

        // Obtener todos los usuarios
        $usuarios = User::all();

        return Inertia::render('Dashboard/GestionUsuarios/index', [
            'usuarios' => $usuarios,
        ]);
    }

    public function store(Request $request)
    {
        // Debug: verificar usuario autenticado
        $currentUser = auth()->user();
        Log::info('Usuario actual intentando crear usuario:', [
            'user_id' => $currentUser ? $currentUser->id : null,
            'user_role' => $currentUser ? $currentUser->role : null,
            'request_data' => $request->all()
        ]);

        if (!$currentUser || $currentUser->role !== 'admin') {
            Log::warning('Acceso denegado: usuario no es admin', [
                'user_id' => $currentUser ? $currentUser->id : null,
                'user_role' => $currentUser ? $currentUser->role : null
            ]);
            abort(403, 'Acceso denegado');
        }

        // Validar campos. La regla unique se limita a usuarios que NO están soft-deleted
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->whereNull('deleted_at')],
                'password' => 'required|string|min:8',
                'role' => 'required|in:cliente,aliado,admin',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación:', $e->errors());
            throw $e;
        }

        // Si existe un usuario soft-deleted con el mismo email, lo restauramos y actualizamos
        $trashed = User::withTrashed()->where('email', $request->email)->first();
        if ($trashed && $trashed->trashed()) {
            Log::info('Usuario soft-deleted encontrado. Restaurando en lugar de crear uno nuevo.', ['email' => $request->email, 'trashed_id' => $trashed->id]);

            $trashed->restore();
            $trashed->update([
                'name' => $request->name,
                'password' => bcrypt($request->password),
                'role' => $request->role,
            ]);

            $user = $trashed;
            Log::info('Usuario restaurado y actualizado:', ['user_id' => $user->id, 'email' => $user->email]);
        } else {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'role' => $request->role,
            ]);
            Log::info('Usuario creado exitosamente:', ['user_id' => $user->id, 'email' => $user->email]);
        }

        Log::info('Usuario creado exitosamente:', ['user_id' => $user->id, 'email' => $user->email]);

        // Enviar email de bienvenida usando Laravel nativo
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\WelcomeMail($user));
            Log::info('Email de bienvenida enviado exitosamente via Laravel para usuario:', ['user_id' => $user->id]);
        } catch (\Exception $e) {
            Log::error('Error enviando email de bienvenida via Laravel: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Usuario creado exitosamente');
    }

    public function update(Request $request, User $user)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Acceso denegado');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)->whereNull('deleted_at')],
            'role' => 'required|in:cliente,aliado,admin',
        ]);

        $user->update($request->only(['name', 'email', 'role']));

        return redirect()->back()->with('success', 'Usuario actualizado exitosamente');
    }

    public function destroy(User $user)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Acceso denegado');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Usuario eliminado exitosamente');
    }

    public function sendBulkEmail(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Acceso denegado');
        }

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();

        // Simulación
        foreach ($users as $user) {
            // Enviar email
        }

        return redirect()->back()->with('success', 'Correos enviados exitosamente');
    }
}
