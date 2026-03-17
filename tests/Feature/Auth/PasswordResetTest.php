<?php

use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('reset password link screen can be rendered', function () {
    $response = $this->get('/forgot-password');

    $response->assertStatus(200);
});

test('reset password link can be requested', function () {
    Mail::fake();

    $user = User::factory()->create();

    $response = $this->post('/forgot-password', ['email' => $user->email]);

    $response
        ->assertRedirect()
        ->assertSessionHas('status', 'Te enviamos un enlace para restablecer tu contraseña.');

    Mail::assertSent(PasswordResetMail::class, function (PasswordResetMail $mail) use ($user) {
        return $mail->hasTo($user->email);
    });
});

test('reset password screen can be rendered', function () {
    Mail::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    $resetUrl = null;

    Mail::assertSent(PasswordResetMail::class, function (PasswordResetMail $mail) use ($user, &$resetUrl) {
        if (! $mail->hasTo($user->email)) {
            return false;
        }

        $resetUrl = $mail->resetUrl;

        return true;
    });

    expect($resetUrl)->not->toBeNull();

    $path = parse_url($resetUrl, PHP_URL_PATH);
    $query = parse_url($resetUrl, PHP_URL_QUERY);

    $response = $this->get($path.($query ? '?'.$query : ''));

    $response->assertStatus(200);
});

test('password can be reset with valid token', function () {
    Mail::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    $resetUrl = null;

    Mail::assertSent(PasswordResetMail::class, function (PasswordResetMail $mail) use ($user, &$resetUrl) {
        if (! $mail->hasTo($user->email)) {
            return false;
        }

        $resetUrl = $mail->resetUrl;

        return true;
    });

    expect($resetUrl)->not->toBeNull();

    $path = parse_url($resetUrl, PHP_URL_PATH);
    $query = parse_url($resetUrl, PHP_URL_QUERY);

    parse_str($query ?? '', $queryParams);

    $response = $this->post('/reset-password', [
        'token' => Str::afterLast($path, '/'),
        'email' => $queryParams['email'] ?? $user->email,
        'password' => 'NuevaClave123!',
        'password_confirmation' => 'NuevaClave123!',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('login'));

    expect(Hash::check('NuevaClave123!', $user->fresh()->password))->toBeTrue();
});

test('forgot password requires an existing email', function () {
    Mail::fake();

    $response = $this->from('/forgot-password')->post('/forgot-password', [
        'email' => 'nonexistent@example.com',
    ]);

    $response
        ->assertRedirect('/forgot-password')
        ->assertSessionHasErrors(['email']);

    Mail::assertNothingSent();
});

test('password reset link request is throttled', function () {
    Mail::fake();

    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    auth()->logout();

    for ($i = 0; $i < 5; $i++) {
        $this->post('/forgot-password', ['email' => $user->email]);
    }

    $response = $this->post('/forgot-password', ['email' => $user->email]);

    $response->assertStatus(429);
});
