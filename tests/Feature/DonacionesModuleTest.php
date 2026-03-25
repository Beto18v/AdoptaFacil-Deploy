<?php

use App\Models\Donation;
use App\Models\Shelter;
use App\Models\ShelterPaymentMethod;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function configureWompiForDonationTests(array $overrides = []): void
{
    config(array_merge([
        'services.wompi.public_key' => 'pub_test_checkout_demo',
        'services.wompi.integrity_secret' => 'test_integrity_secret',
        'services.wompi.event_secret' => 'test_event_secret',
        'services.wompi.api_url' => 'https://sandbox.wompi.test/v1',
        'services.wompi.checkout_url' => 'https://checkout.wompi.test/p/',
    ], $overrides));
}

function createShelterForDonationTests(User $user, array $attributes = [], ?array $paymentMethodAttributes = null): Shelter
{
    $shelter = Shelter::create(array_merge([
        'name' => 'Refugio ' . $user->id,
        'description' => 'Refugio de prueba',
        'address' => 'Calle 123',
        'city' => 'Bogota',
        'phone' => '3000000000',
        'bank_name' => 'Banco Test',
        'account_type' => 'Ahorros',
        'account_number' => 'ACC-' . $user->id,
        'user_id' => $user->id,
        'latitude' => 4.6097,
        'longitude' => -74.0817,
    ], $attributes));

    ShelterPaymentMethod::create(array_merge([
        'shelter_id' => $shelter->id,
        'type' => ShelterPaymentMethod::TYPE_BANK_ACCOUNT,
        'account_holder' => $shelter->name,
        'document_number' => null,
        'bank_name' => $shelter->bank_name,
        'account_type' => $shelter->account_type,
        'account_number' => $shelter->account_number,
        'phone_number' => null,
        'is_active' => true,
    ], $paymentMethodAttributes ?? []));

    return $shelter;
}

/**
 * @param  array<string, mixed>  $transactionOverrides
 * @return array<string, mixed>
 */
function buildWompiWebhookPayload(array $transactionOverrides = [], ?string $eventSecret = null): array
{
    $eventSecret ??= (string) config('services.wompi.event_secret');
    $transaction = array_merge([
        'id' => 'tx-test-001',
        'amount_in_cents' => 5500000,
        'reference' => 'DON-REF-001',
        'customer_email' => 'cliente@example.com',
        'currency' => 'COP',
        'payment_method_type' => 'CARD',
        'redirect_url' => 'https://app.test/donaciones/pago/retorno',
        'status' => 'APPROVED',
    ], $transactionOverrides);

    $timestamp = 1712345678;
    $checksum = hash(
        'sha256',
        $transaction['id'] . $transaction['status'] . $transaction['amount_in_cents'] . $timestamp . $eventSecret,
    );

    return [
        'event' => 'transaction.updated',
        'data' => [
            'transaction' => $transaction,
        ],
        'timestamp' => $timestamp,
        'signature' => [
            'properties' => ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
            'checksum' => $checksum,
        ],
        'sent_at' => '2026-03-22T00:00:00.000Z',
    ];
}

test('ally only sees donations from their shelter in the donations dashboard', function () {
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);
    $otherAlly = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $shelter = createShelterForDonationTests($ally);
    $otherShelter = createShelterForDonationTests($otherAlly, [
        'account_number' => 'ACC-' . $otherAlly->id . '-OTRO',
    ]);

    $visibleDonation = Donation::create([
        'donor_name' => 'Donante visible',
        'donor_email' => 'visible@example.com',
        'amount' => 50000,
        'description' => 'Aporte visible',
        'shelter_id' => $shelter->id,
    ]);

    Donation::create([
        'donor_name' => 'Donante oculto',
        'donor_email' => 'oculto@example.com',
        'amount' => 25000,
        'description' => 'Aporte oculto',
        'shelter_id' => $otherShelter->id,
    ]);

    $this->actingAs($ally)
        ->get(route('donaciones.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Donaciones/index')
            ->has('donations', 1)
            ->where('donations.0.id', $visibleDonation->id)
            ->where('donations.0.shelter.id', $shelter->id)
            ->where('auth.user.shelter.id', $shelter->id));
});

