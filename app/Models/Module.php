<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    protected $table = 'module';

    protected $fillable = [
        'prof_id',
        'semestre_id',
        'nom_ar',
        'nom_fr',
        'code_module',
        'coefficient',
        'type_module',
    ];

    /**
     * Get the prof who teaches this module.
     */
    public function prof(): BelongsTo
    {
        return $this->belongsTo(Prof::class, 'prof_id');
    }

    /**
     * Get the semestre this module belongs to.
     */
    public function semestre(): BelongsTo
    {
        return $this->belongsTo(Semestre::class, 'semestre_id');
    }

    /**
     * Get the students enrolled in this module.
     */
    public function etudiants(): BelongsToMany
    {
        return $this->belongsToMany(Etudiant::class, 'etudiant_module', 'module_id', 'etudiant_id')
                    ->withPivot('id');
    }

    /**
     * Get the etudiant_module pivot records for this module.
     */
    public function etudiantModules(): HasMany
    {
        return $this->hasMany(EtudiantModule::class, 'module_id');
    }
}
