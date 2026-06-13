<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Module extends Model
{
    protected $table = 'module';

    protected $fillable = [
        'semestre_id',
        'nom_ar',
        'nom_fr',
        'code_module',
        'coefficient',
        'type_module',
    ];

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

    /**
     * Get the groupes for this module.
     */
    public function groupes(): HasMany
    {
        return $this->hasMany(Groupe::class, 'module_id');
    }

    public function inscriptionsExamen(): HasManyThrough
    {
        return $this->hasManyThrough(InscriptionExamen::class, EtudiantModule::class, 'module_id', 'etud_mod_id');
    }
}
