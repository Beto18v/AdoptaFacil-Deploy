<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Favorito;
use App\Models\Mascota;
use App\Models\User;

/**
 * FavoritoSeeder - Seeder para poblar la base de datos con mascotas favoritas
 *
 * Este seeder crea favoritos aleatorios para las mascotas existentes:
 * - Distribución realista de favoritos entre usuarios
 * - Evita favoritos duplicados del mismo usuario en la misma mascota
 * - Diferentes usuarios marcando diferentes mascotas como favoritas
 *
 * Los favoritos se crean solo si existen mascotas y usuarios.
 */
class FavoritoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mascotas = Mascota::all();
        $users = User::all();

        if ($mascotas->count() > 0 && $users->count() > 0) {
            // Para cada usuario, crear un número aleatorio de favoritos
            foreach ($users as $user) {
                $numFavoritos = rand(0, min(5, $mascotas->count())); // Máximo 5 favoritos por usuario
                $favoritas = $mascotas->random(min($numFavoritos, $mascotas->count()));

                foreach ($favoritas as $mascota) {
                    Favorito::firstOrCreate([
                        'user_id' => $user->id,
                        'mascota_id' => $mascota->id,
                    ]);
                }
            }
        }
    }
}
