<?php

namespace App\Policies;

use App\Models\Mascota;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class MascotaPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Mascota $mascota): bool
    {
        // Permite ver si el usuario es admin o el aliado propietario
        return $user->role === 'admin' || $user->id === $mascota->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Mascota $mascota): bool
    {
        // Permite actualizar si el usuario es admin o el aliado propietario
        return $user->role === 'admin' || $user->id === $mascota->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Mascota $mascota): bool
    {
        // Permite eliminar si el usuario es 'admin' O si es el 'aliado' que creó la mascota.
        return $user->role === 'admin' || $user->id === $mascota->user_id;
    }
}
