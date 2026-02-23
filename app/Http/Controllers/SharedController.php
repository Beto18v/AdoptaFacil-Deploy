<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\SharedLink;
use App\Models\Post;
use Inertia\Inertia;

/**
 * SharedController - Controlador del módulo de enlaces compartidos
 * 
 * Este controlador gestiona el sistema de compartir contenido de la comunidad:
 * - Generación de enlaces únicos para publicaciones específicas
 * - Visualización pública de posts compartidos sin autenticación
 * - Gestión de tokens temporales con expiración configurable
 * - Tracking de clicks y estadísticas de compartido
 * - Validación de enlaces activos y caducidad
 * 
 * Funcionalidades principales:
 * - Creación de enlaces únicos con tokens seguros
 * - Reutilización de enlaces existentes válidos
 * - Vista pública optimizada para redes sociales
 * - Conteo de accesos y estadísticas de uso
 * - Manejo de enlaces expirados y errores 404
 * - Integración con meta tags para sharing social
 * 
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 * @package App\Http\Controllers
 */
class SharedController extends Controller
{
    /**
     * Genera un enlace único para compartir una publicación
     * 
     * @param Request $request
     * @param int $id ID de la publicación
     * @return \Illuminate\Http\JsonResponse
     */
    public function create(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        // Verificar si ya existe un enlace compartido para este post
        $existingLink = SharedLink::where('post_id', $post->id)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingLink) {
            $shareUrl = url("/shared/{$existingLink->token}");
            return response()->json([
                'success' => true,
                'url' => $shareUrl,
                'token' => $existingLink->token
            ]);
        }

        // Generar token único
        $token = Str::random(32);

        // Crear enlace compartido
        $sharedLink = SharedLink::create([
            'post_id' => $post->id,
            'token' => $token,
            'expires_at' => now()->addDays(30), // Expira en 30 días
        ]);

        $shareUrl = url("/shared/{$token}");

        return response()->json([
            'success' => true,
            'url' => $shareUrl,
            'token' => $token
        ]);
    }

    /**
     * Muestra una publicación a través de un enlace compartido
     * 
     * @param string $token Token único del enlace compartido
     * @return \Inertia\Response
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function show($token)
    {
        $sharedLink = SharedLink::where('token', $token)
            ->where('expires_at', '>', now())
            ->with(['post.user'])
            ->firstOrFail();

        return Inertia::render('Shared/PostShow', [
            'post' => $sharedLink->post,
            'sharedLink' => $sharedLink
        ]);
    }
}
