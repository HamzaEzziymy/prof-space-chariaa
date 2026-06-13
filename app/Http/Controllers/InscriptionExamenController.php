<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Module;
use App\Models\Groupe;
use App\Models\Salle;
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
        $groupBy = $request->get('group_by', 'module');
        $perPage = 15;

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

        $allGroupes = Groupe::with('module:id,nom_fr,nom_ar,code_module')
            ->select('id', 'code', 'nom_fr', 'nom_ar', 'module_id')
            ->orderBy('code')->get()
            ->map(fn ($g) => [
                'id'     => $g->id,
                'code'   => $g->code,
                'nom_fr' => $g->nom_fr,
                'nom_ar' => $g->nom_ar,
                'module' => $g->module ? ['id' => $g->module->id, 'nom_fr' => $g->module->nom_fr, 'nom_ar' => $g->module->nom_ar, 'code_module' => $g->module->code_module] : null,
            ]);

        $allSalles = Salle::select('id', 'code_salle', 'nomSalle_fr', 'nomSalle_ar', 'capacite')
            ->orderBy('code_salle')->get();

        $stats = [
            'total'   => InscriptionExamen::count(),
            'assigned_rooms' => InscriptionExamen::whereNotNull('id_salle')->count(),
            'with_grades'    => InscriptionExamen::whereNotNull('note_normale')->count(),
        ];

        if ($groupBy === 'groupe') {
            $items = Groupe::with([
                'inscriptionsExamen' => fn ($q) => $q->with([
                    'etudiantModule.etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE',
                    'salle:id,code_salle,nomSalle_fr,nomSalle_ar',
                ]),
                'module:id,nom_fr,nom_ar,code_module',
            ])
            ->has('inscriptionsExamen')
            ->orderBy('code')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn ($g) => [
                'id'          => $g->id,
                'code'        => $g->code,
                'nom_fr'      => $g->nom_fr,
                'nom_ar'      => $g->nom_ar,
                'module'      => $g->module ? ['id' => $g->module->id, 'nom_fr' => $g->module->nom_fr, 'nom_ar' => $g->module->nom_ar, 'code_module' => $g->module->code_module] : null,
                'inscriptions_count' => $g->inscriptionsExamen->count(),
                'inscriptions' => $g->inscriptionsExamen->map(fn ($ie) => [
                    'id'         => $ie->id,
                    'Nexam'      => $ie->Nexam,
                    'note_normale' => $ie->note_normale,
                    'note_rattrapage' => $ie->note_rattrapage,
                    'decision_finale_ar' => $ie->decision_finale_ar,
                    'decision_finale_fr' => $ie->decision_finale_fr,
                    'etudiant'   => $ie->etudiantModule?->etudiant ? [
                        'id'       => $ie->etudiantModule->etudiant->id,
                        'nom_fr'   => $ie->etudiantModule->etudiant->nom_fr,
                        'prenom_fr'=> $ie->etudiantModule->etudiant->prenom_fr,
                        'nom_ar'   => $ie->etudiantModule->etudiant->nom_ar,
                        'prenom_ar'=> $ie->etudiantModule->etudiant->prenom_ar,
                        'CNE'      => $ie->etudiantModule->etudiant->CNE,
                    ] : null,
                    'salle'      => $ie->salle ? ['id' => $ie->salle->id, 'code_salle' => $ie->salle->code_salle, 'nomSalle_fr' => $ie->salle->nomSalle_fr, 'nomSalle_ar' => $ie->salle->nomSalle_ar] : null,
                ]),
            ]);
        } else {
            $items = Module::with([
                'inscriptionsExamen' => fn ($q) => $q->with([
                    'etudiantModule.etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE',
                    'groupe:id,code,nom_fr,nom_ar',
                    'salle:id,code_salle,nomSalle_fr,nomSalle_ar',
                ]),
            ])
            ->has('inscriptionsExamen')
            ->orderBy('nom_fr')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn ($m) => [
                'id'          => $m->id,
                'nom_fr'      => $m->nom_fr,
                'nom_ar'      => $m->nom_ar,
                'code_module' => $m->code_module,
                'coefficient' => $m->coefficient,
                'inscriptions_count' => $m->inscriptionsExamen->count(),
                'inscriptions' => $m->inscriptionsExamen->map(fn ($ie) => [
                    'id'         => $ie->id,
                    'Nexam'      => $ie->Nexam,
                    'note_normale' => $ie->note_normale,
                    'note_rattrapage' => $ie->note_rattrapage,
                    'decision_finale_ar' => $ie->decision_finale_ar,
                    'decision_finale_fr' => $ie->decision_finale_fr,
                    'etudiant'   => $ie->etudiantModule?->etudiant ? [
                        'id'       => $ie->etudiantModule->etudiant->id,
                        'nom_fr'   => $ie->etudiantModule->etudiant->nom_fr,
                        'prenom_fr'=> $ie->etudiantModule->etudiant->prenom_fr,
                        'nom_ar'   => $ie->etudiantModule->etudiant->nom_ar,
                        'prenom_ar'=> $ie->etudiantModule->etudiant->prenom_ar,
                        'CNE'      => $ie->etudiantModule->etudiant->CNE,
                    ] : null,
                    'groupe'     => $ie->groupe ? ['id' => $ie->groupe->id, 'code' => $ie->groupe->code, 'nom_fr' => $ie->groupe->nom_fr, 'nom_ar' => $ie->groupe->nom_ar] : null,
                    'salle'      => $ie->salle ? ['id' => $ie->salle->id, 'code_salle' => $ie->salle->code_salle, 'nomSalle_fr' => $ie->salle->nomSalle_fr, 'nomSalle_ar' => $ie->salle->nomSalle_ar] : null,
                ]),
            ]);
        }

        return Inertia::render('InscriptionExamen/Index', [
            'items'       => $items,
            'groupBy'     => $groupBy,
            'allEtudiants'=> $allEtudiants,
            'allModules'  => $allModules,
            'allGroupes'  => $allGroupes,
            'allSalles'   => $allSalles,
            'stats'       => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'etudiant_id' => 'required|exists:etudiant,id',
            'module_id'   => 'required|exists:module,id',
            'groupe_id'   => 'nullable|exists:groupes,id',
            'id_salle'    => 'nullable|exists:salle,id',
            'Nexam'       => 'nullable|integer|min:1',
            'note_normale'    => 'nullable|numeric|min:0|max:20',
            'note_rattrapage' => 'nullable|numeric|min:0|max:20',
            'note_finale'     => 'nullable|numeric|min:0|max:20',
        ]);

        $etudMod = EtudiantModule::firstOrCreate([
            'etudiant_id' => $validated['etudiant_id'],
            'module_id'   => $validated['module_id'],
        ]);

        InscriptionExamen::create([
            'etud_mod_id'     => $etudMod->id,
            'groupe_id'       => $validated['groupe_id'] ?? null,
            'id_salle'        => $validated['id_salle'] ?? null,
            'Nexam'           => $validated['Nexam'] ?? null,
            'note_normale'    => $validated['note_normale'] ?? null,
            'note_rattrapage' => $validated['note_rattrapage'] ?? null,
            'note_finale'     => $validated['note_finale'] ?? null,
        ]);

        return back()->with('success', 'inscription_examen_created');
    }

    public function destroy(InscriptionExamen $inscriptionExamen)
    {
        $inscriptionExamen->delete();
        return back()->with('success', 'inscription_examen_deleted');
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
        $groupes  = Groupe::pluck('id', 'code');
        $salles   = Salle::pluck('id', 'code_salle');

        foreach (array_slice($rows, 1) as $lineNum => $row) {
            if (count(array_filter($row, fn($v) => $v !== '' && $v !== null)) === 0) continue;

            $data = [];
            foreach ($header as $i => $key) {
                $data[$key] = isset($row[$i]) ? trim((string) $row[$i]) : null;
            }

            $cne        = $data['cne'] ?? null;
            $codeModule = $data['code_module'] ?? null;
            $codeGroupe = $data['code_groupe'] ?? null;
            $codeSalle  = $data['code_salle'] ?? null;
            $nexam      = isset($data['nexam']) && $data['nexam'] !== '' ? (int) $data['nexam'] : null;
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

            $groupeId  = $codeGroupe ? ($groupes[$codeGroupe] ?? null) : null;
            $salleId   = $codeSalle ? ($salles[$codeSalle] ?? null) : null;

            if ($codeGroupe && !$groupeId) {
                $report[] = ['line' => $line, 'cne' => $cne, 'code_module' => $codeModule, 'status' => 'rejected', 'reason' => "Groupe \"{$codeGroupe}\" introuvable"];
                $skipped++;
                continue;
            }

            if ($codeSalle && !$salleId) {
                $report[] = ['line' => $line, 'cne' => $cne, 'code_module' => $codeModule, 'status' => 'rejected', 'reason' => "Salle \"{$codeSalle}\" introuvable"];
                $skipped++;
                continue;
            }

            $etudMod = EtudiantModule::firstOrCreate([
                'etudiant_id' => $etudiantId,
                'module_id'   => $moduleId,
            ]);

            InscriptionExamen::create([
                'etud_mod_id'     => $etudMod->id,
                'groupe_id'       => $groupeId,
                'id_salle'        => $salleId,
                'Nexam'           => $nexam,
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
