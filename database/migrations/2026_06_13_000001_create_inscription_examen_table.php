<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscription_examen', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('etud_mod_id');
            $table->unsignedBigInteger('groupe_id')->nullable();
            $table->unsignedBigInteger('id_salle')->nullable();
            $table->integer('Nexam')->nullable();
            $table->float('note_normale')->nullable();
            $table->float('note_rattrapage')->nullable();
            $table->float('note_finale')->nullable();
            $table->string('note_normale_decision_ar', 50)->default('غير مستوفي');
            $table->string('note_normale_decision_fr', 50)->default('Non validé');
            $table->string('note_ratt_decision_ar', 50)->nullable();
            $table->string('note_ratt_decision_fr', 50)->nullable();
            $table->string('decision_finale_ar', 50)->default('غير مستوفي');
            $table->string('decision_finale_fr', 50)->default('Non validé');
            $table->timestamps();

            $table->foreign('etud_mod_id', 'fk_ie_etud_mod')
                ->references('id')->on('etudiant_module')->cascadeOnDelete();
            $table->foreign('groupe_id', 'fk_ie_groupe')
                ->references('id')->on('groupes')->nullOnDelete();
            $table->foreign('id_salle', 'fk_ie_salle')
                ->references('id')->on('salle')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscription_examen');
    }
};
