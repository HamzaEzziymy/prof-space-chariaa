import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Transition } from '@headlessui/react';

// ─── Reusable input field ─────────────────────────────────────────────────────
function Field({ id, label, value, onChange, type = 'text', required, autoComplete, error, readOnly }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                id={id} type={type} value={value} onChange={onChange}
                autoComplete={autoComplete} required={required} readOnly={readOnly}
                className={`block w-full rounded-lg border px-4 py-2.5 text-sm text-slate-800 shadow-sm transition dark:text-white
                    ${readOnly
                        ? 'border-slate-200 bg-slate-50 cursor-not-allowed dark:border-slate-700 dark:bg-slate-700/50'
                        : 'border-slate-300 bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-700'
                    }`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, description, children, onEdit, editLabel, editing, isRTL }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
            <div className={`flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700 px-6 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{title}</h3>
                    {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
                </div>
                {onEdit && !editing && (
                    <button type="button" onClick={onEdit}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {editLabel}
                    </button>
                )}
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    );
}

// ─── Avatar upload section ────────────────────────────────────────────────────
function AvatarUpload({ user, locale, isRTL, editing, onCancel }) {
    const fileRef  = useRef();
    const [preview, setPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const { delete: destroy, processing } = useForm();

    const uploadForm = useForm({ photo: null });

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setPreview(URL.createObjectURL(file));
        uploadForm.setData('photo', file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        uploadForm.post(route('profile.avatar'), {
            forceFormData: true,
            onSuccess: () => { setPreview(null); onCancel?.(); },
        });
    };

    const handleRemove = () => {
        destroy(route('profile.avatar.remove'));
    };

    const avatarSrc = preview || user.avatar_url;
    const initial = isRTL
        ? (user.nom_ar?.[0] ?? user.nom_fr?.[0] ?? user.email?.[0] ?? '?').toUpperCase()
        : (user.nom_fr?.[0] ?? user.email?.[0] ?? '?').toUpperCase();

    // ── Collapsed view: just the avatar ──
    if (!editing) {
        return (
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="h-16 w-16 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-700 shadow-md flex-shrink-0">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary text-2xl font-bold text-white">
                            {initial}
                        </div>
                    )}
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {user.avatar_url
                            ? (locale === 'ar' ? 'تم تعيين صورة' : 'Photo définie')
                            : (locale === 'ar' ? 'لا توجد صورة' : 'Aucune photo')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {locale === 'ar' ? 'JPG، PNG، WEBP — 2 ميغابايت كحد أقصى' : 'JPG, PNG, WEBP — max 2 Mo'}
                    </p>
                </div>
            </div>
        );
    }

    // ── Expanded view: upload UI ──
    return (
        <div className={`flex flex-col sm:flex-row items-start gap-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            {/* Avatar preview */}
            <div className="relative flex-shrink-0">
                <div className="h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-700 shadow-lg">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary text-3xl font-bold text-white">
                            {initial}
                        </div>
                    )}
                </div>
                {/* Camera badge */}
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            {/* Drop zone + controls */}
            <div className={`flex-1 w-full ${isRTL ? 'text-right' : ''}`}>
                <form onSubmit={handleSubmit}>
                    {/* Drop zone */}
                    <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                        className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition
                            ${dragOver
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-300 hover:border-primary/60 dark:border-slate-600'
                            }`}
                    >
                        <svg className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {preview
                                ? (locale === 'ar' ? 'تم اختيار الصورة' : 'Image sélectionnée')
                                : (locale === 'ar' ? 'اسحب صورة هنا أو انقر للاختيار' : 'Glissez une image ou cliquez pour choisir')}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            {locale === 'ar' ? 'JPG، PNG، WEBP — حد أقصى 2 ميغابايت' : 'JPG, PNG, WEBP — max 2 Mo'}
                        </p>
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files[0])}
                    />

                    {uploadForm.errors.photo && (
                        <p className="mt-1 text-xs text-red-500">{uploadForm.errors.photo}</p>
                    )}

                    {/* Action buttons */}
                    <div className={`mt-3 flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {preview && (
                            <button type="submit" disabled={uploadForm.processing}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60">
                                {uploadForm.processing
                                    ? '...'
                                    : (locale === 'ar' ? 'رفع الصورة' : 'Enregistrer la photo')}
                            </button>
                        )}
                        {preview && (
                            <button type="button" onClick={() => { setPreview(null); uploadForm.reset(); onCancel?.(); }}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {locale === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                        )}
                        {!preview && (
                            <button type="button" onClick={() => { onCancel?.(); }}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {locale === 'ar' ? 'إغلاق' : 'Fermer'}
                            </button>
                        )}
                        {!preview && user.avatar_url && (
                            <button type="button" onClick={handleRemove} disabled={processing}
                                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                {locale === 'ar' ? 'حذف الصورة' : 'Supprimer la photo'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Avatar section card (wraps AvatarUpload with Modifier toggle) ────────────
function AvatarSection({ user, locale, isRTL }) {
    const [editing, setEditing] = useState(false);
    return (
        <SectionCard
            title={locale === 'ar' ? 'صورة الملف الشخصي' : 'Photo de profil'}
            description={locale === 'ar' ? 'JPG، PNG، WEBP — 2 ميغابايت كحد أقصى' : 'JPG, PNG, WEBP — max 2 Mo'}
            onEdit={() => setEditing(true)}
            editLabel={locale === 'ar' ? 'تعديل' : 'Modifier'}
            editing={editing}
            isRTL={isRTL}
        >
            <AvatarUpload
                user={user}
                locale={locale}
                isRTL={isRTL}
                editing={editing}
                onCancel={() => setEditing(false)}
            />
        </SectionCard>
    );
}

// ─── Personal info section ────────────────────────────────────────────────────
function PersonalInfoSection({ mustVerifyEmail, status, isRTL, locale }) {
    const user = usePage().props.auth.user;
    const [editing, setEditing] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        nom_fr:    user.nom_fr    ?? '',
        prenom_fr: user.prenom_fr ?? '',
        nom_ar:    user.nom_ar    ?? '',
        prenom_ar: user.prenom_ar ?? '',
        email:     user.email     ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), { onSuccess: () => setEditing(false) });
    };

    return (
        <SectionCard
            title={locale === 'ar' ? 'المعلومات الشخصية' : 'Informations personnelles'}
            description={locale === 'ar' ? 'الاسم والبريد الإلكتروني' : 'Nom et adresse e-mail'}
            onEdit={() => setEditing(true)}
            editLabel={locale === 'ar' ? 'تعديل' : 'Modifier'}
            editing={editing}
            isRTL={isRTL}
        >
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="prenom_fr" label={locale === 'ar' ? 'الاسم الأول (فر.)' : 'Prénom (fr.)'}
                        value={data.prenom_fr} onChange={e => setData('prenom_fr', e.target.value)}
                        required readOnly={!editing} error={errors.prenom_fr} autoComplete="given-name" />
                    <Field id="nom_fr" label={locale === 'ar' ? 'اللقب (فر.)' : 'Nom (fr.)'}
                        value={data.nom_fr} onChange={e => setData('nom_fr', e.target.value)}
                        required readOnly={!editing} error={errors.nom_fr} autoComplete="family-name" />
                    <Field id="prenom_ar" label={locale === 'ar' ? 'الاسم الأول (ع.)' : 'Prénom (ar.)'}
                        value={data.prenom_ar} onChange={e => setData('prenom_ar', e.target.value)}
                        readOnly={!editing} error={errors.prenom_ar} />
                    <Field id="nom_ar" label={locale === 'ar' ? 'اللقب (ع.)' : 'Nom (ar.)'}
                        value={data.nom_ar} onChange={e => setData('nom_ar', e.target.value)}
                        readOnly={!editing} error={errors.nom_ar} />
                </div>

                <Field id="email" type="email" label={locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                    value={data.email} onChange={e => setData('email', e.target.value)}
                    required readOnly={!editing} error={errors.email} autoComplete="username" />

                {/* Role badge */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
                        {locale === 'ar' ? 'الدور' : 'Rôle'}
                    </label>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {user.role === 'super_admin'
                            ? (locale === 'ar' ? 'مدير عام' : 'Super Administrateur')
                            : user.role === 'prof'
                                ? (locale === 'ar' ? 'أستاذ' : 'Professeur')
                                : (locale === 'ar' ? 'مدير' : 'Administrateur')}
                    </span>
                </div>

                {/* Email verification notice */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm dark:bg-amber-900/20 dark:border-amber-700">
                        <p className="text-amber-700 dark:text-amber-400">
                            {locale === 'ar' ? 'بريدك غير مؤكد. ' : "E-mail non vérifié. "}
                            <Link href={route('verification.send')} method="post" as="button" className="underline font-medium">
                                {locale === 'ar' ? 'إعادة الإرسال' : 'Renvoyer'}
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-1 font-medium text-emerald-600 dark:text-emerald-400">
                                {locale === 'ar' ? 'تم الإرسال.' : 'Envoyé.'}
                            </p>
                        )}
                    </div>
                )}

                {editing && (
                    <div className={`flex items-center gap-3 pt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="submit" disabled={processing}
                            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60">
                            {processing ? '...' : (locale === 'ar' ? 'حفظ' : 'Enregistrer')}
                        </button>
                        <button type="button" onClick={() => setEditing(false)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {locale === 'ar' ? 'إلغاء' : 'Annuler'}
                        </button>
                        <Transition show={recentlySuccessful} enter="transition duration-300" enterFrom="opacity-0" leave="transition duration-300" leaveTo="opacity-0">
                            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {locale === 'ar' ? 'تم' : 'Enregistré'}
                            </span>
                        </Transition>
                    </div>
                )}
            </form>
        </SectionCard>
    );
}

// ─── Change password section ──────────────────────────────────────────────────
function PasswordSection({ isRTL, locale }) {
    const [editing, setEditing] = useState(false);
    const passwordRef        = useRef();
    const currentPasswordRef = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '', password: '', password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => { reset(); setEditing(false); },
            onError: (errs) => {
                if (errs.password)          { reset('password', 'password_confirmation'); passwordRef.current?.focus(); }
                if (errs.current_password)  { reset('current_password'); currentPasswordRef.current?.focus(); }
            },
        });
    };

    return (
        <SectionCard
            title={locale === 'ar' ? 'الأمان' : 'Sécurité'}
            description={locale === 'ar' ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}
            onEdit={() => setEditing(true)}
            editLabel={locale === 'ar' ? 'تغيير' : 'Modifier'}
            editing={editing}
            isRTL={isRTL}
        >
            {!editing ? (
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                        </p>
                        <p className="text-xs text-slate-400">••••••••••••</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    {[
                        { id: 'current_password', label: locale === 'ar' ? 'الحالية' : 'Actuel',    ref: currentPasswordRef, val: data.current_password,      key: 'current_password' },
                        { id: 'password',         label: locale === 'ar' ? 'الجديدة' : 'Nouveau',   ref: passwordRef,        val: data.password,               key: 'password' },
                        { id: 'pwd_confirm',      label: locale === 'ar' ? 'تأكيد' : 'Confirmer',   ref: null,               val: data.password_confirmation,  key: 'password_confirmation' },
                    ].map(f => (
                        <div key={f.id}>
                            <label htmlFor={f.id} className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">{f.label}</label>
                            <input id={f.id} type="password" ref={f.ref} value={f.val}
                                onChange={e => setData(f.key, e.target.value)}
                                autoComplete={f.key === 'current_password' ? 'current-password' : 'new-password'}
                                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                            {errors[f.key] && <p className="mt-1 text-xs text-red-500">{errors[f.key]}</p>}
                        </div>
                    ))}
                    <div className={`flex items-center gap-3 pt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="submit" disabled={processing}
                            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60">
                            {processing ? '...' : (locale === 'ar' ? 'حفظ' : 'Enregistrer')}
                        </button>
                        <button type="button" onClick={() => { setEditing(false); reset(); }}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {locale === 'ar' ? 'إلغاء' : 'Annuler'}
                        </button>
                    </div>
                </form>
            )}
        </SectionCard>
    );
}

// ─── Danger zone section ──────────────────────────────────────────────────────
function DangerSection({ isRTL, locale }) {
    const [confirming, setConfirming] = useState(false);
    const passwordRef = useRef();
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setConfirming(false),
            onError:   () => passwordRef.current?.focus(),
            onFinish:  () => reset(),
        });
    };

    const close = () => { setConfirming(false); clearErrors(); reset(); };

    return (
        <>
            <div className="rounded-2xl border border-red-100 bg-white dark:border-red-900/40 dark:bg-slate-800 overflow-hidden">
                <div className="border-b border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10 px-6 py-4">
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {locale === 'ar' ? 'منطقة الخطر' : 'Zone dangereuse'}
                    </h3>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {locale === 'ar' ? 'حذف الحساب' : 'Supprimer le compte'}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                                {locale === 'ar' ? 'ستُحذف جميع بياناتك نهائياً.' : 'Toutes vos données seront définitivement supprimées.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setConfirming(true)}
                        className="w-full rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">
                        {locale === 'ar' ? 'حذف الحساب' : 'Supprimer le compte'}
                    </button>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-800 overflow-hidden">
                        <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/40">
                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
                                    {locale === 'ar' ? 'تأكيد حذف الحساب' : 'Confirmer la suppression'}
                                </h3>
                            </div>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {locale === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه. أدخل كلمة مرورك للتأكيد.' : 'Cette action est irréversible. Entrez votre mot de passe pour confirmer.'}
                            </p>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                                </label>
                                <input type="password" ref={passwordRef} value={data.password}
                                    onChange={e => setData('password', e.target.value)} autoFocus
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>
                            <div className={`flex justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <button type="button" onClick={close}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {locale === 'ar' ? 'إلغاء' : 'Annuler'}
                                </button>
                                <button type="submit" disabled={processing}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                                    {processing ? '...' : (locale === 'ar' ? 'حذف نهائياً' : 'Supprimer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Main profile content ─────────────────────────────────────────────────────
function ProfileContent({ mustVerifyEmail, status }) {
    const { t, locale, isRTL } = useLanguage();
    const user = usePage().props.auth.user;

    const displayName = isRTL
        ? `${user.prenom_ar ?? user.prenom_fr ?? ''} ${user.nom_ar ?? user.nom_fr ?? ''}`.trim()
        : `${user.prenom_fr ?? ''} ${user.nom_fr ?? ''}`.trim();

    const initial = isRTL
        ? (user.nom_ar?.[0] ?? user.nom_fr?.[0] ?? user.email?.[0] ?? '?').toUpperCase()
        : (user.nom_fr?.[0] ?? user.email?.[0] ?? '?').toUpperCase();

    const roleLabel = user.role === 'super_admin'
        ? (locale === 'ar' ? 'مدير عام' : 'Super Administrateur')
        : user.role === 'prof'
            ? (locale === 'ar' ? 'أستاذ' : 'Professeur')
            : (locale === 'ar' ? 'مدير' : 'Administrateur');

    return (
        <>
            <Head title={t('profile')} />

            <div className="mx-auto max-w-5xl space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* ── Cover + Avatar hero ── */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                    {/* Cover */}
                    <div className="relative h-36 sm:h-44 bg-gradient-to-br from-primary via-violet-500 to-indigo-600">
                        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
                        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
                    </div>

                    {/* Avatar + name */}
                    <div className={`relative px-6 pb-6 ${isRTL ? 'text-right' : ''}`}>
                        <div
                            className="inline-flex h-24 w-24 items-center justify-center rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-xl"
                            style={{ marginTop: -48 }}
                        >
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-primary text-3xl font-bold text-white">
                                    {initial}
                                </div>
                            )}
                        </div>

                        <div className={`mt-3 flex flex-wrap items-end justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                                    {displayName || user.email}
                                </h1>
                                <div className={`mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <span className="inline-flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {user.email}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span>{locale === 'ar' ? 'المغرب' : 'Maroc'}</span>
                                </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Two-column layout ── */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                    {/* Left col — 2/3 */}
                    <div className="space-y-5 lg:col-span-2">
                        <AvatarSection user={user} locale={locale} isRTL={isRTL} />
                        <PersonalInfoSection mustVerifyEmail={mustVerifyEmail} status={status} isRTL={isRTL} locale={locale} />
                    </div>

                    {/* Right col — 1/3 */}
                    <div className="space-y-5">
                        <PasswordSection isRTL={isRTL} locale={locale} />
                        <DangerSection   isRTL={isRTL} locale={locale} />
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function Edit({ mustVerifyEmail, status }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <ProfileContent mustVerifyEmail={mustVerifyEmail} status={status} />
            </AdminLayout>
        </LanguageProvider>
    );
}
