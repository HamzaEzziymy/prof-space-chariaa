<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, json
            $table->timestamps();
        });

        // Seed default settings
        $now = now();
        DB::table('app_settings')->insert([
            // ── Identité de l'application ──────────────────────────────
            ['key' => 'app_name',            'value' => 'ProfSpace',                                      'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'app_name_ar',         'value' => 'فضاء الأستاذ',                                   'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'app_tagline',         'value' => 'Gestion académique',                             'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'app_tagline_ar',      'value' => 'الإدارة الأكاديمية',                            'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'app_logo_url',        'value' => null,                                             'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'app_favicon_url',     'value' => null,                                             'type' => 'string',  'created_at' => $now, 'updated_at' => $now],

            // ── Contact & établissement ────────────────────────────────
            ['key' => 'contact_email',       'value' => '',                                               'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'contact_phone',       'value' => '',                                               'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'institution_name',    'value' => '',                                               'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'institution_address', 'value' => '',                                               'type' => 'string',  'created_at' => $now, 'updated_at' => $now],

            // ── Maintenance ────────────────────────────────────────────
            ['key' => 'maintenance_mode',    'value' => '0',                                              'type' => 'boolean', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'maintenance_message', 'value' => 'Maintenance en cours. Revenez bientôt.',        'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'maintenance_message_ar', 'value' => 'الموقع تحت الصيانة. يرجى المحاولة لاحقاً.','type' => 'string',  'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
