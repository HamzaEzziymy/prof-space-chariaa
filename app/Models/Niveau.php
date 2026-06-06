<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Niveau extends Model
{
    protected $fillable = [
        'code',
        'nom_fr',
        'nom_ar',
        'ordre',
    ];

    public function semestres(): HasMany
    {
        return $this->hasMany(Semestre::class, 'niveau_id');
    }
}
