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
        Route::get('groupes/{groupe}',                   [DashboardController::class, 'groupeStudents'])->name('groupes.show');
        Route::post('groupes/{groupe}/notes',            [DashboardController::class, 'saveNotes'])->name('groupes.notes');
        Route::post('logout',                            [AuthController::class, 'destroy'])->name('logout');
    });
