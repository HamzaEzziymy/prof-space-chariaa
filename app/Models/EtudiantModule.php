<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EtudiantModule extends Model
{
    protected $table = 'etudiant_module';

    protected $fillable = [
        'etudiant_id',
        'module_id',
    ];

    /**
     * Get the student associated with this enrollment.
     */
    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class, 'etudiant_id');
    }

    /**
     * Get the module associated with this enrollment.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    /**
     * Get the exam notes for this enrollment.
     */
    public function noteExams(): HasMany
    {
        return $this->hasMany(NoteExam::class, 'etud_mod_id');
    }
}
