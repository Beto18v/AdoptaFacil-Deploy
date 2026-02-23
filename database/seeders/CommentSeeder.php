<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;

/**
 * CommentSeeder - Seeder para poblar la base de datos con comentarios en posts
 *
 * Este seeder crea comentarios de ejemplo para las publicaciones existentes:
 * - Comentarios positivos y de apoyo
 * - Preguntas sobre las publicaciones
 * - Comentarios de agradecimiento
 * - Interacciones entre usuarios
 *
 * Los comentarios se distribuyen aleatoriamente entre los posts y usuarios existentes.
 */
class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $posts = Post::all();
        $users = User::all();

        if ($posts->count() > 0 && $users->count() > 0) {
            $comments = [
                '¡Excelente iniciativa! Me encantaría participar.',
                'Gracias por la información, muy útil.',
                '¿Dónde será exactamente? Me gustaría ir.',
                '¡Felicidades por el trabajo que hacen!',
                '¿Cómo puedo ayudar con esta campaña?',
                'Qué buena noticia, sigan así.',
                'Me parece genial esta idea.',
                '¿Tienen más detalles sobre esto?',
                '¡Bravo! Sigan adelante.',
                'Esto es lo que necesita nuestra comunidad.',
                '¿Cuándo será la próxima jornada?',
                'Gracias por compartir esto.',
                'Muy buena labor, felicitaciones.',
                '¿Puedo colaborar de alguna manera?',
                'Esto motiva a hacer más por los animales.',
                '¡Qué alegría leer esto!',
                '¿Dónde puedo encontrar más información?',
                'Excelente trabajo, continúen.',
                'Me uno al agradecimiento.',
                '¿Cómo contactarlos para más detalles?',
                'Esto es inspirador.',
                '¡Sigan así, son un ejemplo!',
                '¿Qué necesitan exactamente?',
                'Gracias por pensar en los animales.',
                'Esto cambia vidas.',
                '¡Qué bonito gesto!',
                '¿Puedo compartir esto?',
                'Muy buena idea.',
                '¿Dónde se llevará a cabo?',
                '¡Felicitaciones!',
            ];

            // Crear comentarios para cada post
            foreach ($posts as $post) {
                $numComments = rand(0, 5); // Entre 0 y 5 comentarios por post
                for ($i = 0; $i < $numComments; $i++) {
                    $user = $users->random();
                    $commentContent = $comments[array_rand($comments)];

                    Comment::firstOrCreate(
                        [
                            'post_id' => $post->id,
                            'user_id' => $user->id,
                            'content' => $commentContent,
                        ]
                    );
                }
            }
        }
    }
}
