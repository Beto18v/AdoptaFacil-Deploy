<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Mascota;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

/**
 * ProductController - Controlador principal para gestión de productos
 * 
 * Este controlador maneja todas las operaciones CRUD de productos en AdoptaFácil:
 * - Vista pública de productos para visitantes
 * - Dashboard unificado para usuarios autenticados (productos + mascotas)
 * - Creación de productos con múltiples imágenes (hasta 3)
 * - Edición y actualización de productos existentes
 * - Eliminación segura con verificación de permisos
 * 
 * Funcionalidades principales:
 * - Sistema de múltiples imágenes por producto
 * - Validación de datos mediante Form Requests
 * - Autorización basada en políticas (Policy)
 * - Integración con Inertia.js para SPA
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 */
class ProductController extends Controller
{
    use AuthorizesRequests;
    use \App\Traits\SecureFileUpload;

    /**
     * Vista pública de productos para navegación general
     * 
     * Muestra todos los productos disponibles sin requerir autenticación.
     * Incluye información del usuario vendedor para contacto.
     * 
     * @return \Inertia\Response
     */
    public function indexPublic()
    {
        $productos = Product::with('user')->orderBy('created_at', 'desc')->get()->map(function ($producto) {
            return (object) [
                'id' => $producto->id,
                'nombre' => $producto->nombre,        // Usar accessor
                'descripcion' => $producto->descripcion, // Usar accessor
                'precio' => $producto->precio,        // Usar accessor
                'imagen' => $producto->imagen,
                'user' => $producto->user,
            ];
        });
        return Inertia::render('productos', ['productos' => $productos]);
    }

