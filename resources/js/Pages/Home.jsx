import { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { AcademicCapIcon, ShieldCheckIcon, UsersIcon, BookOpenIcon, ClipboardDocumentListIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

function AdminLoginForm({ onBack }) {
    const { locale, toggleLocale, isRTL } = useLanguage();
    const { appSettings } = usePage().props;
    const appName = appSettings?.app_name ?? 'ProfSpace';
    const logoUrl = appSettings?.app_logo_url;
    const iconUrl = appSettings?.app_favicon_url;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

    const slideFrom = isRTL ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0';

    return (
        <div className={`transition-all duration-700 ease-out ${mounted ? 'translate-x-0 opacity-100' : slideFrom}`}>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 p-8 pb-6 text-center relative">
                    <button type="button" onClick={onBack}
                        className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} text-slate-400 hover:text-slate-600 transition`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </button>
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
                <form onSubmit={submit} className="p-8 pt-6 space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value={locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                            className="text-slate-600 text-sm font-medium" />
                        <TextInput id="email" type="email" name="email" value={data.email}
                            className="mt-1 block w-full rounded-xl border-slate-300 focus:border-primary focus:ring-primary text-sm"
                            autoComplete="username" isFocused={true}
                            onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-1 text-xs" />
                    </div>
                    <div>
                        <InputLabel htmlFor="password" value={locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                            className="text-slate-600 text-sm font-medium" />
                        <TextInput id="password" type="password" name="password" value={data.password}
                            className="mt-1 block w-full rounded-xl border-slate-300 focus:border-primary focus:ring-primary text-sm"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)} />
                        <InputError message={errors.password} className="mt-1 text-xs" />
                    </div>
                    <label className={`flex items-center gap-2 cursor-pointer select-none ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <input type="checkbox" name="remember" checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                        <span className="text-sm text-slate-600">{locale === 'ar' ? 'تذكرني' : 'Se souvenir de moi'}</span>
                    </label>
                    <button type="submit" disabled={processing}
                        className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-60">
                        {processing
                            ? (locale === 'ar' ? 'جاري الدخول...' : 'Connexion...')
                            : (locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter')}
                    </button>
                </form>
                <div className={`border-t border-slate-100 px-8 py-4 flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div />
                    <button type="button" onClick={toggleLocale}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs font-medium transition">
                        <span>{locale === 'fr' ? '🇲🇦' : '🇫🇷'}</span>
                        <span>{locale === 'fr' ? 'عربية' : 'Français'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProfLoginForm({ onBack }) {
    const { locale, toggleLocale, isRTL } = useLanguage();
    const { appSettings } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('prof.login'), {
            onFinish: () => reset('password'),
        });
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

    const slideFrom = isRTL ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0';

    return (
        <div className={`transition-all duration-700 ease-out ${mounted ? 'translate-x-0 opacity-100' : slideFrom}`}>
            <div className="rounded-xl border border-slate-200 bg-white">
                <div className="px-8 pt-10 pb-6 text-center relative">
                    <button type="button" onClick={onBack}
                        className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} text-slate-400 hover:text-slate-600 transition`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        {appSettings?.app_favicon_url ? (
                            <img src={appSettings.app_favicon_url} alt="" className="h-8 w-8 object-contain" />
                        ) : (
                            <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                            </svg>
                        )}
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">
                        {locale === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        {locale === 'ar' ? 'فضاء الأستاذ' : 'Espace professeur'}
                    </p>
                </div>
                <form onSubmit={submit} className="px-8 pb-8 space-y-5">
                    <div>
                        <TextInput id="email" type="email" name="email" value={data.email}
                            placeholder={locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                            className="block w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary"
                            autoComplete="username" isFocused={true}
                            onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-1.5 text-xs" />
                    </div>
                    <div>
                        <div className="relative">
                            <TextInput id="password" type={showPassword ? 'text' : 'password'} name="password"
                                value={data.password}
                                placeholder={locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                                className="block w-full rounded-lg border-slate-300 bg-slate-50 pe-10 ps-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition ${isRTL ? 'left-2' : 'right-2'}`} tabIndex={-1}>
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5 text-xs" />
                    </div>
                    <button type="submit" disabled={processing}
                        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60">
                        {processing
                            ? (locale === 'ar' ? 'جاري الدخول...' : 'Connexion...')
                            : (locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter')}
                    </button>
                </form>
                <div className="flex items-center justify-between border-t border-slate-100 px-8 py-4">
                    <button type="button" onClick={onBack}
                        className="text-xs text-slate-400 hover:text-primary transition">
                        {locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Retour à l\'accueil'}
                    </button>
                    <button type="button" onClick={toggleLocale}
                        className="text-xs font-medium text-slate-400 hover:text-slate-600 transition">
                        {locale === 'fr' ? 'عربية' : 'Français'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function HomeContent() {
    const { locale, toggleLocale, isRTL } = useLanguage();
    const { appSettings } = usePage().props;
    const isAr = locale === 'ar';
    const logoUrl = appSettings?.app_logo_url;
    const iconUrl = appSettings?.app_favicon_url;
    const [loginMode, setLoginMode] = useState(null);

    if (loginMode) {
        return (
            <div className="relative min-h-screen bg-slate-50 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url('/storage/images/zllij-bg.jfif')` }}
                />
                <div className="absolute inset-0 bg-white/70" />
                <div className="relative min-h-screen flex items-center justify-center p-4 z-10">
                    <div className="w-full max-w-md">
                        {loginMode === 'admin' && <AdminLoginForm onBack={() => setLoginMode(null)} />}
                        {loginMode === 'prof' && <ProfLoginForm onBack={() => setLoginMode(null)} />}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title={isAr ? 'كلية الشريعة بفاس - المنصة البيداغوجية' : 'Faculté de Chariaa — Plateforme pédagogique'} />
            <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>

                <div className="bg-slate-900 text-white text-[11px]">
                    <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-9">
                        <div className="flex items-center gap-2 rtl:flex-row-reverse">
                            <span className="text-base">🇲🇦</span>
                            <span className="font-medium">{isAr ? 'المملكة المغربية' : 'Royaume du Maroc'}</span>
                            <span className="opacity-30 mx-1">|</span>
                            <span className="opacity-70 hidden sm:inline">{isAr ? 'وزارة التعليم العالي' : 'Ministère de l\'Enseignement Supérieur'}</span>
                        </div>
                        <button type="button" onClick={toggleLocale} className="flex items-center gap-1.5 hover:underline opacity-70 hover:opacity-100 transition flex-shrink-0">
                            <span>{isAr ? 'Français' : 'العربية'}</span>
                            <span className="text-xs">{isAr ? '🇫🇷' : '🇲🇦'}</span>
                        </button>
                    </div>
                </div>

                <header className="bg-white border-b border-slate-200 shadow-sm">
                    <div className="mx-auto max-w-6xl px-4">
                        <div className="flex items-center py-4">
                            <div className={`shrink-0 flex items-center ${isAr ? 'mr-auto' : ''}`}>
                                {logoUrl
                                    ? <img src={logoUrl} alt="" className="h-20 w-auto max-w-[380px] object-contain" />
                                    : iconUrl
                                        ? <img src={iconUrl} alt="" className="h-20 w-auto max-w-[380px] object-contain" />
                                        : <span className="text-lg font-extrabold text-indigo-600">FSH</span>
                                }
                            </div>
                            {!isAr && <div className="mr-auto" />}
                        </div>
                    </div>
                </header>

                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_50%)]" />

                    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white/70 border border-white/10 mb-5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {isAr ? 'منصة التسيير البيداغوجي الرقمية' : 'Plateforme de gestion pédagogique'}
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                                {isAr ? (
                                    <>مساحة <span className="text-indigo-300">الأساتذة</span> والإدارة</>
                                ) : (
                                    <>Espace <span className="text-indigo-300">Professeurs</span> & Administration</>
                                )}
                            </h2>
                            <p className="mt-3 text-sm text-white/50 max-w-xl mx-auto">
                                {isAr
                                    ? 'منصة متكاملة لتسيير وتدبير الشؤون البيداغوجية : إدارة الطلبة، الأساتذة، الوحدات، النقط والتقارير'
                                    : 'Plateforme complète pour la gestion pédagogique : étudiants, professeurs, modules, notes et rapports'}
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                            <button type="button" onClick={() => setLoginMode('admin')}
                                className="group relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-7 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 hover:bg-white w-full text-left rtl:text-right">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                <div className={`flex items-start gap-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200">
                                        <ShieldCheckIcon className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-slate-800">{isAr ? 'الإدارة' : 'Administration'}</h3>
                                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                            {isAr ? 'إدارة الأساتذة، الطلبة، الوحدات، الامتحانات والنقط' : 'Gérer les professeurs, étudiants, modules, examens et notes'}
                                        </p>
                                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 group-hover:gap-2.5 transition-all">
                                            {isAr ? 'دخول' : 'Se connecter'}
                                            <svg className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button type="button" onClick={() => setLoginMode('prof')}
                                className="group relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-7 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 hover:bg-white w-full text-left rtl:text-right">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                <div className={`flex items-start gap-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-200">
                                        <AcademicCapIcon className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-slate-800">{isAr ? 'فضاء الأستاذ' : 'Espace professeur'}</h3>
                                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                            {isAr ? 'الاطلاع على الوحدات المسندة، إدخال النقط ومتابعة الطلبة' : 'Consulter vos modules, saisir les notes et suivre vos étudiants'}
                                        </p>
                                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-violet-600 group-hover:gap-2.5 transition-all">
                                            {isAr ? 'دخول' : 'Se connecter'}
                                            <svg className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-white">
                    <div className="mx-auto max-w-6xl px-4">
                        <div className="text-center mb-10">
                            <h3 className="text-xl font-bold text-slate-800">{isAr ? 'مزايا المنصة' : 'Fonctionnalités'}</h3>
                            <p className="mt-1 text-sm text-slate-400">{isAr ? 'كل ما تحتاجه لتسيير الشؤون البيداغوجية' : 'Tout ce qu\'il vous faut pour la gestion pédagogique'}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            {[
                                { Icon: UsersIcon, label: isAr ? 'إدارة الطلبة' : 'Étudiants', desc: isAr ? 'تسجيل وبحث وتصفية' : 'Inscription, recherche, filtres' },
                                { Icon: BookOpenIcon, label: isAr ? 'الوحدات' : 'Modules', desc: isAr ? 'برامج ومعاملات وأستاذة' : 'Programmes, coefficients, profs' },
                                { Icon: ClipboardDocumentListIcon, label: isAr ? 'النقط' : 'Notes', desc: isAr ? 'إدخال وتصحيح وتقارير' : 'Saisie, correction, rapports' },
                                { Icon: CalendarDaysIcon, label: isAr ? 'الامتحانات' : 'Examens', desc: isAr ? 'تسجيلات ونتائج' : 'Inscriptions et résultats' },
                            ].map(({ Icon, label, desc }, i) => (
                                <div key={i} className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-5 text-center hover:shadow-sm hover:border-slate-200 transition">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 mb-3">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{label}</span>
                                    <span className="mt-0.5 text-[11px] text-slate-400">{desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className="bg-slate-900 text-white">
                    <div className="mx-auto max-w-6xl px-4 py-10">
                        <div className="grid gap-6 sm:grid-cols-3">
                            <div>
                                <h5 className="text-sm font-bold mb-2">{isAr ? 'كلية الشريعة بفاس' : 'Faculté de Chariaa — Fès'}</h5>
                                <p className="text-xs text-white/50 leading-relaxed">
                                    {isAr
                                        ? 'كلية الشريعة بفاس إحدى مؤسسات جامعة سيدي محمد بن عبد الله، المتخصصة في العلوم الشرعية والقانونية.'
                                        : 'La Faculté de Chariaa de Fès est un établissement de l\'Université Sidi Mohamed Ben Abdellah.'}
                                </p>
                            </div>
                            <div>
                                <h5 className="text-sm font-bold mb-2">{isAr ? 'روابط سريعة' : 'Liens rapides'}</h5>
                                <ul className="space-y-1 text-xs text-white/50">
                                    <li><a href="https://usmba.ac.ma" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">{isAr ? 'جامعة سيدي محمد بن عبد الله' : 'Université USMBA'}</a></li>
                                    <li><a href="https://chariaa.usmba.ac.ma" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">{isAr ? 'الموقع الرسمي للكلية' : 'Site officiel de la faculté'}</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-sm font-bold mb-2">{isAr ? 'اتصل بنا' : 'Contact'}</h5>
                                <ul className="space-y-1 text-xs text-white/50">
                                    <li>{isAr ? 'بفاس، المغرب' : 'Fès, Maroc'}</li>
                                    <li>contact@chariaa.usmba.ac.ma</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 py-4">
                        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
                            <p>&copy; {new Date().getFullYear()} {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}</p>
                            <p>{isAr ? 'تصميم وتطوير : Prof Space Chariaa' : 'Design & développement : Prof Space Chariaa'}</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default function Home({ auth }) {
    return (
        <LanguageProvider defaultLocale="ar">
            {auth?.user ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <p className="text-slate-400">{'أنت متصل بالفعل'}</p>
                        <Link href={route('dashboard')} className="mt-4 inline-flex items-center gap-1.5 text-indigo-600 hover:underline text-sm">
                            {'الذهاب إلى لوحة التحكم ←'}
                        </Link>
                    </div>
                </div>
            ) : (
                <HomeContent />
            )}
        </LanguageProvider>
    );
}
