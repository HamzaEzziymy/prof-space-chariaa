<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('niveaux', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->foreignId('filiere_id')->nullable(false)->change();
            $table->unique(['code', 'filiere_id']);
        });

        Schema::table('semestres', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->unique(['code', 'niveau_id']);
        });
    }

    public function down(): void
    {
        Schema::table('niveaux', function (Blueprint $table) {
            $table->dropUnique(['code', 'filiere_id']);
            $table->foreignId('filiere_id')->nullable()->change();
            $table->unique(['code']);
        });

        Schema::table('semestres', function (Blueprint $table) {
            $table->dropUnique(['code', 'niveau_id']);
            $table->unique(['code']);
        });
    }
};
