<?php

namespace App\Http\Controllers;

use App\Models\Groupe;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GroupeController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code'      => 'required|string|max:20|unique:groupes,code',
            'nom_fr'    => 'nullable|string|max:100',
            'nom_ar'    => 'nullable|string|max:100',
            'module_id' => 'required|exists:module,id',
            'prof_id'   => 'nullable|exists:prof,id',
        ]);

        Groupe::create($validated);

        return back()->with('success', 'Groupe créé avec succès.');
    }

    public function update(Request $request, Groupe $groupe): RedirectResponse
    {
        $validated = $request->validate([
            'code'      => ['required', 'string', 'max:20', Rule::unique('groupes', 'code')->ignore($groupe->id)],
            'nom_fr'    => 'nullable|string|max:100',
            'nom_ar'    => 'nullable|string|max:100',
            'prof_id'   => 'nullable|exists:prof,id',
        ]);

        $groupe->update($validated);

        return back()->with('success', 'Groupe mis à jour avec succès.');
    }

    public function destroy(Groupe $groupe): RedirectResponse
    {
        $groupe->delete();

        return back()->with('success', 'Groupe supprimé avec succès.');
    }
}
