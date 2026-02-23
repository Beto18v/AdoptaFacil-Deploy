<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('shared_links')) {
            Schema::create('shared_links', function (Blueprint $table) {
                $table->id();
                // Solo agregar la clave foránea si la tabla posts existe
                if (Schema::hasTable('posts')) {
                    $table->unsignedBigInteger('post_id');
                    $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
                } else {
                    $table->unsignedBigInteger('post_id');
                }
                $table->string('token', 32)->unique();
                $table->timestamp('expires_at');
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('shared_links');
    }
};
