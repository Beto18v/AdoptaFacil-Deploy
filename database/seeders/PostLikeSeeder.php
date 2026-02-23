<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PostLike;
use App\Models\Post;
use App\Models\User;

/**
 * PostLikeSeeder - Seeder para poblar la base de datos con likes en posts
 *
 * Este seeder crea likes aleatorios para las publicaciones existentes:
 * - Distribución realista de likes entre posts
 * - Evita likes duplicados del mismo usuario en el mismo post
 * - Likes de diferentes usuarios en diferentes posts
 *
 * Los likes se crean solo si existen posts y usuarios.
 */
class PostLikeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $posts = Post::all();
        $users = User::all();

        if ($posts->count() > 0 && $users->count() > 0) {
            // Para cada post, crear un número aleatorio de likes
            foreach ($posts as $post) {
                $numLikes = rand(0, min(10, $users->count())); // Máximo 10 likes por post o número de usuarios
                $likedUsers = $users->random(min($numLikes, $users->count()));

                foreach ($likedUsers as $user) {
                    PostLike::firstOrCreate([
                        'user_id' => $user->id,
                        'post_id' => $post->id,
                    ]);
                }
            }
        }
    }
}
