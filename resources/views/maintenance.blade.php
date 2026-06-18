<!DOCTYPE html>
<html lang="{{ $locale ?? 'fr' }}" dir="{{ ($locale ?? 'fr') === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ ($locale ?? 'fr') === 'ar' ? 'صيانة' : 'Maintenance' }} – {{ config('app.name') }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: {{ ($locale ?? 'fr') === 'ar' ? "'Segoe UI Arabic', 'Traditional Arabic', system-ui" : "'Segoe UI', system-ui" }}, sans-serif;
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
            width: 80px; height: 80px;
            background: #ede9fe;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.5rem;
        }
        .icon svg { width: 40px; height: 40px; color: #6366f1; stroke-width: 1.5; }
        h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: .75rem; }
        p  { color: #64748b; line-height: 1.6; font-size: .95rem; }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: .4rem;
            margin-top: 1.5rem;
            background: #ede9fe;
            color: #6366f1;
            font-size: .75rem;
            font-weight: 600;
            padding: .4rem 1rem;
            border-radius: 999px;
            letter-spacing: .04em;
        }
        .badge svg {
            width: 14px; height: 14px;
            stroke-width: 2;
        }
        a.login-link {
            display: block;
            margin-top: 2rem;
            font-size: .85rem;
            color: #94a3b8;
            text-decoration: none;
            transition: color .15s;
        }
        a.login-link:hover { color: #6366f1; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-7.42 7.42a2.12 2.12 0 01-3-3l7.42-7.42A6 6 0 0118.75 5.97l-3.78 3.78a1 1 0 000 1.42l1.42 1.42a1 1 0 001.42 0l3.78-3.78A6 6 0 0111.42 15.17z" />
            </svg>
        </div>
        <h1>{{ ($locale ?? 'fr') === 'ar' ? 'الموقع تحت الصيانة' : 'Maintenance en cours' }}</h1>
        <p>{{ $message }}</p>
        <span class="badge">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-7.42 7.42a2.12 2.12 0 01-3-3l7.42-7.42A6 6 0 0118.75 5.97l-3.78 3.78a1 1 0 000 1.42l1.42 1.42a1 1 0 001.42 0l3.78-3.78A6 6 0 0111.42 15.17z" />
            </svg>
            {{ ($locale ?? 'fr') === 'ar' ? 'صيانة' : 'Maintenance' }}
        </span>
        <a href="{{ route('login') }}" class="login-link">
            {{ ($locale ?? 'fr') === 'ar' ? 'تسجيل دخول المسؤول ←' : 'Connexion administrateur →' }}
        </a>
    </div>
</body>
</html>
