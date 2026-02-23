<?php

use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    Mail::fake();

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'cliente',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    if (config('queue.default') === 'sync') {
        Mail::assertSent(WelcomeMail::class, function ($mail) {
            return $mail->hasTo('test@example.com');
        });
    } else {
        Mail::assertQueued(WelcomeMail::class, function ($mail) {
            return $mail->hasTo('test@example.com');
        });
    }
});
