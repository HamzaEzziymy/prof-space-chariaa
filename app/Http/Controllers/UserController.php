<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * List all users with search + role filter + pagination.
     */
    public function index(Request $request): Response
    {
        $query = User::query()
            ->with('prof')   // eager-load prof relationship
            ->select(['id', 'nom_fr', 'prenom_fr', 'nom_ar', 'prenom_ar',
                      'email', 'role', 'photo_profile_url', 'is_active',
                      'created_at', 'email_verified_at'])
            ->orderBy('created_at', 'desc');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nom_fr',    'like', "%{$search}%")
                  ->orWhere('prenom_fr', 'like', "%{$search}%")
                  ->orWhere('nom_ar',    'like', "%{$search}%")
                  ->orWhere('prenom_ar', 'like', "%{$search}%")
                  ->orWhere('email',     'like', "%{$search}%");
            });
        }

        if ($role = $request->get('role')) {
            $query->where('role', $role);
        }

        $users = $query->paginate(12)->withQueryString();

        // Ensure avatar_url is always present as a relative public URL
        $users->getCollection()->transform(function ($user) {
            $user->avatar_url = $user->photo_profile_url
                ? '/storage/' . $user->photo_profile_url
                : null;
            return $user;
        });

        return Inertia::render('Users/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role']),
            'stats'   => [
                'total'      => User::count(),
                'admins'     => User::where('role', 'admin')->count(),
                'profs'      => User::where('role', 'prof')->count(),
                'superAdmins'=> User::where('role', 'super_admin')->count(),
            ],
        ]);
    }

    /**
     * Toggle active/inactive status of a user.
     */
    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'cannot_deactivate_self');
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        return back()->with('success', $user->is_active ? 'user_activated' : 'user_deactivated');
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nom_fr'    => ['required', 'string', 'max:255'],
            'prenom_fr' => ['required', 'string', 'max:255'],
            'nom_ar'    => ['nullable', 'string', 'max:255'],
            'prenom_ar' => ['nullable', 'string', 'max:255'],
            'email'     => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('user', 'email')],
            'role'      => ['required', Rule::in(['admin', 'prof', 'super_admin'])],
            'password'  => ['required', 'confirmed', Password::defaults()],
        ]);

        User::create([
            ...$validated,
            'password'             => Hash::make($validated['password']),
            'must_change_password' => true,
        ]);

        return back()->with('success', 'user_created');
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'nom_fr'    => ['required', 'string', 'max:255'],
            'prenom_fr' => ['required', 'string', 'max:255'],
            'nom_ar'    => ['nullable', 'string', 'max:255'],
            'prenom_ar' => ['nullable', 'string', 'max:255'],
            'email'     => ['required', 'string', 'lowercase', 'email', 'max:255',
                           Rule::unique('user', 'email')->ignore($user->id)],
            'role'      => ['required', Rule::in(['admin', 'prof', 'super_admin'])],
            'password'  => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $user->fill([
            'nom_fr'    => $validated['nom_fr'],
            'prenom_fr' => $validated['prenom_fr'],
            'nom_ar'    => $validated['nom_ar']    ?? null,
            'prenom_ar' => $validated['prenom_ar'] ?? null,
            'email'     => $validated['email'],
            'role'      => $validated['role'],
        ]);

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', 'user_updated');
    }

    /**
     * Delete a user (cannot delete yourself).
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'cannot_delete_self');
        }

        $user->delete();

        return back()->with('success', 'user_deleted');
    }
}
