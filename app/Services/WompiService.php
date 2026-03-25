<?php

namespace App\Services;

use App\Models\Donation;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WompiService
{
    public function isReadyForCheckout(): bool
    {
        return filled($this->publicKey()) && filled($this->integritySecret());
    }

    public function isReadyForWebhook(): bool
    {
        return filled($this->eventSecret());
    }

    public function publicKey(): ?string
    {
        return config('services.wompi.public_key');
    }

    public function checkoutUrl(): string
    {
        return rtrim((string) config('services.wompi.checkout_url', 'https://checkout.wompi.co/p/'), '/').'/';
    }

    public function apiUrl(): string
    {
        return rtrim((string) config('services.wompi.api_url', 'https://production.wompi.co/v1'), '/');
    }

    public function checkoutTimeoutMinutes(): int
    {
        return max(1, (int) config('services.wompi.checkout_timeout_minutes', 15));
    }

    public function generateReference(): string
    {
        return 'DON-'.now()->format('YmdHis').'-'.Str::upper(Str::random(8));
    }

    public function amountInCents(float|string $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }

    public function generateIntegritySignature(
        string $reference,
        int $amountInCents,
        string $currency = 'COP',
        ?string $expirationTime = null,
    ): string {
        $plainText = $reference.$amountInCents.$currency;

        if ($expirationTime) {
            $plainText .= $expirationTime;
        }

        $plainText .= $this->integritySecret();

        return hash('sha256', $plainText);
    }

    /**
     * @param  array<string, string|null>  $customerData
     * @return array{checkout_url: string, query: array<string, string>}
     */
    public function buildCheckoutData(
        string $reference,
        int $amountInCents,
        string $redirectUrl,
        array $customerData = [],
        ?string $expirationTime = null,
    ): array {
        $query = array_filter([
            'public-key' => $this->publicKey(),
            'currency' => 'COP',
            'amount-in-cents' => (string) $amountInCents,
            'reference' => $reference,
            'signature:integrity' => $this->generateIntegritySignature($reference, $amountInCents, 'COP', $expirationTime),
            'redirect-url' => $redirectUrl,
            'expiration-time' => $expirationTime,
            'customer-data:email' => $customerData['email'] ?? null,
            'customer-data:full-name' => $customerData['full_name'] ?? null,
        ], fn (?string $value): bool => filled($value));

        return [
            'checkout_url' => $this->checkoutUrl().'?'.Arr::query($query),
            'query' => $query,
        ];
    }

    public function buildCheckoutUrlFromDonation(Donation $donation): ?string
    {
        $checkoutUrl = data_get($donation->gateway_payload, 'checkout.url');

        if (filled($checkoutUrl)) {
            return (string) $checkoutUrl;
        }

        $query = data_get($donation->gateway_payload, 'checkout.query');

        if (! is_array($query) || $query === []) {
            return null;
        }

        return $this->checkoutUrl().'?'.Arr::query($query);
    }

    public function canResumeCheckout(Donation $donation): bool
    {
        if ($donation->gateway !== Donation::GATEWAY_WOMPI) {
            return false;
        }

        if (! in_array($donation->status, Donation::openStatuses(), true)) {
            return false;
        }

        if (filled($donation->gateway_transaction_id) || $this->hasExpiredCheckout($donation)) {
            return false;
        }

        return filled($this->buildCheckoutUrlFromDonation($donation));
    }

    public function canRefreshStatus(Donation $donation): bool
    {
        if ($donation->gateway !== Donation::GATEWAY_WOMPI) {
            return false;
        }

        if (! in_array($donation->status, Donation::openStatuses(), true)) {
            return false;
        }

        return filled($donation->gateway_transaction_id);
    }

    public function hasExpiredCheckout(Donation $donation): bool
    {
        if (filled($donation->gateway_transaction_id)) {
            return false;
        }

        $checkoutCreatedAt = data_get($donation->gateway_payload, 'checkout.created_at');

        if (blank($checkoutCreatedAt)) {
            return false;
        }

        try {
            return Carbon::parse((string) $checkoutCreatedAt)
                ->addMinutes($this->checkoutTimeoutMinutes())
                ->isPast();
        } catch (\Throwable) {
            return false;
        }
    }

    public function cancelAbandonedCheckout(Donation $donation, string $reason = 'checkout_abandoned'): Donation
    {
        if (in_array($donation->status, Donation::finalStatuses(), true)) {
            return $donation;
        }

        $gatewayPayload = $donation->gateway_payload ?? [];
        $checkoutPayload = is_array($gatewayPayload['checkout'] ?? null) ? $gatewayPayload['checkout'] : [];
        $checkoutPayload['cancelled_at'] = now()->toIso8601String();
        $checkoutPayload['cancellation_reason'] = $reason;
        $gatewayPayload['checkout'] = $checkoutPayload;

        $donation->forceFill([
            'status' => Donation::STATUS_CANCELLED,
            'gateway' => Donation::GATEWAY_WOMPI,
            'gateway_payload' => $gatewayPayload,
            'cancelled_at' => $donation->cancelled_at ?? now(),
            'paid_at' => null,
            'failed_at' => null,
        ]);

        $donation->save();

        return $donation->refresh();
    }

    /**
     * @return array<string, mixed>
     *
     * @throws RequestException
     */
    public function getTransaction(string $transactionId): array
    {
        $response = Http::acceptJson()
            ->withToken((string) $this->publicKey())
            ->get($this->apiUrl().'/transactions/'.$transactionId)
            ->throw();

        return $response->json('data', []);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function isValidEventSignature(array $payload, ?string $providedChecksum = null): bool
    {
        $properties = Arr::get($payload, 'signature.properties', []);
        $timestamp = (string) Arr::get($payload, 'timestamp', Arr::get($payload, 'signature.timestamp', ''));
        $checksum = $providedChecksum ?: Arr::get($payload, 'signature.checksum');

        if (! is_array($properties) || blank($timestamp) || blank($checksum) || blank($this->eventSecret())) {
            return false;
        }

        $concatenated = collect($properties)
            ->map(fn ($property) => (string) data_get($payload['data'] ?? [], $property, ''))
            ->implode('');

        $calculated = hash('sha256', $concatenated.$timestamp.$this->eventSecret());

        return hash_equals(strtolower($calculated), strtolower((string) $checksum));
    }

    public function mapTransactionStatus(?string $gatewayStatus): string
    {
        return match (Str::upper((string) $gatewayStatus)) {
            'APPROVED' => Donation::STATUS_COMPLETED,
            'VOIDED' => Donation::STATUS_CANCELLED,
            'DECLINED', 'ERROR' => Donation::STATUS_FAILED,
            default => Donation::STATUS_PENDING,
        };
    }

    /**
     * @param  array<string, mixed>  $transaction
     * @param  array<string, mixed>  $payloadUpdate
     */
    public function syncDonationFromTransaction(Donation $donation, array $transaction, array $payloadUpdate = []): Donation
    {
        $gatewayStatus = Str::upper((string) ($transaction['status'] ?? 'PENDING'));
        $status = $this->mapTransactionStatus($gatewayStatus);

        if ($status === Donation::STATUS_PENDING && in_array($donation->status, Donation::finalStatuses(), true)) {
            return $donation;
        }

        $gatewayPayload = array_merge($donation->gateway_payload ?? [], $payloadUpdate);

        $donation->forceFill([
            'status' => $status,
            'gateway' => Donation::GATEWAY_WOMPI,
            'reference' => $transaction['reference'] ?? $donation->reference,
            'gateway_transaction_id' => $transaction['id'] ?? $donation->gateway_transaction_id,
            'gateway_payment_method' => $transaction['payment_method_type'] ?? $donation->gateway_payment_method,
            'gateway_payload' => array_merge($gatewayPayload, [
                'transaction' => $transaction,
                'gateway_status' => $gatewayStatus,
            ]),
        ]);

        if ($status === Donation::STATUS_COMPLETED) {
            $donation->paid_at = $donation->paid_at ?? now();
            $donation->failed_at = null;
            $donation->cancelled_at = null;
        } elseif ($status === Donation::STATUS_CANCELLED) {
            $donation->cancelled_at = $donation->cancelled_at ?? now();
            $donation->paid_at = null;
            $donation->failed_at = null;
        } elseif ($status === Donation::STATUS_FAILED) {
            $donation->failed_at = $donation->failed_at ?? now();
            $donation->paid_at = null;
            $donation->cancelled_at = null;
        } else {
            $donation->paid_at = null;
            $donation->failed_at = null;
            $donation->cancelled_at = null;
        }

        $donation->save();

        Log::info('Donation synced from Wompi transaction', [
            'donation_id' => $donation->id,
            'reference' => $donation->reference,
            'gateway_status' => $gatewayStatus,
            'status' => $donation->status,
        ]);

        return $donation->refresh();
    }

    public function syncOpenDonation(Donation $donation): Donation
    {
        if ($donation->gateway !== Donation::GATEWAY_WOMPI) {
            return $donation;
        }

        if (in_array($donation->status, Donation::finalStatuses(), true)) {
            return $donation;
        }

        if ($this->hasExpiredCheckout($donation)) {
            return $this->cancelAbandonedCheckout($donation, 'checkout_timeout');
        }

        if (! $this->canRefreshStatus($donation)) {
            return $donation;
        }

        try {
            $transaction = $this->getTransaction((string) $donation->gateway_transaction_id);
        } catch (\Throwable $exception) {
            Log::warning('Unable to refresh Wompi donation status', [
                'donation_id' => $donation->id,
                'gateway_transaction_id' => $donation->gateway_transaction_id,
                'message' => $exception->getMessage(),
            ]);

            return $donation;
        }

        return $this->syncDonationFromTransaction($donation, $transaction, [
            'status_refresh' => [
                'checked_at' => now()->toIso8601String(),
            ],
        ]);
    }

    private function integritySecret(): ?string
    {
        return config('services.wompi.integrity_secret');
    }

    private function eventSecret(): ?string
    {
        return config('services.wompi.event_secret');
    }
}
