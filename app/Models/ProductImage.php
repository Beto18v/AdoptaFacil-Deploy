<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo ProductImage - Almacena múltiples imágenes por producto
 * Permite hasta 3 imágenes con orden específico de visualización
 */
class ProductImage extends Model
{
    /**
     * Campos asignables en masa
     */
    protected $fillable = [
        'product_id',
        'image_path',
        'order', // Orden de visualización (1, 2, 3)
    ];

    /**
     * Relación: Imagen pertenece a un producto
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
