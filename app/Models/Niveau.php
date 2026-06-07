<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Niveau extends Model
{
    protected $fillable = [
        'code',
        'nom_fr',
        'nom_ar',
        'ordre',
        'filiere_id',
    ];

    public function semestres(): HasMany
    {
        return $this->hasMany(Semestre::class, 'niveau_id');
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class, 'filiere_id');
    }
}
