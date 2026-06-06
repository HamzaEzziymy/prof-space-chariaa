<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Semestre extends Model
{
    protected $fillable = [
        'code',
        'nom_fr',
        'nom_ar',
        'niveau_id',
        'numero',
    ];

    public function niveau(): BelongsTo
    {
        return $this->belongsTo(Niveau::class, 'niveau_id');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class, 'semestre_id');
    }
}
