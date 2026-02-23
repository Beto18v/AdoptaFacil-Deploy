<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Shelter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * DonacionesController - Controlador principal del módulo de donaciones
 * 
 * Este controlador gestiona todo el sistema de donaciones de AdoptaFácil:
 * - Dashboard de donaciones personalizado por rol de usuario
 * - Visualización de donaciones recibidas para refugios
 * - Historial de donaciones realizadas para donantes
 * - Procesamiento de nuevas donaciones con validación
 * - Integración con refugios y causas específicas
 * 
 * Funcionalidades principales:
 * - Vista diferenciada para aliados (refugios) y clientes (donantes)
 * - Filtrado de donaciones por refugio y donante
 * - Registro de nuevas donaciones con datos completos
 * - Integración con sistema de refugios
 * - Dashboard con estadísticas y métricas
 * - Gestión de donaciones anónimas y públicas
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 * @package App\Http\Controllers
 */

class DonacionesController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->load('shelter'); // Cargamos la relación del refugio

        $donationsQuery = Donation::with('shelter')->orderBy('created_at', 'desc');

        if ($user->role === 'aliado') {
            if ($user->shelter) {
                $donationsQuery->where('shelter_id', $user->shelter->id);
            } else {
                $donationsQuery->where('shelter_id', -1);
            }
        } elseif ($user->role === 'cliente') {
            $donationsQuery->where('donor_email', $user->email);
        }

        return Inertia::render('Dashboard/Donaciones/index', [
            'donations' => $donationsQuery->get(),
            'shelters' => Shelter::all(['id', 'name']),
            // No es necesario pasar 'auth' de nuevo, HandleInertiaRequests ya lo hace.
            // Nos aseguramos que la info del refugio del usuario esté actualizada.
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'required|email|max:255',
            'amount' => 'required|numeric|min:1000',
            'shelter_id' => 'required|exists:shelters,id',
        ]);

        Donation::create($validatedData);

        return redirect()->back()->with('success', '¡Donación registrada exitosamente!');
    }
}
