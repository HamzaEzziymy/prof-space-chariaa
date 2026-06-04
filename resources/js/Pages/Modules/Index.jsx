import AdminLayout from '@/Layouts/AdminLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
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
    module:    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    plus:      'M12 4v16m8-8H4',
    search:    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    edit:      'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:     'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    close:     'M6 18L18 6M6 6l12 12',
    check:     'M5 13l4 4L19 7',
    chevLeft:  'M15 19l-7-7 7-7',
    chevRight: 'M9 5l7 7-7 7',
    chevDown:  'M19 9l-7 7-7-7',
    empty:     'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    user:      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    students:  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    tag:       'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    filter:    'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    coef:      'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    upload:    'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    download:  'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    excel:     'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1v5h5M8 13h3m-3 4h3m2-4h3m-3 4h3',
    info:      'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warn:      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    form:      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

// ─── Type colour helpers ──────────────────────────────────────────────────────
const TYPE_META = {
    Fondamental: { pill: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', bar: 'bg-violet-400' },
    Optionnel:   { pill: 'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',  bar: 'bg-amber-400'  },
    Transversal: { pill: 'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300',    bar: 'bg-sky-400'    },
};
const defaultTypeMeta = { pill: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', bar: 'bg-slate-300 dark:bg-slate-600' };
const typeMeta  = (t) => TYPE_META[t] ?? defaultTypeMeta;
const typePill  = (t) => typeMeta(t).pill;
const typeBar   = (t) => typeMeta(t).bar;

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

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg   = flash?.success || flash?.error;
    const isErr = !!flash?.error;
    const map   = { module_created: t('moduleCreated'), module_updated: t('moduleUpdated'), module_deleted: t('moduleDeleted') };

    useEffect(() => {
        if (msg) { setVisible(true); const id = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(id); }
    }, [msg, flash]);

    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium animate-fade-in
            ${isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <Icon d={isErr ? ICONS.close : ICONS.check} className="h-4 w-4 shrink-0" />
            {map[msg] ?? msg}
        </div>
    );
}

// ─── Add method picker ────────────────────────────────────────────────────────
function AddMethodPicker({ onSelect, t, isRTL, locale, onClose }) {
    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
                <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden"
                    dir={isRTL ? 'rtl' : 'ltr'}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">
                                {locale === 'ar' ? 'اختر طريقة الإضافة' : 'Choisir la méthode d\'ajout'}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {locale === 'ar' ? 'يدوياً أو استيراد جماعي' : 'Saisie manuelle ou import en masse'}
                            </p>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            <Icon d={ICONS.close} className="h-4 w-4" />
                        </button>
                    </div>
                    {/* Options */}
                    <div className="p-4 space-y-3">
                        <button onClick={() => onSelect('form')}
                            className="group w-full flex items-center gap-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/10 transition-all">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition">
                                <Icon d={ICONS.form} className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-white text-sm">{t('addViaForm')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {locale === 'ar' ? 'أدخل بيانات الوحدة يدوياً' : 'Remplissez le formulaire champ par champ'}
                                </p>
                            </div>
                            <Icon d={ICONS.chevRight} className={`h-5 w-5 text-slate-300 dark:text-slate-600 ms-auto ${isRTL ? 'rotate-180' : ''}`} />
                        </button>

                        <button onClick={() => onSelect('excel')}
                            className="group w-full flex items-center gap-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 text-left hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/10 transition-all">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition">
                                <Icon d={ICONS.excel} className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-white text-sm">{t('addViaExcel')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {locale === 'ar' ? 'استورد عدة وحدات دفعة واحدة' : 'Importez plusieurs modules en une seule fois'}
                                </p>
                            </div>
                            <Icon d={ICONS.chevRight} className={`h-5 w-5 text-slate-300 dark:text-slate-600 ms-auto ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Excel import modal ───────────────────────────────────────────────────────
function ExcelImportModal({ onClose, onSuccess, t, isRTL, locale }) {
    const [file, setFile]         = useState(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus]     = useState('idle'); // idle | previewing | loading | done | error
    const [preview, setPreview]   = useState(null);  // { valid: [], invalid: [] }
    const [report, setReport]     = useState(null);  // post-submit report
    const fileInput               = useRef(null);

    const COLS = [
        { name: 'nom_fr',      req: true  },
        { name: 'nom_ar',      req: false },
        { name: 'code_module', req: true  },
        { name: 'coefficient', req: false },
        { name: 'type_module', req: false },
        { name: 'prof_id',     req: false },
    ];

    // ── Parse any file with SheetJS ───────────────────────────────────────
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

    // ── Validate parsed rows ───────────────────────────────────────────────
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
            if (!data['nom_fr'])      reasons.push(locale === 'ar' ? 'nom_fr مطلوب' : 'nom_fr requis');
            if (!data['code_module']) reasons.push(locale === 'ar' ? 'code_module مطلوب' : 'code_module requis');
            if (data['coefficient'] && isNaN(Number(data['coefficient'])))
                reasons.push(locale === 'ar' ? 'coefficient يجب أن يكون رقماً' : 'coefficient doit être un nombre');

            if (reasons.length === 0) valid.push({ lineNum, data });
            else                      invalid.push({ lineNum, data, reasons });
        });

        return { valid, invalid, header };
    };

    // ── Handle file selection ──────────────────────────────────────────────
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

    // ── Submit to backend ──────────────────────────────────────────────────
    const submit = async () => {
        if (!file) return;
        setStatus('loading');
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await window.axios.post(route('modules.import'), fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setReport(res.data);
            setStatus('done');
            const imported = res.data.imported ?? 0;
            const hasErrors = (res.data.rows ?? []).some(r => r.status === 'rejected');
            if (imported > 0 && !hasErrors) {
                // All rows succeeded — close modal and show toast
                router.reload({ only: ['modules', 'stats'] });
                setTimeout(() => {
                    onClose();
                    if (onSuccess) onSuccess(imported);
                }, 400);
            } else {
                // Partial success or all rejected — stay open so user sees the report
                if (imported > 0) {
                    router.reload({ only: ['modules', 'stats'] });
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
        const example = 'Mathématiques Appliquées,الرياضيات التطبيقية,MATH101,3,Fondamental,';
        const blob    = new Blob([header + '\n' + example], { type: 'text/csv;charset=utf-8;' });
        const url     = URL.createObjectURL(blob);
        const a       = document.createElement('a');
        a.href = url; a.download = 'modules_template.csv'; a.click();
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
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/20 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                                <Icon d={ICONS.upload} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{t('importTitle')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('importSubtitle')}</p>
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

                        {/* Drop zone — only show when no file yet */}
                        {!file && (
                            <div
                                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInput.current?.click()}
                                className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all
                                    ${dragging
                                        ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20'
                                        : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-emerald-500'
                                    }`}
                            >
                                <input ref={fileInput} type="file" accept=".csv,.xlsx,.xls,.ods,.tsv,.txt"
                                    className="hidden" onChange={e => handleFile(e.target.files[0])} />
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition">
                                    <Icon d={ICONS.upload} className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition" />
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
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10 px-4 py-3">
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

                        {/* ── Preview table (CSV client-side) ── */}
                        {hasPreview && status !== 'done' && (
                            <div className="space-y-3">
                                {/* Stats bar */}
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

                                {/* Valid rows table */}
                                {preview.valid.length > 0 && (
                                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 border-b border-emerald-200 dark:border-emerald-800">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                {locale === 'ar' ? `${preview.valid.length} وحدة ستُستورد` : `${preview.valid.length} module(s) à importer`}
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto max-h-48">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">#</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">nom_fr</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">nom_ar</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">code_module</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">type_module</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">coef</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preview.valid.map((row) => (
                                                        <tr key={row.lineNum} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10">
                                                            <td className="px-3 py-2 text-slate-400">{row.lineNum}</td>
                                                            <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200 max-w-[140px] truncate">{row.data['nom_fr'] || '—'}</td>
                                                            <td className="px-3 py-2 text-slate-500 max-w-[140px] truncate" dir="rtl">{row.data['nom_ar'] || '—'}</td>
                                                            <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">{row.data['code_module'] || '—'}</code></td>
                                                            <td className="px-3 py-2 text-slate-500">{row.data['type_module'] || '—'}</td>
                                                            <td className="px-3 py-2 text-slate-500">{row.data['coefficient'] || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Invalid rows table */}
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
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">nom_fr</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">code_module</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-red-500">{locale === 'ar' ? 'الأخطاء' : 'Erreurs'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preview.invalid.map((row) => (
                                                        <tr key={row.lineNum} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-red-50/40 dark:hover:bg-red-900/10">
                                                            <td className="px-3 py-2 text-slate-400">{row.lineNum}</td>
                                                            <td className="px-3 py-2 text-slate-500 max-w-[120px] truncate">{row.data['nom_fr'] || '—'}</td>
                                                            <td className="px-3 py-2 text-slate-500">{row.data['code_module'] || '—'}</td>
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

                        {/* ── Post-submit report ── */}
                        {status === 'done' && report && (
                            <div className="space-y-4">
                                {/* Summary bar */}
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

                                {/* Rejection report table */}
                                {report.rows?.filter(r => r.status === 'rejected').length > 0 && (
                                    <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
                                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 border-b border-red-200 dark:border-red-800">
                                            <Icon d={ICONS.warn} className="h-4 w-4 text-red-500" />
                                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                                {locale === 'ar' ? 'تقرير الأخطاء' : 'Rapport des rejets'}
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto max-h-52">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">{locale === 'ar' ? 'السطر' : 'Ligne'}</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">code_module</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">nom_fr</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-red-500">{locale === 'ar' ? 'السبب' : 'Raison'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.rows.filter(r => r.status === 'rejected').map((row, i) => (
                                                        <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-red-50/30 dark:hover:bg-red-900/10">
                                                            <td className="px-3 py-2 text-slate-400 font-mono">{row.line}</td>
                                                            <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 font-bold text-slate-600 dark:text-slate-300">{row.code_module || '—'}</code></td>
                                                            <td className="px-3 py-2 text-slate-500 max-w-[140px] truncate">{row.nom_fr || '—'}</td>
                                                            <td className="px-3 py-2 text-red-500 dark:text-red-400">{row.reason}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* All good */}
                                {(!report.rows || report.rows.filter(r => r.status === 'rejected').length === 0) && report.imported > 0 && (
                                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-4 py-3">
                                        <Icon d={ICONS.check} className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                            {locale === 'ar' ? 'تم استيراد جميع الوحدات بنجاح' : 'Tous les modules ont été importés avec succès'}
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
                            <Icon d={ICONS.download} className="h-4 w-4 text-emerald-500" />
                            {t('importTemplate')}
                        </button>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {status === 'done' ? (
                                <button type="button" onClick={onClose}
                                    className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
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
                                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition">
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

// ─── Form modal (create / edit) ───────────────────────────────────────────────
function ModuleFormModal({ mode, module, profs, onClose, t, isRTL, locale }) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nom_fr:      module?.nom_fr      ?? '',
        nom_ar:      module?.nom_ar      ?? '',
        code_module: module?.code_module ?? '',
        coefficient: module?.coefficient ?? '',
        type_module: module?.type_module ?? '',
        prof_id:     module?.prof_id     ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        isEdit ? put(route('modules.update', module.id), opts) : post(route('modules.store'), opts);
    };

    const TYPE_OPTS = [
        { fr: 'Fondamental', ar: 'أساسية',   meta: TYPE_META.Fondamental },
        { fr: 'Optionnel',   ar: 'اختيارية', meta: TYPE_META.Optionnel   },
        { fr: 'Transversal', ar: 'عرضية',    meta: TYPE_META.Transversal },
    ];

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isEdit ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-violet-100 dark:bg-violet-900/40'}`}>
                            <Icon d={isEdit ? ICONS.edit : ICONS.module}
                                className={`h-5 w-5 ${isEdit ? 'text-indigo-600 dark:text-indigo-400' : 'text-violet-600 dark:text-violet-400'}`} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                                {isEdit ? t('editModule') : t('addModule')}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isEdit
                                    ? (locale === 'ar' ? 'تعديل بيانات الوحدة' : 'Modifier les informations du module')
                                    : (locale === 'ar' ? 'إضافة وحدة دراسية جديدة' : 'Créer un nouveau module')}
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

                        {/* Names */}
                        <div className="space-y-3">
                            <SectionDivider emoji="📝" label={locale === 'ar' ? 'الاسم' : 'Désignation'} />
                            <Field id="nom_fr" label={t('moduleNameFr')} value={data.nom_fr}
                                onChange={e => setData('nom_fr', e.target.value)}
                                placeholder={locale === 'ar' ? 'مثال: Mathématiques' : 'Ex: Mathématiques Appliquées'}
                                required error={errors.nom_fr} dir="ltr" />
                            <Field id="nom_ar" label={t('moduleNameAr')} value={data.nom_ar}
                                onChange={e => setData('nom_ar', e.target.value)}
                                placeholder="مثال: الرياضيات التطبيقية"
                                error={errors.nom_ar} dir="rtl" />
                        </div>

                        {/* Code + Coeff */}
                        <div className="space-y-3">
                            <SectionDivider emoji="🏷️" label={locale === 'ar' ? 'التعريف' : 'Identification'} />
                            <div className="grid grid-cols-2 gap-3">
                                <Field id="code_module" label={t('moduleCode')} value={data.code_module}
                                    onChange={e => setData('code_module', e.target.value)}
                                    placeholder="MATH101" required
                                    hint={t('moduleCodeHint')} error={errors.code_module} dir="ltr" />
                                <Field id="coefficient" type="number" label={t('moduleCoefficient')}
                                    value={data.coefficient}
                                    onChange={e => setData('coefficient', e.target.value)}
                                    placeholder="2" hint={t('moduleCoefficientHint')} error={errors.coefficient} />
                            </div>
                        </div>

                        {/* Type — visual card picker */}
                        <div className="space-y-3">
                            <SectionDivider emoji="📋" label={locale === 'ar' ? 'النوع' : 'Type'} />
                            <div className="grid grid-cols-3 gap-2">
                                {TYPE_OPTS.map(opt => {
                                    const active = data.type_module === opt.fr;
                                    return (
                                        <button key={opt.fr} type="button"
                                            onClick={() => setData('type_module', active ? '' : opt.fr)}
                                            className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center transition-all
                                                ${active
                                                    ? `${opt.meta.pill} border-current`
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                                                }`}>
                                            {active && (
                                                <span className="absolute end-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-current/20">
                                                    <Icon d={ICONS.check} className="h-2.5 w-2.5" />
                                                </span>
                                            )}
                                            <span className={`text-xs font-semibold ${active ? '' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {locale === 'ar' ? opt.ar : opt.fr}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Also a none option */}
                            {data.type_module && (
                                <button type="button" onClick={() => setData('type_module', '')}
                                    className="text-xs text-slate-400 hover:text-red-500 transition">
                                    ✕ {locale === 'ar' ? 'إزالة النوع' : 'Retirer le type'}
                                </button>
                            )}
                        </div>

                        {/* Professor */}
                        <div className="space-y-3">
                            <SectionDivider emoji="👨‍🏫" label={locale === 'ar' ? 'الأستاذ' : 'Professeur'} />
                            <SelectField id="prof_id" label={t('moduleProfessor')} value={data.prof_id}
                                onChange={e => setData('prof_id', e.target.value)}
                                hint={t('moduleProfessorHint')} error={errors.prof_id}>
                                <option value="">{locale === 'ar' ? '— بدون أستاذ —' : '— Sans professeur —'}</option>
                                {profs.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {locale === 'ar' ? (p.nom_ar || p.nom_fr) : p.nom_fr}
                                    </option>
                                ))}
                            </SelectField>
                        </div>

                        {/* Live preview card */}
                        {(data.nom_fr || data.code_module) && (
                            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                    {locale === 'ar' ? 'معاينة' : 'Aperçu'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                                        <Icon d={ICONS.module} className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                            {locale === 'ar' ? (data.nom_ar || data.nom_fr || '—') : (data.nom_fr || '—')}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                            {data.code_module && (
                                                <code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                    {data.code_module}
                                                </code>
                                            )}
                                            {data.coefficient && (
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500">× {data.coefficient}</span>
                                            )}
                                            {data.type_module && (
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typePill(data.type_module)}`}>
                                                    {data.type_module}
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
                                ${isEdit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-violet-600 hover:bg-violet-700'}`}>
                            {processing
                                ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                : <Icon d={isEdit ? ICONS.check : ICONS.plus} className="h-4 w-4" />
                            }
                            {processing ? '...' : (isEdit ? t('save') : t('addModule'))}
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </>
    );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteModal({ module, onClose, t, isRTL, locale }) {
    const { delete: destroy, processing } = useForm();
    const name = locale === 'ar' ? (module.nom_ar || module.nom_fr) : (module.nom_fr || module.code_module);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-800 overflow-hidden"
                dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="px-6 pt-6 pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <Icon d={ICONS.trash} className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t('confirmDeleteModule')}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('confirmDeleteModuleMsg')}</p>
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <Icon d={ICONS.module} className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name}</p>
                            <p className="text-xs text-slate-400">{module.code_module}</p>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700 px-6 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button onClick={onClose}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                        {t('cancel')}
                    </button>
                    <form onSubmit={e => { e.preventDefault(); destroy(route('modules.destroy', module.id), { onSuccess: onClose }); }}>
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

// ─── Module card ──────────────────────────────────────────────────────────────
function ModuleCard({ module, onEdit, onDelete, t, locale }) {
    const name = locale === 'ar' ? (module.nom_ar || module.nom_fr || '—') : (module.nom_fr || '—');
    const nameAlt = locale === 'ar' ? module.nom_fr : module.nom_ar;
    const prof = module.prof?.user;
    const profName = prof
        ? (locale === 'ar'
            ? `${prof.prenom_ar ?? ''} ${prof.nom_ar ?? ''}`.trim() || `${prof.prenom_fr ?? ''} ${prof.nom_fr ?? ''}`.trim()
            : `${prof.prenom_fr ?? ''} ${prof.nom_fr ?? ''}`.trim())
        : null;

    return (
        <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
            {/* Colour stripe */}
            <div className={`h-1 w-full ${typeBar(module.type_module)}`} />

            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/30">
                            <Icon d={ICONS.module} className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                        </div>
                        <code className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-wide">
                            {module.code_module || '—'}
                        </code>
                    </div>
                    {module.type_module && (
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 ${typePill(module.type_module)}`}>
                            {module.type_module}
                        </span>
                    )}
                </div>

                {/* Name */}
                <div className="min-h-[2.5rem]">
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight line-clamp-2">{name}</p>
                    {nameAlt && (
                        <p className="mt-0.5 text-xs text-slate-400 truncate" dir={locale === 'ar' ? 'ltr' : 'rtl'}>{nameAlt}</p>
                    )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {module.coefficient != null && module.coefficient !== '' && (
                        <span className="flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 px-2 py-1">
                            <Icon d={ICONS.coef} className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{module.coefficient}</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 px-2 py-1 flex-1">
                        <Icon d={ICONS.students} className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{module.etudiants_count ?? 0}</span>
                        <span className="truncate">{t('studentsCount')}</span>
                    </span>
                </div>

                {/* Prof */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-h-[1.25rem]">
                    <Icon d={ICONS.user} className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{profName || <em className="not-italic text-slate-300 dark:text-slate-600">{t('noProfessorAssigned')}</em>}</span>
                </div>
            </div>

            {/* Actions footer */}
            <div className="flex border-t border-slate-100 dark:border-slate-700/60">
                <button onClick={() => onEdit(module)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition border-e border-slate-100 dark:border-slate-700/60">
                    <Icon d={ICONS.edit} className="h-3.5 w-3.5" />{t('edit')}
                </button>
                <button onClick={() => onDelete(module)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition">
                    <Icon d={ICONS.trash} className="h-3.5 w-3.5" />{t('delete')}
                </button>
            </div>
        </div>
    );
}

// ─── Table row ────────────────────────────────────────────────────────────────
function ModuleRow({ module, onEdit, onDelete, t, locale }) {
    const name = locale === 'ar' ? (module.nom_ar || module.nom_fr || '—') : (module.nom_fr || '—');
    const nameAlt = locale === 'ar' ? module.nom_fr : module.nom_ar;
    const prof = module.prof?.user;
    const profName = prof
        ? (locale === 'ar'
            ? `${prof.prenom_ar ?? ''} ${prof.nom_ar ?? ''}`.trim() || `${prof.prenom_fr ?? ''} ${prof.nom_fr ?? ''}`.trim()
            : `${prof.prenom_fr ?? ''} ${prof.nom_fr ?? ''}`.trim())
        : null;

    return (
        <tr className="group border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-1 rounded-full shrink-0 ${typeBar(module.type_module)}`} />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{name}</p>
                        {nameAlt && <p className="text-xs text-slate-400 truncate" dir={locale === 'ar' ? 'ltr' : 'rtl'}>{nameAlt}</p>}
                    </div>
                </div>
            </td>
            <td className="px-5 py-3.5">
                <code className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2.5 py-1 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {module.code_module || '—'}
                </code>
            </td>
            <td className="px-5 py-3.5">
                {module.type_module
                    ? <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${typePill(module.type_module)}`}>{module.type_module}</span>
                    : <span className="text-xs italic text-slate-300 dark:text-slate-600">{t('noType')}</span>}
            </td>
            <td className="px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {module.coefficient || <span className="text-slate-300 dark:text-slate-600">—</span>}
            </td>
            <td className="px-5 py-3.5">
                <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <Icon d={ICONS.students} className="h-3.5 w-3.5 text-slate-400" />
                    {module.etudiants_count ?? 0}
                </span>
            </td>
            <td className="px-5 py-3.5">
                {profName
                    ? <span className="text-sm text-slate-700 dark:text-slate-200">{profName}</span>
                    : <span className="text-xs italic text-slate-300 dark:text-slate-600">{t('noProfessorAssigned')}</span>}
            </td>
            <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(module)} title={t('edit')}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition">
                        <Icon d={ICONS.edit} className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(module)} title={t('delete')}
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
                <Icon d={hasFilter ? ICONS.empty : ICONS.module} className="h-9 w-9 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {hasFilter ? (locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat') : t('noModules')}
            </p>
            <p className="mt-1 text-sm text-slate-400 max-w-xs">
                {hasFilter
                    ? (locale === 'ar' ? 'جرّب تعديل البحث أو الفلتر' : 'Essayez de modifier votre recherche')
                    : (locale === 'ar' ? 'ابدأ بإضافة أول وحدة دراسية' : 'Commencez par créer votre premier module')}
            </p>
            {!hasFilter && (
                <button onClick={onAdd}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition shadow-sm">
                    <Icon d={ICONS.plus} className="h-4 w-4" />{t('addModule')}
                </button>
            )}
        </div>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, colorClass, iconPath }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                <Icon d={iconPath} className="h-5 w-5" />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function ModulesContent({ modules, profs, types, filters, stats }) {
    const { t, locale, isRTL } = useLanguage();
    const { flash } = usePage().props;

    const [modal, setModal]           = useState(null); // null | {type:'picker'|'form'|'excel'|'edit'|'delete', ...}
    const [search, setSearch]         = useState(filters?.search ?? '');
    const [typeFilter, setTypeFilter] = useState(filters?.type ?? '');
    const [viewMode, setViewMode]     = useViewMode('modules_view', 'grid');
    const [importToast, setImportToast] = useState(null); // { count: number } | null
    const searchTimeout               = useRef(null);

    const doSearch = (val, tf = typeFilter) => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() =>
            router.get(route('modules.index'), { search: val, type: tf }, { preserveState: true, replace: true }), 320);
    };

    const handleSearch = (val) => { setSearch(val); doSearch(val); };
    const handleType   = (val) => { setTypeFilter(val); doSearch(search, val); };

    const items     = modules?.data ?? [];
    const hasFilter = !!(search || typeFilter);

    const statCards = [
        { label: t('totalModulesStat'),  value: stats.total,        colorClass: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', iconPath: ICONS.module   },
        { label: t('modulesWithProf'),   value: stats.withProf,     colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', iconPath: ICONS.user  },
        { label: t('modulesWithStudents'), value: stats.withStudents, colorClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', iconPath: ICONS.students            },
        { label: locale === 'ar' ? 'أنواع الوحدات' : 'Types distincts', value: stats.types, colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', iconPath: ICONS.tag },
    ];

    return (
        <>
            <Head title={t('modulesManagement')} />
            <Toast flash={flash} t={t} />

            {/* ── Import success toast ── */}
            {importToast && (
                <div className="fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 shadow-xl text-sm font-medium text-white animate-fade-in">
                    <Icon d={ICONS.check} className="h-4 w-4 shrink-0" />
                    {locale === 'ar'
                        ? `تم استيراد ${importToast.count} وحدة بنجاح`
                        : `${importToast.count} module(s) importé(s) avec succès`}
                </div>
            )}

            {/* ── Modals ── */}
            {modal?.type === 'picker' && (
                <AddMethodPicker
                    onSelect={method => setModal({ type: method === 'form' ? 'form' : 'excel' })}
                    onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale}
                />
            )}
            {modal?.type === 'form' && (
                <ModuleFormModal mode="create" profs={profs} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}
            {modal?.type === 'excel' && (
                <ExcelImportModal
                    onClose={() => setModal(null)}
                    onSuccess={(count) => {
                        setImportToast({ count });
                        setTimeout(() => setImportToast(null), 4000);
                    }}
                    t={t} isRTL={isRTL} locale={locale}
                />
            )}
            {modal?.type === 'edit' && (
                <ModuleFormModal mode="edit" module={modal.module} profs={profs} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}
            {modal?.type === 'delete' && (
                <DeleteModal module={modal.module} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}

            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* ── Header ── */}
                <div className={`flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                        <h1 className="flex items-center gap-2.5 text-xl font-bold text-slate-800 dark:text-white">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <Icon d={ICONS.module} className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </span>
                            {t('modulesManagement')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {locale === 'ar' ? 'إدارة الوحدات الدراسية والأساتذة المسؤولين' : 'Gérez les modules et les professeurs responsables'}
                        </p>
                    </div>

                    {/* Split "Add" button with dropdown */}
                    <div className="flex items-center gap-2">
                        {/* Quick form button */}
                        <button onClick={() => setModal({ type: 'form' })}
                            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 active:scale-95 transition">
                            <Icon d={ICONS.plus} className="h-4 w-4" />
                            {t('addModule')}
                        </button>
                        {/* Excel import button */}
                        <button onClick={() => setModal({ type: 'excel' })}
                            title={t('addViaExcel')}
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
                            placeholder={t('searchModules')}
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

                    {/* Type filter */}
                    <div className="relative">
                        <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'end-3' : 'start-3'} flex items-center text-slate-400`}>
                            <Icon d={ICONS.filter} className="h-4 w-4" />
                        </span>
                        <select value={typeFilter} onChange={e => handleType(e.target.value)}
                            className={`appearance-none rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-700 shadow-sm transition
                                focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                                ${isRTL ? 'ps-8 pe-9' : 'ps-9 pe-8'}`}>
                            <option value="">{t('allTypes')}</option>
                            {types.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'start-3' : 'end-3'} flex items-center text-slate-400`}>
                            <Icon d={ICONS.chevDown} className="h-4 w-4" />
                        </span>
                    </div>

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

                {/* ── Active filters chips ── */}
                {hasFilter && (
                    <div className={`flex flex-wrap items-center gap-2 -mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs text-slate-400">{locale === 'ar' ? 'الفلاتر:' : 'Filtres :'}</span>
                        {search && (
                            <span className="flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                "{search}"
                                <button onClick={() => handleSearch('')} className="ms-1 hover:text-red-500"><Icon d={ICONS.close} className="h-3 w-3" /></button>
                            </span>
                        )}
                        {typeFilter && (
                            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${typePill(typeFilter)}`}>
                                {typeFilter}
                                <button onClick={() => handleType('')} className="ms-1 hover:text-red-500"><Icon d={ICONS.close} className="h-3 w-3" /></button>
                            </span>
                        )}
                        <button onClick={() => { handleSearch(''); handleType(''); }} className="text-xs text-slate-400 hover:text-red-400 transition">
                            {locale === 'ar' ? 'مسح الكل' : 'Tout effacer'}
                        </button>
                    </div>
                )}

                {/* ── Content ── */}
                {items.length === 0 ? (
                    <EmptyState hasFilter={hasFilter} onAdd={() => setModal({ type: 'picker' })} t={t} locale={locale} />
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map(m => (
                            <ModuleCard key={m.id} module={m} locale={locale} t={t}
                                onEdit={mod => setModal({ type: 'edit', module: mod })}
                                onDelete={mod => setModal({ type: 'delete', module: mod })}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                        {['name','code','type','coefficient','students','professor','actions'].map(col => (
                                            <th key={col}
                                                className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400
                                                    ${col === 'actions' ? 'text-end' : (isRTL ? 'text-right' : 'text-left')}`}>
                                                {t(col === 'coefficient' ? 'moduleCoefficient' : col === 'professor' ? 'moduleProfessor' : col)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(m => (
                                        <ModuleRow key={m.id} module={m} locale={locale} t={t}
                                            onEdit={mod => setModal({ type: 'edit', module: mod })}
                                            onDelete={mod => setModal({ type: 'delete', module: mod })}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Pagination ── */}
                {items.length > 0 && <Pagination meta={modules?.meta ?? modules} isRTL={isRTL} t={t} />}
            </div>
        </>
    );
}

// ─── Page root ────────────────────────────────────────────────────────────────
export default function ModulesIndex({ modules, profs, types, filters, stats }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <ModulesContent modules={modules} profs={profs} types={types} filters={filters} stats={stats} />
            </AdminLayout>
        </LanguageProvider>
    );
}
