import AdminLayout from '@/Layouts/AdminLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

// ─── Icon helper ──────────────────────────────────────────────────────────────
function Icon({ d, className = 'w-5 h-5', fill = 'none' }) {
    return (
        <svg className={className} fill={fill} stroke={fill === 'none' ? 'currentColor' : 'none'}
            strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const ICONS = {
    etudiant:   'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    plus:       'M12 4v16m8-8H4',
    search:     'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    edit:       'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    close:      'M6 18L18 6M6 6l12 12',
    check:      'M5 13l4 4L19 7',
    chevLeft:   'M15 19l-7-7 7-7',
    chevRight:  'M9 5l7 7-7 7',
    chevDown:   'M19 9l-7 7-7-7',
    empty:      'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    phone:      'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    mail:       'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    filter:     'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    id:         'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
    male:       'M16 3h5m0 0v5m0-5l-6 6M9 15a6 6 0 100-12 6 6 0 000 12z',
    female:     'M12 14a6 6 0 100-12 6 6 0 000 12zm0 0v8m-4-4h8',
    calendar:   'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    upload:     'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    download:   'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    excel:      'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1v5h5M8 13h3m-3 4h3m2-4h3m-3 4h3',
    info:       'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warn:       'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    form:       'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    tag:        'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    eye:        'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function EtudiantAvatar({ etudiant, size = 'md' }) {
    const sz = size === 'xl' ? 'h-20 w-20 text-2xl' : size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
    const initial = (etudiant?.prenom_fr?.[0] ?? etudiant?.nom_fr?.[0] ?? '?').toUpperCase();
    return etudiant?.photo_url
        ? <img src={etudiant.photo_url} alt="avatar" className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800`} />
        : <div className={`${sz} rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white dark:ring-slate-800`}>{initial}</div>;
}

// ─── Shared primitives ────────────────────────────────────────────────────────
function Field({ id, label, value, onChange, required, error, placeholder, hint, dir, type = 'text' }) {
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <input id={id} type={type} value={value ?? ''} onChange={onChange}
                placeholder={placeholder} dir={dir}
                className={`block w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition
                    focus:outline-none focus:ring-2 dark:text-white dark:placeholder-slate-500
                    ${error
                        ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:bg-red-900/10 dark:border-red-600'
                        : 'border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800'
                    }`}
            />
            {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
            {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                    <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

function SelectField({ id, label, value, onChange, required, error, hint, children }) {
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <div className="relative">
                <select id={id} value={value ?? ''} onChange={onChange}
                    className={`block w-full appearance-none rounded-xl border px-4 py-2.5 pe-9 text-sm shadow-sm transition
                        focus:outline-none focus:ring-2 dark:text-white
                        ${error
                            ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:bg-red-900/10 dark:border-red-600'
                            : 'border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800'
                        }`}>
                    {children}
                </select>
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-slate-400">
                    <Icon d={ICONS.chevDown} className="h-4 w-4" />
                </span>
            </div>
            {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
            {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                    <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

function SectionDivider({ emoji, label }) {
    return (
        <div className="flex items-center gap-2.5 py-1">
            <span className="text-base leading-none">{emoji}</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
            <div className="flex-1 border-t border-slate-100 dark:border-slate-700/60" />
        </div>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon, color }) {
    const colors = {
        sky:    { bg: 'bg-indigo-50 dark:bg-indigo-900/20',     icon: 'text-indigo-600 dark:text-indigo-400',     ring: 'bg-indigo-100 dark:bg-indigo-900/40'      },
        emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-900/20',icon: 'text-emerald-600 dark:text-emerald-400',ring: 'bg-emerald-100 dark:bg-emerald-900/40' },
        rose:   { bg: 'bg-rose-50 dark:bg-rose-900/20',    icon: 'text-rose-600 dark:text-rose-400',    ring: 'bg-rose-100 dark:bg-rose-900/40'      },
        violet: { bg: 'bg-violet-50 dark:bg-violet-900/20',icon: 'text-violet-600 dark:text-violet-400',ring: 'bg-violet-100 dark:bg-violet-900/40'  },
    };
    const c = colors[color] ?? colors.sky;
    return (
        <div className={`flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 ${c.bg} px-5 py-4`}>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.ring}`}>
                <Icon d={icon} className={`h-5 w-5 ${c.icon}`} />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{value ?? 0}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg   = flash?.success || flash?.error;
    const isErr = !!flash?.error;
    const map   = {
        etudiant_created: t('etudiantCreated'),
        etudiant_updated: t('etudiantUpdated'),
        etudiant_deleted: t('etudiantDeleted'),
    };
    useEffect(() => {
        if (msg) { setVisible(true); const id = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(id); }
    }, [msg, flash]);
    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium
            ${isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <Icon d={isErr ? ICONS.close : ICONS.check} className="h-4 w-4 shrink-0" />
            {map[msg] ?? msg}
        </div>
    );
}

// ─── Photo upload preview (no immediate upload) ───────────────────────────────
function PhotoUpload({ currentUrl, onFileSelect, onRemove, t, locale }) {
    const fileRef = useRef();
    const [preview, setPreview] = useState(null);

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        onFileSelect(file, url);
    };

    const src = preview || currentUrl;

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('etudiantPhoto')}</label>
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-600">
                    {src
                        ? <img src={src} alt="" className="h-full w-full object-cover" />
                        : <Icon d={ICONS.etudiant} className="h-6 w-6 text-slate-400" />
                    }
                </div>
                <div className="flex items-center gap-2">
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; handleFile(f); }} />
                    <button type="button" onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        <Icon d={ICONS.upload} className="h-3.5 w-3.5" />
                        {t('etudiantPhotoUpload')}
                    </button>
                    {currentUrl && (
                        <button type="button" onClick={onRemove}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                            <Icon d={ICONS.trash} className="h-3.5 w-3.5" />
                            {t('etudiantPhotoRemove')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Etudiant form modal ──────────────────────────────────────────────────────
function EtudiantFormModal({ mode, etudiant, onClose, t, isRTL, locale, niveaux }) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        prenom_fr:      etudiant?.prenom_fr      ?? '',
        nom_fr:         etudiant?.nom_fr         ?? '',
        prenom_ar:      etudiant?.prenom_ar      ?? '',
        nom_ar:         etudiant?.nom_ar         ?? '',
        CNE:            etudiant?.CNE            ?? '',
        CIN:            etudiant?.CIN            ?? '',
        Nins:           etudiant?.Nins           ?? '',
        date_naissance: etudiant?.date_naissance ?? '',
        lieu_naissance: etudiant?.lieu_naissance ?? '',
        sexe:           etudiant?.sexe           ?? '',
        telephone:      etudiant?.telephone      ?? '',
        email:          etudiant?.email          ?? '',
        niveau_id:      etudiant?.niveau_id      ?? '',
    });

    const [pendingPhoto, setPendingPhoto] = useState(null);
    const [pendingPhotoPreview, setPendingPhotoPreview] = useState(null);
    const [pendingRemove, setPendingRemove] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        const afterSave = () => {
            if (pendingRemove && isEdit) {
                router.delete(route('etudiants.photo.remove', etudiant.id), {
                    preserveScroll: true,
                    onFinish: () => { reset(); onClose(); },
                });
            } else if (pendingPhoto && isEdit) {
                router.post(route('etudiants.photo', etudiant.id), { photo: pendingPhoto }, {
                    forceFormData: true,
                    preserveScroll: true,
                    onFinish: () => { reset(); onClose(); },
                });
            } else {
                reset();
                onClose();
            }
        };
        const opts = { preserveScroll: true, onSuccess: afterSave };
        isEdit ? put(route('etudiants.update', etudiant.id), opts) : post(route('etudiants.store'), opts);
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isEdit ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-indigo-100 dark:bg-indigo-900/40'}`}>
                            <Icon d={isEdit ? ICONS.edit : ICONS.etudiant}
                                className={`h-5 w-5 ${isEdit ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                                {isEdit ? t('editEtudiant') : t('addEtudiant')}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isEdit
                                    ? (locale === 'ar' ? 'تعديل بيانات الطالب' : 'Modifier les informations de l\'étudiant')
                                    : (locale === 'ar' ? 'إضافة طالب جديد' : 'Ajouter un nouvel étudiant')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <Icon d={ICONS.close} className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                        {/* Identity (French) */}
                        <div className="space-y-3">
                            <SectionDivider emoji="👤" label={locale === 'ar' ? 'الهوية (بالفرنسية)' : 'Identité (français)'} />
                            <div className="grid grid-cols-2 gap-3">
                                <Field id="prenom_fr" label={t('etudiantPrenomFr')} value={data.prenom_fr}
                                    onChange={e => setData('prenom_fr', e.target.value)}
                                    placeholder={locale === 'ar' ? 'مثال: Jean' : 'Ex: Jean'}
                                    required error={errors.prenom_fr} dir="ltr" />
                                <Field id="nom_fr" label={t('etudiantNomFr')} value={data.nom_fr}
                                    onChange={e => setData('nom_fr', e.target.value)}
                                    placeholder={locale === 'ar' ? 'مثال: Dupont' : 'Ex: Dupont'}
                                    required error={errors.nom_fr} dir="ltr" />
                            </div>
                        </div>

                        {/* Identity (Arabic) */}
                        <div className="space-y-3">
                            <SectionDivider emoji="🇲🇦" label={locale === 'ar' ? 'الهوية (بالعربية)' : 'Identité (arabe)'} />
                            <div className="grid grid-cols-2 gap-3">
                                <Field id="prenom_ar" label={t('etudiantPrenomAr')} value={data.prenom_ar}
                                    onChange={e => setData('prenom_ar', e.target.value)}
                                    placeholder="مثال: جان" dir="rtl"
                                    error={errors.prenom_ar} />
                                <Field id="nom_ar" label={t('etudiantNomAr')} value={data.nom_ar}
                                    onChange={e => setData('nom_ar', e.target.value)}
                                    placeholder="مثال: دوبون" dir="rtl"
                                    error={errors.nom_ar} />
                            </div>
                        </div>

                        {/* Codes */}
                        <div className="space-y-3">
                            <SectionDivider emoji="🆔" label={locale === 'ar' ? 'المعرفات' : 'Identifiants'} />
                            <div className="grid grid-cols-3 gap-3">
                                <Field id="CNE" label={t('etudiantCNE')} value={data.CNE}
                                    onChange={e => setData('CNE', e.target.value)}
                                    placeholder="CNE123456" hint={t('etudiantCNEHint')}
                                    error={errors.CNE} dir="ltr" />
                                <Field id="CIN" label={t('etudiantCIN')} value={data.CIN}
                                    onChange={e => setData('CIN', e.target.value)}
                                    placeholder="A123456" hint={t('etudiantCINHint')}
                                    error={errors.CIN} dir="ltr" />
                                <Field id="Nins" label={t('etudiantNins')} value={data.Nins}
                                    onChange={e => setData('Nins', e.target.value)}
                                    placeholder="INS2024001" hint={t('etudiantNinsHint')}
                                    error={errors.Nins} dir="ltr" />
                            </div>
                        </div>

                        {/* Birth + Sexe */}
                        <div className="space-y-3">
                            <SectionDivider emoji="🎂" label={locale === 'ar' ? 'معلومات شخصية' : 'Informations personnelles'} />
                            <div className="grid grid-cols-2 gap-3">
                                <Field id="date_naissance" type="date" label={t('etudiantDateNaissance')} value={data.date_naissance}
                                    onChange={e => setData('date_naissance', e.target.value)}
                                    error={errors.date_naissance} />
                                <Field id="lieu_naissance" label={t('etudiantLieuNaissance')} value={data.lieu_naissance}
                                    onChange={e => setData('lieu_naissance', e.target.value)}
                                    placeholder={locale === 'ar' ? 'مثال: الدار البيضاء' : 'Ex: Casablanca'}
                                    error={errors.lieu_naissance}
                                    dir={locale === 'ar' ? 'rtl' : 'ltr'} />
                            </div>
                            {isEdit && <PhotoUpload currentUrl={etudiant.photo_url} onFileSelect={(file, url) => { setPendingPhoto(file); setPendingPhotoPreview(url); setPendingRemove(false); }} onRemove={() => { setPendingRemove(true); setPendingPhoto(null); setPendingPhotoPreview(null); }} t={t} locale={locale} />}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('etudiantSexe')}</label>
                                <div className="flex gap-2">
                                    {[{ value: 'M', label: t('etudiantSexeM'), icon: ICONS.male }, { value: 'F', label: t('etudiantSexeF'), icon: ICONS.female }].map(opt => (
                                        <button key={opt.value} type="button"
                                            onClick={() => setData('sexe', data.sexe === opt.value ? '' : opt.value)}
                                            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all
                                                ${data.sexe === opt.value
                                                    ? (opt.value === 'M'
                                                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                                                        : 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300')
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}>
                                            <Icon d={opt.icon} className="h-4 w-4" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {errors.sexe && <p className="text-xs text-red-500">{errors.sexe}</p>}
                            </div>
                        </div>

                        {/* Contact + Filière */}
                        <div className="space-y-3">
                            <SectionDivider emoji="📋" label={locale === 'ar' ? 'معلومات التواصل' : 'Coordonnées'} />
                            <div className="grid grid-cols-2 gap-3">
                                <Field id="email" type="email" label={t('etudiantEmail')} value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                    error={errors.email} dir="ltr" />
                                <Field id="telephone" type="tel" label={t('etudiantTelephone')} value={data.telephone}
                                    onChange={e => setData('telephone', e.target.value)}
                                    placeholder="+212 6XX XXXXXX"
                                    error={errors.telephone} dir="ltr" />
                            </div>
                            <SelectField id="niveau_id" label={locale === 'ar' ? 'المستوى' : 'Niveau'} value={data.niveau_id}
                                onChange={e => setData('niveau_id', e.target.value)} error={errors.niveau_id}>
                                <option value="">{locale === 'ar' ? 'اختر المستوى...' : 'Choisir un niveau...'}</option>
                                {(niveaux || []).map(n => (
                                    <option key={n.id} value={n.id}>
                                        {locale === 'ar' ? (n.nom_ar || n.nom_fr) : n.nom_fr} ({n.code}) — {n.filiere?.code || '—'}
                                    </option>
                                ))}
                            </SelectField>
                        </div>

                        {/* Live preview card */}
                        {(data.prenom_fr || data.nom_fr) && (
                            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                    {locale === 'ar' ? 'معاينة' : 'Aperçu'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <EtudiantAvatar etudiant={{ prenom_fr: data.prenom_fr, nom_fr: data.nom_fr, photo_url: pendingPhotoPreview || etudiant?.photo_url }} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                            {locale === 'ar'
                                                ? (data.prenom_ar || data.prenom_fr || '') + ' ' + (data.nom_ar || data.nom_fr || '')
                                                : (data.prenom_fr || '') + ' ' + (data.nom_fr || '')}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                            {data.CNE && (
                                                <code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                    {data.CNE}
                                                </code>
                                            )}
                                            {data.sexe && (
                                                <span className="text-[10px] text-slate-400 flex items-center"><Icon d={data.sexe === 'M' ? ICONS.male : ICONS.female} className="h-3.5 w-3.5" /></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky footer */}
                    <div className={`shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={processing}
                            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60
                                ${isEdit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {processing
                                ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                : <Icon d={isEdit ? ICONS.check : ICONS.plus} className="h-4 w-4" />
                            }
                            {processing ? '...' : (isEdit ? t('save') : t('addEtudiant'))}
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </>
    );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────
function DeleteModal({ etudiant, onClose, t, isRTL, locale }) {
    const { delete: destroy, processing } = useForm();
    const name = locale === 'ar'
        ? (etudiant.prenom_ar || etudiant.prenom_fr || '') + ' ' + (etudiant.nom_ar || etudiant.nom_fr || '')
        : (etudiant.prenom_fr || '') + ' ' + (etudiant.nom_fr || '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-800 overflow-hidden"
                dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="px-6 pt-6 pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <Icon d={ICONS.trash} className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t('confirmDeleteEtudiant')}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('confirmDeleteEtudiantMsg')}</p>
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                        <EtudiantAvatar etudiant={etudiant} size="sm" />
                        <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name}</p>
                            <p className="text-xs text-slate-400">{etudiant.CNE || etudiant.CIN || '—'}</p>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700 px-6 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button onClick={onClose}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                        {t('cancel')}
                    </button>
                    <form onSubmit={e => { e.preventDefault(); destroy(route('etudiants.destroy', etudiant.id), { onSuccess: onClose }); }}>
                        <button type="submit" disabled={processing}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition">
                            {processing ? '...' : t('delete')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ─── Excel import modal ───────────────────────────────────────────────────────
function ExcelImportModal({ onClose, onSuccess, t, isRTL, locale, niveaux }) {
    const [file, setFile]         = useState(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus]     = useState('idle');
    const [preview, setPreview]   = useState(null);
    const [report, setReport]     = useState(null);
    const [niveauId, setNiveauId] = useState('');
    const fileInput               = useRef(null);

    const COLS = [
        { name: 'prenom_fr',      req: true  },
        { name: 'nom_fr',         req: true  },
        { name: 'prenom_ar',      req: false },
        { name: 'nom_ar',         req: false },
        { name: 'CNE',            req: false },
        { name: 'CIN',            req: false },
        { name: 'Nins',           req: false },
        { name: 'date_naissance', req: false },
        { name: 'lieu_naissance', req: false },
        { name: 'sexe',           req: false },
        { name: 'telephone',      req: false },
        { name: 'email',          req: false },
    ];

    const parseFileWithSheetJS = (f) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data     = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', codepage: 1256 });
                const sheet    = workbook.Sheets[workbook.SheetNames[0]];
                const rows     = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                resolve(rows);
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(f);
    });

    const validateRows = (rows) => {
        if (rows.length < 2) return { valid: [], invalid: [] };
        const header = rows[0].map(h => String(h).toLowerCase().replace(/\s+/g, '_').trim());
        const valid = [], invalid = [];

        rows.slice(1).forEach((row, i) => {
            const lineNum = i + 2;
            const data    = {};
            header.forEach((k, j) => { data[k] = String(row[j] ?? '').trim(); });

            const allEmpty = Object.values(data).every(v => !v);
            if (allEmpty) return;

            const reasons = [];
            if (!data['prenom_fr']) reasons.push(locale === 'ar' ? 'prenom_fr مطلوب' : 'prenom_fr requis');
            if (!data['nom_fr'])    reasons.push(locale === 'ar' ? 'nom_fr مطلوب' : 'nom_fr requis');

            if (reasons.length === 0) valid.push({ lineNum, data });
            else                      invalid.push({ lineNum, data, reasons });
        });

        return { valid, invalid, header };
    };

    const handleFile = async (f) => {
        if (!f) return;
        const ok = ['csv', 'xlsx', 'xls', 'ods', 'tsv', 'txt'].some(ext =>
            f.name.toLowerCase().endsWith('.' + ext));
        if (!ok || f.size > 5 * 1024 * 1024) return;
        setFile(f); setReport(null); setPreview(null);

        try {
            const rows = await parseFileWithSheetJS(f);
            setPreview(validateRows(rows));
        } catch {
            setPreview(null);
        }
        setStatus('previewing');
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const reset = () => {
        setFile(null); setPreview(null); setReport(null); setStatus('idle');
    };

    const submit = async () => {
        if (!file) return;
        setStatus('loading');
            const fd = new FormData();
            fd.append('file', file);
            if (niveauId) fd.append('niveau_id', niveauId);
        try {
            const res = await window.axios.post(route('etudiants.import'), fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setReport(res.data);
            setStatus('done');
            const imported = res.data.imported ?? 0;
            const hasErrors = (res.data.rows ?? []).some(r => r.status === 'rejected');
            if (imported > 0 && !hasErrors) {
                router.reload({ only: ['etudiants', 'stats'] });
                setTimeout(() => {
                    onClose();
                    if (onSuccess) onSuccess(imported);
                }, 400);
            } else {
                if (imported > 0) {
                    router.reload({ only: ['etudiants', 'stats'] });
                    if (onSuccess) onSuccess(imported);
                }
            }
        } catch (err) {
            const data = err.response?.data;
            setReport({ error: data?.error ?? 'unknown', message: data?.message, rows: [] });
            setStatus('error');
        }
    };

    const downloadTemplate = () => {
        const header  = COLS.map(c => c.name).join(',');
        const example = 'Jean,Dupont,جان,دوبون,CNE123456,A123456,INS001,2000-01-15,Casablanca,test@email.com,M,+212600000000';
        const blob    = new Blob([header + '\n' + example], { type: 'text/csv;charset=utf-8;' });
        const url     = URL.createObjectURL(blob);
        const a       = document.createElement('a');
        a.href = url; a.download = 'etudiants_template.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const downloadRejectedReport = () => {
        const rejected = (report?.rows ?? []).filter(r => r.status === 'rejected');
        if (rejected.length === 0) return;
        const rows = rejected.map(r => ({ Ligne: r.line, Prenom: r.prenom_fr, Nom: r.nom_fr, Raison: r.reason }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rejets');
        const colWidths = [{ wch: 8 }, { wch: 20 }, { wch: 20 }, { wch: 40 }];
        ws['!cols'] = colWidths;
        const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'rapport_rejets.xlsx'; a.click();
        URL.revokeObjectURL(url);
    };

    const ext      = file?.name?.split('.').pop()?.toLowerCase();
    const isXlsx   = ['xlsx', 'xls', 'ods'].includes(ext);
    const fileIcon = isXlsx ? '📊' : ext === 'tsv' ? '📋' : '📄';
    const hasPreview = preview && (preview.valid.length + preview.invalid.length) > 0;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[92vh]"
                    dir={isRTL ? 'rtl' : 'ltr'}>

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-900/20 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                                <Icon d={ICONS.upload} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{t('importTitleEtudiants')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('importSubtitleEtudiants')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 transition">
                            <Icon d={ICONS.close} className="h-5 w-5" />
                        </button>
                    </div>

                    {/* ── Scrollable body ── */}
                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                        {/* Column schema */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                                <Icon d={ICONS.info} className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('importCols')}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 px-4 py-3">
                                {COLS.map(c => (
                                    <div key={c.name} className="flex items-center gap-1.5">
                                        <code className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">{c.name}</code>
                                        <span className={`text-[10px] font-medium ${c.req ? 'text-red-500' : 'text-slate-400'}`}>
                                            {c.req ? t('importRequired') : t('importOptional')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Niveau selector */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {locale === 'ar' ? 'المستوى' : 'Niveau'}
                            </label>
                            <select value={niveauId} onChange={e => setNiveauId(e.target.value)}
                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-white shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500">
                                <option value="">{locale === 'ar' ? '— اختر المستوى —' : '— Choisir un niveau —'}</option>
                                {(niveaux || []).map(n => (
                                    <option key={n.id} value={n.id}>
                                        {locale === 'ar' ? (n.nom_ar || n.nom_fr) : n.nom_fr} ({n.code}) — {n.filiere?.code || '—'}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-400">
                                {locale === 'ar' ? 'سيتم تعيين هذا المستوى لجميع الطلاب المستوردين' : 'Ce niveau sera attribué à tous les étudiants importés'}
                            </p>
                        </div>

                        {/* Drop zone */}
                        {!file && (
                            <div
                                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInput.current?.click()}
                                className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all
                                    ${dragging
                                        ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                                        : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-indigo-500'
                                    }`}
                            >
                                <input ref={fileInput} type="file" accept=".csv,.xlsx,.xls,.ods,.tsv,.txt"
                                    className="hidden" onChange={e => handleFile(e.target.files[0])} />
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition">
                                    <Icon d={ICONS.upload} className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 transition" />
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{t('importDrop')}</p>
                                <p className="text-xs text-slate-400">{t('importOr')}</p>
                                <span className="mt-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    {t('importBrowse')}
                                </span>
                                <p className="mt-2 text-[11px] text-slate-400">{t('importFormats')}</p>
                            </div>
                        )}

                        {/* File selected bar */}
                        {file && status !== 'done' && (
                            <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/10 px-4 py-3">
                                <span className="text-2xl">{fileIcon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} Ko</p>
                                </div>
                                <button onClick={reset}
                                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition">
                                    <Icon d={ICONS.close} className="h-3.5 w-3.5" />
                                    {locale === 'ar' ? 'إزالة' : 'Changer'}
                                </button>
                            </div>
                        )}

                        {/* Preview table */}
                        {hasPreview && status !== 'done' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center">
                                        <p className="text-lg font-bold text-slate-800 dark:text-white">{preview.valid.length + preview.invalid.length}</p>
                                        <p className="text-[11px] text-slate-400">{locale === 'ar' ? 'إجمالي الصفوف' : 'Total lignes'}</p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-center">
                                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{preview.valid.length}</p>
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500">{locale === 'ar' ? 'صالح' : 'Valides'}</p>
                                    </div>
                                    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-center">
                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{preview.invalid.length}</p>
                                        <p className="text-[11px] text-red-500 dark:text-red-500">{locale === 'ar' ? 'غير صالح' : 'Invalides'}</p>
                                    </div>
                                </div>

                                {preview.valid.length > 0 && (
                                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 border-b border-emerald-200 dark:border-emerald-800">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                {locale === 'ar' ? `${preview.valid.length} طالب سَيُستورد` : `${preview.valid.length} étudiant(s) à importer`}
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto max-h-48">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">#</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">prenom_fr</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">nom_fr</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">CNE</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">CIN</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preview.valid.map((row) => (
                                                        <tr key={row.lineNum} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10">
                                                            <td className="px-3 py-2 text-slate-400">{row.lineNum}</td>
                                                            <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">{row.data['prenom_fr'] || '—'}</td>
                                                            <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">{row.data['nom_fr'] || '—'}</td>
                                                            <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">{row.data['cne'] || '—'}</code></td>
                                                            <td className="px-3 py-2 text-slate-500">{row.data['cin'] || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {preview.invalid.length > 0 && (
                                    <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
                                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 border-b border-red-200 dark:border-red-800">
                                            <span className="h-2 w-2 rounded-full bg-red-500" />
                                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                                {locale === 'ar' ? `${preview.invalid.length} صف بأخطاء (لن يُستورد)` : `${preview.invalid.length} ligne(s) invalide(s) — ignorées`}
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto max-h-36">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">#</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">prenom_fr</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">nom_fr</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-red-500">{locale === 'ar' ? 'الأخطاء' : 'Erreurs'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preview.invalid.map((row) => (
                                                        <tr key={row.lineNum} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-red-50/40 dark:hover:bg-red-900/10">
                                                            <td className="px-3 py-2 text-slate-400">{row.lineNum}</td>
                                                            <td className="px-3 py-2 text-slate-500 max-w-[100px] truncate">{row.data['prenom_fr'] || '—'}</td>
                                                            <td className="px-3 py-2 text-slate-500 max-w-[100px] truncate">{row.data['nom_fr'] || '—'}</td>
                                                            <td className="px-3 py-2">
                                                                {row.reasons.map((r, i) => (
                                                                    <span key={i} className="me-1 inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">{r}</span>
                                                                ))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Post-submit report */}
                        {status === 'done' && report && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-center">
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{report.imported}</p>
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500">{locale === 'ar' ? 'تم استيرادها' : 'Importés'}</p>
                                    </div>
                                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-center">
                                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{report.skipped}</p>
                                        <p className="text-[11px] text-amber-500 dark:text-amber-500">{locale === 'ar' ? 'تم تجاهلها' : 'Ignorés'}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center">
                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{(report.imported ?? 0) + (report.skipped ?? 0)}</p>
                                        <p className="text-[11px] text-slate-400">{locale === 'ar' ? 'المجموع' : 'Total'}</p>
                                    </div>
                                </div>

                                {report.rows?.filter(r => r.status === 'rejected').length > 0 && (
                                    <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
                                        <div className="flex items-center justify-between gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 border-b border-red-200 dark:border-red-800">
                                            <div className="flex items-center gap-2">
                                                <Icon d={ICONS.warn} className="h-4 w-4 text-red-500" />
                                                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                                    {locale === 'ar' ? 'تقرير الأخطاء' : 'Rapport des rejets'}
                                                </span>
                                            </div>
                                            <button type="button" onClick={downloadRejectedReport}
                                                className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900/40 transition">
                                                <Icon d={ICONS.download} className="h-3.5 w-3.5" />
                                                {locale === 'ar' ? 'تحميل Excel' : 'Télécharger Excel'}
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto max-h-52">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">{locale === 'ar' ? 'السطر' : 'Ligne'}</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">prenom_fr</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">nom_fr</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-red-500">{locale === 'ar' ? 'السبب' : 'Raison'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.rows.filter(r => r.status === 'rejected').map((row, i) => (
                                                        <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-red-50/30 dark:hover:bg-red-900/10">
                                                            <td className="px-3 py-2 text-slate-400 font-mono">{row.line}</td>
                                                            <td className="px-3 py-2 text-slate-500 max-w-[120px] truncate">{row.prenom_fr || '—'}</td>
                                                            <td className="px-3 py-2 text-slate-500 max-w-[120px] truncate">{row.nom_fr || '—'}</td>
                                                            <td className="px-3 py-2 text-red-500 dark:text-red-400">{row.reason}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {(!report.rows || report.rows.filter(r => r.status === 'rejected').length === 0) && report.imported > 0 && (
                                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-4 py-3">
                                        <Icon d={ICONS.check} className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                            {locale === 'ar' ? 'تم استيراد جميع الطلاب بنجاح' : 'Tous les étudiants ont été importés avec succès'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fatal error */}
                        {status === 'error' && report && (
                            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
                                <Icon d={ICONS.warn} className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                        {report.error === 'parse_error' ? t('importParseError') : t('importEmpty')}
                                    </p>
                                    {report.message && <p className="text-xs text-red-500">{report.message}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className={`flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-6 py-4 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="button" onClick={downloadTemplate}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                            <Icon d={ICONS.download} className="h-4 w-4 text-indigo-500" />
                            {t('importTemplateEtudiants')}
                        </button>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {status === 'done' ? (
                                <button type="button" onClick={onClose}
                                    className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                                    {locale === 'ar' ? 'إغلاق' : 'Fermer'}
                                </button>
                            ) : (
                                <>
                                    <button type="button" onClick={onClose}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                                        {t('cancel')}
                                    </button>
                                    <button type="button" onClick={submit}
                                        disabled={!file || status === 'loading'}
                                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition">
                                        {status === 'loading' ? (
                                            <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>{t('importProcessing')}</>
                                        ) : (
                                            <><Icon d={ICONS.upload} className="h-4 w-4" />{t('importStart')}</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Export modal ─────────────────────────────────────────────────────────────
function ExportModal({ onClose, t, isRTL, locale, filieres, niveaux, filters }) {
    const EXPORT_FIELDS = [
        { key: 'prenom_fr',      label_fr: 'Prénom (fr)',          label_ar: 'الاسم الأول (فر)' },
        { key: 'nom_fr',         label_fr: 'Nom (fr)',             label_ar: 'اللقب (فر)' },
        { key: 'prenom_ar',      label_fr: 'Prénom (ar)',          label_ar: 'الاسم الأول (ع)' },
        { key: 'nom_ar',         label_fr: 'Nom (ar)',             label_ar: 'اللقب (ع)' },
        { key: 'CNE',            label_fr: 'CNE',                  label_ar: 'CNE' },
        { key: 'CIN',            label_fr: 'CIN',                  label_ar: 'رقم الهوية' },
        { key: 'Nins',           label_fr: 'N° Inscription',       label_ar: 'رقم التسجيل' },
        { key: 'date_naissance', label_fr: 'Date naissance',       label_ar: 'تاريخ الميلاد' },
        { key: 'lieu_naissance', label_fr: 'Lieu naissance',       label_ar: 'مكان الميلاد' },
        { key: 'sexe',           label_fr: 'Sexe',                 label_ar: 'الجنس' },
        { key: 'telephone',      label_fr: 'Téléphone',            label_ar: 'الهاتف' },
        { key: 'email',          label_fr: 'Email',                label_ar: 'البريد' },
        { key: 'filiere_code',   label_fr: 'Code filière',         label_ar: 'رمز الشعبة' },
        { key: 'niveau',         label_fr: 'Niveau',               label_ar: 'المستوى' },
        { key: 'filier',         label_fr: 'Filière (texte libre)',label_ar: 'الشعبة (نص حر)' },
    ];

    const [selectedFields, setSelectedFields] = useState([
        'nom_fr', 'prenom_fr', 'CNE', 'CIN', 'sexe', 'email', 'filiere_code', 'niveau',
    ]);
    const [format, setFormat] = useState('xlsx');
    const [loading, setLoading] = useState(false);

    const [fSearch, setFSearch]          = useState(filters?.search ?? '');
    const [fSexe, setFSexe]              = useState(filters?.sexe ?? '');
    const [fFiliereId, setFFiliereId]    = useState(filters?.filiere_id ?? '');
    const [fNiveauId, setFNiveauId]      = useState(filters?.niveau_id ?? '');
    const dragIdx = useRef(null);

    const filteredNiveaux = niveaux?.filter(n => !fFiliereId || n.filiere_id == fFiliereId) ?? [];

    const fieldLabel = (key) => {
        const f = EXPORT_FIELDS.find(x => x.key === key);
        return f ? (locale === 'ar' ? f.label_ar : f.label_fr) : key;
    };

    const moveUp = (idx) => {
        if (idx <= 0) return;
        setSelectedFields(prev => { const a = [...prev]; [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; return a; });
    };
    const moveDown = (idx) => {
        if (idx >= selectedFields.length - 1) return;
        setSelectedFields(prev => { const a = [...prev]; [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; return a; });
    };

    const handleDragStart = (e, idx) => { dragIdx.current = idx; e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e, idx) => {
        e.preventDefault(); if (dragIdx.current == null || dragIdx.current === idx) return;
        setSelectedFields(prev => {
            const a = [...prev]; const [r] = a.splice(dragIdx.current, 1); a.splice(idx, 0, r); return a;
        });
        dragIdx.current = idx;
    };
    const handleDragEnd = () => { dragIdx.current = null; };

    const doExport = async () => {
        if (selectedFields.length === 0) return;
        setLoading(true);
        try {
            const params = { fields: selectedFields, _locale: locale };
            if (fSearch)   params.search = fSearch;
            if (fSexe)     params.sexe = fSexe;
            if (fFiliereId) params.filiere_id = fFiliereId;
            if (fNiveauId) params.niveau_id = fNiveauId;
            const res = await window.axios.post(route('etudiants.export'), params);
            const data = res.data;

            if (format === 'xlsx') {
                const ws = XLSX.utils.json_to_sheet(data);
                const colWidths = selectedFields.map(k => ({
                    wch: Math.min(40, Math.max((fieldLabel(k) || k).length, ...data.map(r => String(r[k] || '').length)) + 3),
                }));
                ws['!cols'] = colWidths;
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Etudiants');
                XLSX.writeFile(wb, 'etudiants_export.xlsx');
            } else {
                const ws = XLSX.utils.json_to_sheet(data);
                const csv = XLSX.utils.sheet_to_csv(ws);
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'etudiants_export.csv'; a.click();
                URL.revokeObjectURL(url);
            }
            onClose();
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const unselected = EXPORT_FIELDS.filter(f => !selectedFields.includes(f.key));

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[92vh]">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-900/20 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                                <Icon d={ICONS.download} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{t('exportTitle')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('exportSubtitle')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 transition">
                            <Icon d={ICONS.close} className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                        {/* Filters */}
                        <div>
                            <SectionDivider emoji="🔍" label={locale === 'ar' ? 'تصفية الطلاب' : 'Filtrer les étudiants'} />
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="relative">
                                    <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'end-3' : 'start-3'} flex items-center text-slate-400`}>
                                        <Icon d={ICONS.search} className="h-4 w-4" />
                                    </span>
                                    <input type="text" value={fSearch} onChange={e => setFSearch(e.target.value)}
                                        placeholder={t('searchEtudiants')}
                                        className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white ${isRTL ? 'pe-10 ps-3' : 'ps-10 pe-3'}`} />
                                </div>
                                <select value={fSexe} onChange={e => setFSexe(e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    <option value="">{t('allSexes')}</option>
                                    <option value="M">{locale === 'ar' ? 'ذكر' : 'Masculin'}</option>
                                    <option value="F">{locale === 'ar' ? 'أنثى' : 'Féminin'}</option>
                                </select>
                                <select value={fFiliereId} onChange={e => { setFFiliereId(e.target.value); setFNiveauId(''); }}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    <option value="">{t('allFilieres')}</option>
                                    {(filieres || []).map(f => <option key={f.id} value={f.id}>{f.code} — {locale === 'ar' ? (f.nom_ar || f.nom_fr) : f.nom_fr}</option>)}
                                </select>
                                <select value={fNiveauId} onChange={e => setFNiveauId(e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    <option value="">{t('allNiveaux')}</option>
                                    {filteredNiveaux.map(n => <option key={n.id} value={n.id}>{locale === 'ar' ? (n.nom_ar || n.nom_fr) : n.nom_fr} ({n.code})</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Fields */}
                        <div>
                            <SectionDivider emoji="📋" label={locale === 'ar' ? 'اختيار الحقول' : 'Sélection des champs'} />
                            {selectedFields.length > 0 && (
                                <div className="mt-3 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            {locale === 'ar' ? 'الحقول المحددة' : 'Champs sélectionnés'} ({selectedFields.length})
                                        </p>
                                        <button onClick={() => setSelectedFields([])}
                                            className="text-xs text-red-400 hover:text-red-600 transition">{t('exportDeselectAll')}</button>
                                    </div>
                                    <div className="space-y-1">
                                        {selectedFields.map((key, idx) => (
                                            <div key={key} draggable
                                                onDragStart={e => handleDragStart(e, idx)} onDragOver={e => handleDragOver(e, idx)} onDragEnd={handleDragEnd}
                                                className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/10 px-3 py-2 transition hover:border-indigo-300 dark:hover:border-indigo-700 cursor-grab active:cursor-grabbing select-none">
                                                <span className="text-slate-400"><Icon d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" className="h-4 w-4" /></span>
                                                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{fieldLabel(key)}</span>
                                                <code className="text-[10px] text-slate-400 font-mono hidden sm:inline">{key}</code>
                                                <button onClick={() => moveUp(idx)} disabled={idx === 0}
                                                    className="rounded-lg p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-indigo-900/30 transition">
                                                    <Icon d={ICONS.chevLeft} className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => moveDown(idx)} disabled={idx === selectedFields.length - 1}
                                                    className="rounded-lg p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-indigo-900/30 transition">
                                                    <Icon d={ICONS.chevRight} className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => setSelectedFields(prev => prev.filter(k => k !== key))}
                                                    className="rounded-lg p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                                    <Icon d={ICONS.close} className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {unselected.length > 0 && (
                                <div className="mt-3 space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('exportAvailableFields')} ({unselected.length})</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {unselected.map(f => (
                                            <button key={f.key} onClick={() => setSelectedFields(prev => [...prev, f.key])}
                                                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:border-indigo-700 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition">
                                                <Icon d={ICONS.plus} className="h-3 w-3" />
                                                {locale === 'ar' ? f.label_ar : f.label_fr}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Format */}
                        <div>
                            <SectionDivider emoji="💾" label={t('exportFormat')} />
                            <div className="mt-3 flex gap-2">
                                {[
                                    { value: 'xlsx', label: t('exportFormatExcel'), icon: ICONS.excel },
                                    { value: 'csv', label: t('exportFormatCsv'), icon: ICONS.download },
                                ].map(opt => (
                                    <button key={opt.value} onClick={() => setFormat(opt.value)}
                                        className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${format === opt.value ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}>
                                        <Icon d={opt.icon} className="h-4 w-4" />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={`shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button onClick={onClose} className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">{t('cancel')}</button>
                        <button onClick={doExport} disabled={loading || selectedFields.length === 0}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition active:scale-95">
                            {loading ? (
                                <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>...</>
                            ) : (
                                <><Icon d={ICONS.download} className="h-4 w-4" />{t('exportDownload')}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Etudiant card (grid) ─────────────────────────────────────────────────────
function EtudiantCard({ etudiant, onEdit, onDelete, t, locale }) {
    const nameFr = (etudiant.prenom_fr || '') + ' ' + (etudiant.nom_fr || '');
    const nameAr = (etudiant.prenom_ar || '') + ' ' + (etudiant.nom_ar || '');
    const displayName = locale === 'ar' ? (nameAr || nameFr) : nameFr;

    return (
        <div className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
            {/* Colour stripe */}
            <div className={`h-1 w-full ${etudiant.sexe === 'F' ? 'bg-rose-400' : 'bg-indigo-400'}`} />

            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Top row: avatar + codes */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <EtudiantAvatar etudiant={etudiant} size="md" />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate">{displayName}</p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                                {etudiant.sexe === 'M' && <span className="flex items-center text-indigo-500"><Icon d={ICONS.male} className="h-3.5 w-3.5" /></span>}
                                {etudiant.sexe === 'F' && <span className="flex items-center text-rose-500"><Icon d={ICONS.female} className="h-3.5 w-3.5" /></span>}
                                {etudiant.CNE && (
                                    <code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                        {etudiant.CNE}
                                    </code>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Codes row */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {etudiant.CIN && (
                            <span className="flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 px-2 py-1">
                                <Icon d={ICONS.id} className="h-3.5 w-3.5" />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{etudiant.CIN}</span>
                            </span>
                        )}
                        {etudiant.niveau?.filiere && (
                            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                                {etudiant.niveau.filiere.code}
                            </span>
                        )}
                        {etudiant.niveau && (
                            <span className="rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                                {locale === 'ar' ? (etudiant.niveau.nom_ar || etudiant.niveau.nom_fr) : (etudiant.niveau.nom_fr || etudiant.niveau.nom_ar)}
                            </span>
                        )}
                    </div>

                {/* Contact */}
                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {etudiant.email && (
                        <div className="flex items-center gap-1.5 truncate">
                            <Icon d={ICONS.mail} className="h-3 w-3 shrink-0" />
                            <span className="truncate">{etudiant.email}</span>
                        </div>
                    )}
                    {etudiant.telephone && (
                        <div className="flex items-center gap-1.5">
                            <Icon d={ICONS.phone} className="h-3 w-3 shrink-0" />
                            <span>{etudiant.telephone}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex border-t border-slate-100 dark:border-slate-700/60">
                <Link href={route('etudiants.show', etudiant.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition border-e border-slate-100 dark:border-slate-700/60">
                    <Icon d={ICONS.eye} className="h-3.5 w-3.5" />{t('view')}
                </Link>
                <button onClick={() => onEdit(etudiant)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition border-e border-slate-100 dark:border-slate-700/60">
                    <Icon d={ICONS.edit} className="h-3.5 w-3.5" />{t('edit')}
                </button>
                <button onClick={() => onDelete(etudiant)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition">
                    <Icon d={ICONS.trash} className="h-3.5 w-3.5" />{t('delete')}
                </button>
            </div>
        </div>
    );
}

// ─── Table row ────────────────────────────────────────────────────────────────
function EtudiantRow({ etudiant, onEdit, onDelete, t, locale }) {
    const nameFr = (etudiant.prenom_fr || '') + ' ' + (etudiant.nom_fr || '');
    const nameAr = (etudiant.prenom_ar || '') + ' ' + (etudiant.nom_ar || '');
    const displayName = locale === 'ar' ? (nameAr || nameFr) : nameFr;
    const nameAlt = locale === 'ar' ? nameFr : nameAr;

    return (
        <tr className="group border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <EtudiantAvatar etudiant={etudiant} size="sm" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{displayName}</p>
                        {nameAlt && <p className="text-xs text-slate-400 truncate" dir={locale === 'ar' ? 'ltr' : 'rtl'}>{nameAlt}</p>}
                    </div>
                </div>
            </td>
            <td className="px-5 py-3.5">
                {etudiant.CNE
                    ? <code className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2.5 py-1 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{etudiant.CNE}</code>
                    : <span className="text-xs italic text-slate-300 dark:text-slate-600">—</span>}
            </td>
            <td className="px-5 py-3.5">
                {etudiant.CIN
                    ? <span className="text-sm font-mono text-slate-700 dark:text-slate-200">{etudiant.CIN}</span>
                    : <span className="text-xs italic text-slate-300 dark:text-slate-600">—</span>}
            </td>
            <td className="px-5 py-3.5">
                {etudiant.sexe
                    ? <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        etudiant.sexe === 'F'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    }`}>
                        <Icon d={etudiant.sexe === 'M' ? ICONS.male : ICONS.female} className="h-3.5 w-3.5 shrink-0" />
                        {etudiant.sexe === 'M' ? t('etudiantSexeM') : t('etudiantSexeF')}
                    </span>
                    : <span className="text-xs italic text-slate-300 dark:text-slate-600">—</span>}
            </td>
            <td className="px-5 py-3.5">
                <div className="flex flex-col gap-0.5">
                    {etudiant.niveau?.filiere && (
                        <span className="inline-flex rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 self-start">
                            {etudiant.niveau.filiere.code}
                        </span>
                    )}
                    {etudiant.niveau && (
                        <span className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                            {locale === 'ar' ? (etudiant.niveau.nom_ar || etudiant.niveau.nom_fr) : (etudiant.niveau.nom_fr || etudiant.niveau.nom_ar)}
                        </span>
                    )}
                    {!etudiant.niveau && (
                        <span className="text-xs italic text-slate-300 dark:text-slate-600">—</span>
                    )}
                </div>
            </td>
            <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-[160px] truncate">
                {etudiant.email || '—'}
            </td>
            <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={route('etudiants.show', etudiant.id)} title={t('view')}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition">
                        <Icon d={ICONS.eye} className="h-4 w-4" />
                    </Link>
                    <button onClick={() => onEdit(etudiant)} title={t('edit')}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition">
                        <Icon d={ICONS.edit} className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(etudiant)} title={t('delete')}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition">
                        <Icon d={ICONS.trash} className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ meta, isRTL, t }) {
    if (!meta || meta.last_page <= 1) return null;
    return (
        <div className={`flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p>
                {t('showing')} <span className="font-medium text-slate-700 dark:text-slate-200">{meta.from}–{meta.to}</span>{' '}
                {t('of')} <span className="font-medium text-slate-700 dark:text-slate-200">{meta.total}</span>{' '}
                {t('results')}
            </p>
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {meta.links?.map((link, i) => {
                    const isFirst = i === 0, isLast = i === meta.links.length - 1;
                    if (isFirst || isLast) return (
                        <button key={i} disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600">
                            <Icon d={isFirst ? ICONS.chevLeft : ICONS.chevRight} className="h-4 w-4" />
                        </button>
                    );
                    return (
                        <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-2 text-sm transition
                                ${link.active ? 'border-indigo-400 bg-indigo-600 text-white font-semibold'
                                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }} />
                    );
                })}
            </div>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ hasFilter, onAdd, t, locale }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Icon d={hasFilter ? ICONS.empty : ICONS.etudiant} className="h-9 w-9 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {hasFilter ? (locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat') : t('noEtudiants')}
            </p>
            <p className="mt-1 text-sm text-slate-400 max-w-xs">
                {hasFilter
                    ? (locale === 'ar' ? 'جرّب تعديل البحث أو الفلتر' : 'Essayez de modifier votre recherche')
                    : (locale === 'ar' ? 'ابدأ بإضافة أول طالب' : 'Commencez par ajouter votre premier étudiant')}
            </p>
            {!hasFilter && (
                <button onClick={onAdd}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm">
                    <Icon d={ICONS.plus} className="h-4 w-4" />{t('addEtudiant')}
                </button>
            )}
        </div>
    );
}

// ─── Main content ─────────────────────────────────────────────────────────────
function EtudiantsContent({ etudiants, filieres, niveaux, filters, stats }) {
    const { t, locale, isRTL } = useLanguage();
    const { flash } = usePage().props;

    const [modal, setModal]               = useState(null);
    const [search, setSearch]             = useState(filters?.search ?? '');
    const [sexeFilter, setSexeFilter]     = useState(filters?.sexe ?? '');
    const [filiereIdFilter, setFiliereIdFilter] = useState(filters?.filiere_id ?? '');
    const [niveauFilter, setNiveauFilter] = useState(filters?.niveau_id ?? '');
    const [viewMode, setViewMode]         = useViewMode('etudiants_view', 'grid');
    const [importToast, setImportToast]   = useState(null);
    const searchTimeout                   = useRef(null);

    const filteredNiveaux = niveaux?.filter(
        n => !filiereIdFilter || n.filiere_id == filiereIdFilter
    ) ?? [];

    const doSearch = (val, sf = sexeFilter, ff = filiereIdFilter, nf = niveauFilter) => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() =>
            router.get(route('etudiants.index'), { search: val, sexe: sf, filiere_id: ff || undefined, niveau_id: nf || undefined }, { preserveState: true, replace: true }), 320);
    };

    const handleSearch    = (val) => { setSearch(val); doSearch(val); };
    const handleSexe      = (val) => { setSexeFilter(val); doSearch(search, val); };
    const handleFiliereId = (val) => { setFiliereIdFilter(val); setNiveauFilter(''); doSearch(search, sexeFilter, val, ''); };
    const handleNiveau    = (val) => { setNiveauFilter(val); doSearch(search, sexeFilter, filiereIdFilter, val); };

    const items     = etudiants?.data ?? [];
    const hasFilter = !!(search || sexeFilter || filiereIdFilter || niveauFilter);

    const statCards = [
        { label: t('totalEtudiantsStat'), value: stats.total,   color: 'sky',    icon: ICONS.etudiant },
        { label: t('etudiantsHommes'),    value: stats.hommes,  color: 'violet', icon: ICONS.male     },
        { label: t('etudiantsFemmes'),    value: stats.femmes,  color: 'rose',   icon: ICONS.female   },
        { label: t('etudiantsFilieres'),  value: stats.filieres,color: 'emerald',icon: ICONS.tag      },
    ];

    return (
        <>
            <Head title={t('etudiantsManagement')} />
            <Toast flash={flash} t={t} />

            {/* Import success toast */}
            {importToast && (
                <div className="fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 shadow-xl text-sm font-medium text-white animate-fade-in">
                    <Icon d={ICONS.check} className="h-4 w-4 shrink-0" />
                    {locale === 'ar'
                        ? `تم استيراد ${importToast.count} طالب بنجاح`
                        : `${importToast.count} étudiant(s) importé(s) avec succès`}
                </div>
            )}

            {/* Modals */}
            {modal?.type === 'form' && (
                <EtudiantFormModal mode="create" onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} niveaux={niveaux} />
            )}
            {modal?.type === 'excel' && (
                <ExcelImportModal
                    onClose={() => setModal(null)}
                    onSuccess={(count) => {
                        setImportToast({ count });
                        setTimeout(() => setImportToast(null), 4000);
                    }}
                    t={t} isRTL={isRTL} locale={locale} niveaux={niveaux}
                />
            )}
            {modal?.type === 'export' && (
                <ExportModal onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale}
                    filieres={filieres} niveaux={niveaux} filters={filters} />
            )}
            {modal?.type === 'edit' && (
                <EtudiantFormModal mode="edit" etudiant={modal.etudiant} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} niveaux={niveaux} />
            )}
            {modal?.type === 'delete' && (
                <DeleteModal etudiant={modal.etudiant} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}

            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* ── Header ── */}
                <div className={`flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                        <h1 className="flex items-center gap-2.5 text-xl font-bold text-slate-800 dark:text-white">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                <Icon d={ICONS.etudiant} className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </span>
                            {t('etudiantsManagement')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {locale === 'ar' ? 'إدارة الطلاب المسجلين في المنظومة' : 'Gérez les étudiants inscrits dans le système'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setModal({ type: 'form' })}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition">
                            <Icon d={ICONS.plus} className="h-4 w-4" />
                            {t('addEtudiant')}
                        </button>
                        <button onClick={() => setModal({ type: 'export' })}
                            title={t('exportEtudiants')}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 active:scale-95 transition">
                            <Icon d={ICONS.download} className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('exportEtudiants')}</span>
                        </button>
                        <button onClick={() => setModal({ type: 'excel' })}
                            title={t('importEtudiants')}
                            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 active:scale-95 transition">
                            <Icon d={ICONS.excel} className="h-4 w-4" />
                            <span className="hidden sm:inline">{locale === 'ar' ? 'استيراد Excel' : 'Import Excel'}</span>
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {statCards.map(c => <StatCard key={c.label} {...c} />)}
                </div>

                {/* ── Filters ── */}
                <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {/* Search */}
                    <div className="relative flex-1 min-w-[220px]">
                        <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'end-3' : 'start-3'} flex items-center text-slate-400`}>
                            <Icon d={ICONS.search} className="h-4 w-4" />
                        </span>
                        <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
                            placeholder={t('searchEtudiants')}
                            className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition
                                focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500
                                ${isRTL ? 'pe-11 ps-4' : 'ps-11 pe-4'}`}
                        />
                        {search && (
                            <button onClick={() => handleSearch('')}
                                className={`absolute inset-y-0 ${isRTL ? 'start-3' : 'end-3'} flex items-center text-slate-300 hover:text-slate-500 transition`}>
                                <Icon d={ICONS.close} className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Sexe filter */}
                    <div className="relative">
                        <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'end-3' : 'start-3'} flex items-center text-slate-400`}>
                            <Icon d={ICONS.filter} className="h-4 w-4" />
                        </span>
                        <select value={sexeFilter} onChange={e => handleSexe(e.target.value)}
                            className={`appearance-none rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-700 shadow-sm transition
                                focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                                ${isRTL ? 'ps-8 pe-9' : 'ps-9 pe-8'}`}>
                            <option value="">{t('allSexes')}</option>
                            <option value="M">{locale === 'ar' ? 'ذكر' : 'Masculin'}</option>
                            <option value="F">{locale === 'ar' ? 'أنثى' : 'Féminin'}</option>
                        </select>
                        <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'start-3' : 'end-3'} flex items-center text-slate-400`}>
                            <Icon d={ICONS.chevDown} className="h-4 w-4" />
                        </span>
                    </div>

                    {/* Filière filter */}
                    {filieres?.length > 0 && (
                        <div className="relative">
                            <select value={filiereIdFilter} onChange={e => handleFiliereId(e.target.value)}
                                className={`appearance-none rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-700 shadow-sm transition pe-9
                                    focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                    dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                                    ${isRTL ? 'ps-8' : 'ps-9'}`}>
                                <option value="">{t('allFilieres')}</option>
                                {filieres.map(f => <option key={f.id} value={f.id}>{f.code} — {locale === 'ar' ? (f.nom_ar || f.nom_fr) : f.nom_fr}</option>)}
                            </select>
                            <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'start-3' : 'end-3'} flex items-center text-slate-400`}>
                                <Icon d={ICONS.chevDown} className="h-4 w-4" />
                            </span>
                        </div>
                    )}

                    {/* Niveau filter */}
                    {filteredNiveaux.length > 0 && (
                        <div className="relative">
                            <select value={niveauFilter} onChange={e => handleNiveau(e.target.value)}
                                className={`appearance-none rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-700 shadow-sm transition pe-9
                                    focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                    dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                                    ${isRTL ? 'ps-8' : 'ps-9'}`}>
                                <option value="">{t('allNiveaux')}</option>
                                {filteredNiveaux.map(n => <option key={n.id} value={n.id}>{locale === 'ar' ? (n.nom_ar || n.nom_fr) : n.nom_fr} ({n.code})</option>)}
                            </select>
                            <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'start-3' : 'end-3'} flex items-center text-slate-400`}>
                                <Icon d={ICONS.chevDown} className="h-4 w-4" />
                            </span>
                        </div>
                    )}

                    {/* View toggle */}
                    <div className="flex overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        {['grid', 'list'].map(v => (
                            <button key={v} onClick={() => setViewMode(v)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition
                                    ${v === 'list' ? 'border-s border-slate-200 dark:border-slate-700' : ''}
                                    ${viewMode === v ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
                                {v === 'grid'
                                    ? <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    : <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                }
                                <span className="hidden sm:inline">{v === 'grid' ? (locale === 'ar' ? 'شبكي' : 'Grille') : (locale === 'ar' ? 'قائمة' : 'Liste')}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active filters */}
                {hasFilter && (
                    <div className={`flex flex-wrap items-center gap-2 -mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs text-slate-400">{locale === 'ar' ? 'الفلاتر:' : 'Filtres :'}</span>
                        {search && (
                            <span className="flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                "{search}"
                                <button onClick={() => handleSearch('')} className="ms-1 hover:text-red-500"><Icon d={ICONS.close} className="h-3 w-3" /></button>
                            </span>
                        )}
                        {sexeFilter && (
                            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                sexeFilter === 'F'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            }`}>
                                <Icon d={sexeFilter === 'M' ? ICONS.male : ICONS.female} className="h-3.5 w-3.5 shrink-0" />
                                {sexeFilter === 'M' ? t('etudiantSexeM') : t('etudiantSexeF')}
                                <button onClick={() => handleSexe('')} className="ms-1 hover:text-red-500"><Icon d={ICONS.close} className="h-3 w-3" /></button>
                            </span>
                        )}
                        {filiereIdFilter && (
                            <span className="flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                {filieres?.find(f => f.id == filiereIdFilter)?.code || filiereIdFilter}
                                <button onClick={() => handleFiliereId('')} className="ms-1 hover:text-red-500"><Icon d={ICONS.close} className="h-3 w-3" /></button>
                            </span>
                        )}
                        {niveauFilter && (
                            <span className="flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                                {niveaux?.find(n => n.id == niveauFilter)
                                    ? (locale === 'ar' ? (niveaux.find(n => n.id == niveauFilter).nom_ar || niveaux.find(n => n.id == niveauFilter).nom_fr) : niveaux.find(n => n.id == niveauFilter).nom_fr)
                                    : niveauFilter}
                                <button onClick={() => handleNiveau('')} className="ms-1 hover:text-red-500"><Icon d={ICONS.close} className="h-3 w-3" /></button>
                            </span>
                        )}
                        <button onClick={() => { handleSearch(''); handleSexe(''); handleFiliereId(''); handleNiveau(''); }} className="text-xs text-slate-400 hover:text-red-400 transition">
                            {locale === 'ar' ? 'مسح الكل' : 'Tout effacer'}
                        </button>
                    </div>
                )}

                {/* ── Content ── */}
                {items.length === 0 ? (
                    <EmptyState hasFilter={hasFilter} onAdd={() => setModal({ type: 'form' })} t={t} locale={locale} />
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map(e => (
                            <EtudiantCard key={e.id} etudiant={e} locale={locale} t={t}
                                onEdit={et => setModal({ type: 'edit', etudiant: et })}
                                onDelete={et => setModal({ type: 'delete', etudiant: et })}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('etudiantNomComplet')}
                                        </th>
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('etudiantCNE')}
                                        </th>
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('etudiantCIN')}
                                        </th>
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('etudiantSexe')}
                                        </th>
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {locale === 'ar' ? 'الشعبة' : 'Filière'}
                                        </th>
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('email')}
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-end">
                                            {t('actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(e => (
                                        <EtudiantRow key={e.id} etudiant={e} locale={locale} t={t}
                                            onEdit={et => setModal({ type: 'edit', etudiant: et })}
                                            onDelete={et => setModal({ type: 'delete', etudiant: et })}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Pagination ── */}
                {items.length > 0 && <Pagination meta={etudiants?.meta ?? etudiants} isRTL={isRTL} t={t} />}
            </div>
        </>
    );
}

// ─── Page root ────────────────────────────────────────────────────────────────
export default function EtudiantsIndex({ etudiants, filieres, niveaux, filters, stats }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <EtudiantsContent etudiants={etudiants} filieres={filieres} niveaux={niveaux} filters={filters} stats={stats} />
            </AdminLayout>
        </LanguageProvider>
    );
}
