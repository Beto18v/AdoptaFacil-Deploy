<?php

use App\Models\Donation;
use App\Models\Shelter;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function createShelterForDonationTests(User $user, array $attributes = []): Shelter
{
    return Shelter::create(array_merge([
        'name' => 'Refugio ' . $user->id,
        'description' => 'Refugio de prueba',
        'address' => 'Calle 123',
        'city' => 'Bogotá',
        'phone' => '3000000000',
        'bank_name' => 'Banco Test',
        'account_type' => 'Ahorros',
        'account_number' => 'ACC-' . $user->id,
        'user_id' => $user->id,
    ], $attributes));
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
        'description' => 'Mi donación',
        'shelter_id' => $shelter->id,
    ]);

    Donation::create([
        'donor_name' => 'Otro Cliente',
        'donor_email' => 'otro@example.com',
        'amount' => 150000,
        'description' => 'Donación ajena',
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
                    'donor_name' => 'Donante histórico',
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
    expect($importedDonations[1]->donor_name)->toBe('Donante histórico');
    expect($importedDonations[1]->donor_email)->toBe('historico@example.com');
});

test('direct donations persist the selected payment method', function () {
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
            'description' => 'Aporte con método de pago',
            'shelter_id' => $shelter->id,
            'payment_method' => 'pse',
        ]);

    $response
        ->assertCreated()
        ->assertJsonPath('donation.payment_method', 'pse');

    expect(Donation::query()->latest('id')->first()?->payment_method)->toBe('pse');
});
