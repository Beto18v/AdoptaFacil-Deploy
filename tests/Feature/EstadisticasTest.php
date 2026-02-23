<?php

use App\Models\User;
use App\Models\Solicitud;
use App\Models\Mascota;
use Carbon\Carbon;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('generar-pdf returns 200 and pdf type', function () {
    $user = User::factory()->create(['role' => 'aliado', 'email_verified_at' => now()]);
    $this->actingAs($user);

    $response = $this->post('/estadisticas/generar-pdf', [
        'fecha_inicio' => Carbon::now()->subMonth()->format('Y-m-d'),
        'fecha_fin' => Carbon::now()->format('Y-m-d'),
    ]);

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
    $response->assertHeader('Content-Disposition');
    $contentDisposition = $response->headers->get('Content-Disposition');
    $this->assertStringContainsString('reporte_adopciones_', $contentDisposition);
});

test('generar-pdf-rechazos returns 200 and pdf type', function () {
    $user = User::factory()->create(['role' => 'aliado', 'email_verified_at' => now()]);
    $this->actingAs($user);

    $response = $this->post('/estadisticas/generar-pdf-rechazos', [
        'fecha_inicio' => Carbon::now()->subMonth()->format('Y-m-d'),
        'fecha_fin' => Carbon::now()->format('Y-m-d'),
    ]);

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
    $response->assertHeader('Content-Disposition');
    $contentDisposition = $response->headers->get('Content-Disposition');
    $this->assertStringContainsString('reporte_rechazos_', $contentDisposition);
});
