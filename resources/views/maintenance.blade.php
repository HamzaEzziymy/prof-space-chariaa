<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Maintenance – {{ config('app.name') }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
        }
        .card {
            background: #fff;
            border-radius: 1.5rem;
            box-shadow: 0 20px 60px rgba(0,0,0,.08);
            max-width: 480px;
            width: 100%;
            padding: 3rem 2.5rem;
            text-align: center;
        }
        .icon {
            width: 72px; height: 72px;
            background: #ede9fe;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.5rem;
        }
        .icon svg { width: 36px; height: 36px; color: #6366f1; }
        h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: .75rem; }
        p  { color: #64748b; line-height: 1.6; font-size: .95rem; }
        .badge {
            display: inline-block;
            margin-top: 1.5rem;
            background: #ede9fe;
            color: #6366f1;
            font-size: .75rem;
            font-weight: 600;
            padding: .35rem .85rem;
            border-radius: 999px;
            letter-spacing: .04em;
        }
        a.login-link {
            display: block;
            margin-top: 2rem;
            font-size: .85rem;
            color: #94a3b8;
            text-decoration: none;
        }
        a.login-link:hover { color: #6366f1; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17L4.655 7.773a2.25 2.25 0 00-.26-3.025 2.25 2.25 0 00-3.025-.26L4.655 7.773m6.765 7.397l.652-.793c.08-.097.157-.197.228-.3" />
            </svg>
        </div>
        <h1>Maintenance en cours</h1>
        <p>{{ $message }}</p>
        <span class="badge">⚙ Maintenance</span>
        <a href="{{ route('login') }}" class="login-link">Connexion administrateur →</a>
    </div>
</body>
</html>
