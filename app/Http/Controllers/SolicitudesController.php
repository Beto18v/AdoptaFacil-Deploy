<?php

namespace App\Http\Controllers;

use App\Models\Mascota;
use App\Models\Product;
use App\Models\Solicitud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * SolicitudesController - Controlador principal del módulo de solicitudes de adopción
 * 
 * Este controlador gestiona todo el proceso de solicitudes de adopción en AdoptaFácil:
 * - Dashboard de solicitudes diferenciado por rol de usuario
 * - Visualización de solicitudes recibidas para dueños de mascotas
 * - Gestión de solicitudes enviadas para adoptantes
 * - Creación de nuevas solicitudes con validación completa
 * - Seguimiento del estado y progreso de cada solicitud
 * 
 * Funcionalidades principales:
 * - Vista personalizada según rol (aliado/dueño vs cliente/adoptante)
 * - CRUD completo de solicitudes con autorización
 * - Sistema de estados (pendiente, aprobada, rechazada, cancelada)
 * - Integración con sistema de notificaciones
 * - Validación de datos del adoptante y mascota
 * - Prevención de solicitudes duplicadas
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 * @package App\Http\Controllers
 */

class SolicitudesController extends Controller
{
    /**
     * Muestra la lista de solicitudes.
     * Si el usuario es un 'aliado', muestra las solicitudes de sus mascotas/productos.
     * Si es un cliente, muestra solo sus propias solicitudes.
     */
    public function index()
    {
        $user = Auth::user();

        // El código que ya tenías para mostrar las solicitudes según el rol del usuario
        if ($user->role === 'aliado') {
            $mascotaIds = Mascota::where('user_id', $user->id)->pluck('id');
            // Incluimos user_id explícitamente en la relación mascota
            $solicitudes = Solicitud::with(['user', 'mascota' => function ($q) {
                $q->select('id', 'nombre', 'imagen', 'user_id', 'especie', 'raza');
            }])
                ->whereIn('mascota_id', $mascotaIds)
                ->orderByDesc('id')
                ->get();
        } else {
            // Para clientes, muestra solo sus solicitudes
            $solicitudes = Solicitud::with(['user', 'mascota' => function ($q) {
                $q->select('id', 'nombre', 'imagen', 'user_id', 'especie', 'raza');
            }])
                ->where('user_id', $user->id)
                ->orderByDesc('id')
                ->get();
        }

        return Inertia::render('Dashboard/Solicitudes/index', [
            'solicitudes' => $solicitudes,
        ]);
    }

    /**
     * ✨ MÉTODO AÑADIDO: Guarda una nueva solicitud de adopción en la base de datos.
     */
    public function store(Request $request)
    {
        try {
            // Validación para los campos más importantes
            $request->validate([
                'mascota_id' => 'required|exists:mascotas,id',
                'nombre_completo' => 'required|string|max:255',
                'cedula' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'telefono' => 'required|string|max:255',
                'acepta_proceso_evaluacion' => 'required|accepted',
                'acepta_cuidado_responsable' => 'required|accepted',
                'acepta_contrato_adopcion' => 'required|accepted',
            ]);

            $userId = Auth::id();
            $mascotaId = $request->mascota_id;

            // Verificar si ya existe una solicitud pendiente o aprobada para esta mascota por este usuario
            $existingSolicitud = Solicitud::where('user_id', $userId)
                ->where('mascota_id', $mascotaId)
                ->whereIn('estado', ['Enviada', 'En Proceso', 'Aprobada'])
                ->first();

            if ($existingSolicitud) {
                return response()->json([
                    'errors' => [
                        'mascota_id' => ['Ya tienes una solicitud pendiente o aprobada para esta mascota.']
                    ]
                ], 422);
            }

            $data = $request->all();
            $data['user_id'] = $userId;
            $data['estado'] = 'Enviada'; // Estado inicial por defecto

            Solicitud::create($data);

            // Redirige a la página del índice de solicitudes con un mensaje de éxito.
            return redirect()->route('solicitudes.index')->with('success', '¡Solicitud enviada con éxito!');
        } catch (\Exception $e) {
            // Manejar errores generales
            return response()->json([
                'errors' => [
                    'general' => ['Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.']
                ]
            ], 500);
        }
    }

    /**
     * ✨ MÉTODO AÑADIDO: Cancela (elimina) una solicitud.
     */
    public function destroy(Solicitud $solicitud)
    {
        // Asegura que solo el dueño de la solicitud pueda cancelarla
        if ($solicitud->user_id !== Auth::id()) {
            abort(403, 'Acción no autorizada.');
        }

        $solicitud->delete();

        return back()->with('success', 'Solicitud cancelada correctamente.');
    }

    /**
     * Cambia el estado de la solicitud (aprobar/rechazar).
     */
    public function updateEstado(Request $request, $id)
    {
        try {
            $request->validate([
                'estado' => 'required|in:Aprobada,Rechazada',
                'comentario_rechazo' => 'nullable|string|max:1000'
            ]);

            $solicitud = Solicitud::findOrFail($id);

            // Solo el aliado dueño de la mascota puede cambiar el estado
            $user = Auth::user();
            if ($user->role !== 'aliado' || $solicitud->mascota->user_id !== $user->id) {
                return response()->json([
                    'error' => 'No autorizado para cambiar el estado de esta solicitud.'
                ], 403);
            }

            $solicitud->estado = $request->estado;

            // Si se rechaza la solicitud, guardar el comentario de rechazo
            if ($request->estado === 'Rechazada') {
                $solicitud->comentario_rechazo = $request->comentario_rechazo;
            } else {
                // Si se aprueba, limpiar cualquier comentario de rechazo previo
                $solicitud->comentario_rechazo = null;
            }

            $solicitud->save();

            return response()->json([
                'success' => true,
                'estado' => $solicitud->estado,
                'comentario_rechazo' => $solicitud->comentario_rechazo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ocurrió un error al actualizar el estado de la solicitud.'
            ], 500);
        }
    }
}
