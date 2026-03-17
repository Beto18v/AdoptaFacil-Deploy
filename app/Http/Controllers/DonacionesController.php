<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Shelter;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DonacionesController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $user->load('shelter');

        $donations = $this->filteredDonationsQuery($user)
            ->get()
            ->map(fn (Donation $donation) => $this->serializeDonation($donation))
            ->values();

        return Inertia::render('Dashboard/Donaciones/index', [
            'donations' => $donations,
            'shelters' => Shelter::query()->visible()->get(['id', 'name']),
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $donations = $this->filteredDonationsQuery($user)->paginate(15);

        $donations->getCollection()->transform(function (Donation $donation) {
            $serialized = $this->serializeDonation($donation);

            return $serialized + [
                'created_at' => Carbon::parse($serialized['created_at'])->format('Y-m-d'),
                'shelter_name' => $serialized['shelter']['name'] ?? null,
            ];
        });

        return response()->json($donations);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'required|email|max:255',
            'amount' => 'required|numeric|min:1000',
            'description' => 'nullable|string|max:500',
            'shelter_id' => 'required|exists:shelters,id',
        ]);

        $shelter = Shelter::query()->visible()->find($validatedData['shelter_id']);

        if (! $shelter) {
            throw ValidationException::withMessages([
                'shelter_id' => 'El refugio seleccionado ya no está disponible.',
            ]);
        }

        $validatedData['shelter_id'] = $shelter->id;

        $donation = Donation::create($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Donación creada exitosamente',
                'donation' => $this->serializeDonation($donation->load('shelter')),
            ], 201);
        }

        return redirect()->back()->with('success', '¡Donación registrada exitosamente!');
    }

    public function importDonations(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        Log::info('Iniciando importación de donaciones', [
            'user_id' => $user->id,
            'user_role' => $user->role ?? 'sin_rol',
        ]);

        if ($user->role !== 'aliado') {
            Log::warning('Usuario sin permisos intentó importar donaciones', ['user_id' => $user->id]);

            return response()->json(['error' => 'No tienes permisos para realizar esta acción'], 403);
        }

        if (! $user->shelter) {
            Log::warning('Usuario aliado sin refugio intentó importar donaciones', ['user_id' => $user->id]);

            return response()->json(['error' => 'No tienes un refugio asociado'], 400);
        }

        $validator = validator($request->all(), [
            'donations' => 'required|array|min:1',
            'donations.*.donor_name' => 'nullable|string|max:255',
            'donations.*.amount' => 'required|numeric|min:0.01',
            'donations.*.created_at' => 'required|date_format:Y-m-d',
            'donations.*.description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos de donación inválidos',
                'details' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $donationsData = collect($request->input('donations'))->map(function (array $donation) use ($user) {
                return [
                    'donor_name' => filled($donation['donor_name'] ?? null)
                        ? trim((string) $donation['donor_name'])
                        : $user->name,
                    'donor_email' => null,
                    'amount' => $donation['amount'],
                    'description' => $donation['description'] ?? null,
                    'shelter_id' => $user->shelter->id,
                    'created_at' => Carbon::createFromFormat('Y-m-d', $donation['created_at'])->startOfDay(),
                    'updated_at' => now(),
                ];
            });

            Donation::insert($donationsData->toArray());

            DB::commit();

            return response()->json([
                'message' => 'Donaciones importadas exitosamente',
                'count' => $donationsData->count(),
            ]);
        } catch (\Throwable $exception) {
            DB::rollBack();

            Log::error('Error al importar donaciones', [
                'user_id' => $user->id,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'error' => 'Error al importar donaciones',
                'details' => $exception->getMessage(),
            ], 500);
        }
    }

    public function stats(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $baseQuery = $this->filteredDonationsQuery($user);

        return response()->json([
            'total_donations' => (clone $baseQuery)->count(),
            'total_amount' => (clone $baseQuery)->sum('amount'),
            'imported_donations' => (clone $baseQuery)->whereNotNull('shelter_id')->whereNull('donor_email')->count(),
            'direct_donations' => (clone $baseQuery)->whereNotNull('donor_email')->count(),
        ]);
    }

    private function filteredDonationsQuery(User $user): Builder
    {
        $query = Donation::query()
            ->with('shelter')
            ->orderBy('created_at', 'desc');

        if ($user->role === 'aliado') {
            if ($user->shelter) {
                $query->where('shelter_id', $user->shelter->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif ($user->role === 'cliente') {
            $query->where('donor_email', $user->email);
        }

        return $query;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeDonation(Donation $donation): array
    {
        return [
            'id' => $donation->id,
            'donor_name' => $donation->getDonorDisplayName(),
            'donor_email' => $donation->donor_email,
            'amount' => (float) $donation->amount,
            'description' => $donation->description,
            'created_at' => $donation->created_at?->toISOString(),
            'is_imported' => $donation->isImported(),
            'shelter' => $donation->shelter ? [
                'id' => $donation->shelter->id,
                'name' => $donation->shelter->name,
            ] : null,
        ];
    }
}
