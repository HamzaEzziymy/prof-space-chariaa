<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Already structurally updated from previous failed run, just add FKs if missing
        DB::statement('DELETE FROM inscription_examen WHERE module_id = 0 OR etudiant_id = 0');

        Schema::table('inscription_examen', function (Blueprint $table) {
            // Add FK if not already present
            try {
                $table->foreign('module_id')->references('id')->on('module')->onDelete('cascade');
            } catch (\Exception $e) {
                // Already exists
            }
            try {
                $table->foreign('etudiant_id')->references('id')->on('etudiant')->onDelete('cascade');
            } catch (\Exception $e) {
                // Already exists
            }
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
