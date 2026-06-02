<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('note_exam', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('etud_mod_id')->nullable();
            $table->string('Groupe', 255)->nullable();
            $table->integer('Nexam')->nullable();
            $table->float('note_normale')->nullable();
            $table->float('note_rattrapage')->nullable();
            $table->float('note_finale')->nullable();
            $table->unsignedBigInteger('id_salle')->nullable();
            $table->timestamps();

            $table->foreign('etud_mod_id', 'fk_note_etud_mod')
                  ->references('id')->on('etudiant_module')
                  ->nullOnDelete();

            $table->foreign('id_salle', 'fk_note_salle')
                  ->references('id')->on('salle')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_exam');
    }
};
