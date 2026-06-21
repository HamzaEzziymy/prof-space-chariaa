<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Disable FK checks, drop the table, re-enable
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::dropIfExists('groupes');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        // Drop groupe_id FK and column from inscription_examen (if table still exists)
        if (Schema::hasTable('inscription_examen') && Schema::hasColumn('inscription_examen', 'groupe_id')) {
            Schema::table('inscription_examen', function (Blueprint $table) {
                try { $table->dropForeign('fk_ie_groupe'); } catch (\Exception $e) {}
                $table->dropColumn('groupe_id');
            });
        }

        // Add prof_id to module table
        if (!Schema::hasColumn('module', 'prof_id')) {
            Schema::table('module', function (Blueprint $table) {
                $table->unsignedBigInteger('prof_id')->nullable()->after('semestre_id');
                $table->foreign('prof_id')->references('id')->on('prof')->onDelete('set null');
            });
        }

        // Drop Groupe column from note_exam
        if (Schema::hasColumn('note_exam', 'Groupe')) {
            Schema::table('note_exam', function (Blueprint $table) {
                $table->dropColumn('Groupe');
            });
        }
    }

    public function down(): void
    {
        // Restore note_exam.Groupe
        if (!Schema::hasColumn('note_exam', 'Groupe')) {
            Schema::table('note_exam', function (Blueprint $table) {
                $table->string('Groupe', 255)->nullable();
            });
        }

        // Remove prof_id from module
        if (Schema::hasColumn('module', 'prof_id')) {
            Schema::table('module', function (Blueprint $table) {
                $table->dropForeign(['prof_id']);
                $table->dropColumn('prof_id');
            });
        }

        // Recreate groupes table
        Schema::create('groupes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('nom_fr', 100);
            $table->string('nom_ar', 100);
            $table->unsignedBigInteger('module_id');
            $table->unsignedBigInteger('prof_id')->nullable();
            $table->timestamps();
            $table->foreign('module_id')->references('id')->on('module')->onDelete('cascade');
            $table->foreign('prof_id')->references('id')->on('prof')->onDelete('set null');
        });

        // Restore groupe_id in inscription_examen (if table exists)
        if (Schema::hasTable('inscription_examen') && !Schema::hasColumn('inscription_examen', 'groupe_id')) {
            Schema::table('inscription_examen', function (Blueprint $table) {
                $table->unsignedBigInteger('groupe_id')->nullable()->after('etud_mod_id');
                $table->foreign('groupe_id', 'fk_ie_groupe')->references('id')->on('groupes')->onDelete('set null');
            });
        }
    }
};
