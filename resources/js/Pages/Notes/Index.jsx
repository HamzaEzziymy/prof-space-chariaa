import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function Icon({ d, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const I = {
    filter:     'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    close:      'M6 18L18 6M6 6l12 12',
    check:      'M5 13l4 4L19 7',
    chevDown:   'M19 9l-7 7-7-7',
    search:     'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    save:       'M5 13l4 4L19 7',
    plus:       'M12 4v16m8-8H4',
    trash:      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    alert:      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
    male:       'M16 3h5m0 0v5m0-5l-6 6M9 15a6 6 0 100-12 6 6 0 000 12z',
    female:     'M12 14a6 6 0 100-12 6 6 0 000 12zm0 0v8m-4-4h8',
};

function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg   = flash?.success || flash?.error;
    const isErr = !!flash?.error;
    const map = {
        notes_saved:      t('saveSuccess'),
        notes_no_changes: t('noChanges'),
        note_deleted:     t('noteDeleted'),
    };
    useEffect(() => {
        if (msg) { setVisible(true); const id = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(id); }
    }, [msg]);
    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium ${isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <Icon d={isErr ? I.close : I.check} className="h-4 w-4 shrink-0" />
            {map[msg] ?? msg}
        </div>
    );
}

function NotesContent({ filieres, niveaux, semestres, modules, salles, rows, filters, t, locale, isRTL }) {
    const { flash } = usePage().props;
    const [filiereId, setFiliereId]   = useState(filters?.filiere_id ?? '');
    const [niveauId, setNiveauId]     = useState(filters?.niveau_id ?? '');
    const [semestreId, setSemestreId] = useState(filters?.semestre_id ?? '');
    const [moduleId, setModuleId]     = useState(filters?.module_id ?? '');
    const [nexam, setNexam]           = useState(filters?.Nexam ?? 1);

    const [saving, setSaving]         = useState(false);
    const [localRows, setLocalRows]   = useState(rows ?? []);
    const [dirty, setDirty]           = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => { setLocalRows(rows ?? []); setDirty(false); }, [rows]);

    const applyFilters = (overrides = {}) => {
        const params = {};
        const f = { filiereId, niveauId, semestreId, moduleId, nexam, ...overrides };
        if (f.filiereId)  params.filiere_id  = f.filiereId;
        if (f.niveauId)   params.niveau_id   = f.niveauId;
        if (f.semestreId) params.semestre_id = f.semestreId;
        if (f.moduleId)   params.module_id   = f.moduleId;
        params.Nexam = f.nexam;

        router.get(route('notes.index'), params, { preserveState: true, replace: true });
    };

    const handleFiliere  = (v) => { setFiliereId(v); setNiveauId(''); setSemestreId(''); setModuleId(''); applyFilters({ filiereId: v, niveauId: '', semestreId: '', moduleId: '' }); };
    const handleNiveau   = (v) => { setNiveauId(v); setSemestreId(''); setModuleId(''); applyFilters({ niveauId: v, semestreId: '', moduleId: '' }); };
    const handleSemestre = (v) => { setSemestreId(v); setModuleId(''); applyFilters({ semestreId: v, moduleId: '' }); };
    const handleModule   = (v) => { setModuleId(v); applyFilters({ moduleId: v }); };
    const handleNexam    = (v) => { setNexam(v); applyFilters({ nexam: v }); };

    const updateNote = (etudModId, field, value) => {
        setLocalRows(prev => prev.map(r => {
            if (r.etud_mod_id !== etudModId) return r;
            const updated = { ...r, note: { ...(r.note || {}), [field]: value } };
            return updated;
        }));
        setDirty(true);
    };

    const bulkSave = () => {
        setSaving(true);
        const notes = localRows
            .filter(r => r.note?.note_normale !== undefined || r.note?.note_rattrapage !== undefined || r.note?.note_finale !== undefined)
            .map(r => ({
                etud_mod_id:  r.etud_mod_id,
                Nexam:        parseInt(nexam),
                note_normale:    r.note?.note_normale ?? null,
                note_rattrapage: r.note?.note_rattrapage ?? null,
                note_finale:     r.note?.note_finale ?? null,
                id_salle:        r.note?.id_salle ?? null,
            }));
        router.post(route('notes.bulk-update'), { notes }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => { setSaving(false); setDirty(false); },
            onError:   () => { setSaving(false); },
            onFinish:  () => { setSaving(false); },
        });
    };

    const deleteNote = (etudModId) => {
        const row = localRows.find(r => r.etud_mod_id === etudModId);
        if (!row?.note?.id) return;
        if (!confirm(t('confirmDeleteNoteMsg'))) return;
        router.delete(route('notes.destroy', row.note.id), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasModule = !!moduleId;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('notesTitle')}</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('notesSubtitle')}</p>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <SelectFilter label={t('selectFiliere')} value={filiereId} onChange={handleFiliere}
                        options={filieres.map(f => ({ value: f.id, label: `${f.code} — ${locale === 'ar' ? (f.nom_ar || f.nom_fr) : f.nom_fr}` }))}
                        placeholder={locale === 'ar' ? 'اختر الشعبة...' : 'Filière...'} />

                    <SelectFilter label={t('selectNiveau')} value={niveauId} onChange={handleNiveau}
                        options={niveaux.map(n => ({ value: n.id, label: `${locale === 'ar' ? (n.nom_ar || n.nom_fr) : n.nom_fr} (${n.code})` }))}
                        placeholder={locale === 'ar' ? 'اختر المستوى...' : 'Niveau...'} />

                    <SelectFilter label={t('selectSemestre')} value={semestreId} onChange={handleSemestre}
                        options={semestres.map(s => ({ value: s.id, label: `${locale === 'ar' ? (s.nom_ar || s.nom_fr) : s.nom_fr} (${s.code})` }))}
                        placeholder={locale === 'ar' ? 'اختر الفصل...' : 'Semestre...'} />

                    <SelectFilter label={t('selectModule')} value={moduleId} onChange={handleModule}
                        options={modules.map(m => ({ value: m.id, label: `${locale === 'ar' ? (m.nom_ar || m.nom_fr) : m.nom_fr} (${m.code_module})` }))}
                        placeholder={locale === 'ar' ? 'اختر المادة...' : 'Module...'} />

                    <SelectFilter label={t('selectNexam')} value={nexam} onChange={handleNexam}
                        options={[1,2,3,4,5,6].map(n => ({ value: n, label: `${t('nexamLabel')} ${n}` }))} />

                </div>

                {/* Bulk Save bar */}
                {hasModule && (
                    <div className={`sticky top-4 z-10 mb-4 flex items-center justify-between rounded-xl border bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800 ${dirty ? 'border-amber-300 dark:border-amber-700' : ''}`}>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {localRows.length} {t('student').toLowerCase()}{localRows.length > 1 ? 's' : ''}
                            {dirty && <span className="ms-2 text-amber-600 dark:text-amber-400">— {locale === 'ar' ? 'تغييرات غير محفوظة' : 'modifications non enregistrées'}</span>}
                        </span>
                        <button onClick={bulkSave} disabled={saving}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95 ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {saving ? (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            ) : <Icon d={I.check} className="h-4 w-4" />}
                            {saving ? t('saving') : t('bulkSave')}
                        </button>
                    </div>
                )}

                {/* Content */}
                {!hasModule ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 dark:border-slate-700 dark:bg-slate-800">
                        <Icon d={I.search} className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-400 dark:text-slate-500">{t('noModuleSelected')}</p>
                    </div>
                ) : localRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 dark:border-slate-700 dark:bg-slate-800">
                        <Icon d={I.alert} className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-400 dark:text-slate-500">{t('noStudents')}</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                                        <th className="px-3 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">#</th>
                                        <th className="px-3 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('student')}</th>
                                        <th className="px-3 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">CNE</th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('noteNormale')} <span className="text-[10px] font-normal">/20</span></th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('noteRattrapage')} <span className="text-[10px] font-normal">/20</span></th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('noteFinale')} <span className="text-[10px] font-normal">/20</span></th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('examRoom')}</th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {localRows.map((row, idx) => {
                                        const e = row.etudiant;
                                        const n = row.note || {};
                                        return (
                                            <tr key={row.etud_mod_id} className="group transition hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                                                <td className="px-3 py-3 text-xs text-slate-400">{idx + 1}</td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-xs font-bold text-indigo-700 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300">
                                                            {e?.sexe === 'F'
                                                                ? <Icon d={I.female} className="h-4 w-4 text-rose-500" />
                                                                : <Icon d={I.male} className="h-4 w-4 text-indigo-500" />}
                                                        </span>
                                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                                            {locale === 'ar'
                                                                ? `${e?.prenom_ar || e?.prenom_fr} ${e?.nom_ar || e?.nom_fr}`
                                                                : `${e?.prenom_fr} ${e?.nom_fr}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600 dark:bg-slate-700 dark:text-slate-300">{e?.CNE}</code>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <input type="number" step="0.01" min="0" max="20"
                                                        value={n.note_normale ?? ''}
                                                        onChange={e => updateNote(row.etud_mod_id, 'note_normale', e.target.value === '' ? null : parseFloat(e.target.value))}
                                                        className={`w-20 rounded-lg border px-2 py-1.5 text-center text-sm transition focus:outline-none focus:ring-2 dark:text-white
                                                            ${n.note_normale !== undefined && n.note_normale !== null
                                                                ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20'
                                                                : 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-700'}`} />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <input type="number" step="0.01" min="0" max="20"
                                                        value={n.note_rattrapage ?? ''}
                                                        onChange={e => updateNote(row.etud_mod_id, 'note_rattrapage', e.target.value === '' ? null : parseFloat(e.target.value))}
                                                        className={`w-20 rounded-lg border px-2 py-1.5 text-center text-sm transition focus:outline-none focus:ring-2 dark:text-white
                                                            ${n.note_rattrapage !== undefined && n.note_rattrapage !== null
                                                                ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                                                                : 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-700'}`} />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <input type="number" step="0.01" min="0" max="20"
                                                        value={n.note_finale ?? ''}
                                                        onChange={e => updateNote(row.etud_mod_id, 'note_finale', e.target.value === '' ? null : parseFloat(e.target.value))}
                                                        className={`w-20 rounded-lg border px-2 py-1.5 text-center text-sm font-semibold transition focus:outline-none focus:ring-2 dark:text-white
                                                            ${n.note_finale !== undefined && n.note_finale !== null
                                                                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                                                                : 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-700'}`} />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <select value={n.id_salle ?? ''}
                                                        onChange={e => updateNote(row.etud_mod_id, 'id_salle', e.target.value || null)}
                                                        className="w-24 rounded-lg border border-slate-200 bg-white px-1.5 py-1.5 text-xs transition focus:outline-none focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                                                        <option value="">—</option>
                                                        {salles.map(s => (
                                                            <option key={s.id} value={s.id}>
                                                                {locale === 'ar' ? (s.nomSalle_ar || s.nomSalle_fr || s.code_salle) : (s.nomSalle_fr || s.nomSalle_ar || s.code_salle)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    {n.id && (
                                                        <button onClick={() => deleteNote(row.etud_mod_id)}
                                                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                                                            <Icon d={I.trash} className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <Toast flash={flash} t={t} />
        </div>
    );
}

function SelectFilter({ label, value, onChange, options, placeholder }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                <option value="">{placeholder}</option>
                {options.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

export default function NotesIndex({ filieres, niveaux, semestres, modules, salles, rows, filters }) {
    const { locale, isRTL } = useLanguage();
    const { t } = useLanguage();
    return (
        <LanguageProvider>
            <AdminLayout>
                <Head title={t('notesManagement')} />
                <NotesContent {...{ filieres, niveaux, semestres, modules, salles, rows, filters, t, locale, isRTL }} />
            </AdminLayout>
        </LanguageProvider>
    );
}
