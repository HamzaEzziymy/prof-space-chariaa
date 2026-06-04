import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

// ─── Icon helper ─────────────────────────────────────────────────────────────
function Icon({ d, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const ICONS = {
    building:   'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    plus:       'M12 4v16m8-8H4',
    search:     'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    edit:       'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    close:      'M6 18L18 6M6 6l12 12',
    check:      'M5 13l4 4L19 7',
    spinner:    null,
    chevLeft:   'M15 19l-7-7 7-7',
    chevRight:  'M9 5l7 7-7 7',
    flag_fr:    null,
    flag_ar:    null,
    empty:      'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    code:       'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    exam:       'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    total:      'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
};

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ id, label, value, onChange, required, error, placeholder, hint, dir }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
                {required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <input
                id={id} type="text" value={value ?? ''} onChange={onChange}
                placeholder={placeholder} dir={dir}
                className={`block w-full rounded-lg border py-2 pe-3 ps-4 text-sm shadow-sm transition
                    focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white dark:placeholder-slate-500
                    ${error
                        ? 'border-red-400 bg-red-50 focus:border-red-400 dark:bg-red-900/10 dark:border-red-600'
                        : 'border-slate-300 bg-white focus:border-primary dark:border-slate-600 dark:bg-slate-700/60'
                    }`}
            />
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ icon, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-base leading-none">{icon}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
            <div className="flex-1 border-t border-slate-100 dark:border-slate-700" />
        </div>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, colorClass, iconPath }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                <Icon d={iconPath} className="h-5 w-5" />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            </div>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg   = flash?.success || flash?.error;
    const isErr = !!flash?.error;

    const map = {
        salle_created: t('salleCreated'),
        salle_updated: t('salleUpdated'),
        salle_deleted: t('salleDeleted'),
    };

    useEffect(() => {
        if (msg) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [msg, flash]);

    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium
            ${isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={isErr ? ICONS.close : ICONS.check} />
            </svg>
            {map[msg] ?? msg}
        </div>
    );
}

// ─── Salle slide-over (create / edit) ────────────────────────────────────────
function SalleModal({ mode, salle, onClose, t, isRTL, locale }) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nomSalle_fr: salle?.nomSalle_fr ?? '',
        nomSalle_ar: salle?.nomSalle_ar ?? '',
        code_salle:  salle?.code_salle  ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('salles.update', salle.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('salles.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Slide-over */}
            <div
                className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isEdit ? 'bg-primary/10' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                            <Icon
                                d={isEdit ? ICONS.edit : ICONS.building}
                                className={`h-5 w-5 ${isEdit ? 'text-primary' : 'text-indigo-600 dark:text-indigo-400'}`}
                            />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                {isEdit ? t('editSalle') : t('addSalle')}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isEdit
                                    ? (locale === 'ar' ? 'تعديل بيانات القاعة' : 'Modifier les informations de la salle')
                                    : (locale === 'ar' ? 'إضافة قاعة امتحان جديدة' : 'Créer une nouvelle salle d\'examen')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition">
                        <Icon d={ICONS.close} className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable body */}
                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                        {/* French name */}
                        <div className="space-y-4">
                            <SectionLabel icon="🇫🇷" label={locale === 'ar' ? 'الاسم بالفرنسية' : 'Nom en français'} />
                            <Field
                                id="nomSalle_fr"
                                label={t('salleNameFr')}
                                value={data.nomSalle_fr}
                                onChange={e => setData('nomSalle_fr', e.target.value)}
                                placeholder={locale === 'ar' ? 'مثال: Salle A101' : 'Ex: Salle A101'}
                                required
                                error={errors.nomSalle_fr}
                                dir="ltr"
                            />
                        </div>

                        {/* Arabic name */}
                        <div className="space-y-4">
                            <SectionLabel icon="🇲🇦" label={locale === 'ar' ? 'الاسم بالعربية' : 'Nom en arabe'} />
                            <Field
                                id="nomSalle_ar"
                                label={t('salleNameAr')}
                                value={data.nomSalle_ar}
                                onChange={e => setData('nomSalle_ar', e.target.value)}
                                placeholder="مثال: قاعة أ 101"
                                error={errors.nomSalle_ar}
                                dir="rtl"
                            />
                        </div>

                        {/* Code */}
                        <div className="space-y-4">
                            <SectionLabel icon="🏷️" label={locale === 'ar' ? 'الرمز التعريفي' : 'Identifiant'} />
                            <Field
                                id="code_salle"
                                label={t('salleCode')}
                                value={data.code_salle}
                                onChange={e => setData('code_salle', e.target.value)}
                                placeholder="A101"
                                required
                                hint={t('salleCodeHint')}
                                error={errors.code_salle}
                                dir="ltr"
                            />
                        </div>

                        {/* Preview card */}
                        {(data.nomSalle_fr || data.code_salle) && (
                            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
                                    {locale === 'ar' ? 'معاينة' : 'Aperçu'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                                        <Icon d={ICONS.building} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                            {locale === 'ar' ? (data.nomSalle_ar || data.nomSalle_fr || '—') : (data.nomSalle_fr || '—')}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {data.code_salle || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Sticky footer */}
                    <div className={`flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={processing}
                            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60
                                ${isEdit ? 'bg-primary hover:bg-primary/90' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {processing ? (
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <Icon d={isEdit ? ICONS.check : ICONS.plus} className="h-4 w-4" />
                            )}
                            {processing ? '...' : (isEdit ? t('save') : t('addSalle'))}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({ salle, onClose, t, isRTL, locale }) {
    const { delete: destroy, processing } = useForm();

    const submit = (e) => {
        e.preventDefault();
        destroy(route('salles.destroy', salle.id), { onSuccess: onClose });
    };

    const name = locale === 'ar'
        ? (salle.nomSalle_ar || salle.nomSalle_fr || salle.code_salle)
        : (salle.nomSalle_fr || salle.code_salle);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-800 overflow-hidden"
                dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="px-6 py-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <Icon d={ICONS.trash} className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">{t('confirmDeleteSalle')}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t('confirmDeleteSalleMsg')}</p>
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Icon d={ICONS.building} className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name}</p>
                            <p className="text-xs text-slate-400">{salle.code_salle}</p>
                        </div>
                    </div>
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

// ─── Salle card (grid view) ───────────────────────────────────────────────────
function SalleCard({ salle, onEdit, onDelete, t, locale }) {
    const name = locale === 'ar'
        ? (salle.nomSalle_ar || salle.nomSalle_fr || '—')
        : (salle.nomSalle_fr || '—');
    const nameSecondary = locale === 'ar'
        ? salle.nomSalle_fr
        : salle.nomSalle_ar;

    const hasExams = salle.note_exams_count > 0;

    return (
        <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">

            {/* Coloured top stripe */}
            <div className={`h-1.5 w-full ${hasExams ? 'bg-emerald-400' : 'bg-indigo-300 dark:bg-indigo-600'}`} />

            {/* Body */}
            <div className="flex flex-1 flex-col p-4 gap-3">

                {/* Top row: icon + code badge + status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                            <Icon d={ICONS.building} className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide">
                            {salle.code_salle || '—'}
                        </span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold
                        ${hasExams
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                        }`}>
                        {hasExams ? t('salleUsed') : t('salleAvailable')}
                    </span>
                </div>

                {/* Name */}
                <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-snug truncate">{name}</p>
                    {nameSecondary && (
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 truncate" dir={locale === 'ar' ? 'ltr' : 'rtl'}>
                            {nameSecondary}
                        </p>
                    )}
                </div>

                {/* Exam count pill */}
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5">
                    <Icon d={ICONS.exam} className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{salle.note_exams_count}</span>
                        {' '}{t('examsCount')}
                    </span>
                </div>
            </div>

            {/* Footer actions */}
            <div className="flex border-t border-slate-100 dark:border-slate-700">
                <button
                    onClick={() => onEdit(salle)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-primary/5 hover:text-primary dark:text-slate-400 dark:hover:bg-primary/10 dark:hover:text-primary border-e border-slate-100 dark:border-slate-700">
                    <Icon d={ICONS.edit} className="h-3.5 w-3.5" />
                    {t('edit')}
                </button>
                <button
                    onClick={() => onDelete(salle)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                    <Icon d={ICONS.trash} className="h-3.5 w-3.5" />
                    {t('delete')}
                </button>
            </div>
        </div>
    );
}

// ─── Table row (list view) ────────────────────────────────────────────────────
function SalleRow({ salle, onEdit, onDelete, t, locale }) {
    const name = locale === 'ar'
        ? (salle.nomSalle_ar || salle.nomSalle_fr || '—')
        : (salle.nomSalle_fr || '—');
    const nameSecondary = locale === 'ar' ? salle.nomSalle_fr : salle.nomSalle_ar;
    const hasExams = salle.note_exams_count > 0;

    return (
        <tr className="group border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            {/* Room icon + name */}
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <Icon d={ICONS.building} className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{name}</p>
                        {nameSecondary && (
                            <p className="text-xs text-slate-400" dir={locale === 'ar' ? 'ltr' : 'rtl'}>
                                {nameSecondary}
                            </p>
                        )}
                    </div>
                </div>
            </td>

            {/* Code */}
            <td className="px-5 py-3.5">
                <span className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2.5 py-1 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {salle.code_salle || '—'}
                </span>
            </td>

            {/* Exams */}
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                    <Icon d={ICONS.exam} className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{salle.note_exams_count}</span>
                </div>
            </td>

            {/* Status */}
            <td className="px-5 py-3.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
                    ${hasExams
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${hasExams ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {hasExams ? t('salleUsed') : t('salleAvailable')}
                </span>
            </td>

            {/* Actions */}
            <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(salle)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 transition"
                        title={t('edit')}>
                        <Icon d={ICONS.edit} className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(salle)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition"
                        title={t('delete')}>
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
                    const isFirst = i === 0;
                    const isLast  = i === meta.links.length - 1;
                    if (isFirst || isLast) {
                        return (
                            <button key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300">
                                <Icon d={isFirst ? ICONS.chevLeft : ICONS.chevRight} className="h-4 w-4" />
                            </button>
                        );
                    }
                    return (
                        <button key={i}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-2 text-sm transition
                                ${link.active
                                    ? 'border-primary bg-primary text-white font-semibold'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ t, hasFilter, onAdd, locale }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Icon d={hasFilter ? ICONS.empty : ICONS.building} className="h-9 w-9 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {hasFilter
                    ? (locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat')
                    : t('noSalles')}
            </h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                {hasFilter
                    ? (locale === 'ar' ? 'جرّب تعديل البحث' : 'Essayez de modifier votre recherche')
                    : (locale === 'ar' ? 'ابدأ بإضافة أول قاعة امتحان' : 'Commencez par ajouter une salle d\'examen')}
            </p>
            {!hasFilter && (
                <button onClick={onAdd}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm">
                    <Icon d={ICONS.plus} className="h-4 w-4" />
                    {t('addSalle')}
                </button>
            )}
        </div>
    );
}

// ─── Main page content ────────────────────────────────────────────────────────
function SallesContent({ salles, filters, stats }) {
    const { t, locale, isRTL } = useLanguage();
    const { flash } = usePage().props;

    const [modal, setModal]   = useState(null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const searchTimeout = useRef(null);

    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(route('salles.index'), { search: val }, { preserveState: true, replace: true });
        }, 350);
    };

    const sallePagination  = salles?.meta ?? salles;
    const salleItems       = salles?.data ?? [];

    const statCards = [
        {
            label:     t('totalSalles'),
            value:     stats.total,
            colorClass:'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
            iconPath:  ICONS.total,
        },
        {
            label:     t('sallesWithExams'),
            value:     stats.withExams,
            colorClass:'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
            iconPath:  ICONS.exam,
        },
        {
            label:     t('sallesUnused'),
            value:     stats.unused,
            colorClass:'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
            iconPath:  ICONS.building,
        },
    ];

    return (
        <>
            <Head title={t('sallesManagement')} />
            <Toast flash={flash} t={t} />

            {modal?.mode === 'create' && (
                <SalleModal mode="create" onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}
            {modal?.mode === 'edit' && (
                <SalleModal mode="edit" salle={modal.salle} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}
            {modal?.mode === 'delete' && (
                <DeleteModal salle={modal.salle} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}

            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* ── Page header ── */}
                <div className={`flex flex-wrap items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                <Icon d={ICONS.building} className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </span>
                            {t('sallesManagement')}
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            {locale === 'ar'
                                ? 'إدارة وتنظيم قاعات الامتحانات'
                                : 'Gérez et organisez les salles d\'examen'}
                        </p>
                    </div>
                    <button
                        onClick={() => setModal({ mode: 'create' })}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
                        <Icon d={ICONS.plus} className="h-4 w-4" />
                        {t('addSalle')}
                    </button>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-3 gap-4">
                    {statCards.map((c) => (
                        <StatCard key={c.label} {...c} />
                    ))}
                </div>

                {/* ── Search + view toggle ── */}
                <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {/* Search */}
                    <div className="relative flex-1 min-w-[220px]">
                        <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'end-0' : 'start-0'} flex items-center ms-3 text-slate-400`}>
                            <Icon d={ICONS.search} className="h-4 w-4" />
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder={t('searchSalles')}
                            className={`block w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition
                                focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40
                                ${isRTL ? 'pe-11 ps-4' : 'ps-11 pe-4'}`}
                        />
                        {search && (
                            <button
                                onClick={() => handleSearch('')}
                                className={`absolute inset-y-0 ${isRTL ? 'start-0 ps-3' : 'end-0 pe-3'} flex items-center text-slate-300 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300 transition`}>
                                <Icon d={ICONS.close} className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* View mode toggle */}
                    <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            title={locale === 'ar' ? 'عرض شبكي' : 'Vue grille'}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition
                                ${viewMode === 'grid'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            {locale === 'ar' ? 'شبكي' : 'Grille'}
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            title={locale === 'ar' ? 'عرض قائمة' : 'Vue liste'}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition border-s border-slate-200 dark:border-slate-700
                                ${viewMode === 'list'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            {locale === 'ar' ? 'قائمة' : 'Liste'}
                        </button>
                    </div>
                </div>

                {/* ── Content ── */}
                {salleItems.length === 0 ? (
                    <EmptyState
                        t={t}
                        locale={locale}
                        hasFilter={!!search}
                        onAdd={() => setModal({ mode: 'create' })}
                    />
                ) : viewMode === 'grid' ? (
                    // Grid view
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {salleItems.map(salle => (
                            <SalleCard
                                key={salle.id}
                                salle={salle}
                                locale={locale}
                                t={t}
                                onEdit={s => setModal({ mode: 'edit', salle: s })}
                                onDelete={s => setModal({ mode: 'delete', salle: s })}
                            />
                        ))}
                    </div>
                ) : (
                    // List view
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                    <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('name')}
                                    </th>
                                    <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('code')}
                                    </th>
                                    <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('examsCount')}
                                    </th>
                                    <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('status')}
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-end">
                                        {t('actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {salleItems.map(salle => (
                                    <SalleRow
                                        key={salle.id}
                                        salle={salle}
                                        locale={locale}
                                        t={t}
                                        onEdit={s => setModal({ mode: 'edit', salle: s })}
                                        onDelete={s => setModal({ mode: 'delete', salle: s })}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Pagination ── */}
                {salleItems.length > 0 && (
                    <Pagination meta={salles?.meta ?? salles} isRTL={isRTL} t={t} />
                )}

            </div>
        </>
    );
}

// ─── Page root ────────────────────────────────────────────────────────────────
export default function SallesIndex({ salles, filters, stats }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <SallesContent salles={salles} filters={filters} stats={stats} />
            </AdminLayout>
        </LanguageProvider>
    );
}
