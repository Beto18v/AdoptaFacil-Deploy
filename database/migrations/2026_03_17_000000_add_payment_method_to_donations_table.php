<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('donations') && ! Schema::hasColumn('donations', 'payment_method')) {
            Schema::table('donations', function (Blueprint $table) {
                $table->string('payment_method')->nullable()->after('amount');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('donations') && Schema::hasColumn('donations', 'payment_method')) {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropColumn('payment_method');
            });
        }
    }
};
