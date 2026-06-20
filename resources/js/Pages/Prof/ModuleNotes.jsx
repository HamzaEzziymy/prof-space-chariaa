import { useState, useCallback, useEffect, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import ProfLayout from '@/Layouts/ProfLayout';
import * as XLSX from 'xlsx';

function computeDecision(note) {
    if (note === null || note === undefined || note === '') return null;
    const v = parseFloat(note);
    if (isNaN(v)) return null;
    if (v === 99) return 'absent';
    return v >= 10 ? 'pass' : 'fail';
}

function Toast({ message, type, errors, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, errors?.length ? 8000 : 4000);
        return () => clearTimeout(t);
    }, [onClose, errors]);

    const isError = type === 'error';
    const bg = isError ? '#dc2626' : '#059669';

    return (
        <div className="fixed bottom-6 end-6 z-50 max-w-md rounded-xl px-5 py-4 text-sm font-medium text-white shadow-lg"
            style={{ backgroundColor: bg }}>
            <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {isError
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    }
                </svg>
                <div className="flex-1">
                    <p>{message}</p>
                    {errors?.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                            {errors.map((e, i) => (
                                <li key={i} className="text-xs opacity-80">{e}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function Pagination({ paginator, locale }) {
    if (!paginator || paginator.last_page <= 1) return null;
    const go = (url) => { if (url) router.get(url, {}, { preserveState: true, preserveScroll: true }); };
    const linkLabel = (l) => {
        if (l.label.includes('Previous') || l.label.includes('Précédent') || l.label.includes('السابق')) return locale === 'ar' ? 'السابق' : 'Préc.';
        if (l.label.includes('Next') || l.label.includes('Suivant') || l.label.includes('التالي')) return locale === 'ar' ? 'التالي' : 'Suiv.';
        return l.label;
    };
    return (
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/30">
            <p className="text-xs text-slate-400">
                {paginator.from ?? 0}–{paginator.to ?? 0} / {paginator.total}
            </p>
            <div className="flex items-center gap-1">
                {paginator.links?.map((l, i) => {
                    const isNav = l.label.includes('Previous') || l.label.includes('Next') || l.label.includes('Précédent') || l.label.includes('Suivant') || l.label.includes('السابق') || l.label.includes('التالي');
                    return (
                        <button key={i} onClick={() => go(l.url)} disabled={!l.url}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${l.active ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed'}`}>
                            {isNav ? linkLabel(l) : l.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function ModuleNotesContent({ module: mod, students, allStudents, stats }) {
    const { t, locale, isRTL } = useLanguage();
    const { auth } = usePage().props;

    const [notesData, setNotesData] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [importing, setImporting] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [importPreview, setImportPreview] = useState(null);
    const fileRef = useRef(null);

    const rows = students?.data ?? [];
    const getNoteField = (statut) => statut === 'rattrapage' ? 'note_rattrapage' : statut === 'finale' ? 'note_finale' : 'note_normale';

    useEffect(() => {
        const notes = {};
        rows.forEach(s => {
            const field = getNoteField(s.statut);
            notes[s.etud_mod_id] = {
                [field]: s[field] ?? '',
                _original: s[field] ?? '',
            };
        });
        setNotesData({ ...notes });
    }, [rows]);

    const handleNoteChange = (etudModId, field, value) => {
        setNotesData(prev => ({
            ...prev,
            [etudModId]: { ...prev[etudModId], [field]: value },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const notes = [];
            const invalidRows = [];
            rows.forEach(s => {
                const d = notesData[s.etud_mod_id];
                if (!d) return;
                const field = getNoteField(s.statut);
                const val = d[field];
                if (val === '' || val === null || val === undefined) return;
                const num = parseFloat(val);
                if (isNaN(num)) return;
                if (num < 0 || (num > 20 && num !== 99)) {
                    invalidRows.push({ name: isRTL ? `${s.nom_ar} ${s.prenom_ar}` : `${s.nom_fr} ${s.prenom_fr}`, val });
                    return;
                }
                notes.push({
                    etud_mod_id: s.etud_mod_id,
                    Nexam: s.nexam ?? 1,
                    [field]: num,
                });
            });

            if (invalidRows.length > 0) {
                setSaving(false);
                const msg = locale === 'ar'
                    ? `نقاط غير صالحة: ${invalidRows.map(r => `${r.name} (${r.val})`).join('، ')}. يجب أن تكون بين 0 و20 أو 99 (غائب).`
                    : `Notes invalides: ${invalidRows.map(r => `${r.name} (${r.val})`).join(', ')}. Doit être entre 0 et 20 ou 99 (absent).`;
                setToast({ message: msg, type: 'error' });
                return;
            }

            if (notes.length === 0) { setSaving(false); setToast({ message: locale === 'ar' ? 'لا توجد نقاط للحفظ' : 'Aucune note à enregistrer', type: 'error' }); return; }

            await window.axios.post(`/prof/modules/${mod.id}/notes`, { notes });

            const updated = { ...notesData };
            rows.forEach(s => {
                const d = updated[s.etud_mod_id];
                if (!d) return;
                const field = getNoteField(s.statut);
                d._original = d[field];
            });
            setNotesData(updated);
            setToast({ message: locale === 'ar' ? 'تم حفظ النقاط بنجاح' : 'Notes enregistrées avec succès', type: 'success' });
        } catch {
            setToast({ message: locale === 'ar' ? 'خطأ في الحفظ' : 'Erreur de sauvegarde', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const getNoteVal = (etudModId, field) => notesData[etudModId]?.[field] ?? '';

    const getDecision = (etudModId, statut) => {
        const field = getNoteField(statut);
        const note = getNoteVal(etudModId, field);
        const result = computeDecision(note);
        if (result === null) return null;
        if (result === 'absent') return isRTL ? 'غائب' : 'Absent';
        if (isRTL) return result === 'pass' ? 'مستوفي' : 'غير مستوفي';
        return result === 'pass' ? 'Validé' : 'Non validé';
    };

    const isDirty = () => rows.some(s => {
        const d = notesData[s.etud_mod_id];
        if (!d) return false;
        const field = getNoteField(s.statut);
        return String(d._original ?? '') !== String(d[field] ?? '');
    });

    const moduleName = isRTL ? (mod.nom_ar || mod.nom_fr) : (mod.nom_fr || mod.nom_ar);

    const handleExport = () => {
        const headers = isRTL
            ? ['رقم الامتحان', 'CNE', 'الاسم', 'النسب', 'النقطة']
            : ['N° Examen', 'CNE', 'Nom', 'Prénom', 'Note'];
        const data = (allStudents ?? []).map(s => [
            s.nexam,
            s.CNE,
            isRTL ? `${s.prenom_ar} ${s.nom_ar}` : `${s.prenom_fr} ${s.nom_fr}`,
            isRTL ? s.nom_ar : s.nom_fr,
            s.note ?? '',
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const colWidths = [{ wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 22 }, { wch: 10 }];
        ws['!cols'] = colWidths;
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Notes');
        const filename = `notes_${mod.code_module}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await window.axios.post(`/prof/modules/${mod.id}/import-notes`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setToast({ message: res.data.message, type: res.data.success ? 'success' : 'error', errors: res.data.errors });
            if (res.data.success) {
                setShowImport(false);
                router.reload({ preserveState: false });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur lors de l\'import';
            const errs = err.response?.data?.errors;
            setToast({ message: msg, type: 'error', errors: errs ? (Array.isArray(errs) ? errs : [errs]) : undefined });
        } finally {
            setImporting(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const progressPct = stats?.total > 0 ? Math.round((stats.entered / stats.total) * 100) : 0;
    const progressColor = progressPct >= 80 ? 'bg-emerald-500' : progressPct >= 50 ? 'bg-amber-500' : 'bg-red-500';

    const isNoteValid = (val) => {
        if (val === '' || val === null || val === undefined) return null;
        const n = parseFloat(val);
        if (isNaN(n)) return false;
        if (n === 99) return 'absent';
        return n >= 0 && n <= 20;
    };

    const noteInputBg = (val) => {
        const v = isNoteValid(val);
        if (v === null) return 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-700 text-slate-700 dark:text-slate-200';
        if (v === 'absent') return 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
        if (v && parseFloat(val) >= 10) return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
        if (v) return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300';
        return 'border-red-300 bg-red-50/50 text-red-600 dark:border-red-700 dark:bg-red-900/10 dark:text-red-400';
    };

    return (
        <>
            <Head title={moduleName} />

            <ProfLayout wide>
                <div className="space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>

                    {/* Header banner */}
                    {(() => {
                        const nCount = allStudents?.filter(s => s.statut === 'normale').length ?? 0;
                        const rCount = allStudents?.filter(s => s.statut === 'rattrapage').length ?? 0;
                        const fCount = allStudents?.filter(s => s.statut === 'finale').length ?? 0;
                        const sessionParts = [];
                        if (nCount > 0) sessionParts.push({ label: isRTL ? 'الدورة العادية' : 'Session normale', count: nCount });
                        if (rCount > 0) sessionParts.push({ label: isRTL ? 'الدورة الاستدراكية' : 'Session rattrapage', count: rCount });
                        if (fCount > 0) sessionParts.push({ label: isRTL ? 'الدورة النهائية' : 'Session finale', count: fCount });
                        return (
                        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 text-white shadow-lg shadow-primary/20 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div>
                                    <p className="text-sm font-medium text-white/70">{mod.code_module}</p>
                                    <h2 className="mt-1 text-2xl font-bold">{moduleName}</h2>
                                    <p className="mt-1 text-sm text-white/70">
                                        {locale === 'ar' ? `${stats?.total ?? 0} طالب مسجل` : `${stats?.total ?? 0} étudiant(s) inscrit(s)`}
                                    </p>
                                    {sessionParts.length > 0 && (
                                        <div className={`mt-2 flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            {sessionParts.map((sp, i) => (
                                                <span key={i} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${sp.count > 0 ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}`}>
                                                    {sp.label}
                                                    <span className="inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-bold">{sp.count}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className={`inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {stats?.total ?? 0}
                                </span>
                            </div>
                            <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
                            <div className="pointer-events-none absolute -bottom-10 -right-4 h-40 w-40 rounded-full bg-white/5" />
                        </div>
                        );
                    })()}

                    {/* Stats cards */}
                    {stats && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-medium text-slate-400">{locale === 'ar' ? 'الإجمالي' : 'Total'}</p>
                                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-medium text-emerald-500">{locale === 'ar' ? 'المدخلة' : 'Saisies'}</p>
                                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.entered}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-medium text-amber-500">{locale === 'ar' ? 'المتبقية' : 'Restantes'}</p>
                                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-medium text-slate-400">{locale === 'ar' ? 'التقدم' : 'Progression'}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                                        <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${progressPct}%` }} />
                                    </div>
                                    <span className={`text-sm font-bold ${progressPct >= 80 ? 'text-emerald-600' : progressPct >= 50 ? 'text-amber-600' : 'text-red-600'} dark:${progressPct >= 80 ? 'text-emerald-400' : progressPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                        {progressPct}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top action bar */}
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button onClick={handleExport}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            {locale === 'ar' ? 'تصدير Excel' : 'Exporter Excel'}
                        </button>
                        <button onClick={() => setShowImport(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            {locale === 'ar' ? 'استيراد Excel' : 'Importer Excel'}
                        </button>
                        <div className="flex-1" />
                        {isDirty() && (
                            <p className="text-xs text-amber-500 font-medium">
                                {locale === 'ar' ? 'تغييرات غير محفوظة' : 'Modifications non sauvegardées'}
                            </p>
                        )}
                        <button onClick={handleSave} disabled={saving}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary/90 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:from-primary/90 hover:to-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none">
                            {saving ? (
                                <>
                                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {locale === 'ar' ? 'جارٍ الحفظ...' : 'Sauvegarde...'}
                                </>
                            ) : (
                                <>
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    {locale === 'ar' ? 'حفظ النقاط' : 'Enregistrer les notes'}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Import modal */}
                    {showImport && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                                <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {locale === 'ar' ? 'استيراد النقاط' : 'Importer les notes'}
                                    </h3>
                                    <button onClick={() => setShowImport(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                                    {locale === 'ar'
                                        ? 'اختر ملف Excel أو CSV يحتوي على عمودي "CNE" و "Note". النقاط يجب أن تكون بين 0 و 20 أو 99 للغياب.'
                                        : 'Sélectionnez un fichier Excel ou CSV avec les colonnes "CNE" et "Note". Les notes doivent être entre 0 et 20 ou 99 pour absent.'}
                                </p>
                                <div className="mb-4">
                                    <button onClick={handleExport} className="text-xs font-medium text-primary hover:text-primary/80 underline">
                                        {locale === 'ar' ? 'تحميل نموذج Excel' : 'Télécharger le modèle Excel'} ↓
                                    </button>
                                </div>
                                <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition ${importing ? 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-600 dark:bg-slate-700' : 'border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 dark:border-primary/20 dark:bg-primary/5 dark:hover:border-primary/30'}`}>
                                    <svg className="mb-2 h-8 w-8 text-primary/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                        {importing ? (locale === 'ar' ? 'جارٍ الاستيراد...' : 'Importation...') : (locale === 'ar' ? 'انقر لاختيار ملف' : 'Cliquez pour choisir un fichier')}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">CSV, XLSX, XLS</p>
                                    <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt" onChange={handleImportFile} disabled={importing} className="hidden" />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Students table */}
                    {rows.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-600 dark:bg-slate-800">
                            <svg className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-slate-400">
                                {locale === 'ar' ? 'لا يوجد طلاب مسجلون في هذه الوحدة' : 'Aucun étudiant inscrit dans ce module'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                            <th className="px-5 py-3 font-medium text-center">{locale === 'ar' ? 'رقم الامتحان' : 'N° examen'}</th>
                                            <th className="px-5 py-3 font-medium text-left">CNE</th>
                                            <th className={`px-5 py-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                                {locale === 'ar' ? 'الطالب' : 'Étudiant'}
                                            </th>
                                            <th className="px-5 py-3 font-medium text-center">{locale === 'ar' ? 'النقطة' : 'Note'}</th>
                                            <th className="px-5 py-3 font-medium text-center">{locale === 'ar' ? 'القرار' : 'Décision'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((s) => {
                                            const sname = isRTL ? `${s.nom_ar} ${s.prenom_ar}` : `${s.nom_fr} ${s.prenom_fr}`;
                                            const field = getNoteField(s.statut);
                                            const noteVal = getNoteVal(s.etud_mod_id, field);
                                            const decision = getDecision(s.etud_mod_id, s.statut);
                                            const passed = computeDecision(noteVal);
                                            const isValid = isNoteValid(noteVal);

                                            return (
                                                <tr key={s.etud_mod_id} className="border-b border-slate-50 text-slate-600 transition hover:bg-slate-50/50 dark:border-slate-700/30 dark:text-slate-300 dark:hover:bg-slate-700/20">
                                                    <td className="px-5 py-2.5 text-center font-mono text-xs text-slate-500">{s.nexam ?? '—'}</td>
                                                    <td className="px-5 py-2.5 font-mono text-xs">{s.CNE}</td>
                                                    <td className={`px-5 py-2.5 text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                                        {sname}
                                                    </td>
                                                    <td className="px-5 py-2.5 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                min="0"
                                                                max="99"
                                                                value={noteVal}
                                                                onChange={(e) => handleNoteChange(s.etud_mod_id, field, e.target.value)}
                                                                className={`w-16 rounded-md border px-2 py-1 text-center text-xs font-medium transition-all focus:ring-2 focus:ring-primary/30 ${noteInputBg(noteVal)}`}
                                                            />
                                                            {noteVal == 99 && (
                                                                <span className="inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                    {locale === 'ar' ? 'غائب' : 'Absent'}
                                                                </span>
                                                            )}
                                                            {isValid === false && (
                                                                <span className="text-[10px] font-medium text-red-500">
                                                                    {locale === 'ar' ? '0-20 أو 99' : '0-20 ou 99'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-2.5 text-center">
                                                        {decision ? (
                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                                                passed === 'absent'
                                                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300'
                                                                    : passed === 'pass'
                                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300'
                                                            }`}>
                                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                    {passed === 'absent'
                                                                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                        : passed === 'pass'
                                                                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                            : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                    }
                                                                </svg>
                                                                {decision}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-600">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination paginator={students} locale={locale} />

                            {/* Bottom bar */}
                            <div className={`flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-3 dark:border-slate-700 ${isRTL ? 'flex-row-reverse' : ''} bg-slate-50/30 dark:bg-slate-800/30`}>
                                {isDirty() && (
                                    <p className="text-xs text-amber-500 font-medium">
                                        {locale === 'ar' ? 'تغييرات غير محفوظة' : 'Modifications non sauvegardées'}
                                    </p>
                                )}
                                <button onClick={handleSave} disabled={saving}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary/90 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:from-primary/90 hover:to-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none">
                                    {saving ? (
                                        <>
                                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            {locale === 'ar' ? 'جارٍ الحفظ...' : 'Sauvegarde...'}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            {locale === 'ar' ? 'حفظ النقاط' : 'Enregistrer les notes'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </ProfLayout>

            {toast && <Toast message={toast.message} type={toast.type} errors={toast.errors} onClose={() => setToast(null)} />}
        </>
    );
}

export default function ModuleNotes(props) {
    return (
        <LanguageProvider defaultLocale="ar">
            <ModuleNotesContent {...props} />
        </LanguageProvider>
    );
}
