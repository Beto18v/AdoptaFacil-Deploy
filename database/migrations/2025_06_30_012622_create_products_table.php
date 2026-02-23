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
        if (!Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // Cambiar de 'nombre' a 'name' para consistencia
                $table->text('description')->nullable(); // Cambiar de 'descripcion' a 'description'
                $table->decimal('price', 10, 2); // Cambiar de 'precio' a 'price'
                $table->integer('stock')->default(0); // Campo de stock consolidado
                $table->string('imagen')->nullable(); // Imagen principal para compatibilidad
                $table->unsignedBigInteger('user_id');
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
