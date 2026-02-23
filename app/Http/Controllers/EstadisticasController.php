<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Solicitud;
use App\Models\Mascota;
use App\Models\User;
use Carbon\Carbon;


class EstadisticasController extends Controller
{
    public function index()
    {
        // Estadisticas generales
        $totalAdoptions = Solicitud::where('estado', 'Aprobada')->count();
        $pendingRequests = Solicitud::whereIn('estado', ['Enviada', 'En Proceso'])->count();
        $totalRequests = Solicitud::count();
        $successRate = $totalRequests > 0 ? round(($totalAdoptions / $totalRequests) * 100, 2) : 0;

        // Promedio mensual de los ultimos 12 meses
        $startDate = Carbon::now()->subMonths(12);
        $monthlyAdoptions = Solicitud::where('estado', 'Aprobada')
            ->where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(function($date) {
                return Carbon::parse($date->created_at)->format('Y-m');
            })
            ->map(function ($group) {
                $first = $group->first();
                $date = Carbon::parse($first->created_at);
                return (object)[
                    'year' => (int)$date->format('Y'),
                    'month' => (int)$date->format('m'),
                    'count' => $group->count()
                ];
            })
            ->values();

        $averageMonthly = $monthlyAdoptions->avg('count') ?? 0;

        // Estadísticas mensuales ultimos 6 meses
        $monthlyStats = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = ucfirst($date->locale('es')->translatedFormat('F'));
            $year = $date->year;
            $month = $date->month;

            $adoptions = Solicitud::where('estado', 'Aprobada')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $returns = Solicitud::where('estado', 'Rechazada')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $totalMonth = $adoptions + $returns;
            $success = $totalMonth > 0 ? round(($adoptions / $totalMonth) * 100, 2) : 100;

            $monthlyStats[] = [
                'month' => $monthName,
                'adoptions' => $adoptions,
                'returns' => $returns,
                'success' => $success,
            ];
        }

        // Datos para el gráfico
        $adopcionesPorMes = array_map(function ($stat) {
            return ['mes' => $stat['month'], 'adopciones' => $stat['adoptions']];
        }, $monthlyStats);

        // Distribución por especie de mascotas adoptadas
        $adoptedPetIds = Solicitud::where('estado', 'Aprobada')->pluck('mascota_id');
        
        $speciesDistribution = Mascota::whereIn('id', $adoptedPetIds)
            ->select('especie', DB::raw('COUNT(*) as count'))
            ->groupBy('especie')
            ->orderBy('count', 'desc')
            ->get();

        $totalAdoptedPets = $speciesDistribution->sum('count');
        $distribucionTipos = $speciesDistribution->map(function ($item) use ($totalAdoptedPets) {
            $percentage = $totalAdoptedPets > 0 ? round(($item->count / $totalAdoptedPets) * 100, 1) : 0;
            return [
                'name' => ucfirst($item->especie),
                'value' => $percentage,
                'total' => $item->count,
            ];
        })->toArray();
        
        // Motivos de rechazo
        $motivosRechazo = Solicitud::where('estado', 'Rechazada')
             ->whereNotNull('comentario_rechazo')
              ->where('comentario_rechazo', '!=', '')
              ->groupBy('comentario_rechazo')
              ->select('comentario_rechazo', DB::raw('COUNT(*) as count'))
              ->orderBy('count', 'desc')
              ->get()
            ->map(function ($item) {
        return [
            'motivo' => $item->comentario_rechazo,
            'cantidad' => $item->count,
        ];
        })->toArray();

