<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Filiere extends Model
{
    protected $fillable = [
        'code',
        'nom_fr',
        'nom_ar',
        'description',
    ];

    public function niveaux(): HasMany
    {
        return $this->hasMany(Niveau::class, 'filiere_id');
    }
}
