<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    protected $table      = 'app_settings';
    protected $primaryKey = 'key';
    protected $keyType    = 'string';
    public    $incrementing = false;

    protected $fillable = ['key', 'value', 'type'];

    // ── Static helpers ─────────────────────────────────────────────────────────

    /**
     * Get a setting value by key, with optional default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $row = Cache::remember("setting.{$key}", 3600, fn () => static::find($key));

        if (! $row) return $default;

        return match ($row->type) {
            'boolean' => (bool) $row->value,
            'json'    => json_decode($row->value, true),
            default   => $row->value,
        };
    }

    /**
     * Set (upsert) a setting value and bust its cache.
     */
    public static function set(string $key, mixed $value): void
    {
        $type = match (true) {
            is_bool($value)  => 'boolean',
            is_array($value) => 'json',
            default          => 'string',
        };

        $stored = match ($type) {
            'boolean' => $value ? '1' : '0',
            'json'    => json_encode($value),
            default   => (string) $value,
        };

        static::updateOrCreate(
            ['key' => $key],
            ['value' => $stored, 'type' => $type]
        );

        Cache::forget("setting.{$key}");
    }

    /**
     * Bulk-set multiple settings at once.
     */
    public static function bulkSet(array $data): void
    {
        foreach ($data as $key => $value) {
            static::set($key, $value);
        }
    }

    /**
     * Return all settings as a flat key→value array.
     */
    public static function allAsArray(): array
    {
        return static::all()->mapWithKeys(function ($row) {
            $value = match ($row->type) {
                'boolean' => (bool) $row->value,
                'json'    => json_decode($row->value, true),
                default   => $row->value,
            };
            return [$row->key => $value];
        })->toArray();
    }
}
