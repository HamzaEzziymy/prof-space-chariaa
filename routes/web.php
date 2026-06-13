<?php

use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\NoteExamController;
use App\Http\Controllers\RepartitionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfessorController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\ForcePasswordChangeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'admin'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::delete('/profile/avatar', [ProfileController::class, 'removeAvatar'])->name('profile.avatar.remove');

    // Force password change on first login
    Route::get('/password/change',  [ForcePasswordChangeController::class, 'create'])->name('password.change');
    Route::post('/password/change', [ForcePasswordChangeController::class, 'store'])->name('password.change.store');
});// ── Examens (admin + super_admin) ────────────────────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('notes')->name('notes.')->group(function () {
    Route::get('/',               [NoteExamController::class, 'index'])->name('index');
    Route::post('/bulk',         [NoteExamController::class, 'bulkUpdate'])->name('bulk-update');
    Route::delete('/{noteExam}', [NoteExamController::class, 'destroy'])->name('destroy');
});

// ── Répartition des examens (admin + super_admin) ────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('repartition')->name('repartition.')->group(function () {
    Route::get('/',                        [RepartitionController::class, 'index'])->name('index');
    Route::get('/niveau/{niveau}',         [RepartitionController::class, 'show'])->name('show');
    Route::post('/save',                  [RepartitionController::class, 'save'])->name('save');
    Route::get('/etudiants-modules',       [RepartitionController::class, 'getStudents'])->name('students');
});

Route::middleware(['auth', 'super_admin'])->prefix('settings')->name('settings.')->group(function () {
    Route::get('/',             [SettingsController::class, 'index'])->name('index');
    Route::post('/general',     [SettingsController::class, 'updateGeneral'])->name('general');
    Route::post('/logo',        [SettingsController::class, 'uploadLogo'])->name('logo');
    Route::post('/favicon',     [SettingsController::class, 'uploadFavicon'])->name('favicon');
    Route::post('/maintenance', [SettingsController::class, 'toggleMaintenance'])->name('maintenance');
});

// ── Professors (admin + super_admin) ─────────────────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('professors')->name('professors.')->group(function () {
    Route::get('/',                        [ProfessorController::class, 'index'])->name('index');
    Route::post('/',                       [ProfessorController::class, 'store'])->name('store');
    Route::get('/{prof}',                  [ProfessorController::class, 'show'])->name('show');
    Route::put('/{prof}',                  [ProfessorController::class, 'update'])->name('update');
    Route::delete('/{prof}',               [ProfessorController::class, 'destroy'])->name('destroy');
});

// ── Modules (admin + super_admin) ────────────────────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('modules')->name('modules.')->group(function () {
    Route::get('/',             [ModuleController::class, 'index'])->name('index');
    Route::post('/',            [ModuleController::class, 'store'])->name('store');
    Route::put('/{module}',     [ModuleController::class, 'update'])->name('update');
    Route::delete('/{module}',  [ModuleController::class, 'destroy'])->name('destroy');
    Route::post('/import',      [ModuleController::class, 'import'])->name('import');
    Route::post('/import-rows', [ModuleController::class, 'importRows'])->name('importRows');
    Route::post('/import-inscriptions', [ModuleController::class, 'importInscriptions'])->name('import.inscriptions');
    Route::post('/export',      [ModuleController::class, 'export'])->name('export');
    Route::post('/{module}/assign-prof', [ModuleController::class, 'assignProf'])->name('assign-prof');
});

// ── Salles d'examen (admin + super_admin) ─────────────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('salles')->name('salles.')->group(function () {
    Route::get('/',          [SalleController::class, 'index'])->name('index');
    Route::post('/',         [SalleController::class, 'store'])->name('store');
    Route::put('/{salle}',   [SalleController::class, 'update'])->name('update');
    Route::delete('/{salle}',[SalleController::class, 'destroy'])->name('destroy');
});

// ── Étudiants (admin + super_admin) ──────────────────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('etudiants')->name('etudiants.')->group(function () {
    Route::get('/',             [EtudiantController::class, 'index'])->name('index');
    Route::get('/{etudiant}',   [EtudiantController::class, 'show'])->name('show');
    Route::post('/',            [EtudiantController::class, 'store'])->name('store');
    Route::put('/{etudiant}',   [EtudiantController::class, 'update'])->name('update');
    Route::delete('/{etudiant}',[EtudiantController::class, 'destroy'])->name('destroy');
    Route::post('/import',      [EtudiantController::class, 'import'])->name('import');
    Route::post('/{etudiant}/photo', [EtudiantController::class, 'uploadPhoto'])->name('photo');
    Route::delete('/{etudiant}/photo', [EtudiantController::class, 'removePhoto'])->name('photo.remove');
    Route::post('/export',     [EtudiantController::class, 'export'])->name('export');
});

