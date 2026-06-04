import { Head, useForm } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { useState } from 'react';

function ChangePasswordForm() {
    const { locale, toggleLocale, isRTL } = useLanguage();
    const [showPass, setShowPass]       = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.change.store'));
    };

    const eye    = 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z';
    const eyeOff = 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21';

    const isFr = locale !== 'ar';

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">

                    {/* Header */}
                    <div className="border-b border-slate-100 dark:border-slate-700 p-8 pb-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            {isFr ? 'Changement de mot de passe requis' : 'يجب تغيير كلمة المرور'}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {isFr
                                ? 'Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer.'
                                : 'لأسباب أمنية، يجب عليك تعيين كلمة مرور جديدة قبل المتابعة.'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="p-8 pt-6 space-y-5">

                        {/* New password */}
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                {isFr ? 'Nouveau mot de passe' : 'كلمة المرور الجديدة'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    className={`w-full rounded-xl border px-4 py-2.5 text-sm pe-10 focus:outline-none focus:ring-2 dark:bg-slate-700/60 dark:text-white transition
                                        ${errors.password
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                                            : 'border-slate-300 dark:border-slate-600 focus:border-indigo-400 focus:ring-indigo-400/20'}`}
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={showPass ? eyeOff : eye} />
                                    </svg>
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                {isFr ? 'Confirmer le mot de passe' : 'تأكيد كلمة المرور'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    className={`w-full rounded-xl border px-4 py-2.5 text-sm pe-10 focus:outline-none focus:ring-2 dark:bg-slate-700/60 dark:text-white transition
                                        ${errors.password_confirmation
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                                            : 'border-slate-300 dark:border-slate-600 focus:border-indigo-400 focus:ring-indigo-400/20'}`}
                                />
                                <button type="button" onClick={() => setShowConfirm(v => !v)}
                                    className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={showConfirm ? eyeOff : eye} />
                                    </svg>
                                </button>
                            </div>
                            {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 disabled:opacity-60 transition"
                        >
                            {processing
                                ? (isFr ? 'Enregistrement...' : 'جاري الحفظ...')
                                : (isFr ? 'Définir le mot de passe' : 'تعيين كلمة المرور')}
                        </button>
                    </form>

                    {/* Footer — language toggle */}
                    <div className={`border-t border-slate-100 dark:border-slate-700 px-8 py-4 flex justify-end`}>
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

export default function ChangePassword() {
    return (
        <LanguageProvider>
            <Head title="Changement de mot de passe" />
            <ChangePasswordForm />
        </LanguageProvider>
    );
}
