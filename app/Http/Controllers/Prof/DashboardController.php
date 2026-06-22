<?php

namespace App\Http\Controllers\Prof;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\HasExcelParser;
use App\Models\Module;
use App\Models\Etudiant;
use App\Models\EtudiantModule;
use App\Models\NoteExam;
use Illuminate\Http\JsonResponse;
use Barryvdh\DomPDF\Facade\Pdf;
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
            ? $prof->modules()->with('semestre.niveau.filiere')->withCount('etudiants')->get()
            : collect();

        $modulesOverview = $modules->map(function ($module) {
            $noteExams = NoteExam::whereHas('etudiantModule', fn ($q) => $q->where('module_id', $module->id))
                ->get();

            $total = $noteExams->count();
            $entered = $noteExams->filter(function ($noteExam) {
                $field = match ($noteExam->statut ?? 'normale') {
                    'rattrapage' => 'note_rattrapage',
                    'finale' => 'note_finale',
                    default => 'note_normale',
                };

                return $noteExam->{$field} !== null;
            })->count();

            $pending = max($total - $entered, 0);

            return [
                'id' => $module->id,
                'nom_fr' => $module->nom_fr,
                'nom_ar' => $module->nom_ar,
                'code_module' => $module->code_module,
                'semestre' => $module->semestre,
                'students_count' => $module->etudiants_count,
                'exam_total' => $total,
                'entered' => $entered,
                'pending' => $pending,
                'ready' => $total > 0,
                'progress' => $total > 0 ? round(($entered / $total) * 100) : 0,
                'normale_count' => $noteExams->where('statut', 'normale')->count(),
                'rattrapage_count' => $noteExams->where('statut', 'rattrapage')->count(),
            ];
        })->values();

        $totalStudents = $modules->sum(fn ($m) => $m->etudiants_count);
        $totalExamInscriptions = $modulesOverview->sum('exam_total');
        $enteredNotes = $modulesOverview->sum('entered');

        return Inertia::render('Prof/Dashboard', [
            'prof'          => $prof,
            'totalStudents' => $totalStudents,
            'dashboardStats' => [
                'modulesCount' => $modules->count(),
                'readyModules' => $modulesOverview->where('ready', true)->count(),
                'totalExamInscriptions' => $totalExamInscriptions,
                'enteredNotes' => $enteredNotes,
                'pendingNotes' => $modulesOverview->sum('pending'),
                'progress' => $totalExamInscriptions > 0 ? round(($enteredNotes / $totalExamInscriptions) * 100) : 0,
            ],
            'modulesOverview' => $modulesOverview,
        ]);
    }

    public function moduleStudents(int $moduleId): Response
    {
        $user = auth()->user();
        $prof = $user->prof;

        $module = Module::where('prof_id', $prof->id)
            ->with('semestre.niveau.filiere', 'prof.user')
            ->findOrFail($moduleId);

        $noteExams = NoteExam::whereHas('etudiantModule', fn ($q) => $q->where('module_id', $module->id))
            ->with('etudiantModule.etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE,sexe')
            ->get();

        if ($noteExams->isEmpty()) {
            return Inertia::render('Prof/ModuleNotes', [
                'module'      => $module,
                'students'    => null,
                'allStudents' => collect(),
                'stats'       => ['total' => 0, 'entered' => 0, 'pending' => 0],
                'ready'       => false,
            ]);
        }

        // Deduplicate by student — each student has one NoteExam record per module
        $allStudents = $noteExams->groupBy('etud_mod_id')->map(function ($group) {
            $ne = $group->first();
            $etud = $ne->etudiantModule?->etudiant;
            $statut = $ne->statut ?? 'normale';
            $noteNormale = $ne->note_normale;

            if ($statut === 'rattrapage' && $noteNormale !== null && $noteNormale >= 10 && (int) $noteNormale !== 99) {
                return null;
            }

            return [
                'etud_mod_id'     => $ne->etud_mod_id,
                'id'              => $etud->id,
                'nom_fr'          => $etud->nom_fr,
                'prenom_fr'       => $etud->prenom_fr,
                'nom_ar'          => $etud->nom_ar,
                'prenom_ar'       => $etud->prenom_ar,
                'CNE'             => $etud->CNE,
                'sexe'            => $etud->sexe,
                'nexam'           => $ne->Nexam ?? 1,
                'note_normale'    => $noteNormale,
                'note_rattrapage' => $ne->note_rattrapage,
                'note_finale'     => $ne->note_finale,
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
            'ready'          => true,
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
                ['etud_mod_id' => $item['etud_mod_id']],
                [
                    'Nexam'           => $item['Nexam'],
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

        $students = NoteExam::whereHas('etudiantModule', fn ($q) => $q->where('module_id', $module->id))
            ->with('etudiantModule.etudiant:id,nom_fr,prenom_fr,CNE')
            ->get()
            ->groupBy('etud_mod_id')
            ->map(function ($group) {
                $ne = $group->first();
                $etud = $ne->etudiantModule?->etudiant;
                $statut = $ne->statut ?? 'normale';
                $nn = $ne->note_normale;
                if ($statut === 'rattrapage' && $nn !== null && $nn >= 10 && (int) $nn !== 99) return null;
                return [
                    'CNE'       => $etud->CNE,
                    'nom_fr'    => $etud->nom_fr,
                    'prenom_fr' => $etud->prenom_fr,
                    'nexam'     => $ne->Nexam ?? 1,
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
                    $s['CNE'],
                    $s['nom_fr'],
                    $s['prenom_fr'],
                    $s['nexam'],
                    $statutLabel[$s['statut']] ?? $s['statut'],
                    '',
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
        $locale = $request->input('locale', 'fr');

        $tl = fn ($fr, $ar) => $locale === 'ar' ? $ar : $fr;

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

        $header = array_map(fn ($h) => trim(mb_strtolower($h)), $rows[0]);
        $cneIdx = array_search('cne', $header);
        $noteIdx = array_search('note', $header);

        if ($noteIdx === false) {
            $noteIdx = array_search('النقطة', $header);
        }
        if ($noteIdx === false) {
            $noteIdx = array_search('العلامة', $header);
        }
        if ($noteIdx === false) {
            $noteIdx = array_search('الدرجة', $header);
        }

        if ($cneIdx === false || $noteIdx === false) {
            return response()->json([
                'success' => false,
                'message' => $tl('Le fichier doit contenir les colonnes "CNE" et "Note"', 'يجب أن يحتوي الملف على عمودي CNE والنقطة'),
            ], 422);
        }

        $dataRows = array_slice($rows, 1);
        $imported = 0;
        $errors = [];
        $seen = [];

        foreach ($dataRows as $idx => $row) {
            $line = $idx + 2;
            $cne = trim((string) ($row[$cneIdx] ?? ''));
            $noteRaw = trim((string) ($row[$noteIdx] ?? ''));

            if (empty($cne) && empty($noteRaw)) continue;
            if (empty($cne)) { $errors[] = ['line' => $line, 'cne' => '', 'reason' => $tl('CNE manquant', 'CNE مفقود')]; continue; }

            if (isset($seen[$cne])) { $errors[] = ['line' => $line, 'cne' => $cne, 'reason' => $tl('CNE en double', 'CNE مكرر')]; continue; }
            $seen[$cne] = $line;

            $etud = Etudiant::where('CNE', $cne)->first();
            if (!$etud) { $errors[] = ['line' => $line, 'cne' => $cne, 'reason' => $tl('CNE introuvable', 'CNE غير موجود')]; continue; }

            $em = EtudiantModule::where('module_id', $module->id)->where('etudiant_id', $etud->id)->first();
            if (!$em) { $errors[] = ['line' => $line, 'cne' => $cne, 'reason' => $tl("étudiant '$cne' non inscrit dans ce module", "الطالب '$cne' غير مسجل في هذه الوحدة")]; continue; }

            if ($noteRaw === '') { $errors[] = ['line' => $line, 'cne' => $cne, 'reason' => $tl('note manquante', 'النقطة مفقودة')]; continue; }

            $existing = NoteExam::where('etud_mod_id', $em->id)->first();
            $statut = $existing?->statut ?? 'normale';
            $nn = $existing?->note_normale;
            if ($statut === 'rattrapage' && $nn !== null && $nn >= 10 && (int) $nn !== 99) {
                $errors[] = ['line' => $line, 'cne' => $cne, 'reason' => $tl('déjà validé en normale, pas de rattrapage', 'مستوفي في الدورة العادية، لا يمكن التسجيل في الاستدراك')];
                continue;
            }

            if (!is_numeric($noteRaw)) {
                $errors[] = ['line' => $line, 'cne' => $cne, 'reason' => $tl("note '$noteRaw' non valide", "النقطة '$noteRaw' غير صالحة")];
                continue;
            }

            $note = (float) $noteRaw;
            if ($note < 0 || ($note > 20 && (int) $note !== 99)) {
                $errors[] = ['line' => $line, 'cne' => $cne, 'reason' => $tl('note doit être entre 0 et 20 ou 99 (absent)', 'النقطة يجب أن تكون بين 0 و 20 أو 99 (غائب)')];
                continue;
            }

            $field = match ($statut) {
                'rattrapage' => 'note_rattrapage',
                'finale'     => 'note_finale',
                default      => 'note_normale',
            };

            $nexam = $existing?->Nexam ?? 1;

            NoteExam::updateOrCreate(
                ['etud_mod_id' => $em->id],
                ['Nexam' => $nexam, $field => $note]
            );

            $imported++;
        }

        return response()->json([
            'success'  => $imported > 0,
            'imported' => $imported,
            'errors'   => $errors,
            'message'  => $imported > 0
                ? $tl("$imported note(s) importée(s)" . (count($errors) ? " avec " . count($errors) . " erreur(s)" : " avec succès"), "$imported نقطة مستوردة" . (count($errors) ? " مع " . count($errors) . " خطأ" : " بنجاح"))
                : $tl('Aucune note importée', 'لم يتم استيراد أي نقطة'),
        ]);
    }

    public function releveNotesPdf(int $moduleId)
    {
        $user = auth()->user();
        $prof = $user->prof;
        $module = Module::where('prof_id', $prof->id)
            ->with('semestre.niveau.filiere', 'prof.user')
            ->findOrFail($moduleId);

        $locale = request()->query('locale', 'fr');
        $isAr = $locale === 'ar';

        $noteExams = NoteExam::whereHas('etudiantModule', fn ($q) => $q->where('module_id', $module->id))
            ->with('etudiantModule.etudiant:id,nom_fr,prenom_fr,nom_ar,prenom_ar,CNE')
            ->get();

        $students = $noteExams->groupBy('etud_mod_id')->map(function ($group) {
            $ne = $group->first();
            $etud = $ne->etudiantModule?->etudiant;
            $statut = $ne->statut ?? 'normale';
            $nn = $ne->note_normale;
            if ($statut === 'rattrapage' && $nn !== null && $nn >= 10 && (int) $nn !== 99) return null;
            $note = $ne->note_finale ?? $ne->note_rattrapage ?? $nn ?? '';
            return [
                'CNE'       => $etud->CNE,
                'nom_fr'    => $etud->nom_fr,
                'prenom_fr' => $etud->prenom_fr,
                'nom_ar'    => $etud->nom_ar,
                'prenom_ar' => $etud->prenom_ar,
                'note'      => $note,
            ];
        })->filter()->sortBy(fn ($s) => ($s['nom_fr'] ?? '').' '.($s['prenom_fr'] ?? ''))->values();

        if ($isAr) {
            $students = $students->map(function ($s) {
                $s['nom_ar'] = arabic_reshape($s['nom_ar'] ?? '');
                $s['prenom_ar'] = arabic_reshape($s['prenom_ar'] ?? '');
                return $s;
            });
        }

        $html = view('pdf.releve-notes', [
            'module'             => $module,
            'prof'               => $prof,
            'students'           => $students,
            'total'              => $students->count(),
            'date'               => now()->translatedFormat('d F Y'),
            'anneeUniversitaire' => null,
            'isAr'               => $isAr,
        ])->render();

        $filename = 'releve_notes_' . $module->code_module . '_' . now()->format('Ymd') . '.pdf';

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('a4', 'portrait');

        $defaultFont = $isAr ? 'Amiri' : 'DejaVu Sans';
        $pdf->setOption('defaultFont', $defaultFont);

        if ($isAr) {
            $dompdf = $pdf->getDomPDF();
            $fontMetrics = $dompdf->getFontMetrics();
            $fontDir = storage_path('fonts');
            $fontMetrics->registerFont(
                ['family' => 'Amiri', 'style' => 'normal', 'weight' => 'normal'],
                "$fontDir/Amiri-Regular.ttf"
            );
            $fontMetrics->registerFont(
                ['family' => 'Amiri', 'style' => 'normal', 'weight' => 'bold'],
                "$fontDir/Amiri-Bold.ttf"
            );
            $fontMetrics->registerFont(
                ['family' => 'Amiri', 'style' => 'italic', 'weight' => 'normal'],
                "$fontDir/Amiri-Italic.ttf"
            );
            $fontMetrics->registerFont(
                ['family' => 'Amiri', 'style' => 'italic', 'weight' => 'bold'],
                "$fontDir/Amiri-BoldItalic.ttf"
            );
        }

        return $pdf->download($filename);
    }
}
