<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('shelters')) {
            Schema::create('shelters', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('address')->nullable();
                $table->string('city')->nullable();
                $table->decimal('latitude', 10, 8)->nullable(); // Coordenadas consolidadas
                $table->decimal('longitude', 11, 8)->nullable();
                $table->string('phone')->nullable();
                $table->string('bank_name')->nullable();
                $table->enum('account_type', ['Ahorros', 'Corriente'])->nullable();
                $table->string('account_number')->nullable();
                $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Enlace con el usuario 'aliado'
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('shelters');
    }
};
