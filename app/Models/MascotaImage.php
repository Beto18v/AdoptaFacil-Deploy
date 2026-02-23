<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo MascotaImage - Almacena múltiples imágenes por mascota
 * Permite hasta 3 imágenes con orden específico de visualización
 */
class MascotaImage extends Model
{
    /**
     * Campos asignables en masa
     */
    protected $fillable = [
        'mascota_id',
        'imagen_path',
        'orden', // Orden de visualización (1, 2, 3)
    ];

    /**
     * Relación: Imagen pertenece a una mascota
     */
    public function mascota(): BelongsTo
    {
        return $this->belongsTo(Mascota::class);
    }
}
