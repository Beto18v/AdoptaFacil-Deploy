<?php

namespace App\Http\Controllers;

use App\Models\Mascota;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $productos = Product::query()
            ->whereHas('user')
            ->with('user:id,name')
            ->latest()
            ->take(3)
            ->get(['id', 'name', 'description', 'price', 'imagen', 'user_id']);

        $todasLasMascotas = Mascota::query()
            ->whereHas('user')
            ->with(['user:id,name', 'images:id,mascota_id,imagen_path'])
            ->select('id', 'nombre', 'especie', 'raza', 'edad', 'descripcion', 'imagen', 'sexo', 'ciudad', 'user_id', 'created_at')
            ->latest()
            ->get();

        return Inertia::render('index', [
            'productos' => $productos,
            'mascotas' => $todasLasMascotas->take(3),
            'todasLasMascotas' => $todasLasMascotas,
        ]);
    }
}
