<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('favoritos')) {
            Schema::create('favoritos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('mascota_id')->constrained('mascotas')->onDelete('cascade');
                $table->timestamps();

                // Evitar duplicados: un usuario no puede marcar la misma mascota como favorita múltiples veces
                $table->unique(['user_id', 'mascota_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favoritos');
    }
};
