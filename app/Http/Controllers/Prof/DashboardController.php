<?php

namespace App\Http\Controllers\Prof;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\HasExcelParser;
use App\Models\Module;
use App\Models\Etudiant;
use App\Models\EtudiantModule;
use App\Models\InscriptionExamen;
use App\Models\NoteExam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use HasExcelParser;

    public function index(): Response
    {
        $user = auth()->user();
        $prof = $user->prof;

        $modules = $prof
            ? $prof->modules()->with('semestre.niveau.filiere')->get()
            : collect();

        $totalStudents = $modules->sum(fn ($m) => $m->etudiants()->count());

        return Inertia::render('Prof/Dashboard', [
            'prof'          => $prof,
            'totalStudents' => $totalStudents,
        ]);
    }

    public function moduleStudents(int $moduleId): Response
    {
        $user = auth()->user();
        $prof = $user->prof;

        $module = Module::where('prof_id', $prof->id)
            ->with('semestre.niveau.filiere')
            ->findOrFail($moduleId);

        $inscriptions = InscriptionExamen::where('module_id', $module->id)->get()->keyBy('etudiant_id');

        $etudiantModules = EtudiantModule::where('module_id', $module->id)->with('etudiant')->get();
        $allNoteExams = NoteExam::whereIn('etud_mod_id', $etudiantModules->pluck('id'))->get()->groupBy('etud_mod_id');

        $allStudents = $etudiantModules
            ->map(function ($em) use ($inscriptions, $allNoteExams) {
                $insc = $inscriptions->get($em->etudiant->id);
                $statut = $insc?->statut ?? 'normale';
                $nexam = $insc?->Nexam ?? 1;
                $notes = $allNoteExams->get($em->id)?->keyBy('Nexam');
                $first = $notes?->first();
                $noteNormale = $first?->note_normale;

                if ($statut === 'rattrapage' && $noteNormale !== null && $noteNormale >= 10) {
                    return null;
                }

                return [
                    'etud_mod_id'     => $em->id,
                    'id'              => $em->etudiant->id,
                    'nom_fr'          => $em->etudiant->nom_fr,
                    'prenom_fr'       => $em->etudiant->prenom_fr,
                    'nom_ar'          => $em->etudiant->nom_ar,
                    'prenom_ar'       => $em->etudiant->prenom_ar,
                    'CNE'             => $em->etudiant->CNE,
                    'sexe'            => $em->etudiant->sexe,
                    'nexam'           => $nexam,
                    'note_normale'    => $noteNormale,
                    'note_rattrapage' => $first?->note_rattrapage,
                    'note_finale'     => $first?->note_finale,
                    'statut'          => $statut,
                ];
            })
            ->filter()
            ->sortBy(fn ($s) => ($s['nom_fr'] ?? '').' '.($s['prenom_fr'] ?? ''))
            ->values();

        $total = $allStudents->count();
        $entered = $allStudents->filter(fn ($s) => $s['note_normale'] !== null || $s['note_rattrapage'] !== null || $s['note_finale'] !== null)->count();

        $perPage = 20;
        $page = (int) request()->query('page', 1);
        $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
            $allStudents->forPage($page, $perPage)->values(),
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );

        $exportStudents = $allStudents->map(fn ($s) => [
            'CNE'       => $s['CNE'],
            'nom_fr'    => $s['nom_fr'],
            'prenom_fr' => $s['prenom_fr'],
            'nom_ar'    => $s['nom_ar'],
            'prenom_ar' => $s['prenom_ar'],
            'nexam'     => $s['nexam'],
            'statut'    => $s['statut'],
            'note'      => $s['note_finale'] ?? $s['note_rattrapage'] ?? $s['note_normale'] ?? '',
        ]);

        return Inertia::render('Prof/ModuleNotes', [
            'module'         => $module,
            'students'       => $paginated,
            'allStudents'    => $exportStudents,
            'stats'          => ['total' => $total, 'entered' => $entered, 'pending' => $total - $entered],
        ]);
    }

    public function saveNotes(Request $request, int $moduleId): JsonResponse
    {
        $user = auth()->user();
        $prof = $user->prof;
        $module = Module::where('prof_id', $prof->id)->findOrFail($moduleId);

        $validated = $request->validate([
            'notes'                      => 'required|array',
            'notes.*.etud_mod_id'        => 'required|exists:etudiant_module,id',
            'notes.*.note_normale'       => ['nullable', 'numeric', function ($attr, $value, $fail) {
                $v = (float) $value;
                if ($v < 0 || ($v > 20 && (int) $v !== 99)) $fail('La note doit être entre 0 et 20, ou 99 pour absent.');
            }],
            'notes.*.note_rattrapage'    => ['nullable', 'numeric', function ($attr, $value, $fail) {
                $v = (float) $value;
                if ($v < 0 || ($v > 20 && (int) $v !== 99)) $fail('La note doit être entre 0 et 20, ou 99 pour absent.');
            }],
            'notes.*.note_finale'        => ['nullable', 'numeric', function ($attr, $value, $fail) {
                $v = (float) $value;
                if ($v < 0 || ($v > 20 && (int) $v !== 99)) $fail('La note doit être entre 0 et 20, ou 99 pour absent.');
            }],
            'notes.*.Nexam'              => 'required|integer|min:1',
        ]);

        foreach ($validated['notes'] as $item) {
            NoteExam::updateOrCreate(
                ['etud_mod_id' => $item['etud_mod_id'], 'Nexam' => $item['Nexam']],
                [
                    'note_normale'    => $item['note_normale'] ?? null,
                    'note_rattrapage' => $item['note_rattrapage'] ?? null,
                    'note_finale'     => $item['note_finale'] ?? null,
                ]
            );
        }

        return response()->json(['success' => true, 'message' => 'Notes enregistrées avec succès']);
    }

    public function exportNotes(int $moduleId)
    {
        $user = auth()->user();
        $prof = $user->prof;
        $module = Module::where('prof_id', $prof->id)->findOrFail($moduleId);

        $locale = request()->query('locale', 'fr');
        $isAr = $locale === 'ar';

        $inscriptions = InscriptionExamen::where('module_id', $module->id)->get()->keyBy('etudiant_id');

        $students = EtudiantModule::where('module_id', $module->id)
            ->with('etudiant')
            ->get()
            ->map(function ($em) use ($inscriptions) {
                $insc = $inscriptions->get($em->etudiant->id);
                $statut = $insc?->statut ?? 'normale';
                $nexam = $insc?->Nexam ?? 1;
                $note = NoteExam::where('etud_mod_id', $em->id)->first();
                $nn = $note?->note_normale;
                if ($statut === 'rattrapage' && $nn !== null && $nn >= 10) return null;
                return [
                    'CNE'       => $em->etudiant->CNE,
                    'nom_fr'    => $em->etudiant->nom_fr,
                    'prenom_fr' => $em->etudiant->prenom_fr,
                    'nexam'     => $nexam,
                    'statut'    => $statut,
                ];
            })
            ->filter()
            ->sortBy(fn ($s) => ($s['nom_fr'] ?? '').' '.($s['prenom_fr'] ?? ''))
            ->values();

        $statutLabel = $isAr
            ? ['normale' => 'عادي', 'rattrapage' => 'استدراك', 'finale' => 'نهائي']
            : ['normale' => 'Normale', 'rattrapage' => 'Rattrapage', 'finale' => 'Finale'];

        $headers = $isAr
            ? ['CNE', 'الاسم', 'النسب', 'رقم الامتحان', 'الحالة', 'النقطة']
            : ['CNE', 'Nom', 'Prénom', 'N° Examen', 'Statut', 'Note'];

        $callback = function () use ($students, $headers, $statutLabel) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, $headers);
            foreach ($students as $s) {
                fputcsv($handle, [
                    $s['CNE'], $s['nom_fr'], $s['prenom_fr'],
                    $s['nexam'], $statutLabel[$s['statut']] ?? $s['statut'], '',
                ]);
            }
            fclose($handle);
        };

        $filename = 'notes_' . $module->code_module . '_' . date('Ymd') . '.csv';
        return response()->stream($callback, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function importNotes(Request $request, int $moduleId): JsonResponse
    {
        $user = auth()->user();
        $prof = $user->prof;
        $module = Module::where('prof_id', $prof->id)->findOrFail($moduleId);

        $request->validate(['file' => 'required|file|mimes:csv,txt,xlsx,xls']);

        $path = $request->file('file')->getPathname();
        $ext = $request->file('file')->getClientOriginalExtension();

        $rows = match ($ext) {
            'csv', 'txt' => $this->parseCsv($path),
            'xlsx'       => $this->parseXlsx($path),
            'xls'        => $this->parseXls($path),
            default      => throw new \InvalidArgumentException('Format non supporté'),
        };

        if (empty($rows)) {
            return response()->json(['success' => false, 'message' => 'Fichier vide ou illisible'], 422);
        }

        $header = array_map('trim', array_map('strtolower', $rows[0]));
        $cneIdx = array_search('cne', $header);
        $noteIdx = array_search('note', $header);

        if ($cneIdx === false || $noteIdx === false) {
            return response()->json([
                'success' => false,
                'message' => 'Le fichier doit contenir les colonnes "CNE" et "Note"',
            ], 422);
        }

        $dataRows = array_slice($rows, 1);
        $statuts = InscriptionExamen::where('module_id', $module->id)->pluck('statut', 'etudiant_id');
        $imported = 0;
        $errors = [];
        $seen = [];

        foreach ($dataRows as $idx => $row) {
            $line = $idx + 2;
            $cne = trim((string) ($row[$cneIdx] ?? ''));
            $noteRaw = trim((string) ($row[$noteIdx] ?? ''));

            if (empty($cne) && empty($noteRaw)) continue;
            if (empty($cne)) { $errors[] = "Ligne $line : CNE manquant"; continue; }

            if (isset($seen[$cne])) { $errors[] = "Ligne $line : CNE '$cne' en double"; continue; }
            $seen[$cne] = $line;

            $etud = Etudiant::where('CNE', $cne)->first();
            if (!$etud) { $errors[] = "Ligne $line : CNE '$cne' introuvable"; continue; }

            $em = EtudiantModule::where('module_id', $module->id)->where('etudiant_id', $etud->id)->first();
            if (!$em) { $errors[] = "Ligne $line : étudiant '$cne' non inscrit dans ce module"; continue; }

            if ($noteRaw === '') { $errors[] = "Ligne $line : note manquante pour '$cne'"; continue; }

            $statut = $statuts[$etud->id] ?? 'normale';
            $existing = NoteExam::where('etud_mod_id', $em->id)->first();
            $nn = $existing?->note_normale;
            if ($statut === 'rattrapage' && $nn !== null && $nn >= 10) {
                $errors[] = "Ligne $line : '$cne' déjà validé en normale, pas de rattrapage";
                continue;
            }

            if (!is_numeric($noteRaw)) {
                $errors[] = "Ligne $line : note '$noteRaw' non valide pour '$cne'";
                continue;
            }

            $note = (float) $noteRaw;
            if ($note < 0 || ($note > 20 && (int) $note !== 99)) {
                $errors[] = "Ligne $line : note '$noteRaw' pour '$cne' doit être entre 0 et 20 ou 99 (absent)";
                continue;
            }

            $field = match ($statut) {
                'rattrapage' => 'note_rattrapage',
                'finale'     => 'note_finale',
                default      => 'note_normale',
            };

            $nexam = $existing?->Nexam ?? 1;

            NoteExam::updateOrCreate(
                ['etud_mod_id' => $em->id, 'Nexam' => $nexam],
                [$field => $note]
            );

            $imported++;
        }

        return response()->json([
            'success'  => $imported > 0,
            'imported' => $imported,
            'errors'   => $errors,
            'message'  => $imported > 0
                ? "$imported note(s) importée(s)" . (count($errors) ? " avec " . count($errors) . " erreur(s)" : " avec succès")
                : "Aucune note importée",
        ]);
    }
}
