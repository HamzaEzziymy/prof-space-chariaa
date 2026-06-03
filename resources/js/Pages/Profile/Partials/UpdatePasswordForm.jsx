import InputError from '@/Components/InputError';
import { useLanguage } from '@/i18n/LanguageContext';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm() {
    const { locale } = useLanguage();
    const passwordInput        = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const Field = ({ id, label, refProp, value, onChange }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                {label}
            </label>
            <input
                id={id}
                type="password"
                ref={refProp}
                value={value}
                onChange={onChange}
                autoComplete={id === 'current_password' ? 'current-password' : 'new-password'}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <InputError message={errors[id]} className="mt-1 text-xs" />
        </div>
    );

    return (
        <section>
            <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                    {locale === 'ar' ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {locale === 'ar'
                        ? 'استخدم كلمة مرور طويلة وعشوائية لأمان أفضل.'
                        : 'Utilisez un mot de passe long et aléatoire pour rester en sécurité.'}
                </p>
            </div>

            <form onSubmit={updatePassword} className="space-y-4">
                <Field
                    id="current_password"
                    label={locale === 'ar' ? 'كلمة المرور الحالية' : 'Mot de passe actuel'}
                    refProp={currentPasswordInput}
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                />
                <Field
                    id="password"
                    label={locale === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                    refProp={passwordInput}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                />
                <Field
                    id="password_confirmation"
                    label={locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                />

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                    >
                        {processing
                            ? (locale === 'ar' ? 'جاري الحفظ...' : 'Enregistrement...')
                            : (locale === 'ar' ? 'تحديث' : 'Mettre à jour')}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {locale === 'ar' ? 'تم التحديث' : 'Mis à jour'}
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
