<!DOCTYPE html>
<html>
<head>
    <title>{{ $titulo }}</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1 { color: #333; }
        .info { margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>{{ $titulo }}</h1>
    <div class="info">
        <p><strong>Periodo:</strong> {{ $fechaInicio }} - {{ $fechaFin }}</p>
    </div>

    <h2>Datos Generales</h2>
    <table>
        <thead>
            <tr>
                <th>Indicador</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>
            @foreach($datosGenerales as $label => $value)
            <tr>
                <td>{{ $label }}</td>
                <td>{{ $value }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Motivos de Rechazo</h2>
    <table>
        <thead>
            <tr>
                <th>Motivo</th>
                <th>Cantidad</th>
            </tr>
        </thead>
        <tbody>
            @foreach($motivosRechazo as $motivo)
            <tr>
                <td>{{ $motivo['Motivo'] }}</td>
                <td>{{ $motivo['Cantidad'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
