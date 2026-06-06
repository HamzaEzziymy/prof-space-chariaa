<?php

namespace App\Http\Controllers;

use App\Models\Semestre;
use App\Models\Niveau;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SemestreController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Semestre::query()
            ->with('niveau')
            ->orderBy('numero')
            ->orderBy('code');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code',   'like', "%{$search}%")
                  ->orWhere('nom_fr', 'like', "%{$search}%")
                  ->orWhere('nom_ar', 'like', "%{$search}%");
            });
        }

        if ($niveauId = $request->get('niveau_id')) {
            $query->where('niveau_id', $niveauId);
        }

        $semestres = $query->paginate(12)->withQueryString();
        $niveaux   = Niveau::orderBy('ordre')->get(['id', 'code', 'nom_fr', 'nom_ar']);

        return Inertia::render('Semestres/Index', [
            'semestres' => $semestres,
            'niveaux'   => $niveaux,
            'filters'   => $request->only(['search', 'niveau_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code'      => 'required|string|max:5|unique:semestres,code',
            'nom_fr'    => 'required|string|max:50',
            'nom_ar'    => 'required|string|max:50',
            'niveau_id' => 'required|exists:niveaux,id',
            'numero'    => 'required|integer|min:1',
        ]);

        Semestre::create($validated);

        return back()->with('success', 'semestre_created');
    }

    public function update(Request $request, Semestre $semestre): RedirectResponse
    {
        $validated = $request->validate([
            'code'      => "required|string|max:5|unique:semestres,code,{$semestre->id}",
            'nom_fr'    => 'required|string|max:50',
            'nom_ar'    => 'required|string|max:50',
            'niveau_id' => 'required|exists:niveaux,id',
            'numero'    => 'required|integer|min:1',
        ]);

        $semestre->update($validated);

        return back()->with('success', 'semestre_updated');
    }

    public function destroy(Semestre $semestre): RedirectResponse
    {
        $semestre->delete();

        return back()->with('success', 'semestre_deleted');
    }
}
