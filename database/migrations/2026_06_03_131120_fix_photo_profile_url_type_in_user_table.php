<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user', function (Blueprint $table) {
            // Fix: was incorrectly defined as bigInteger — should be string (file path)
            $table->string('photo_profile_url', 500)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('user', function (Blueprint $table) {
            $table->bigInteger('photo_profile_url')->nullable()->change();
        });
    }
};
