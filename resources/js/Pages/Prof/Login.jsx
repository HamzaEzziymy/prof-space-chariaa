import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

function LoginForm() {
    const { locale, toggleLocale, isRTL } = useLanguage();
    const { appSettings } = usePage().props;

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

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="w-full max-w-sm">
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
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder={locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                                className="block w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
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
