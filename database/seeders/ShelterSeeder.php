<?php

namespace Database\Seeders;

use App\Models\Shelter;
use App\Models\User;
use App\Models\Mascota;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\MascotaImage;

/**
 * ShelterSeeder - Seeder para poblar la base de datos con refugios y mascotas de ejemplo
 *
 * Este seeder crea una red de refugios de mascotas distribuidos en diferentes ciudades de Colombia:
 * - Crea usuarios con rol 'aliado' para cada refugio
 * - Genera refugios con información completa (dirección, teléfono, datos bancarios)
 * - Pobla cada refugio con mascotas de diferentes especies y razas
 *
 * Los refugios se crean en ciudades principales con cantidades variables.
 * Cada refugio tiene entre 5-15 mascotas con nombres aleatorios y características diversas.
 */
class ShelterSeeder extends Seeder
{
    public function run(): void
    {
        // Crear usuarios aliados para los refugios
        $ciudades = [
            'Bogotá' => 3,
            'Medellín' => 2,
            'Cali' => 2,
            'Barranquilla' => 1,
            'Cartagena' => 1,
            'Bucaramanga' => 1,
        ];

        foreach ($ciudades as $ciudad => $cantidadRefugios) {
            for ($i = 1; $i <= $cantidadRefugios; $i++) {
                $email = strtolower("refugio{$ciudad}{$i}@example.com"); // Correo electrónico del refugio: refugioBarranquilla1@example.com

                // Crear usuario aliado (usar firstOrCreate para evitar duplicados)
                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => "Refugio {$ciudad} {$i}",
                        'email_verified_at' => now(),
                        'password' => Hash::make('password'),
                        'role' => 'aliado',
                    ]
                );

                // Crear refugio (usar firstOrCreate para evitar duplicados)
                $shelter = Shelter::firstOrCreate(
                    ['name' => "Refugio de Mascotas {$ciudad} {$i}"],
                    [
                        'user_id' => $user->id,
                        'description' => "Refugio dedicado al cuidado y adopción de mascotas en {$ciudad}",
                        'address' => "Calle {$i} #{$i}-{$i}, {$ciudad}",
                        'city' => $ciudad,
                        'phone' => '300' . rand(1000000, 9999999),
                        'bank_name' => 'Bancolombia',
                        'account_type' => 'Ahorros',
                        'account_number' => rand(10000000, 99999999),
                    ]
                );

                // Crear mascotas para cada refugio (solo si no existen)
                if (Mascota::where('user_id', $user->id)->count() == 0) {
                    $this->crearMascotasParaRefugio($user->id, $ciudad);
                }
            }
        }
    }

    /**
     * Crea mascotas de ejemplo para un refugio específico
     */
    private function crearMascotasParaRefugio(int $userId, string $ciudad): void
    {
        // Obtener imágenes locales de perros y gatos
        $imagenesPerros = glob(storage_path('app/public/mascotas/perros/*.{jpg,jpeg,png,gif,webp}'), GLOB_BRACE);
        $imagenesGatos = glob(storage_path('app/public/mascotas/gatos/*.{jpg,jpeg,png,gif,webp}'), GLOB_BRACE);
        $imagenesPerrosPublic = array_map(function ($img) {
            $filename = basename($img);
            return "mascotas/perros/{$filename}";
        }, $imagenesPerros);
        $imagenesGatosPublic = array_map(function ($img) {
            $filename = basename($img);
            return "mascotas/gatos/{$filename}";
        }, $imagenesGatos);

        $especies = ['Perro', 'Gato'];
        $razas = [
            'Perro' => ['Labrador', 'Golden Retriever', 'Bulldog', 'Pastor Alemán', 'Mestizo'],
            'Gato' => ['Siamés', 'Persa', 'Maine Coon', 'Angora', 'Mestizo'],
        ];

        $cantidadMascotas = rand(5, 15);
        for ($j = 1; $j <= $cantidadMascotas; $j++) {
            $especie = $especies[array_rand($especies)];
            $raza = $razas[$especie][array_rand($razas[$especie])];
            $sexo = ['Macho', 'Hembra'][array_rand(['Macho', 'Hembra'])];
            // Seleccionar imágenes aleatorias (1 a 3) según especie
            $imagenes = $especie === 'Perro' ? $imagenesPerrosPublic : $imagenesGatosPublic;
            shuffle($imagenes);
            $numImagenes = count($imagenes) > 0 ? rand(1, min(3, count($imagenes))) : 0;
            $imagenesSeleccionadas = array_slice($imagenes, 0, $numImagenes);
            $imagenPrincipal = $imagenesSeleccionadas[0] ?? null;

            $mascota = Mascota::create([
                'nombre' => $this->generarNombreMascota(),
                'especie' => $especie,
                'raza' => $raza,
                'fecha_nacimiento' => now()->subYears(rand(1, 10))->subDays(rand(0, 365))->toDateString(),
                'sexo' => $sexo,
                'ciudad' => $ciudad,
                'descripcion' => "Hermosa mascota en busca de un hogar lleno de amor en {$ciudad}",
                'imagen' => $imagenPrincipal,
                'user_id' => $userId,
            ]);

            // Guardar imágenes en mascota_images
            foreach ($imagenesSeleccionadas as $idx => $imgPath) {
                MascotaImage::create([
                    'mascota_id' => $mascota->id,
                    'imagen_path' => $imgPath,
                    'orden' => $idx + 1,
                ]);
            }
        }
    }

    private function generarNombreMascota(): string
    {
        $nombres = [
            'Max',
            'Bella',
            'Charlie',
            'Luna',
            'Cooper',
            'Lucy',
            'Rocky',
            'Daisy',
            'Buddy',
            'Molly',
            'Jack',
            'Sadie',
            'Oliver',
            'Maggie',
            'Bear',
            'Sophie',
            'Zeus',
            'Chloe',
            'Duke',
            'Zoe',
            'Toby',
            'Lily',
            'Tucker',
            'Penny',
            'Simba',
            'Mia',
            'Leo',
            'Nala',
            'Milo',
            'Coco',
            'Oreo',
            'Princess',
            'Shadow',
            'Ruby',
            'Gizmo',
            'Rosie',
            'Bandit',
            'Lola',
            'Rusty',
            'Emma'
        ];

        return $nombres[array_rand($nombres)];
    }
}
