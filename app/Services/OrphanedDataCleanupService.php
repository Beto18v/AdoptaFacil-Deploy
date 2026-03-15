<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Donation;
use App\Models\Favorito;
use App\Models\Mascota;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\Product;
use App\Models\Shelter;
use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrphanedDataCleanupService
{
    public function __construct(
        private readonly UserDeletionService $userDeletionService,
    ) {}

    /**
     * @return array{before: array<string, int>, after: array<string, int>, dry_run: bool}
     */
    public function cleanup(bool $dryRun = false): array
    {
        $before = $this->audit();

        if ($dryRun) {
            return [
                'before' => $before,
                'after' => $before,
                'dry_run' => true,
            ];
        }

        $avatarsToDelete = [];

        DB::transaction(function () use (&$avatarsToDelete) {
            User::onlyTrashed()
                ->orderBy('id')
                ->chunkById(100, function ($users) use (&$avatarsToDelete) {
                    foreach ($users as $user) {
                        if ($user->avatar) {
                            $avatarsToDelete[] = $user->avatar;
                        }

                        $this->userDeletionService->cleanupRelations($user);
                    }
                });

            Donation::query()
                ->whereNotNull('shelter_id')
                ->whereDoesntHave('shelter')
                ->update(['shelter_id' => null]);

            Shelter::query()->doesntHave('user')->delete();
            Product::query()->doesntHave('user')->delete();
            Mascota::query()->doesntHave('user')->delete();
            Comment::query()->doesntHave('user')->delete();
            PostLike::query()->doesntHave('user')->delete();
            Favorito::query()->doesntHave('user')->delete();
            Favorito::query()->doesntHave('mascota')->delete();
            Solicitud::query()->doesntHave('user')->delete();
            Solicitud::query()->doesntHave('mascota')->delete();
            Post::query()->withTrashed()->whereDoesntHave('user')->forceDelete();
        });

        foreach (array_unique($avatarsToDelete) as $avatarPath) {
            Storage::disk('public')->delete($avatarPath);
        }

        return [
            'before' => $before,
            'after' => $this->audit(),
            'dry_run' => false,
        ];
    }

    /**
     * @return array<string, int>
     */
    public function audit(): array
    {
        return [
            'shelters_without_active_user' => Shelter::query()->doesntHave('user')->count(),
            'mascotas_without_active_user' => Mascota::query()->doesntHave('user')->count(),
            'products_without_active_user' => Product::query()->doesntHave('user')->count(),
            'comments_without_active_user' => Comment::query()->doesntHave('user')->count(),
            'post_likes_without_active_user' => PostLike::query()->doesntHave('user')->count(),
            'favoritos_without_active_user' => Favorito::query()->doesntHave('user')->count(),
            'favoritos_without_mascota' => Favorito::query()->doesntHave('mascota')->count(),
            'solicitudes_without_active_user' => Solicitud::query()->doesntHave('user')->count(),
            'solicitudes_without_mascota' => Solicitud::query()->doesntHave('mascota')->count(),
            'posts_without_user_row' => Post::query()->withTrashed()->whereDoesntHave('user')->count(),
            'donations_with_missing_shelter' => Donation::query()
                ->whereNotNull('shelter_id')
                ->whereDoesntHave('shelter')
                ->count(),
        ];
    }
}
