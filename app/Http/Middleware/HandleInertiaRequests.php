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

        $profModules = collect();

        if ($user && $user->role === 'prof' && $user->prof) {
            $moduleIds = $user->prof->modules()->pluck('module.id');

            $hasInscriptions = \App\Models\NoteExam::whereIn('etud_mod_id', function ($q) use ($moduleIds) {
                $q->select('id')->from('etudiant_module')->whereIn('module_id', $moduleIds);
            })->distinct()->pluck('etud_mod_id');

            $moduleIdsWithNoteExams = \App\Models\EtudiantModule::whereIn('id', $hasInscriptions)
                ->pluck('module_id')->unique()->toArray();

            $profModules = $user->prof->modules()
                ->with('semestre.niveau.filiere')
                ->get()
                ->map(fn ($m) => [
                    ...$m->toArray(),
                    'has_inscriptions' => in_array($m->id, $moduleIdsWithNoteExams),
                ]);
        }

        return [
            ...parent::share($request),

            'profModules' => $profModules,

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
                        ? '/storage/' . $user->photo_profile_url
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
                    ? '/storage/' . AppSetting::get('app_logo_url')
                    : null,
                'app_favicon_url' => AppSetting::get('app_favicon_url')
                    ? '/storage/' . AppSetting::get('app_favicon_url')
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
