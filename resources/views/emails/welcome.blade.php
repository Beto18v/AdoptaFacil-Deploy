<!doctype html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a {{ config('app.name') }}</title>
</head>

<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif; color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; padding:24px;">
                    <tr>
                        <td align="center" style="padding-bottom:16px;">
                            <img src="{{ url('Logo/LogoGreen.png') }}" alt="{{ config('app.name') }}" style="max-width:180px; height:auto; border:0;" />
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size:24px; font-weight:700; line-height:1.3; padding-bottom:16px;">
                            ¡Hola {{ $user->name }}!
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size:16px; line-height:1.6; padding-bottom:12px;">
                            ¡Bienvenido a AdoptaFácil! Estamos muy felices de que te hayas unido a nuestra comunidad.
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size:16px; line-height:1.6; padding-bottom:16px;">
                            Ya puedes empezar a explorar las mascotas que buscan un hogar o publicar tus propias mascotas para adopción.
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f3f4f6; border-radius:6px; padding:12px 16px; font-size:15px; line-height:1.5; color:#374151;">
                            Explora el catálogo, guarda tus favoritas y conecta con refugios.
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top:24px; padding-bottom:16px;">
                            <a href="{{ url('/dashboard') }}" style="display:inline-block; background:#16a34a; color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; padding:12px 20px; border-radius:6px;">
                                Ir al Dashboard
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size:14px; color:#6b7280; line-height:1.5; padding-top:8px;">
                            Gracias,<br>
                            {{ config('app.name') }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>