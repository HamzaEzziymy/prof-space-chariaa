<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('etudiant', function (Blueprint $table) {
            $table->foreignId('niveau_id')->nullable()->constrained('niveaux')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('etudiant', function (Blueprint $table) {
            $table->dropConstrainedForeignId('niveau_id');
        });
    }
};
