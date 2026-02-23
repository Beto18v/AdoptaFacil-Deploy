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

    <h2>Detalle Mensual</h2>
    <table>
        <thead>
            <tr>
                <th>Mes</th>
                <th>Adopciones</th>
                <th>Rechazadas</th>
                <th>Tasa de Éxito</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tablaDetalle as $detalle)
            <tr>
                <td>{{ $detalle['Mes'] }}</td>
                <td>{{ $detalle['Adopciones'] }}</td>
                <td>{{ $detalle['Rechazadas'] }}</td>
                <td>{{ $detalle['Tasa de Éxito'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Distribución por Especie</h2>
    <table>
        <thead>
            <tr>
                <th>Especie</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
            </tr>
        </thead>
        <tbody>
            @foreach($distribucionEspecies as $especie)
            <tr>
                <td>{{ $especie['Especie'] }}</td>
                <td>{{ $especie['Cantidad'] }}</td>
                <td>{{ $especie['Porcentaje'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
