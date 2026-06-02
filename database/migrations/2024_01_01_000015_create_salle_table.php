<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salle', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nomSalle_ar', 255)->nullable();
            $table->string('nomSalle_fr', 255)->nullable();
            $table->string('code_salle', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salle');
    }
};
