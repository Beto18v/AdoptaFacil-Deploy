<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder de usuarios base del sistema.
 * Crea cuentas por rol y evita duplicados cuando ya existen registros equivalentes.
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
