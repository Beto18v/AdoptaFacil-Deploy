<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UserDeletionService
{
    /**
     * Soft-deletes the user after removing relational data that would otherwise
     * remain alive because the user model uses SoftDeletes.
     *
     * @return array<string, int>
     */
    public function delete(User $user): array
    {
        $avatarPath = $user->avatar;

        $summary = DB::transaction(function () use ($user) {
            $summary = $this->cleanupRelations($user);

            $user->delete();

            return $summary + ['users_deleted' => 1];
        });

        $this->deleteAvatar($avatarPath);

        return $summary;
    }

    /**
     * Removes data that depends on the user but should not survive a soft delete.
     *
     * @return array<string, int>
     */
    public function cleanupRelations(User $user): array
    {
        $shelter = $user->shelter;

        $summary = [
            'favoritos_deleted' => $user->favoritos()->count(),
            'solicitudes_deleted' => $user->solicitudes()->count(),
            'comments_deleted' => $user->comments()->count(),
            'post_likes_deleted' => $user->postLikes()->count(),
            'posts_deleted' => $user->posts()->withTrashed()->count(),
            'products_deleted' => $user->products()->count(),
            'mascotas_deleted' => $user->mascotas()->count(),
            'shelters_deleted' => $shelter ? 1 : 0,
            'donations_detached' => $shelter?->donations()->count() ?? 0,
            'tokens_deleted' => method_exists($user, 'tokens') ? $user->tokens()->count() : 0,
        ];

        $user->favoritos()->delete();
        $user->solicitudes()->delete();
        $user->comments()->delete();
        $user->postLikes()->delete();
        $user->posts()->withTrashed()->forceDelete();
        $user->products()->delete();
        $user->mascotas()->delete();

        if ($shelter) {
            Donation::query()
                ->where('shelter_id', $shelter->id)
                ->update(['shelter_id' => null]);

            $shelter->delete();
        }

        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        return $summary;
    }

    private function deleteAvatar(?string $avatarPath): void
    {
        if (!$avatarPath) {
            return;
        }

        Storage::disk('public')->delete($avatarPath);
    }
}
