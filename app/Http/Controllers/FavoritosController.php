<?php

namespace App\Http\Controllers;

use App\Models\Favorito;
use App\Models\Mascota;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/**
 * Controlador del modulo de favoritos.
 * Gestiona el dashboard, el toggle y las consultas de favoritos por usuario.
 */

class FavoritosController extends Controller
{
    /**
     * Mostrar la página de favoritos del usuario
     */
    public function index()
    {
        $user = Auth::user();

        // Obtener mascotas favoritas del usuario con sus relaciones
        $favoritos = $user->mascotasFavoritas()
            ->whereHas('user')
            ->with(['user', 'images'])
            ->get();

        return Inertia::render('Dashboard/Favoritos/index', [
            'favoritos' => $favoritos
        ]);
    }

    /**
     * Agregar una mascota a favoritos
     */
    public function store(Request $request)
    {
        $request->validate([
            'mascota_id' => 'required|exists:mascotas,id'
        ]);

        $user = Auth::user();
        $mascotaId = $request->mascota_id;

        // Verificar si ya existe el favorito
        $existeFavorito = Favorito::where('user_id', $user->id)
            ->where('mascota_id', $mascotaId)
            ->exists();

        if ($existeFavorito) {
            return response()->json([
                'success' => false,
                'message' => 'Esta mascota ya está en tus favoritos'
            ], 409);
        }

        // Crear el favorito
        Favorito::create([
            'user_id' => $user->id,
            'mascota_id' => $mascotaId
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mascota agregada a favoritos'
        ]);
    }

    /**
     * Quitar una mascota de favoritos
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'mascota_id' => 'required|exists:mascotas,id'
        ]);

        $user = Auth::user();
        $mascotaId = $request->mascota_id;

        $favorito = Favorito::where('user_id', $user->id)
            ->where('mascota_id', $mascotaId)
            ->first();

        if (!$favorito) {
            return response()->json([
                'success' => false,
                'message' => 'Esta mascota no está en tus favoritos'
            ], 404);
        }

        $favorito->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mascota eliminada de favoritos'
        ]);
    }

    /**
     * Verificar si una mascota está en favoritos del usuario
     */
    public function check(Request $request)
    {
        $request->validate([
            'mascota_id' => 'required|exists:mascotas,id'
        ]);

        $user = Auth::user();
        $mascotaId = $request->mascota_id;

        $esFavorito = Favorito::where('user_id', $user->id)
            ->where('mascota_id', $mascotaId)
            ->exists();

        return response()->json([
            'is_favorite' => $esFavorito
        ]);
    }

    /**
     * Obtener IDs de todas las mascotas favoritas del usuario
     */
    public function getFavoriteIds()
    {
        // Verificar si el usuario está autenticado
        if (!Auth::check()) {
            return response()->json([
                'favorite_ids' => [],
                'authenticated' => false
            ]);
        }

        try {
            $user = Auth::user();

            $favoriteIds = $user->favoritos()
                ->pluck('mascota_id')
                ->toArray();

            return response()->json([
                'favorite_ids' => $favoriteIds,
                'authenticated' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'favorite_ids' => [],
                'authenticated' => false,
                'error' => 'Error al obtener favoritos'
            ]);
        }
    }
}
