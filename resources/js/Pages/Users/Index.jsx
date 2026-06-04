import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROLES = ['admin', 'prof', 'super_admin'];

const roleColors = {
    super_admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    admin:       'bg-primary/10 text-primary dark:bg-primary/20',
    prof:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

function UserAvatar({ user, size = 'md' }) {
    const sz = size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-sm';
    const initial = (user.nom_fr?.[0] ?? user.email?.[0] ?? '?').toUpperCase();
    return user.avatar_url
        ? <img src={user.avatar_url} alt="avatar" className={`${sz} rounded-full object-cover flex-shrink-0`} />
        : <div className={`${sz} rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0`}>{initial}</div>;
}

// ─── Field component ──────────────────────────────────────────────────────────
function Field({ id, label, value, onChange, type = 'text', required, error, placeholder, autoComplete, hint }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
                {required && <span className="text-red-400">*</span>}
            </label>
            <input
                id={id} type={type} value={value ?? ''} onChange={onChange}
                placeholder={placeholder} autoComplete={autoComplete} required={required}
                className={`block w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 shadow-sm transition
                    focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white dark:placeholder-slate-500
                    ${error
                        ? 'border-red-400 bg-red-50 focus:border-red-400 dark:bg-red-900/10 dark:border-red-600'
                        : 'border-slate-300 bg-white focus:border-primary dark:border-slate-600 dark:bg-slate-700/60'
                    }`}
            />
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </p>}
        </div>
    );
}

// ─── Password field with show/hide toggle ─────────────────────────────────────
function PasswordField({ id, label, value, onChange, required, error, autoComplete, hint }) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
                {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
                <input
                    id={id} type={show ? 'text' : 'password'} value={value ?? ''} onChange={onChange}
                    autoComplete={autoComplete} required={required}
                    className={`block w-full rounded-xl border py-2.5 ps-4 pe-10 text-sm text-slate-800 shadow-sm transition
                        focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white
                        ${error
                            ? 'border-red-400 bg-red-50 focus:border-red-400 dark:bg-red-900/10 dark:border-red-600'
                            : 'border-slate-300 bg-white focus:border-primary dark:border-slate-600 dark:bg-slate-700/60'
                        }`}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {show
                        ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                </button>
            </div>
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </p>}
        </div>
    );
}

