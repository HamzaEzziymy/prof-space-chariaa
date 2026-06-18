<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(): Response
    {
        $settings = AppSetting::allAsArray();

        // Resolve storage URLs for image fields
        foreach (['app_logo_url', 'app_favicon_url'] as $key) {
            if (!empty($settings[$key])) {
                $settings[$key] = '/storage/' . $settings[$key];
            }
        }

        // Check if this is a new user (created less than 10 seconds ago)
        $user = auth()->user();
        $newUser = $user && $user->created_at && $user->created_at->diffInSeconds(now()) < 10;

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'newUser'  => $newUser,
        ]);
    }

    /**
     * Save general / identity settings.
     */
    public function updateGeneral(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name'            => 'required|string|max:100',
            'app_name_ar'         => 'required|string|max:100',
            'app_tagline'         => 'nullable|string|max:255',
            'app_tagline_ar'      => 'nullable|string|max:255',
            'contact_email'       => 'nullable|email|max:255',
            'contact_phone'       => 'nullable|string|max:30',
            'institution_name'    => 'nullable|string|max:255',
            'institution_address' => 'nullable|string|max:500',
        ]);

        AppSetting::bulkSet($validated);

        return back()->with('success', 'Paramètres généraux enregistrés.');
    }

    /**
     * Upload app logo.
     * Recommended: 1360×314 px  (PNG, JPG, SVG, WebP — max 2 MB)
     */
    public function uploadLogo(Request $request): RedirectResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
        ]);

        $old = AppSetting::get('app_logo_url');
        if ($old) Storage::disk('public')->delete($old);

        $path = $request->file('logo')->store('settings', 'public');
        AppSetting::set('app_logo_url', $path);

        return back()->with('success', 'Logo mis à jour.');
    }

    /**
     * Upload app favicon / icon.
     * Recommended: 512×512 px  (PNG, ICO — max 512 KB)
     */
    public function uploadFavicon(Request $request): RedirectResponse
    {
        $request->validate([
            'favicon' => 'required|max:512|mimes:png,ico,jpg,jpeg',
        ]);

        $old = AppSetting::get('app_favicon_url');
        if ($old) Storage::disk('public')->delete($old);

        $path = $request->file('favicon')->store('settings', 'public');
        AppSetting::set('app_favicon_url', $path);

        return back()->with('success', 'Favicon mis à jour.');
    }

    /**
     * Toggle maintenance mode on / off.
     */
    public function toggleMaintenance(Request $request): RedirectResponse
    {
        $request->validate([
            'maintenance_mode'       => 'required|boolean',
            'maintenance_message'    => 'nullable|string|max:500',
            'maintenance_message_ar' => 'nullable|string|max:500',
        ]);

        AppSetting::bulkSet([
            'maintenance_mode'       => (bool) $request->maintenance_mode,
            'maintenance_message'    => $request->maintenance_message ?? '',
            'maintenance_message_ar' => $request->maintenance_message_ar ?? '',
        ]);

        $msg = $request->maintenance_mode
            ? 'Mode maintenance activé.'
            : 'Mode maintenance désactivé.';

        return back()->with('success', $msg);
    }
}
