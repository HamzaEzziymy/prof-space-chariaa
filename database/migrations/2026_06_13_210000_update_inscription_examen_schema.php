<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop old FKs
        Schema::table('inscription_examen', function (Blueprint $table) {
            try { $table->dropForeign('fk_ie_etud_mod'); } catch (\Exception $e) {}
            try { $table->dropForeign('fk_ie_salle'); } catch (\Exception $e) {}
        });

        // Add new columns if they don't exist
        if (!Schema::hasColumn('inscription_examen', 'module_id')) {
            Schema::table('inscription_examen', function (Blueprint $table) {
                $table->unsignedBigInteger('module_id')->nullable()->after('id');
                $table->unsignedBigInteger('etudiant_id')->nullable()->after('module_id');
                $table->string('statut', 20)->nullable()->after('etudiant_id');
            });
        }

        // Migrate data from etud_mod_id → (module_id, etudiant_id)
        DB::statement('
            UPDATE inscription_examen ie
            JOIN etudiant_module em ON em.id = ie.etud_mod_id
            SET ie.module_id = em.module_id,
                ie.etudiant_id = em.etudiant_id
            WHERE ie.module_id IS NULL
        ');

        // Clean up bad data
        DB::statement('DELETE FROM inscription_examen WHERE module_id IS NULL OR etudiant_id IS NULL');

        // Add new FKs
        Schema::table('inscription_examen', function (Blueprint $table) {
            try {
                $table->foreign('module_id')->references('id')->on('module')->onDelete('cascade');
            } catch (\Exception $e) {}
            try {
                $table->foreign('etudiant_id')->references('id')->on('etudiant')->onDelete('cascade');
            } catch (\Exception $e) {}
        });
    }

    public function down(): void
    {
        Schema::table('inscription_examen', function (Blueprint $table) {
            try {
                $table->dropForeign(['module_id']);
            } catch (\Exception $e) {}
            try {
                $table->dropForeign(['etudiant_id']);
            } catch (\Exception $e) {}
            $table->dropColumn(['module_id', 'etudiant_id', 'statut']);
            $table->unsignedBigInteger('etud_mod_id')->nullable()->after('id');
            $table->unsignedBigInteger('id_salle')->nullable()->after('etud_mod_id');
            $table->foreign('etud_mod_id', 'fk_ie_etud_mod')->references('id')->on('etudiant_module')->onDelete('cascade');
            $table->foreign('id_salle', 'fk_ie_salle')->references('id')->on('salle')->onDelete('set null');
        });
    }
};