test('client only sees their own donations in the donations dashboard', function () {
    $client = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'cliente',
        'email' => 'cliente@example.com',
    ]);
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $shelter = createShelterForDonationTests($ally);

    $ownDonation = Donation::create([
        'donor_name' => 'Cliente Demo',
        'donor_email' => $client->email,
        'amount' => 100000,
        'description' => 'Mi donacion',
        'shelter_id' => $shelter->id,
    ]);

    Donation::create([
        'donor_name' => 'Otro Cliente',
        'donor_email' => 'otro@example.com',
        'amount' => 150000,
        'description' => 'Donacion ajena',
        'shelter_id' => $shelter->id,
    ]);

    $this->actingAs($client)
        ->get(route('donaciones.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Donaciones/index')
            ->has('donations', 1)
            ->where('donations.0.id', $ownDonation->id)
            ->where('donations.0.donor_email', $client->email));
});

test('ally can import donations through the unified donations controller', function () {
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
        'name' => 'Aliado Principal',
    ]);
    $shelter = createShelterForDonationTests($ally);

    $response = $this->actingAs($ally)
        ->postJson(route('donaciones.import'), [
            'donations' => [
                [
                    'amount' => 120000,
                    'created_at' => '2026-03-01',
                    'description' => 'Importada desde Excel',
                    'donor_email' => 'importada@example.com',
                ],
                [
                    'donor_name' => 'Donante historico',
                    'donor_email' => 'historico@example.com',
                    'amount' => 80000,
                    'created_at' => '2026-03-02',
                ],
            ],
        ]);

    $response
        ->assertOk()
        ->assertJson([
            'message' => 'Donaciones importadas exitosamente',
            'count' => 2,
        ]);

    expect(Donation::count())->toBe(2);

    $importedDonations = Donation::orderBy('created_at')->get();

    expect($importedDonations[0]->shelter_id)->toBe($shelter->id);
    expect($importedDonations[0]->donor_email)->toBe('importada@example.com');
    expect($importedDonations[0]->donor_name)->toBe('Donante importado');
    expect($importedDonations[0]->status)->toBe(Donation::STATUS_COMPLETED);
    expect($importedDonations[0]->gateway)->toBe(Donation::GATEWAY_MANUAL);
    expect($importedDonations[0]->reference)->not->toBeNull();
    expect($importedDonations[1]->donor_name)->toBe('Donante historico');
    expect($importedDonations[1]->donor_email)->toBe('historico@example.com');
});

test('direct donations are created as pending and return a wompi checkout url', function () {
    configureWompiForDonationTests();

    $client = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'cliente',
        'name' => 'Cliente Pagador',
        'email' => 'pagador@example.com',
    ]);
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $shelter = createShelterForDonationTests($ally);

    $response = $this->actingAs($client)
        ->postJson(route('donaciones.store'), [
            'donor_name' => $client->name,
            'donor_email' => $client->email,
            'amount' => 55000,
            'description' => 'Aporte con Wompi',
            'shelter_id' => $shelter->id,
        ]);

    $response
        ->assertCreated()
        ->assertJsonPath('donation.status', Donation::STATUS_PENDING)
        ->assertJsonPath('donation.gateway', Donation::GATEWAY_WOMPI);

    $donation = Donation::query()->latest('id')->firstOrFail();

    expect($donation->payment_method)->toBeNull();
    expect($donation->status)->toBe(Donation::STATUS_PENDING);
    expect($donation->gateway)->toBe(Donation::GATEWAY_WOMPI);
    expect($donation->reference)->not->toBeNull();
    expect($response->json('checkout_url'))->toContain('https://checkout.wompi.test/p/?');
});

test('direct donations always use the authenticated user identity', function () {
    configureWompiForDonationTests();

    $client = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'cliente',
        'name' => 'Cliente Real',
        'email' => 'cliente.real@example.com',
    ]);
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $shelter = createShelterForDonationTests($ally);

    $this->actingAs($client)
        ->postJson(route('donaciones.store'), [
            'donor_name' => 'Nombre Manipulado',
            'donor_email' => 'otro@example.com',
            'amount' => 55000,
            'description' => 'Intento de suplantacion',
            'shelter_id' => $shelter->id,
        ])
        ->assertCreated();

    $donation = Donation::query()->latest('id')->firstOrFail();

    expect($donation->donor_name)->toBe($client->name);
    expect($donation->donor_email)->toBe($client->email);
});

