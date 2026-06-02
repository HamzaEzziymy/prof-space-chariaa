<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prof', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('cin', 255)->nullable();
            $table->string('telephone', 255)->nullable();
            $table->string('grade', 255)->nullable();
            $table->timestamps();

            $table->foreign('user_id', 'fk_prof_user')
                  ->references('id')->on('user')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prof');
    }
};
