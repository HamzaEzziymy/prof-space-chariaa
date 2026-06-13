<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NoteExam extends Model
{
    protected $table = 'note_exam';

    protected $fillable = [
        'etud_mod_id',
        'Nexam',
        'note_normale',
        'note_rattrapage',
        'note_finale',
        'id_salle',
        'note_normale_decision_ar',
        'note_normale_decision_fr',
        'note_ratt_decision_ar',
        'note_ratt_decision_fr',
        'decision_finale_ar',
        'decision_finale_fr',
    ];

    protected function casts(): array
    {
        return [
            'note_normale'    => 'float',
            'note_rattrapage' => 'float',
            'note_finale'     => 'float',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (self $note) {
            // --- note_normale decision ---
            if (is_null($note->note_normale)) {
                $note->note_normale_decision_ar = 'غير مستوفي';
                $note->note_normale_decision_fr = 'Non validé';
            } else {
                $note->note_normale_decision_ar = $note->note_normale > 10 ? 'مستوفي' : 'غير مستوفي';
                $note->note_normale_decision_fr = $note->note_normale > 10 ? 'Validé' : 'Non validé';
            }

            // --- note_rattrapage decision (nullable) ---
            if (is_null($note->note_rattrapage)) {
                $note->note_ratt_decision_ar = null;
                $note->note_ratt_decision_fr = null;
            } else {
                $note->note_ratt_decision_ar = $note->note_rattrapage > 10 ? 'مستوفي' : 'غير مستوفي';
                $note->note_ratt_decision_fr = $note->note_rattrapage > 10 ? 'Validé' : 'Non validé';
            }

            // --- decision_finale (if rattrapage exists use it, else normale) ---
            if (!is_null($note->note_rattrapage)) {
                $note->decision_finale_ar = $note->note_rattrapage > 10 ? 'مستوفي' : 'غير مستوفي';
                $note->decision_finale_fr = $note->note_rattrapage > 10 ? 'Validé' : 'Non validé';
            } elseif (!is_null($note->note_normale)) {
                $note->decision_finale_ar = $note->note_normale > 10 ? 'مستوفي' : 'غير مستوفي';
                $note->decision_finale_fr = $note->note_normale > 10 ? 'Validé' : 'Non validé';
            } else {
                $note->decision_finale_ar = 'غير مستوفي';
                $note->decision_finale_fr = 'Non validé';
            }
        });
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
