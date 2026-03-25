<?php

use App\Models\Mascota;
use Carbon\Carbon;

afterEach(function () {
    Carbon::setTestNow();
});

test('formats pet age with years months and days when birth date is available', function () {
    Carbon::setTestNow('2026-03-25');

    $mascota = new Mascota([
        'fecha_nacimiento' => '2024-01-10',
    ]);

    expect($mascota->edad_formateada)->toBe('2 años, 2 meses y 15 días');
});

test('formats pet age with months and days when it has not reached one year', function () {
    Carbon::setTestNow('2026-03-25');

    $mascota = new Mascota([
        'fecha_nacimiento' => '2025-12-10',
    ]);

    expect($mascota->edad_formateada)->toBe('3 meses y 15 días');
});

test('formats pet age with days only when it has not reached one month', function () {
    Carbon::setTestNow('2026-03-25');

    $mascota = new Mascota([
        'fecha_nacimiento' => '2026-03-05',
    ]);

    expect($mascota->edad_formateada)->toBe('20 días');
});

test('formats legacy numeric age values without exposing decimal years', function () {
    $mascota = new Mascota([
        'edad' => 1.958904109589,
    ]);

    expect($mascota->edad_formateada)->toBe('1 año, 11 meses y 20 días');
});
