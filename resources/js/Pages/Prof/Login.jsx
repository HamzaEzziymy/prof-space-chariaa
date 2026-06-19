import { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

function LoginForm() {
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

    // Prof: opposite direction to admin — Arabic slides from left, French from right
    const slideFrom = isRTL ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0';

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/storage/images/zllij-bg.jfif')` }}
            />
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/80" />
            <div className={`relative w-full max-w-sm z-10 transition-all duration-700 ease-out ${mounted ? 'translate-x-0 opacity-100' : slideFrom}`}>
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">

                    <div className="px-8 pt-10 pb-6 text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                            {appSettings?.app_favicon_url ? (
                                <img src={appSettings.app_favicon_url} alt="" className="h-8 w-8 object-contain" />
                            ) : (
                                <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                                </svg>
                            )}
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            {locale === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            {locale === 'ar' ? 'فضاء الأستاذ' : 'Espace professeur'}
                        </p>
                    </div>

                    <form onSubmit={submit} className="px-8 pb-8 space-y-5">
                        <div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder={locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                                className="block w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-1.5 text-xs" />
                        </div>

                        <div>
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    placeholder={locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                                    className="block w-full rounded-lg border-slate-300 bg-slate-50 pe-10 ps-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition ${isRTL ? 'left-2' : 'right-2'}`}
                                    tabIndex={-1}
                                >
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

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                        >
                            {processing
                                ? (locale === 'ar' ? 'جاري الدخول...' : 'Connexion...')
                                : (locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter')}
                        </button>
                    </form>

                    <div className="flex items-center justify-between border-t border-slate-100 px-8 py-4 dark:border-slate-700">
                        <Link href={route('login')} className="text-xs text-slate-400 hover:text-primary transition">
                            {locale === 'ar' ? 'تسجيل الدخول للإدارة' : 'Connexion administration'}
                        </Link>
                        <button type="button" onClick={toggleLocale} className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                            {locale === 'fr' ? 'عربية' : 'Français'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <LanguageProvider defaultLocale="ar">
            <Head title="Connexion Professeur" />
            <LoginForm />
        </LanguageProvider>
    );
}
