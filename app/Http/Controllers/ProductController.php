<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Mascota;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

/**
 * Controlador del modulo de productos.
 * Gestiona el catalogo publico y el CRUD de productos para usuarios autorizados.
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
        $productos = $this->productQuery()
            ->get()
            ->map(fn (Product $producto) => $this->serializePublicProduct($producto));

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

        $isAlly = $user && $user->role === 'aliado';
        $ownerId = $isAlly ? $user->id : null;

        $productos = $this->productQuery($ownerId)
            ->get()
            ->map(fn (Product $producto) => $this->serializeDashboardProduct($producto, $isAlly));

        $mascotas = $this->mascotaQuery($ownerId)
            ->get()
            ->map(fn (Mascota $mascota) => $this->serializeDashboardMascota($mascota));

        $items = $productos
            ->concat($mascotas)
            ->sortByDesc(fn ($item) => $item->created_at)
            ->values();

        return Inertia::render('Dashboard/VerMascotasProductos/productos-mascotas', [
            'items' => $items
        ]);
    }

    /**
     * Almacena producto con múltiples imágenes (1-3) para dashboard unificado
     * Crea registros en product_images y mantiene imagen principal para compatibilidad
     */
    public function store(Request $request): RedirectResponse
    {
        $validatedData = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'precio' => 'required|numeric|min:0',
            'cantidad' => 'required|integer|min:0',
            'imagenes' => 'required|array|min:1|max:3',
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $imagePaths = $this->uploadProductImages($request);

        $producto = new Product();
        $producto->name = $validatedData['nombre'];
        $producto->description = $validatedData['descripcion'];
        $producto->price = $validatedData['precio'];
        $producto->stock = $validatedData['cantidad'];
        $producto->user_id = Auth::id();
        if ($imagePaths !== []) {
            $producto->imagen = $imagePaths[0];
        }
        $producto->save();
        $this->storeProductImages($producto, $imagePaths);

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
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);
        $imagePaths = $this->uploadProductImages($request);

        $product->name = $request->nombre;
        $product->description = $request->descripcion;
        $product->price = $request->precio;
        $product->stock = $request->cantidad;
        if ($imagePaths !== []) {
            $product->imagen = $imagePaths[0];
        }

        $product->save();
        $this->storeProductImages($product, $imagePaths, $product->images()->count());

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

    private function productQuery(?int $userId = null): Builder
    {
        return Product::query()
            ->whereHas('user')
            ->with(['user', 'images'])
            ->when($userId !== null, fn (Builder $query) => $query->where('user_id', $userId))
            ->orderBy('created_at', 'desc');
    }

    private function mascotaQuery(?int $userId = null): Builder
    {
        return Mascota::query()
            ->whereHas('user')
            ->with('user')
            ->when($userId !== null, fn (Builder $query) => $query->where('user_id', $userId))
            ->orderBy('created_at', 'desc');
    }

    private function serializePublicProduct(Product $producto): object
    {
        return (object) [
            'id' => $producto->id,
            'nombre' => $producto->nombre,
            'descripcion' => $producto->descripcion,
            'precio' => $producto->precio,
            'imagen' => $producto->imagen,
            'user' => $producto->user,
        ];
    }

    private function serializeDashboardProduct(Product $producto, bool $includeImages = false): object
    {
        return (object) [
            'id' => $producto->id,
            'nombre' => $producto->nombre,
            'descripcion' => $producto->descripcion,
            'precio' => $producto->precio,
            'imagen' => $producto->imagen,
            'user_id' => $producto->user_id,
            'user' => $producto->user,
            'tipo' => 'producto',
            'created_at' => $producto->created_at,
            'imagenes_existentes' => $includeImages ? $producto->images->pluck('image_path')->toArray() : [],
        ];
    }

    private function serializeDashboardMascota(Mascota $mascota): object
    {
        return (object) [
            'id' => $mascota->id,
            'nombre' => $mascota->nombre,
            'descripcion' => $mascota->descripcion,
            'precio' => null,
            'imagen' => $mascota->imagen,
            'user_id' => $mascota->user_id,
            'user' => $mascota->user,
            'tipo' => 'mascota',
            'created_at' => $mascota->created_at,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function uploadProductImages(Request $request): array
    {
        $paths = [];

        if (! $request->hasFile('imagenes')) {
            return $paths;
        }

        foreach ($request->file('imagenes') as $imagen) {
            $path = $this->uploadSecurely($imagen, 'productos', 'public');

            if ($path) {
                $paths[] = $path;
            }
        }

        return $paths;
    }

    /**
     * @param array<int, string> $paths
     */
    private function storeProductImages(Product $product, array $paths, int $startingOrder = 0): void
    {
        foreach ($paths as $index => $path) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'order' => $startingOrder + $index + 1,
            ]);
        }
    }
}
