<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Salle extends Model
{
    protected $table = 'salle';

    protected $fillable = [
        'nomSalle_ar',
        'nomSalle_fr',
        'code_salle',
        'capacite',
    ];

    /**
     * Get the exam notes held in this room.
     */
    public function noteExams(): HasMany
    {
        return $this->hasMany(NoteExam::class, 'id_salle');
    }
}
