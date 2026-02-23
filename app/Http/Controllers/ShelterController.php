<?php

namespace App\Http\Controllers;

use App\Models\Shelter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * ShelterController - Controlador del módulo de gestión de refugios
 * 
 * Este controlador maneja todas las operaciones relacionadas con refugios de animales:
 * - Directorio público de refugios registrados
 * - Registro de nuevos refugios por usuarios verificados
 * - Gestión de información de contacto y ubicación
 * - Integración con sistema de donaciones
 * - Ordenamiento por popularidad y donaciones recibidas
 * 
 * Funcionalidades principales:
 * - Vista pública del directorio de refugios
 * - Registro de refugios con validación de datos
 * - Información de contacto y geolocalización
 * - Conteo de donaciones por refugio
 * - Sistema de verificación de refugios legítimos
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 * @package App\Http\Controllers
 */

class ShelterController extends Controller
{
    /**
     * Muestra una lista de todos los refugios.
     */
    public function index()
    {
        // Obtenemos los refugios, contamos sus donaciones y los ordenamos
        $shelters = Shelter::with('user')
            ->withCount('donations') // Crea la columna 'donations_count'
            ->orderBy('donations_count', 'desc') // Ordena de mayor a menor
            ->get();

        // Renderizamos la vista y le pasamos los datos
        //  'refugios.tsx', que se renderiza como 'refugios'.
        return Inertia::render('refugios', [
            'shelters' => $shelters,
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo refugio.
     */
    public function create()
    {
        return Inertia::render('shelter/register');
    }

    /**
     * Almacena un nuevo refugio en la base de datos.
     * (Este método también lo debes tener ya)
     */
    public function store(Request $request)
    {
        // 1. Valida que todos los campos del formulario sean correctos
        // 1. Valida que todos los campos del formulario sean correctos, incluyendo lat/lng
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:shelters,name',
            'description' => 'required|string|max:1000',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'bank_name' => 'required|string|max:100',
            'account_type' => 'required|string|max:50',
            'account_number' => 'required|string|max:50|unique:shelters,account_number',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        // 2. Añade el ID del usuario actual (el aliado) a los datos validados
        $validatedData['user_id'] = Auth::id();

        // 3. Crea el registro en la tabla 'shelters'
        Shelter::create($validatedData);

        // 4. Redirige al usuario de vuelta a la página de donaciones.
        // Inertia recargará la página y el DonacionesController mostrará la nueva vista.
        return redirect()->route('donaciones.index')->with('success', '¡Tu fundación ha sido registrada exitosamente!');
    }

    /**
     * API endpoint para obtener los refugios ordenados por cantidad de mascotas (de mayor a menor).
     */
    public function topShelters()
    {
        $shelters = Shelter::select('shelters.*')
            ->selectRaw('COUNT(mascotas.id) as mascotas_count')
            ->leftJoin('mascotas', 'shelters.user_id', '=', 'mascotas.user_id')
            ->groupBy('shelters.id')
            ->orderBy('mascotas_count', 'desc')
            ->limit(5)
            ->with('user')
            ->get()
            ->map(function ($shelter) {
                return [
                    'id' => $shelter->id,
                    'name' => $shelter->name,
                    'avatarUrl' => $shelter->user->avatar ? asset('storage/' . $shelter->user->avatar) : '',
                    'mascotas' => $shelter->mascotas_count,
                    'link' => route('refugios'),
                ];
            });

        return response()->json($shelters);
    }
}
