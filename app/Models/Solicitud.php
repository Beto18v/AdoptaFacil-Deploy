<?php
// app/Models/Solicitud.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Solicitud extends Model
{
    use HasFactory;

    protected $table = 'solicitudes';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    // Definimos todos los campos que se pueden guardar
    protected $fillable = [
        'user_id',
        'mascota_id',
        'nombre_completo',
        'cedula',
        'email',
        'telefono',
        'direccion_ciudad',
        'direccion_barrio',
        'direccion_postal',
        'tipo_vivienda',
        'propiedad_vivienda',
        'tiene_patio',
        'permiten_mascotas_alquiler',
        'cantidad_convivientes',
        'hay_ninos',
        'edades_ninos',
        'todos_acuerdo_adopcion',
        'tiene_otras_mascotas',
        'otras_mascotas_detalles',
        'tuvo_mascotas_antes',
        'que_paso_mascotas_anteriores',
        'porque_adopta',
        'que_espera_convivencia',
        'que_haria_problemas_comportamiento',
        'acepta_visitas_seguimiento',
        'acepta_proceso_evaluacion',
        'acepta_cuidado_responsable',
        'acepta_contrato_adopcion',
        'estado',
        'comentario_rechazo',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mascota(): BelongsTo
    {
        // Asegúrate de que tu modelo se llame 'Mascota'
        return $this->belongsTo(Mascota::class);
    }
}
