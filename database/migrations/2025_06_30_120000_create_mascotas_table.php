<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('mascotas')) {
            Schema::create('mascotas', function (Blueprint $table) {
                $table->id();
                $table->string('nombre');
                $table->string('especie');
                $table->string('raza')->nullable();
                $table->integer('edad')->nullable(); // Calculado automáticamente
                $table->date('fecha_nacimiento')->nullable(); // Campo principal para fecha
                $table->string('sexo');
                $table->string('ciudad');
                $table->text('descripcion')->nullable();
                $table->string('imagen')->nullable(); // Imagen principal para compatibilidad
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('mascotas');
    }
};
