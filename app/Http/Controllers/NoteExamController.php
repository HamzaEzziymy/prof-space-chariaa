<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use App\Models\Module;
use App\Models\Niveau;
use App\Models\NoteExam;
use App\Models\Salle;
use App\Models\Semestre;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoteExamController extends Controller
{
    public function index(Request $request): Response
    {
        $filieres = Filiere::orderBy('code')->get(['id', 'code', 'nom_fr', 'nom_ar']);
        $salles   = Salle::orderBy('code_salle')->get(['id', 'code_salle', 'nomSalle_fr', 'nomSalle_ar']);

        $filiereId  = $request->get('filiere_id');
        $niveauId   = $request->get('niveau_id');
        $semestreId = $request->get('semestre_id');
        $moduleId   = $request->get('module_id');
        $nexam      = $request->get('Nexam', 1);
        $groupe     = $request->get('Groupe');

        $niveaux   = collect();
        $semestres = collect();
        $modules   = collect();
        $rows      = collect();

        if ($filiereId) {
            $niveaux = Niveau::where('filiere_id', $filiereId)
                ->orderBy('ordre')->orderBy('code')
                ->get(['id', 'code', 'nom_fr', 'nom_ar']);
        }

        if ($niveauId) {
            $semestres = Semestre::where('niveau_id', $niveauId)
                ->orderBy('numero')->orderBy('code')
                ->get(['id', 'code', 'nom_fr', 'nom_ar']);
        }

        if ($semestreId) {
            $modules = Module::where('semestre_id', $semestreId)
                ->orderBy('code_module')
                ->get(['id', 'code_module', 'nom_fr', 'nom_ar']);
        }

        if ($moduleId && $nexam) {
            $query = \App\Models\EtudiantModule::where('module_id', $moduleId)
                ->with([
                    'etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE,sexe,niveau_id',
                ])
                ->with(['noteExams' => function ($q) use ($nexam, $groupe) {
                    $q->where('Nexam', $nexam);
                    if ($groupe) {
                        $q->where('Groupe', $groupe);
                    }
                }]);

            $enrollments = $query->get();

            $rows = $enrollments->map(function ($enrollment) use ($nexam, $groupe) {
                $note = $enrollment->noteExams->first();
                return [
                    'etud_mod_id'    => $enrollment->id,
                    'etudiant'       => $enrollment->etudiant,
                    'note'           => $note ? [
                        'id'              => $note->id,
                        'note_normale'    => $note->note_normale,
                        'note_rattrapage' => $note->note_rattrapage,
                        'note_finale'     => $note->note_finale,
                        'Groupe'          => $note->Groupe,
                        'id_salle'        => $note->id_salle,
                    ] : null,
                ];
            });

            $groups = \App\Models\EtudiantModule::where('module_id', $moduleId)
                ->join('note_exam', 'etudiant_module.id', '=', 'note_exam.etud_mod_id')
                ->where('note_exam.Nexam', $nexam)
                ->whereNotNull('note_exam.Groupe')
                ->distinct()
                ->pluck('note_exam.Groupe')
                ->sort()
                ->values();
        } else {
            $groups = collect();
        }

        return Inertia::render('Notes/Index', [
            'filieres'       => $filieres,
            'niveaux'        => $niveaux,
            'semestres'      => $semestres,
            'modules'        => $modules,
            'salles'         => $salles,
            'rows'           => $rows,
            'groups'         => $groups,
            'filters'        => [
                'filiere_id'  => $filiereId,
                'niveau_id'   => $niveauId,
                'semestre_id' => $semestreId,
                'module_id'   => $moduleId,
                'Nexam'       => $nexam,
                'Groupe'      => $groupe,
            ],
        ]);
    }

    public function bulkUpdate(Request $request)
    {
        $data = $request->validate([
            'notes'                => 'required|array',
            'notes.*.etud_mod_id'  => 'required|exists:etudiant_module,id',
            'notes.*.Nexam'        => 'required|integer|min:1',
            'notes.*.note_normale'    => 'nullable|numeric|min:0|max:20',
            'notes.*.note_rattrapage' => 'nullable|numeric|min:0|max:20',
            'notes.*.note_finale'     => 'nullable|numeric|min:0|max:20',
            'notes.*.Groupe'          => 'nullable|string|max:255',
            'notes.*.id_salle'        => 'nullable|exists:salle,id',
        ]);

        $saved = 0;
        foreach ($data['notes'] as $item) {
            $note = NoteExam::updateOrCreate(
                [
                    'etud_mod_id' => $item['etud_mod_id'],
                    'Nexam'       => $item['Nexam'],
                ],
                [
                    'note_normale'    => $item['note_normale'] ?? null,
                    'note_rattrapage' => $item['note_rattrapage'] ?? null,
                    'note_finale'     => $item['note_finale'] ?? null,
                    'Groupe'          => $item['Groupe'] ?? null,
                    'id_salle'        => $item['id_salle'] ?? null,
                ]
            );
            if ($note->wasRecentlyCreated || $note->wasChanged()) {
                $saved++;
            }
        }

        return back()->with('success', $saved > 0 ? 'notes_saved' : 'notes_no_changes');
    }

    public function destroy(NoteExam $noteExam)
    {
        $noteExam->delete();
        return back()->with('success', 'note_deleted');
    }
}
