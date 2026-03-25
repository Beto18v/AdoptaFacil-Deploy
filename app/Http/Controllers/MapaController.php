<?php

namespace App\Http\Controllers;

use App\Models\Shelter;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Controlador del modulo de mapas.
 * Consolida mascotas y refugios por ciudad usando el valor almacenado en el registro.
 */
class MapaController extends Controller
{
    /**
     * Muestra el mapa agrupando refugios por ciudad.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $especie = (string) Str::of((string) $request->query('especie'))
            ->trim()
            ->lower();

        $locationsData = Shelter::query()
            ->visible()
            ->with(['user.mascotas'])
            ->whereNotNull('city')
            ->get()
            ->map(function (Shelter $shelter) use ($especie) {
                $city = (string) Str::of((string) $shelter->city)->trim()->squish();

                if ($city === '') {
                    return null;
                }

                /** @var Collection<int, \App\Models\Mascota> $mascotas */
                $mascotas = $shelter->user?->mascotas ?? collect();

                if ($especie !== '') {
                    $mascotas = $mascotas->filter(
                        fn ($mascota) => Str::lower((string) $mascota->especie) === $especie,
                    );
                }

                if ($mascotas->isEmpty()) {
                    return null;
                }

                return [
                    'city' => $city,
                    'count' => $mascotas->count(),
                    'lat' => $shelter->latitude !== null ? (float) $shelter->latitude : null,
                    'lng' => $shelter->longitude !== null ? (float) $shelter->longitude : null,
                    'address' => $shelter->address ? (string) Str::of($shelter->address)->trim()->squish() : null,
                    'shelter_id' => $shelter->id,
                    'shelter_name' => $shelter->name,
                ];
            })
            ->filter()
            ->groupBy('city')
            ->map(function (Collection $group, string $city) {
                $locationsWithCoordinates = $group->filter(
                    fn ($item) => $item['lat'] !== null && $item['lng'] !== null,
                );

                if ($locationsWithCoordinates->isNotEmpty()) {
                    $lat = round((float) $locationsWithCoordinates->avg('lat'), 6);
                    $lng = round((float) $locationsWithCoordinates->avg('lng'), 6);
                } else {
                    ['lat' => $lat, 'lng' => $lng] = $this->fallbackCoordinates($city);
                }

                $addresses = $group
                    ->pluck('address')
                    ->filter()
                    ->unique()
                    ->values();

                $shelterDetails = $group
                    ->unique('shelter_id')
                    ->map(fn ($item) => [
                        'id' => (string) $item['shelter_id'],
                        'name' => $item['shelter_name'],
                        'address' => $item['address'],
                    ])
                    ->values();

                return [
                    'id' => 'city-'.Str::slug($city),
                    'city' => $city,
                    'count' => $group->sum('count'),
                    'shelters' => $group->pluck('shelter_id')->unique()->count(),
                    'lat' => $lat,
                    'lng' => $lng,
                    'address' => $addresses->first(),
                    'addresses' => $addresses->all(),
                    'shelterDetails' => $shelterDetails->all(),
                ];
            })
            ->sortByDesc('count')
            ->values();

        return Inertia::render('Dashboard/Mapa/index', [
            'locations' => $locationsData->toArray(),
            'totalMascotas' => (int) $locationsData->sum('count'),
            'totalCiudades' => $locationsData->count(),
        ]);
    }

    /**
     * @return array{lat: float, lng: float}
     */
    private function fallbackCoordinates(string $city): array
    {
        $coordinates = [
            'Bogotá' => ['lat' => 4.6097, 'lng' => -74.0817],
            'Medellín' => ['lat' => 6.2476, 'lng' => -75.5658],
            'Barranquilla' => ['lat' => 10.9685, 'lng' => -74.7813],
            'Cartagena' => ['lat' => 10.3932, 'lng' => -75.4832],
            'Bucaramanga' => ['lat' => 7.1193, 'lng' => -73.1227],
            'Pereira' => ['lat' => 4.8133, 'lng' => -75.6961],
            'Santa Marta' => ['lat' => 11.2408, 'lng' => -74.2099],
            'Manizales' => ['lat' => 5.0703, 'lng' => -75.5138],
            'Ibagué' => ['lat' => 4.4389, 'lng' => -75.2322],
            'Cali' => ['lat' => 3.4516, 'lng' => -76.5320],
        ];

        return $coordinates[$city] ?? ['lat' => 4.6097, 'lng' => -74.0817];
    }
}
