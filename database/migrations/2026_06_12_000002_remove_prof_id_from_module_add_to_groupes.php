<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('module', function (Blueprint $table) {
            $table->dropForeign('fk_module_prof');
            $table->dropColumn('prof_id');
        });

        Schema::table('groupes', function (Blueprint $table) {
            $table->unsignedBigInteger('prof_id')->nullable()->after('module_id');
            $table->foreign('prof_id')->references('id')->on('prof')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('module', function (Blueprint $table) {
            $table->unsignedBigInteger('prof_id')->nullable()->after('id');
            $table->foreign('prof_id', 'fk_module_prof')->references('id')->on('prof')->nullOnDelete();
        });

        Schema::table('groupes', function (Blueprint $table) {
            $table->dropForeign(['prof_id']);
            $table->dropColumn('prof_id');
        });
    }
};
