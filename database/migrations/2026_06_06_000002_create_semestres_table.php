<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('semestres', function (Blueprint $table) {
            $table->id();
            $table->string('code', 5)->unique();
            $table->string('nom_fr', 50);
            $table->string('nom_ar', 50);
            $table->foreignId('niveau_id')->constrained('niveaux')->cascadeOnDelete();
            $table->integer('numero');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('semestres');
    }
};
