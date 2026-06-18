import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, Link, useForm } from '@inertiajs/react';

// ─── Register form (inner, needs language context) ────────────────────────────
function RegisterForm() {
    const { t, locale, toggleLocale, isRTL } = useLanguage();

    const { data, setData, post, processing, errors, reset } = useForm({
        nom_fr: '',
        prenom_fr: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 p-4"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">

                    {/* Header */}
                    <div className="border-b border-slate-100 dark:border-slate-700 p-8 pb-6 text-center">
                        {/* Logo */}
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                            <span className="text-2xl font-bold text-white">P</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            {locale === 'ar' ? 'إنشاء حساب جديد' : 'Créer un compte'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {locale === 'ar' ? 'فضاء الأستاذ — لوحة الإدارة' : 'ProfSpace — Panneau d\'administration'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="p-8 pt-6 space-y-4">

                        {/* Nom / Prénom row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="prenom_fr"
                                    value={locale === 'ar' ? 'الاسم الأول' : 'Prénom'}
                                    className="text-slate-600 dark:text-slate-300 text-sm font-medium"
                                />
                                <TextInput
                                    id="prenom_fr"
                                    name="prenom_fr"
                                    value={data.prenom_fr}
                                    className="mt-1 block w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-primary focus:ring-primary text-sm"
                                    autoComplete="given-name"
                                    isFocused={true}
                                    onChange={(e) => setData('prenom_fr', e.target.value)}
                                    required
                                />
                                <InputError message={errors.prenom_fr} className="mt-1 text-xs" />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="nom_fr"
                                    value={locale === 'ar' ? 'اللقب' : 'Nom'}
                                    className="text-slate-600 dark:text-slate-300 text-sm font-medium"
                                />
                                <TextInput
                                    id="nom_fr"
                                    name="nom_fr"
                                    value={data.nom_fr}
                                    className="mt-1 block w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-primary focus:ring-primary text-sm"
                                    autoComplete="family-name"
                                    onChange={(e) => setData('nom_fr', e.target.value)}
                                    required
                                />
                                <InputError message={errors.nom_fr} className="mt-1 text-xs" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value={locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                                className="text-slate-600 dark:text-slate-300 text-sm font-medium"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-primary focus:ring-primary text-sm"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-1 text-xs" />
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel
                                htmlFor="password"
                                value={locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                                className="text-slate-600 dark:text-slate-300 text-sm font-medium"
                            />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-primary focus:ring-primary text-sm"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-1 text-xs" />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value={locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
                                className="text-slate-600 dark:text-slate-300 text-sm font-medium"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-primary focus:ring-primary text-sm"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-1 text-xs" />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {processing
                                ? (locale === 'ar' ? 'جاري الإنشاء...' : 'Création...')
                                : (locale === 'ar' ? 'إنشاء الحساب' : 'Créer le compte')}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className={`border-t border-slate-100 dark:border-slate-700 px-8 py-4 flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Link
                            href={route('login')}
                            className="text-primary hover:underline font-medium"
                        >
                            {locale === 'ar' ? 'لديك حساب؟ تسجيل الدخول' : 'Déjà inscrit ? Se connecter'}
                        </Link>

                        {/* Language toggle */}
                        <button
                            type="button"
                            onClick={toggleLocale}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium transition"
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
export default function Register() {
    return (
        <LanguageProvider>
            <Head title="Register" />
            <RegisterForm />
        </LanguageProvider>
    );
}
