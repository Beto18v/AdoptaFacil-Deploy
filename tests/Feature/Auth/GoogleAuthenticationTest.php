<?php

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUserContract;
use Laravel\Socialite\Facades\Socialite;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function fakeGoogleUser(string $id, string $email, string $name): SocialiteUserContract
{
    $googleUser = \Mockery::mock(SocialiteUserContract::class);
    $googleUser->shouldReceive('getId')->andReturn($id);
    $googleUser->shouldReceive('getEmail')->andReturn($email);
    $googleUser->shouldReceive('getName')->andReturn($name);

    return $googleUser;
}

function fakeGoogleDriver(SocialiteUserContract $googleUser): void
{
    $provider = \Mockery::mock(Provider::class);
    $provider->shouldReceive('stateless')->andReturnSelf()->byDefault();
    $provider->shouldReceive('user')->andReturn($googleUser);

    Socialite::shouldReceive('driver')
        ->with('google')
        ->andReturn($provider);
}

test('google registration respects the selected ally role', function () {
    Mail::fake();

    fakeGoogleDriver(fakeGoogleUser('google-ally-1', 'aliado-google@example.com', 'Aliado Google'));

    $response = $this
        ->withSession(['google_oauth_role' => 'aliado'])
        ->get(route('auth.google.callback'));

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();

    $user = User::where('email', 'aliado-google@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user?->role)->toBe('aliado')
        ->and($user?->google_id)->toBe('google-ally-1');
});

test('google registration defaults to client when no role was selected', function () {
    Mail::fake();

    fakeGoogleDriver(fakeGoogleUser('google-client-1', 'cliente-google@example.com', 'Cliente Google'));

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('dashboard'));

    $user = User::where('email', 'cliente-google@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user?->role)->toBe('cliente');
});

test('existing users keep their original role after logging in with google', function () {
    Mail::fake();

    $existingUser = User::factory()->create([
        'email_verified_at' => now(),
        'name' => 'Aliado Existente',
        'email' => 'existente@example.com',
        'role' => 'aliado',
        'google_id' => null,
    ]);

    fakeGoogleDriver(fakeGoogleUser('google-existing-1', $existingUser->email, $existingUser->name));

    $response = $this
        ->withSession(['google_oauth_role' => 'cliente'])
        ->get(route('auth.google.callback'));

    $response->assertRedirect(route('dashboard'));

    expect($existingUser->fresh()->role)->toBe('aliado')
        ->and($existingUser->fresh()->google_id)->toBe('google-existing-1');
});
