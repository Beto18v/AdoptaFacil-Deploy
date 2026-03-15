<?php

// Console Commands para AdoptaFácil
// Aquí se pueden definir comandos Artisan personalizados para el proyecto

use App\Services\OrphanedDataCleanupService;
use Illuminate\Support\Facades\Artisan;

Artisan::command('adoptafacil:cleanup-orphans {--dry-run : Solo audita, sin modificar datos}', function () {
    $result = app(OrphanedDataCleanupService::class)->cleanup(
        dryRun: (bool) $this->option('dry-run'),
    );

    $this->info($result['dry_run']
        ? 'Auditoria completada. No se modifica ningun dato.'
        : 'Limpieza completada.');

    $rows = collect($result['before'])
        ->keys()
        ->map(fn(string $metric) => [
            'metric' => $metric,
            'before' => $result['before'][$metric],
            'after' => $result['after'][$metric],
        ])
        ->all();

    $this->table(['Metric', 'Before', 'After'], $rows);
})->purpose('Audita y limpia datos huérfanos dejados por borrados incompletos de usuarios o refugios');
