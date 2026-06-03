<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'                => $user->id,
                    'email'             => $user->email,
                    'nom_fr'            => $user->nom_fr,
                    'prenom_fr'         => $user->prenom_fr,
                    'nom_ar'            => $user->nom_ar,
                    'prenom_ar'         => $user->prenom_ar,
                    'role'              => $user->role,
                    'email_verified_at' => $user->email_verified_at,
                    'photo_profile_url' => $user->photo_profile_url,
                    // Explicit full URL — never null-safe issues
                    'avatar_url'        => $user->photo_profile_url
                        ? url('storage/' . $user->photo_profile_url)
                        : null,
                ] : null,
            ],
        ];
    }
}
