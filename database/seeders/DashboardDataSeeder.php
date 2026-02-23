<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Donation;
use App\Models\Mascota;
use App\Models\Solicitud;
use App\Models\User;
use Carbon\Carbon;

/**
 * DashboardDataSeeder - Seeder para poblar datos de ejemplo para el dashboard
 *
 * Este seeder crea datos de prueba para las métricas y estadísticas del dashboard:
 * - Donaciones de ejemplo con diferentes montos y fechas
 * - Solicitudes de adopción de ejemplo (si existen mascotas y usuarios)
 *
 * Los datos se crean solo si no existen previamente para evitar duplicados.
 */
class DashboardDataSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Crear algunas donaciones de prueba si no existen
        if (Donation::count() == 0) {
            Donation::firstOrCreate(
                ['donor_email' => 'juan@email.com'],
                [
                    'donor_name' => 'Juan Pérez',
                    'amount' => 50000,
                    'created_at' => Carbon::now()->subDays(5),
                ]
            );

            Donation::firstOrCreate(
                ['donor_email' => 'maria@email.com'],
                [
                    'donor_name' => 'María García',
                    'amount' => 100000,
                    'created_at' => Carbon::now()->subDays(10),
                ]
            );

            Donation::firstOrCreate(
                ['donor_email' => 'carlos@email.com'],
                [
                    'donor_name' => 'Carlos López',
                    'amount' => 25000,
                    'created_at' => Carbon::now()->subDays(2),
                ]
            );
        }

        // Crear algunas solicitudes de prueba si hay mascotas y usuarios
        if (Solicitud::count() == 0 && Mascota::count() > 0 && User::count() > 0) {
            $mascota = Mascota::first();
            $user = User::first();

            if ($mascota && $user) {
                Solicitud::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'mascota_id' => $mascota->id,
                        'nombre_completo' => 'Ana Rodríguez'
                    ],
                    [
                        'cedula' => '1234567890',
                        'email' => 'ana.rodriguez@email.com',
                        'estado' => 'Aprobada',
                        'telefono' => '123456789',
                        'direccion_ciudad' => 'Bogotá',
                        'direccion_barrio' => 'Centro',
                        'tipo_vivienda' => 'Casa',
                        'porque_adopta' => 'Tengo experiencia con perros',
                        'created_at' => Carbon::now()->subDays(3),
                    ]
                );

                Solicitud::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'mascota_id' => $mascota->id,
                        'nombre_completo' => 'Pedro Martínez'
                    ],
                    [
                        'cedula' => '0987654321',
                        'email' => 'pedro.martinez@email.com',
                        'estado' => 'Enviada',
                        'telefono' => '987654321',
                        'direccion_ciudad' => 'Bogotá',
                        'direccion_barrio' => 'Chapinero',
                        'tipo_vivienda' => 'Apartamento',
                        'porque_adopta' => 'Primera vez adoptando',
                        'created_at' => Carbon::now()->subDays(1),
                    ]
                );
            }
        }
    }
}
