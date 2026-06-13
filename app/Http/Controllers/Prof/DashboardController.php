<?php

namespace App\Http\Controllers\Prof;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\EtudiantModule;
use App\Models\NoteExam;
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
            ? $prof->modules()->with('semestre.niveau.filiere')->get()
            : collect();

        $totalStudents = $modules->sum(fn ($m) => $m->etudiants()->count());

        return Inertia::render('Prof/Dashboard', [
            'prof'          => $prof,
            'totalStudents' => $totalStudents,
        ]);
    }

    public function moduleStudents(int $moduleId): Response
    {
        $user = auth()->user();
        $prof = $user->prof;

        $module = Module::where('prof_id', $prof->id)
            ->with('semestre.niveau.filiere')
            ->findOrFail($moduleId);

        $etudModIds = EtudiantModule::where('module_id', $module->id)->pluck('id');

        $statuts = \App\Models\InscriptionExamen::where('module_id', $module->id)
            ->pluck('statut', 'etudiant_id');

        $students = EtudiantModule::where('module_id', $module->id)
            ->with('etudiant')
            ->get()
            ->map(function ($em) use ($module, $statuts) {
                $nexams = NoteExam::where('etud_mod_id', $em->id)->pluck('Nexam')->unique()->values();

                return [
                    'etud_mod_id'     => $em->id,
                    'id'              => $em->etudiant->id,
                    'nom_fr'          => $em->etudiant->nom_fr,
                    'prenom_fr'       => $em->etudiant->prenom_fr,
                    'nom_ar'          => $em->etudiant->nom_ar,
                    'prenom_ar'       => $em->etudiant->prenom_ar,
                    'CNE'             => $em->etudiant->CNE,
                    'sexe'            => $em->etudiant->sexe,
                    'nexams'          => $nexams,
                    'statut'          => $statuts[$em->etudiant->id] ?? 'normale',
                ];
            })->sortBy(fn ($s) => ($s['nom_fr'] ?? '').' '.($s['prenom_fr'] ?? ''))
              ->values();

        return Inertia::render('Prof/ModuleNotes', [
            'module'   => $module,
            'students' => $students,
        ]);
    }

    public function saveNotes(Request $request, int $moduleId): JsonResponse
    {
        $user = auth()->user();
        $prof = $user->prof;

        $module = Module::where('prof_id', $prof->id)->findOrFail($moduleId);

        $validated = $request->validate([
            'notes'                      => 'required|array',
            'notes.*.etud_mod_id'        => 'required|exists:etudiant_module,id',
            'notes.*.note_normale'       => 'nullable|numeric|min:0|max:20',
            'notes.*.note_rattrapage'    => 'nullable|numeric|min:0|max:20',
            'notes.*.note_finale'        => 'nullable|numeric|min:0|max:20',
            'notes.*.Nexam'              => 'required|integer|min:1',
        ]);

        foreach ($validated['notes'] as $item) {
            NoteExam::updateOrCreate(
                [
                    'etud_mod_id' => $item['etud_mod_id'],
                    'Nexam'       => $item['Nexam'],
                ],
                [
                    'note_normale'    => $item['note_normale'] ?? null,
                    'note_rattrapage' => $item['note_rattrapage'] ?? null,
                    'note_finale'     => $item['note_finale'] ?? null,
                ]
            );
        }

        return response()->json(['message' => 'Notes enregistrées avec succès']);
    }
}
