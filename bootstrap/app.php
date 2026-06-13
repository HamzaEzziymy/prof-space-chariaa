<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            \Illuminate\Support\Facades\Route::middleware('web')
                ->group(__DIR__.'/../routes/prof.php');
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\CheckMaintenance::class,
            \App\Http\Middleware\RequirePasswordChange::class,
        ]);

        $middleware->alias([
            'admin'       => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'super_admin' => \App\Http\Middleware\EnsureUserIsSuperAdmin::class,
            'prof'        => \App\Http\Middleware\EnsureUserIsProf::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => $e->getMessage()], 401);
            }

            if ($request->is('prof/*')) {
                return redirect()->guest(route('prof.login'));
            }

            return redirect()->guest(route('login'));
        });
    })->create();
