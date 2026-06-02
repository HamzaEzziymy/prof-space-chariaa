<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etudiant', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('Nins', 255)->nullable();
            $table->string('CNE', 255)->nullable()->unique();
            $table->string('CIN', 255)->nullable()->unique();
            $table->string('nom_ar', 255)->nullable();
            $table->string('prenom_ar', 255)->nullable();
            $table->string('nom_fr', 255)->nullable();
            $table->string('prenom_fr', 255)->nullable();
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance', 255)->nullable();
            $table->enum('sexe', ['M', 'F'])->nullable();
            $table->string('telephone', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('photo_url', 255)->nullable();
            $table->string('filier', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etudiant');
    }
};
