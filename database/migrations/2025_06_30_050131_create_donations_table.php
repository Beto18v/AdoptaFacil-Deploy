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
        if (!Schema::hasTable('donations')) {
            Schema::create('donations', function (Blueprint $table) {
                $table->id();
                $table->string('donor_name');
                $table->string('donor_email');
                $table->decimal('amount', 10, 2);
                $table->foreignId('shelter_id')->nullable()->constrained()->onDelete('set null');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