    /**
     * Dashboard unificado para usuarios autenticados
     * 
     * Dependiendo del rol del usuario, muestra:
     * - Aliados: Solo sus propios productos y mascotas
     * - Otros roles: Todos los productos y mascotas (funcionalidad expandible)
     * 
     * @return \Inertia\Response Vista del dashboard con productos y mascotas
     */
    public function index()
    {
        $user = Auth::user();

        // Si es aliado, solo mostrar sus propios productos y mascotas
        if ($user && $user->role === 'aliado') {
            // Productos del aliado autenticado (ordenados por fecha de creación descendente)
            $productos = Product::with('user')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($producto) {
                    return (object) [
                        'id' => $producto->id,
                        'nombre' => $producto->nombre,        // Usar accessor
                        'descripcion' => $producto->descripcion, // Usar accessor
                        'precio' => $producto->precio,        // Usar accessor
                        'imagen' => $producto->imagen,
                        'user_id' => $producto->user_id,
                        'user' => $producto->user,
                        'tipo' => 'producto',
                        'created_at' => $producto->created_at,
                        'imagenes_existentes' => $producto->images->pluck('image_path')->toArray(),
                    ];
                });

            // Mascotas del aliado autenticado (ordenadas por fecha de creación descendente)
            $mascotas = Mascota::with('user')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($mascota) {
                    return (object) [
                        'id' => $mascota->id,
                        'nombre' => $mascota->nombre,
                        'descripcion' => $mascota->descripcion,
                        'precio' => null,
                        'imagen' => $mascota->imagen,
                        'user_id' => $mascota->user_id,
                        'user' => $mascota->user,
                        'tipo' => 'mascota',
                        'created_at' => $mascota->created_at
                    ];
                });
        } else {
            // Para clientes y otros roles, mostrar todos los productos y mascotas (ordenados por fecha)
            $productos = Product::with('user')->orderBy('created_at', 'desc')->get()->map(function ($producto) {
                return (object) [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,        // Usar accessor
                    'descripcion' => $producto->descripcion, // Usar accessor
                    'precio' => $producto->precio,        // Usar accessor
                    'imagen' => $producto->imagen,
                    'user_id' => $producto->user_id,
                    'user' => $producto->user,
                    'tipo' => 'producto',
                    'created_at' => $producto->created_at
                ];
            });

            // Mascotas con tipo identificador (sin precio, ordenadas por fecha)
            $mascotas = Mascota::with('user')->orderBy('created_at', 'desc')->get()->map(function ($mascota) {
                return (object) [
                    'id' => $mascota->id,
                    'nombre' => $mascota->nombre,
                    'descripcion' => $mascota->descripcion,
                    'precio' => null,
                    'imagen' => $mascota->imagen,
                    'user_id' => $mascota->user_id,
                    'user' => $mascota->user,
                    'tipo' => 'mascota',
                    'created_at' => $mascota->created_at
                ];
            });
        }

        // Combinar items y ordenar por fecha de creación (más recientes primero)
        $items = $productos->concat($mascotas)->sortByDesc(function ($item) {
            return $item->created_at;
        })->values(); // values() reindexes the collection

        return Inertia::render('Dashboard/VerMascotasProductos/productos-mascotas', [
            'items' => $items
        ]);
    }

    /**
     * Almacena producto con múltiples imágenes (1-3) para dashboard unificado
     * Crea registros en product_images y mantiene imagen principal para compatibilidad
     */
    public function store(Request $request)
    {
        // Validación para múltiples imágenes
        $validatedData = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'precio' => 'required|numeric|min:0',
            'cantidad' => 'required|integer|min:0',
            'imagenes' => 'required|array|min:1|max:3', // Array de 1-3 imágenes
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Crear producto principal con nombres de campos actualizados
        $producto = new Product();
        $producto->name = $request->nombre;         // Mapear nombre -> name
        $producto->description = $request->descripcion; // Mapear descripcion -> description
        $producto->price = $request->precio;        // Mapear precio -> price
        $producto->stock = $request->cantidad;      // Mapear cantidad -> stock
        $producto->user_id = Auth::id();

        // Usar primera imagen como imagen principal (compatibilidad con sistema anterior)
        if ($request->hasFile('imagenes') && count($request->file('imagenes')) > 0) {
            $firstImage = $request->file('imagenes')[0];
            $path = $this->uploadSecurely($firstImage, 'productos', 'public');
            if ($path) {
                $producto->imagen = $path;
            }
        }

        $producto->save();

        // Guardar todas las imágenes en tabla de relación product_images
        if ($request->hasFile('imagenes')) {
            foreach ($request->file('imagenes') as $index => $imagen) {
                $path = $this->uploadSecurely($imagen, 'productos', 'public');
                
                if ($path) {
                    ProductImage::create([
                        'product_id' => $producto->id,
                        'image_path' => $path,
                        'order' => $index + 1, // Orden de las imágenes
                    ]);
                }
            }
        }

        return Redirect::route('productos.mascotas')->with('success', 'Producto registrado exitosamente.');
    }

    /**
     * Muestra los datos de un producto específico para edición
     */
    public function show(Product $product)
    {
        Gate::authorize('view', $product);

        $product->load(['user', 'images']);

        return response()->json([
            'id' => $product->id,
            'nombre' => $product->nombre,
            'descripcion' => $product->descripcion,
            'precio' => $product->precio,
            'cantidad' => $product->stock,
            'imagenes_existentes' => $product->images->pluck('image_path')->toArray(),
        ]);
    }

    /**
     * Actualiza producto existente con el mismo formato que store
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        Gate::authorize('update', $product);

        // Actualizar campos usando los mismos nombres del formulario
        $product->name = $request->nombre;
        $product->description = $request->descripcion;
        $product->price = $request->precio;
        $product->stock = $request->cantidad;

        // Actualizar imagen principal si se proporciona nueva
        if ($request->hasFile('imagenes') && count($request->file('imagenes')) > 0) {
            $firstImage = $request->file('imagenes')[0];
            $path = $this->uploadSecurely($firstImage, 'productos', 'public');
            if ($path) {
                $product->imagen = $path;
            }
        }

        $product->save();

        // Agregar nuevas imágenes (manteniendo las existentes por ahora)
        if ($request->hasFile('imagenes')) {
            foreach ($request->file('imagenes') as $index => $imagen) {
                $path = $this->uploadSecurely($imagen, 'productos', 'public');
                
                if ($path) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'order' => $product->images()->count() + $index + 1,
                    ]);
                }
            }
        }

        return Redirect::route('productos.mascotas')->with('success', 'Producto actualizado exitosamente.');
    }

    /**
     * Elimina producto con autorización
     */
    public function destroy(Product $product)
    {
        // Verificar autorización para eliminar
        try {
            $this->authorize('delete', $product);
        } catch (\Exception $e) {
            Gate::authorize('delete', $product);
        }

        $product->delete();
        return redirect()->route('productos.mascotas')->with('success', 'Producto eliminado exitosamente.');
    }
}
