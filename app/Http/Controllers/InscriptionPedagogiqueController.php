<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Module;
use App\Models\EtudiantModule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use App\Http\Controllers\Concerns\HasExcelParser;

class InscriptionPedagogiqueController extends Controller
{
    use HasExcelParser;
    public function index(Request $request)
    {
        $groupBy = $request->get('group_by', 'module');
        $search  = $request->get('search', '');
        $perPage = 15;

        if ($groupBy === 'module') {
            $query = Module::query()
                ->with(['etudiants' => function ($q) {
                    $q->select('etudiant.id', 'etudiant.nom_fr', 'etudiant.prenom_fr', 'etudiant.nom_ar', 'etudiant.prenom_ar', 'etudiant.CNE', 'etudiant.photo_url');
                }, 'prof.user:id,nom_fr,prenom_fr'])
                ->withCount('etudiants as inscriptions_count')
                ->orderBy('nom_fr');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nom_fr',   'like', "%{$search}%")
                      ->orWhere('nom_ar', 'like', "%{$search}%")
                      ->orWhere('code_module', 'like', "%{$search}%");
                });
            }

            $items = $query->paginate($perPage)->withQueryString();

            $items->through(fn ($m) => [
                'id'             => $m->id,
                'nom_fr'         => $m->nom_fr,
                'nom_ar'         => $m->nom_ar,
                'code_module'    => $m->code_module,
                'coefficient'    => $m->coefficient,
                'inscriptions_count' => $m->inscriptions_count,
                'prof'           => $m->prof?->user
                    ? trim($m->prof->user->nom_fr . ' ' . $m->prof->user->prenom_fr)
                    : '—',
                'etudiants'      => $m->etudiants->map(fn ($e) => [
                    'id'        => $e->id,
                    'pivot_id'  => $e->pivot->id,
                    'nom_fr'    => $e->nom_fr,
                    'prenom_fr' => $e->prenom_fr,
                    'nom_ar'    => $e->nom_ar,
                    'prenom_ar' => $e->prenom_ar,
                    'CNE'       => $e->CNE,
                    'photo_url' => $e->photo_url,
                ]),
            ]);
        } else {
            $query = Etudiant::query()
                ->with(['modules' => function ($q) {
                    $q->select('module.id', 'module.nom_fr', 'module.nom_ar', 'module.code_module', 'module.coefficient');
                }])
                ->withCount('modules as inscriptions_count')
                ->orderBy('nom_fr');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nom_fr',   'like', "%{$search}%")
                      ->orWhere('prenom_fr', 'like', "%{$search}%")
                      ->orWhere('nom_ar',   'like', "%{$search}%")
                      ->orWhere('prenom_ar', 'like', "%{$search}%")
                      ->orWhere('CNE',        'like', "%{$search}%")
                      ->orWhere('CIN',        'like', "%{$search}%");
                });
            }

            $items = $query->paginate($perPage)->withQueryString();

            $items->through(fn ($e) => [
                'id'        => $e->id,
                'nom_fr'    => $e->nom_fr,
                'prenom_fr' => $e->prenom_fr,
                'nom_ar'    => $e->nom_ar,
                'prenom_ar' => $e->prenom_ar,
                'CNE'       => $e->CNE,
                'photo_url' => $e->photo_url,
                'filier'    => $e->filier,
                'inscriptions_count' => $e->inscriptions_count,
                'modules'   => $e->modules->map(fn ($m) => [
                    'id'          => $m->id,
                    'pivot_id'    => $m->pivot->id,
                    'nom_fr'      => $m->nom_fr,
                    'nom_ar'      => $m->nom_ar,
                    'code_module' => $m->code_module,
                    'coefficient' => $m->coefficient,
                ]),
            ]);
        }

        $allEtudiants = Etudiant::with('modules:id')
            ->select('id', 'nom_fr', 'prenom_fr', 'nom_ar', 'prenom_ar', 'CNE')
            ->orderBy('nom_fr')
            ->get()
            ->map(fn ($e) => [
                'id'         => $e->id,
                'nom_fr'     => $e->nom_fr,
                'prenom_fr'  => $e->prenom_fr,
                'nom_ar'     => $e->nom_ar,
                'prenom_ar'  => $e->prenom_ar,
                'CNE'        => $e->CNE,
                'module_ids' => $e->modules->pluck('id'),
            ]);

        $allModules = Module::select('id', 'nom_fr', 'nom_ar', 'code_module')
            ->orderBy('nom_fr')->get();

        $stats = [
            'total'        => EtudiantModule::count(),
            'students'     => EtudiantModule::distinct('etudiant_id')->count('etudiant_id'),
            'modules'      => EtudiantModule::distinct('module_id')->count('module_id'),
        ];

        return Inertia::render('Inscriptions/Index', [
            'items'        => $items,
            'groupBy'      => $groupBy,
            'filters'      => $request->only(['search', 'group_by']),
            'allEtudiants' => $allEtudiants,
            'allModules'   => $allModules,
            'stats'        => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'etudiant_id' => 'required|exists:etudiant,id',
            'module_id'   => 'required|exists:module,id',
        ]);

        $exists = EtudiantModule::where('etudiant_id', $validated['etudiant_id'])
            ->where('module_id', $validated['module_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'inscription_already_exists');
        }

        EtudiantModule::create($validated);

        return back()->with('success', 'inscription_created');
    }

    public function destroy(EtudiantModule $inscription)
    {
        $inscription->delete();
        return back()->with('success', 'inscription_deleted');
    }

    // ── Excel import ──────────────────────────────────────────────────────────

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

        // Build lookup maps
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

            $exists = EtudiantModule::where('etudiant_id', $etudiantId)
                ->where('module_id', $moduleId)->exists();

            if ($exists) {
                $report[] = ['line' => $line, 'cne' => $cne, 'code_module' => $codeModule, 'status' => 'skipped',  'reason' => 'Déjà inscrit'];
                $skipped++;
                continue;
            }

            EtudiantModule::create([
                'etudiant_id' => $etudiantId,
                'module_id'   => $moduleId,
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
