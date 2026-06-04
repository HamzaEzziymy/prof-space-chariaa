<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ForcePasswordChangeController extends Controller
{
    /**
     * Show the forced password change page.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ChangePassword');
    }

    /**
     * Handle the password update.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'password'              => ['required', 'confirmed', Password::defaults()],
            'password_confirmation' => ['required'],
        ]);

        $user = $request->user();

        $user->must_change_password = false;
        $user->password = $request->password; // model cast handles hashing
        $user->save();

        return redirect()->route('dashboard')->with('status', 'password-changed');
    }
}
