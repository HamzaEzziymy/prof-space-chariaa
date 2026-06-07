<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FiliereController extends Controller
{
    public function index(Request $request)
    {
        $query = Filiere::query()
            ->withCount('niveaux')
            ->orderBy('code');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code',   'like', "%{$search}%")
                  ->orWhere('nom_fr', 'like', "%{$search}%")
                  ->orWhere('nom_ar', 'like', "%{$search}%");
            });
        }

        $filieres = $query->paginate(12)->withQueryString();

        return response()->json($filieres);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:20|unique:filieres,code',
            'nom_fr'      => 'required|string|max:255',
            'nom_ar'      => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Filiere::create($validated);

        return back()->with('success', 'filiere_created');
    }

    public function update(Request $request, Filiere $filiere): RedirectResponse
    {
        $validated = $request->validate([
            'code'        => ['required', 'string', 'max:20', Rule::unique('filieres', 'code')->ignore($filiere->id)],
            'nom_fr'      => 'required|string|max:255',
            'nom_ar'      => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $filiere->update($validated);

        return back()->with('success', 'filiere_updated');
    }

    public function destroy(Filiere $filiere): RedirectResponse
    {
        $filiere->delete();

        return back()->with('success', 'filiere_deleted');
    }
}
