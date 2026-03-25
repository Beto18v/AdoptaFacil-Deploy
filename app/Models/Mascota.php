<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo de mascotas publicadas.
 * Centraliza atributos, relaciones y calculos derivados como la edad.
 */
class Mascota extends Model
{
    use HasFactory;

    /**
     * Accesores expuestos en respuestas JSON.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'edad_formateada',
    ];

    /**
     * Campos asignables en masa
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'especie',
        'raza',
        'edad',
        'fecha_nacimiento',
        'sexo',
        'ciudad',
        'descripcion',
        'imagen',
        'user_id',
    ];

    /**
     * Campos que deben ser convertidos a tipos especificos
     *
     * @var array<string, string>
     */
    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    /**
     * Calcular y actualizar edad en anos automaticamente al guardar
     */
    protected static function booted()
    {
        static::saving(function ($mascota) {
            if ($mascota->fecha_nacimiento) {
                $mascota->edad = (int) Carbon::parse($mascota->fecha_nacimiento)->diffInYears(Carbon::now());
            }
        });
    }

    /**
     * Obtener edad en anos desde la base de datos o calculada
     */
    public function getEdadAnosAttribute(): int
    {
        if ($this->fecha_nacimiento) {
            return Carbon::parse($this->fecha_nacimiento)->diffInYears(Carbon::now());
        }

        return (int) ($this->edad ?? 0);
    }

    /**
     * Obtener edad en meses para calculos detallados
     */
    public function getEdadMesesAttribute(): int
    {
        if ($this->fecha_nacimiento) {
            return Carbon::parse($this->fecha_nacimiento)->diffInMonths(Carbon::now());
        }

        return (int) round(((float) ($this->edad ?? 0)) * 12);
    }

    /**
     * Formato de edad legible con anos, meses y dias.
     */
    public function getEdadFormateadaAttribute(): string
    {
        if ($this->fecha_nacimiento) {
            $birthDate = Carbon::parse($this->fecha_nacimiento)->startOfDay();
            $today = Carbon::now()->startOfDay();

            if ($birthDate->greaterThan($today)) {
                return 'Edad no disponible';
            }

            $difference = $birthDate->diff($today);

            return $this->formatAgeParts($difference->y, $difference->m, $difference->d);
        }

        if ($this->edad === null || $this->edad === '' || !is_numeric($this->edad)) {
            return 'Edad no especificada';
        }

        return $this->formatApproximateAgeFromYears((float) $this->edad);
    }

    private function formatApproximateAgeFromYears(float $ageInYears): string
    {
        if ($ageInYears < 0) {
            return 'Edad no disponible';
        }

        $totalDays = max(0, (int) round($ageInYears * 365));
        $years = intdiv($totalDays, 365);
        $remainingDays = $totalDays % 365;
        $months = intdiv($remainingDays, 30);
        $days = $remainingDays % 30;

        return $this->formatAgeParts($years, $months, $days);
    }

    private function formatAgeParts(int $years, int $months, int $days): string
    {
        $parts = [];

        if ($years > 0) {
            $parts[] = $years === 1 ? '1 año' : "{$years} años";
        }

        if ($months > 0) {
            $parts[] = $months === 1 ? '1 mes' : "{$months} meses";
        }

        if ($days > 0) {
            $parts[] = $days === 1 ? '1 día' : "{$days} días";
        }

        if ($parts === []) {
            return 'Recién nacido';
        }

        if (count($parts) === 1) {
            return $parts[0];
        }

        if (count($parts) === 2) {
            return implode(' y ', $parts);
        }

        return implode(', ', array_slice($parts, 0, -1)).' y '.$parts[array_key_last($parts)];
    }

    /**
     * Relacion: Mascota pertenece a un usuario aliado
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relacion: Mascota tiene multiples imagenes ordenadas
     */
    public function images(): HasMany
    {
        return $this->hasMany(MascotaImage::class)->orderBy('orden');
    }

    /**
     * Relacion: Mascota puede estar en favoritos de multiples usuarios
     */
    public function favoritos()
    {
        return $this->hasMany(Favorito::class);
    }

    /**
     * Relacion many-to-many con usuarios que la han marcado como favorita
     */
    public function usuariosFavoritos()
    {
        return $this->belongsToMany(User::class, 'favoritos', 'mascota_id', 'user_id')
            ->withTimestamps();
    }
}
