<!doctype html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine }}</title>
</head>

<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif; color:#111827;">
    @php
        $greetingName = $recipientName ?: ($user->name ?? null);
    @endphp
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
                            Hola{{ $greetingName ? ' ' . $greetingName : '' }},
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size:16px; line-height:1.6; padding-bottom:12px;">
                            {{ $subjectLine }}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size:16px; line-height:1.6; padding-bottom:16px;">
                            {!! nl2br(e($messageBody)) !!}
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f3f4f6; border-radius:6px; padding:12px 16px; font-size:15px; line-height:1.5; color:#374151;">
                            Gracias por seguir conectado con {{ config('app.name') }}.
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top:24px; padding-bottom:16px;">
                            <a href="{{ url('/') }}" style="display:inline-block; background:#16a34a; color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; padding:12px 20px; border-radius:6px;">
                                Visitar {{ config('app.name') }}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size:14px; line-height:1.6; color:#6b7280;">
                            Este mensaje fue enviado por el equipo de {{ config('app.name') }}.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
