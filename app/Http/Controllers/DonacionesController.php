<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Shelter;
use App\Models\ShelterPaymentMethod;
use App\Models\User;
use App\Services\WompiService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DonacionesController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $user->load(['shelter.activePaymentMethod']);

        $donations = $this->filteredDonationsQuery($user)
            ->get()
            ->map(fn (Donation $donation) => $this->serializeDonation($donation))
            ->values();

        return Inertia::render('Dashboard/Donaciones/index', [
            'donations' => $donations,
            'shelters' => Shelter::query()->visible()->get(['id', 'name']),
            'shelterPaymentMethod' => $user->shelter
                ? $this->serializeShelterPaymentMethod($user->shelter->activePaymentMethod)
                : null,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    public function store(Request $request, WompiService $wompiService): JsonResponse|RedirectResponse
    {
        if (! $wompiService->isReadyForCheckout()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'La pasarela de pagos Wompi no esta configurada.',
                ], 503);
            }

            return redirect()->back()->with('error', 'La pasarela de pagos Wompi no esta configurada.');
        }

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
                'shelter_id' => 'El refugio seleccionado ya no esta disponible.',
            ]);
        }

        /** @var User $authenticatedUser */
        $authenticatedUser = $request->user();
        $validatedData['donor_name'] = $authenticatedUser->name;
        $validatedData['donor_email'] = $authenticatedUser->email;

        $reference = $this->generateUniqueReference($wompiService);
        $amountInCents = $wompiService->amountInCents($validatedData['amount']);
        $checkout = $wompiService->buildCheckoutData(
            $reference,
            $amountInCents,
            route('donaciones.wompi.return'),
            [
                'email' => $validatedData['donor_email'],
                'full_name' => $validatedData['donor_name'],
            ],
        );

        $donation = Donation::create([
            ...$validatedData,
            'shelter_id' => $shelter->id,
            'status' => Donation::STATUS_PENDING,
            'gateway' => Donation::GATEWAY_WOMPI,
            'reference' => $reference,
            'gateway_payload' => [
                'checkout' => [
                    'query' => $checkout['query'],
                    'created_at' => now()->toIso8601String(),
                ],
            ],
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Donacion creada en estado pendiente.',
                'checkout_url' => $checkout['checkout_url'],
                'donation' => $this->serializeDonation($donation->load('shelter')),
            ], 201);
        }

        return redirect()->away($checkout['checkout_url']);
    }

    public function handleWompiReturn(Request $request, WompiService $wompiService): RedirectResponse
    {
        $transactionId = $request->string('id')->trim()->value();

        if (blank($transactionId)) {
            return redirect()->route('donaciones.index')->with('warning', 'No fue posible identificar la transaccion de Wompi.');
        }

        try {
            $transaction = $wompiService->getTransaction($transactionId);
        } catch (\Throwable $exception) {
            Log::error('Error retrieving Wompi transaction on return', [
                'transaction_id' => $transactionId,
                'message' => $exception->getMessage(),
            ]);

            return redirect()->route('donaciones.index')->with(
                'warning',
                'Volviste desde Wompi, pero no fue posible consultar el estado final del pago.',
            );
        }

        $donation = Donation::query()
            ->where('reference', $transaction['reference'] ?? null)
            ->orWhere('gateway_transaction_id', $transactionId)
            ->first();

        if (! $donation) {
            Log::warning('Wompi return without matching donation', [
                'transaction_id' => $transactionId,
                'reference' => $transaction['reference'] ?? null,
            ]);

            return redirect()->route('donaciones.index')->with(
                'warning',
                'El pago fue procesado en Wompi, pero no se encontro la donacion en la plataforma.',
            );
        }

        $wompiService->syncDonationFromTransaction($donation, $transaction, [
            'return' => [
                'transaction_id' => $transactionId,
                'received_at' => now()->toIso8601String(),
            ],
        ]);

        [$flashType, $message] = $this->paymentStatusMessage($donation->fresh());

        return redirect()->route('donaciones.index')->with($flashType, $message);
    }

    public function handleWompiWebhook(Request $request, WompiService $wompiService): JsonResponse
    {
        if (! $wompiService->isReadyForWebhook()) {
            return response()->json([
                'message' => 'El webhook de Wompi no esta configurado.',
            ], 503);
        }

        $payload = $request->all();

        if (($payload['event'] ?? null) !== 'transaction.updated') {
            return response()->json([
                'message' => 'Evento ignorado.',
            ]);
        }

        if (! $wompiService->isValidEventSignature($payload, $request->header('X-Event-Checksum'))) {
            Log::warning('Invalid Wompi webhook signature', [
                'event' => $payload['event'] ?? null,
                'reference' => data_get($payload, 'data.transaction.reference'),
            ]);

            return response()->json([
                'message' => 'Checksum invalido.',
            ], 400);
        }

        $transaction = $payload['data']['transaction'] ?? null;

        if (! is_array($transaction) || blank($transaction['reference'] ?? null)) {
            return response()->json([
                'message' => 'Payload invalido.',
            ], 422);
        }

        $donation = Donation::query()
            ->where('reference', $transaction['reference'])
            ->first();

        if (! $donation) {
            Log::warning('Wompi webhook without matching donation', [
                'reference' => $transaction['reference'],
                'transaction_id' => $transaction['id'] ?? null,
            ]);

            return response()->json([
                'message' => 'Donacion ignorada.',
            ]);
        }

        $wompiService->syncDonationFromTransaction($donation, $transaction, [
            'webhook' => $payload,
            'webhook_received_at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'message' => 'OK',
        ]);
    }

    public function importDonations(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        Log::info('Iniciando importacion de donaciones', [
            'user_id' => $user->id,
            'user_role' => $user->role ?? 'sin_rol',
        ]);

        if ($user->role !== 'aliado') {
            Log::warning('Usuario sin permisos intento importar donaciones', ['user_id' => $user->id]);

            return response()->json(['error' => 'No tienes permisos para realizar esta accion'], 403);
        }

        if (! $user->shelter) {
            Log::warning('Usuario aliado sin refugio intento importar donaciones', ['user_id' => $user->id]);

            return response()->json(['error' => 'No tienes un refugio asociado'], 400);
        }

        $validator = validator($request->all(), [
            'donations' => 'required|array|min:1',
            'donations.*.donor_name' => 'nullable|string|max:255',
            'donations.*.donor_email' => 'nullable|email|max:255',
            'donations.*.amount' => 'required|numeric|min:0.01',
            'donations.*.created_at' => 'required|date_format:Y-m-d',
            'donations.*.description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos de donacion invalidos',
                'details' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $donationsData = collect($request->input('donations'))->map(function (array $donation) use ($user) {
                $createdAt = Carbon::createFromFormat('Y-m-d', $donation['created_at'])->startOfDay();

                return [
                    'donor_name' => filled($donation['donor_name'] ?? null)
                        ? trim((string) $donation['donor_name'])
                        : 'Donante importado',
                    'donor_email' => filled($donation['donor_email'] ?? null)
                        ? trim((string) $donation['donor_email'])
                        : null,
                    'amount' => $donation['amount'],
                    'description' => $donation['description'] ?? null,
                    'shelter_id' => $user->shelter->id,
                    'status' => Donation::STATUS_COMPLETED,
                    'gateway' => Donation::GATEWAY_MANUAL,
                    'reference' => $this->generateManualReference(),
                    'paid_at' => $createdAt,
                    'created_at' => $createdAt,
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
            'payment_method' => $donation->payment_method,
            'status' => $donation->status,
            'gateway' => $donation->gateway,
            'reference' => $donation->reference,
            'gateway_payment_method' => $donation->gateway_payment_method,
            'created_at' => $donation->created_at?->toISOString(),
            'paid_at' => $donation->paid_at?->toISOString(),
            'failed_at' => $donation->failed_at?->toISOString(),
            'cancelled_at' => $donation->cancelled_at?->toISOString(),
            'is_imported' => $donation->isImported(),
            'shelter' => $donation->shelter ? [
                'id' => $donation->shelter->id,
                'name' => $donation->shelter->name,
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function serializeShelterPaymentMethod(?ShelterPaymentMethod $paymentMethod): ?array
    {
        if (! $paymentMethod) {
            return null;
        }

        return [
            'id' => $paymentMethod->id,
            'type' => $paymentMethod->type,
            'account_holder' => $paymentMethod->account_holder,
            'document_number' => $paymentMethod->document_number,
            'bank_name' => $paymentMethod->bank_name,
            'account_type' => $paymentMethod->account_type,
            'account_number' => $paymentMethod->account_number,
            'phone_number' => $paymentMethod->phone_number,
        ];
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function paymentStatusMessage(Donation $donation): array
    {
        return match ($donation->status) {
            Donation::STATUS_COMPLETED => ['success', 'Tu donacion fue completada exitosamente.'],
            Donation::STATUS_CANCELLED => ['warning', 'Tu donacion fue cancelada en Wompi.'],
            Donation::STATUS_FAILED => ['error', 'Tu donacion no pudo ser procesada.'],
            default => ['info', 'Tu donacion sigue pendiente de confirmacion.'],
        };
    }

    private function generateUniqueReference(WompiService $wompiService): string
    {
        do {
            $reference = $wompiService->generateReference();
        } while (Donation::query()->where('reference', $reference)->exists());

        return $reference;
    }

    private function generateManualReference(): string
    {
        return 'MANUAL-'.Str::upper((string) Str::ulid());
    }
}
