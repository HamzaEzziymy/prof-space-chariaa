import InputError from '@/Components/InputError';
import { useLanguage } from '@/i18n/LanguageContext';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status }) {
    const { t, locale } = useLanguage();
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        nom_fr:    user.nom_fr    ?? '',
        prenom_fr: user.prenom_fr ?? '',
        nom_ar:    user.nom_ar    ?? '',
        prenom_ar: user.prenom_ar ?? '',
        email:     user.email     ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const Field = ({ id, label, value, onChange, type = 'text', required = false, autoComplete }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                required={required}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <InputError message={errors[id]} className="mt-1 text-xs" />
        </div>
    );

    return (
        <section>
            <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                    {locale === 'ar' ? 'المعلومات الشخصية' : 'Informations personnelles'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {locale === 'ar'
                        ? 'تحديث معلومات حسابك والبريد الإلكتروني'
                        : 'Mettez à jour les informations de votre compte et votre adresse e-mail.'}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">

                {/* French name row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        id="prenom_fr"
                        label={locale === 'ar' ? 'الاسم الأول (فرنسي)' : 'Prénom (français)'}
                        value={data.prenom_fr}
                        onChange={(e) => setData('prenom_fr', e.target.value)}
                        required
                        autoComplete="given-name"
                    />
                    <Field
                        id="nom_fr"
                        label={locale === 'ar' ? 'اللقب (فرنسي)' : 'Nom (français)'}
                        value={data.nom_fr}
                        onChange={(e) => setData('nom_fr', e.target.value)}
                        required
                        autoComplete="family-name"
                    />
                </div>

                {/* Arabic name row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        id="prenom_ar"
                        label={locale === 'ar' ? 'الاسم الأول (عربي)' : 'Prénom (arabe)'}
                        value={data.prenom_ar}
                        onChange={(e) => setData('prenom_ar', e.target.value)}
                        autoComplete="off"
                    />
                    <Field
                        id="nom_ar"
                        label={locale === 'ar' ? 'اللقب (عربي)' : 'Nom (arabe)'}
                        value={data.nom_ar}
                        onChange={(e) => setData('nom_ar', e.target.value)}
                        autoComplete="off"
                    />
                </div>

                {/* Email */}
                <Field
                    id="email"
                    type="email"
                    label={locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    autoComplete="username"
                />

                {/* Email verification notice */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm dark:bg-amber-900/20 dark:border-amber-700">
                        <p className="text-amber-700 dark:text-amber-400">
                            {locale === 'ar' ? 'بريدك الإلكتروني غير مؤكد.' : 'Votre adresse e-mail n\'est pas vérifiée.'}
                            {' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline hover:no-underline font-medium"
                            >
                                {locale === 'ar' ? 'إعادة إرسال رابط التحقق' : 'Renvoyer le lien de vérification'}
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                {locale === 'ar' ? 'تم إرسال رابط التحقق.' : 'Lien de vérification envoyé.'}
                            </p>
                        )}
                    </div>
                )}

                {/* Submit */}
                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                    >
                        {processing
                            ? (locale === 'ar' ? 'جاري الحفظ...' : 'Enregistrement...')
                            : (locale === 'ar' ? 'حفظ التغييرات' : 'Enregistrer')}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {locale === 'ar' ? 'تم الحفظ' : 'Enregistré'}
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
