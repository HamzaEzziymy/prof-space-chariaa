<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('email', 255)->nullable();
            $table->string('password', 255)->nullable();
            $table->string('nom_ar', 255)->nullable();
            $table->string('prenom_ar', 255)->nullable();
            $table->string('nom_fr', 255)->nullable();
            $table->string('prenom_fr', 255)->nullable();
            $table->enum('role', ['admin', 'prof', 'super_admin'])->nullable();
            $table->bigInteger('new_column')->nullable();
            $table->bigInteger('photo_profile_url')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user');
    }
};