// ─── Role select with visual cards ───────────────────────────────────────────
function RoleCardSelect({ value, onChange, t, isRTL }) {
    const roles = [
        {
            key: 'prof',
            icon: '👨‍🏫',
            color: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
            activeColor: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:bg-emerald-900/30',
            textColor: 'text-emerald-700 dark:text-emerald-400',
        },
        {
            key: 'admin',
            icon: '🛡️',
            color: 'border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10',
            activeColor: 'border-primary bg-primary/5 ring-2 ring-primary/20 dark:border-primary/70 dark:bg-primary/20',
            textColor: 'text-primary',
        },
        {
            key: 'super_admin',
            icon: '👑',
            color: 'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/20',
            activeColor: 'border-violet-500 bg-violet-50 ring-2 ring-violet-500/20 dark:border-violet-400 dark:bg-violet-900/30',
            textColor: 'text-violet-700 dark:text-violet-400',
        },
    ];

    return (
        <div>
            <label className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('role')} <span className="text-red-400">*</span>
            </label>
            <div className={`grid grid-cols-3 gap-2.5 ${isRTL ? 'direction-rtl' : ''}`}>
                {roles.map(r => {
                    const active = value === r.key;
                    return (
                        <button
                            key={r.key}
                            type="button"
                            onClick={() => onChange(r.key)}
                            className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center transition-all duration-150
                                ${active ? r.activeColor : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700/40 dark:hover:border-slate-500'}`}
                        >
                            {active && (
                                <span className="absolute end-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            )}
                            <span className="text-xl leading-none">{r.icon}</span>
                            <span className={`text-xs font-semibold leading-tight ${active ? r.textColor : 'text-slate-600 dark:text-slate-300'}`}>
                                {t(r.key)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Section divider label ────────────────────────────────────────────────────
function SectionLabel({ icon, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-base leading-none">{icon}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
            <div className="flex-1 border-t border-slate-100 dark:border-slate-700" />
        </div>
    );
}

// ─── User slide-over (create / edit) ─────────────────────────────────────────
function UserModal({ mode, user, onClose, t, isRTL, locale }) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nom_fr:                user?.nom_fr    ?? '',
        prenom_fr:             user?.prenom_fr ?? '',
        nom_ar:                user?.nom_ar    ?? '',
        prenom_ar:             user?.prenom_ar ?? '',
        email:                 user?.email     ?? '',
        role:                  user?.role      ?? 'prof',
        password:              '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('users.update', user.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('users.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };

    // Avatar preview initials
    const previewInitial = (data.nom_fr?.[0] ?? data.email?.[0] ?? '?').toUpperCase();
    const previewName = `${data.prenom_fr} ${data.nom_fr}`.trim() || (locale === 'ar' ? 'مستخدم جديد' : 'Nouvel utilisateur');

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Slide-over panel */}
            <div
                className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isEdit ? 'bg-primary/10' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                            <svg className={`h-5 w-5 ${isEdit ? 'text-primary' : 'text-emerald-600 dark:text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={isEdit
                                    ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                    : 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                                } />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                {isEdit ? t('editUser') : t('addUser')}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isEdit
                                    ? (locale === 'ar' ? 'تعديل بيانات المستخدم' : 'Modifier les informations')
                                    : (locale === 'ar' ? 'إضافة مستخدم جديد للنظام' : 'Créer un nouveau compte utilisateur')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                        {/* Live preview card */}
                        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/10 dark:border-primary/20 p-4">
                            <div className="h-14 w-14 flex-shrink-0 rounded-2xl bg-primary flex items-center justify-center text-xl font-bold text-white shadow-md">
                                {previewInitial}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-white text-sm">{previewName}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{data.email || (locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail')}</p>
                                <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleColors[data.role] ?? ''}`}>
                                    {t(data.role)}
                                </span>
                            </div>
                        </div>

                        {/* ── Identity section ── */}
                        <div className="space-y-4">
                            <SectionLabel icon="🇫🇷" label={locale === 'ar' ? 'الهوية بالفرنسية' : 'Identité en français'} />
                            <div className="grid grid-cols-2 gap-4">
                                <Field id="prenom_fr" label={t('firstName')} value={data.prenom_fr}
                                    onChange={e => setData('prenom_fr', e.target.value)}
                                    placeholder="Mohammed" required error={errors.prenom_fr} autoComplete="given-name" />
                                <Field id="nom_fr" label={t('lastName')} value={data.nom_fr}
                                    onChange={e => setData('nom_fr', e.target.value)}
                                    placeholder="Benali" required error={errors.nom_fr} autoComplete="family-name" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SectionLabel icon="🇲🇦" label={locale === 'ar' ? 'الهوية بالعربية' : 'Identité en arabe'} />
                            <div className="grid grid-cols-2 gap-4">
                                <Field id="prenom_ar" label={t('firstNameAr')} value={data.prenom_ar}
                                    onChange={e => setData('prenom_ar', e.target.value)}
                                    placeholder="محمد" error={errors.prenom_ar} />
                                <Field id="nom_ar" label={t('lastNameAr')} value={data.nom_ar}
                                    onChange={e => setData('nom_ar', e.target.value)}
                                    placeholder="بنعلي" error={errors.nom_ar} />
                            </div>
                        </div>

                        {/* ── Account section ── */}
                        <div className="space-y-4">
                            <SectionLabel icon="📧" label={locale === 'ar' ? 'بيانات الحساب' : 'Informations du compte'} />
                            <Field id="email" type="email" label={t('email')} value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="exemple@univ.ma" required error={errors.email} autoComplete="username" />
                            <RoleCardSelect value={data.role} onChange={v => setData('role', v)} t={t} isRTL={isRTL} />
                        </div>

                        {/* ── Password section ── */}
                        <div className="space-y-4">
                            <SectionLabel icon="🔒" label={isEdit
                                ? (locale === 'ar' ? 'كلمة المرور (اختياري)' : 'Mot de passe (optionnel)')
                                : (locale === 'ar' ? 'كلمة المرور' : 'Mot de passe')} />
                            {isEdit && (
                                <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400">
                                    {locale === 'ar'
                                        ? 'اتركهما فارغَين للإبقاء على كلمة المرور الحالية'
                                        : 'Laissez vide pour conserver le mot de passe actuel'}
                                </p>
                            )}
                            <PasswordField id="password"
                                label={isEdit ? t('passwordNew') : t('password')}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                required={!isEdit} error={errors.password} autoComplete="new-password" />
                            <PasswordField id="password_confirmation"
                                label={t('passwordConfirm')}
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                required={!isEdit} error={errors.password_confirmation} autoComplete="new-password" />
                        </div>

                    </div>

                    {/* ── Sticky footer ── */}
                    <div className={`flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={processing}
                            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60
                                ${isEdit ? 'bg-primary hover:bg-primary/90' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                            {processing ? (
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={isEdit ? 'M5 13l4 4L19 7' : 'M12 4v16m8-8H4'} />
                                </svg>
                            )}
                            {processing ? '...' : (isEdit ? t('save') : t('addUser'))}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({ user, onClose, t, isRTL }) {
    const { delete: destroy, processing } = useForm();

    const submit = (e) => {
        e.preventDefault();
        destroy(route('users.destroy', user.id), { onSuccess: onClose });
    };

    const name = `${user.prenom_fr ?? ''} ${user.nom_fr ?? ''}`.trim() || user.email;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-800 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="px-6 py-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">{t('confirmDelete')}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                        {t('confirmDeleteMsg')}
                    </p>
                    <p className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {name}
                    </p>
                </div>
                <div className={`flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button type="button" onClick={onClose}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {t('cancel')}
                    </button>
                    <form onSubmit={submit}>
                        <button type="submit" disabled={processing}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                            {processing ? '...' : t('delete')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ─── Flash toast ──────────────────────────────────────────────────────────────
function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg = flash?.success || flash?.error;
    const isError = !!flash?.error;

    const messages = {
        user_created: t('userCreated'),
        user_updated: t('userUpdated'),
        user_deleted: t('userDeleted'),
        cannot_delete_self: t('cannotDeleteSelf'),
    };

    useEffect(() => {
        if (msg) { setVisible(true); const t = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(t); }
    }, [msg, flash]);

    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium transition
            ${isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={isError ? 'M6 18L18 6M6 6l12 12' : 'M5 13l4 4L19 7'} />
            </svg>
            {messages[msg] ?? msg}
        </div>
    );
}

// ─── Main page content ────────────────────────────────────────────────────────
function UsersContent({ users, filters, stats }) {
    const { t, locale, isRTL } = useLanguage();
    const { flash, auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    const [modal, setModal]   = useState(null); // null | { mode:'create' } | { mode:'edit', user } | { mode:'delete', user }
    const [search, setSearch] = useState(filters?.search ?? '');
    const [role, setRole]     = useState(filters?.role   ?? '');
    const searchTimeout = useRef(null);

    // Debounced search
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(route('users.index'), { search: val, role }, { preserveState: true, replace: true });
        }, 350);
    };

    const handleRoleFilter = (val) => {
        setRole(val);
        router.get(route('users.index'), { search, role: val }, { preserveState: true, replace: true });
    };

    const statCards = [
        { label: t('totalUsers'),  value: stats.total,      color: 'bg-primary/10 text-primary',              icon: '👥' },
        { label: t('super_admin'), value: stats.superAdmins, color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400', icon: '🛡️' },
        { label: t('admin'),       value: stats.admins,      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',         icon: '👤' },
        { label: t('prof'),        value: stats.profs,       color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', icon: '👨‍🏫' },
    ];

    return (
        <>
            <Head title={t('usersManagement')} />
            <Toast flash={flash} t={t} />

            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* ── Page header ── */}
                <div className={`flex flex-wrap items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('usersManagement')}</h1>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            {stats.total} {t('results')}
                        </p>
                    </div>
                    <button
                        onClick={() => setModal({ mode: 'create' })}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        {t('addUser')}
                    </button>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {statCards.map((s, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-4 shadow-sm">
                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${s.color}`}>
                                    {s.icon}
                                </div>
                                <div className={isRTL ? 'text-right' : ''}>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{s.value}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Table card ── */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

                    {/* Toolbar */}
                    <div className={`flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-5 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <svg className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text" value={search}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder={t('search')}
                                className={`w-full rounded-lg border border-slate-200 bg-slate-50 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                            />
                        </div>

                        {/* Role filter */}
                        <select
                            value={role} onChange={e => handleRoleFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        >
                            <option value="">{t('allRoles')}</option>
                            {ROLES.map(r => <option key={r} value={r}>{t(r)}</option>)}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    {[t('name'), t('email'), t('role'), t('joinedAt'), t('actions')].map((h, i) => (
                                        <th key={i} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 ${isRTL ? 'text-right' : 'text-left'} ${i === 4 ? (isRTL ? 'text-left' : 'text-right') : ''}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="text-sm font-medium">{t('noUsers')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.data.map((u) => {
                                    const displayName = (locale === 'ar' && (u.nom_ar || u.prenom_ar))
                                        ? `${u.prenom_ar ?? ''} ${u.nom_ar ?? ''}`.trim()
                                        : `${u.prenom_fr ?? ''} ${u.nom_fr ?? ''}`.trim();
                                    const isSelf = u.id === currentUserId;

                                    return (
                                        <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            {/* Name + avatar */}
                                            <td className="px-5 py-3.5">
                                                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <UserAvatar user={u} />
                                                    <div className={isRTL ? 'text-right' : ''}>
                                                        <p className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                                            {displayName || '—'}
                                                            {isSelf && (
                                                                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                                                    {locale === 'ar' ? 'أنت' : 'Vous'}
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {u.email_verified_at
                                                                ? <span className="text-emerald-500">✓ {t('verified')}</span>
                                                                : <span className="text-amber-500">⚠ {t('notVerified')}</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Email */}
                                            <td className={`px-5 py-3.5 ${isRTL ? 'text-right' : ''}`}>
                                                <span className="text-slate-600 dark:text-slate-300">{u.email}</span>
                                            </td>
                                            {/* Role badge */}
                                            <td className={`px-5 py-3.5 ${isRTL ? 'text-right' : ''}`}>
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColors[u.role] ?? ''}`}>
                                                    {t(u.role)}
                                                </span>
                                            </td>
                                            {/* Date */}
                                            <td className={`px-5 py-3.5 ${isRTL ? 'text-right' : ''}`}>
                                                <span className="text-slate-500 dark:text-slate-400 text-xs">
                                                    {new Date(u.created_at).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className={`px-5 py-3.5 ${isRTL ? 'text-left' : 'text-right'}`}>
                                                <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'flex-row-reverse justify-end' : 'justify-end'}`}>
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => setModal({ mode: 'edit', user: u })}
                                                        title={t('edit')}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {/* Delete — disabled for self */}
                                                    {!isSelf && (
                                                        <button
                                                            onClick={() => setModal({ mode: 'delete', user: u })}
                                                            title={t('delete')}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className={`flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700 px-5 py-3.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {t('showing')} {users.from}–{users.to} {t('of')} {users.total} {t('results')}
                            </p>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, i) => {
                                    const label = link.label
                                        .replace('&laquo; Previous', t('prev'))
                                        .replace('Next &raquo;', t('next'));
                                    return (
                                        <button key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                            className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition
                                                ${link.active
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                }
                                                ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {modal?.mode === 'create' && (
                <UserModal mode="create" onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}
            {modal?.mode === 'edit' && (
                <UserModal mode="edit" user={modal.user} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}
            {modal?.mode === 'delete' && (
                <DeleteModal user={modal.user} onClose={() => setModal(null)} t={t} isRTL={isRTL} />
            )}
        </>
    );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function Index({ users, filters, stats }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <UsersContent users={users} filters={filters} stats={stats} />
            </AdminLayout>
        </LanguageProvider>
    );
}
