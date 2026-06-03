import { useLanguage } from '@/i18n/LanguageContext';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm() {
    const { locale } = useLanguage();
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setConfirming(false),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirming(false);
        clearErrors();
        reset();
    };

    return (
        <section>
            <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                    {locale === 'ar' ? 'حذف الحساب' : 'Supprimer le compte'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {locale === 'ar'
                        ? 'بمجرد حذف حسابك، ستُحذف جميع بياناتك نهائياً.'
                        : 'Une fois votre compte supprimé, toutes ses ressources et données seront définitivement effacées.'}
                </p>
            </div>

            <button
                onClick={() => setConfirming(true)}
                className="rounded-xl bg-red-50 border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40"
            >
                {locale === 'ar' ? 'حذف الحساب' : 'Supprimer le compte'}
            </button>

            {/* Confirmation modal */}
            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Dialog */}
                    <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-800 p-6 z-10">
                        {/* Icon */}
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h3 className="text-center text-base font-semibold text-slate-800 dark:text-white mb-1">
                            {locale === 'ar' ? 'هل أنت متأكد من حذف حسابك؟' : 'Confirmer la suppression du compte ?'}
                        </h3>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-5">
                            {locale === 'ar'
                                ? 'أدخل كلمة المرور للتأكيد. هذا الإجراء لا يمكن التراجع عنه.'
                                : 'Entrez votre mot de passe pour confirmer. Cette action est irréversible.'}
                        </p>

                        <form onSubmit={deleteUser}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                                    {locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                                </label>
                                <input
                                    type="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={locale === 'ar' ? 'أدخل كلمة المرور' : 'Entrez votre mot de passe'}
                                    autoFocus
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                >
                                    {locale === 'ar' ? 'إلغاء' : 'Annuler'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                                >
                                    {processing
                                        ? (locale === 'ar' ? 'جاري الحذف...' : 'Suppression...')
                                        : (locale === 'ar' ? 'حذف نهائياً' : 'Supprimer définitivement')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
