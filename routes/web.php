<?php

/**
 * Archivo de rutas principales de AdoptaFácil
 * 
 * Este archivo define todas las rutas web de la aplicación organizadas por módulos:
 * - Rutas públicas (landing, catálogos, refugios)
 * - Rutas de comunidad y funciones sociales  
 * - Rutas protegidas del dashboard para usuarios autenticados
 * - Rutas de gestión de contenido (CRUD mascotas/productos)
 * - Sistema de favoritos y adopciones
 * 
 * Optimizaciones v2.0:
 * - Agrupación lógica de rutas por funcionalidad
 * - Documentación completa de cada endpoint
 * - Eliminación de rutas duplicadas o innecesarias
 * - Middleware optimizado para mejor rendimiento
 * 
 * @author Equipo AdoptaFácil
 * @version 2.0.0 - Optimizado para producción
 * @since 2024
 */

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Importaciones organizadas por módulos
use App\Http\Controllers\{
    MascotaController,
    ProductController,
    ShelterController,
    SolicitudesController,
    SharedController,
    CommunityController,
    FavoritosController,
    DashboardController,
    DonacionesController,
    DonationController,
    MapaController,
    EstadisticasController,
    GestionUsuariosController
};

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS - Accesibles sin autenticación
|--------------------------------------------------------------------------
*/

/**
 * Página principal (Landing Page)
 * 
 * Muestra una vista optimizada con productos y mascotas destacados.
 * Carga eficiente: solo los datos necesarios para la vista inicial.
 * 
 * @return \Inertia\Response
 */
Route::get('/', function () {
    // Productos destacados (últimos 3) con información de vendedor
    $productos = \App\Models\Product::with('user:id,name')
        ->latest()
        ->take(3)
        ->get(['id', 'name', 'description', 'price', 'imagen', 'user_id']);

    // Todas las mascotas para cálculos de categorías (optimizado)
    $todasLasMascotas = \App\Models\Mascota::with(['user:id,name', 'images:id,mascota_id,imagen_path'])
        ->select('id', 'nombre', 'especie', 'raza', 'edad', 'descripcion', 'imagen', 'sexo', 'ciudad', 'user_id', 'created_at')
        ->latest()
        ->get();

    // Mascotas destacadas para mostrar (primeras 3)
    $mascotasParaMostrar = $todasLasMascotas->take(3);

    return Inertia::render('index', [
        'productos' => $productos,
        'mascotas' => $mascotasParaMostrar,
        'todasLasMascotas' => $todasLasMascotas
    ]);
})->name('index');

/**
 * Catálogos públicos - Acceso sin autenticación requerida
 */
// Catálogo público de mascotas disponibles para adopción
Route::get('/mascotas', [MascotaController::class, 'indexPublic'])->name('mascotas');

// Catálogo público del marketplace de productos para mascotas  
Route::get('/productos', [ProductController::class, 'indexPublic'])->name('productos');

/**
 * Directorio de refugios y organizaciones
 */
// Listado público de refugios registrados
Route::get('/refugios', [ShelterController::class, 'index'])->name('refugios');

