<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Prof;
use App\Models\Semestre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Concerns\HasExcelParser;

class ModuleController extends Controller
{
    use HasExcelParser;
    /**
     * List all modules with search + type filter + pagination.
     */
    public function index(Request $request): Response
    {
        $query = Module::query()
            ->with(['prof.user:id,nom_fr,prenom_fr,nom_ar,prenom_ar', 'semestre.niveau'])
            ->withCount('etudiants')
            ->orderBy('created_at', 'desc');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nom_fr',      'like', "%{$search}%")
                  ->orWhere('nom_ar',      'like', "%{$search}%")
                  ->orWhere('code_module', 'like', "%{$search}%");
            });
        }

        if ($type = $request->get('type')) {
            $query->where('type_module', $type);
        }

        if ($semestreId = $request->get('semestre_id')) {
            $query->where('semestre_id', $semestreId);
        }

        $modules = $query->paginate(12)->withQueryString();

        // Load all profs (with user names) for the create/edit select
        $profs = Prof::with('user:id,nom_fr,prenom_fr,nom_ar,prenom_ar')
            ->orderBy('id')
            ->get()
            ->map(fn ($p) => [
                'id'     => $p->id,
                'nom_fr' => trim(($p->user->prenom_fr ?? '') . ' ' . ($p->user->nom_fr ?? '')),
                'nom_ar' => trim(($p->user->prenom_ar ?? '') . ' ' . ($p->user->nom_ar ?? '')),
            ]);

        $types = Module::distinct()->pluck('type_module')->filter()->values();

        $semestres = Semestre::with('niveau.filiere')
            ->orderBy('numero')
            ->orderBy('code')
            ->get(['id', 'code', 'nom_fr', 'nom_ar', 'niveau_id']);

        $stats = [
            'total'        => Module::count(),
            'withProf'     => Module::whereNotNull('prof_id')->count(),
            'withStudents' => Module::has('etudiants')->count(),
            'types'        => Module::distinct()->whereNotNull('type_module')->count('type_module'),
        ];

        return Inertia::render('Modules/Index', [
            'modules'  => $modules,
            'profs'    => $profs,
            'semestres'=> $semestres,
            'types'    => $types,
            'filters'  => $request->only(['search', 'type', 'semestre_id']),
            'stats'    => $stats,
        ]);
    }

    /**
     * Store a new module (form).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nom_fr'      => 'required|string|max:255',
            'nom_ar'      => 'nullable|string|max:255',
            'code_module' => 'required|string|max:255|unique:module,code_module',
            'coefficient' => 'nullable|integer|min:1|max:10',
            'type_module' => 'nullable|string|max:255',
            'prof_id'     => 'nullable|exists:prof,id',
            'semestre_id' => 'nullable|exists:semestres,id',
        ]);

        Module::create($validated);

        return back()->with('success', 'module_created');
    }

    /**
     * Update an existing module.
     */
    public function update(Request $request, Module $module): RedirectResponse
    {
        $validated = $request->validate([
            'nom_fr'      => 'required|string|max:255',
            'nom_ar'      => 'nullable|string|max:255',
            'code_module' => ['required', 'string', 'max:255',
                             Rule::unique('module', 'code_module')->ignore($module->id)],
            'coefficient' => 'nullable|integer|min:1|max:10',
            'type_module' => 'nullable|string|max:255',
            'prof_id'     => 'nullable|exists:prof,id',
            'semestre_id' => 'nullable|exists:semestres,id',
        ]);

        $module->update($validated);

        return back()->with('success', 'module_updated');
    }

    /**
     * Delete a module.
     */
    public function destroy(Module $module): RedirectResponse
    {
        $module->delete();

        return back()->with('success', 'module_deleted');
    }

    /**
     * Import modules from a CSV / Excel file.
     *
     * Supported: .csv, .txt, .xlsx, .xls, .ods, .tsv
     * For .xlsx / .ods  → ZIP-based XML parser
     * For .xls          → BIFF8 binary parser (basic)
     * For .csv / .txt / .tsv → fgetcsv parser
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:5120',
        ]);

        $file      = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        // Also try to detect by MIME if extension is missing/wrong
        $mime = $file->getMimeType() ?? '';

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
                // csv, txt, tsv and anything else text-based
                $rows = $this->parseCsv($file->getRealPath());
            }
        } catch (\Throwable $e) {
            return response()->json(['error' => 'parse_error', 'message' => $e->getMessage()], 422);
        }

        if (count($rows) < 2) {
            return response()->json(['error' => 'empty_file'], 422);
        }

        // Normalise header row — use mb_strtolower to handle Arabic/accented chars safely
        $header = array_map(
            fn($h) => mb_strtolower(trim(preg_replace('/\s+/u', '_', $this->sanitize($h))), 'UTF-8'),
            $rows[0]
        );

        $imported = 0;
        $skipped  = 0;
        $rows_report = [];

        foreach (array_slice($rows, 1) as $lineNum => $row) {
            if (count(array_filter($row, fn($v) => $v !== '' && $v !== null)) === 0) continue;

            $data = [];
            foreach ($header as $i => $key) {
                $data[$key] = isset($row[$i]) ? trim((string) $row[$i]) : null;
            }

            $code   = $data['code_module'] ?? null;
            $nom_fr = $data['nom_fr']      ?? null;
            $line   = $lineNum + 2;

            if (!$code || !$nom_fr) {
                $rows_report[] = [
                    'line'        => $line,
                    'status'      => 'rejected',
                    'code_module' => $code ?? '',
                    'nom_fr'      => $nom_fr ?? '',
                    'reason'      => 'code_module ou nom_fr manquant',
                ];
                $skipped++;
                continue;
            }

            if (Module::where('code_module', $code)->exists()) {
                $rows_report[] = [
                    'line'        => $line,
                    'status'      => 'rejected',
                    'code_module' => $code,
                    'nom_fr'      => $nom_fr,
                    'reason'      => 'Code "' . $code . '" déjà existant',
                ];
                $skipped++;
                continue;
            }

            $semestreId = null;
            if (!empty($data['code_semestre'])) {
                $semestre = Semestre::where('code', $data['code_semestre'])->first();
                if ($semestre) $semestreId = $semestre->id;
            }

            Module::create([
                'nom_fr'      => $nom_fr,
                'nom_ar'      => $data['nom_ar']      ?? null,
                'code_module' => $code,
                'coefficient' => is_numeric($data['coefficient'] ?? null)
                                    ? (int) $data['coefficient'] : null,
                'type_module' => $data['type_module']  ?? null,
                'prof_id'     => is_numeric($data['prof_id'] ?? null)
                                    ? (int) $data['prof_id'] : null,
                'semestre_id' => $semestreId,
            ]);

            $rows_report[] = [
                'line'        => $line,
                'status'      => 'imported',
                'code_module' => $code,
                'nom_fr'      => $nom_fr,
                'reason'      => null,
            ];

            $imported++;
        }

        return response()->json([
            'imported' => $imported,
            'skipped'  => $skipped,
            'rows'     => $rows_report,
        ]);
    }
}
