<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

/**
 * Modelo Mascota - Representa mascotas disponibles para adopción
 * 
 * Este modelo gestiona toda la información de mascotas en AdoptaFácil:
 * - Datos básicos (nombre, especie, raza, edad)
 * - Información de ubicación y contacto
 * - Sistema de múltiples imágenes
 * - Cálculo automático de edad basado en fecha de nacimiento
 * - Relaciones con usuario propietario
 * 
 * Características especiales:
 * - Actualización automática de edad al guardar
 * - Soporte para múltiples imágenes por mascota
 * - Validación de datos mediante Form Requests
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 */
class Mascota extends Model
{
    use HasFactory;

    /**
     * Campos asignables en masa
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'especie',
        'raza',
        'edad', // Almacenará años calculados automáticamente
        'fecha_nacimiento', // Campo principal para calcular edad
        'sexo',
        'ciudad',
        'descripcion',
        'imagen', // Imagen principal (compatibilidad)
        'user_id',
    ];

    /**
     * Campos que deben ser convertidos a tipos específicos
     */
    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    /**
     * Calcular y actualizar edad en años automáticamente al guardar
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
     * Obtener edad en años (desde la base de datos o calculada)
     */
    public function getEdadAnosAttribute(): int
    {
        if ($this->fecha_nacimiento) {
            return Carbon::parse($this->fecha_nacimiento)->diffInYears(Carbon::now());
        }

        return $this->edad ?? 0;
    }

    /**
     * Obtener edad en meses para cálculos detallados
     */
    public function getEdadMesesAttribute(): int
    {
        if ($this->fecha_nacimiento) {
            return Carbon::parse($this->fecha_nacimiento)->diffInMonths(Carbon::now());
        }

        return ($this->edad ?? 0) * 12; // Convertir años a meses aproximados
    }

    /**
     * Formato de edad legible con años y meses exactos
     */
    public function getEdadFormateadaAttribute(): string
    {
        if (!$this->fecha_nacimiento) {
            $años = $this->edad ?? 0;
            return $años === 1 ? "1 año" : "{$años} años";
        }

        $fechaNac = Carbon::parse($this->fecha_nacimiento);
        $ahora = Carbon::now();

        $años = $fechaNac->diffInYears($ahora);
        $meses = $fechaNac->copy()->addYears($años)->diffInMonths($ahora);

        if ($años > 0) {
            return $años === 1
                ? "1 año" . ($meses > 0 ? " y {$meses} " . ($meses === 1 ? "mes" : "meses") : "")
                : "{$años} años" . ($meses > 0 ? " y {$meses} " . ($meses === 1 ? "mes" : "meses") : "");
        }

        return $meses === 1 ? "1 mes" : "{$meses} meses";
    }

    /**
     * Relación: Mascota pertenece a un usuario (aliado)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación: Mascota tiene múltiples imágenes ordenadas
     */
    public function images(): HasMany
    {
        return $this->hasMany(MascotaImage::class)->orderBy('orden');
    }

    /**
     * Relación: Mascota puede estar en favoritos de múltiples usuarios
     */
    public function favoritos()
    {
        return $this->hasMany(Favorito::class);
    }

    /**
     * Relación many-to-many con usuarios que la han marcado como favorita
     */
    public function usuariosFavoritos()
    {
        return $this->belongsToMany(User::class, 'favoritos', 'mascota_id', 'user_id')
            ->withTimestamps();
    }
}
