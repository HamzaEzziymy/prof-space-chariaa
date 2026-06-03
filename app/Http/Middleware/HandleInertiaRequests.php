<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
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
                    'avatar_url'        => $user->photo_profile_url
                        ? url('storage/' . $user->photo_profile_url)
                        : null,
                ] : null,
            ],

            // App-wide settings shared to every page
            'appSettings' => [
                'app_name'        => AppSetting::get('app_name', config('app.name')),
                'app_name_ar'     => AppSetting::get('app_name_ar', 'فضاء الأستاذ'),
                'app_tagline'     => AppSetting::get('app_tagline', ''),
                'app_tagline_ar'  => AppSetting::get('app_tagline_ar', ''),
                'app_logo_url'    => AppSetting::get('app_logo_url')
                    ? url('storage/' . AppSetting::get('app_logo_url'))
                    : null,
                'app_favicon_url' => AppSetting::get('app_favicon_url')
                    ? url('storage/' . AppSetting::get('app_favicon_url'))
                    : null,
                'maintenance_mode' => AppSetting::get('maintenance_mode', false),
            ],

            // Flash messages
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }
}
