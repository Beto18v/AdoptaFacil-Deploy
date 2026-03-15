<?php

use App\Models\Comment;
use App\Models\Donation;
use App\Models\Favorito;
use App\Models\Mascota;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\Product;
use App\Models\Shelter;
use App\Models\Solicitud;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function createShelterForUser(User $user, array $attributes = []): Shelter
{
    return Shelter::create(array_merge([
        'name' => 'Refugio ' . $user->id,
        'description' => 'Refugio de prueba',
        'address' => 'Calle 123',
        'city' => 'BogotÃ¡',
        'phone' => '3000000000',
        'bank_name' => 'Banco Test',
        'account_type' => 'Ahorros',
        'account_number' => 'ACC-' . $user->id,
        'user_id' => $user->id,
    ], $attributes));
}

function createMascotaForUser(User $user, array $attributes = []): Mascota
{
    return Mascota::create(array_merge([
        'nombre' => 'Luna',
        'especie' => 'perro',
        'sexo' => 'Hembra',
        'ciudad' => 'BogotÃ¡',
        'descripcion' => 'Mascota de prueba',
        'user_id' => $user->id,
    ], $attributes));
}

function createProductForUser(User $user, array $attributes = []): Product
{
    return Product::create(array_merge([
        'name' => 'Producto de prueba',
        'description' => 'DescripciÃ³n',
        'price' => 10000,
        'stock' => 5,
        'user_id' => $user->id,
    ], $attributes));
}

test('legacy orphan shelters no longer break the map endpoint', function () {
    $viewer = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'admin',
    ]);

    $activeShelterUser = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);
    createShelterForUser($activeShelterUser, ['city' => 'BogotÃ¡']);
    createMascotaForUser($activeShelterUser, ['ciudad' => 'BogotÃ¡']);

    $deletedShelterUser = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);
    createShelterForUser($deletedShelterUser, [
        'city' => 'Cali',
        'account_number' => 'ACC-LEGACY',
        'name' => 'Refugio legado',
    ]);
    $deletedShelterUser->delete();

    $response = $this
        ->actingAs($viewer)
        ->get('/mapa');

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Mapa/index')
            ->where('totalMascotas', 1)
            ->where('totalCiudades', 1)
            ->where('locations.0.city', 'BogotÃ¡')
            ->where('locations.0.count', 1));
});

test('deleting an account cleans dependent data and detaches donations', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);
    $otherUser = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'cliente',
    ]);

    $shelter = createShelterForUser($user);
    $donation = Donation::create([
        'donor_name' => 'Donante',
        'donor_email' => 'donante@example.com',
        'amount' => 50000,
        'shelter_id' => $shelter->id,
    ]);
    $product = createProductForUser($user);
    $mascota = createMascotaForUser($user);
    $post = Post::create([
        'user_id' => $user->id,
        'content' => 'Post propio',
        'category' => 'General',
    ]);

    $otherPost = Post::create([
        'user_id' => $otherUser->id,
        'content' => 'Post ajeno',
        'category' => 'General',
    ]);
    $otherMascota = createMascotaForUser($otherUser, [
        'nombre' => 'Milo',
        'ciudad' => 'MedellÃ­n',
    ]);

    $comment = Comment::create([
        'post_id' => $otherPost->id,
        'user_id' => $user->id,
        'content' => 'Comentario',
    ]);
    $like = PostLike::create([
        'post_id' => $otherPost->id,
        'user_id' => $user->id,
    ]);
    $favorito = Favorito::create([
        'user_id' => $user->id,
        'mascota_id' => $otherMascota->id,
    ]);
    $solicitud = Solicitud::create([
        'user_id' => $user->id,
        'mascota_id' => $otherMascota->id,
        'nombre_completo' => 'Solicitante',
        'cedula' => '123456789',
        'email' => 'solicitante@example.com',
        'telefono' => '3001234567',
        'direccion_ciudad' => 'BogotÃ¡',
        'direccion_barrio' => 'Centro',
        'direccion_postal' => '111111',
        'tipo_vivienda' => 'Casa',
        'propiedad_vivienda' => 'Propia',
        'tiene_patio' => 'si',
        'permiten_mascotas_alquiler' => 'si',
        'cantidad_convivientes' => 2,
        'hay_ninos' => 'no',
        'edades_ninos' => null,
        'todos_acuerdo_adopcion' => 'si',
        'tiene_otras_mascotas' => 'no',
        'otras_mascotas_detalles' => null,
        'tuvo_mascotas_antes' => 'si',
        'que_paso_mascotas_anteriores' => 'Murieron de viejas',
        'porque_adopta' => 'Porque sÃ­',
        'que_espera_convivencia' => 'Buena',
        'que_haria_problemas_comportamiento' => 'Buscar ayuda',
        'acepta_visitas_seguimiento' => 'si',
        'acepta_proceso_evaluacion' => true,
        'acepta_cuidado_responsable' => true,
        'acepta_contrato_adopcion' => true,
        'estado' => 'Enviada',
    ]);

    $response = $this
        ->actingAs($user)
        ->delete('/settings/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    expect($user->fresh()->trashed())->toBeTrue();
    expect(Shelter::find($shelter->id))->toBeNull();
    expect(Donation::find($donation->id)?->shelter_id)->toBeNull();
    expect(Product::find($product->id))->toBeNull();
    expect(Mascota::find($mascota->id))->toBeNull();
    expect(Post::withTrashed()->find($post->id))->toBeNull();
    expect(Comment::find($comment->id))->toBeNull();
    expect(PostLike::find($like->id))->toBeNull();
    expect(Favorito::find($favorito->id))->toBeNull();
    expect(Solicitud::find($solicitud->id))->toBeNull();
});

