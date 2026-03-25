<?php

use App\Models\Mascota;
use App\Models\Donation;
use App\Models\Shelter;
use App\Models\ShelterPaymentMethod;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function createShelterForMapTests(User $user, array $attributes = []): Shelter
{
    return Shelter::create(array_merge([
        'name' => 'Refugio '.$user->id,
        'description' => 'Refugio de prueba',
        'address' => 'Calle 123',
        'city' => 'Bogotá',
        'phone' => '3000000000',
        'bank_name' => 'Banco Test',
        'account_type' => 'Ahorros',
        'account_number' => 'ACC-'.$user->id,
        'user_id' => $user->id,
        'latitude' => 4.6097,
        'longitude' => -74.0817,
    ], $attributes));
}

function createPetForMapTests(User $user, array $attributes = []): Mascota
{
    return Mascota::create(array_merge([
        'nombre' => 'Mascota '.$user->id,
        'especie' => 'perro',
        'raza' => 'Criollo',
        'edad' => 2,
        'sexo' => 'Macho',
        'ciudad' => 'Bogotá',
        'descripcion' => 'Mascota de prueba',
        'user_id' => $user->id,
    ], $attributes));
}

test('shelter registration preserves the selected city and trims contact fields', function () {
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $this->actingAs($ally)
        ->post(route('shelter.store'), [
            'name' => 'Fundacion Ciudad Normalizada',
            'description' => 'Refugio que valida ciudad',
            'address' => '  Calle 80   # 10-20  ',
            'city' => 'Bogotá',
            'phone' => ' 3001234567 ',
            'payment_receiver_type' => ShelterPaymentMethod::TYPE_BANK_ACCOUNT,
            'bank_name' => 'Banco Test',
            'account_type' => 'Ahorros',
            'account_number' => '1234567890',
            'account_holder' => 'Fundacion Ciudad Normalizada',
            'document_number' => '123456789',
            'latitude' => 4.6097,
            'longitude' => -74.0817,
        ])
        ->assertRedirect(route('donaciones.index'))
        ->assertSessionHasNoErrors();

    $shelter = Shelter::query()->where('user_id', $ally->id)->firstOrFail();

    expect($shelter->city)->toBe('Bogotá');
    expect($shelter->address)->toBe('Calle 80 # 10-20');
    expect($shelter->phone)->toBe('3001234567');
});

test('map groups shelters by city and exposes registered shelter addresses', function () {
    $viewer = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'cliente',
    ]);

    $allyOne = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);
    $allyTwo = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    createShelterForMapTests($allyOne, [
        'name' => 'Refugio Centro',
        'address' => 'Calle 10 # 20-30',
        'city' => 'Bogotá',
        'latitude' => 4.6097,
        'longitude' => -74.0817,
    ]);

    createShelterForMapTests($allyTwo, [
        'name' => 'Refugio Norte',
        'address' => 'Carrera 15 # 90-20',
        'city' => 'Bogotá',
        'latitude' => 4.6760,
        'longitude' => -74.0487,
        'account_number' => 'ACC-'.$allyTwo->id.'-MAPA',
    ]);

    createPetForMapTests($allyOne, ['nombre' => 'Luna', 'ciudad' => 'Bogotá']);
    createPetForMapTests($allyTwo, ['nombre' => 'Max', 'ciudad' => 'Bogotá']);

    $this->actingAs($viewer)
        ->get(route('mapa.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Mapa/index')
            ->where('totalMascotas', 2)
            ->where('totalCiudades', 1)
            ->where('locations', function ($locations) {
                $locations = collect($locations)->values();

                if (count($locations) !== 1) {
                    return false;
                }

                $location = $locations[0];

                return $location['city'] === 'Bogotá'
                    && $location['count'] === 2
                    && $location['shelters'] === 2
                    && collect($location['addresses'])->sort()->values()->all() === ['Calle 10 # 20-30', 'Carrera 15 # 90-20']
                    && collect($location['shelterDetails'])->pluck('name')->sort()->values()->all() === ['Refugio Centro', 'Refugio Norte'];
            }));
});

test('refugios directory filters shelters using the selected city from the map popup query', function () {
    $allyOne = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);
    $allyTwo = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    createShelterForMapTests($allyOne, [
        'name' => 'Refugio Bogotá',
        'city' => 'Bogotá',
    ]);

    createShelterForMapTests($allyTwo, [
        'name' => 'Refugio Medellín',
        'city' => 'Medellín',
        'account_number' => 'ACC-'.$allyTwo->id.'-MED',
    ]);

    $this->get(route('refugios', ['ciudad' => 'Bogotá']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('refugios')
            ->where('selectedCity', 'Bogotá')
            ->has('shelters', 1)
            ->where('shelters.0.name', 'Refugio Bogotá')
            ->where('shelters.0.city', 'Bogotá'));
});

test('refugios directory only counts completed donations for each shelter', function () {
    $ally = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $shelter = createShelterForMapTests($ally, [
        'name' => 'Refugio con donaciones',
    ]);

    Donation::create([
        'donor_name' => 'Donante completado',
        'donor_email' => 'completado@example.com',
        'amount' => 50000,
        'description' => 'Debe contarse',
        'shelter_id' => $shelter->id,
        'status' => Donation::STATUS_COMPLETED,
    ]);

    Donation::create([
        'donor_name' => 'Donante pendiente',
        'donor_email' => 'pendiente@example.com',
        'amount' => 25000,
        'description' => 'No debe contarse',
        'shelter_id' => $shelter->id,
        'status' => Donation::STATUS_PENDING,
    ]);

    $this->get(route('refugios'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('refugios')
            ->where('shelters.0.name', 'Refugio con donaciones')
            ->where('shelters.0.donations_count', 1));
});
