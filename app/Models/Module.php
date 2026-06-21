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
        'prof_id',
        'nom_ar',
        'nom_fr',
        'code_module',
        'coefficient',
        'type_module',
    ];

    public function semestre(): BelongsTo
    {
        return $this->belongsTo(Semestre::class, 'semestre_id');
    }

    public function prof(): BelongsTo
    {
        return $this->belongsTo(Prof::class, 'prof_id');
    }

    public function etudiants(): BelongsToMany
    {
        return $this->belongsToMany(Etudiant::class, 'etudiant_module', 'module_id', 'etudiant_id')
                    ->withPivot('id');
    }

    public function etudiantModules(): HasMany
    {
        return $this->hasMany(EtudiantModule::class, 'module_id');
    }

    public function noteExams(): HasManyThrough
    {
        return $this->hasManyThrough(NoteExam::class, EtudiantModule::class, 'module_id', 'etud_mod_id');
    }
}
