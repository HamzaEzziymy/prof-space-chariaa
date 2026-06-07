<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use App\Models\Niveau;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StructureController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Niveau::query()
            ->with(['semestres' => fn ($q) => $q->orderBy('numero')->orderBy('code'), 'filiere'])
            ->withCount('semestres')
            ->orderBy('ordre');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code',   'like', "%{$search}%")
                  ->orWhere('nom_fr', 'like', "%{$search}%")
                  ->orWhere('nom_ar', 'like', "%{$search}%")
                  ->orWhereHas('semestres', function ($sq) use ($search) {
                      $sq->where('code',   'like', "%{$search}%")
                         ->orWhere('nom_fr', 'like', "%{$search}%")
                         ->orWhere('nom_ar', 'like', "%{$search}%");
                  });
            });
        }

        $niveaux = $query->get();

        $filiereQuery = Filiere::withCount('niveaux')->orderBy('code');
        if ($filiereSearch = $request->get('filiereSearch')) {
            $filiereQuery->where(function ($q) use ($filiereSearch) {
                $q->where('code',   'like', "%{$filiereSearch}%")
                  ->orWhere('nom_fr', 'like', "%{$filiereSearch}%")
                  ->orWhere('nom_ar', 'like', "%{$filiereSearch}%");
            });
        }
        $filieres = $filiereQuery->get(['id', 'code', 'nom_fr', 'nom_ar', 'description']);

        return Inertia::render('Structure/Index', [
            'niveaux'  => $niveaux,
            'filieres' => $filieres,
            'filters'  => ['search' => $request->get('search'), 'filiereSearch' => $request->get('filiereSearch')],
        ]);
    }
}
