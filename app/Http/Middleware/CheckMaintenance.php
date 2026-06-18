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

            // Only super_admin can bypass maintenance mode
            if ($user && $user->role === 'super_admin') {
                return $next($request);
            }

            // Allow the login route so admins can sign in
            if ($request->routeIs('login', 'logout')) {
                return $next($request);
            }

            // Detect locale from cookie, session, or Accept-Language header
            $locale = $request->cookie('locale');
            
            // If no cookie, check session
            if (!$locale) {
                $locale = session('locale');
            }
            
            // If still no locale, check Accept-Language header for Arabic
            if (!$locale) {
                $acceptLanguage = $request->header('Accept-Language', '');
                $locale = str_contains($acceptLanguage, 'ar') ? 'ar' : 'fr';
            }
            
            // Default to French if still no locale found
            if (!$locale) {
                $locale = 'fr';
            }

            $message = $locale === 'ar'
                ? AppSetting::get('maintenance_message_ar', 'الموقع تحت الصيانة.')
                : AppSetting::get('maintenance_message', 'Maintenance en cours.');

            // Inertia or plain JSON requests get a JSON response
            if ($request->header('X-Inertia') || $request->expectsJson()) {
                return response()->json(['message' => $message], 503);
            }

            return response()->view('maintenance', compact('message', 'locale'), 503);
        }

        return $next($request);
    }
}
