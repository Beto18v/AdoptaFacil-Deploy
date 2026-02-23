<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PostPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Cualquier usuario (incluso sin autenticar) puede ver los posts
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Post $post): bool
    {
        // Cualquier usuario puede ver un post activo
        return $post->is_active;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Solo usuarios autenticados pueden crear posts
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Post $post): bool
    {
        // Solo el autor del post puede editarlo
        return $user->id === $post->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Post $post): bool
    {
        // Solo el autor del post o admin pueden eliminarlo
        return $user->id === $post->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Post $post): bool
    {
        // Solo admins pueden restaurar posts
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Post $post): bool
    {
        // Solo admins pueden eliminar permanentemente
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can like the post.
     */
    public function like(User $user, Post $post): bool
    {
        // Solo usuarios autenticados pueden dar like
        return true;
    }
}
