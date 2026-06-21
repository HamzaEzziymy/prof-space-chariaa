<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('inscription_examen');

        if (!Schema::hasColumn('note_exam', 'statut')) {
            Schema::table('note_exam', function (Blueprint $table) {
                $table->string('statut', 20)->nullable()->after('Nexam')->default('normale');
            });
        }
    }

    public function down(): void
    {
        Schema::table('note_exam', function (Blueprint $table) {
            $table->dropColumn('statut');
        });

        Schema::create('inscription_examen', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('module_id')->nullable();
            $table->unsignedBigInteger('etudiant_id')->nullable();
            $table->string('statut', 20)->nullable();
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
            $table->foreign('module_id')->references('id')->on('module')->onDelete('cascade');
            $table->foreign('etudiant_id')->references('id')->on('etudiant')->onDelete('cascade');
        });
    }
};
