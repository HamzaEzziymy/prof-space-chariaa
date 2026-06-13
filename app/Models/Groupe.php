<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Groupe extends Model
{
    protected $table = 'groupes';

    protected $fillable = [
        'code',
        'nom_fr',
        'nom_ar',
        'module_id',
        'prof_id',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function prof(): BelongsTo
    {
        return $this->belongsTo(Prof::class, 'prof_id');
    }

    public function inscriptionsExamen(): HasMany
    {
        return $this->hasMany(InscriptionExamen::class, 'groupe_id');
    }
}
