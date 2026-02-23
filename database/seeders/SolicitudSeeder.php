<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Solicitud;
use App\Models\User;
use App\Models\Mascota;

/**
 * SolicitudSeeder - Seeder para poblar la base de datos con solicitudes de adopción
 *
 * Este seeder crea solicitudes de adopción con diferentes estados y variantes:
 * - Solicitudes pendientes, aprobadas y rechazadas
 * - Datos variados en los formularios
 * - Diferentes tipos de vivienda y situaciones familiares
 *
 * Las solicitudes se crean solo si existen usuarios y mascotas.
 */
class SolicitudSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'cliente')->get(); // Solo clientes pueden hacer solicitudes
        $mascotas = Mascota::all();

        if ($users->count() > 0 && $mascotas->count() > 0) {
            $estados = ['Enviada', 'En Proceso', 'Aprobada', 'Rechazada', 'Cancelada'];
            $tiposVivienda = ['Casa', 'Apartamento', 'Finca'];
            $propiedades = ['Propia', 'Arrendada', 'Familiar'];
            $razones = [
                'Buscar compañía',
                'Regalo para la familia',
                'Proteger el hogar',
                'Terapia emocional',
                'Amor por los animales',
                'Primera mascota'
            ];

            // Crear solicitudes para diferentes mascotas
            foreach ($mascotas->take(20) as $mascota) { // Limitar a 20 solicitudes
                $user = $users->random();
                $estado = $estados[array_rand($estados)];
                $tipoVivienda = $tiposVivienda[array_rand($tiposVivienda)];
                $propiedad = $propiedades[array_rand($propiedades)];
                $tienePatio = rand(0, 1);
                $hayNinos = rand(0, 1);
                $tieneOtrasMascotas = rand(0, 1);
                $tuvoAntes = rand(0, 1);

                Solicitud::create([
                    'user_id' => $user->id,
                    'mascota_id' => $mascota->id,
                    'nombre_completo' => $user->name,
                    'cedula' => rand(10000000, 99999999),
                    'email' => $user->email,
                    'telefono' => '3' . rand(100000000, 999999999),
                    'direccion_ciudad' => 'Bogotá',
                    'direccion_barrio' => 'Centro',
                    'direccion_postal' => '110111',
                    'tipo_vivienda' => $tipoVivienda,
                    'propiedad_vivienda' => $propiedad,
                    'tiene_patio' => $tienePatio,
                    'permiten_mascotas_alquiler' => $propiedad === 'Arrendada' ? rand(0, 1) : null,
                    'cantidad_convivientes' => rand(1, 6),
                    'hay_ninos' => $hayNinos,
                    'edades_ninos' => $hayNinos ? '5, 8, 12' : null,
                    'todos_acuerdo_adopcion' => rand(0, 1),
                    'tiene_otras_mascotas' => $tieneOtrasMascotas,
                    'otras_mascotas_detalles' => $tieneOtrasMascotas ? 'Un perro y dos gatos' : null,
                    'tuvo_mascotas_antes' => $tuvoAntes,
                    'que_paso_mascotas_anteriores' => $tuvoAntes ? 'Viven con la familia' : null,
                    'porque_adopta' => $razones[array_rand($razones)],
                    'que_espera_convivencia' => 'Una convivencia armoniosa y llena de amor',
                    'que_haria_problemas_comportamiento' => 'Buscar ayuda profesional y dar tiempo de adaptación',
                    'acepta_visitas_seguimiento' => rand(0, 1),
                    'acepta_proceso_evaluacion' => rand(0, 1),
                    'acepta_cuidado_responsable' => rand(0, 1),
                    'acepta_contrato_adopcion' => rand(0, 1),
                    'estado' => $estado,
                ]);
            }
        }
    }
}
