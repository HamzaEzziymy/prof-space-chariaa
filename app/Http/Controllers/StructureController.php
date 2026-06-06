<?php

namespace App\Http\Controllers;

use App\Models\Niveau;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StructureController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Niveau::query()
            ->with(['semestres' => fn ($q) => $q->orderBy('numero')->orderBy('code')])
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

        return Inertia::render('Structure/Index', [
            'niveaux' => $niveaux,
            'filters' => $request->only('search'),
        ]);
    }
}
