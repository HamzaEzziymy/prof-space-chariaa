<?php

namespace App\Http\Controllers\Prof;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $prof = $user->prof;

        $modules = $prof
            ? $prof->groupes()->with('module')->get()->pluck('module')->filter()->unique('id')->values()
            : collect();

        $totalStudents = $modules->sum(fn ($m) => $m->etudiants()->count());

        return Inertia::render('Prof/Dashboard', [
            'prof'          => $prof,
            'totalStudents' => $totalStudents,
        ]);
    }

    public function groupeStudents(int $groupeId): Response
    {
        $user = auth()->user();
        $prof = $user->prof;

        $groupe = \App\Models\Groupe::where('prof_id', $prof->id)
            ->with('module.semestre.niveau.filiere')
            ->findOrFail($groupeId);

        $inscriptions = \App\Models\InscriptionExamen::where('groupe_id', $groupeId)
            ->with('etudiantModule.etudiant')
            ->get();

        $students = $inscriptions->map(function ($insc) {
            $em = $insc->etudiantModule;
            $etudiant = $em->etudiant;

            return [
                'etud_mod_id'     => $em->id,
                'id'              => $etudiant->id,
                'nom_fr'          => $etudiant->nom_fr,
                'prenom_fr'       => $etudiant->prenom_fr,
                'nom_ar'          => $etudiant->nom_ar,
                'prenom_ar'       => $etudiant->prenom_ar,
                'CNE'             => $etudiant->CNE,
                'sexe'            => $etudiant->sexe,
                'inscription_id'  => $insc->id,
                'note_normale'    => $insc->note_normale,
                'note_rattrapage' => $insc->note_rattrapage,
                'note_finale'     => $insc->note_finale,
                'decision'        => $insc->decision_finale_fr,
                'decision_ar'     => $insc->decision_finale_ar,
            ];
        })->sortBy(fn ($s) => ($s['nom_fr'] ?? '').' '.($s['prenom_fr'] ?? ''))
          ->values();

        return Inertia::render('Prof/GroupeNotes', [
            'groupe'   => $groupe,
            'students' => $students,
        ]);
    }

    public function saveNotes(Request $request, int $groupeId): JsonResponse
    {
        $user = auth()->user();
        $prof = $user->prof;

        $groupe = \App\Models\Groupe::where('prof_id', $prof->id)->findOrFail($groupeId);

        $validated = $request->validate([
            'notes'                      => 'required|array',
            'notes.*.etud_mod_id'        => 'required|exists:etudiant_module,id',
            'notes.*.note_normale'       => 'nullable|numeric|min:0|max:20',
            'notes.*.note_rattrapage'    => 'nullable|numeric|min:0|max:20',
        ]);

        foreach ($validated['notes'] as $item) {
            \App\Models\InscriptionExamen::updateOrCreate(
                [
                    'etud_mod_id' => $item['etud_mod_id'],
                    'groupe_id'   => $groupeId,
                ],
                [
                    'note_normale'    => $item['note_normale'] ?? null,
                    'note_rattrapage' => $item['note_rattrapage'] ?? null,
                ]
            );
        }

        return response()->json(['message' => 'Notes enregistrées avec succès']);
    }
}
