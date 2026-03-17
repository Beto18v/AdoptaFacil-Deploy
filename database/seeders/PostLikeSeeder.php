<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PostLike;
use App\Models\Post;
use App\Models\User;

/**
 * Seeder de likes para publicaciones.
 * Asigna interacciones aleatorias entre usuarios y posts sin repetir combinaciones.
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
