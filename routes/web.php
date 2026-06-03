<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
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
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::delete('/profile/avatar', [ProfileController::class, 'removeAvatar'])->name('profile.avatar.remove');
});

// ── Settings (admin only) ──────────────────────────────────────────────────────
Route::middleware(['auth', 'admin'])->prefix('settings')->name('settings.')->group(function () {
    Route::get('/',             [SettingsController::class, 'index'])->name('index');
    Route::post('/general',     [SettingsController::class, 'updateGeneral'])->name('general');
    Route::post('/logo',        [SettingsController::class, 'uploadLogo'])->name('logo');
    Route::post('/favicon',     [SettingsController::class, 'uploadFavicon'])->name('favicon');
    Route::post('/maintenance', [SettingsController::class, 'toggleMaintenance'])->name('maintenance');
});

require __DIR__.'/auth.php';
