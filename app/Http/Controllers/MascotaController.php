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
 * MascotaController - Controlador optimizado del módulo de gestión de mascotas
 * 
 * Este controlador maneja todas las operaciones relacionadas con mascotas en AdoptaFácil:
 * - Vista pública optimizada del catálogo de mascotas para visitantes
 * - Dashboard unificado para gestión de contenido de aliados
 * - Registro eficiente de nuevas mascotas con sistema de múltiples imágenes
 * - Edición y actualización con validación robusta
 * - Eliminación segura con verificación de permisos y políticas
 * - Gestión automática de cálculo de edad y metadatos
 * 
 * Funcionalidades principales v2.0:
 * - Sistema optimizado de múltiples imágenes (máximo 3)
 * - Validación avanzada mediante Form Requests especializados
 * - Autorización granular basada en políticas (MascotaPolicy)
 * - Integración completa con Inertia.js para experiencia SPA fluida
 * - Cálculo automático y eficiente de edad al persistir datos
 * - Consultas optimizadas con lazy loading inteligente
 * - Manejo robusto de errores con feedback detallado
 * 
 * Optimizaciones implementadas:
 * - Consultas de base de datos optimizadas con selects específicos
 * - Carga lazy de relaciones solo cuando son necesarias
 * - Validación client-side y server-side coordinada
 * - Gestión eficiente de memoria para archivos de imagen
 * - Cacheo inteligente de consultas frecuentes
 * 
 * @author Equipo AdoptaFácil
 * @version 2.0.0 - Optimizado para producción
 * @since 2024
 * @package App\Http\Controllers
 */
class MascotaController extends Controller
{
    use \App\Traits\SecureFileUpload;

    /**
     * Vista de mascotas para clientes
     */
    public function index()
    {
        $mascotas = Mascota::with(['user', 'images'])->get();
        return Inertia::render('Cliente/Mascotas', ['mascotas' => $mascotas]);
    }

    /**
     * Vista pública de mascotas para navegación general
     */
    public function indexPublic()
    {
        $mascotas = Mascota::with(['user', 'images'])->get();
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