        return Inertia::render('Dashboard/Estadisticas/index', [
            'generalStats' => [
                'totalAdoptions' => $totalAdoptions,
                'averageMonthly' => round($averageMonthly, 1),
                'successRate' => $successRate,
                'pendingRequests' => $pendingRequests,
            ],
            'monthlyStats' => $monthlyStats,
            'adopcionesPorMes' => $adopcionesPorMes,
            'distribucionTipos' => $distribucionTipos,
            'motivosRechazo' => $motivosRechazo,
        ]);
    }

    public function generarReportePdf(Request $request)
    {
        try {
        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->subYear()->format('Y-m-d'));
        $fechaFin = $request->input('fecha_fin', Carbon::now()->format('Y-m-d'));

        $estadisticas = $this->obtenerEstadisticasCompletas($fechaInicio, $fechaFin);
        
        $datosPdf = [
            'titulo' => 'Reporte Adopciones por Especie - AdoptaFácil',
            'fechaInicio' => Carbon::parse($fechaInicio)->format('d/m/Y'),
            'fechaFin' => Carbon::parse($fechaFin)->format('d/m/Y'),
            'datosGenerales' => [
                'Total de Adopciones' => $estadisticas['generalStats']['totalAdoptions'],
                'Promedio Mensual' => round($estadisticas['generalStats']['averageMonthly'], 1),
                'Tasa de Éxito' => $estadisticas['generalStats']['successRate'] . '%',
                'Solicitudes Pendientes' => $estadisticas['generalStats']['pendingRequests'],
                'Total de Solicitudes' => $estadisticas['totalRequests'],
                'Total de Usuarios' => User::count(),
                'Total de Mascotas Registradas' => Mascota::count(),
            ],
            'tablaDetalle' => $estadisticas['monthlyStats'],
            'distribucionEspecies' => $estadisticas['distribucionEspecies'] ?? [] // distribucion por especie
        ];

        // 5. Generar PDF localmente usando DomPDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.reporte_estadisticas', $datosPdf);
        $filename = 'reporte_adopciones_' . date('Ymd_His') . '.pdf';

        return $pdf->download($filename);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Datos de validación inválidos',
            'errors' => $e->errors()
        ], 422);
        
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('PDF Generation Error: ' . $e->getMessage(), [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'message' => 'Error inesperado al generar el reporte: ' . $e->getMessage()
        ], 500);
    }
}

     public function generarReportePdfRechazos(Request $request)
{
    try {
        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->subYear()->format('Y-m-d'));
        $fechaFin = $request->input('fecha_fin', Carbon::now()->format('Y-m-d'));

        $inicio = Carbon::parse($fechaInicio)->startOfDay();
        $fin = Carbon::parse($fechaFin)->endOfDay();

        // Obtener motivos de rechazo con detalles
        $motivosRechazo = Solicitud::where('estado', 'Rechazada')
            ->whereBetween('created_at', [$inicio, $fin])
            ->whereNotNull('comentario_rechazo')
            ->where('comentario_rechazo', '!=', '')
            ->select('comentario_rechazo', DB::raw('COUNT(*) as count'))
            ->groupBy('comentario_rechazo')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'Motivo' => $item->comentario_rechazo,
                    'Cantidad' => $item->count,
                ];
            })->toArray();

        $totalRechazos = Solicitud::where('estado', 'Rechazada')
            ->whereBetween('created_at', [$inicio, $fin])
            ->count();

        $rechazosConComentario = Solicitud::where('estado', 'Rechazada')
            ->whereBetween('created_at', [$inicio, $fin])
            ->whereNotNull('comentario_rechazo')
            ->where('comentario_rechazo', '!=', '')
            ->count();

        $datosPdf = [
            'titulo' => 'Reporte de Motivos de Rechazo - AdoptaFácil',
            'fechaInicio' => Carbon::parse($fechaInicio)->format('d/m/Y'),
            'fechaFin' => Carbon::parse($fechaFin)->format('d/m/Y'),
            'datosGenerales' => [
                'Total de Rechazos' => $totalRechazos,
                'Rechazos con Comentario' => $rechazosConComentario,
                'Rechazos sin Comentario' => $totalRechazos - $rechazosConComentario,
            ],
            'motivosRechazo' => $motivosRechazo,
        ];

        // 5. Generar PDF localmente usando DomPDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.reporte_rechazos', $datosPdf);
        $filename = 'reporte_rechazos_' . date('Ymd_His') . '.pdf';

        return $pdf->download($filename);
        
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('PDF Rechazos Error: ' . $e->getMessage(), [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
        
        return response()->json([
            'message' => 'Error inesperado: ' . $e->getMessage()
        ], 500);
    }
}

    private function obtenerEstadisticasCompletas($fechaInicio, $fechaFin)
{
    $inicio = Carbon::parse($fechaInicio)->startOfDay();
    $fin = Carbon::parse($fechaFin)->endOfDay();

    // Estadísticas generales en el rango de fechas
    $totalAdoptions = Solicitud::where('estado', 'Aprobada')
        ->whereBetween('created_at', [$inicio, $fin])
        ->count();

    $pendingRequests = Solicitud::whereIn('estado', ['Enviada', 'En Proceso'])
        ->whereBetween('created_at', [$inicio, $fin])
        ->count();

    $totalRequests = Solicitud::whereBetween('created_at', [$inicio, $fin])->count();
    
    $successRate = $totalRequests > 0 
        ? round(($totalAdoptions / $totalRequests) * 100, 2) 
        : 0;

    // Calcular promedio mensual
    $mesesDiferencia = max($inicio->diffInMonths($fin) + 1, 1);
    $averageMonthly = round($totalAdoptions / $mesesDiferencia, 1);

    // Estadísticas mensuales detalladas
    $monthlyStats = [];
    $currentDate = $inicio->copy()->startOfMonth();
    
    while ($currentDate <= $fin) {
        $year = $currentDate->year;
        $month = $currentDate->month;
        $monthName = ucfirst($currentDate->locale('es')->translatedFormat('F'));

        $adoptions = Solicitud::where('estado', 'Aprobada')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count();

        $returns = Solicitud::where('estado', 'Rechazada')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count();

        $totalMonth = $adoptions + $returns;
        $success = $totalMonth > 0 
            ? round(($adoptions / $totalMonth) * 100, 2) 
            : 100;

        $monthlyStats[] = [
            'Mes' => $monthName . ' ' . $year,
            'Adopciones' => $adoptions,
            'Rechazadas' => $returns,
            'Tasa de Éxito' => $success . '%',
        ];

        $currentDate->addMonth();
    }

    // Distribución por especie de mascotas adoptadas
    $adoptedPetIds = Solicitud::where('estado', 'Aprobada')
        ->whereBetween('created_at', [$inicio, $fin])
        ->pluck('mascota_id');
    
    $speciesDistribution = Mascota::whereIn('id', $adoptedPetIds)
        ->select('especie', DB::raw('COUNT(*) as count'))
        ->groupBy('especie')
        ->orderBy('count', 'desc')
        ->get();

    $totalAdoptedPets = $speciesDistribution->sum('count');
    $distribucionTipos = $speciesDistribution->map(function ($item) use ($totalAdoptedPets) {
        $percentage = $totalAdoptedPets > 0 ? round(($item->count / $totalAdoptedPets) * 100, 1) : 0;
        return [
            'Especie' => ucfirst($item->especie),
            'Cantidad' => $item->count, 
            'Porcentaje' => $percentage . '%',
        ];
    })->toArray();

    return [
        'generalStats' => [
            'totalAdoptions' => $totalAdoptions,
            'averageMonthly' => $averageMonthly,
            'successRate' => $successRate,
            'pendingRequests' => $pendingRequests,
        ],
        'totalRequests' => $totalRequests,
        'monthlyStats' => $monthlyStats,
        'distribucionEspecies' => $distribucionTipos,
    ];
}
}