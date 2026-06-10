<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('note_exam', function (Blueprint $table) {
            $table->string('note_normale_decision_ar', 50)->default('غير مستوفي');
            $table->string('note_normale_decision_fr', 50)->default('Non validé');
            $table->string('note_ratt_decision_ar', 50)->nullable();
            $table->string('note_ratt_decision_fr', 50)->nullable();
            $table->string('decision_finale_ar', 50)->default('غير مستوفي');
            $table->string('decision_finale_fr', 50)->default('Non validé');
        });

        // backfill existing rows based on current note values
        $this->backfillDecisions();
    }

    private function backfillDecisions(): void
    {
        DB::statement("
            UPDATE note_exam
            SET
                note_normale_decision_ar = CASE WHEN COALESCE(note_normale, 0) > 10 THEN 'مستوفي' ELSE 'غير مستوفي' END,
                note_normale_decision_fr = CASE WHEN COALESCE(note_normale, 0) > 10 THEN 'Validé' ELSE 'Non validé' END,
                note_ratt_decision_ar    = CASE WHEN note_rattrapage IS NULL THEN NULL WHEN note_rattrapage > 10 THEN 'مستوفي' ELSE 'غير مستوفي' END,
                note_ratt_decision_fr    = CASE WHEN note_rattrapage IS NULL THEN NULL WHEN note_rattrapage > 10 THEN 'Validé' ELSE 'Non validé' END,
                decision_finale_ar       = CASE
                    WHEN note_rattrapage IS NOT NULL THEN CASE WHEN note_rattrapage > 10 THEN 'مستوفي' ELSE 'غير مستوفي' END
                    ELSE CASE WHEN COALESCE(note_normale, 0) > 10 THEN 'مستوفي' ELSE 'غير مستوفي' END
                END,
                decision_finale_fr       = CASE
                    WHEN note_rattrapage IS NOT NULL THEN CASE WHEN note_rattrapage > 10 THEN 'Validé' ELSE 'Non validé' END
                    ELSE CASE WHEN COALESCE(note_normale, 0) > 10 THEN 'Validé' ELSE 'Non validé' END
                END
        ");
    }

    public function down(): void
    {
        Schema::table('note_exam', function (Blueprint $table) {
            $table->dropColumn([
                'note_normale_decision_ar',
                'note_normale_decision_fr',
                'note_ratt_decision_ar',
                'note_ratt_decision_fr',
                'decision_finale_ar',
                'decision_finale_fr',
            ]);
        });
    }
};
