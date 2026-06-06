<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('module', function (Blueprint $table) {
            $table->foreignId('semestre_id')->nullable()->after('prof_id')->constrained('semestres')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('module', function (Blueprint $table) {
            $table->dropForeign(['semestre_id']);
            $table->dropColumn('semestre_id');
        });
    }
};
