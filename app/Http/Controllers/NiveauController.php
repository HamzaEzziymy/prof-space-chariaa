<?php

namespace App\Http\Controllers;

use App\Models\Niveau;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NiveauController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Niveau::query()
            ->withCount('semestres')
            ->orderBy('ordre');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code',   'like', "%{$search}%")
                  ->orWhere('nom_fr', 'like', "%{$search}%")
                  ->orWhere('nom_ar', 'like', "%{$search}%");
            });
        }

        $niveaux = $query->paginate(12)->withQueryString();

        return Inertia::render('Niveaux/Index', [
            'niveaux' => $niveaux,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code'   => 'required|string|max:10|unique:niveaux,code',
            'nom_fr' => 'required|string|max:50',
            'nom_ar' => 'required|string|max:50',
            'ordre'  => 'required|integer|min:1',
        ]);

        Niveau::create($validated);

        return back()->with('success', 'niveau_created');
    }

    public function update(Request $request, Niveau $niveau): RedirectResponse
    {
        $validated = $request->validate([
            'code'   => "required|string|max:10|unique:niveaux,code,{$niveau->id}",
            'nom_fr' => 'required|string|max:50',
            'nom_ar' => 'required|string|max:50',
            'ordre'  => 'required|integer|min:1',
        ]);

        $niveau->update($validated);

        return back()->with('success', 'niveau_updated');
    }

    public function destroy(Niveau $niveau): RedirectResponse
    {
        $niveau->delete();

        return back()->with('success', 'niveau_deleted');
    }
}
