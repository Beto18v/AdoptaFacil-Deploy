<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
// Importa los modelos y sus policies
use App\Models\Mascota;
use App\Policies\MascotaPolicy;
use App\Models\Product;
use App\Policies\ProductPolicy;
use App\Models\Post;
use App\Policies\PostPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',

        // AÑADIMOS ESTAS LÍNEAS PARA REGISTRAR LOS POLICIES
        Mascota::class => MascotaPolicy::class,
        Product::class => ProductPolicy::class,
        Post::class => PostPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        //
    }
}
