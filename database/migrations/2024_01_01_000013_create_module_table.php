<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('prof_id')->nullable();
            $table->string('nom_ar', 255)->nullable();
            $table->string('nom_fr', 255)->nullable();
            $table->string('code_module', 255)->nullable()->unique();
            $table->integer('coefficient')->nullable();
            $table->string('type_module', 255)->nullable();
            $table->timestamps();

            $table->foreign('prof_id', 'fk_module_prof')
                  ->references('id')->on('prof')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module');
    }
};