test('cleanup command removes legacy records left by previously soft-deleted users', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'aliado',
    ]);
    $otherUser = User::factory()->create([
        'email_verified_at' => now(),
        'role' => 'cliente',
    ]);

    $shelter = createShelterForUser($user, ['name' => 'Refugio huÃ©rfano', 'account_number' => 'ACC-HUERFANO']);
    $donation = Donation::create([
        'donor_name' => 'Donante legado',
        'donor_email' => 'legacy@example.com',
        'amount' => 25000,
        'shelter_id' => $shelter->id,
    ]);
    $otherPost = Post::create([
        'user_id' => $otherUser->id,
        'content' => 'Post ajeno',
        'category' => 'General',
    ]);
    $otherMascota = createMascotaForUser($otherUser, [
        'nombre' => 'Nina',
        'ciudad' => 'Cali',
    ]);

    $comment = Comment::create([
        'post_id' => $otherPost->id,
        'user_id' => $user->id,
        'content' => 'Comentario legado',
    ]);
    $like = PostLike::create([
        'post_id' => $otherPost->id,
        'user_id' => $user->id,
    ]);
    $favorito = Favorito::create([
        'user_id' => $user->id,
        'mascota_id' => $otherMascota->id,
    ]);
    $solicitud = Solicitud::create([
        'user_id' => $user->id,
        'mascota_id' => $otherMascota->id,
        'nombre_completo' => 'Legacy User',
        'cedula' => '987654321',
        'email' => 'legacy@example.com',
        'telefono' => '3009876543',
        'direccion_ciudad' => 'Cali',
        'direccion_barrio' => 'Norte',
        'direccion_postal' => '222222',
        'tipo_vivienda' => 'Apartamento',
        'propiedad_vivienda' => 'Arriendo',
        'tiene_patio' => 'no',
        'permiten_mascotas_alquiler' => 'si',
        'cantidad_convivientes' => 1,
        'hay_ninos' => 'no',
        'edades_ninos' => null,
        'todos_acuerdo_adopcion' => 'si',
        'tiene_otras_mascotas' => 'no',
        'otras_mascotas_detalles' => null,
        'tuvo_mascotas_antes' => 'no',
        'que_paso_mascotas_anteriores' => null,
        'porque_adopta' => 'Quiero compaÃ±Ã­a',
        'que_espera_convivencia' => 'Tranquila',
        'que_haria_problemas_comportamiento' => 'Consultar a un experto',
        'acepta_visitas_seguimiento' => 'si',
        'acepta_proceso_evaluacion' => true,
        'acepta_cuidado_responsable' => true,
        'acepta_contrato_adopcion' => true,
        'estado' => 'Enviada',
    ]);

    $user->delete();

    expect(Shelter::query()->doesntHave('user')->count())->toBe(1);
    expect(Comment::query()->doesntHave('user')->count())->toBe(1);

    $this->artisan('adoptafacil:cleanup-orphans')
        ->assertExitCode(0);

    expect(Shelter::query()->doesntHave('user')->count())->toBe(0);
    expect(Comment::find($comment->id))->toBeNull();
    expect(PostLike::find($like->id))->toBeNull();
    expect(Favorito::find($favorito->id))->toBeNull();
    expect(Solicitud::find($solicitud->id))->toBeNull();
    expect(Donation::find($donation->id)?->shelter_id)->toBeNull();
});
