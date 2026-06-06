import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

function Icon({ d, className = 'w-5 h-5', fill = 'none' }) {
    return (
        <svg className={className} fill={fill} stroke={fill === 'none' ? 'currentColor' : 'none'}
            strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const ICONS = {
    back:       'M10 19l-7-7m0 0l7-7m-7 7h18',
    mail:       'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    phone:      'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    id:         'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
    etudiant:   'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    calendar:   'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    pin:        'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    tag:        'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    edit:       'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    plus:       'M12 4v16m8-8H4',
    close:      'M6 18L18 6M6 6l12 12',
    check:      'M5 13l4 4L19 7',
    chevDown:   'M19 9l-7 7-7-7',
    book:       'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    upload:     'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
function EtudiantAvatar({ etudiant, size = 'md' }) {
    const sz = size === 'xl' ? 'h-20 w-20 text-2xl' : size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
    const initial = (etudiant?.prenom_fr?.[0] ?? etudiant?.nom_fr?.[0] ?? '?').toUpperCase();
    return etudiant?.photo_url
        ? <img src={etudiant.photo_url} alt="avatar" className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800`} />
        : <div className={`${sz} rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white dark:ring-slate-800`}>{initial}</div>;
}

// ─── Shared primitives ──────────────────────────────────────────────────────────
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

function SectionDivider({ emoji, label }) {
    return (
        <div className="flex items-center gap-2.5 py-1">
            <span className="text-base leading-none">{emoji}</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
            <div className="flex-1 border-t border-slate-100 dark:border-slate-700/60" />
        </div>
    );
}

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

function SelectField({ id, label, value, onChange, required, error, children }) {
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <select id={id} value={value ?? ''} onChange={onChange}
                className={`block w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 dark:text-white
                    ${error
                        ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:bg-red-900/10 dark:border-red-600'
                        : 'border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800'
                    }`}>
                {children}
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

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
        filier:         etudiant?.filier         ?? '',
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
                            <PhotoUpload currentUrl={etudiant.photo_url} onFileSelect={(file, url) => { setPendingPhoto(file); setPendingPhotoPreview(url); setPendingRemove(false); }} onRemove={() => { setPendingRemove(true); setPendingPhoto(null); setPendingPhotoPreview(null); }} t={t} locale={locale} />
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('etudiantSexe')}</label>
                                <div className="flex gap-2">
                                    {[{ value: 'M', label: t('etudiantSexeM'), icon: '♂' }, { value: 'F', label: t('etudiantSexeF'), icon: '♀' }].map(opt => (
                                        <button key={opt.value} type="button"
                                            onClick={() => setData('sexe', data.sexe === opt.value ? '' : opt.value)}
                                            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all
                                                ${data.sexe === opt.value
                                                    ? (opt.value === 'M'
                                                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                                                        : 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300')
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}>
                                            <span className="text-lg leading-none">{opt.icon}</span>
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
                            <Field id="filier" label={t('etudiantFilier')} value={data.filier}
                                onChange={e => setData('filier', e.target.value)}
                                placeholder={locale === 'ar' ? 'مثال: SMI، S6' : 'Ex: SMI, S6'}
                                hint={t('etudiantFilierHint')} error={errors.filier} />
                            <SelectField id="niveau_id" label={locale === 'ar' ? 'المستوى' : 'Niveau'} value={data.niveau_id}
                                onChange={e => setData('niveau_id', e.target.value)} error={errors.niveau_id}>
                                <option value="">{locale === 'ar' ? 'اختر المستوى...' : 'Choisir un niveau...'}</option>
                                {(niveaux || []).map(n => (
                                    <option key={n.id} value={n.id}>{n.nom_fr} ({n.code})</option>
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
                                                <span className="text-[10px] text-slate-400">{data.sexe === 'M' ? '♂' : '♀'}</span>
                                            )}
                                            {data.filier && (
                                                <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                                                    {data.filier}
                                                </span>
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

function InfoRow({ icon, label, value, mono = false }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 mt-0.5">
                <Icon d={icon} className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-none mb-1">{label}</p>
                <p className={`text-sm font-medium text-slate-800 dark:text-white break-all ${mono ? 'font-mono tracking-wider' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function SectionCard({ title, icon, children }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/60 px-5 py-4 bg-slate-50/70 dark:bg-slate-700/30">
                <Icon d={icon} className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
            </div>
            <div className="px-5 py-1">{children}</div>
        </div>
    );
}

function ShowPage() {
    const { t, locale, isRTL } = useLanguage();
    const props = usePage().props;
    const { etudiant, niveaux } = props;
    const { auth } = usePage().props;
    const user = auth?.user;
    const [showEditModal, setShowEditModal] = useState(false);

    const displayName = isRTL
        ? `${etudiant.prenom_ar || etudiant.prenom_fr || ''} ${etudiant.nom_ar || etudiant.nom_fr || ''}`.trim()
        : `${etudiant.prenom_fr || ''} ${etudiant.nom_fr || ''}`.trim();

    const displayNameAlt = isRTL
        ? `${etudiant.prenom_fr || ''} ${etudiant.nom_fr || ''}`.trim()
        : `${etudiant.prenom_ar || ''} ${etudiant.nom_ar || ''}`.trim();

    const dateNaissance = etudiant.date_naissance
        ? new Date(etudiant.date_naissance).toLocaleDateString(
            locale === 'ar' ? 'ar-MA' : 'fr-FR',
            { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    const initial = (etudiant.prenom_fr?.[0] ?? etudiant.nom_fr?.[0] ?? '?').toUpperCase();

    const avatar = etudiant.photo_url
        ? <img src={etudiant.photo_url} alt="" className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl" />
        : <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl text-white font-bold ring-4 ring-white dark:ring-slate-800 shadow-xl">{initial}</div>;

    const canManage = user && (user.role === 'admin' || user.role === 'super_admin');
    const flash = usePage().props.flash || {};
    const [toast, setToast] = useState(null);
    useEffect(() => {
        if (flash.success || flash.error) {
            const msg = flash.success || flash.error;
            const map = {
                etudiant_photo_updated: t('etudiantPhotoUpdated'),
                etudiant_photo_removed: t('etudiantPhotoRemoved'),
            };
            setToast({ text: map[msg] ?? msg, isErr: !!flash.error });
            const id = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(id);
        }
    }, [flash]);

    return (
        <>
            <Head title={`${displayName} — ${t('viewEtudiant')}`} />

            {toast && (
                <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium
                    ${toast.isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    <Icon d={toast.isErr ? ICONS.close : ICONS.check} className="h-4 w-4 shrink-0" />
                    {toast.text}
                </div>
            )}

            <div className="mb-6">
                <Link
                    href={route('etudiants.index')}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                    <Icon d={isRTL ? 'M14 5l7 7m0 0l-7 7m7-7H3' : ICONS.back} className="h-4 w-4" />
                    {t('backToEtudiants')}
                </Link>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                <div className="relative h-36 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 15% 60%, white 1.5px, transparent 1.5px), radial-gradient(circle at 85% 25%, white 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }} />
                </div>

                <div className="relative px-6 pb-6">
                    <div className="-mt-12 mb-4">
                        {avatar}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{displayName}</h1>
                            {displayNameAlt && (
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5" dir={isRTL ? 'ltr' : 'rtl'}>{displayNameAlt}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {etudiant.sexe && (
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                        etudiant.sexe === 'F'
                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                    }`}>
                                        {etudiant.sexe === 'M' ? '♂' : '♀'} {etudiant.sexe === 'M' ? t('etudiantSexeM') : t('etudiantSexeF')}
                                    </span>
                                )}
                                {etudiant.filier && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                        <Icon d={ICONS.tag} className="h-3 w-3" />
                                        {etudiant.filier}
                                    </span>
                                )}
                            </div>
                        </div>
                        {canManage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowEditModal(true)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition">
                                    <Icon d={ICONS.edit} className="h-3.5 w-3.5" />
                                    {t('edit')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="lg:col-span-1 flex flex-col gap-5">
                    <SectionCard title={t('etudiantIdentity')} icon={ICONS.etudiant}>
                        <InfoRow icon={ICONS.id} label={t('etudiantNomFr')} value={etudiant.nom_fr || '—'} />
                        <InfoRow icon={ICONS.id} label={t('etudiantPrenomFr')} value={etudiant.prenom_fr || '—'} />
                        {etudiant.nom_ar && <InfoRow icon={ICONS.id} label={t('etudiantNomAr')} value={etudiant.nom_ar} dir={isRTL ? 'rtl' : 'rtl'} />}
                        {etudiant.prenom_ar && <InfoRow icon={ICONS.id} label={t('etudiantPrenomAr')} value={etudiant.prenom_ar} />}
                    </SectionCard>

                    <SectionCard title={t('etudiantCodes')} icon={ICONS.pin}>
                        <InfoRow icon={ICONS.pin} label={t('etudiantCNE')} value={etudiant.CNE || <span className="italic text-slate-400">—</span>} mono />
                        <InfoRow icon={ICONS.id} label={t('etudiantCIN')} value={etudiant.CIN || <span className="italic text-slate-400">—</span>} mono />
                        <InfoRow icon={ICONS.tag} label={t('etudiantNins')} value={etudiant.Nins || <span className="italic text-slate-400">—</span>} mono />
                    </SectionCard>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-5">
                    <SectionCard title={t('etudiantPersonalInfo')} icon={ICONS.calendar}>
                        <InfoRow
                            icon={ICONS.calendar}
                            label={t('etudiantDateNaissance')}
                            value={dateNaissance || <span className="italic text-slate-400">—</span>}
                        />
                        <InfoRow
                            icon={ICONS.pin}
                            label={t('etudiantLieuNaissance')}
                            value={etudiant.lieu_naissance || <span className="italic text-slate-400">—</span>}
                        />
                    </SectionCard>

                    <SectionCard title={t('etudiantContact')} icon={ICONS.mail}>
                        <InfoRow icon={ICONS.mail}  label={t('etudiantEmail')} value={etudiant.email || <span className="italic text-slate-400">—</span>} />
                        <InfoRow icon={ICONS.phone} label={t('etudiantTelephone')} value={etudiant.telephone || <span className="italic text-slate-400">—</span>} />
                    </SectionCard>

                    <SectionCard title={t('etudiantAcademique')} icon={ICONS.book}>
                        {etudiant.niveau && (
                            <InfoRow icon={ICONS.tag} label={locale === 'ar' ? 'المستوى' : 'Niveau'}
                                value={locale === 'ar' ? (etudiant.niveau.nom_ar || etudiant.niveau.nom_fr) : (etudiant.niveau.nom_fr || etudiant.niveau.nom_ar)} />
                        )}
                        {etudiant.modules?.length > 0 ? etudiant.modules.map(mod => (
                            <InfoRow key={mod.id} icon={ICONS.book} label={mod.code || ''} value={mod.intitule_fr || mod.intitule_ar || mod.nom || '—'} />
                        )) : (
                            <InfoRow icon={ICONS.book} label="" value={<span className="italic text-slate-400">{t('aucunModule')}</span>} />
                        )}
                    </SectionCard>
                </div>
            </div>

            {showEditModal && (
                <EtudiantFormModal mode="edit" etudiant={etudiant} onClose={() => setShowEditModal(false)} t={t} isRTL={isRTL} locale={locale} niveaux={niveaux} />
            )}
        </>
    );
}

export default function EtudiantShow(props) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <ShowPage {...props} />
            </AdminLayout>
        </LanguageProvider>
    );
}
