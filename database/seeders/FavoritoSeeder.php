<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Favorito;
use App\Models\Mascota;
use App\Models\User;

/**
 * Seeder de favoritos de mascotas.
 * Relaciona usuarios y mascotas de forma aleatoria evitando duplicados.
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
