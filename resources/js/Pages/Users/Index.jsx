import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    AcademicCapIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    CheckIcon,
    EnvelopeIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    IdentificationIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    NoSymbolIcon,
    PencilIcon,
    PlusIcon,
    ShieldCheckIcon,
    TrashIcon,
    UserGroupIcon,
    UserIcon,
    UserPlusIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROLES = ['admin', 'prof', 'super_admin'];

const roleColors = {
    super_admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    admin:       'bg-primary/10 text-primary dark:bg-primary/20',
    prof:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const Icon = ({ icon: IconComponent, className = 'w-4 h-4' }) => (
    <IconComponent className={className} aria-hidden="true" />
);

function UserAvatar({ user, size = 'md' }) {
    const sz = size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-sm';
    const initial = (user.nom_fr?.[0] ?? user.email?.[0] ?? '?').toUpperCase();
    const src = user.avatar_url
        || (user.photo_profile_url ? `/storage/${user.photo_profile_url}` : null);
    return src
        ? <img src={src} alt="avatar" className={`${sz} rounded-full object-cover flex-shrink-0`} />
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
                <ExclamationTriangleIcon className="h-3 w-3 flex-shrink-0" />
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
                        ? <EyeSlashIcon className="h-4 w-4" />
                        : <EyeIcon className="h-4 w-4" />
                    }
                </button>
            </div>
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <ExclamationTriangleIcon className="h-3 w-3 flex-shrink-0" />
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
            icon: AcademicCapIcon,
            color: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
            activeColor: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:bg-emerald-900/30',
            textColor: 'text-emerald-700 dark:text-emerald-400',
        },
        {
            key: 'admin',
            icon: UserIcon,
            color: 'border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10',
            activeColor: 'border-primary bg-primary/5 ring-2 ring-primary/20 dark:border-primary/70 dark:bg-primary/20',
            textColor: 'text-primary',
        },
        {
            key: 'super_admin',
            icon: ShieldCheckIcon,
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
                                    <CheckIcon className="h-2.5 w-2.5 text-white" />
                                </span>
                            )}
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300"><Icon icon={r.icon} className="h-4 w-4" /></span>
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
function SectionLabel({ icon: IconComponent, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                <IconComponent className="h-3.5 w-3.5" />
            </span>
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
                            <Icon icon={isEdit ? PencilIcon : UserPlusIcon} className={isEdit ? 'h-5 w-5 text-primary' : 'h-5 w-5 text-emerald-600 dark:text-emerald-400'} />
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
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                        {/* ── Identity section ── */}
                        <div className="space-y-4">
                            <SectionLabel icon={GlobeAltIcon} label={locale === 'ar' ? '?????? ?????????' : 'Identit� en fran�ais'} />
                            <div className="grid grid-cols-2 gap-4">
                                <Field id="prenom_fr" label={t('firstName')} value={data.prenom_fr}
                                    onChange={e => setData('prenom_fr', e.target.value)}
                                    placeholder={locale === 'ar' ? 'الاسم الأول' : 'Prénom'} required error={errors.prenom_fr} autoComplete="given-name" />
                                <Field id="nom_fr" label={t('lastName')} value={data.nom_fr}
                                    onChange={e => setData('nom_fr', e.target.value)}
                                    placeholder={locale === 'ar' ? 'اسم العائلة' : 'Nom de famille'} required error={errors.nom_fr} autoComplete="family-name" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SectionLabel icon={IdentificationIcon} label={locale === 'ar' ? '?????? ????????' : 'Identit� en arabe'} />
                            <div className="grid grid-cols-2 gap-4">
                                <Field id="prenom_ar" label={t('firstNameAr')} value={data.prenom_ar}
                                    onChange={e => setData('prenom_ar', e.target.value)}
                                    placeholder="الاسم الأول" error={errors.prenom_ar} />
                                <Field id="nom_ar" label={t('lastNameAr')} value={data.nom_ar}
                                    onChange={e => setData('nom_ar', e.target.value)}
                                    placeholder="اسم العائلة" error={errors.nom_ar} />
                            </div>
                        </div>

                        {/* ── Account section ── */}
                        <div className="space-y-4">
                            <SectionLabel icon={EnvelopeIcon} label={locale === 'ar' ? '?????? ??????' : 'Informations du compte'} />
                            <Field id="email" type="email" label={t('email')} value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder={locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'} required error={errors.email} autoComplete="username" />
                            <RoleCardSelect value={data.role} onChange={v => setData('role', v)} t={t} isRTL={isRTL} />
                        </div>

                        {/* ── Password section ── */}
                        <div className="space-y-4">
                            <SectionLabel icon={LockClosedIcon} label={isEdit
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
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                                <Icon icon={isEdit ? CheckIcon : PlusIcon} className="h-4 w-4" />
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
                        <TrashIcon className="h-6 w-6 text-red-600" />
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

// ─── Prof details modal ───────────────────────────────────────────────────────
function ProfDetailsModal({ user, onClose, t, isRTL, locale }) {
    const prof = user.prof;
    const name = (locale === 'ar' && (user.nom_ar || user.prenom_ar))
        ? `${user.prenom_ar ?? ''} ${user.nom_ar ?? ''}`.trim()
        : `${user.prenom_fr ?? ''} ${user.nom_fr ?? ''}`.trim();

    const Row = ({ label, value }) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{value || '—'}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-800 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                            <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </span>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{t('profDetails')}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
                {/* Body */}
                <div className="px-6 py-2">
                    {prof ? (
                        <>
                            <Row label="CIN"       value={prof.cin} />
                            <Row label={locale === 'ar' ? 'الهاتف' : 'Téléphone'} value={prof.telephone} />
                            <Row label={locale === 'ar' ? 'الرتبة' : 'Grade'}     value={prof.grade} />
                        </>
                    ) : (
                        <div className="py-8 text-center text-sm text-slate-400">
                            {t('noProfAccount')}
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button onClick={onClose}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                        {t('close')}
                    </button>
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
        user_created:         t('userCreated'),
        user_updated:         t('userUpdated'),
        user_deleted:         t('userDeleted'),
        user_activated:       t('userActivated'),
        user_deactivated:     t('userDeactivated'),
        cannot_delete_self:   t('cannotDeleteSelf'),
    };

    useEffect(() => {
        if (msg) { setVisible(true); const t = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(t); }
    }, [msg, flash]);

    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium transition
            ${isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <Icon icon={isError ? XMarkIcon : CheckIcon} className="h-4 w-4 flex-shrink-0" />
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

    // Always reload fresh data on mount — catches back/forward navigation
    // with stale Inertia cached state (e.g. after creating a prof on Professors page)
    useEffect(() => {
        router.reload({ only: ['users', 'stats'], preserveScroll: true, preserveState: true });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        { label: t('totalUsers'),  value: stats.total,      color: 'bg-primary/10 text-primary',              icon: UserGroupIcon },
        { label: t('super_admin'), value: stats.superAdmins, color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400', icon: ShieldCheckIcon },
        { label: t('admin'),       value: stats.admins,      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',         icon: UserIcon },
        { label: t('prof'),        value: stats.profs,       color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', icon: AcademicCapIcon },
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
                        <PlusIcon className="h-4 w-4" />
                        {t('addUser')}
                    </button>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {statCards.map((s, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-4 shadow-sm">
                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${s.color}`}>
                                    <Icon icon={s.icon} className="h-5 w-5" />
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
                            <MagnifyingGlassIcon className={isRTL ? 'pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 right-3' : 'pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 left-3'} />
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
                                    {[t('user'), t('role'), t('profAccount'), t('status'), t('joinedAt'), t('actions')].map((h, i) => (
                                        <th key={i} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 ${isRTL ? 'text-right' : 'text-left'} ${i === 5 ? (isRTL ? 'text-left' : 'text-right') : ''}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {(() => {
                                const grouped = ROLES
                                    .map(r => ({ role: r, users: users.data.filter(u => u.role === r) }))
                                    .filter(g => g.users.length > 0);

                                if (grouped.length === 0) {
                                    return (
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                            <tr>
                                                <td colSpan={6} className="px-5 py-16 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                            <UserGroupIcon className="h-10 w-10" />
                                                        <p className="text-sm font-medium">{t('noUsers')}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    );
                                }

                                return grouped.map(group => (
                                    <tbody key={group.role} className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {/* Section header */}
                                        <tr className="bg-slate-50/80 dark:bg-slate-700/40">
                                            <td colSpan={6} className={`px-5 py-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColors[group.role] ?? ''}`}>
                                                        {t(group.role)}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                        {group.users.length} {locale === 'ar' ? 'مستخدم' : 'utilisateur(s)'}
                                                    </span>
                                                    <div className="flex-1 border-t border-slate-200 dark:border-slate-700/60" />
                                                </div>
                                            </td>
                                        </tr>
                                        {group.users.map((u) => {
                                    const displayName = (locale === 'ar' && (u.nom_ar || u.prenom_ar))
                                        ? `${u.prenom_ar ?? ''} ${u.nom_ar ?? ''}`.trim()
                                        : `${u.prenom_fr ?? ''} ${u.nom_fr ?? ''}`.trim();
                                    const isSelf = u.id === currentUserId;

                                    return (
                                        <tr key={u.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!u.is_active ? 'opacity-60' : ''}`}>
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
                                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <EnvelopeIcon className="w-3 h-3 flex-shrink-0 text-slate-400" />
                                                            <span className="truncate max-w-[180px]">{u.email}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Role badge */}
                                            <td className={`px-5 py-3.5 ${isRTL ? 'text-right' : ''}`}>
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColors[u.role] ?? ''}`}>
                                                    {t(u.role)}
                                                </span>
                                            </td>
                                            {/* Prof account */}
                                            <td className={`px-5 py-3.5 ${isRTL ? 'text-right' : ''}`}>
                                                {u.role === 'prof' ? (
                                                    u.prof ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                            <CheckIcon className="h-3 w-3" />
                                                            {t('hasProfAccount')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                            <XMarkIcon className="h-3 w-3" />
                                                            {t('noProfAccount')}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                                                )}
                                            </td>
                                            {/* Active status */}
                                            <td className={`px-5 py-3.5 ${isRTL ? 'text-right' : ''}`}>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    u.is_active
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {u.is_active ? t('accountActive') : t('accountInactive')}
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
                                                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-end'}`}>

                                                    {/* View prof details — only for prof role */}
                                                    {u.role === 'prof' && (
                                                        u.prof?.id
                                                            ? <a
                                                                href={route('professors.show', u.prof.id)}
                                                                title={locale === 'ar' ? 'فيش الأستاذ' : 'Fiche professeur'}
                                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </a>
                                                            : <button
                                                                onClick={() => setModal({ mode: 'prof', user: u })}
                                                                title={t('profDetails')}
                                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 transition"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </button>
                                                    )}

                                                    {/* Toggle active/inactive — not for self */}
                                                    {!isSelf && (
                                                        <button
                                                            onClick={() => router.patch(route('users.toggle', u.id), {}, { preserveState: true })}
                                                            title={u.is_active ? t('accountInactive') : t('accountActive')}
                                                            className={`rounded-lg p-1.5 transition ${
                                                                u.is_active
                                                                    ? 'text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20'
                                                                    : 'text-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20'
                                                            }`}
                                                        >
                                                            {u.is_active ? (
                                                                <NoSymbolIcon className="h-4 w-4" />
                                                            ) : (
                                                                <CheckCircleIcon className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    )}

                                                    {/* Edit — redirects to profile for self, modal for others */}
                                                    {isSelf ? (
                                                        <a
                                                            href={route('profile.edit')}
                                                            title={t('edit')}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </a>
                                                    ) : (
                                                        <button
                                                            onClick={() => setModal({ mode: 'edit', user: u })}
                                                            title={t('edit')}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    {/* Delete — not for self */}
                                                    {!isSelf && (
                                                        <button
                                                            onClick={() => setModal({ mode: 'delete', user: u })}
                                                            title={t('delete')}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                    </tbody>
                                ));
                            })()}
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
            {modal?.mode === 'prof' && (
                <ProfDetailsModal user={modal.user} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
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

