<x-mail::message>
# ¡Hola {{ $user->name }}!

¡Bienvenido a AdoptaFácil! Estamos muy felices de que te hayas unido a nuestra comunidad.

Ya puedes empezar a explorar las mascotas que buscan un hogar o publicar tus propias mascotas para adopción.

<x-mail::button :url="config('app.url') . '/dashboard'">
Ir al Dashboard
</x-mail::button>

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
