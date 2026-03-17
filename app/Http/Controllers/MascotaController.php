<?php

namespace App\Http\Controllers;

use App\Models\Mascota;
use App\Http\Requests\StoreMascotaRequest;
use App\Http\Requests\UpdateMascotaRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

/**
 * Controlador del modulo de mascotas.
 * Gestiona el catalogo publico y el CRUD de mascotas con soporte de imagenes.
 */
class MascotaController extends Controller
{
    use \App\Traits\SecureFileUpload;

    /**
     * Vista de mascotas para clientes
     */
    public function index()
    {
        $mascotas = Mascota::query()
            ->whereHas('user')
            ->with(['user', 'images'])
            ->get();

        return Inertia::render('Cliente/Mascotas', ['mascotas' => $mascotas]);
    }

    /**
     * Vista pública de mascotas para navegación general
     */
    public function indexPublic()
    {
        $mascotas = Mascota::query()
            ->whereHas('user')
            ->with(['user', 'images'])
            ->get();

        return Inertia::render('mascotas', ['mascotas' => $mascotas]);
    }

    /**
     * Registra mascota con sistema de múltiples imágenes (hasta 3)
     * Usa StoreMascotaRequest para validación de datos e imágenes
     */
    public function store(StoreMascotaRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        // Primera imagen como imagen principal (compatibilidad con sistema anterior)
        if ($request->hasFile('imagenes') && count($request->file('imagenes')) > 0) {
            $firstImage = $request->file('imagenes')[0];
            $path = $this->uploadSecurely($firstImage, 'mascotas', 'public');
            if ($path) {
                $data['imagen'] = $path;
            }
        }

        $mascota = Mascota::create($data);

        // Guardar todas las imágenes en tabla mascota_images con orden
        if ($request->hasFile('imagenes')) {
            foreach ($request->file('imagenes') as $index => $imagen) {
                $path = $this->uploadSecurely($imagen, 'mascotas', 'public');
                
                if ($path) {
                    \App\Models\MascotaImage::create([
                        'mascota_id' => $mascota->id,
                        'imagen_path' => $path,
                        'orden' => $index + 1, // Orden para galería
                    ]);
                }
            }
        }

        return Redirect::route('productos.mascotas')->with('success', 'Mascota registrada correctamente');
    }

    /**
     * Muestra los datos de una mascota específica para edición
     */
    public function show(Mascota $mascota)
    {
        Gate::authorize('view', $mascota);

        $mascota->load(['user', 'images']);

        return response()->json([
            'id' => $mascota->id,
            'nombre' => $mascota->nombre,
            'especie' => $mascota->especie,
            'raza' => $mascota->raza,
            'fecha_nacimiento' => $mascota->fecha_nacimiento?->format('Y-m-d'),
            'sexo' => $mascota->sexo,
            'ciudad' => $mascota->ciudad,
            'descripcion' => $mascota->descripcion,
            'imagenes_existentes' => $mascota->images->pluck('imagen_path')->toArray(),
        ]);
    }

    /**
     * Actualiza una mascota existente
     */
    public function update(UpdateMascotaRequest $request, Mascota $mascota)
    {
        Gate::authorize('update', $mascota);

        $data = $request->validated();
        $mascota->update($data);

        // Manejar nuevas imágenes si se proporcionan
        if ($request->hasFile('imagenes')) {
            foreach ($request->file('imagenes') as $index => $imagen) {
                $path = $this->uploadSecurely($imagen, 'mascotas', 'public');
                
                if ($path) {
                    $mascota->images()->create([
                        'imagen_path' => $path,
                        'orden' => $mascota->images()->count() + $index + 1,
                    ]);
                }
            }
        }

        return Redirect::route('productos.mascotas')->with('success', 'Mascota actualizada correctamente');
    }

    /**
     * Elimina mascota con autorización
     */
    public function destroy(Mascota $mascota)
    {
        Gate::authorize('delete', $mascota);
        $mascota->delete();
        return redirect()->route('productos.mascotas')->with('success', 'Mascota eliminada correctamente.');
    }
}
