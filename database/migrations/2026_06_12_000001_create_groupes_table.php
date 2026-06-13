<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groupes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('nom_fr', 100);
            $table->string('nom_ar', 100);
            $table->unsignedBigInteger('module_id');
            $table->foreign('module_id')->references('id')->on('module')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groupes');
    }
};
