<x-mail::message>
    <div style="text-align:center; margin-bottom: 16px;">
        <img src="{{ asset('Logo/LogoGreen.png') }}" alt="{{ config('app.name') }}" style="max-width: 180px; height: auto;" />
    </div>

    # ¡Hola {{ $user->name }}!

    ¡Bienvenido a AdoptaFácil! Estamos muy felices de que te hayas unido a nuestra comunidad.

    Ya puedes empezar a explorar las mascotas que buscan un hogar o publicar tus propias mascotas para adopción.

    <x-mail::panel>
        Explora el catálogo, guarda tus favoritas y conecta con refugios.
    </x-mail::panel>

    <x-mail::button :url="config('app.url') . '/dashboard'">
        Ir al Dashboard
    </x-mail::button>

    Gracias,<br>
    {{ config('app.name') }}
</x-mail::message>