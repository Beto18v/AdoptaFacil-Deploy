<?php

use App\Mail\BulkEmailMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('admin can send bulk email to selected users', function () {
    Mail::fake();
    config()->set('mail.from.address', 'sender@example.com');

    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $firstRecipient = User::factory()->create();
    $secondRecipient = User::factory()->create();

    $response = $this->actingAs($admin)
        ->from(route('gestion.usuarios'))
        ->post(route('gestion.usuarios.send-bulk-email'), [
            'user_ids' => [$firstRecipient->id, $secondRecipient->id],
            'subject' => 'Actualizacion importante',
            'description' => "Linea uno\nLinea dos",
        ]);

    $response
        ->assertRedirect(route('gestion.usuarios'))
        ->assertSessionHas('success', 'Correos enviados exitosamente');

    Mail::assertSent(BulkEmailMail::class, 1);
    Mail::assertSent(BulkEmailMail::class, function (BulkEmailMail $mail) use ($firstRecipient, $secondRecipient) {
        return $mail->hasTo('sender@example.com')
            && $mail->hasBcc($firstRecipient->email)
            && $mail->hasBcc($secondRecipient->email)
            && $mail->subjectLine === 'Actualizacion importante'
            && $mail->messageBody === "Linea uno\nLinea dos";
    });
});

test('bulk email only accepts existing users', function () {
    Mail::fake();

    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)
        ->from(route('gestion.usuarios'))
        ->post(route('gestion.usuarios.send-bulk-email'), [
            'user_ids' => [999999],
            'subject' => 'Actualizacion importante',
            'description' => 'Mensaje de prueba',
        ]);

    $response
        ->assertRedirect(route('gestion.usuarios'))
        ->assertSessionHasErrors(['user_ids.0']);

    Mail::assertNothingSent();
});

test('bulk email skips invalid recipient emails and returns warning', function () {
    Mail::fake();
    config()->set('mail.from.address', 'sender@example.com');

    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $validRecipient = User::factory()->create([
        'email' => 'aliado@demo.com',
    ]);

    $invalidRecipient = User::factory()->create([
        'email' => 'correo-invalido',
    ]);

    $secondValidRecipient = User::factory()->create([
        'email' => 'cliente@demo.com',
    ]);

    $response = $this->actingAs($admin)
        ->from(route('gestion.usuarios'))
        ->post(route('gestion.usuarios.send-bulk-email'), [
            'user_ids' => [$validRecipient->id, $invalidRecipient->id, $secondValidRecipient->id],
            'subject' => 'Actualizacion importante',
            'description' => 'Mensaje de prueba',
        ]);

    $response
        ->assertRedirect(route('gestion.usuarios'))
        ->assertSessionHas('warning', 'Se envio el correo a 2 destinatario(s). 1 destinatario(s) no se pudo procesar.');

    Mail::assertSent(BulkEmailMail::class, 1);
    Mail::assertSent(BulkEmailMail::class, function (BulkEmailMail $mail) use ($validRecipient, $secondValidRecipient) {
        return $mail->hasTo('sender@example.com')
            && $mail->hasBcc($validRecipient->email)
            && $mail->hasBcc($secondValidRecipient->email);
    });
});

test('bulk email returns error when every selected email is invalid', function () {
    Mail::fake();

    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $invalidRecipient = User::factory()->create([
        'email' => 'correo-invalido',
    ]);

    $response = $this->actingAs($admin)
        ->from(route('gestion.usuarios'))
        ->post(route('gestion.usuarios.send-bulk-email'), [
            'user_ids' => [$invalidRecipient->id],
            'subject' => 'Actualizacion importante',
            'description' => 'Mensaje de prueba',
        ]);

    $response
        ->assertRedirect(route('gestion.usuarios'))
        ->assertSessionHas('error', 'No se pudo enviar ningun correo. Revisa los destinatarios seleccionados.');

    Mail::assertNothingSent();
});
