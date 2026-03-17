<?php

use App\Models\Mascota;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('profile updates still work through method spoofing', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
        'email' => 'perfil@example.com',
    ]);

    $this->actingAs($user)
        ->post(route('profile.update'), [
            '_method' => 'PATCH',
            'name' => 'Perfil Actualizado',
            'email' => 'perfil-actualizado@example.com',
        ])
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh()->name)->toBe('Perfil Actualizado')
        ->and($user->fresh()->email)->toBe('perfil-actualizado@example.com');
});

test('product updates still work through post plus put spoofing', function () {
    $owner = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $product = Product::create([
        'name' => 'Producto Inicial',
        'description' => 'Descripción inicial',
        'price' => 10000,
        'stock' => 3,
        'user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('productos.update', $product), [
            '_method' => 'PUT',
            'nombre' => 'Producto Actualizado',
            'descripcion' => 'Descripción actualizada',
            'precio' => 25000,
            'cantidad' => 9,
        ])
        ->assertRedirect(route('productos.mascotas'));

    expect($product->fresh()->name)->toBe('Producto Actualizado')
        ->and((float) $product->fresh()->price)->toBe(25000.0)
        ->and($product->fresh()->stock)->toBe(9);
});

test('mascota updates still work through post plus put spoofing for the owner', function () {
    $owner = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $mascota = Mascota::create([
        'nombre' => 'Luna',
        'especie' => 'Perro',
        'raza' => 'Mestiza',
        'fecha_nacimiento' => Carbon::now()->subYears(2)->toDateString(),
        'sexo' => 'Hembra',
        'ciudad' => 'Bogotá',
        'descripcion' => 'Descripción inicial',
        'user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('mascotas.update', $mascota), [
            '_method' => 'PUT',
            'nombre' => 'Luna Actualizada',
            'especie' => 'Perro',
            'raza' => 'Mestiza',
            'fecha_nacimiento' => Carbon::now()->subYears(2)->toDateString(),
            'sexo' => 'Hembra',
            'ciudad' => 'Bogotá',
            'descripcion' => 'Descripción actualizada',
        ])
        ->assertRedirect(route('productos.mascotas'));

    expect($mascota->fresh()->nombre)->toBe('Luna Actualizada')
        ->and($mascota->fresh()->descripcion)->toBe('Descripción actualizada');
});

test('an ally cannot update a mascota they do not own', function () {
    $owner = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);
    $intruder = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);

    $mascota = Mascota::create([
        'nombre' => 'Toby',
        'especie' => 'Perro',
        'raza' => 'Criollo',
        'fecha_nacimiento' => Carbon::now()->subYears(3)->toDateString(),
        'sexo' => 'Macho',
        'ciudad' => 'Medellín',
        'descripcion' => 'Mascota del propietario',
        'user_id' => $owner->id,
    ]);

    $this->actingAs($intruder)
        ->post(route('mascotas.update', $mascota), [
            '_method' => 'PUT',
            'nombre' => 'Cambio no autorizado',
            'especie' => 'Perro',
            'raza' => 'Criollo',
            'fecha_nacimiento' => Carbon::now()->subYears(3)->toDateString(),
            'sexo' => 'Macho',
            'ciudad' => 'Medellín',
            'descripcion' => 'Intento de edición',
        ])
        ->assertForbidden();

    expect($mascota->fresh()->nombre)->toBe('Toby');
});
