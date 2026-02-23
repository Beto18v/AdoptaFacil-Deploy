<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * DatabaseSeeder - Orquestador principal de todos los seeders
 *
 * Este seeder coordina la ejecución de todos los seeders del sistema en el orden correcto:
 * 1. UserSeeder - Crea usuarios base del sistema
 * 2. ShelterSeeder - Crea refugios y mascotas
 * 3. ProductSeeder - Crea productos para la tienda
 * 4. PostSeeder - Crea publicaciones de comunidad
 * 5. CommentSeeder - Crea comentarios en las publicaciones
 * 6. DonationSeeder - Crea donaciones para los refugios
 * 7. PostLikeSeeder - Crea likes en las publicaciones
 * 8. FavoritoSeeder - Crea mascotas favoritas
 * 9. SolicitudSeeder - Crea solicitudes de adopción
 * 10. DashboardDataSeeder - Crea datos para métricas del dashboard
 *
 * El orden es importante debido a las dependencias entre modelos.
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ejecutar el seeder de usuarios primero
        $this->call([
            UserSeeder::class,
        ]);

        // Ejecutar el seeder de refugios y mascotas
        $this->call([
            ShelterSeeder::class,
        ]);

        // Ejecutar el seeder de productos
        $this->call([
            ProductSeeder::class,
        ]);

        // Ejecutar el seeder de posts
        $this->call([
            PostSeeder::class,
        ]);

        // Ejecutar el seeder de comentarios
        $this->call([
            CommentSeeder::class,
        ]);

        // Ejecutar el seeder de donaciones
        $this->call([
            DonationSeeder::class,
        ]);

        // Ejecutar el seeder de likes en posts
        $this->call([
            PostLikeSeeder::class,
        ]);

        // Ejecutar el seeder de favoritos
        $this->call([
            FavoritoSeeder::class,
        ]);

        // Ejecutar el seeder de solicitudes
        $this->call([
            SolicitudSeeder::class,
        ]);

        // Ejecutar el seeder de datos del dashboard
        $this->call([
            DashboardDataSeeder::class,
        ]);
    }
}