test('wompi checkout flow includes a backend generated reference and integrity signature', function () {
    configureWompiForDonationTests();

    $client = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'cliente',
        'name' => 'Cliente Firma',
        'email' => 'firma@example.com',
    ]);
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $shelter = createShelterForDonationTests($ally);

    $response = $this->actingAs($client)
        ->postJson(route('donaciones.store'), [
            'donor_name' => $client->name,
            'donor_email' => $client->email,
            'amount' => 100000,
            'description' => 'Firma de integridad',
            'shelter_id' => $shelter->id,
        ]);

    $checkoutUrl = $response->json('checkout_url');
    parse_str(parse_url($checkoutUrl, PHP_URL_QUERY) ?: '', $query);

    $donation = Donation::query()->latest('id')->firstOrFail();
    $expectedSignature = hash(
        'sha256',
        $donation->reference . '10000000' . 'COP' . 'test_integrity_secret',
    );

    expect($query['public-key'] ?? null)->toBe('pub_test_checkout_demo');
    expect($query['reference'] ?? null)->toBe($donation->reference);
    expect($query['amount-in-cents'] ?? null)->toBe('10000000');
    expect($query['signature:integrity'] ?? null)->toBe($expectedSignature);
});

test('shelter payment receiver validation requires phone number for nequi', function () {
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $response = $this->actingAs($ally)
        ->from(route('donaciones.index'))
        ->post(route('shelter.store'), [
            'name' => 'Fundacion Nequi',
            'description' => 'Refugio que recibe por Nequi',
            'address' => 'Carrera 1',
            'city' => 'Bogota',
            'phone' => '3001234567',
            'payment_receiver_type' => ShelterPaymentMethod::TYPE_NEQUI,
            'account_holder' => 'Fundacion Nequi',
            'document_number' => '123456789',
            'latitude' => 4.6097,
            'longitude' => -74.0817,
        ]);

    $response
        ->assertRedirect(route('donaciones.index'))
        ->assertSessionHasErrors(['payment_receiver_phone']);
});

test('ally can update the shelter payment receiver method without breaking the shelter record', function () {
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $shelter = createShelterForDonationTests($ally);

    $response = $this->actingAs($ally)
        ->put(route('shelter.update', $shelter), [
            'name' => $shelter->name,
            'description' => $shelter->description,
            'address' => $shelter->address,
            'city' => $shelter->city,
            'phone' => $shelter->phone,
            'payment_receiver_type' => ShelterPaymentMethod::TYPE_DAVIPLATA,
            'payment_receiver_phone' => '3009876543',
            'account_holder' => 'Titular Daviplata',
            'document_number' => '987654321',
            'latitude' => $shelter->latitude,
            'longitude' => $shelter->longitude,
        ]);

    $response
        ->assertRedirect(route('donaciones.index'))
        ->assertSessionHasNoErrors();

    $shelter->refresh();

    expect($shelter->bank_name)->toBeNull();
    expect($shelter->account_type)->toBeNull();
    expect($shelter->account_number)->toBeNull();

    $paymentMethod = $shelter->activePaymentMethod()->first();

    expect($paymentMethod)->not->toBeNull();
    expect($paymentMethod?->type)->toBe(ShelterPaymentMethod::TYPE_DAVIPLATA);
    expect($paymentMethod?->phone_number)->toBe('3009876543');
    expect($paymentMethod?->account_holder)->toBe('Titular Daviplata');
});

test('wompi webhook updates donation status and transaction metadata', function () {
    configureWompiForDonationTests();

    $donation = Donation::create([
        'donor_name' => 'Cliente Webhook',
        'donor_email' => 'webhook@example.com',
        'amount' => 55000,
        'status' => Donation::STATUS_PENDING,
        'gateway' => Donation::GATEWAY_WOMPI,
        'reference' => 'DON-REF-001',
    ]);

    $payload = buildWompiWebhookPayload();

    $response = $this->postJson(
        route('donaciones.wompi.webhook'),
        $payload,
        ['X-Event-Checksum' => $payload['signature']['checksum']],
    );

    $response->assertOk()->assertJson(['message' => 'OK']);

    $donation->refresh();

    expect($donation->status)->toBe(Donation::STATUS_COMPLETED);
    expect($donation->gateway_transaction_id)->toBe('tx-test-001');
    expect($donation->gateway_payment_method)->toBe('CARD');
    expect($donation->paid_at)->not->toBeNull();
});

