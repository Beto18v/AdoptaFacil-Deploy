<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

/**
 * DescripcionMascotaController - API para generar descripciones con IA
 * 
 * Este controlador actúa como proxy entre la aplicación Laravel y el 
 * microservicio FastAPI que genera descripciones emocionales de mascotas
 * usando diferentes APIs de inteligencia artificial.
 * 
 * Funcionalidades principales:
 * - Generación de descripciones persuasivas para adopción
 * - Comunicación con microservicio FastAPI externo
 * - Verificación del estado del servicio de IA
 * - Manejo de errores y timeouts
 * - Logging de operaciones para debugging
 * 
 * Microservicio conectado: pet-detail-service (Puerto 8001)
 * APIs de IA soportadas: Groq, OpenAI, DeepSeek
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 */
class DescripcionMascotaController extends Controller
{
    private $petDetailServiceUrl;
    private $client;

    public function __construct()
    {
        $this->petDetailServiceUrl = env('PET_DETAIL_SERVICE_URL', 'http://localhost:8001');
        $this->client = new Client([
            'timeout' => 30,
            'connect_timeout' => 10,
        ]);
    }

    /**
     * Genera una descripción emocional para una mascota usando IA
     * 
     * Envía los datos de la mascota al microservicio FastAPI que utiliza
     * diferentes proveedores de IA para generar una descripción persuasiva
     * en primera persona desde la perspectiva de la mascota.
     * 
     * @param Request $request Datos de la mascota (nombre, especie, raza, etc.)
     * @return \Illuminate\Http\JsonResponse Descripción generada o error
     */
    public function generarDescripcion(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'especie' => 'required|string|max:100',
            'raza' => 'nullable|string|max:100',
            'sexo' => 'nullable|string|max:10',
            'ciudad' => 'nullable|string|max:100',
            'descripcion_actual' => 'nullable|string|max:1000',
        ]);

        try {
            Log::info('Generando descripción para mascota', [
                'nombre' => $request->nombre,
                'especie' => $request->especie
            ]);

            // Preparar datos para el microservicio
            $mascotaData = [
                'nombre' => $request->nombre,
                'especie' => ucfirst($request->especie),
                'raza' => $request->raza ?: 'Mestiza',
                'sexo' => ucfirst($request->sexo) ?: 'Macho',
                'personalidad' => $request->descripcion_actual ?: 'Mascota cariñosa y sociable',
                'salud' => 'En buen estado de salud',
                'observaciones' => $this->construirObservaciones($request),
                'descripcion_actual' => $request->descripcion_actual ?: '',
            ];

            $response = $this->client->post($this->petDetailServiceUrl . '/generar-descripcion', [
                'json' => $mascotaData,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ]
            ]);

            $data = json_decode($response->getBody(), true);

            Log::info('Descripción generada exitosamente');

            return response()->json([
                'success' => true,
                'descripcion' => $data['descripcion'],
                'mensaje' => 'Descripción generada exitosamente'
            ]);
        } catch (RequestException $e) {
            Log::error('Error al conectar con el servicio de descripciones', [
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ]);

            return response()->json([
                'success' => false,
                'mensaje' => 'Error al generar descripción. Verifica que el microservicio esté activo.',
                'error' => 'Servicio de IA no disponible'
            ], 503);
        } catch (\Exception $e) {
            Log::error('Error inesperado al generar descripción', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'mensaje' => 'Error interno del servidor',
                'error' => 'Error inesperado'
            ], 500);
        }
    }

    /**
     * Construir observaciones basadas en los datos disponibles
     */
    private function construirObservaciones(Request $request): string
    {
        $observaciones = [];

        if ($request->sexo) {
            $genero = $request->sexo === 'Macho' ? 'Es un' : 'Es una';
            $observaciones[] = $genero . ' ' . strtolower($request->especie);
        }

        if ($request->ciudad) {
            $observaciones[] = "Ubicado en " . $request->ciudad;
        }

        if (empty($observaciones)) {
            $observaciones[] = "Busca una familia amorosa";
        }

        return implode('. ', $observaciones);
    }

    /**
     * Verifica el estado del servicio de descripciones
     */
    public function verificarServicio()
    {
        try {
            $response = $this->client->get($this->petDetailServiceUrl . '/health', [
                'timeout' => 5
            ]);

            $data = json_decode($response->getBody(), true);

            return response()->json([
                'success' => true,
                'servicio_activo' => true,
                'api_provider' => $data['api_provider'] ?? 'unknown',
                'model' => $data['model'] ?? 'unknown',
                'mensaje' => 'Servicio de descripciones disponible'
            ]);
        } catch (RequestException $e) {
            return response()->json([
                'success' => false,
                'servicio_activo' => false,
                'mensaje' => 'Servicio de descripciones no disponible',
                'error' => $e->getMessage()
            ], 503);
        }
    }
}
