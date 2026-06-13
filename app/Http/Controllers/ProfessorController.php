<?php

namespace App\Http\Controllers;

use App\Models\Groupe;
use App\Models\Prof;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfessorController extends Controller
{
    /**
     * List all professors with search + grade filter + pagination.
     */
    public function index(Request $request): Response
    {
        $query = Prof::query()
            ->with(['user:id,nom_fr,prenom_fr,nom_ar,prenom_ar,email,photo_profile_url,is_active'])
            ->withCount('groupes')
            ->orderBy('created_at', 'desc');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('nom_fr',    'like', "%{$search}%")
                       ->orWhere('prenom_fr', 'like', "%{$search}%")
                       ->orWhere('nom_ar',    'like', "%{$search}%")
                       ->orWhere('prenom_ar', 'like', "%{$search}%")
                       ->orWhere('email',     'like', "%{$search}%");
                })
                ->orWhere('cin',       'like', "%{$search}%")
                ->orWhere('telephone', 'like', "%{$search}%");
            });
        }

        if ($grade = $request->get('grade')) {
            $query->where('grade', $grade);
        }

        $profs = $query->paginate(12)->withQueryString();

        $profs->getCollection()->transform(function ($prof) {
            if ($prof->user) {
                $prof->user->avatar_url = $prof->user->photo_profile_url
                    ? '/storage/' . $prof->user->photo_profile_url
                    : null;
            }
            return $prof;
        });

        $grades = Prof::distinct()->pluck('grade')->filter()->values();

        $availableUsers = User::where('role', 'prof')
            ->whereDoesntHave('prof')
            ->select(['id', 'nom_fr', 'prenom_fr', 'nom_ar', 'prenom_ar', 'email'])
            ->orderBy('nom_fr')
            ->get();

        $stats = [
            'total'    => Prof::count(),
            'active'   => Prof::whereHas('user', fn ($q) => $q->where('is_active', true))->count(),
            'inactive' => Prof::whereHas('user', fn ($q) => $q->where('is_active', false))->count(),
            'withGroupes' => Prof::has('groupes')->count(),
        ];

        return Inertia::render('Professors/Index', [
            'profs'          => $profs,
            'grades'         => $grades,
            'availableUsers' => $availableUsers,
            'filters'        => $request->only(['search', 'grade']),
            'stats'          => $stats,
        ]);
    }

    /**
     * Show a single professor's detail page.
     */
    public function show(Prof $prof): Response
    {
        $prof->load([
            'user:id,nom_fr,prenom_fr,nom_ar,prenom_ar,email,photo_profile_url,is_active,email_verified_at,created_at,must_change_password',
            'groupes' => fn ($q) => $q->with('module.semestre.niveau.filiere'),
        ]);
        $prof->loadCount('groupes');

        if ($prof->user) {
            $prof->user->avatar_url = $prof->user->photo_profile_url
                ? '/storage/' . $prof->user->photo_profile_url
                : null;
        }

        $prof->groupes->each(function ($groupe) {
            $groupe->etudiants_count = $groupe->relationLoaded('module') && $groupe->module
                ? $groupe->module->etudiants()->count()
                : 0;
        });

        $assignableGroupes = Groupe::whereNull('prof_id')
            ->with('module.semestre.niveau.filiere')
            ->orderBy('code')
            ->get(['id', 'code', 'nom_fr', 'nom_ar', 'module_id']);

        return Inertia::render('Professors/Show', [
            'prof' => $prof,
            'assignableGroupes' => $assignableGroupes,
        ]);
    }

    public function assignGroupe(Prof $prof, Groupe $groupe): RedirectResponse
    {
        $groupe->update(['prof_id' => $prof->id]);
        return back()->with('success', 'Groupe assigné avec succès.');
    }

    public function unassignGroupe(Prof $prof, Groupe $groupe): RedirectResponse
    {
        if ($groupe->prof_id !== $prof->id) {
            return back()->with('error', 'Ce groupe n\'est pas assigné à ce professeur.');
        }
        $groupe->update(['prof_id' => null]);
        return back()->with('success', 'Groupe désassigné avec succès.');
    }

    /**
     * Store a new professor record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id'   => ['required', 'exists:user,id', Rule::unique('prof', 'user_id')],
            'cin'       => ['nullable', 'string', 'max:20', Rule::unique('prof', 'cin')->whereNotNull('cin')],
            'telephone' => ['nullable', 'string', 'max:20'],
            'grade'     => ['nullable', 'string', 'max:100'],
        ]);

        Prof::create($validated);

        return back()->with('success', 'prof_created');
    }

    /**
     * Update an existing professor record.
     */
    public function update(Request $request, Prof $prof): RedirectResponse
    {
        $validated = $request->validate([
            'user_id'   => ['required', 'exists:user,id', Rule::unique('prof', 'user_id')->ignore($prof->id)],
            'cin'       => ['nullable', 'string', 'max:20', Rule::unique('prof', 'cin')->ignore($prof->id)->whereNotNull('cin')],
            'telephone' => ['nullable', 'string', 'max:20'],
            'grade'     => ['nullable', 'string', 'max:100'],
        ]);

        $prof->update($validated);

        return back()->with('success', 'prof_updated');
    }

    /**
     * Remove a professor record.
     */
    public function destroy(Prof $prof): RedirectResponse
    {
        $prof->delete();

        return back()->with('success', 'prof_deleted');
    }
}
