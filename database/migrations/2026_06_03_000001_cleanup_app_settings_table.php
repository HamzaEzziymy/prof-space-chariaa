<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Remove keys that no longer exist in the settings UI
        DB::table('app_settings')->whereIn('key', [
            'app_primary_color',
            'allow_registration',
            'require_email_verification',
            'default_user_role',
            'academic_year',
            'max_note',
            'note_passage',
        ])->delete();
    }

    public function down(): void
    {
        // Restore removed rows on rollback
        $now = now();
        DB::table('app_settings')->upsert([
            ['key' => 'app_primary_color',          'value' => '#6366f1', 'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'allow_registration',          'value' => '1',       'type' => 'boolean', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'require_email_verification',  'value' => '0',       'type' => 'boolean', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'default_user_role',           'value' => 'prof',    'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'academic_year',               'value' => '2024-2025','type' => 'string', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'max_note',                    'value' => '20',      'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'note_passage',                'value' => '10',      'type' => 'string',  'created_at' => $now, 'updated_at' => $now],
        ], ['key'], ['value', 'type', 'updated_at']);
    }
};
