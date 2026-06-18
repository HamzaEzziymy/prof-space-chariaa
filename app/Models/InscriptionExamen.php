<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InscriptionExamen extends Model
{
    protected $table = 'inscription_examen';

    protected $fillable = [
        'module_id',
        'etudiant_id',
        'Nexam',
        'statut',
        'note_normale',
        'note_rattrapage',
        'note_finale',
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
            'Nexam'           => 'integer',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (self $exam) {
            $exam->note_normale_decision_ar = $exam->note_normale !== null && $exam->note_normale >= 10
                ? 'مستوفي' : 'غير مستوفي';
            $exam->note_normale_decision_fr = $exam->note_normale !== null && $exam->note_normale >= 10
                ? 'Validé' : 'Non validé';

            if ($exam->note_rattrapage !== null) {
                $exam->note_ratt_decision_ar = $exam->note_rattrapage >= 10 ? 'مستوفي' : 'غير مستوفي';
                $exam->note_ratt_decision_fr = $exam->note_rattrapage >= 10 ? 'Validé' : 'Non validé';
            }

            $final = $exam->note_rattrapage ?? $exam->note_normale;
            $exam->decision_finale_ar = $final !== null && $final >= 10 ? 'مستوفي' : 'غير مستوفي';
            $exam->decision_finale_fr = $final !== null && $final >= 10 ? 'Validé' : 'Non validé';
        });
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class, 'etudiant_id');
    }
}
