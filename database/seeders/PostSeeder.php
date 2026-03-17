<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;

/**
 * Seeder de publicaciones para comunidad.
 * Crea posts de ejemplo y asume usuarios disponibles para asociarlos.
 */
class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear algunos posts de ejemplo si hay usuarios
        $users = User::all();

        if ($users->count() > 0) {
            $posts = [
                [
                    'content' => '¡Gran jornada de esterilización este fin de semana! 🐾 Ayúdanos a controlar la sobrepoblación y a mejorar la calidad de vida de nuestros amigos peludos. Tendremos precios especiales y contaremos con el apoyo de veterinarios expertos. ¡No faltes!',
                    'category' => 'Campaña',
                    'likes_count' => 125,
                    'comments_count' => 12,
                    'image_url' => 'https://picsum.photos/seed/post1/400/300',
                ],
                [
                    'content' => '¡Bienvenidos a nuestra nueva sección de Comunidad! ✨ Este es un espacio para conectar, compartir y colaborar por el bienestar de los animales. ¡Esperamos ver sus publicaciones pronto!',
                    'category' => 'Noticia',
                    'likes_count' => 350,
                    'comments_count' => 45,
                    'image_url' => 'https://picsum.photos/seed/post2/400/300',
                ],
                [
                    'content' => 'Consejo del día: ¿Sabías que el cepillado regular no solo mantiene el pelaje de tu mascota sano, sino que también fortalece su vínculo contigo? 🐕❤️',
                    'category' => 'Consejo',
                    'likes_count' => 88,
                    'comments_count' => 5,
                    'image_url' => 'https://picsum.photos/seed/post3/400/300',
                ],
                [
                    'content' => '🚨 ¡URGENTE! Busco hogar temporal para gatita rescatada. Es muy tranquila, está esterilizada y al día con sus vacunas. Solo necesita amor y cuidados básicos mientras encuentra su hogar definitivo. ¿Puedes ayudarla?',
                    'category' => 'Campaña',
                    'likes_count' => 67,
                    'comments_count' => 23,
                    'image_url' => 'https://picsum.photos/seed/post4/400/300',
                ],
                [
                    'content' => 'Recordatorio importante: Nunca dejes a tu mascota en el auto bajo el sol. En días calurosos, la temperatura interior puede ser mortal en pocos minutos. ¡La seguridad de nuestros peludos es primero! ☀️🐶',
                    'category' => 'Consejo',
                    'likes_count' => 234,
                    'comments_count' => 8,
                    'image_url' => 'https://picsum.photos/seed/post5/400/300',
                ],
                [
                    'content' => '¡Felicidades a todos los adoptantes del mes! Gracias por dar un hogar amoroso a estas mascotas. Cada adopción cambia una vida. 🏆🐾',
                    'category' => 'Noticia',
                    'likes_count' => 412,
                    'comments_count' => 67,
                    'image_url' => 'https://picsum.photos/seed/post6/400/300',
                ],
                [
                    'content' => '¿Conoces los beneficios de adoptar una mascota adulta? Son más tranquilas, ya están entrenadas y muchas veces pasan desapercibidas. ¡Ven y conoce a nuestros adultos maravillosos!',
                    'category' => 'Consejo',
                    'likes_count' => 156,
                    'comments_count' => 19,
                    'image_url' => 'https://picsum.photos/seed/post7/400/300',
                ],
                [
                    'content' => 'Campaña de vacunación gratuita este sábado. Protege a tu mascota contra enfermedades comunes. Cupos limitados, reserva tu cita ahora. 💉🐕',
                    'category' => 'Campaña',
                    'likes_count' => 298,
                    'comments_count' => 34,
                    'image_url' => 'https://picsum.photos/seed/post8/400/300',
                ],
                [
                    'content' => '¿Sabías que los gatos pueden saltar hasta 6 veces su altura? Pero lo más impresionante es su capacidad para dar amor incondicional. 🐱❤️',
                    'category' => 'Consejo',
                    'likes_count' => 203,
                    'comments_count' => 12,
                    'image_url' => 'https://picsum.photos/seed/post9/400/300',
                ],
                [
                    'content' => 'Nuevo refugio se une a nuestra red. ¡Bienvenidos! Juntos somos más fuertes en la lucha por los derechos de los animales. 🤝🐾',
                    'category' => 'Noticia',
                    'likes_count' => 178,
                    'comments_count' => 28,
                    'image_url' => 'https://picsum.photos/seed/post10/400/300',
                ],
                [
                    'content' => 'Buscamos voluntarios para jornada de limpieza en el parque. Ayúdanos a mantener los espacios limpios para nuestras mascotas. ¡Tu ayuda cuenta!',
                    'category' => 'Campaña',
                    'likes_count' => 89,
                    'comments_count' => 15,
                    'image_url' => 'https://picsum.photos/seed/post11/400/300',
                ],
                [
                    'content' => 'Recuerda: Las mascotas no eligen su familia, pero tú sí puedes elegir cambiar su vida para siempre adoptando. 🐶❤️',
                    'category' => 'Consejo',
                    'likes_count' => 267,
                    'comments_count' => 22,
                    'image_url' => 'https://picsum.photos/seed/post12/400/300',
                ],
                [
                    'content' => '¡Éxito total en nuestra feria de adopción! 15 mascotas encontraron hogar. Gracias a todos por participar. Próxima feria en 2 semanas.',
                    'category' => 'Noticia',
                    'likes_count' => 345,
                    'comments_count' => 41,
                    'image_url' => 'https://picsum.photos/seed/post13/400/300',
                ],
                [
                    'content' => 'Consejo veterinario: Revisa regularmente las orejas de tu mascota. La limpieza preventiva evita infecciones costosas. 👂�',
                    'category' => 'Consejo',
                    'likes_count' => 134,
                    'comments_count' => 9,
                    'image_url' => 'https://picsum.photos/seed/post14/400/300',
                ],
                [
                    'content' => 'Urgente: Necesitamos alimento para perros. Si puedes donar latas o bolsas, contáctanos. Cada contribución salva vidas. 🐕🍖',
                    'category' => 'Campaña',
                    'likes_count' => 76,
                    'comments_count' => 18,
                    'image_url' => 'https://picsum.photos/seed/post15/400/300',
                ],
            ];

            foreach ($posts as $index => $postData) {
                $userIndex = $index % $users->count();
                Post::firstOrCreate(
                    ['content' => $postData['content']],
                    array_merge($postData, ['user_id' => $users->skip($userIndex)->first()->id])
                );
            }
        }
    }
}
