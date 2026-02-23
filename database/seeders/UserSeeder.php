<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * UserSeeder - Seeder para poblar la base de datos con usuarios de ejemplo
 *
 * Este seeder crea usuarios predeterminados para cada rol principal del sistema:
 * - Admin: Usuario administrador con acceso completo al sistema
 * - Aliado: Usuario representante de refugios o aliados de la plataforma
 * - Cliente: Usuario adoptante o comprador en la plataforma
 *
 * Los usuarios se crean solo si no existen previamente para evitar duplicados.
 */
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuario Admin
        User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('Password123'),
                'role' => 'admin',
                'avatar' => null, // Opcional
            ]
        );

        // Usuario Aliado
        User::firstOrCreate(
            ['email' => 'aliado@demo.com'],
            [
                'name' => 'Aliado User',
                'password' => Hash::make('Password123'),
                'role' => 'aliado',
                'avatar' => null, // Opcional
            ]
        );

        // Usuario Cliente
        User::firstOrCreate(
            ['email' => 'cliente@demo.com'],
            [
                'name' => 'Cliente User',
                'password' => Hash::make('Password123'),
                'role' => 'cliente',
                'avatar' => null, // Opcional
            ]
        );
    }
}
