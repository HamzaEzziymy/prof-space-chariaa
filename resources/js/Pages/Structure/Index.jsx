import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────────────
   Icon helper
───────────────────────────────────────────────────────── */
function Icon({ d, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const I = {
    search:       'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    plus:         'M12 4v16m8-8H4',
    edit:         'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:        'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    close:        'M6 18L18 6M6 6l12 12',
    check:        'M5 13l4 4L19 7',
    chevronDown:  'M19 9l-7 7-7-7',
    chevronRight: 'M9 5l7 7-7 7',
    layers:       'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    school:       'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
    empty:        'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    tag:          'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    filiere:      'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    collapseAll:  'M4 6h16M4 12h16M4 18h16',
    expandAll:    'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
};

/* ─────────────────────────────────────────────────────────
   Reusable form fields
───────────────────────────────────────────────────────── */
function Field({ id, label, value, onChange, required, error, placeholder, hint, dir, type = 'text', min }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <input id={id} type={type} value={value ?? ''} onChange={onChange}
                placeholder={placeholder} dir={dir} min={min}
                className={`block w-full rounded-xl border py-2.5 pe-3 ps-4 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/25 dark:text-white dark:placeholder-slate-500
                    ${error ? 'border-red-400 bg-red-50 focus:border-red-400 dark:bg-red-900/10 dark:border-red-600'
                            : 'border-slate-200 bg-white focus:border-primary dark:border-slate-600 dark:bg-slate-800'}`} />
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function SelectField({ id, label, value, onChange, required, error, options, placeholder, disabled, formatOption }) {
    const fmt = formatOption || ((opt) => `${opt.nom_fr} (${opt.code})`);
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <select id={id} value={value ?? ''} onChange={onChange} disabled={disabled}
                className={`block w-full rounded-xl border py-2.5 pe-3 ps-4 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/25 dark:text-white
                    ${error ? 'border-red-400 bg-red-50 focus:border-red-400 dark:bg-red-900/10 dark:border-red-600'
                            : 'border-slate-200 bg-white focus:border-primary dark:border-slate-600 dark:bg-slate-800'}`}>
                <option value="">{placeholder || ''}</option>
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>{fmt(opt)}</option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Toast notification
───────────────────────────────────────────────────────── */
function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg   = flash?.success || flash?.error;
    const isErr = !!flash?.error;
    const map = {
        niveau_created:   t('niveauCreated'),
        niveau_updated:   t('niveauUpdated'),
        niveau_deleted:   t('niveauDeleted'),
        semestre_created: t('semestreCreated'),
        semestre_updated: t('semestreUpdated'),
        semestre_deleted: t('semestreDeleted'),
        filiere_created:  t('filiereCreated'),
        filiere_updated:  t('filiereUpdated'),
        filiere_deleted:  t('filiereDeleted'),
    };
    useEffect(() => {
        if (msg) { setVisible(true); const timer = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(timer); }
    }, [msg, flash]);
    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl text-sm font-medium backdrop-blur-sm
            ${isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${isErr ? 'bg-white/20' : 'bg-white/20'}`}>
                <Icon d={isErr ? I.close : I.check} className="h-3.5 w-3.5" />
            </div>
            {map[msg] ?? msg}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Spinner helper
───────────────────────────────────────────────────────── */
function Spinner() {
    return (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────
   Filière modal (slide-in panel)
───────────────────────────────────────────────────────── */
function FiliereModal({ mode, filiere, onClose, t, isRTL, locale }) {
    const isEdit = mode === 'edit';
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code:        filiere?.code        ?? '',
        nom_fr:      filiere?.nom_fr      ?? '',
        nom_ar:      filiere?.nom_ar      ?? '',
        description: filiere?.description ?? '',
    });
    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('filieres.update', filiere.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('filieres.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };
    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                            <Icon d={I.filiere} className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                {isEdit ? t('editFiliere') : t('addFiliere')}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isEdit
                                    ? (locale === 'ar' ? 'تعديل بيانات الشعبة' : 'Modifier la filière')
                                    : (locale === 'ar' ? 'إضافة شعبة جديدة' : 'Ajouter une nouvelle filière')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition">
                        <Icon d={I.close} className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                        <Field id="code" label={locale === 'ar' ? 'الرمز' : 'Code'} value={data.code}
                            onChange={e => setData('code', e.target.value)} placeholder="INFO" required
                            error={errors.code} dir="ltr" hint={locale === 'ar' ? 'مثال: INFO, MATH' : 'Ex: INFO, MATH, PHYS'} />
                        <Field id="nom_fr" label={locale === 'ar' ? 'الاسم (بالفرنسية)' : 'Nom (français)'} value={data.nom_fr}
                            onChange={e => setData('nom_fr', e.target.value)} placeholder="Informatique" required
                            error={errors.nom_fr} dir="ltr" />
                        <Field id="nom_ar" label={locale === 'ar' ? 'الاسم (بالعربية)' : 'Nom (arabe)'} value={data.nom_ar}
                            onChange={e => setData('nom_ar', e.target.value)} placeholder="المعلوماتية" required
                            error={errors.nom_ar} dir="rtl" />
                        <div>
                            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {locale === 'ar' ? 'الوصف' : 'Description'}
                            </label>
                            <textarea id="description" value={data.description ?? ''}
                                onChange={e => setData('description', e.target.value)}
                                placeholder={locale === 'ar' ? 'وصف مختصر للشعبة...' : 'Description courte de la filière...'}
                                rows={3}
                                className={`block w-full rounded-xl border py-2.5 pe-3 ps-4 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/25 dark:text-white dark:placeholder-slate-500 resize-none
                                    ${errors.description ? 'border-red-400 bg-red-50 dark:bg-red-900/10 dark:border-red-600'
                                        : 'border-slate-200 bg-white focus:border-primary dark:border-slate-600 dark:bg-slate-800'}`} />
                            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                    <div className={`shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-6 py-4 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-60 transition">
                            {processing ? <Spinner /> : <Icon d={isEdit ? I.check : I.plus} className="h-4 w-4" />}
                            {processing ? '...' : (isEdit ? t('save') : t('addFiliere'))}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────────────────
   Niveau modal
───────────────────────────────────────────────────────── */
function NiveauModal({ mode, niveau, filieres, onClose, t, isRTL, locale, selectedFiliereId }) {
    const isEdit = mode === 'edit';
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code:       niveau?.code       ?? '',
        nom_fr:     niveau?.nom_fr     ?? '',
        nom_ar:     niveau?.nom_ar     ?? '',
        ordre:      niveau?.ordre      ?? '',
        filiere_id: niveau?.filiere_id ?? selectedFiliereId ?? '',
    });
    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('niveaux.update', niveau.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('niveaux.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };
    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                            <Icon d={I.layers} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                {isEdit ? t('editNiveau') : t('addNiveau')}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isEdit
                                    ? (locale === 'ar' ? 'تعديل بيانات المستوى' : 'Modifier le niveau')
                                    : (locale === 'ar' ? 'إضافة مستوى جديد' : 'Ajouter un nouveau niveau')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition">
                        <Icon d={I.close} className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                        <Field id="code" label={locale === 'ar' ? 'الرمز' : 'Code'} value={data.code}
                            onChange={e => setData('code', e.target.value)} placeholder="L1" required
                            error={errors.code} dir="ltr" hint={locale === 'ar' ? 'مثال: L1, L2, L3' : 'Ex: L1, L2, L3'} />
                        <Field id="nom_fr" label={locale === 'ar' ? 'الاسم (بالفرنسية)' : 'Nom (français)'} value={data.nom_fr}
                            onChange={e => setData('nom_fr', e.target.value)} placeholder="1ère année Licence" required
                            error={errors.nom_fr} dir="ltr" />
                        <Field id="nom_ar" label={locale === 'ar' ? 'الاسم (بالعربية)' : 'Nom (arabe)'} value={data.nom_ar}
                            onChange={e => setData('nom_ar', e.target.value)} placeholder="السنة الأولى إجازة" required
                            error={errors.nom_ar} dir="rtl" />
                        <Field id="ordre" label={locale === 'ar' ? 'الترتيب' : 'Ordre'} value={data.ordre}
                            onChange={e => setData('ordre', e.target.value)} placeholder="1" required
                            error={errors.ordre} type="number" min="1" />
                        <SelectField id="filiere_id" label={locale === 'ar' ? 'الشعبة' : 'Filière'} value={data.filiere_id}
                            onChange={e => setData('filiere_id', e.target.value)} error={errors.filiere_id}
                            options={filieres || []} disabled={!!selectedFiliereId}
                            placeholder={locale === 'ar' ? '— اختر شعبة —' : '— Choisir une filière —'} />
                    </div>
                    <div className={`shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-6 py-4 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition">
                            {processing ? <Spinner /> : <Icon d={isEdit ? I.check : I.plus} className="h-4 w-4" />}
                            {processing ? '...' : (isEdit ? t('save') : t('addNiveau'))}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────────────────
   Semestre modal
───────────────────────────────────────────────────────── */
function SemestreModal({ mode, semestre, niveaux, selectedNiveauId, onClose, t, isRTL, locale }) {
    const isEdit = mode === 'edit';
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code:      semestre?.code      ?? '',
        nom_fr:    semestre?.nom_fr    ?? '',
        nom_ar:    semestre?.nom_ar    ?? '',
        niveau_id: semestre?.niveau_id ?? selectedNiveauId ?? '',
        numero:    semestre?.numero    ?? '',
    });
    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('semestres.update', semestre.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('semestres.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };
    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Icon d={I.school} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                {isEdit ? t('editSemestre') : t('addSemestre')}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isEdit
                                    ? (locale === 'ar' ? 'تعديل بيانات الفصل' : 'Modifier le semestre')
                                    : (locale === 'ar' ? 'إضافة فصل جديد' : 'Ajouter un nouveau semestre')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition">
                        <Icon d={I.close} className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                        <Field id="code" label={locale === 'ar' ? 'الرمز' : 'Code'} value={data.code}
                            onChange={e => setData('code', e.target.value)} placeholder="S1" required
                            error={errors.code} dir="ltr" hint={locale === 'ar' ? 'مثال: S1, S2' : 'Ex: S1, S2, S3'} />
                        <Field id="nom_fr" label={locale === 'ar' ? 'الاسم (بالفرنسية)' : 'Nom (français)'} value={data.nom_fr}
                            onChange={e => setData('nom_fr', e.target.value)} placeholder="Semestre 1" required
                            error={errors.nom_fr} dir="ltr" />
                        <Field id="nom_ar" label={locale === 'ar' ? 'الاسم (بالعربية)' : 'Nom (arabe)'} value={data.nom_ar}
                            onChange={e => setData('nom_ar', e.target.value)} placeholder="الفصل الأول" required
                            error={errors.nom_ar} dir="rtl" />
                        <Field id="ordre" label={locale === 'ar' ? 'الترتيب' : 'Ordre'} value={data.numero}
                            onChange={e => setData('numero', e.target.value)} placeholder="1" required
                            error={errors.numero} type="number" min="1"
                            hint={locale === 'ar' ? '1 أو 2 داخل كل مستوى' : '1 ou 2 dans chaque niveau'} />
                        <SelectField id="niveau_id" label={locale === 'ar' ? 'المستوى' : 'Niveau'} value={data.niveau_id}
                            onChange={e => setData('niveau_id', e.target.value)} required error={errors.niveau_id}
                            options={niveaux || []} placeholder={locale === 'ar' ? 'اختر المستوى...' : 'Choisir un niveau...'}
                            disabled={!isEdit && !!selectedNiveauId}
                            formatOption={(n) => `${n.nom_fr} (${n.filiere?.code || n.code})`} />
                    </div>
                    <div className={`shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-6 py-4 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition">
                            {processing ? <Spinner /> : <Icon d={isEdit ? I.check : I.plus} className="h-4 w-4" />}
                            {processing ? '...' : (isEdit ? t('save') : t('addSemestre'))}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────────────────
   Delete confirmation modal (centered)
───────────────────────────────────────────────────────── */
function DeleteModal({ type, item, onClose, t, isRTL, locale }) {
    const { delete: destroy, processing } = useForm();
    const isNiveau  = type === 'niveau';
    const isFiliere = type === 'filiere';
    const name = locale === 'ar' ? (item.nom_ar || item.code) : (item.nom_fr || item.code);
    const routeName = isNiveau ? 'niveaux.destroy' : isFiliere ? 'filieres.destroy' : 'semestres.destroy';
    const title  = isNiveau ? t('confirmDeleteNiveau')    : isFiliere ? t('confirmDeleteFiliere')    : t('confirmDeleteSemestre');
    const msg    = isNiveau ? t('confirmDeleteNiveauMsg') : isFiliere ? t('confirmDeleteFiliereMsg') : t('confirmDeleteSemestreMsg');
    const icon   = isNiveau ? I.layers                   : isFiliere ? I.filiere                    : I.school;
    const badge  = isNiveau ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : isFiliere ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-800" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="px-6 pt-6 pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                        <Icon d={I.trash} className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{msg}</p>
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${badge}`}>
                            <Icon d={icon} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{name}</p>
                            <p className="text-xs font-mono text-slate-400">{item.code}</p>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 px-6 py-4 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                    <button onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition">
                        {t('cancel')}
                    </button>
                    <form onSubmit={e => { e.preventDefault(); destroy(route(routeName, item.id), { onSuccess: onClose }); }}>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition">
                            {processing ? <Spinner /> : null}
                            {processing ? '...' : t('delete')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Summary stat card
───────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, color, textColor }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 px-5 py-4 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon d={icon} className={`h-5 w-5 ${textColor}`} />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{value}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   SVG tree-line gutter — RTL-aware
   LTR: vertical bar on left (x=2), elbow goes right →
   RTL: vertical bar on right (x=W-2), elbow goes left ←
───────────────────────────────────────────────────────── */
function TreeLine({ isLast, color = '#cbd5e1', isRTL = false }) {
    const W = 20, H = 36, MID = H / 2;
    // anchor x: near the inner edge (closest to content)
    const X = isRTL ? W - 2 : 2;
    // elbow end: the outer edge (away from content)
    const X2 = isRTL ? 0 : W;
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            className="shrink-0 self-stretch" style={{ minHeight: H }}>
            {/* vertical bar — full height, or top-half only when last child */}
            <line x1={X} y1={0} x2={X} y2={isLast ? MID : H}
                stroke={color} strokeWidth="1.5" strokeDasharray="4 2" />
            {/* horizontal elbow toward content */}
            <line x1={X} y1={MID} x2={X2} y2={MID}
                stroke={color} strokeWidth="1.5" strokeDasharray="4 2" />
        </svg>
    );
}

/* Continuous vertical bar — used by child rows to extend
   the parent's vertical line past them */
function TreeLinePassthrough({ color = '#cbd5e1', isRTL = false }) {
    const W = 20, X = isRTL ? W - 2 : 2;
    return (
        <svg width={W} height="100%" viewBox="0 0 20 36" preserveAspectRatio="none"
            className="shrink-0" style={{ width: W, minHeight: 36 }}>
            <line x1={X} y1={0} x2={X} y2={36}
                stroke={color} strokeWidth="1.5" strokeDasharray="4 2" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────
   Semestre row (leaf node)
   Renders:  [niveau-gutter] [sem-line] [badge] [name] [actions]
───────────────────────────────────────────────────────── */
function SemestreRow({ semestre, isLast, niveauIsLast, onEdit, onDelete, locale, isRTL, t }) {
    const name    = locale === 'ar' ? (semestre.nom_ar || semestre.nom_fr) : (semestre.nom_fr || semestre.nom_ar);
    const altName = locale === 'ar' ? semestre.nom_fr : semestre.nom_ar;

    return (
        <div className="flex items-stretch group min-h-[36px]">
            {/* Level-1 passthrough gutter (continues niveau vertical bar) */}
            <div className="shrink-0" style={{ width: 20 }}>
                {!niveauIsLast
                    ? <TreeLinePassthrough color="rgb(165 180 252 / 0.5)" isRTL={isRTL} />
                    : <div style={{ width: 20 }} />}
            </div>
            {/* 8px gap between level gutters */}
            <div className="shrink-0" style={{ width: 8 }} />
            {/* Level-2 semestre elbow */}
            <TreeLine isLast={isLast} color="rgb(110 231 183 / 0.6)" isRTL={isRTL} />

            {/* Row content */}
            <div className="flex flex-1 items-center justify-between gap-3 rounded-lg px-2 py-1.5 my-0.5 me-2
                hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition cursor-default">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                        <Icon d={I.tag} className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-px rounded
                            bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 leading-tight">
                            {semestre.code}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{name}</span>
                        {altName && altName !== name && (
                            <span className="text-xs text-slate-400 hidden sm:inline"
                                dir={locale === 'ar' ? 'ltr' : 'rtl'}>({altName})</span>
                        )}
                    </div>
                </div>
                {/* Hover actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button onClick={onEdit}
                        className="rounded-md p-1 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition"
                        title={t('edit')}>
                        <Icon d={I.edit} className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={onDelete}
                        className="rounded-md p-1 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition"
                        title={t('delete')}>
                        <Icon d={I.trash} className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Niveau row (expandable branch — depth 1)
   Renders:  [niveau-line] [chevron+icon] [name] [actions]
   When expanded → renders child semestre rows beneath
───────────────────────────────────────────────────────── */
function NiveauRow({ niveau, isLast, expanded, onToggle, onEdit, onDelete, onAddSemestre, setModal, locale, isRTL, t }) {
    const name      = locale === 'ar' ? (niveau.nom_ar || niveau.nom_fr) : (niveau.nom_fr || niveau.nom_ar);
    const altName   = locale === 'ar' ? niveau.nom_fr : niveau.nom_ar;
    const semestres  = niveau.semestres ?? [];
    const hasSem     = semestres.length > 0;

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ── Niveau header row ── */}
            <div className="flex items-stretch group min-h-[40px]">
                {/* Level-1 elbow */}
                <TreeLine isLast={isLast && !expanded} color="rgb(165 180 252 / 0.6)" isRTL={isRTL} />

                {/* Clickable content */}
                <div className="flex flex-1 items-center justify-between gap-3 rounded-lg px-2 py-2 my-0.5 me-2
                    hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition cursor-pointer"
                    onClick={onToggle}>
                    <div className="flex items-center gap-2.5 min-w-0">
                        {/* Chevron */}
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition
                            ${hasSem ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`}>
                            <Icon d={expanded ? I.chevronDown : I.chevronRight} className="h-3.5 w-3.5" />
                        </div>
                        {/* Icon */}
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Icon d={I.layers} className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        {/* Labels */}
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
                            <span className="font-mono text-xs font-bold px-1.5 py-px rounded
                                bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 leading-tight">
                                {niveau.code}
                            </span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{name}</span>
                            {altName && altName !== name && (
                                <span className="text-xs text-slate-400 hidden sm:inline"
                                    dir={locale === 'ar' ? 'ltr' : 'rtl'}>({altName})</span>
                            )}
                            <span className={`text-[11px] font-medium ${hasSem ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                {hasSem
                                    ? (locale === 'ar' ? `${semestres.length} فصل` : `${semestres.length} sem.`)
                                    : (locale === 'ar' ? 'لا فصول' : 'aucun sem.')}
                            </span>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0"
                        onClick={e => e.stopPropagation()}>
                        <button onClick={onEdit}
                            className="rounded-md p-1 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition"
                            title={t('edit')}>
                            <Icon d={I.edit} className="h-4 w-4" />
                        </button>
                        <button onClick={onDelete}
                            className="rounded-md p-1 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition"
                            title={t('delete')}>
                            <Icon d={I.trash} className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Semestre sub-rows ── */}
            {expanded && (
                <>
                    {semestres.map((sem, idx) => {
                        const semIsLast = idx === semestres.length - 1;
                        // The "add" button counts as an extra item after last semestre,
                        // so the last real semestre is never truly last in the gutter sense
                        return (
                            <SemestreRow key={sem.id}
                                semestre={sem}
                                isLast={semIsLast}
                                niveauIsLast={isLast}
                                locale={locale} isRTL={isRTL} t={t}
                                onEdit={() => setModal({ mode: 'editSemestre', item: sem })}
                                onDelete={() => setModal({ mode: 'delete', deleteType: 'semestre', item: sem })} />
                        );
                    })}

                    {/* "Add semestre" pseudo-leaf */}
                    <div className="flex items-stretch min-h-[32px]">
                        {/* niveau passthrough gutter */}
                        <div className="shrink-0" style={{ width: 20 }}>
                            {!isLast
                                ? <TreeLinePassthrough color="rgb(165 180 252 / 0.5)" isRTL={isRTL} />
                                : <div style={{ width: 20 }} />}
                        </div>
                        <div className="shrink-0" style={{ width: 8 }} />
                        {/* elbow for add row (always last) */}
                        <TreeLine isLast={true} color="rgb(110 231 183 / 0.4)" isRTL={isRTL} />
                        <div className="flex items-center my-0.5 me-2">
                            <button onClick={onAddSemestre}
                                className="flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700/60
                                    bg-white dark:bg-transparent px-2.5 py-1 text-[11px] font-medium
                                    text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                                    hover:border-emerald-400 transition">
                                <Icon d={I.plus} className="h-3 w-3" />
                                {t('addSemestre')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Filière card (top-level collapsible card)
───────────────────────────────────────────────────────── */
function FiliereCard({ filiere, niveauxList, expandedFilieres, expandedNiveaux,
    toggleFiliere, toggleNiveau, setModal, locale, isRTL, t }) {

    const expanded   = expandedFilieres[filiere.id] ?? true;
    const name       = locale === 'ar' ? (filiere.nom_ar || filiere.code) : (filiere.nom_fr || filiere.code);
    const altName    = locale === 'ar' ? filiere.nom_fr : filiere.nom_ar;
    const hasNiveaux = niveauxList.length > 0;
    const totalSem   = niveauxList.reduce((acc, n) => acc + (n.semestres?.length ?? 0), 0);

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60
            shadow-sm overflow-hidden">

            {/* ── Filière header ── */}
            <div className={`flex items-center justify-between gap-4 px-5 py-4 cursor-pointer
                select-none hover:bg-amber-50/60 dark:hover:bg-amber-900/10 transition
                ${expanded ? 'border-b border-slate-100 dark:border-slate-700/40' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                onClick={() => toggleFiliere(filiere.id)}>

                <div className="flex items-center gap-3 min-w-0">
                    {/* Chevron */}
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition
                        ${expanded
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'text-slate-400'}`}>
                        <Icon d={expanded ? I.chevronDown : I.chevronRight} className="h-4 w-4" />
                    </div>
                    {/* Gradient icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                        bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
                        <Icon d={I.filiere} className="h-5 w-5 text-white" />
                    </div>
                    {/* Title */}
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg
                                bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300
                                border border-amber-200 dark:border-amber-800/50">
                                {filiere.code}
                            </span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{name}</span>
                            {altName && altName !== name && (
                                <span className="text-xs text-slate-400 hidden sm:inline"
                                    dir={locale === 'ar' ? 'ltr' : 'rtl'}>({altName})</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {filiere.description && (
                                <span className="text-xs text-slate-400 truncate max-w-[180px]">{filiere.description}</span>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-px
                                ${hasNiveaux ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                             : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                <Icon d={I.layers} className="h-2.5 w-2.5" />
                                {niveauxList.length}&nbsp;{locale === 'ar' ? 'مستوى' : 'niv.'}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-px
                                ${totalSem > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                <Icon d={I.tag} className="h-2.5 w-2.5" />
                                {totalSem}&nbsp;{locale === 'ar' ? 'فصل' : 'sem.'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setModal({ mode: 'editFiliere', item: filiere })}
                        className="rounded-lg p-2 text-slate-400 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 transition"
                        title={t('edit')}>
                        <Icon d={I.edit} className="h-4 w-4" />
                    </button>
                    <button onClick={() => setModal({ mode: 'delete', deleteType: 'filiere', item: filiere })}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition"
                        title={t('delete')}>
                        <Icon d={I.trash} className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ── Expanded tree body ── */}
            {expanded && (
                <div className="px-4 pt-2 pb-3" dir={isRTL ? 'rtl' : 'ltr'}>
                    {hasNiveaux ? (
                        <>
                            {niveauxList.map((niveau, idx) => (
                                <NiveauRow key={niveau.id}
                                    niveau={niveau}
                                    isLast={idx === niveauxList.length - 1}
                                    expanded={expandedNiveaux[niveau.id] ?? true}
                                    onToggle={() => toggleNiveau(niveau.id)}
                                    locale={locale} isRTL={isRTL} t={t}
                                    setModal={setModal}
                                    onEdit={e => { e?.stopPropagation?.(); setModal({ mode: 'editNiveau', item: niveau }); }}
                                    onDelete={e => { e?.stopPropagation?.(); setModal({ mode: 'delete', deleteType: 'niveau', item: niveau }); }}
                                    onAddSemestre={() => setModal({ mode: 'createSemestre', niveauId: niveau.id })} />
                            ))}
                        </>
                    ) : (
                        <div className="py-6 text-center">
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
                                <Icon d={I.layers} className="h-5 w-5 text-slate-300 dark:text-slate-500" />
                            </div>
                            <p className="text-xs text-slate-400">
                                {locale === 'ar' ? 'لا توجد مستويات في هذه الشعبة بعد.' : 'Aucun niveau dans cette filière.'}
                            </p>
                        </div>
                    )}

                    {/* Add niveau */}
                    <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/30 flex justify-start ps-1">
                        <button onClick={() => setModal({ mode: 'createNiveau', filiereId: filiere.id })}
                            className="flex items-center gap-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700/60
                                bg-white dark:bg-transparent px-3.5 py-1.5 text-xs font-medium
                                text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                                hover:border-indigo-400 transition">
                            <Icon d={I.plus} className="h-3.5 w-3.5" />
                            {t('addNiveau')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Main page content
───────────────────────────────────────────────────────── */
function PageContent({ niveaux, filieres, filters }) {
    const { t, locale, isRTL } = useLanguage();
    const { flash } = usePage().props;
    const [modal, setModal]   = useState(null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [expandedFilieres, setExpandedFilieres] = useState(
        Object.fromEntries((filieres ?? []).map(f => [f.id, true]))
    );
    const [expandedNiveaux, setExpandedNiveaux] = useState(
        Object.fromEntries((niveaux ?? []).map(n => [n.id, true]))
    );
    const searchTimeout = useRef(null);

    /* Debounced search */
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(route('structure.index'), { search: val || undefined }, { preserveState: true, replace: true });
        }, 350);
    };

    const toggleFiliere = (id) => setExpandedFilieres(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleNiveau  = (id) => setExpandedNiveaux(prev => ({ ...prev, [id]: !prev[id] }));

    const collapseAll = () => {
        setExpandedFilieres(Object.fromEntries((filieres ?? []).map(f => [f.id, false])));
        setExpandedNiveaux(Object.fromEntries((niveaux ?? []).map(n => [n.id, false])));
    };
    const expandAll = () => {
        setExpandedFilieres(Object.fromEntries((filieres ?? []).map(f => [f.id, true])));
        setExpandedNiveaux(Object.fromEntries((niveaux ?? []).map(n => [n.id, true])));
    };

    /* Group niveaux under their filiere */
    const niveauxByFiliere = {};
    filieres.forEach(f => { niveauxByFiliere[f.id] = []; });
    (niveaux ?? []).forEach(n => {
        if (niveauxByFiliere[n.filiere_id]) niveauxByFiliere[n.filiere_id].push(n);
    });

    const totalFilieres  = filieres?.length ?? 0;
    const totalNiveaux   = niveaux?.length ?? 0;
    const totalSemestres = niveaux?.reduce((acc, n) => acc + (n.semestres?.length ?? 0), 0) ?? 0;

    return (
        <>
            <Head title={t('structure')} />
            <Toast flash={flash} t={t} />

            {/* ── Modals ── */}
            {modal?.mode === 'createFiliere'  && <FiliereModal  mode="create" onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}
            {modal?.mode === 'editFiliere'    && <FiliereModal  mode="edit"   filiere={modal.item} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}
            {modal?.mode === 'createNiveau'   && <NiveauModal   mode="create" filieres={filieres} selectedFiliereId={modal.filiereId} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}
            {modal?.mode === 'editNiveau'     && <NiveauModal   mode="edit"   niveau={modal.item} filieres={filieres} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}
            {modal?.mode === 'createSemestre' && <SemestreModal mode="create" niveaux={niveaux} selectedNiveauId={modal.niveauId} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}
            {modal?.mode === 'editSemestre'   && <SemestreModal mode="edit"   semestre={modal.item} niveaux={niveaux} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}
            {modal?.mode === 'delete'         && <DeleteModal   type={modal.deleteType} item={modal.item} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}

            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* ── Page header ── */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                            {t('structure')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {locale === 'ar'
                                ? 'الهيكل الهرمي للشعب، المستويات والفصول الدراسية'
                                : 'Hiérarchie pédagogique : filières, niveaux et semestres'}
                        </p>
                    </div>
                    <button onClick={() => setModal({ mode: 'createFiliere' })}
                        className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white
                            shadow-sm shadow-amber-200 dark:shadow-amber-900/30 hover:bg-amber-700 active:scale-95 transition">
                        <Icon d={I.plus} className="h-4 w-4" />
                        {t('addFiliere')}
                    </button>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={I.filiere} label={t('filieres')} value={totalFilieres}
                        color="bg-gradient-to-br from-amber-400 to-amber-600" textColor="text-white" />
                    <StatCard icon={I.layers}
                        label={locale === 'ar' ? 'المستويات' : 'Niveaux'} value={totalNiveaux}
                        color="bg-gradient-to-br from-indigo-400 to-indigo-600" textColor="text-white" />
                    <StatCard icon={I.school}
                        label={locale === 'ar' ? 'الفصول' : 'Semestres'} value={totalSemestres}
                        color="bg-gradient-to-br from-emerald-400 to-emerald-600" textColor="text-white" />
                </div>

                {/* ── Toolbar: search + collapse/expand ── */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Icon d={I.search} className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
                            placeholder={locale === 'ar'
                                ? 'بحث في الشعب، المستويات والفصول...'
                                : 'Rechercher filières, niveaux, semestres...'}
                            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700
                                bg-white dark:bg-slate-800 ps-9 pe-4 py-2.5 text-sm text-slate-800 dark:text-white
                                placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-700
                                transition shadow-sm" />
                    </div>

                    {totalFilieres > 0 && (
                        <div className="flex items-center gap-2">
                            <button onClick={expandAll}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700
                                    bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400
                                    hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
                                <Icon d={I.expandAll} className="h-3.5 w-3.5" />
                                {locale === 'ar' ? 'توسيع الكل' : 'Tout ouvrir'}
                            </button>
                            <button onClick={collapseAll}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700
                                    bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400
                                    hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
                                <Icon d={I.collapseAll} className="h-3.5 w-3.5" />
                                {locale === 'ar' ? 'طي الكل' : 'Tout fermer'}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Tree / empty state ── */}
                {totalFilieres === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl
                            bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20">
                            <Icon d={I.filiere} className="h-10 w-10 text-amber-500 dark:text-amber-400" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                            {locale === 'ar' ? 'لا توجد شعب بعد' : 'Aucune filière pour le moment'}
                        </h3>
                        <p className="mt-1.5 text-sm text-slate-400 max-w-xs">
                            {locale === 'ar'
                                ? 'أضف شعبة لبناء الهيكل البيداغوجي الخاص بك.'
                                : 'Ajoutez une filière pour commencer à construire la structure pédagogique.'}
                        </p>
                        <button onClick={() => setModal({ mode: 'createFiliere' })}
                            className="mt-5 flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold
                                text-white shadow-sm hover:bg-amber-700 active:scale-95 transition">
                            <Icon d={I.plus} className="h-4 w-4" />
                            {t('addFiliere')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filieres.map(filiere => (
                            <FiliereCard key={filiere.id}
                                filiere={filiere}
                                niveauxList={niveauxByFiliere[filiere.id] ?? []}
                                expandedFilieres={expandedFilieres}
                                expandedNiveaux={expandedNiveaux}
                                toggleFiliere={toggleFiliere}
                                toggleNiveau={toggleNiveau}
                                setModal={setModal}
                                locale={locale} isRTL={isRTL} t={t} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────────────────
   Root export
───────────────────────────────────────────────────────── */
export default function StructureIndex({ niveaux, filieres, filters }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <PageContent niveaux={niveaux} filieres={filieres} filters={filters} />
            </AdminLayout>
        </LanguageProvider>
    );
}
