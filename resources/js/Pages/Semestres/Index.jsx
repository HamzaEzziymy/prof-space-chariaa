import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function Icon({ d, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const I = {
    search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    plus:    'M12 4v16m8-8H4',
    edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    close:   'M6 18L18 6M6 6l12 12',
    check:   'M5 13l4 4L19 7',
    layers:  'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    code:    'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    filter:  'M4 6h16M4 12h16M4 18h16',
    empty:   'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    school:  'M3 21h18M3 10h18M3 7l9-4 9 4M3 14h18v7H3z',
};

function Field({ id, label, value, onChange, required, error, placeholder, hint, dir, type = 'text', min }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <input id={id} type={type} value={value ?? ''} onChange={onChange}
                placeholder={placeholder} dir={dir} min={min}
                className={`block w-full rounded-lg border py-2 pe-3 ps-4 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white dark:placeholder-slate-500
                    ${error ? 'border-red-400 bg-red-50 focus:border-red-400 dark:bg-red-900/10 dark:border-red-600'
                            : 'border-slate-300 bg-white focus:border-primary dark:border-slate-600 dark:bg-slate-700/60'}`} />
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function SelectField({ id, label, value, onChange, required, error, options, placeholder }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <select id={id} value={value ?? ''} onChange={onChange}
                className={`block w-full rounded-lg border py-2 pe-3 ps-4 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white
                    ${error ? 'border-red-400 bg-red-50 focus:border-red-400 dark:bg-red-900/10 dark:border-red-600'
                            : 'border-slate-300 bg-white focus:border-primary dark:border-slate-600 dark:bg-slate-700/60'}`}>
                <option value="">{placeholder || ''}</option>
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.nom_fr} ({opt.code})</option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg   = flash?.success || flash?.error;
    const isErr = !!flash?.error;
    const map = {
        semestre_created: t('semestreCreated'),
        semestre_updated: t('semestreUpdated'),
        semestre_deleted: t('semestreDeleted'),
    };
    useEffect(() => {
        if (msg) { setVisible(true); const timer = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(timer); }
    }, [msg, flash]);
    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium ${isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <Icon d={isErr ? I.close : I.check} className="h-4 w-4" />
            {map[msg] ?? msg}
        </div>
    );
}

function SemestreModal({ mode, semestre, niveaux, onClose, t, isRTL, locale }) {
    const isEdit = mode === 'edit';
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code:      semestre?.code      ?? '',
        nom_fr:    semestre?.nom_fr    ?? '',
        nom_ar:    semestre?.nom_ar    ?? '',
        niveau_id: semestre?.niveau_id ?? '',
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
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isEdit ? 'bg-primary/10' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                            <Icon d={isEdit ? I.edit : I.school} className={`h-5 w-5 ${isEdit ? 'text-primary' : 'text-indigo-600 dark:text-indigo-400'}`} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">{isEdit ? t('editSemestre') : t('addSemestre')}</h2>
                            <p className="text-xs text-slate-400">{isEdit ? (locale === 'ar' ? 'تعديل بيانات الفصل' : 'Modifier le semestre') : (locale === 'ar' ? 'إضافة فصل جديد' : 'Ajouter un nouveau semestre')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition"><Icon d={I.close} className="h-5 w-5" /></button>
                </div>
                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                        <Field id="code" label={locale === 'ar' ? 'الرمز' : 'Code'} value={data.code}
                            onChange={e => setData('code', e.target.value)} placeholder="S1" required
                            error={errors.code} dir="ltr" hint={locale === 'ar' ? 'مثال: S1, S2, S3' : 'Ex: S1, S2, S3'} />
                        <Field id="nom_fr" label={locale === 'ar' ? 'الاسم (بالفرنسية)' : 'Nom (français)'} value={data.nom_fr}
                            onChange={e => setData('nom_fr', e.target.value)} placeholder="Semestre 1" required
                            error={errors.nom_fr} dir="ltr" />
                        <Field id="nom_ar" label={locale === 'ar' ? 'الاسم (بالعربية)' : 'Nom (arabe)'} value={data.nom_ar}
                            onChange={e => setData('nom_ar', e.target.value)} placeholder="الفصل الأول" required
                            error={errors.nom_ar} dir="rtl" />
                        <SelectField id="niveau_id" label={locale === 'ar' ? 'المستوى' : 'Niveau'} value={data.niveau_id}
                            onChange={e => setData('niveau_id', e.target.value)} required error={errors.niveau_id}
                            options={niveaux || []} placeholder={locale === 'ar' ? 'اختر المستوى...' : 'Choisir un niveau...'} />
                        <Field id="numero" label={locale === 'ar' ? 'الرقم' : 'Numéro'} value={data.numero}
                            onChange={e => setData('numero', e.target.value)} placeholder="1" required
                            error={errors.numero} type="number" min="1"
                            hint={locale === 'ar' ? '1 أو 2 داخل كل مستوى' : '1 or 2 inside each niveau'} />
                    </div>
                    <div className={`shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={processing}
                            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 ${isEdit ? 'bg-primary hover:bg-primary/90' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {processing ? (
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : <Icon d={isEdit ? I.check : I.plus} className="h-4 w-4" />}
                            {processing ? '...' : (isEdit ? t('save') : t('addSemestre'))}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

function DeleteModal({ semestre, onClose, t, isRTL, locale }) {
    const { delete: destroy, processing } = useForm();
    const name = locale === 'ar' ? (semestre.nom_ar || semestre.code) : (semestre.nom_fr || semestre.code);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-800 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="px-6 py-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <Icon d={I.trash} className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">{t('confirmDeleteSemestre')}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t('confirmDeleteSemestreMsg')}</p>
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Icon d={I.school} className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name}</p>
                            <p className="text-xs text-slate-400">{semestre.code}</p>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">{t('cancel')}</button>
                    <form onSubmit={e => { e.preventDefault(); destroy(route('semestres.destroy', semestre.id), { onSuccess: onClose }); }}>
                        <button type="submit" disabled={processing} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{processing ? '...' : t('delete')}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function Pagination({ meta, isRTL }) {
    if (!meta || meta.last_page <= 1) return null;
    return (
        <div className={`flex items-center justify-between gap-3 pt-4 text-sm text-slate-500 dark:text-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p>{meta.from}–{meta.to} / {meta.total}</p>
            <div className="flex gap-1">
                {meta.links?.filter(l => !['...'].includes(l.label)).map((link, i) => (
                    <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                        disabled={!link.url}
                        className={`h-8 min-w-8 rounded-lg text-xs font-medium transition ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>
        </div>
    );
}

function PageContent({ semestres, niveaux, filters }) {
    const { t, locale, isRTL } = useLanguage();
    const { flash } = usePage().props;
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [niveauFilter, setNiveauFilter] = useState(filters?.niveau_id ?? '');
    const searchTimeout = useRef(null);

    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(route('semestres.index'), { search: val, niveau_id: niveauFilter || undefined }, { preserveState: true, replace: true });
        }, 350);
    };

    const handleNiveauFilter = (val) => {
        setNiveauFilter(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(route('semestres.index'), { search, niveau_id: val || undefined }, { preserveState: true, replace: true });
        }, 350);
    };

    const items = semestres?.data ?? [];
    const pag  = semestres?.meta ?? semestres;

    return (
        <>
            <Head title={t('semestresManagement')} />
            <Toast flash={flash} t={t} />

            {modal?.mode === 'create' && <SemestreModal mode="create" niveaux={niveaux} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}
            {modal?.mode === 'edit' && <SemestreModal mode="edit" semestre={modal.semestre} niveaux={niveaux} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}
            {modal?.mode === 'delete' && <DeleteModal semestre={modal.semestre} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />}

            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white">{t('semestresManagement')}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {locale === 'ar' ? 'إدارة الفصول الدراسية' : 'Gérer les semestres'}
                        </p>
                    </div>
                    <button onClick={() => setModal({ mode: 'create' })}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition">
                        <Icon d={I.plus} className="h-4 w-4" />{t('addSemestre')}
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <Icon d={I.search} className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
                            placeholder={locale === 'ar' ? 'بحث...' : 'Rechercher...'}
                            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ps-9 pe-4 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition shadow-sm" />
                    </div>
                    <select value={niveauFilter} onChange={e => handleNiveauFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition shadow-sm">
                        <option value="">{locale === 'ar' ? 'جميع المستويات' : 'Tous les niveaux'}</option>
                        {niveaux?.map(n => (
                            <option key={n.id} value={n.id}>{n.nom_fr} ({n.code})</option>
                        ))}
                    </select>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                            <Icon d={I.empty} className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">{search || niveauFilter ? (locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat') : t('noSemestres')}</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-700/30">
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>{locale === 'ar' ? 'الرمز' : 'Code'}</th>
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>{locale === 'ar' ? 'الاسم' : 'Nom'}</th>
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>{locale === 'ar' ? 'المستوى' : 'Niveau'}</th>
                                        <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>{locale === 'ar' ? 'الرقم' : 'Numéro'}</th>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-end">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                    {items.map(s => {
                                        const niveau = niveaux?.find(n => n.id === s.niveau_id) || s.niveau;
                                        return (
                                            <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
                                                <td className="px-5 py-3.5">
                                                    <span className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2.5 py-1 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{s.code}</span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white">{locale === 'ar' ? (s.nom_ar || s.nom_fr) : (s.nom_fr || s.nom_ar)}</p>
                                                    <p className="text-xs text-slate-400" dir={locale === 'ar' ? 'ltr' : 'rtl'}>{locale === 'ar' ? s.nom_fr : s.nom_ar}</p>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                                                        {niveau ? (locale === 'ar' ? (niveau.nom_ar || niveau.nom_fr) : (niveau.nom_fr || niveau.nom_ar)) : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">{s.numero}</span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => setModal({ mode: 'edit', semestre: s })}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 transition"
                                                            title={t('edit')}><Icon d={I.edit} className="h-4 w-4" /></button>
                                                        <button onClick={() => setModal({ mode: 'delete', semestre: s })}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition"
                                                            title={t('delete')}><Icon d={I.trash} className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {items.length > 0 && <Pagination meta={pag} isRTL={isRTL} />}
            </div>
        </>
    );
}

export default function SemestresIndex({ semestres, niveaux, filters }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <PageContent semestres={semestres} niveaux={niveaux} filters={filters} />
            </AdminLayout>
        </LanguageProvider>
    );
}
