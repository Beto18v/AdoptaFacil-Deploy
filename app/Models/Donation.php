<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'donor_name',
        'donor_email',
        'amount',
        'shelter_id',
        'description',
    ];

    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }

    /**
     * Verifica si la donación fue importada por un refugio
     */
    public function isImported(): bool
    {
        return $this->shelter_id !== null && $this->donor_email === null;
    }

    /**
     * Obtiene el nombre del donante (refugio si es importada, nombre directo si es normal)
     */
    public function getDonorDisplayName(): string
    {
        if ($this->isImported() && $this->shelter) {
            return $this->shelter->name ?? $this->donor_name;
        }
        return $this->donor_name;
    }
}
