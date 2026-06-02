<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NoteExam extends Model
{
    protected $table = 'note_exam';

    protected $fillable = [
        'etud_mod_id',
        'Groupe',
        'Nexam',
        'note_normale',
        'note_rattrapage',
        'note_finale',
        'id_salle',
    ];

    protected function casts(): array
    {
        return [
            'note_normale'    => 'float',
            'note_rattrapage' => 'float',
            'note_finale'     => 'float',
        ];
    }

    /**
     * Get the student-module enrollment this note belongs to.
     */
    public function etudiantModule(): BelongsTo
    {
        return $this->belongsTo(EtudiantModule::class, 'etud_mod_id');
    }

    /**
     * Get the salle (room) where this exam took place.
     */
    public function salle(): BelongsTo
    {
        return $this->belongsTo(Salle::class, 'id_salle');
    }
}
