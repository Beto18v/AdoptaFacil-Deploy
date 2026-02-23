<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crear tabla para almacenar múltiples imágenes por mascota
     * Permite hasta 3 imágenes por mascota con orden específico
     */
    public function up(): void
    {
        if (!Schema::hasTable('mascota_images')) {
            Schema::create('mascota_images', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('mascota_id'); // Referencia a la mascota
                $table->string('imagen_path'); // Ruta donde se guarda la imagen
                $table->integer('orden')->default(1); // Orden de visualización (1, 2, 3)
                $table->timestamps();

                // Eliminar mascota = eliminar sus imágenes automáticamente
                $table->foreign('mascota_id')->references('id')->on('mascotas')->onDelete('cascade');
                // Índice para búsquedas rápidas por mascota y orden
                $table->index(['mascota_id', 'orden']);
            });
        }
    }

    /**
     * Eliminar la tabla si se hace rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('mascota_images');
    }
};