// Registro de nuevos refugios (requiere autenticación)
Route::post('/shelters', [ShelterController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('shelter.store');

/**
 * Rutas públicas especiales
 */
// Página de opciones de registro (usuario vs refugio)
Route::get('/registro-opciones', function () {
    return Inertia::render('auth/registro-opciones');
})->name('register.options');

// API pública para obtener IDs de favoritos (optimizada para performance)
Route::get('favoritos/ids', [FavoritosController::class, 'getFavoriteIds'])
    ->name('favoritos.ids');

// Endpoint para obtener el token CSRF vía AJAX
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

/*
|--------------------------------------------------------------------------
| MÓDULO DE COMUNIDAD - Funcionalidades sociales
|--------------------------------------------------------------------------
*/

/**
 * Red social de la comunidad de mascotas
 */
// Feed principal de la comunidad (acceso público)
Route::get('/comunidad', [CommunityController::class, 'index'])->name('comunidad');

// Rutas protegidas para interacciones sociales
Route::middleware(['auth'])->prefix('comunidad')->name('posts.')->group(function () {
    // Crear nueva publicación en la comunidad
    Route::post('/posts', [CommunityController::class, 'store'])->name('store');

    // Sistema de likes en publicaciones
    Route::post('/posts/{post}/like', [CommunityController::class, 'toggleLike'])->name('like');

    // Sistema de comentarios
    Route::post('/posts/{post}/comments', [CommunityController::class, 'storeComment'])->name('comments.store');
    Route::get('/posts/{post}/comments', [CommunityController::class, 'getComments'])->name('comments.get');

    // Eliminar publicaciones propias
    Route::delete('/posts/{post}', [CommunityController::class, 'destroy'])->name('destroy');

    // Sistema de compartir publicaciones
    Route::post('/posts/{post}/share', [SharedController::class, 'create'])->name('share');
});

// Visualización pública de contenido compartido
Route::get('/shared/{token}', [SharedController::class, 'show'])->name('shared.show');

/*
|--------------------------------------------------------------------------
| ÁREA PROTEGIDA - Dashboard y funcionalidades autenticadas  
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD PRINCIPAL
    |--------------------------------------------------------------------------
    */

    /**
     * Dashboard principal con estadísticas y métricas
     * Punto de entrada principal para usuarios autenticados
     */
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    /**
     * Gestión de usuarios (solo para admin)
     */
    /**
     * Gestión de usuarios (solo para admin)
     */
    Route::middleware(['admin'])->group(function () {
        Route::get('gestion-usuarios', [GestionUsuariosController::class, 'index'])->name('gestion.usuarios');
        Route::post('gestion-usuarios', [GestionUsuariosController::class, 'store'])->name('gestion.usuarios.store');
        Route::put('gestion-usuarios/{user}', [GestionUsuariosController::class, 'update'])->name('gestion.usuarios.update');
        Route::delete('gestion-usuarios/{user}', [GestionUsuariosController::class, 'destroy'])->name('gestion.usuarios.destroy');
        Route::post('gestion-usuarios/send-bulk-email', [GestionUsuariosController::class, 'sendBulkEmail'])->name('gestion.usuarios.send-bulk-email');
    });

    /*
    |--------------------------------------------------------------------------
    | MÓDULO DE FAVORITOS
    |--------------------------------------------------------------------------
    */

    /**
     * Gestión completa del sistema de favoritos
     */
    Route::prefix('favoritos')->name('favoritos.')->group(function () {
        // Ver lista de mascotas favoritas del usuario
        Route::get('/', [FavoritosController::class, 'index'])->name('index');
        // Agregar mascota a favoritos
        Route::post('/', [FavoritosController::class, 'store'])->name('store');
        // Remover mascota de favoritos
        Route::delete('/', [FavoritosController::class, 'destroy'])->name('destroy');
        // Verificar si una mascota está en favoritos
        Route::post('/check', [FavoritosController::class, 'check'])->name('check');
    });

    /*
    |--------------------------------------------------------------------------
    | MÓDULO DE DONACIONES Y REFUGIOS
    |--------------------------------------------------------------------------
    */

    /**
     * Sistema de donaciones y apoyo a refugios
     */
    // Panel de donaciones y fundaciones
    Route::get('donaciones', [DonacionesController::class, 'index'])->name('donaciones.index');
    // Procesar nueva donación
    Route::post('donaciones', [DonacionesController::class, 'store'])->name('donaciones.store');
    // Importar donaciones desde Excel (solo para refugios)
    Route::post('donaciones/import', [DonationController::class, 'importDonations'])->name('donaciones.import');

    /*
    |--------------------------------------------------------------------------
    | MÓDULOS DE ANÁLISIS Y ESTADÍSTICAS
    |--------------------------------------------------------------------------
    */

    /**
     * Herramientas de visualización y análisis
     */
    // Mapa interactivo de mascotas y refugios
    Route::get('mapa', [MapaController::class, 'index'])->name('mapa.index');

    // Dashboard de estadísticas y métricas avanzadas
    Route::get('estadisticas', [EstadisticasController::class, 'index'])->name('estadisticas.index');
    // Generar y descargar reporte PDF de estadísticas
    Route::post('estadisticas/generar-pdf', [EstadisticasController::class, 'generarReportePdf'])->name('estadisticas.generar-pdf');
    // Generar y descargar reporte PDF de rechazos de adopción
    Route::post('estadisticas/generar-pdf-rechazos', [EstadisticasController::class, 'generarReportePdfRechazos'])->name('estadisticas.generar-pdf-rechazos');

    /*
    |--------------------------------------------------------------------------
    | MÓDULO DE SOLICITUDES DE ADOPCIÓN
    |--------------------------------------------------------------------------
    */

    /**
     * Gestión completa del proceso de adopción
     */
    Route::prefix('solicitudes')->name('solicitudes.')->group(function () {
        // Lista de solicitudes del usuario
        Route::get('/', [SolicitudesController::class, 'index'])->name('index');
        // Crear nueva solicitud de adopción
        Route::post('/', [SolicitudesController::class, 'store'])->name('adopcion.store');
        // Actualizar estado de una solicitud (para refugios)
        Route::post('/{id}/estado', [SolicitudesController::class, 'updateEstado'])->name('updateEstado');
        // Cancelar/eliminar solicitud propia
        Route::delete('/{solicitud}', [SolicitudesController::class, 'destroy'])->name('destroy');
    });

    // Configurar URL de intención para redirección post-login
    Route::post('set-intended-url', [App\Http\Controllers\Auth\SetIntendedUrlController::class, 'store'])
        ->name('set-intended-url');

    /*
    |--------------------------------------------------------------------------
    | MÓDULO DE GESTIÓN DE CONTENIDO (CRUD)
    |--------------------------------------------------------------------------
    */

    /**
     * Dashboard unificado para aliados comerciales
     * Gestión de productos y mascotas en una interfaz integrada
     */
    Route::get('/productos-mascotas', [ProductController::class, 'index'])->name('productos.mascotas');

    /**
     * CRUD completo de productos del marketplace
     */
    Route::prefix('productos')->name('productos.')->group(function () {
        // Crear nuevo producto
        Route::post('/store', [ProductController::class, 'store'])->name('store');
        // Ver detalles de producto específico (para edición)
        Route::get('/{product}', [ProductController::class, 'show'])->name('show');
        // Actualizar producto existente (PUT estándar)
        Route::put('/{product}', [ProductController::class, 'update'])->name('update');
        // Actualizar producto (POST con FormData - workaround para archivos)
        Route::post('/{product}', [ProductController::class, 'update'])->name('update.post');
        // Eliminar producto
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
    });

    /**
     * CRUD completo de mascotas para adopción
     */
    Route::prefix('mascotas')->name('mascotas.')->group(function () {
        // Registrar nueva mascota
        Route::post('/store', [MascotaController::class, 'store'])->name('store');
        // Ver detalles de mascota específica (para edición)
        Route::get('/{mascota}', [MascotaController::class, 'show'])->name('show');
        // Actualizar mascota existente (PUT estándar)
        Route::put('/{mascota}', [MascotaController::class, 'update'])->name('update');
        // Actualizar mascota (POST con FormData - workaround para archivos)
        Route::post('/{mascota}', [MascotaController::class, 'update'])->name('update.post');
        // Eliminar mascota
        Route::delete('/{mascota}', [MascotaController::class, 'destroy'])->name('destroy');
    });

    /**
     * Endpoint para acciones rápidas (adoptar/comprar)
     * Utilizado por las tarjetas de productos y mascotas
     */
    Route::post('/acciones-solicitud/store', [\App\Http\Controllers\AccionSolicitudController::class, 'store'])
        ->name('acciones-solicitud.store');
});

/*
|--------------------------------------------------------------------------
| RUTAS PERSONALIZADAS DE AUTENTICACIÓN
|--------------------------------------------------------------------------
*/

// Rutas personalizadas para recuperación de contraseña (React/Inertia)
Route::middleware('guest')->group(function () {
    Route::get('/auth/forgot-password', function () {
        return Inertia::render('auth/forgot-password');
    })->name('auth.forgot-password');

    Route::get('/auth/reset-password/{email?}', function (Request $request, $email = null) {
        return Inertia::render('auth/reset-password', [
            'email' => $email
        ]);
    })->name('auth.reset-password');
});

/*
|--------------------------------------------------------------------------
| ARCHIVOS DE RUTAS ADICIONALES
|--------------------------------------------------------------------------
| 
| Importación de archivos de rutas modulares para mantener organización:
| - settings.php: Configuraciones de perfil y cuenta de usuario
| - auth.php: Rutas de autenticación (login, registro, verificación, etc.)
*/

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
