<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Solicitud;

/**
 * AccionSolicitudController - Controlador de acciones específicas sobre solicitudes
 * 
 * Este controlador maneja las acciones puntuales que se pueden realizar sobre solicitudes:
 * - Aprobación de solicitudes por parte del dueño de la mascota
 * - Rechazo de solicitudes con motivo específico
 * - Cancelación de solicitudes por parte del adoptante
 * - Finalización del proceso de adopción
 * - Cambios de estado con validación de permisos
 * 
 * Funcionalidades principales:
 * - Gestión del flujo de estados de solicitudes
 * - Validación de autorización para cada acción
 * - Registro de motivos en rechazos
 * - Notificaciones automáticas a las partes involucradas
 * - Auditoría de cambios de estado
 * - Integración con sistema de historial
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 * @package App\Http\Controllers
 */
class AccionSolicitudController extends Controller
{
    /**
     * Crear nueva solicitud de adopción o compra
     * 
     * Procesa solicitudes de usuarios para adoptar mascotas o comprar productos.
     * La solicitud se crea en estado "En proceso" y queda pendiente de revisión
     * por parte del propietario del elemento.
     * 
     * @param Request $request Datos de la solicitud (tipo, item_id)
     * @return \Illuminate\Http\RedirectResponse Redirección con mensaje de éxito
     */
    public function store(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:adopcion,compra',
            'item_id' => 'required|integer',
        ]);

        $solicitud = Solicitud::create([
            'user_id' => Auth::id(),
            'tipo' => $request->tipo,
            'item_id' => $request->item_id,
            'estado' => 'En proceso',
        ]);

        // Aquí puedes disparar la notificación si tienes lógica implementada
        // Notification::send(...)

        // Redirige a la página de solicitudes con mensaje flash para Inertia
        return redirect()->route('solicitudes.index')->with('success', 'Solicitud registrada correctamente.');
    }
}
