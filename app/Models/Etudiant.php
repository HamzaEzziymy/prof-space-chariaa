<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Etudiant extends Model
{
    protected $table = 'etudiant';

    protected $fillable = [
        'Nins',
        'CNE',
        'CIN',
        'nom_ar',
        'prenom_ar',
        'nom_fr',
        'prenom_fr',
        'date_naissance',
        'lieu_naissance',
        'sexe',
        'telephone',
        'email',
        'photo_url',
        'filier',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
        ];
    }

    /**
     * Get the modules this student is enrolled in.
     */
    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'etudiant_module', 'etudiant_id', 'module_id')
                    ->withPivot('id');
    }

    /**
     * Get the etudiant_module pivot records for this student.
     */
    public function etudiantModules(): HasMany
    {
        return $this->hasMany(EtudiantModule::class, 'etudiant_id');
    }
}
