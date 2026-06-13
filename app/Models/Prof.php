<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prof extends Model
{
    protected $table = 'prof';

    protected $fillable = [
        'user_id',
        'cin',
        'telephone',
        'grade',
    ];

    /**
     * Get the user associated with this prof.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the groupes assigned to this prof.
     */
    public function groupes(): HasMany
    {
        return $this->hasMany(Groupe::class, 'prof_id');
    }

    /**
     * Get the modules taught by this prof (through groupes).
     */
    public function modules()
    {
        return Module::whereHas('groupes', function ($q) {
            $q->where('prof_id', $this->id);
        });
    }
}
