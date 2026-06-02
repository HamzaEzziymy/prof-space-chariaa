<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etudiant_module', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('etudiant_id')->nullable();
            $table->unsignedBigInteger('module_id')->nullable();
            $table->timestamps();

            $table->foreign('etudiant_id', 'fk_em_etudiant')
                  ->references('id')->on('etudiant')
                  ->nullOnDelete();

            $table->foreign('module_id', 'fk_em_module')
                  ->references('id')->on('module')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etudiant_module');
    }
};
