<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DescripcionMascotaController;
use App\Http\Controllers\ShelterController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth')->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas para el servicio de descripciones de mascotas
Route::prefix('descripciones')->group(function () {
    Route::post('/generar', [DescripcionMascotaController::class, 'generarDescripcion']);
    Route::get('/verificar-servicio', [DescripcionMascotaController::class, 'verificarServicio']);
});

// Rutas API removidas - las donaciones se manejan en routes/web.php

// Ruta para obtener refugios destacados por cantidad de mascotas
Route::get('/top-shelters', [ShelterController::class, 'topShelters']);
