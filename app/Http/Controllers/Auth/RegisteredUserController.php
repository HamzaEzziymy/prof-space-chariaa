<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        // If users already exist, registration is closed
        if (User::count() > 0) {
            abort(403, 'Registration is closed.');
        }
        
        return Inertia::render('Auth/Register', [
            'registrationOpen' => true,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Check if registration is still open (no users exist yet)
        if (User::count() > 0) {
            throw ValidationException::withMessages([
                'email' => 'Registration is closed. Only the first user can register.',
            ]);
        }

        $request->validate([
            'nom_fr'   => 'required|string|max:255',
            'prenom_fr' => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:user,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'nom_fr'    => $request->nom_fr,
            'prenom_fr' => $request->prenom_fr,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => 'super_admin', // First user is super admin
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('settings.index', absolute: false));
    }
}
