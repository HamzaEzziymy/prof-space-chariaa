<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Module;
use App\Models\Niveau;
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
        $groupBy  = $request->get('group_by', 'module');
        $search   = $request->get('search', '');
        $niveauId = $request->get('niveau_id');
        $perPage  = 15;

        if ($groupBy === 'module') {
            $query = Module::query()
                ->with('semestre.niveau.filiere')
                ->withCount('etudiants as inscriptions_count')
                ->orderBy('nom_fr');

            if ($niveauId) {
                $query->whereHas('semestre.niveau', fn ($q) => $q->where('niveaux.id', $niveauId));
            }

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
                'semestre'       => $m->semestre ? ['id' => $m->semestre->id, 'code' => $m->semestre->code, 'nom_fr' => $m->semestre->nom_fr, 'nom_ar' => $m->semestre->nom_ar] : null,
                'niveau'         => $m->semestre?->niveau ? ['id' => $m->semestre->niveau->id, 'code' => $m->semestre->niveau->code, 'nom_fr' => $m->semestre->niveau->nom_fr, 'nom_ar' => $m->semestre->niveau->nom_ar] : null,
                'filiere'        => $m->semestre?->niveau?->filiere ? ['id' => $m->semestre->niveau->filiere->id, 'code' => $m->semestre->niveau->filiere->code, 'nom_fr' => $m->semestre->niveau->filiere->nom_fr, 'nom_ar' => $m->semestre->niveau->filiere->nom_ar] : null,
            ]);
        } else {
            $query = Etudiant::query()
                ->with('niveau.filiere')
                ->withCount('modules as inscriptions_count')
                ->orderBy('nom_fr')
                ->orderBy('prenom_fr');

            if ($niveauId) {
                $query->where('niveau_id', $niveauId);
            }

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
                'niveau'    => $e->niveau ? ['id' => $e->niveau->id, 'code' => $e->niveau->code, 'nom_fr' => $e->niveau->nom_fr, 'nom_ar' => $e->niveau->nom_ar] : null,
                'filiere'   => $e->niveau?->filiere ? ['id' => $e->niveau->filiere->id, 'code' => $e->niveau->filiere->code, 'nom_fr' => $e->niveau->filiere->nom_fr, 'nom_ar' => $e->niveau->filiere->nom_ar] : null,
            ]);
        }

        $allModules = Module::with('semestre.niveau.filiere')
            ->select('id', 'nom_fr', 'nom_ar', 'code_module', 'coefficient', 'semestre_id')
            ->orderBy('nom_fr')->get()
            ->map(fn ($m) => [
                'id'          => $m->id,
                'nom_fr'      => $m->nom_fr,
                'nom_ar'      => $m->nom_ar,
                'code_module' => $m->code_module,
                'coefficient' => $m->coefficient,
                'semestre'    => $m->semestre ? [
                    'id'     => $m->semestre->id,
                    'code'   => $m->semestre->code,
                    'nom_fr' => $m->semestre->nom_fr,
                    'nom_ar' => $m->semestre->nom_ar,
                ] : null,
                'niveau'      => $m->semestre?->niveau ? [
                    'id'     => $m->semestre->niveau->id,
                    'code'   => $m->semestre->niveau->code,
                    'nom_fr' => $m->semestre->niveau->nom_fr,
                    'nom_ar' => $m->semestre->niveau->nom_ar,
                ] : null,
                'filiere'     => $m->semestre?->niveau?->filiere ? [
                    'id'     => $m->semestre->niveau->filiere->id,
                    'code'   => $m->semestre->niveau->filiere->code,
                    'nom_fr' => $m->semestre->niveau->filiere->nom_fr,
                    'nom_ar' => $m->semestre->niveau->filiere->nom_ar,
                ] : null,
            ]);

        $niveaux = Niveau::with('filiere')->orderBy('ordre')->get(['id', 'code', 'nom_fr', 'nom_ar', 'filiere_id']);

        $stats = EtudiantModule::selectRaw('COUNT(*) as total, COUNT(DISTINCT etudiant_id) as students, COUNT(DISTINCT module_id) as modules')->first();

        return Inertia::render('Inscriptions/Index', [
            'items'        => $items,
            'groupBy'      => $groupBy,
            'filters'      => $request->only(['search', 'group_by', 'niveau_id']),
            'allModules'   => $allModules,
            'niveaux'      => $niveaux,
            'stats'        => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'etudiant_id' => 'required|exists:etudiant,id',
            'module_ids'  => 'required|array|min:1',
            'module_ids.*' => 'exists:module,id',
        ]);

        $created = 0;
        $skipped = 0;

        foreach ($validated['module_ids'] as $moduleId) {
            $exists = EtudiantModule::where('etudiant_id', $validated['etudiant_id'])
                ->where('module_id', $moduleId)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            EtudiantModule::create([
                'etudiant_id' => $validated['etudiant_id'],
                'module_id'   => $moduleId,
            ]);
            $created++;
        }

        if ($created > 0) {
            return back()->with('success', $created . '_module(s)_inscrit(s)');
        }

        return back()->with('error', 'inscription_already_exists');
    }

    public function destroy(EtudiantModule $inscription)
    {
        $inscription->delete();
        return back()->with('success', 'inscription_deleted');
    }

    /**
     * JSON: get students for a module (lazy expand).
     */
    public function getModuleStudents(Module $module): JsonResponse
    {
        $students = $module->etudiants()
            ->select('etudiant.id', 'etudiant.nom_fr', 'etudiant.prenom_fr', 'etudiant.nom_ar', 'etudiant.prenom_ar', 'etudiant.CNE', 'etudiant.photo_url', 'etudiant.niveau_id')
            ->orderBy('etudiant.nom_fr')
            ->get()
            ->load('niveau.filiere')
            ->map(fn ($e) => [
                'id'        => $e->id,
                'pivot_id'  => $e->pivot->id,
                'nom_fr'    => $e->nom_fr,
                'prenom_fr' => $e->prenom_fr,
                'nom_ar'    => $e->nom_ar,
                'prenom_ar' => $e->prenom_ar,
                'CNE'       => $e->CNE,
                'photo_url' => $e->photo_url,
                'niveau'    => $e->niveau ? ['id' => $e->niveau->id, 'code' => $e->niveau->code, 'nom_fr' => $e->niveau->nom_fr, 'nom_ar' => $e->niveau->nom_ar] : null,
                'filiere'   => $e->niveau?->filiere ? ['id' => $e->niveau->filiere->id, 'code' => $e->niveau->filiere->code, 'nom_fr' => $e->niveau->filiere->nom_fr, 'nom_ar' => $e->niveau->filiere->nom_ar] : null,
            ]);

        return response()->json($students);
    }

    /**
     * JSON: get modules for a student (lazy expand).
     */
    public function getStudentModules(Etudiant $etudiant): JsonResponse
    {
        $modules = $etudiant->modules()
            ->select('module.id', 'module.nom_fr', 'module.nom_ar', 'module.code_module', 'module.coefficient', 'module.semestre_id')
            ->orderBy('module.nom_fr')
            ->get()
            ->load('semestre.niveau.filiere')
            ->map(fn ($m) => [
                'id'          => $m->id,
                'pivot_id'    => $m->pivot->id,
                'nom_fr'      => $m->nom_fr,
                'nom_ar'      => $m->nom_ar,
                'code_module' => $m->code_module,
                'coefficient' => $m->coefficient,
                'semestre'    => $m->semestre ? ['id' => $m->semestre->id, 'code' => $m->semestre->code, 'nom_fr' => $m->semestre->nom_fr, 'nom_ar' => $m->semestre->nom_ar] : null,
                'niveau'      => $m->semestre?->niveau ? ['id' => $m->semestre->niveau->id, 'code' => $m->semestre->niveau->code, 'nom_fr' => $m->semestre->niveau->nom_fr, 'nom_ar' => $m->semestre->niveau->nom_ar] : null,
                'filiere'     => $m->semestre?->niveau?->filiere ? ['id' => $m->semestre->niveau->filiere->id, 'code' => $m->semestre->niveau->filiere->code, 'nom_fr' => $m->semestre->niveau->filiere->nom_fr, 'nom_ar' => $m->semestre->niveau->filiere->nom_ar] : null,
            ]);

        return response()->json($modules);
    }

    /**
     * JSON search endpoint for the student combo.
     */
    public function searchStudents(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        $students = Etudiant::with(['modules:id', 'niveau.filiere'])
            ->select('id', 'nom_fr', 'prenom_fr', 'nom_ar', 'prenom_ar', 'CNE', 'niveau_id')
            ->when($query, fn ($q) => $q->where(function ($q) use ($query) {
                $q->where('nom_fr',   'like', "%{$query}%")
                  ->orWhere('prenom_fr', 'like', "%{$query}%")
                  ->orWhere('nom_ar',   'like', "%{$query}%")
                  ->orWhere('prenom_ar', 'like', "%{$query}%")
                  ->orWhere('CNE',        'like', "%{$query}%");
            }))
            ->orderBy('nom_fr')
            ->limit(50)
            ->get()
            ->map(fn ($e) => [
                'id'         => $e->id,
                'nom_fr'     => $e->nom_fr,
                'prenom_fr'  => $e->prenom_fr,
                'nom_ar'     => $e->nom_ar,
                'prenom_ar'  => $e->prenom_ar,
                'CNE'        => $e->CNE,
                'module_ids' => $e->modules->pluck('id'),
                'niveau'     => $e->niveau ? [
                    'id'     => $e->niveau->id,
                    'code'   => $e->niveau->code,
                    'nom_fr' => $e->niveau->nom_fr,
                    'nom_ar' => $e->niveau->nom_ar,
                ] : null,
                'filiere'    => $e->niveau?->filiere ? [
                    'id'     => $e->niveau->filiere->id,
                    'code'   => $e->niveau->filiere->code,
                    'nom_fr' => $e->niveau->filiere->nom_fr,
                    'nom_ar' => $e->niveau->filiere->nom_ar,
                ] : null,
            ]);

        return response()->json($students);
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
