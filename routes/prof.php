<?php

use App\Http\Controllers\Prof\AuthController;
use App\Http\Controllers\Prof\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->prefix('prof')->name('prof.')->group(function () {
    Route::get('login',  [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store']);
});

Route::middleware(['auth', 'prof'])
    ->prefix('prof')
    ->name('prof.')
    ->group(function () {
        Route::get('dashboard',                          [DashboardController::class, 'index'])->name('dashboard');
        Route::get('modules/{module}',                   [DashboardController::class, 'moduleStudents'])->name('modules.show');
        Route::post('modules/{module}/notes',            [DashboardController::class, 'saveNotes'])->name('modules.notes');
        Route::get('modules/{module}/export-notes',      [DashboardController::class, 'exportNotes'])->name('modules.export-notes');
        Route::get('modules/{module}/releve-notes-pdf',  [DashboardController::class, 'releveNotesPdf'])->name('modules.releve-notes-pdf');
        Route::post('modules/{module}/import-notes',     [DashboardController::class, 'importNotes'])->name('modules.import-notes');
        Route::post('logout',                            [AuthController::class, 'destroy'])->name('logout');
    });
