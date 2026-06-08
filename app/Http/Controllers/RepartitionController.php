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
    /**
     * Main page — shows all niveaux grouped with stats, plus a "create" modal.
     */
    public function index(Request $request): Response
    {
        $filieres = Filiere::orderBy('code')->get(['id', 'code', 'nom_fr', 'nom_ar']);

        $niveaux = Niveau::with('filiere')
            ->withCount('semestres')
            ->select('niveaux.*')
            ->selectSub(function ($q) {
                $q->selectRaw('COUNT(DISTINCT em.etudiant_id)')
                    ->from('etudiant_module as em')
                    ->join('module as m', 'm.id', '=', 'em.module_id')
                    ->join('semestres as s', 's.id', '=', 'm.semestre_id')
                    ->whereColumn('s.niveau_id', 'niveaux.id');
            }, 'total_students')
            ->selectSub(function ($q) {
                $q->selectRaw('COUNT(DISTINCT ne.etud_mod_id)')
                    ->from('note_exam as ne')
                    ->join('etudiant_module as em', 'em.id', '=', 'ne.etud_mod_id')
                    ->join('module as m', 'm.id', '=', 'em.module_id')
                    ->join('semestres as s', 's.id', '=', 'm.semestre_id')
                    ->whereColumn('s.niveau_id', 'niveaux.id')
                    ->whereNotNull('ne.id_salle');
            }, 'assigned_count')
            ->orderBy('filiere_id')
            ->orderBy('ordre')
            ->orderBy('code')
            ->get();

        $allNiveaux = Niveau::orderBy('filiere_id')->orderBy('ordre')->orderBy('code')
            ->get(['id', 'code', 'nom_fr', 'nom_ar', 'filiere_id']);

        $allSemestres = Semestre::orderBy('numero')->orderBy('code')
            ->get(['id', 'code', 'nom_fr', 'nom_ar', 'niveau_id']);

        $allModules = Module::orderBy('code_module')
            ->get(['id', 'code_module', 'nom_fr', 'nom_ar', 'semestre_id']);

        $salles = Salle::whereNotNull('capacite')->where('capacite', '>', 0)
            ->orderBy('code_salle')
            ->get(['id', 'code_salle', 'nomSalle_fr', 'nomSalle_ar', 'capacite']);

        return Inertia::render('Repartition/Index', [
            'filieres'     => $filieres,
            'niveaux'      => $niveaux,
            'allNiveaux'   => $allNiveaux,
            'allSemestres' => $allSemestres,
            'allModules'   => $allModules,
            'salles'       => $salles,
        ]);
    }

    /**
     * Detail page for a specific niveau — shows semestres/modules/students/rooms.
     */
    public function show(Request $request, Niveau $niveau): Response
    {
        $niveau->load('filiere');

        $semestres = Semestre::where('niveau_id', $niveau->id)
            ->orderBy('numero')->orderBy('code')
            ->get(['id', 'code', 'nom_fr', 'nom_ar']);

        $moduleId = $request->get('module_id');
        $nexam    = $request->get('Nexam', 1);

        $modules = Module::whereIn('semestre_id', $semestres->pluck('id'))
            ->orderBy('code_module')
            ->get(['id', 'code_module', 'nom_fr', 'nom_ar', 'semestre_id']);

        $salles = Salle::whereNotNull('capacite')->where('capacite', '>', 0)
            ->orderBy('code_salle')
            ->get(['id', 'code_salle', 'nomSalle_fr', 'nomSalle_ar', 'capacite']);

        $students = collect();

        if ($moduleId) {
            $etudMods = EtudiantModule::where('module_id', $moduleId)
                ->with('etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE,sexe,niveau_id')
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
        }

        $totalCapacite = $salles->sum('capacite');

        return Inertia::render('Repartition/Show', [
            'niveau'        => $niveau,
            'semestres'     => $semestres,
            'modules'       => $modules,
            'salles'        => $salles,
            'students'      => $students,
            'totalCapacite' => $totalCapacite,
            'filters' => [
                'module_id' => $moduleId,
                'Nexam'     => $nexam,
            ],
        ]);
    }

    /**
     * API: get students enrolled in a module, with current room assignments.
     */
    public function getStudents(Request $request)
    {
        $moduleId = $request->get('module_id');
        $nexam    = $request->get('Nexam', 1);

        if (!$moduleId) {
            return response()->json([]);
        }

        $etudMods = EtudiantModule::where('module_id', $moduleId)
            ->with('etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE,sexe')
            ->with(['noteExams' => function ($q) use ($nexam) {
                $q->where('Nexam', $nexam);
            }])
            ->get();

        return response()->json($etudMods->map(function ($em) use ($nexam) {
            $note = $em->noteExams->first();
            return [
                'etud_mod_id' => $em->id,
                'etudiant'    => $em->etudiant,
                'id_salle'    => $note?->id_salle,
            ];
        }));
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
