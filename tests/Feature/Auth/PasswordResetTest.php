<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('reset password link screen can be rendered', function () {
    $response = $this->get('/forgot-password');

    $response->assertStatus(200);
});

test('reset password link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('reset password screen can be rendered', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
        $response = $this->get('/reset-password/'.$notification->token);

        $response->assertStatus(200);

        return true;
    });
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post('/reset-password', [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        return true;
    });
});

test('forgot password returns same response for existing and non-existing email', function () {
    $user = User::factory()->create();
    
    $response1 = $this->post('/forgot-password', ['email' => $user->email]);
    $response2 = $this->post('/forgot-password', ['email' => 'nonexistent@example.com']);

    $response1->assertSessionHas('status', __('A reset link will be sent if the account exists.'));
    $response2->assertSessionHas('status', __('A reset link will be sent if the account exists.'));
    
    $response1->assertRedirect();
    $response2->assertRedirect();
});

test('password reset link request is throttled', function () {
    $email = 'test@example.com';
    
    // Ensure we are guest
    auth()->logout();
    
    for ($i = 0; $i < 5; $i++) {
        $this->post('/forgot-password', ['email' => $email]);
    }
    
    $response = $this->post('/forgot-password', ['email' => $email]);
    $response->assertStatus(429);
});