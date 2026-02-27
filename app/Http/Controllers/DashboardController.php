<?php

namespace App\Http\Controllers;

use App\Models\Mascota;
use App\Models\Product;
use App\Models\User;
use App\Models\Solicitud;
use App\Models\Donation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Estadísticas principales
        $totalMascotas = Mascota::count();
        $totalAdopciones = Solicitud::where('estado', 'aprobada')->count();
        $totalDonaciones = Donation::sum('amount') ?? 0;
        $totalUsuarios = User::count();

        // Estadísticas de crecimiento (comparación con el mes anterior)
        $mascotasAnterior = Mascota::where('created_at', '<', Carbon::now()->subMonth())->count();
        $adopcionesAnterior = Solicitud::where('estado', 'aprobada')
            ->where('created_at', '<', Carbon::now()->subMonth())->count();
        $donacionesAnterior = Donation::where('created_at', '<', Carbon::now()->subMonth())
            ->sum('amount') ?? 0;
        $usuariosAnterior = User::where('created_at', '<', Carbon::now()->subMonth())->count();

        // Calcular porcentajes de cambio
        $cambioMascotas = $mascotasAnterior > 0 ?
            round((($totalMascotas - $mascotasAnterior) / $mascotasAnterior) * 100, 1) : 100;
        $cambioAdopciones = $adopcionesAnterior > 0 ?
            round((($totalAdopciones - $adopcionesAnterior) / $adopcionesAnterior) * 100, 1) : 100;
        $cambioDonaciones = $donacionesAnterior > 0 ?
            round((($totalDonaciones - $donacionesAnterior) / $donacionesAnterior) * 100, 1) : 100;
        $cambioUsuarios = $usuariosAnterior > 0 ?
            round((($totalUsuarios - $usuariosAnterior) / $usuariosAnterior) * 100, 1) : 100;

        // Distribución por tipo de mascota
        $distribucionTipos = Mascota::selectRaw('especie, COUNT(*) as total')
            ->groupBy('especie')
            ->get()
            ->map(function ($item) use ($totalMascotas) {
                return [
                    'name' => ucfirst($item->especie),
                    'value' => $totalMascotas > 0 ? round(($item->total / $totalMascotas) * 100, 1) : 0,
                    'total' => $item->total,
                ];
            });

        // Datos para el gráfico de adopciones por mes (últimos 6 meses)
        $adopcionesPorMes = [];
        for ($i = 5; $i >= 0; $i--) {
            $fecha = Carbon::now()->subMonths($i);
            $adopciones = Solicitud::where('estado', 'aprobada')
                ->whereYear('created_at', $fecha->year)
                ->whereMonth('created_at', $fecha->month)
                ->count();

            $adopcionesPorMes[] = [
                'mes' => $fecha->format('M Y'),
                'adopciones' => $adopciones,
            ];
        }

        // Actividades recientes (últimas 10 solicitudes)
        $actividadesRecientes = Solicitud::with(['mascota', 'user'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($solicitud) {
                return [
                    'id' => $solicitud->id,
                    'tipo' => 'Solicitud de adopción',
                    'mascota' => $solicitud->mascota->nombre ?? 'Mascota eliminada',
                    'usuario' => $solicitud->user->name ?? 'Usuario eliminado',
                    'estado' => $solicitud->estado,
                    'fecha' => $solicitud->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => [
                'totalMascotas' => $totalMascotas,
                'totalAdopciones' => $totalAdopciones,
                'totalDonaciones' => $totalDonaciones,
                'totalUsuarios' => $totalUsuarios,
                'cambioMascotas' => $cambioMascotas,
                'cambioAdopciones' => $cambioAdopciones,
                'cambioDonaciones' => $cambioDonaciones,
                'cambioUsuarios' => $cambioUsuarios,
            ],
            'distribucionTipos' => $distribucionTipos,
            'adopcionesPorMes' => $adopcionesPorMes,
            'actividadesRecientes' => $actividadesRecientes,
        ]);
    }
}