// ── Structure pédagogique (admin + super_admin) ────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('structure')->name('structure.')->group(function () {
    Route::get('/', [\App\Http\Controllers\StructureController::class, 'index'])->name('index');
});

// ── Niveaux — redirect old index to structure (API routes for CRUD) ────────
Route::middleware(['auth', 'admin'])->prefix('niveaux')->group(function () {
    Route::get('/',                 fn () => redirect()->route('structure.index'))->name('niveaux.index');
    Route::post('/',                [\App\Http\Controllers\NiveauController::class, 'store'])->name('niveaux.store');
    Route::put('/{niveau}',         [\App\Http\Controllers\NiveauController::class, 'update'])->name('niveaux.update');
    Route::delete('/{niveau}',      [\App\Http\Controllers\NiveauController::class, 'destroy'])->name('niveaux.destroy');
});

// ── Filieres (admin + super_admin) ─────────────────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('filieres')->name('filieres.')->group(function () {
    Route::post('/',            [\App\Http\Controllers\FiliereController::class, 'store'])->name('store');
    Route::put('/{filiere}',    [\App\Http\Controllers\FiliereController::class, 'update'])->name('update');
    Route::delete('/{filiere}', [\App\Http\Controllers\FiliereController::class, 'destroy'])->name('destroy');
});

// ── Semestres — redirect old index to structure (API routes for CRUD) ───────
Route::middleware(['auth', 'admin'])->prefix('semestres')->group(function () {
    Route::get('/',                 fn () => redirect()->route('structure.index'))->name('semestres.index');
    Route::post('/',                [\App\Http\Controllers\SemestreController::class, 'store'])->name('semestres.store');
    Route::put('/{semestre}',       [\App\Http\Controllers\SemestreController::class, 'update'])->name('semestres.update');
    Route::delete('/{semestre}',    [\App\Http\Controllers\SemestreController::class, 'destroy'])->name('semestres.destroy');
});

// ── Inscription aux examens (admin + super_admin) ─────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('inscription-examen')->name('inscription-examen.')->group(function () {
    Route::get('/',             [\App\Http\Controllers\InscriptionExamenController::class, 'index'])->name('index');
    Route::post('/',            [\App\Http\Controllers\InscriptionExamenController::class, 'store'])->name('store');
    Route::put('/batch-statut/{module}', [\App\Http\Controllers\InscriptionExamenController::class, 'batchStatut'])->name('batch-statut');
    Route::put('/{inscriptionExamen}/statut', [\App\Http\Controllers\InscriptionExamenController::class, 'updateStatut'])->name('update-statut');
    Route::delete('/{inscriptionExamen}', [\App\Http\Controllers\InscriptionExamenController::class, 'destroy'])->name('destroy');
    Route::post('/import',      [\App\Http\Controllers\InscriptionExamenController::class, 'import'])->name('import');
    Route::get('/enrolled/{module}', [\App\Http\Controllers\InscriptionExamenController::class, 'getEnrolledStudents'])->name('enrolled');
});

// ── Inscription pédagogique (admin + super_admin) ────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('inscriptions')->name('inscriptions.')->group(function () {
    Route::get('/',             [\App\Http\Controllers\InscriptionPedagogiqueController::class, 'index'])->name('index');
    Route::post('/',            [\App\Http\Controllers\InscriptionPedagogiqueController::class, 'store'])->name('store');
    Route::delete('/{inscription}', [\App\Http\Controllers\InscriptionPedagogiqueController::class, 'destroy'])->name('destroy');
    Route::post('/import',      [\App\Http\Controllers\InscriptionPedagogiqueController::class, 'import'])->name('import');
    Route::get('/search-students', [\App\Http\Controllers\InscriptionPedagogiqueController::class, 'searchStudents'])->name('searchStudents');
    Route::get('/module/{module}/students', [\App\Http\Controllers\InscriptionPedagogiqueController::class, 'getModuleStudents'])->name('moduleStudents');
    Route::get('/student/{etudiant}/modules', [\App\Http\Controllers\InscriptionPedagogiqueController::class, 'getStudentModules'])->name('studentModules');
});

// ── Users management (super_admin only) ───────────────────────────────────────
Route::middleware(['auth', 'super_admin'])->prefix('users')->name('users.')->group(function () {
    Route::get('/',                    [UserController::class, 'index'])->name('index');
    Route::post('/',                   [UserController::class, 'store'])->name('store');
    Route::put('/{user}',              [UserController::class, 'update'])->name('update');
    Route::delete('/{user}',           [UserController::class, 'destroy'])->name('destroy');
    Route::patch('/{user}/toggle',     [UserController::class, 'toggleActive'])->name('toggle');
});

require __DIR__.'/auth.php';
