<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenance
{
    /**
     * Admins and super_admins bypass maintenance mode.
     * Everyone else gets the maintenance page.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $maintenance = AppSetting::get('maintenance_mode', false);

        if ($maintenance) {
            $user = Auth::user();

            // Allow admins / super_admins through
            if ($user && in_array($user->role, ['admin', 'super_admin'])) {
                return $next($request);
            }

            // Allow the login route so admins can sign in
            if ($request->routeIs('login', 'logout')) {
                return $next($request);
            }

            // Detect locale from Accept-Language or stored cookie
            $locale = $request->cookie('locale') ?? 'fr';
            $message = $locale === 'ar'
                ? AppSetting::get('maintenance_message_ar', 'الموقع تحت الصيانة.')
                : AppSetting::get('maintenance_message', 'Maintenance en cours.');

            // Inertia or plain JSON requests get a JSON response
            if ($request->header('X-Inertia') || $request->expectsJson()) {
                return response()->json(['message' => $message], 503);
            }

            return response()->view('maintenance', compact('message'), 503);
        }

        return $next($request);
    }
}
