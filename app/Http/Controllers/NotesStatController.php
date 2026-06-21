<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use App\Models\Module;
use App\Models\Niveau;
use App\Models\Semestre;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class NotesStatController extends Controller
{
    public function index(Request $request)
    {
        $filieres = Filiere::orderBy('code')->get(['id', 'code', 'nom_fr', 'nom_ar']);

        $filiereId  = $request->get('filiere_id');
        $niveauId   = $request->get('niveau_id');
        $semestreId = $request->get('semestre_id');
        $moduleId   = $request->get('module_id');
        $nexam      = $request->get('Nexam');

        $niveaux   = collect();
        $semestres = collect();
        $modules   = collect();
        $stats     = null;
        $perModule = collect();
        $distribution = [];

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

        $query = DB::table('note_exam')
            ->join('etudiant_module', 'note_exam.etud_mod_id', '=', 'etudiant_module.id')
            ->join('module', 'etudiant_module.module_id', '=', 'module.id')
            ->join('etudiant', 'etudiant_module.etudiant_id', '=', 'etudiant.id');

        if ($filiereId) {
            $query->join('semestre as s1', 'module.semestre_id', '=', 's1.id')
                ->join('niveau as n1', 's1.niveau_id', '=', 'n1.id')
                ->where('n1.filiere_id', $filiereId);
        }
        if ($niveauId) {
            $query->join('semestre as s2', 'module.semestre_id', '=', 's2.id')
                ->where('s2.niveau_id', $niveauId);
        }
        if ($semestreId) {
            $query->where('module.semestre_id', $semestreId);
        }
        if ($moduleId) {
            $query->where('etudiant_module.module_id', $moduleId);
        }
        if ($nexam) {
            $query->where('note_exam.Nexam', $nexam);
        }

        $stats = (clone $query)->selectRaw('
            COUNT(DISTINCT etudiant_module.etudiant_id) as total_students,
            COUNT(DISTINCT etudiant_module.module_id) as total_modules,
            COUNT(note_exam.id) as total_inscriptions,
            ROUND(AVG(CASE WHEN note_exam.note_normale = 99 THEN NULL ELSE note_exam.note_normale END), 2) as avg_note_normale,
            ROUND(AVG(CASE WHEN note_exam.note_finale = 99 THEN NULL ELSE note_exam.note_finale END), 2) as avg_note_finale,
            SUM(CASE WHEN COALESCE(NULLIF(note_exam.note_finale, 99), NULLIF(note_exam.note_normale, 99), 0) >= 10 THEN 1 ELSE 0 END) as pass_count,
            SUM(CASE WHEN COALESCE(NULLIF(note_exam.note_finale, 99), NULLIF(note_exam.note_normale, 99), 0) < 10 AND COALESCE(note_exam.note_finale, note_exam.note_normale) IS NOT NULL THEN 1 ELSE 0 END) as fail_count,
            SUM(CASE WHEN note_exam.note_normale IS NOT NULL THEN 1 ELSE 0 END) as with_note_normale,
            SUM(CASE WHEN note_exam.note_rattrapage IS NOT NULL THEN 1 ELSE 0 END) as with_note_rattrapage,
            SUM(CASE WHEN note_exam.note_finale IS NOT NULL THEN 1 ELSE 0 END) as with_note_finale
        ')->first();

        $perModule = (clone $query)
            ->selectRaw('
                etudiant_module.module_id,
                module.code_module,
                module.nom_fr,
                module.nom_ar,
                COUNT(DISTINCT etudiant_module.etudiant_id) as student_count,
                ROUND(AVG(CASE WHEN note_exam.note_finale = 99 THEN NULL ELSE note_exam.note_finale END), 2) as avg_note_finale,
                SUM(CASE WHEN COALESCE(NULLIF(note_exam.note_finale, 99), NULLIF(note_exam.note_normale, 99), 0) >= 10 THEN 1 ELSE 0 END) as pass_count,
                SUM(CASE WHEN COALESCE(NULLIF(note_exam.note_finale, 99), NULLIF(note_exam.note_normale, 99), 0) < 10 AND COALESCE(note_exam.note_finale, note_exam.note_normale) IS NOT NULL THEN 1 ELSE 0 END) as fail_count
            ')
            ->groupBy('etudiant_module.module_id', 'module.code_module', 'module.nom_fr', 'module.nom_ar')
            ->orderBy('student_count', 'desc')
            ->get();

        $distributionRaw = (clone $query)
            ->selectRaw('
                CASE
                    WHEN NULLIF(COALESCE(note_exam.note_finale, note_exam.note_normale), 99) IS NULL THEN -1
                    WHEN NULLIF(COALESCE(note_exam.note_finale, note_exam.note_normale), 99) <= 5 THEN 0
                    WHEN NULLIF(COALESCE(note_exam.note_finale, note_exam.note_normale), 99) <= 10 THEN 1
                    WHEN NULLIF(COALESCE(note_exam.note_finale, note_exam.note_normale), 99) <= 15 THEN 2
                    ELSE 3
                END as bucket,
                COUNT(*) as count
            ')
            ->whereNotNull(DB::raw('COALESCE(note_exam.note_finale, note_exam.note_normale)'))
            ->groupBy('bucket')
            ->pluck('count', 'bucket');

        $distribution = [
            'no_grade' => $distributionRaw->get(-1, 0),
            '0_5'      => $distributionRaw->get(0, 0),
            '5_10'     => $distributionRaw->get(1, 0),
            '10_15'    => $distributionRaw->get(2, 0),
            '15_20'    => $distributionRaw->get(3, 0),
        ];

        return Inertia::render('Notes/Index', [
            'filieres'  => $filieres,
            'niveaux'   => $niveaux,
            'semestres' => $semestres,
            'modules'   => $modules,
            'stats'     => $stats,
            'perModule' => $perModule,
            'distribution' => $distribution,
            'filters'   => [
                'filiere_id'  => $filiereId,
                'niveau_id'   => $niveauId,
                'semestre_id' => $semestreId,
                'module_id'   => $moduleId,
                'Nexam'       => $nexam,
            ],
        ]);
    }
}
