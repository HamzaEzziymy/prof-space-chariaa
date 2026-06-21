<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class NoteExam extends Model
{
    protected $table = 'note_exam';

    protected $fillable = [
        'etud_mod_id',
        'Nexam',
        'statut',
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
            if (is_null($note->note_normale)) {
                $note->note_normale_decision_ar = 'غير مستوفي';
                $note->note_normale_decision_fr = 'Non validé';
            } elseif ((int) $note->note_normale === 99) {
                $note->note_normale_decision_ar = 'غائب';
                $note->note_normale_decision_fr = 'Absent';
            } else {
                $note->note_normale_decision_ar = $note->note_normale >= 10 ? 'مستوفي' : 'غير مستوفي';
                $note->note_normale_decision_fr = $note->note_normale >= 10 ? 'Validé' : 'Non validé';
            }

            if (is_null($note->note_rattrapage)) {
                $note->note_ratt_decision_ar = null;
                $note->note_ratt_decision_fr = null;
            } elseif ((int) $note->note_rattrapage === 99) {
                $note->note_ratt_decision_ar = 'غائب';
                $note->note_ratt_decision_fr = 'Absent';
            } else {
                $note->note_ratt_decision_ar = $note->note_rattrapage >= 10 ? 'مستوفي' : 'غير مستوفي';
                $note->note_ratt_decision_fr = $note->note_rattrapage >= 10 ? 'Validé' : 'Non validé';
            }

            if (!is_null($note->note_rattrapage)) {
                $note->decision_finale_ar = (int) $note->note_rattrapage === 99 ? 'غائب' : ($note->note_rattrapage >= 10 ? 'مستوفي' : 'غير مستوفي');
                $note->decision_finale_fr = (int) $note->note_rattrapage === 99 ? 'Absent' : ($note->note_rattrapage >= 10 ? 'Validé' : 'Non validé');
            } elseif (!is_null($note->note_normale)) {
                $note->decision_finale_ar = (int) $note->note_normale === 99 ? 'غائب' : ($note->note_normale >= 10 ? 'مستوفي' : 'غير مستوفي');
                $note->decision_finale_fr = (int) $note->note_normale === 99 ? 'Absent' : ($note->note_normale >= 10 ? 'Validé' : 'Non validé');
            } else {
                $note->decision_finale_ar = 'غير مستوفي';
                $note->decision_finale_fr = 'Non validé';
            }
        });
    }

    public function etudiantModule(): BelongsTo
    {
        return $this->belongsTo(EtudiantModule::class, 'etud_mod_id');
    }

    public function module(): HasOneThrough
    {
        return $this->hasOneThrough(Module::class, EtudiantModule::class, 'id', 'id', 'etud_mod_id', 'module_id');
    }

    public function etudiant(): HasOneThrough
    {
        return $this->hasOneThrough(Etudiant::class, EtudiantModule::class, 'id', 'id', 'etud_mod_id', 'etudiant_id');
    }

    public function salle(): BelongsTo
    {
        return $this->belongsTo(Salle::class, 'id_salle');
    }
}
