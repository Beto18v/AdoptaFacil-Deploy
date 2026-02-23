<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Donation;
use App\Models\Shelter;

/**
 * DonationSeeder - Seeder para poblar la base de datos con donaciones de ejemplo
 *
 * Este seeder crea donaciones de ejemplo para los refugios existentes:
 * - Donaciones de usuarios individuales
 * - Donaciones con diferentes montos
 * - Descripciones variadas
 * - Distribución entre diferentes refugios
 *
 * Las donaciones se crean solo si existen refugios en la base de datos.
 */
class DonationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shelters = Shelter::all();

        if ($shelters->count() > 0) {
            $donorNames = [
                'María González',
                'Carlos Rodríguez',
                'Ana López',
                'Juan Martínez',
                'Laura Sánchez',
                'Pedro Ramírez',
                'Sofia Torres',
                'Diego Flores',
                'Valentina Morales',
                'Andrés Castillo',
                'Camila Vargas',
                'Mateo Herrera',
                'Isabella Díaz',
                'Sebastián Ruiz',
                'Gabriela Medina',
                'Emilio Silva',
                'Victoria Peña',
                'Leonardo Soto',
                'Natalia Aguirre',
                'Alejandro Campos',
                'Daniela Reyes',
                'Joaquín Ortega',
                'Renata Paredes',
                'Tomás Guzmán',
                'Luciana Vega',
                'Ignacio Muñoz',
                'Florencia Castro',
                'Benjamín Delgado',
                'Antonia Salinas',
                'Cristóbal León'
            ];

            $descriptions = [
                'Donación para alimentación de mascotas',
                'Apoyo para gastos veterinarios',
                'Contribución para mejoras del refugio',
                'Donación mensual de alimentos',
                'Ayuda para campaña de esterilización',
                'Contribución para medicamentos',
                'Apoyo para mantenimiento del refugio',
                'Donación para juguetes y accesorios',
                'Contribución para vacunación',
                'Ayuda para emergencias veterinarias',
                'Donación para limpieza y higiene',
                'Apoyo para transporte de mascotas',
                'Contribución para eventos de adopción',
                'Donación para capacitación del personal',
                'Ayuda para construcción de nuevas instalaciones',
            ];

            $amounts = [5000, 10000, 15000, 20000, 25000, 30000, 50000, 75000, 100000, 150000, 200000];

            // Crear donaciones para cada refugio
            foreach ($shelters as $shelter) {
                $numDonations = rand(5, 15); // Entre 5 y 15 donaciones por refugio
                for ($i = 0; $i < $numDonations; $i++) {
                    $donorName = $donorNames[array_rand($donorNames)];
                    $email = strtolower(str_replace(' ', '.', $donorName)) . '@example.com';
                    $amount = $amounts[array_rand($amounts)];
                    $description = $descriptions[array_rand($descriptions)];

                    Donation::create([
                        'donor_name' => $donorName,
                        'donor_email' => $email,
                        'amount' => $amount,
                        'shelter_id' => $shelter->id,
                        'description' => $description,
                    ]);
                }
            }
        }
    }
}
