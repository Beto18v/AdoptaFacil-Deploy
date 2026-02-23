<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DonationController extends Controller
{
    /**
     * Obtener todas las donaciones con paginación
     */
    public function index(Request $request): JsonResponse
    {
        $query = Donation::with('shelter')
            ->orderBy('created_at', 'desc');

        // Filtrar por refugio si el usuario es aliado
        if (Auth::user()->role === 'aliado' && Auth::user()->shelter) {
            $query->where('shelter_id', Auth::user()->shelter->id);
        }

        $donations = $query->paginate(15);

        // Transformar los datos para incluir el nombre del donante correcto
        $donations->getCollection()->transform(function ($donation) {
            // Configurar locale español para formatear fechas
            $date = $donation->created_at->locale('es');
            return [
                'id' => $donation->id,
                'donor_name' => $donation->getDonorDisplayName(),
                'amount' => $donation->amount,
                'description' => $donation->description,
                'created_at' => $date->format('Y-m-d'),
                'is_imported' => $donation->isImported(),
                'shelter_name' => $donation->shelter?->name,
            ];
        });

        return response()->json($donations);
    }

    /**
     * Importar donaciones masivamente desde Excel
     */
    public function importDonations(Request $request): JsonResponse
    {
        Log::info('Iniciando importación de donaciones', [
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->role ?? 'sin_rol',
            'request_data' => $request->all()
        ]);

        // Verificar que el usuario sea aliado
        if (Auth::user()->role !== 'aliado') {
            Log::warning('Usuario sin permisos intentó importar donaciones', ['user_id' => Auth::id()]);
            return response()->json(['error' => 'No tienes permisos para realizar esta acción'], 403);
        }

        // Verificar que el usuario tenga un refugio asociado
        if (!Auth::user()->shelter) {
            Log::warning('Usuario aliado sin refugio intentó importar donaciones', ['user_id' => Auth::id()]);
            return response()->json(['error' => 'No tienes un refugio asociado'], 400);
        }

        $validator = Validator::make($request->all(), [
            'donations' => 'required|array|min:1',
            'donations.*.amount' => 'required|numeric|min:0.01',
            'donations.*.created_at' => 'required|date',
            'donations.*.description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos de donación inválidos',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $shelter = Auth::user()->shelter;
            $donationsData = collect($request->donations)->map(function ($donation) use ($shelter) {
                return [
                    'donor_name' => Auth::user()->name,
                    'donor_email' => null, // Sin email para donaciones importadas
                    'amount' => $donation['amount'],
                    'description' => $donation['description'] ?? null,
                    'shelter_id' => $shelter->id,
                    'created_at' => \Carbon\Carbon::createFromFormat('Y-m-d', $donation['created_at'])->startOfDay(),
                    'updated_at' => now(),
                ];
            });

            Donation::insert($donationsData->toArray());

            DB::commit();

            return response()->json([
                'message' => 'Donaciones importadas exitosamente',
                'count' => count($request->donations)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al importar donaciones',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una donación individual
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'required|email|max:255',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
            'shelter_id' => 'nullable|exists:shelters,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos inválidos',
                'details' => $validator->errors()
            ], 422);
        }

        $donation = Donation::create($request->validated());

        return response()->json([
            'message' => 'Donación creada exitosamente',
            'donation' => $donation
        ], 201);
    }

    /**
     * Obtener estadísticas de donaciones
     */
    public function stats(): JsonResponse
    {
        $query = Donation::query();

        // Filtrar por refugio si el usuario es aliado
        if (Auth::user()->role === 'aliado' && Auth::user()->shelter) {
            $query->where('shelter_id', Auth::user()->shelter->id);
        }

        $stats = [
            'total_donations' => $query->count(),
            'total_amount' => $query->sum('amount'),
            'imported_donations' => $query->whereNotNull('shelter_id')->whereNull('donor_email')->count(),
            'direct_donations' => $query->whereNotNull('donor_email')->count(),
        ];

        return response()->json($stats);
    }
}
