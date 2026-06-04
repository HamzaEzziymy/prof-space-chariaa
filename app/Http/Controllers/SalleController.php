<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalleController extends Controller
{
    /**
     * List all salles with search + pagination.
     */
    public function index(Request $request): Response
    {
        $query = Salle::query()
            ->withCount('noteExams')
            ->orderBy('created_at', 'desc');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nomSalle_fr', 'like', "%{$search}%")
                  ->orWhere('nomSalle_ar', 'like', "%{$search}%")
                  ->orWhere('code_salle',  'like', "%{$search}%");
            });
        }

        $salles = $query->paginate(12)->withQueryString();

        $stats = [
            'total'     => Salle::count(),
            'withExams' => Salle::has('noteExams')->count(),
            'unused'    => Salle::doesntHave('noteExams')->count(),
        ];

        return Inertia::render('Salles/Index', [
            'salles'  => $salles,
            'filters' => $request->only('search'),
            'stats'   => $stats,
        ]);
    }

    /**
     * Store a new salle.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nomSalle_fr' => 'required|string|max:255',
            'nomSalle_ar' => 'nullable|string|max:255',
            'code_salle'  => 'required|string|max:255|unique:salle,code_salle',
        ]);

        Salle::create($validated);

        return back()->with('success', 'salle_created');
    }

    /**
     * Update an existing salle.
     */
    public function update(Request $request, Salle $salle): RedirectResponse
    {
        $validated = $request->validate([
            'nomSalle_fr' => 'required|string|max:255',
            'nomSalle_ar' => 'nullable|string|max:255',
            'code_salle'  => "required|string|max:255|unique:salle,code_salle,{$salle->id}",
        ]);

        $salle->update($validated);

        return back()->with('success', 'salle_updated');
    }

    /**
     * Delete a salle.
     */
    public function destroy(Salle $salle): RedirectResponse
    {
        $salle->delete();

        return back()->with('success', 'salle_deleted');
    }
}