test('wompi webhook maps transaction statuses to internal donation states', function (string $gatewayStatus, string $expectedStatus, string $timestampField) {
    configureWompiForDonationTests();

    $donation = Donation::create([
        'donor_name' => 'Cliente Estado',
        'donor_email' => 'estado@example.com',
        'amount' => 55000,
        'status' => Donation::STATUS_PENDING,
        'gateway' => Donation::GATEWAY_WOMPI,
        'reference' => 'DON-ESTADO-' . $gatewayStatus,
    ]);

    $payload = buildWompiWebhookPayload([
        'id' => 'tx-' . strtolower($gatewayStatus),
        'reference' => $donation->reference,
        'status' => $gatewayStatus,
    ]);

    $this->postJson(
        route('donaciones.wompi.webhook'),
        $payload,
        ['X-Event-Checksum' => $payload['signature']['checksum']],
    )->assertOk();

    $donation->refresh();

    expect($donation->status)->toBe($expectedStatus);
    expect($donation->{$timestampField})->not->toBeNull();
})->with([
    ['VOIDED', Donation::STATUS_CANCELLED, 'cancelled_at'],
    ['DECLINED', Donation::STATUS_FAILED, 'failed_at'],
    ['ERROR', Donation::STATUS_FAILED, 'failed_at'],
]);

test('wompi reattempt updates the same donation to the latest final state and clears stale terminal timestamps', function () {
    configureWompiForDonationTests();

    $donation = Donation::create([
        'donor_name' => 'Cliente Reintento',
        'donor_email' => 'reintento@example.com',
        'amount' => 55000,
        'status' => Donation::STATUS_PENDING,
        'gateway' => Donation::GATEWAY_WOMPI,
        'reference' => 'DON-REINTENTO-001',
    ]);

    $failedPayload = buildWompiWebhookPayload([
        'id' => 'tx-retry-1',
        'reference' => $donation->reference,
        'status' => 'DECLINED',
    ]);

    $this->postJson(
        route('donaciones.wompi.webhook'),
        $failedPayload,
        ['X-Event-Checksum' => $failedPayload['signature']['checksum']],
    )->assertOk();

    $donation->refresh();

    expect($donation->status)->toBe(Donation::STATUS_FAILED);
    expect($donation->failed_at)->not->toBeNull();
    expect($donation->paid_at)->toBeNull();

    $approvedPayload = buildWompiWebhookPayload([
        'id' => 'tx-retry-2',
        'reference' => $donation->reference,
        'status' => 'APPROVED',
        'payment_method_type' => 'PSE',
    ]);

    $this->postJson(
        route('donaciones.wompi.webhook'),
        $approvedPayload,
        ['X-Event-Checksum' => $approvedPayload['signature']['checksum']],
    )->assertOk();

    $donation->refresh();

    expect($donation->status)->toBe(Donation::STATUS_COMPLETED);
    expect($donation->gateway_transaction_id)->toBe('tx-retry-2');
    expect($donation->gateway_payment_method)->toBe('PSE');
    expect($donation->paid_at)->not->toBeNull();
    expect($donation->failed_at)->toBeNull();
    expect($donation->cancelled_at)->toBeNull();
});

test('wompi return route syncs the donation state from the transaction lookup', function () {
    configureWompiForDonationTests();

    $client = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'cliente',
        'email' => 'retorno@example.com',
    ]);

    $donation = Donation::create([
        'donor_name' => 'Cliente Retorno',
        'donor_email' => $client->email,
        'amount' => 55000,
        'status' => Donation::STATUS_PENDING,
        'gateway' => Donation::GATEWAY_WOMPI,
        'reference' => 'DON-RETORNO-001',
    ]);

    Http::fake([
        'https://sandbox.wompi.test/v1/transactions/tx-retorno' => Http::response([
            'data' => [
                'id' => 'tx-retorno',
                'reference' => $donation->reference,
                'status' => 'VOIDED',
                'amount_in_cents' => 5500000,
                'payment_method_type' => 'PSE',
            ],
        ], 200),
    ]);

    $this->actingAs($client)
        ->get(route('donaciones.wompi.return', ['id' => 'tx-retorno']))
        ->assertRedirect(route('donaciones.index'))
        ->assertSessionHas('warning', 'Tu donacion fue cancelada en Wompi.');

    $donation->refresh();

    expect($donation->status)->toBe(Donation::STATUS_CANCELLED);
    expect($donation->gateway_transaction_id)->toBe('tx-retorno');
    expect($donation->gateway_payment_method)->toBe('PSE');
});
