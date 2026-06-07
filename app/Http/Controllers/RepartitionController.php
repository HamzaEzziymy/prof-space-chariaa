<?php

namespace App\Http\Controllers;

use App\Models\EtudiantModule;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Niveau;
use App\Models\NoteExam;
use App\Models\Salle;
use App\Models\Semestre;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RepartitionController extends Controller
{
    public function index(Request $request): Response
    {
        $filieres = Filiere::orderBy('code')->get(['id', 'code', 'nom_fr', 'nom_ar']);
        $salles   = Salle::whereNotNull('capacite')->where('capacite', '>', 0)
            ->orderBy('code_salle')
            ->get(['id', 'code_salle', 'nomSalle_fr', 'nomSalle_ar', 'capacite']);

        $filiereId  = $request->get('filiere_id');
        $niveauId   = $request->get('niveau_id');
        $semestreId = $request->get('semestre_id');
        $moduleId   = $request->get('module_id');
        $nexam      = $request->get('Nexam', 1);

        $niveaux   = collect();
        $semestres = collect();
        $modules   = collect();
        $students  = collect();
        $assignments = collect();

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

        $totalCapacite = $salles->sum('capacite');

        if ($moduleId) {
            $etudMods = EtudiantModule::where('module_id', $moduleId)
                ->with('etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE,sexe')
                ->with(['noteExams' => function ($q) use ($nexam) {
                    $q->where('Nexam', $nexam);
                }])
                ->get();

            $students = $etudMods->map(function ($em) use ($nexam) {
                $note = $em->noteExams->first();
                return [
                    'etud_mod_id' => $em->id,
                    'etudiant'    => $em->etudiant,
                    'id_salle'    => $note?->id_salle,
                ];
            });

            $assignments = NoteExam::whereIn('etud_mod_id', $etudMods->pluck('id'))
                ->where('Nexam', $nexam)
                ->whereNotNull('id_salle')
                ->get(['etud_mod_id', 'id_salle']);
        }

        return Inertia::render('Repartition/Index', [
            'filieres'      => $filieres,
            'niveaux'       => $niveaux,
            'semestres'     => $semestres,
            'modules'       => $modules,
            'salles'        => $salles,
            'students'      => $students,
            'assignments'   => $assignments,
            'totalCapacite' => $totalCapacite,
            'filters' => [
                'filiere_id'  => $filiereId,
                'niveau_id'   => $niveauId,
                'semestre_id' => $semestreId,
                'module_id'   => $moduleId,
                'Nexam'       => $nexam,
            ],
        ]);
    }

    public function save(Request $request)
    {
        $data = $request->validate([
            'module_id'            => 'required|exists:module,id',
            'Nexam'                => 'required|integer|min:1',
            'repartition'          => 'required|array',
            'repartition.*.etud_mod_id' => 'required|exists:etudiant_module,id',
            'repartition.*.id_salle'    => 'nullable|exists:salle,id',
        ]);

        $saved = 0;
        foreach ($data['repartition'] as $item) {
            $note = NoteExam::updateOrCreate(
                [
                    'etud_mod_id' => $item['etud_mod_id'],
                    'Nexam'       => $data['Nexam'],
                ],
                [
                    'id_salle' => $item['id_salle'] ?? null,
                ]
            );
            if ($note->wasRecentlyCreated || $note->wasChanged()) {
                $saved++;
            }
        }

        return back()->with('success', $saved > 0 ? 'repartition_saved' : 'repartition_no_changes');
    }
}
