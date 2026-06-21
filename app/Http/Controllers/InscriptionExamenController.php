<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Module;
use App\Models\NoteExam;
use App\Models\EtudiantModule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use App\Http\Controllers\Concerns\HasExcelParser;
use Illuminate\Support\Facades\DB;

class InscriptionExamenController extends Controller
{
    use HasExcelParser;

    public function index(Request $request)
    {
        $perPage = 15;

        $allModules = Module::select('id', 'nom_fr', 'nom_ar', 'code_module')
            ->orderBy('nom_fr')->get();

        $modulesWithExam = Module::select('id', 'nom_fr', 'nom_ar', 'code_module')
            ->whereHas('noteExams')
            ->orderBy('nom_fr')->get();

        $stats = [
            'total'   => NoteExam::distinct('etud_mod_id')->count('etud_mod_id'),
            'with_grades'    => NoteExam::whereNotNull('note_normale')->distinct('etud_mod_id')->count('etud_mod_id'),
        ];

        $items = Module::with([
            'noteExams' => fn ($q) => $q->with('etudiantModule.etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE')
                ->orderBy(DB::raw('(SELECT nom_fr FROM etudiant JOIN etudiant_module ON etudiant_module.etudiant_id = etudiant.id WHERE etudiant_module.id = note_exam.etud_mod_id)')),
        ])
        ->has('noteExams')
        ->orderBy('nom_fr')
        ->paginate($perPage)
        ->withQueryString()
        ->through(function ($m) use ($request) {
            $nexam = $request->query('nexam', 1);

            // Deduplicate by student — each student has one record, Nexam is just a field
            $inscriptions = $m->noteExams->groupBy('etud_mod_id')->map(function ($group) {
                $ne = $group->first();
                $etud = $ne->etudiantModule?->etudiant;
                return [
                    'id'         => $ne->id,
                    'Nexam'      => $ne->Nexam,
                    'statut'     => $ne->statut ?? 'normale',
                    'note_normale'    => $ne->note_normale,
                    'note_rattrapage' => $ne->note_rattrapage,
                    'note_finale'     => $ne->note_finale,
                    'note_normale_decision_ar' => $ne->note_normale_decision_ar,
                    'note_normale_decision_fr' => $ne->note_normale_decision_fr,
                    'note_ratt_decision_ar'    => $ne->note_ratt_decision_ar,
                    'note_ratt_decision_fr'    => $ne->note_ratt_decision_fr,
                    'decision_finale_ar' => $ne->decision_finale_ar,
                    'decision_finale_fr' => $ne->decision_finale_fr,
                    'etudiant'   => $etud ? [
                        'id'       => $etud->id,
                        'nom_fr'   => $etud->nom_fr,
                        'prenom_fr'=> $etud->prenom_fr,
                        'nom_ar'   => $etud->nom_ar,
                        'prenom_ar'=> $etud->prenom_ar,
                        'CNE'      => $etud->CNE,
                    ] : null,
                ];
            })->values();

            // Filter eligible: for rattrapage, only students with note_normale < 10 or null or absent (99)
            $eligibleIds = $inscriptions->filter(function ($ie) {
                if ($ie['statut'] !== 'rattrapage') return true;
                $nn = $ie['note_normale'];
                return $nn === null || $nn < 10 || (int) $nn === 99;
            })->pluck('id')->toArray();

            $filtered = $inscriptions->whereIn('id', $eligibleIds)->values();

            return [
                'id'          => $m->id,
                'nom_fr'      => $m->nom_fr,
                'nom_ar'      => $m->nom_ar,
                'code_module' => $m->code_module,
                'coefficient' => $m->coefficient,
                'semestre'    => $m->semestre ? [
                    'id'     => $m->semestre->id,
                    'nom_fr' => $m->semestre->nom_fr,
                    'nom_ar' => $m->semestre->nom_ar,
                    'niveau' => $m->semestre->niveau ? [
                        'id'     => $m->semestre->niveau->id,
                        'nom_fr' => $m->semestre->niveau->nom_fr,
                        'nom_ar' => $m->semestre->niveau->nom_ar,
                        'filiere' => $m->semestre->niveau->filiere ? [
                            'id'     => $m->semestre->niveau->filiere->id,
                            'nom_fr' => $m->semestre->niveau->filiere->nom_fr,
                            'nom_ar' => $m->semestre->niveau->filiere->nom_ar,
                        ] : null,
                    ] : null,
                ] : null,
                'inscriptions_count' => $filtered->count(),
                'inscriptions' => $filtered,
            ];
        });

        return Inertia::render('InscriptionExamen/Index', [
            'items'           => $items,
            'allModules'      => $allModules,
            'modulesWithExam' => $modulesWithExam,
            'stats'           => $stats,
            'groupBy'         => $request->query('group_by', 'module'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:module,id',
            'students'  => 'required|array',
            'students.*.etudiant_id' => 'required|exists:etudiant,id',
            'students.*.Nexam'       => 'nullable|integer|min:1',
        ]);

        $moduleId = $validated['module_id'];
        $created = 0;
        $skipped = 0;

        foreach ($validated['students'] as $s) {
            $em = EtudiantModule::firstOrCreate(
                ['module_id' => $moduleId, 'etudiant_id' => $s['etudiant_id']]
            );

            $record = NoteExam::firstOrCreate(
                ['etud_mod_id' => $em->id],
                ['Nexam' => $s['Nexam'] ?? 1, 'statut' => 'normale']
            );
            if ($record->wasRecentlyCreated) $created++;
            else $skipped++;
        }

        $msg = $created > 0
            ? "$created inscription(s) créée(s)" . ($skipped > 0 ? ", $skipped déjà existante(s)" : "")
            : "Aucun nouvel étudiant inscrit";

        return back()->with('success', $msg);
    }

    public function updateStatut(Request $request, NoteExam $noteExam)
    {
        $validated = $request->validate([
            'statut' => 'required|in:normale,rattrapage,finale',
        ]);

        $noteExam->update(['statut' => $validated['statut']]);

        return back()->with('success', 'Statut mis à jour');
    }

    public function batchStatut(Request $request, $module)
    {
        $validated = $request->validate([
            'statut' => 'required|in:normale,rattrapage,finale',
        ]);

        $statut = $validated['statut'];

        $etudModIds = EtudiantModule::where('module_id', $module)->pluck('id');

        if ($statut === 'finale') {
            NoteExam::whereIn('etud_mod_id', $etudModIds)
                ->update([
                    'statut' => 'finale',
                    'note_finale' => DB::raw('COALESCE(note_rattrapage, note_normale)'),
                ]);
        } else {
            NoteExam::whereIn('etud_mod_id', $etudModIds)
                ->update(['statut' => $statut]);
        }

        $updated = NoteExam::whereIn('etud_mod_id', $etudModIds)->count();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => "Statut changé en $statut pour $updated inscription(s)"]);
        }

        return back()->with('success', "Statut mis à jour pour $updated inscription(s)");
    }

    public function destroy(NoteExam $noteExam)
    {
        $noteExam->delete();
        return back()->with('success', 'Inscription supprimée');
    }

    public function getEnrolledStudents($module): JsonResponse
    {
        $etudiantIds = EtudiantModule::where('module_id', $module)
            ->pluck('etudiant_id');

        $students = Etudiant::whereIn('id', $etudiantIds)
            ->select('id', 'nom_fr', 'prenom_fr', 'nom_ar', 'prenom_ar', 'CNE')
            ->orderBy('nom_fr')
            ->orderBy('prenom_fr')
            ->get()
            ->map(fn ($e) => [
                'id'       => $e->id,
                'nom_fr'   => $e->nom_fr,
                'prenom_fr'=> $e->prenom_fr,
                'nom_ar'   => $e->nom_ar,
                'prenom_ar'=> $e->prenom_ar,
                'CNE'      => $e->CNE,
            ]);

        $etudMods = EtudiantModule::where('module_id', $module)->pluck('id');
        $existing = NoteExam::whereIn('etud_mod_id', $etudMods)
            ->pluck('etud_mod_id')
            ->toArray();

        $existingEtudiantIds = EtudiantModule::whereIn('id', $existing)
            ->pluck('etudiant_id')
            ->toArray();

        return response()->json([
            'students' => $students,
            'existing_ids' => $existingEtudiantIds,
        ]);
    }

    public function exportData(Request $request): JsonResponse
    {
        $moduleId = $request->query('module_id');
        $statut   = $request->query('statut');

        $query = NoteExam::with([
            'etudiantModule.etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE',
            'etudiantModule.module:id,code_module,nom_fr,nom_ar',
        ]);

        if ($moduleId) {
            $query->whereHas('etudiantModule', fn ($q) => $q->where('module_id', $moduleId));
        }
        if ($statut && in_array($statut, ['normale', 'rattrapage', 'finale'])) {
            $query->where('statut', $statut);
        }

        $data = $query->get()->groupBy('etud_mod_id')->map(function ($group) {
            $ne = $group->first();
            $em = $ne->etudiantModule;
            $etud = $em?->etudiant;
            $module = $em?->module;

            return [
                'CNE'          => $etud?->CNE,
                'nom_fr'       => $etud?->nom_fr,
                'prenom_fr'    => $etud?->prenom_fr,
                'nom_ar'       => $etud?->nom_ar,
                'prenom_ar'    => $etud?->prenom_ar,
                'code_module'  => $module?->code_module,
                'module_nom_fr'=> $module?->nom_fr,
                'module_nom_ar'=> $module?->nom_ar,
                'statut'       => $ne->statut ?? 'normale',
                'Nexam'        => $ne->Nexam,
                'note_normale' => $ne->note_normale,
                'note_rattrapage' => $ne->note_rattrapage,
                'note_finale'  => $ne->note_finale,
                'decision_normale_fr' => $ne->note_normale_decision_fr,
                'decision_normale_ar' => $ne->note_normale_decision_ar,
                'decision_ratt_fr'    => $ne->note_ratt_decision_fr,
                'decision_ratt_ar'    => $ne->note_ratt_decision_ar,
                'decision_finale_fr'  => $ne->decision_finale_fr,
                'decision_finale_ar'  => $ne->decision_finale_ar,
            ];
        })->values();

        return response()->json(['data' => $data]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|max:5120']);

        $file      = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $mime      = $file->getMimeType() ?? '';

        $isXlsx = in_array($extension, ['xlsx', 'ods'])
            || str_contains($mime, 'spreadsheetml')
            || str_contains($mime, 'opendocument');

        $isXls = $extension === 'xls'
            || str_contains($mime, 'ms-excel')
            || str_contains($mime, 'msexcel');

        try {
            if ($isXlsx) {
                $rows = $this->parseXlsx($file->getRealPath());
            } elseif ($isXls) {
                $rows = $this->parseXls($file->getRealPath());
            } else {
                $rows = $this->parseCsv($file->getRealPath());
            }
        } catch (\Throwable $e) {
            return response()->json(['error' => 'parse_error', 'message' => $e->getMessage()], 422);
        }

        if (count($rows) < 2) {
            return response()->json(['error' => 'empty_file'], 422);
        }

        $header = array_map(
            fn($h) => mb_strtolower(trim(preg_replace('/\s+/u', '_', $this->sanitize($h))), 'UTF-8'),
            $rows[0]
        );

        $imported = 0;
        $skipped  = 0;
        $report   = [];

        $students = Etudiant::pluck('id', 'CNE');
        $modules  = Module::pluck('id', 'code_module');

        foreach (array_slice($rows, 1) as $lineNum => $row) {
            if (count(array_filter($row, fn($v) => $v !== '' && $v !== null)) === 0) continue;

            $data = [];
            foreach ($header as $i => $key) {
                $data[$key] = isset($row[$i]) ? trim((string) $row[$i]) : null;
            }

            $cne        = $data['cne'] ?? null;
            $codeModule = $data['code_module'] ?? null;
            $nexam      = isset($data['nexam']) && $data['nexam'] !== '' ? (int) $data['nexam'] : null;
            $statut     = isset($data['statut']) && in_array($data['statut'], ['normale', 'rattrapage', 'finale']) ? $data['statut'] : null;
            $noteN      = isset($data['note_normale']) && $data['note_normale'] !== '' ? (float) $data['note_normale'] : null;
            $noteR      = isset($data['note_rattrapage']) && $data['note_rattrapage'] !== '' ? (float) $data['note_rattrapage'] : null;
            $noteF      = isset($data['note_finale']) && $data['note_finale'] !== '' ? (float) $data['note_finale'] : null;
            $line       = $lineNum + 2;

            if (!$cne || !$codeModule) {
                $report[] = ['line' => $line, 'cne' => $cne, 'code_module' => $codeModule, 'status' => 'rejected', 'reason' => 'CNE ou code_module manquant'];
                $skipped++;
                continue;
            }

            $etudiantId = $students[$cne] ?? null;
            $moduleId   = $modules[$codeModule] ?? null;

            if (!$etudiantId) {
                $report[] = ['line' => $line, 'cne' => $cne, 'code_module' => $codeModule, 'status' => 'rejected', 'reason' => "CNE \"{$cne}\" introuvable"];
                $skipped++;
                continue;
            }

            if (!$moduleId) {
                $report[] = ['line' => $line, 'cne' => $cne, 'code_module' => $codeModule, 'status' => 'rejected', 'reason' => "Code module \"{$codeModule}\" introuvable"];
                $skipped++;
                continue;
            }

            $em = EtudiantModule::firstOrCreate(
                ['module_id' => $moduleId, 'etudiant_id' => $etudiantId]
            );

            NoteExam::updateOrCreate(
                ['etud_mod_id' => $em->id],
                [
                    'Nexam'           => $nexam ?? 1,
                    'statut'          => $statut ?? 'normale',
                    'note_normale'    => $noteN,
                    'note_rattrapage' => $noteR,
                    'note_finale'     => $noteF,
                ]
            );

            $report[] = ['line' => $line, 'cne' => $cne, 'code_module' => $codeModule, 'status' => 'imported', 'reason' => null];
            $imported++;
        }

        return response()->json([
            'imported' => $imported,
            'skipped'  => $skipped,
            'report'   => $report,
        ]);
    }
}
