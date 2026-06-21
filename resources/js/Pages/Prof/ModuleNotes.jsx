import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Head, usePage, router } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import ProfLayout from '@/Layouts/ProfLayout';
import * as XLSX from 'xlsx';

const XMarkIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);
const ArrowUpTrayIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
const ExclamationIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
);

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

function ModuleNotesContent({ module: mod, students, allStudents, stats, ready }) {
    const { t, locale, isRTL } = useLanguage();
    const { auth } = usePage().props;

    if (ready === false) {
        return (
            <ProfLayout>
                <Head title={mod.nom_fr || mod.nom_ar} />
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/20 mb-4">
                        <svg className="h-8 w-8 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                        {locale === 'ar' ? 'الوحدة غير جاهزة بعد' : 'Module pas encore prêt'}
                    </h2>
                    <p className="text-sm text-slate-400 max-w-md">
                        {locale === 'ar'
                            ? 'لم يتم إنشاء تسجيلات الامتحان لهذه الوحدة بعد. يرجى الاتصال بالإدارة لإنشاء التسجيلات.'
                            : 'Les inscriptions aux examens pour ce module n\'ont pas encore été créées. Veuillez contacter l\'administration.'}
                    </p>
                </div>
            </ProfLayout>
        );
    }

    const [notesData, setNotesData] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [localStats, setLocalStats] = useState(null);
    const [showImport, setShowImport] = useState(false);
    const inputRefs = useRef({});
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
            const newlyEntered = [];
            rows.forEach(s => {
                const d = updated[s.etud_mod_id];
                if (!d) return;
                const field = getNoteField(s.statut);
                const wasEmpty = d._original === '' || d._original === null || d._original === undefined;
                const nowFilled = d[field] !== '' && d[field] !== null && d[field] !== undefined;
                if (wasEmpty && nowFilled) newlyEntered.push(s.etud_mod_id);
                d._original = d[field];
            });
            setNotesData(updated);

            if (newlyEntered.length > 0) {
                const oldEnt = (localStats ?? stats).entered;
                setLocalStats({ ...(localStats ?? stats), entered: oldEnt + newlyEntered.length, pending: (localStats ?? stats).total - oldEnt - newlyEntered.length });
            }
            setToast({ message: locale === 'ar' ? 'تم حفظ النقاط بنجاح' : 'Notes enregistrées avec succès', type: 'success' });
        } catch {
            setToast({ message: locale === 'ar' ? 'خطأ في الحفظ' : 'Erreur de sauvegarde', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const isValidNote = (val) => {
        if (val === '' || val === null || val === undefined) return true;
        const n = parseFloat(val);
        return !isNaN(n) && n >= 0 && n <= 99 && /^\d*\.?\d{0,1}$/.test(String(val));
    };

    const handleKeyDown = (e, idx) => {
        if (e.key !== 'Enter') return;
        const s = rows[idx];
        const field = getNoteField(s.statut);
        const val = notesData[s.etud_mod_id]?.[field];
        if (!isValidNote(val)) return;
        e.preventDefault();
        const nextInput = inputRefs.current[rows[idx + 1]?.etud_mod_id];
        if (nextInput) nextInput.focus();
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

    // ── Import state ──
    const [importFile, setImportFile] = useState(null);
    const [importStatus, setImportStatus] = useState('idle'); // idle | previewing | loading | done | error
    const [importPreview, setImportPreview] = useState(null);
    const [importReport, setImportReport] = useState(null);
    const importFileInput = useRef(null);

    const parseFileWithSheetJS = (f) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const raw = new Uint8Array(e.target.result);
                const workbook = XLSX.read(raw, { type: 'array', codepage: 1256, raw: true });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                // Strip BOM from first cell if present
                if (rows.length > 0 && rows[0].length > 0 && typeof rows[0][0] === 'string') {
                    rows[0][0] = rows[0][0].replace(/^\uFEFF/, '');
                }
                resolve(rows);
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(f);
    });

    const handleFileSelect = async (f) => {
        if (!f) return;
        const ok = ['csv', 'xlsx', 'xls', 'xlsm', 'txt'].some(ext => f.name.toLowerCase().endsWith('.' + ext));
        if (!ok || f.size > 5 * 1024 * 1024) return;
        setImportFile(f);
        setImportReport(null);
        setImportPreview(null);
        try {
            const rows = await parseFileWithSheetJS(f);
            if (rows.length < 2) {
                setImportPreview({ valid: [], invalid: [], error: locale === 'ar' ? 'الملف فارغ' : 'Fichier vide' });
            } else {
                const rawHeader = rows[0].map(h => String(h ?? '').trim());
                const header = rawHeader.map(h => h.replace(/^\uFEFF/, '').toLowerCase().replace(/[\s\-_]+/g, '_').trim());
                const cneIdx = header.findIndex(h => /^cne$/.test(h));
                let noteIdx = header.findIndex(h => /^note$/.test(h));
                if (noteIdx === -1) {
                    noteIdx = rawHeader.findIndex(h => /^(النقطة|العلامة|الدرجة)$/.test(h));
                }
                if (cneIdx === -1 || noteIdx === -1) {
                    setImportPreview({ valid: [], invalid: [], error: locale === 'ar' ? 'الملف يجب أن يحتوي على عمودي CNE و (Note أو النقطة أو العلامة)' : 'Le fichier doit contenir les colonnes CNE et Note' });
                } else {
                    const valid = [], invalid = [];
                    rows.slice(1).forEach((row, i) => {
                        const lineNum = i + 2;
                        const cne = String(row[cneIdx] ?? '').trim();
                        const noteRaw = String(row[noteIdx] ?? '').trim();
                        if (!cne && !noteRaw) return;
                        const reasons = [];
                        if (!cne) reasons.push(locale === 'ar' ? 'CNE مطلوب' : 'CNE requis');
                        const n = parseFloat(noteRaw);
                        if (noteRaw && (isNaN(n) || n < 0 || (n > 20 && n !== 99))) {
                            reasons.push(locale === 'ar' ? 'نقطة غير صالحة (0-20 أو 99)' : 'Note invalide (0-20 ou 99)');
                        }
                        if (reasons.length === 0) valid.push({ lineNum, cne, note: noteRaw });
                        else invalid.push({ lineNum, cne, note: noteRaw, reasons });
                    });
                    setImportPreview({ valid, invalid });
                }
            }
        } catch {
            setImportPreview({ valid: [], invalid: [], error: locale === 'ar' ? 'خطأ في قراءة الملف' : 'Erreur de lecture du fichier' });
        }
        setImportStatus('previewing');
    };

    const handleImportSubmit = async () => {
        if (!importFile) return;
        setImportStatus('loading');
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('locale', locale);
        try {
            const res = await window.axios.post(`/prof/modules/${mod.id}/import-notes`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImportReport(res.data);
            setImportStatus('done');
            if (res.data.success) {
                router.reload({ preserveState: false, only: ['students', 'allStudents', 'stats'] });
            }
        } catch (err) {
            const data = err.response?.data;
            setImportReport({ error: data?.message ?? 'unknown', imported: 0, errors: data?.errors ?? [] });
            setImportStatus('error');
        }
    };

    const resetImport = () => {
        setImportFile(null);
        setImportPreview(null);
        setImportReport(null);
        setImportStatus('idle');
        if (importFileInput.current) importFileInput.current.value = '';
    };

    const closeImportModal = () => {
        resetImport();
        setShowImport(false);
    };

    const downloadImportReport = () => {
        const rejected = importReport?.errors ?? [];
        if (rejected.length === 0) return;
        const rows = rejected.map(e => ({
            [locale === 'ar' ? 'السطر' : 'Ligne']: e.line || '',
            CNE: e.cne || '',
            [locale === 'ar' ? 'السبب' : 'Raison']: e.reason || '',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rejets');
        const cols = Object.keys(rows[0] || {});
        ws['!cols'] = cols.map(() => ({ wch: 22 }));
        const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'rapport_rejets_notes.xlsx'; a.click();
        URL.revokeObjectURL(url);
    };

    const displayStats = localStats ?? stats;
    const progressPct = displayStats?.total > 0 ? Math.round((displayStats.entered / displayStats.total) * 100) : 0;
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
                        const semestre = mod.semestre;
                        const niveau = semestre?.niveau;
                        const filiere = niveau?.filiere;
                        const profUser = mod.prof?.user;
                        return (
                        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 text-white shadow-lg shadow-primary/20 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white/70">{mod.code_module}</p>
                                    <h2 className="mt-1 text-2xl font-bold break-words">{moduleName}</h2>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/80">
                                        {filiere && (
                                            <span className="inline-flex items-center gap-1">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                                                </svg>
                                                {isRTL ? filiere.nom_ar : filiere.nom_fr}
                                            </span>
                                        )}
                                        {niveau && (
                                            <span className="inline-flex items-center gap-1">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                                </svg>
                                                {isRTL ? niveau.nom_ar : niveau.nom_fr}
                                            </span>
                                        )}
                                        {semestre && (
                                            <span className="inline-flex items-center gap-1">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                                </svg>
                                                {isRTL ? semestre.nom_ar : semestre.nom_fr}
                                            </span>
                                        )}
                                        {mod.coefficient && (
                                            <span className="inline-flex items-center gap-1">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                                {locale === 'ar' ? `المعامل: ${mod.coefficient}` : `Coeff: ${mod.coefficient}`}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-white/70">
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
                                <div className={`flex shrink-0 flex-col items-center gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                                    <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {stats?.total ?? 0}
                                    </span>
                                    {profUser && (
                                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs backdrop-blur-sm">
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                            {isRTL ? `${profUser.prenom_ar} ${profUser.nom_ar}` : `${profUser.prenom_fr} ${profUser.nom_fr}`}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
                            <div className="pointer-events-none absolute -bottom-10 -right-4 h-40 w-40 rounded-full bg-white/5" />
                        </div>
                        );
                    })()}

                    {/* Stats cards */}
                    {displayStats && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-medium text-slate-400">{locale === 'ar' ? 'الإجمالي' : 'Total'}</p>
                                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{displayStats.total}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-medium text-emerald-500">{locale === 'ar' ? 'المدخلة' : 'Saisies'}</p>
                                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{displayStats.entered}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-medium text-amber-500">{locale === 'ar' ? 'المتبقية' : 'Restantes'}</p>
                                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{displayStats.pending}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-medium text-slate-400">{locale === 'ar' ? 'التقدم' : 'Progression'}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                                        <div className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`} style={{ width: `${progressPct}%` }} />
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
                        <button onClick={() => window.open(`/prof/modules/${mod.id}/releve-notes-pdf?locale=${locale}`, '_blank')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4a1 1 0 001 1h4M12 12v5m-2-2l2 2 2-2" />
                            </svg>
                            {locale === 'ar' ? 'بيان النقاط PDF' : 'Relevé notes PDF'}
                        </button>
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
                    {showImport && createPortal(
                        <div className="fixed inset-0 z-50">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeImportModal} />
                            <div className="absolute inset-0 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                                <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[92vh]">
                                {/* ── Header ── */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-900/20 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                                            <ArrowUpTrayIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm">
                                                {locale === 'ar' ? 'استيراد النقاط' : 'Importer les notes'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {locale === 'ar' ? 'CSV أو Excel مع عمودي CNE و Note' : 'CSV ou Excel avec colonnes CNE et Note'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={closeImportModal} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 transition">
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* ── Body ── */}
                                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                                    {/* Idle / file selection */}
                                    {importStatus === 'idle' && (
                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-10 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/10 dark:hover:border-indigo-500">
                                            <ArrowUpTrayIcon className="mb-3 h-10 w-10 text-indigo-400" />
                                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                {locale === 'ar' ? 'انقر لاختيار ملف' : 'Cliquez pour choisir un fichier'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">CSV, XLSX, XLS — {locale === 'ar' ? 'الحد الأقصى 5 ميغابايت' : 'max 5 Mo'}</p>
                                            <input ref={importFileInput} type="file" accept=".csv,.xlsx,.xls,.txt" onChange={(e) => {
                                                if (e.target.files[0]) handleFileSelect(e.target.files[0]);
                                            }} className="hidden" />
                                        </label>
                                    )}

                                    {/* Preview */}
                                    {importStatus === 'previewing' && importPreview && (
                                        <>
                                                    {importPreview.error ? (
                                                        <div className="flex flex-col items-center gap-3 py-6">
                                                            <ExclamationIcon className="h-10 w-10 text-red-400" />
                                                            <p className="text-sm font-medium text-red-600">{importPreview.error}</p>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={resetImport} className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                                                                    {locale === 'ar' ? 'اختيار ملف آخر' : 'Choisir un autre fichier'}
                                                                </button>
                                                                <button onClick={handleImportSubmit} className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                                                                    {locale === 'ar' ? 'إرسال إلى الخادم' : 'Envoyer au serveur'}
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-slate-400">{locale === 'ar' ? 'يمكن إرسال الملف مباشرة إلى الخادم للتحقق منه' : 'Vous pouvez envoyer le fichier directement au serveur pour validation'}</p>
                                                        </div>
                                                    ) : importPreview.valid.length === 0 && importPreview.invalid.length === 0 ? (
                                                <div className="flex flex-col items-center gap-3 py-6">
                                                    <p className="text-sm font-medium text-amber-600">{locale === 'ar' ? 'لا توجد بيانات صالحة في الملف' : 'Aucune donnée valide dans le fichier'}</p>
                                                    <button onClick={resetImport} className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                                                        {locale === 'ar' ? 'اختيار ملف آخر' : 'Choisir un autre fichier'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Stats cards */}
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
                                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{locale === 'ar' ? 'صالح' : 'Valides'}</p>
                                                            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{importPreview.valid.length}</p>
                                                        </div>
                                                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center dark:border-red-800 dark:bg-red-900/20">
                                                            <p className="text-xs font-medium text-red-600 dark:text-red-400">{locale === 'ar' ? 'غير صالح' : 'Invalides'}</p>
                                                            <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">{importPreview.invalid.length}</p>
                                                        </div>
                                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-800">
                                                            <p className="text-xs font-medium text-slate-500">{locale === 'ar' ? 'الإجمالي' : 'Total'}</p>
                                                            <p className="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-300">{importPreview.valid.length + importPreview.invalid.length}</p>
                                                        </div>
                                                    </div>

                                                    {/* Preview table */}
                                                    <div>
                                                        <p className="mb-2 text-xs font-semibold text-slate-500">{locale === 'ar' ? 'معاينة البيانات' : 'Aperçu des données'}</p>
                                                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 max-h-56">
                                                            <table className="w-full text-xs">
                                                                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                                                                    <tr>
                                                                        <th className="px-3 py-2 font-medium text-slate-500 text-center w-12">{locale === 'ar' ? 'سطر' : 'Ligne'}</th>
                                                                        <th className="px-3 py-2 font-medium text-slate-500 text-left">CNE</th>
                                                                        <th className="px-3 py-2 font-medium text-slate-500 text-center">{locale === 'ar' ? 'النقطة' : 'Note'}</th>
                                                                        <th className="px-3 py-2 font-medium text-slate-500 text-center">{locale === 'ar' ? 'الحالة' : 'Statut'}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {[...importPreview.valid.slice(0, 30), ...importPreview.invalid.slice(0, 10)].map((r, i) => (
                                                                        <tr key={i} className="border-t border-slate-100 dark:border-slate-700/50">
                                                                            <td className="px-3 py-1.5 text-center text-slate-400">{r.lineNum}</td>
                                                                            <td className={`px-3 py-1.5 font-mono ${r.cne ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>{r.cne || '—'}</td>
                                                                            <td className="px-3 py-1.5 text-center font-mono text-slate-700 dark:text-slate-300">{r.note || '—'}</td>
                                                                            <td className="px-3 py-1.5 text-center">
                                                                                {r.reasons ? (
                                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                                                        {locale === 'ar' ? 'غير صالح' : 'Invalide'}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                                        <CheckIcon className="h-2.5 w-2.5" />
                                                                                        {locale === 'ar' ? 'صالح' : 'Valide'}
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    {importPreview.valid.length > 30 && (
                                                                        <tr className="border-t border-slate-100 dark:border-slate-700/50">
                                                                            <td colSpan={4} className="px-3 py-2 text-center text-xs text-slate-400 italic">
                                                                                {locale === 'ar' ? `و ${importPreview.valid.length - 30} سطر آخر` : `et ${importPreview.valid.length - 30} ligne(s) supplémentaire(s)`}
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <p className="mt-1.5 text-[10px] text-slate-400">
                                                            {locale === 'ar'
                                                                ? `عرض أول 30 سطراً صالحاً و 10 أسطر غير صالحة`
                                                                : `Affichage des 30 premières lignes valides et 10 invalides`}
                                                        </p>
                                                    </div>

                                                    {/* Invalid details */}
                                                    {importPreview.invalid.length > 0 && (
                                                        <div>
                                                            <p className="mb-2 text-xs font-semibold text-red-500">{locale === 'ar' ? 'تفاصيل الأخطاء' : 'Détails des erreurs'}</p>
                                                            <div className="space-y-1">
                                                                {importPreview.invalid.map((r, i) => (
                                                                    <div key={i} className="rounded-lg border border-red-100 bg-red-50/50 px-3 py-2 text-xs dark:border-red-900/30 dark:bg-red-900/10">
                                                                        <span className="font-semibold text-slate-600 dark:text-slate-300">{locale === 'ar' ? `سطر ${r.lineNum}` : `Ligne ${r.lineNum}`}</span>
                                                                        {r.cne && <span className="ml-2 font-mono text-slate-500">({r.cne})</span>}
                                                                        <span className="ml-2 text-red-500">{r.reasons.join(', ')}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                        <button onClick={resetImport} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800">
                                                            {locale === 'ar' ? 'إلغاء' : 'Annuler'}
                                                        </button>
                                                        <div className="flex-1" />
                                                        <button onClick={handleImportSubmit}
                                                            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                                            disabled={importPreview.valid.length === 0}>
                                                            {locale === 'ar' ? `استيراد ${importPreview.valid.length} نقطة` : `Importer ${importPreview.valid.length} note(s)`}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Loading */}
                                    {importStatus === 'loading' && (
                                        <div className="flex flex-col items-center gap-4 py-10">
                                            <svg className="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24">
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <p className="text-sm font-medium text-slate-500">{locale === 'ar' ? 'جارٍ الاستيراد...' : 'Importation en cours...'}</p>
                                        </div>
                                    )}

                                    {/* Report */}
                                    {(importStatus === 'done' || importStatus === 'error') && importReport && (
                                        <>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
                                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{locale === 'ar' ? 'تم الاستيراد' : 'Importées'}</p>
                                                    <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{importReport.imported ?? 0}</p>
                                                </div>
                                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center dark:border-amber-800 dark:bg-amber-900/20">
                                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{locale === 'ar' ? 'الرفض' : 'Rejetées'}</p>
                                                    <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{importReport.errors?.length ?? 0}</p>
                                                </div>
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-800">
                                                    <p className="text-xs font-medium text-slate-500">{locale === 'ar' ? 'الإجمالي' : 'Total'}</p>
                                                    <p className="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-300">{(importReport.imported ?? 0) + (importReport.errors?.length ?? 0)}</p>
                                                </div>
                                            </div>

                                            {importReport.errors?.length > 0 && (
                                                <div>
                                                    <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                        <p className="text-xs font-semibold text-red-500">{locale === 'ar' ? 'السطور المرفوضة' : 'Lignes rejetées'}</p>
                                                        <button onClick={downloadImportReport} className="rounded-lg border border-red-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50">
                                                            {locale === 'ar' ? 'تحميل التقرير' : 'Télécharger le rapport'} ↓
                                                        </button>
                                                    </div>
                                                    <div className="overflow-x-auto rounded-xl border border-red-100 dark:border-red-900/30 max-h-40">
                                                        <table className="w-full text-xs">
                                                            <thead className="bg-red-50 dark:bg-red-900/20 sticky top-0">
                                                                <tr>
                                                                    <th className="px-3 py-2 font-medium text-red-500 text-center w-12">{locale === 'ar' ? 'سطر' : 'Ligne'}</th>
                                                                    <th className="px-3 py-2 font-medium text-red-500 text-left">CNE</th>
                                                                    <th className="px-3 py-2 font-medium text-red-500 text-left">{locale === 'ar' ? 'السبب' : 'Raison'}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {importReport.errors.map((e, i) => (
                                                                    <tr key={i} className="border-t border-red-50 dark:border-red-900/10">
                                                                        <td className="px-3 py-1.5 text-center text-slate-500">{e.line ?? (i + 1)}</td>
                                                                        <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">{e.cne || '—'}</td>
                                                                        <td className="px-3 py-1.5 text-red-600">{e.reason || e}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-center">
                                                <button onClick={closeImportModal} className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
                                                    {locale === 'ar' ? 'إغلاق' : 'Fermer'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    , document.body)}

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
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-b border-slate-200 dark:border-slate-700">
                                            <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                <span className="flex items-center justify-center gap-1">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                    {locale === 'ar' ? 'رقم الامتحان' : 'N° Examen'}
                                                </span>
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                    </svg>
                                                    CNE
                                                </span>
                                            </th>
                                            <th className={`px-5 py-3.5 ${isRTL ? 'text-right' : 'text-left'} text-[11px] font-bold uppercase tracking-wider text-slate-500`}>
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                    </svg>
                                                    {locale === 'ar' ? 'الطالب' : 'Étudiant'}
                                                </span>
                                            </th>
                                            <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                <span className="flex items-center justify-center gap-1">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                    </svg>
                                                    {locale === 'ar' ? 'النقطة' : 'Note'}
                                                </span>
                                            </th>
                                            <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                <span className="flex items-center justify-center gap-1">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {locale === 'ar' ? 'القرار' : 'Décision'}
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((s, idx) => {
                                            const sname = isRTL ? `${s.nom_ar} ${s.prenom_ar}` : `${s.nom_fr} ${s.prenom_fr}`;
                                            const field = getNoteField(s.statut);
                                            const noteVal = getNoteVal(s.etud_mod_id, field);
                                            const decision = getDecision(s.etud_mod_id, s.statut);
                                            const passed = computeDecision(noteVal);
                                            const isValid = isNoteValid(noteVal);
                                            return (
                                                <tr key={s.etud_mod_id} className={`group border-b border-slate-50 text-slate-600 transition-all duration-150 hover:bg-indigo-50/40 dark:border-slate-700/30 dark:text-slate-300 dark:hover:bg-indigo-900/10 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-800/50' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                                            {s.nexam ?? '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">{s.CNE}</span>
                                                    </td>
                                                    <td className={`px-5 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{sname}</span>
                                                            {s.statut !== 'normale' && (
                                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                                    s.statut === 'rattrapage' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                                                }`}>
                                                                    {s.statut === 'rattrapage' ? (isRTL ? 'استدراك' : 'Ratt.') : (isRTL ? 'نهائي' : 'Finale')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                value={noteVal}
                                                                onChange={(e) => {
                                                                    const v = e.target.value;
                                                                    if (v === '' || /^\d*\.?\d{0,1}$/.test(v)) handleNoteChange(s.etud_mod_id, field, v);
                                                                }}
                                                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                                                ref={(el) => { inputRefs.current[s.etud_mod_id] = el; }}
                                                                className={`w-20 rounded-lg border-2 px-2.5 py-1.5 text-center text-xs font-bold transition-all duration-150 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 ${noteInputBg(noteVal)}`}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        {decision ? (
                                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ${
                                                                passed === 'absent'
                                                                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-700'
                                                                    : passed === 'pass'
                                                                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700'
                                                                        : 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-700'
                                                            }`}>
                                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                    {passed === 'absent'
                                                                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
                            <div className={`flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 dark:border-slate-700 ${isRTL ? 'flex-row-reverse' : ''} bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30 dark:to-transparent`}>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        {locale === 'ar' ? `المعامل: ${mod.coefficient ?? '—'}` : `Coeff: ${mod.coefficient ?? '—'}`}
                                    </span>
                                    {mod.type_module && (
                                        <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            {mod.type_module}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {isDirty() && (
                                        <span className="animate-pulse text-xs font-medium text-amber-500">
                                            {locale === 'ar' ? 'تغييرات غير محفوظة' : 'Modifications non sauvegardées'}
                                        </span>
                                    )}
                                    <button onClick={handleSave} disabled={saving}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:from-indigo-700 hover:to-purple-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none">
                                        {saving ? (
                                            <>
                                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                {locale === 'ar' ? 'جارٍ الحفظ...' : 'Sauvegarde...'}
                                            </>
                                        ) : (
                                            <>
                                                <CheckIcon className="h-3.5 w-3.5" />
                                                {locale === 'ar' ? 'حفظ النقاط' : 'Enregistrer les notes'}
                                            </>
                                        )}
                                    </button>
                                </div>
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
