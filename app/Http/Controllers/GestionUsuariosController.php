<?php

namespace App\Http\Controllers;

use App\Mail\BulkEmailMail;
use App\Models\User;
use App\Services\UserDeletionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GestionUsuariosController extends Controller
{
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Acceso denegado');
        }

        $usuarios = User::all();

        return Inertia::render('Dashboard/GestionUsuarios/index', [
            'usuarios' => $usuarios,
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = auth()->user();
        Log::info('Usuario actual intentando crear usuario:', [
            'user_id' => $currentUser ? $currentUser->id : null,
            'user_role' => $currentUser ? $currentUser->role : null,
            'request_data' => $request->all(),
        ]);

        if (! $currentUser || $currentUser->role !== 'admin') {
            Log::warning('Acceso denegado: usuario no es admin', [
                'user_id' => $currentUser ? $currentUser->id : null,
                'user_role' => $currentUser ? $currentUser->role : null,
            ]);
            abort(403, 'Acceso denegado');
        }

        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->whereNull('deleted_at')],
                'password' => 'required|string|min:8',
                'role' => 'required|in:cliente,aliado,admin',
            ]);
        } catch (\Illuminate\Validation\ValidationException $exception) {
            Log::error('Error de validacion:', $exception->errors());
            throw $exception;
        }

        $trashed = User::withTrashed()->where('email', $request->email)->first();
        if ($trashed && $trashed->trashed()) {
            Log::info('Usuario soft-deleted encontrado. Restaurando en lugar de crear uno nuevo.', [
                'email' => $request->email,
                'trashed_id' => $trashed->id,
            ]);

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

        try {
            Mail::to($user->email)->send(new \App\Mail\WelcomeMail($user));
            Log::info('Email de bienvenida enviado exitosamente via Laravel para usuario:', ['user_id' => $user->id]);
        } catch (\Exception $exception) {
            Log::error('Error enviando email de bienvenida via Laravel: ' . $exception->getMessage());
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

    public function destroy(User $user, UserDeletionService $userDeletionService)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Acceso denegado');
        }

        $userDeletionService->delete($user);

        return redirect()->back()->with('success', 'Usuario eliminado exitosamente');
    }

    public function sendBulkEmail(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Acceso denegado');
        }

        $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => [
                'required',
                'distinct',
                Rule::exists('users', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
        ]);

        $users = User::query()
            ->whereIn('id', $request->input('user_ids', []))
            ->whereNull('deleted_at')
            ->get(['id', 'name', 'email']);

        $validRecipients = [];
        $failedRecipients = [];
        $subject = (string) $request->input('subject');
        $description = (string) $request->input('description');

        foreach ($users as $user) {
            if (! filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
                $failedRecipients[] = $user->email;

                Log::warning('Correo masivo omitido por email invalido', [
                    'admin_id' => auth()->id(),
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);

                continue;
            }

            $validRecipients[] = $user->email;
        }

        if ($validRecipients === []) {
            return redirect()->back()->with('error', 'No se pudo enviar ningun correo. Revisa los destinatarios seleccionados.');
        }

        try {
            Mail::to(config('mail.from.address'))
                ->bcc($validRecipients)
                ->send(new BulkEmailMail((object) ['name' => ''], $subject, $description, null));
        } catch (\Throwable $exception) {
            Log::error('Error enviando correo masivo', [
                'admin_id' => auth()->id(),
                'user_ids' => $request->input('user_ids', []),
                'valid_recipients' => $validRecipients,
                'error' => $exception->getMessage(),
            ]);

            return redirect()->back()->with('error', 'No se pudieron enviar los correos seleccionados.');
        }

        if ($failedRecipients !== []) {
            $failedCount = count($failedRecipients);

            return redirect()->back()->with(
                'warning',
                "Se envio el correo a " . count($validRecipients) . " destinatario(s). {$failedCount} destinatario(s) no se pudo procesar.",
            );
        }

        return redirect()->back()->with('success', 'Correos enviados exitosamente');
    }
}
