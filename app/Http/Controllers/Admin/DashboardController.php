<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use App\Models\Module;
use App\Models\NoteExam;
use App\Models\Prof;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $profsCount    = Prof::count();
        $studentsCount = Etudiant::count();
        $modulesCount  = Module::count();

        $maleCount   = Etudiant::where('sexe', 'M')->count();
        $femaleCount = Etudiant::where('sexe', 'F')->count();

        $activeModulesCount = Module::whereNotNull('prof_id')->count();

        $scheduledExams = NoteExam::whereNotNull('id_salle')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->distinct('id_salle')
            ->count('id_salle');

        $gradesEntered = NoteExam::whereNotNull('note_normale')->count();

        $activeUsers = User::where('is_active', true)->count();

        $examModeStats = Module::with('semestre.niveau.filiere')
            ->withCount([
                'etudiantModules',
                'noteExams as normale_count' => fn ($query) => $query->where('statut', 'normale'),
                'noteExams as rattrapage_count' => fn ($query) => $query->where('statut', 'rattrapage'),
                'noteExams as finale_count' => fn ($query) => $query->where('statut', 'finale'),
                'noteExams as normale_validated_count' => fn ($query) => $query
                    ->where('statut', 'normale')
                    ->whereNotNull('note_normale')
                    ->where('note_normale', '!=', 99)
                    ->where('note_normale', '>=', 10),
                'noteExams as normale_failed_count' => fn ($query) => $query
                    ->where('statut', 'normale')
                    ->whereNotNull('note_normale')
                    ->where('note_normale', '<', 10),
                'noteExams as normale_absent_count' => fn ($query) => $query
                    ->where('statut', 'normale')
                    ->where('note_normale', 99),
                'noteExams as rattrapage_validated_count' => fn ($query) => $query
                    ->where('statut', 'rattrapage')
                    ->whereRaw('COALESCE(note_finale, note_rattrapage) IS NOT NULL')
                    ->whereRaw('COALESCE(note_finale, note_rattrapage) != 99')
                    ->whereRaw('COALESCE(note_finale, note_rattrapage) >= 10'),
                'noteExams as rattrapage_failed_count' => fn ($query) => $query
                    ->where('statut', 'rattrapage')
                    ->whereRaw('COALESCE(note_finale, note_rattrapage) IS NOT NULL')
                    ->whereRaw('COALESCE(note_finale, note_rattrapage) < 10'),
                'noteExams as rattrapage_absent_count' => fn ($query) => $query
                    ->where('statut', 'rattrapage')
                    ->whereRaw('COALESCE(note_finale, note_rattrapage) = 99'),
            ])
            ->get()
            ->map(function ($module) {
                $pedagogicTotal = $module->etudiant_modules_count;
                $normaleCount = $module->normale_count;
                $rattrapageCount = $module->rattrapage_count;
                $finaleCount = $module->finale_count;
                $examTotal = $normaleCount + $rattrapageCount + $finaleCount;

                if ($examTotal === 0) return null;

                return [
                    'id'                   => $module->id,
                    'name'                 => $module->nom_fr,
                    'nameAr'               => $module->nom_ar,
                    'nom_ar'               => $module->nom_ar,
                    'nom_fr'               => $module->nom_fr,
                    'total'                => $examTotal,
                    'pedagogicTotal'       => $pedagogicTotal,
                    'noGradeCount'         => max($pedagogicTotal - $examTotal, 0),
                    'normaleCount'         => $normaleCount,
                    'normaleValidated'     => $module->normale_validated_count,
                    'normaleFailed'        => $module->normale_failed_count,
                    'normaleAbsent'        => $module->normale_absent_count,
                    'rattrapageCount'      => $rattrapageCount,
                    'rattrapageValidated'  => $module->rattrapage_validated_count,
                    'rattrapageFailed'     => $module->rattrapage_failed_count,
                    'rattrapageAbsent'     => $module->rattrapage_absent_count,
                    'finaleCount'          => $finaleCount,
                ];
            })
            ->filter()
            ->values();

        $recentProfs = Prof::with(['user:id,nom_fr,prenom_fr,email,is_active'])
            ->withCount('modules')
            ->latest()
            ->take(5)
            ->get();

        $recentStudents = Etudiant::with('niveau:id,nom_fr')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'profsCount'         => $profsCount,
                'studentsCount'      => $studentsCount,
                'modulesCount'       => $modulesCount,
                'activeModulesCount' => $activeModulesCount,
                'scheduledExams'     => $scheduledExams,
                'gradesEntered'      => $gradesEntered,
                'activeUsers'        => $activeUsers,
                'maleCount'          => $maleCount,
                'femaleCount'        => $femaleCount,
            ],
            'examModeStats'  => $examModeStats,
            'recentProfs'    => $recentProfs,
            'recentStudents' => $recentStudents,
        ]);
    }
}
