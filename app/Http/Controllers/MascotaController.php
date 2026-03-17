<?php

namespace App\Http\Controllers;

use App\Models\Mascota;
use App\Http\Requests\StoreMascotaRequest;
use App\Http\Requests\UpdateMascotaRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
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
        $mascotas = $this->mascotaQuery()->get();

        return Inertia::render('Cliente/Mascotas', ['mascotas' => $mascotas]);
    }

    /**
     * Vista pública de mascotas para navegación general
     */
    public function indexPublic()
    {
        $mascotas = $this->mascotaQuery()->get();

        return Inertia::render('mascotas', ['mascotas' => $mascotas]);
    }

    /**
     * Registra mascota con sistema de múltiples imágenes (hasta 3)
     * Usa StoreMascotaRequest para validación de datos e imágenes
     */
    public function store(StoreMascotaRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();
        $imagePaths = $this->uploadMascotaImages($request);

        if ($imagePaths !== []) {
            $data['imagen'] = $imagePaths[0];
        }

        $mascota = Mascota::create($data);
        $this->storeMascotaImages($mascota, $imagePaths);

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
    public function update(UpdateMascotaRequest $request, Mascota $mascota): RedirectResponse
    {
        Gate::authorize('update', $mascota);

        $data = $request->validated();
        $imagePaths = $this->uploadMascotaImages($request);

        if ($imagePaths !== []) {
            $data['imagen'] = $imagePaths[0];
        }

        $mascota->update($data);
        $this->storeMascotaImages($mascota, $imagePaths, $mascota->images()->count());

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

    private function mascotaQuery(): Builder
    {
        return Mascota::query()
            ->whereHas('user')
            ->with(['user', 'images']);
    }

    /**
     * @return array<int, string>
     */
    private function uploadMascotaImages(Request $request): array
    {
        $paths = [];

        if (! $request->hasFile('imagenes')) {
            return $paths;
        }

        foreach ($request->file('imagenes') as $imagen) {
            $path = $this->uploadSecurely($imagen, 'mascotas', 'public');

            if ($path) {
                $paths[] = $path;
            }
        }

        return $paths;
    }

    /**
     * @param array<int, string> $paths
     */
    private function storeMascotaImages(Mascota $mascota, array $paths, int $startingOrder = 0): void
    {
        foreach ($paths as $index => $path) {
            $mascota->images()->create([
                'imagen_path' => $path,
                'orden' => $startingOrder + $index + 1,
            ]);
        }
    }
}
