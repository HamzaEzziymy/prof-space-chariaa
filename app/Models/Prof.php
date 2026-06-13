<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prof extends Model
{
    protected $table = 'prof';

    protected $fillable = [
        'user_id',
        'cin',
        'telephone',
        'grade',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class, 'prof_id');
    }
}
