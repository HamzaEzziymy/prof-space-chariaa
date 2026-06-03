<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $table = 'user';

    protected $fillable = [
        'email',
        'password',
        'nom_ar',
        'prenom_ar',
        'nom_fr',
        'prenom_fr',
        'role',
        'photo_profile_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['avatar_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'password'           => 'hashed',
            'photo_profile_url'  => 'string',
        ];
    }

    /**
     * Full public URL to the avatar (or null if not set).
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->photo_profile_url) {
            return null;
        }
        return Storage::disk('public')->url($this->photo_profile_url);
    }

    public function prof(): HasOne
    {
        return $this->hasOne(Prof::class, 'user_id');
    }
}
