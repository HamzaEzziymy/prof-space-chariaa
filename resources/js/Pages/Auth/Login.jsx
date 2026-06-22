import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

// ─── Login form (inner, needs language context) ───────────────────────────────
function LoginForm({ status, canResetPassword, registrationOpen = true }) {
    const { locale, toggleLocale, isRTL } = useLanguage();
    const { appSettings } = usePage().props;
    const appName  = appSettings?.app_name ?? 'ProfSpace';
    const logoUrl  = appSettings?.app_logo_url;
    const iconUrl  = appSettings?.app_favicon_url;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            replace: true,
            onFinish: () => reset('password'),
        });
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

    const slideFrom = isRTL ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0';

    return (
        <div
            className="relative flex min-h-screen items-center justify-center bg-slate-100 p-4 overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Background */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('./zllij-bg.jpg')` }}
            />
            <div className="absolute inset-0 bg-white/20" />

            <div className={`relative w-full max-w-md z-10 transition-all duration-700 ease-out ${mounted ? 'translate-x-0 opacity-100' : slideFrom}`}>

                {/* Card */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">

                    {/* Header */}
                    <div className="border-b border-slate-100 p-8 pb-6 text-center">
                        {/* Logo */}
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 overflow-hidden">
                            {iconUrl
                                ? <img src={iconUrl} alt={appName} className="h-full w-full object-contain p-2" />
                                : logoUrl
                                    ? <img src={logoUrl} alt={appName} className="h-full w-full object-contain p-2" />
                                    : <span className="text-2xl font-bold text-primary">{appName?.[0] ?? 'P'}</span>
                            }
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">
                            {locale === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {locale === 'ar' ? 'فضاء الأستاذ — لوحة الإدارة' : 'ProfSpace — Panneau d\'administration'}
                        </p>
                    </div>

                    {/* Status message (e.g. password reset success) */}
                    {status && (
                        <div className="mx-8 mt-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-medium text-emerald-700">
                            {status}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={submit} className="p-8 pt-6 space-y-4">

                        {/* Email */}
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value={locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                                className="text-slate-600 text-sm font-medium"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-xl border-slate-300 focus:border-primary focus:ring-primary text-sm"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-1 text-xs" />
                        </div>

                        {/* Password */}
                        <div>
                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <InputLabel
                                    htmlFor="password"
                                    value={locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                                    className="text-slate-600 text-sm font-medium"
                                />
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                                    </Link>
                                )}
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-xl border-slate-300 focus:border-primary focus:ring-primary text-sm"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-1 text-xs" />
                        </div>

                        {/* Remember me */}
                        <label className={`flex items-center gap-2 cursor-pointer select-none ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-600">
                                {locale === 'ar' ? 'تذكرني' : 'Se souvenir de moi'}
                            </span>
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-60"
                        >
                            {processing
                                ? (locale === 'ar' ? 'جاري الدخول...' : 'Connexion...')
                                : (locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter')}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className={`border-t border-slate-100 px-8 py-4 flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {registrationOpen && (
                            <Link
                                href={route('register')}
                                className="text-primary hover:underline font-medium"
                            >
                                {locale === 'ar' ? 'ليس لديك حساب؟ إنشاء حساب' : 'Pas de compte ? S\'inscrire'}
                            </Link>
                        )}
                        {!registrationOpen && (
                            <div />
                        )}

                        {/* Language toggle */}
                        <button
                            type="button"
                            onClick={toggleLocale}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs font-medium transition"
                        >
                            <span>{locale === 'fr' ? '🇲🇦' : '🇫🇷'}</span>
                            <span>{locale === 'fr' ? 'عربية' : 'Français'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function Login({ status, canResetPassword, registrationOpen = true }) {
    const { auth } = usePage().props;

    useEffect(() => {
        if (auth?.user) {
            router.visit(route('dashboard'), { replace: true });
        }
    }, []);

    return (
        <LanguageProvider>
            <Head title="Login" />
            {auth?.user ? null : <LoginForm status={status} canResetPassword={canResetPassword} registrationOpen={registrationOpen} />}
        </LanguageProvider>
    );
}
