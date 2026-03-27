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
    private const MIN_DONATION_AMOUNT = 10000;

    public function index(WompiService $wompiService): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $user->load(['shelter.activePaymentMethod']);

        $this->syncVisibleOpenDonations($user, $wompiService);

        $donations = $this->filteredDonationsQuery($user)
            ->get()
            ->map(fn (Donation $donation) => $this->serializeDonation($donation, $wompiService, $user))
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
            'amount' => 'required|numeric|min:'.self::MIN_DONATION_AMOUNT,
            'description' => 'nullable|string|max:500',
            'shelter_id' => 'required|exists:shelters,id',
        ], [
            'amount.min' => 'El monto minimo para donar es de $10.000 COP.',
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
            'status' => Donation::STATUS_INITIATED,
            'gateway' => Donation::GATEWAY_WOMPI,
            'reference' => $reference,
            'gateway_payload' => [
                'checkout' => [
                    'url' => $checkout['checkout_url'],
                    'query' => $checkout['query'],
                    'created_at' => now()->toIso8601String(),
                ],
            ],
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Donacion creada. Puedes completar el pago desde Wompi.',
                'checkout_url' => $checkout['checkout_url'],
                'donation' => $this->serializeDonation($donation->load('shelter'), $wompiService, $authenticatedUser),
            ], 201);
        }

        return redirect()->away($checkout['checkout_url']);
    }

    public function handleWompiReturn(Request $request, WompiService $wompiService): RedirectResponse
    {
        $transactionId = $request->string('id')->trim()->value();

        if (blank($transactionId)) {
            return $this->redirectAfterWompiReturn(
                'warning',
                'No fue posible identificar la transaccion de Wompi. Si saliste del checkout, puedes continuarlo o cancelarlo desde la tabla.',
            );
        }

        try {
            $transaction = $wompiService->getTransaction($transactionId);
        } catch (\Throwable $exception) {
            Log::error('Error retrieving Wompi transaction on return', [
                'transaction_id' => $transactionId,
                'message' => $exception->getMessage(),
            ]);

            return $this->redirectAfterWompiReturn(
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

            return $this->redirectAfterWompiReturn(
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

        return $this->redirectAfterWompiReturn($flashType, $message);
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

    public function refreshStatus(Request $request, Donation $donation, WompiService $wompiService): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->ensureCanViewDonation($user, $donation);

        $donation->loadMissing('shelter');

        if (in_array($donation->status, Donation::finalStatuses(), true)) {
            return response()->json([
                'message' => 'La donacion ya tiene un estado final.',
                'donation' => $this->serializeDonation($donation, $wompiService, $user),
            ]);
        }

        if (! $wompiService->canRefreshStatus($donation)) {
            if ($wompiService->hasExpiredCheckout($donation)) {
                $donation = $wompiService->cancelAbandonedCheckout($donation, 'checkout_timeout');
                $donation->loadMissing('shelter');

                return response()->json([
                    'message' => 'El checkout expiro y la donacion fue cancelada.',
                    'donation' => $this->serializeDonation($donation, $wompiService, $user),
                ]);
            }

            return response()->json([
                'message' => 'Aun no hay una transaccion registrada en Wompi para consultar. Puedes continuar el checkout.',
                'donation' => $this->serializeDonation($donation, $wompiService, $user),
            ], 422);
        }

        $donation = $wompiService->syncOpenDonation($donation);
        $donation->loadMissing('shelter');

        return response()->json([
            'message' => $this->statusRefreshMessage($donation),
            'donation' => $this->serializeDonation($donation, $wompiService, $user),
        ]);
    }

    public function cancelCheckout(Request $request, Donation $donation, WompiService $wompiService): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->ensureCanManageOwnDonation($user, $donation);
        $donation->loadMissing('shelter');

        if (in_array($donation->status, Donation::finalStatuses(), true)) {
            return response()->json([
                'message' => 'La donacion ya tiene un estado final.',
                'donation' => $this->serializeDonation($donation, $wompiService, $user),
            ], 422);
        }

        if (! $wompiService->canResumeCheckout($donation) && ! $wompiService->hasExpiredCheckout($donation)) {
            return response()->json([
                'message' => 'No es posible cancelar una transaccion que ya esta siendo procesada por Wompi.',
                'donation' => $this->serializeDonation($donation, $wompiService, $user),
            ], 422);
        }

        $donation = $wompiService->cancelAbandonedCheckout($donation, 'checkout_cancelled_by_user');
        $donation->loadMissing('shelter');

        return response()->json([
            'message' => 'La donacion fue cancelada y ya no aparecera como pendiente.',
            'donation' => $this->serializeDonation($donation, $wompiService, $user),
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
                $query
                    ->where('shelter_id', $user->shelter->id)
                    ->where('status', Donation::STATUS_COMPLETED);
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
    private function serializeDonation(Donation $donation, WompiService $wompiService, User $user): array
    {
        $checkoutUrl = $wompiService->buildCheckoutUrlFromDonation($donation);
        $canResumeCheckout = $user->role === 'cliente'
            && $user->email === $donation->donor_email
            && $wompiService->canResumeCheckout($donation);
        $canCancelCheckout = $canResumeCheckout;
        $canRefreshStatus = $wompiService->canRefreshStatus($donation)
            && $this->userCanRefreshDonation($user, $donation);

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
            'checkout_url' => $canResumeCheckout ? $checkoutUrl : null,
            'can_resume_checkout' => $canResumeCheckout,
            'can_cancel_checkout' => $canCancelCheckout,
            'can_refresh_status' => $canRefreshStatus,
            'status_message' => $this->statusDetailMessage($donation, $wompiService),
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
            Donation::STATUS_INITIATED => ['info', 'Tu checkout esta listo para que completes el pago en Wompi.'],
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

    private function syncVisibleOpenDonations(User $user, WompiService $wompiService): void
    {
        if (! $wompiService->isReadyForCheckout()) {
            return;
        }

        $query = Donation::query()
            ->where('gateway', Donation::GATEWAY_WOMPI)
            ->whereIn('status', Donation::openStatuses())
            ->orderBy('created_at', 'desc');

        if ($user->role === 'aliado') {
            if (! $user->shelter) {
                return;
            }

            $query->where('shelter_id', $user->shelter->id);
        } elseif ($user->role === 'cliente') {
            $query->where('donor_email', $user->email);
        }

        $query
            ->limit(10)
            ->get()
            ->each(fn (Donation $donation) => $wompiService->syncOpenDonation($donation));
    }

    private function ensureCanViewDonation(User $user, Donation $donation): void
    {
        if (
            $user->role === 'admin'
            || ($user->role === 'cliente' && $donation->donor_email === $user->email)
            || ($user->role === 'aliado' && $user->shelter && $donation->shelter_id === $user->shelter->id)
        ) {
            return;
        }

        abort(403);
    }

    private function ensureCanManageOwnDonation(User $user, Donation $donation): void
    {
        if ($user->role === 'cliente' && $donation->donor_email === $user->email) {
            return;
        }

        abort(403);
    }

    private function userCanRefreshDonation(User $user, Donation $donation): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'cliente') {
            return $donation->donor_email === $user->email;
        }

        return $user->role === 'aliado'
            && $user->shelter !== null
            && $donation->shelter_id === $user->shelter->id;
    }

    private function statusDetailMessage(Donation $donation, WompiService $wompiService): ?string
    {
        return match ($donation->status) {
            Donation::STATUS_INITIATED => $wompiService->hasExpiredCheckout($donation)
                ? 'El checkout expiro y puede ser cancelado.'
                : 'El checkout fue generado, pero Wompi aun no reporta una transaccion.',
            Donation::STATUS_PENDING => 'Wompi aun no confirma el resultado final del pago.',
            Donation::STATUS_FAILED => 'Wompi reporto que el pago fallo o fue rechazado.',
            Donation::STATUS_CANCELLED => 'El pago fue cancelado o el checkout se abandono.',
            Donation::STATUS_COMPLETED => 'Wompi confirmo el pago exitosamente.',
            default => null,
        };
    }

    private function statusRefreshMessage(Donation $donation): string
    {
        return match ($donation->status) {
            Donation::STATUS_COMPLETED => 'Wompi confirmo el pago exitosamente.',
            Donation::STATUS_FAILED => 'Wompi reporto que el pago fallo.',
            Donation::STATUS_CANCELLED => 'La donacion fue cancelada.',
            Donation::STATUS_PENDING => 'La transaccion sigue pendiente en Wompi.',
            Donation::STATUS_INITIATED => 'El checkout aun no genera una transaccion consultable.',
            default => 'Estado actualizado.',
        };
    }

    private function redirectAfterWompiReturn(string $flashType, string $message): RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('donaciones.index')->with($flashType, $message);
        }

        session()->put('url.intended', route('donaciones.index'));

        return redirect()->route('login')->with($flashType, $message);
    }
}
