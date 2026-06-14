<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Module;
use App\Models\NoteExam;
use App\Models\EtudiantModule;
use App\Models\InscriptionExamen;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use App\Http\Controllers\Concerns\HasExcelParser;

class InscriptionExamenController extends Controller
{
    use HasExcelParser;

    public function index(Request $request)
    {
        $perPage = 15;

        $allModules = Module::select('id', 'nom_fr', 'nom_ar', 'code_module')
            ->orderBy('nom_fr')->get();

        $stats = [
            'total'   => InscriptionExamen::count(),
            'with_grades'    => InscriptionExamen::whereNotNull('note_normale')->count(),
        ];

        $items = Module::with([
            'inscriptionsExamen' => fn ($q) => $q->with('etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE')
                ->orderBy(\DB::raw('(SELECT nom_fr FROM etudiant WHERE etudiant.id = inscription_examen.etudiant_id)')),
        ])
        ->has('inscriptionsExamen')
        ->orderBy('nom_fr')
        ->paginate($perPage)
        ->withQueryString()
        ->through(function ($m) use ($request) {
            // Load note_exam records for all inscriptions in this module
            $moduleId = $m->id;
            $etudiantIds = $m->inscriptionsExamen->pluck('etudiant_id');
            $etudMods = EtudiantModule::where('module_id', $moduleId)
                ->whereIn('etudiant_id', $etudiantIds)
                ->get(['id', 'etudiant_id']);
            $etudModIds = $etudMods->pluck('id');
            $noteExams = NoteExam::whereIn('etud_mod_id', $etudModIds)
                ->where('Nexam', $request->query('nexam', 1))
                ->get()
                ->keyBy('etud_mod_id');
            // Map etud_mod_id to etudiant_id
            $noteByEtudiant = collect();
            foreach ($etudMods as $em) {
                $noteByEtudiant[$em->etudiant_id] = $noteExams->get($em->id);
            }

            // Filter eligible inscriptions: for rattrapage, only students with note_normale < 10 or null
            $eligibleIds = $m->inscriptionsExamen->filter(function ($ie) use ($noteByEtudiant) {
                if ($ie->statut !== 'rattrapage') return true;
                $nn = $noteByEtudiant[$ie->etudiant_id]?->note_normale ?? $ie->note_normale;
                return $nn === null || $nn < 10;
            })->pluck('id')->toArray();

            $filtered = $m->inscriptionsExamen->whereIn('id', $eligibleIds);
            $inscriptions = $filtered->map(function ($ie) use ($noteByEtudiant) {
                    $noteNormale = $noteByEtudiant[$ie->etudiant_id]?->note_normale ?? $ie->note_normale;
                    return [
                    'id'         => $ie->id,
                    'Nexam'      => $ie->Nexam,
                    'statut'     => $ie->statut,
                    'note_normale'    => $noteNormale,
                    'note_rattrapage' => $noteByEtudiant[$ie->etudiant_id]?->note_rattrapage ?? $ie->note_rattrapage,
                    'note_finale'     => $noteByEtudiant[$ie->etudiant_id]?->note_finale ?? $ie->note_finale,
                    'note_normale_decision_ar' => $noteByEtudiant[$ie->etudiant_id]?->note_normale_decision_ar ?? $ie->note_normale_decision_ar,
                    'note_normale_decision_fr' => $noteByEtudiant[$ie->etudiant_id]?->note_normale_decision_fr ?? $ie->note_normale_decision_fr,
                    'note_ratt_decision_ar'    => $noteByEtudiant[$ie->etudiant_id]?->note_ratt_decision_ar ?? $ie->note_ratt_decision_ar,
                    'note_ratt_decision_fr'    => $noteByEtudiant[$ie->etudiant_id]?->note_ratt_decision_fr ?? $ie->note_ratt_decision_fr,
                    'decision_finale_ar' => $noteByEtudiant[$ie->etudiant_id]?->decision_finale_ar ?? $ie->decision_finale_ar,
                    'decision_finale_fr' => $noteByEtudiant[$ie->etudiant_id]?->decision_finale_fr ?? $ie->decision_finale_fr,
                    'etudiant'   => $ie->etudiant ? [
                        'id'       => $ie->etudiant->id,
                        'nom_fr'   => $ie->etudiant->nom_fr,
                        'prenom_fr'=> $ie->etudiant->prenom_fr,
                        'nom_ar'   => $ie->etudiant->nom_ar,
                        'prenom_ar'=> $ie->etudiant->prenom_ar,
                        'CNE'      => $ie->etudiant->CNE,
                    ] : null,
                    ];
                })->values();

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
            'inscriptions_count' => $inscriptions->count(),
            'inscriptions' => $inscriptions,
        ];
    });

        return Inertia::render('InscriptionExamen/Index', [
            'items'      => $items,
            'allModules' => $allModules,
            'stats'      => $stats,
            'groupBy'    => $request->query('group_by', 'module'),
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
            $record = InscriptionExamen::firstOrCreate(
                ['module_id' => $moduleId, 'etudiant_id' => $s['etudiant_id']],
                ['Nexam' => $s['Nexam'] ?? null, 'statut' => 'normale']
            );
            if ($record->wasRecentlyCreated) $created++;
            else $skipped++;
        }

        $msg = $created > 0
            ? "$created inscription(s) créée(s)" . ($skipped > 0 ? ", $skipped déjà existante(s)" : "")
            : "Aucun nouvel étudiant inscrit";

        return back()->with('success', $msg);
    }

    public function updateStatut(Request $request, InscriptionExamen $inscriptionExamen)
    {
        $validated = $request->validate([
            'statut' => 'required|in:normale,rattrapage,finale',
        ]);

        $inscriptionExamen->update(['statut' => $validated['statut']]);

        return back()->with('success', 'Statut mis à jour');
    }

    public function batchStatut(Request $request, $module)
    {
        $validated = $request->validate([
            'statut' => 'required|in:normale,rattrapage,finale',
        ]);

        $statut = $validated['statut'];

        if ($statut === 'finale') {
            // Auto-calculate note_finale = GREATEST(note_normale, note_rattrapage)
            InscriptionExamen::where('module_id', $module)
                ->update([
                    'statut' => 'finale',
                    'note_finale' => \DB::raw('GREATEST(COALESCE(note_normale,0), COALESCE(note_rattrapage,0))'),
                ]);
        } else {
            InscriptionExamen::where('module_id', $module)
                ->update(['statut' => $statut]);
        }

        $updated = InscriptionExamen::where('module_id', $module)->count();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => "Statut changé en $statut pour $updated inscription(s)"]);
        }

        return back()->with('success', "Statut mis à jour pour $updated inscription(s)");
    }

    public function destroy(InscriptionExamen $inscriptionExamen)
    {
        $inscriptionExamen->delete();
        return back()->with('success', 'inscription_examen_deleted');
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

        // Check which already have an inscription for this module
        $existing = InscriptionExamen::where('module_id', $module)
            ->whereIn('etudiant_id', $students->pluck('id'))
            ->pluck('etudiant_id')
            ->toArray();

        return response()->json([
            'students' => $students,
            'existing_ids' => $existing,
        ]);
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

            InscriptionExamen::create([
                'module_id'       => $moduleId,
                'etudiant_id'     => $etudiantId,
                'Nexam'           => $nexam,
                'statut'          => $statut ?? 'normale',
                'note_normale'    => $noteN,
                'note_rattrapage' => $noteR,
                'note_finale'     => $noteF,
            ]);

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
