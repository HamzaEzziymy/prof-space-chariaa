import AdminLayout from '@/Layouts/AdminLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowDownTrayIcon,
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowUpTrayIcon,
    Bars3Icon,
    Bars3BottomLeftIcon,
    BookOpenIcon,
    CalculatorIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    Squares2X2Icon,
    TableCellsIcon,
    TagIcon,
    TrashIcon,
    UserGroupIcon,
    UserIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

// ─── Icon helper ──────────────────────────────────────────────────────────────
function Icon({ icon: IconComponent, className = 'w-5 h-5' }) {
    return IconComponent ? <IconComponent className={className} aria-hidden="true" /> : null;
}

const ICONS = {
    module: BookOpenIcon,
    plus: PlusIcon,
    search: MagnifyingGlassIcon,
    edit: PencilIcon,
    trash: TrashIcon,
    close: XMarkIcon,
    check: CheckIcon,
    chevLeft: ChevronLeftIcon,
    chevRight: ChevronRightIcon,
    chevDown: ChevronDownIcon,
    empty: BookOpenIcon,
    user: UserIcon,
    students: UserGroupIcon,
    tag: TagIcon,
    filter: FunnelIcon,
    coef: CalculatorIcon,
    upload: ArrowUpTrayIcon,
    download: ArrowDownTrayIcon,
    excel: TableCellsIcon,
    info: InformationCircleIcon,
    warn: ExclamationTriangleIcon,
    form: DocumentTextIcon,
    back: ArrowLeftIcon,
    grip: Bars3Icon,
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
                    <ExclamationTriangleIcon className="h-3 w-3 shrink-0" />
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
                    <Icon icon={ICONS.chevDown} className="h-4 w-4" />
                </span>
            </div>
            {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
            {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                    <ExclamationTriangleIcon className="h-3 w-3 shrink-0" />
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
            <Icon icon={isErr ? ICONS.close : ICONS.check} className="h-4 w-4 shrink-0" />
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
                            <Icon icon={ICONS.close} className="h-4 w-4" />
                        </button>
                    </div>
                    {/* Options */}
                    <div className="p-4 space-y-3">
                        <button onClick={() => onSelect('form')}
                            className="group w-full flex items-center gap-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/10 transition-all">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition">
                                <Icon icon={ICONS.form} className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-white text-sm">{t('addViaForm')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {locale === 'ar' ? 'أدخل بيانات الوحدة يدوياً' : 'Remplissez le formulaire champ par champ'}
                                </p>
                            </div>
                            <Icon icon={ICONS.chevRight} className={`h-5 w-5 text-slate-300 dark:text-slate-600 ms-auto ${isRTL ? 'rotate-180' : ''}`} />
                        </button>

                        <button onClick={() => onSelect('excel')}
                            className="group w-full flex items-center gap-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 text-left hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/10 transition-all">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition">
                                <Icon icon={ICONS.excel} className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-white text-sm">{t('addViaExcel')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {locale === 'ar' ? 'استورد عدة وحدات دفعة واحدة' : 'Importez plusieurs modules en une seule fois'}
                                </p>
                            </div>
                            <Icon icon={ICONS.chevRight} className={`h-5 w-5 text-slate-300 dark:text-slate-600 ms-auto ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Excel import modal ───────────────────────────────────────────────────────
function ExcelImportModal({ onClose, onSuccess, t, isRTL, locale, semestres }) {
    const [file, setFile]         = useState(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus]     = useState('idle'); // idle | previewing | loading | done | error
    const [preview, setPreview]   = useState(null);  // { valid: [], invalid: [] }
    const [report, setReport]     = useState(null);  // post-submit report
    const [semestreId, setSemestreId] = useState('');
    const fileInput               = useRef(null);

    const COLS = [
        { name: 'nom_fr',        req: true  },
        { name: 'nom_ar',        req: false },
        { name: 'code_module',   req: true  },
        { name: 'coefficient',   req: false },
        { name: 'type_module',   req: false },
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
            if (semestreId) fd.append('semestre_id', semestreId);
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
        const example = {
            nom_fr: 'Mathématiques Appliquées', nom_ar: 'الرياضيات التطبيقية',
            code_module: 'MATH101', coefficient: 3, type_module: 'Fondamental',
        };
        const ws = XLSX.utils.json_to_sheet([example], { header: COLS.map(c => c.name) });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Modules');
        const colWidths = COLS.map(() => ({ wch: 22 }));
        ws['!cols'] = colWidths;
        const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'modules_template.xlsx'; a.click();
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
                                <Icon icon={ICONS.upload} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{t('importTitle')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('importSubtitle')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 transition">
                            <Icon icon={ICONS.close} className="h-5 w-5" />
                        </button>
                    </div>

                    {/* ── Scrollable body ── */}
                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                        {/* Column schema */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                                <Icon icon={ICONS.info} className="h-4 w-4 text-slate-400" />
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

                        {/* Semestre selector */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {locale === 'ar' ? 'الفصل الدراسي' : 'Semestre'}
                            </label>
                            <select value={semestreId} onChange={e => setSemestreId(e.target.value)}
                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-white shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500">
                                <option value="">{locale === 'ar' ? '— اختر الفصل —' : '— Choisir un semestre —'}</option>
                                {semestres.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.code} — {s.niveau?.nom_fr || s.niveau?.code || ''}{s.niveau?.filiere ? ` (${s.niveau.filiere.code})` : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-400">
                                {locale === 'ar' ? 'سيتم تعيين هذا الفصل لجميع الوحدات المستوردة' : 'Ce semestre sera attribué à tous les modules importés'}
                            </p>
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
                                    <Icon icon={ICONS.upload} className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition" />
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
                                    <Icon icon={ICONS.close} className="h-3.5 w-3.5" />
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
                                            <Icon icon={ICONS.warn} className="h-4 w-4 text-red-500" />
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
                                        <Icon icon={ICONS.check} className="h-5 w-5 text-emerald-500 shrink-0" />
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
                                <Icon icon={ICONS.warn} className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
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
                            <Icon icon={ICONS.download} className="h-4 w-4 text-emerald-500" />
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
                                            <><ArrowPathIcon className="h-4 w-4 animate-spin" />{t('importProcessing')}</>
                                        ) : (
                                            <><Icon icon={ICONS.upload} className="h-4 w-4" />{t('importStart')}</>
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
function ModuleFormModal({ mode, module, semestres, onClose, t, isRTL, locale }) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nom_fr:      module?.nom_fr      ?? '',
        nom_ar:      module?.nom_ar      ?? '',
        code_module: module?.code_module ?? '',
        coefficient: module?.coefficient ?? '',
        type_module: module?.type_module ?? '',
        semestre_id: module?.semestre_id ?? '',
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
                            <Icon icon={isEdit ? ICONS.edit : ICONS.module}
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
                        <Icon icon={ICONS.close} className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                        {/* Names */}
                        <div className="space-y-3">
                            <SectionDivider emoji="📝" label={locale === 'ar' ? 'الاسم' : 'Désignation'} />
                            <Field id="nom_fr" label={t('moduleNameFr')} value={data.nom_fr}
                                onChange={e => setData('nom_fr', e.target.value)}
                                placeholder={locale === 'ar' ? 'ex: اسم الوحدة' : 'ex: Nom du module'}
                                required error={errors.nom_fr} dir="ltr" />
                            <Field id="nom_ar" label={t('moduleNameAr')} value={data.nom_ar}
                                onChange={e => setData('nom_ar', e.target.value)}
                                placeholder="ex: اسم الوحدة"
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
                                                    <Icon icon={ICONS.check} className="h-2.5 w-2.5" />
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
                        {/* Semestre */}
                        <div className="space-y-3">
                            <SectionDivider emoji="📚" label={locale === 'ar' ? 'الفصل' : 'Semestre'} />
                            <SelectField id="semestre_id" label={locale === 'ar' ? 'الفصل الدراسي' : 'Semestre'} value={data.semestre_id}
                                onChange={e => setData('semestre_id', e.target.value)} error={errors.semestre_id}>
                                <option value="">{locale === 'ar' ? '— بدون فصل —' : '— Sans semestre —'}</option>
                                {semestres.map(s => {
                                    const niveauName = locale === 'ar'
                                        ? (s.niveau?.nom_ar || s.niveau?.nom_fr || '')
                                        : (s.niveau?.nom_fr || s.niveau?.nom_ar || '');
                                    const filiereCode = s.niveau?.filiere?.code || '';
                                    const suffix = niveauName ? (filiereCode ? ` — ${niveauName} (${filiereCode})` : ` — ${niveauName}`) : '';
                                    return (
                                        <option key={s.id} value={s.id}>
                                            {s.code} — {locale === 'ar' ? (s.nom_ar || s.nom_fr) : (s.nom_fr || s.nom_ar)}{suffix}
                                        </option>
                                    );
                                })}
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
                                        <Icon icon={ICONS.module} className="h-4 w-4 text-violet-500 dark:text-violet-400" />
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
                                ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                : <Icon icon={isEdit ? ICONS.check : ICONS.plus} className="h-4 w-4" />
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
                        <Icon icon={ICONS.trash} className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t('confirmDeleteModule')}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('confirmDeleteModuleMsg')}</p>
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <Icon icon={ICONS.module} className="h-4 w-4 text-violet-500 dark:text-violet-400" />
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

// ─── Export modal ──────────────────────────────────────────────────────────────
function ExportModal({ onClose, t, isRTL, locale, semestres, types, filters }) {
    const EXPORT_FIELDS = [
        { key: 'nom_fr',         label_fr: 'Nom (fr)',              label_ar: 'الاسم (فر)' },
        { key: 'nom_ar',         label_fr: 'Nom (ar)',              label_ar: 'الاسم (ع)' },
        { key: 'code_module',    label_fr: 'Code module',           label_ar: 'رمز الوحدة' },
        { key: 'coefficient',    label_fr: 'Coefficient',           label_ar: 'المعامل' },
        { key: 'type_module',    label_fr: 'Type de module',        label_ar: 'النوع' },
        { key: 'semestre_code',  label_fr: 'Semestre',              label_ar: 'الفصل' },
        { key: 'niveau',         label_fr: 'Niveau',                label_ar: 'المستوى' },
        { key: 'filiere_code',   label_fr: 'Code filière',          label_ar: 'رمز الشعبة' },
        { key: 'etudiants_count',label_fr: 'Étudiants inscrits',    label_ar: 'الطلاب المسجلين' },
    ];

    const [selectedFields, setSelectedFields] = useState([
        'nom_fr', 'nom_ar', 'code_module', 'coefficient', 'type_module', 'semestre_code',
    ]);
    const [format, setFormat] = useState('xlsx');
    const [loading, setLoading] = useState(false);

    const [fSearch, setFSearch]            = useState(filters?.search ?? '');
    const [fType, setFType]                = useState(filters?.type ?? '');
    const [fSemestreId, setFSemestreId]    = useState(filters?.semestre_id ?? '');
    const dragIdx = useRef(null);

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
            if (fSearch)     params.search = fSearch;
            if (fType)       params.type = fType;
            if (fSemestreId) params.semestre_id = fSemestreId;
            const res = await window.axios.post(route('modules.export'), params);
            const data = res.data;

            if (format === 'xlsx') {
                const ws = XLSX.utils.json_to_sheet(data);
                const colWidths = selectedFields.map(k => ({
                    wch: Math.min(40, Math.max((fieldLabel(k) || k).length, ...data.map(r => String(r[k] || '').length)) + 3),
                }));
                ws['!cols'] = colWidths;
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Modules');
                XLSX.writeFile(wb, 'modules_export.xlsx');
            } else {
                const ws = XLSX.utils.json_to_sheet(data);
                const csv = XLSX.utils.sheet_to_csv(ws);
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'modules_export.csv'; a.click();
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
                                <Icon icon={ICONS.download} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{t('exportTitleModules')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('exportSubtitleModules')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 transition">
                            <Icon icon={ICONS.close} className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                        {/* Filters */}
                        <div>
                            <SectionDivider emoji="🔍" label={locale === 'ar' ? 'تصفية الوحدات' : 'Filtrer les modules'} />
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div className="relative">
                                    <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'end-3' : 'start-3'} flex items-center text-slate-400`}>
                                        <Icon icon={ICONS.search} className="h-4 w-4" />
                                    </span>
                                    <input type="text" value={fSearch} onChange={e => setFSearch(e.target.value)}
                                        placeholder={t('searchModules')}
                                        className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white ${isRTL ? 'pe-10 ps-3' : 'ps-10 pe-3'}`} />
                                </div>
                                <select value={fType} onChange={e => setFType(e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    <option value="">{t('allTypes')}</option>
                                    {(types || []).map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                                <select value={fSemestreId} onChange={e => setFSemestreId(e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    <option value="">{locale === 'ar' ? 'جميع الفصول' : 'Tous les semestres'}</option>
                                    {semestres?.map(s => {
                                        const filiereCode = s.niveau?.filiere?.code || '';
                                        const niveauCode = s.niveau?.code || '';
                                        const suffix = niveauCode ? (filiereCode ? ` — ${niveauCode} (${filiereCode})` : ` (${niveauCode})`) : '';
                                        return (
                                            <option key={s.id} value={s.id}>
                                                {s.code} — {locale === 'ar' ? (s.nom_ar || s.nom_fr) : (s.nom_fr || s.nom_ar)}{suffix}
                                            </option>
                                        );
                                    })}
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
                                                <span className="text-slate-400"><Icon icon={ICONS.grip} className="h-4 w-4" /></span>
                                                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{fieldLabel(key)}</span>
                                                <code className="text-[10px] text-slate-400 font-mono hidden sm:inline">{key}</code>
                                                <button onClick={() => moveUp(idx)} disabled={idx === 0}
                                                    className="rounded-lg p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-indigo-900/30 transition">
                                                    <Icon icon={ICONS.chevLeft} className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => moveDown(idx)} disabled={idx === selectedFields.length - 1}
                                                    className="rounded-lg p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-indigo-900/30 transition">
                                                    <Icon icon={ICONS.chevRight} className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => setSelectedFields(prev => prev.filter(k => k !== key))}
                                                    className="rounded-lg p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                                    <Icon icon={ICONS.close} className="h-3.5 w-3.5" />
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
                                                <Icon icon={ICONS.plus} className="h-3 w-3" />
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
                                        <Icon icon={opt.icon} className="h-4 w-4" />
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
                                <><ArrowPathIcon className="h-4 w-4 animate-spin" />...</>
                            ) : (
                                <><Icon icon={ICONS.download} className="h-4 w-4" />{t('exportDownload')}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Module card ──────────────────────────────────────────────────────────────
function ModuleCard({ module, onEdit, onDelete, t, locale }) {
    const name = locale === 'ar' ? (module.nom_ar || module.nom_fr || '—') : (module.nom_fr || '—');
    const nameAlt = locale === 'ar' ? module.nom_fr : module.nom_ar;

    return (
        <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
            {/* Colour stripe */}
            <div className={`h-1 w-full ${typeBar(module.type_module)}`} />

            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/30">
                            <Icon icon={ICONS.module} className="h-4 w-4 text-violet-500 dark:text-violet-400" />
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
                            <Icon icon={ICONS.coef} className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{module.coefficient}</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 px-2 py-1 flex-1">
                        <Icon icon={ICONS.students} className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{module.etudiants_count ?? 0}</span>
                        <span className="truncate">{t('studentsCount')}</span>
                    </span>
                </div>

                {/* Semestre */}
                {module.semestre && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Icon icon={ICONS.tag} className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <span className="truncate">
                            {module.semestre.code}
                            {module.semestre.niveau ? ` · ${locale === 'ar' ? (module.semestre.niveau.nom_ar || module.semestre.niveau.nom_fr) : (module.semestre.niveau.nom_fr || module.semestre.niveau.nom_ar)}` : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Actions footer */}
            <div className="flex border-t border-slate-100 dark:border-slate-700/60">
                <button onClick={() => onEdit(module)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition border-e border-slate-100 dark:border-slate-700/60">
                    <Icon icon={ICONS.edit} className="h-3.5 w-3.5" />{t('edit')}
                </button>
                <button onClick={() => onDelete(module)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition">
                    <Icon icon={ICONS.trash} className="h-3.5 w-3.5" />{t('delete')}
                </button>
            </div>
        </div>
    );
}

// ─── Table row ────────────────────────────────────────────────────────────────
function ModuleRow({ module, onEdit, onDelete, t, locale }) {
    const name = locale === 'ar' ? (module.nom_ar || module.nom_fr || '—') : (module.nom_fr || '—');
    const nameAlt = locale === 'ar' ? module.nom_fr : module.nom_ar;

    const profName = module.prof?.user
        ? (locale === 'ar'
            ? `${module.prof.user.prenom_ar ?? ''} ${module.prof.user.nom_ar ?? ''}`.trim() || `${module.prof.user.prenom_fr ?? ''} ${module.prof.user.nom_fr ?? ''}`.trim()
            : `${module.prof.user.prenom_fr ?? ''} ${module.prof.user.nom_fr ?? ''}`.trim())
        : null;

    return (
        <tr className="group border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <td className="px-3 py-3.5">
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-1 rounded-full shrink-0 ${typeBar(module.type_module)}`} />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{name}</p>
                        {nameAlt && <p className="text-xs text-slate-400 truncate" dir={locale === 'ar' ? 'ltr' : 'rtl'}>{nameAlt}</p>}
                    </div>
                </div>
            </td>
            <td className="px-3 py-3.5">
                <code className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2.5 py-1 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {module.code_module || '—'}
                </code>
            </td>
            <td className="px-3 py-3.5">
                {module.type_module
                    ? <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${typePill(module.type_module)}`}>{module.type_module}</span>
                    : <span className="text-xs italic text-slate-300 dark:text-slate-600">{t('noType')}</span>}
            </td>
            <td className="px-3 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {module.coefficient || <span className="text-slate-300 dark:text-slate-600">—</span>}
            </td>
            <td className="px-3 py-3.5">
                <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <Icon icon={ICONS.students} className="h-3.5 w-3.5 text-slate-400" />
                    {module.etudiants_count ?? 0}
                </span>
            </td>
            <td className="px-3 py-3.5 text-xs">
                {module.semestre
                    ? <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-400">
                        {module.semestre.code}
                        {module.semestre.niveau ? <span className="text-slate-400 dark:text-slate-500">· {module.semestre.niveau.code}</span> : ''}
                      </span>
                    : <span className="text-xs italic text-slate-300 dark:text-slate-600">—</span>}
            </td>
            <td className="px-3 py-3.5 text-xs">
                {profName ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 font-medium text-violet-700 dark:text-violet-400">
                        {profName}
                    </span>
                ) : (
                    <span className="text-xs italic text-slate-300 dark:text-slate-600">{t('noProfessorAssigned')}</span>
                )}
            </td>
            <td className="px-3 py-3.5">
                <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(module)} title={t('edit')}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition">
                        <Icon icon={ICONS.edit} className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(module)} title={t('delete')}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition">
                        <Icon icon={ICONS.trash} className="h-4 w-4" />
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
                            <Icon icon={isFirst ? ICONS.chevLeft : ICONS.chevRight} className="h-4 w-4" />
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
                <Icon icon={hasFilter ? ICONS.empty : ICONS.module} className="h-9 w-9 text-slate-300 dark:text-slate-600" />
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
                    <Icon icon={ICONS.plus} className="h-4 w-4" />{t('addModule')}
                </button>
            )}
        </div>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, colorClass, icon }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                <Icon icon={icon} className="h-5 w-5" />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function ModulesContent({ modules, semestres, types, filters, stats, profs }) {
    const { t, locale, isRTL } = useLanguage();
    const { flash } = usePage().props;

    const [modal, setModal]           = useState(null);
    const [search, setSearch]         = useState(filters?.search ?? '');
    const [typeFilter, setTypeFilter]     = useState(filters?.type ?? '');
    const [semestreFilter, setSemestreFilter] = useState(filters?.semestre_id ?? '');
    const [sortField, setSortField]       = useState(filters?.sort_field ?? 'created_at');
    const [sortDir, setSortDir]           = useState(filters?.sort_dir ?? 'desc');
    const [viewMode, setViewMode]         = useViewMode('modules_view', 'grid');
    const [importToast, setImportToast] = useState(null);
    const searchTimeout               = useRef(null);

    const nameSortField = locale === 'ar' ? 'nom_ar' : 'nom_fr';

    const navigate = (overrides = {}) => {
        const params = {
            search:      search,
            type:        typeFilter || undefined,
            semestre_id: semestreFilter || undefined,
            sort_field:  sortField,
            sort_dir:    sortDir,
            ...overrides,
        };
        Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
        router.get(route('modules.index'), params, { preserveState: true, replace: true });
    };

    const doSearch = (val, tf = typeFilter, sf = semestreFilter) => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => navigate({ search: val, type: tf, semestre_id: sf }), 320);
    };

    const handleSearch   = (val) => { setSearch(val); doSearch(val); };
    const handleType     = (val) => { setTypeFilter(val); doSearch(search, val); };
    const handleSemestre = (val) => { setSemestreFilter(val); doSearch(search, typeFilter, val); };

    const handleSort = (field) => {
        const dir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDir(dir);
        navigate({ sort_field: field, sort_dir: dir });
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className="ms-1 opacity-30">↕</span>;
        return <span className="ms-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    const items     = modules?.data ?? [];
    const hasFilter = !!(search || typeFilter || semestreFilter);

    const statCards = [
        { label: t('totalModulesStat'),  value: stats.total,        colorClass: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', icon: ICONS.module   },
        { label: t('modulesWithProf'), value: stats.withProfs, colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', icon: ICONS.user },
        { label: t('modulesWithStudents'), value: stats.withStudents, colorClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', icon: ICONS.students            },
        { label: locale === 'ar' ? 'أنواع الوحدات' : 'Types distincts', value: stats.types, colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', icon: ICONS.tag },
    ];

    return (
        <>
            <Head title={t('modulesManagement')} />
            <Toast flash={flash} t={t} />

            {/* ── Import success toast ── */}
            {importToast && (
                <div className="fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 shadow-xl text-sm font-medium text-white animate-fade-in">
                    <Icon icon={ICONS.check} className="h-4 w-4 shrink-0" />
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
                <ModuleFormModal mode="create" semestres={semestres} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}
            {modal?.type === 'excel' && (
                <ExcelImportModal
                    onClose={() => setModal(null)}
                    onSuccess={(count) => {
                        setImportToast({ count });
                        setTimeout(() => setImportToast(null), 4000);
                    }}
                    t={t} isRTL={isRTL} locale={locale} semestres={semestres}
                />
            )}
            {modal?.type === 'edit' && (
                <ModuleFormModal mode="edit" module={modal.module} semestres={semestres} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}
            {modal?.type === 'delete' && (
                <DeleteModal module={modal.module} onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale} />
            )}
            {modal?.type === 'export' && (
                <ExportModal onClose={() => setModal(null)} t={t} isRTL={isRTL} locale={locale}
                    semestres={semestres} types={types} filters={filters} />
            )}

            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* ── Header ── */}
                <div className={`flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                        <h1 className="flex items-center gap-2.5 text-xl font-bold text-slate-800 dark:text-white">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <Icon icon={ICONS.module} className="h-4 w-4 text-violet-600 dark:text-violet-400" />
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
                            <Icon icon={ICONS.plus} className="h-4 w-4" />
                            {t('addModule')}
                        </button>
                        {/* Excel import button */}
                        <button onClick={() => setModal({ type: 'excel' })}
                            title={t('addViaExcel')}
                            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 active:scale-95 transition">
                            <Icon icon={ICONS.excel} className="h-4 w-4" />
                            <span className="hidden sm:inline">{locale === 'ar' ? 'استيراد Excel' : 'Import Excel'}</span>
                        </button>
                        {/* Export button */}
                        <button onClick={() => setModal({ type: 'export' })}
                            title={t('exportModules')}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 active:scale-95 transition">
                            <Icon icon={ICONS.download} className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('exportModules')}</span>
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
                            <Icon icon={ICONS.search} className="h-4 w-4" />
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
                                <Icon icon={ICONS.close} className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Type filter */}
                    <div className="relative">
                        <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'end-3' : 'start-3'} flex items-center text-slate-400`}>
                            <Icon icon={ICONS.filter} className="h-4 w-4" />
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
                            <Icon icon={ICONS.chevDown} className="h-4 w-4" />
                        </span>
                    </div>

                    {/* Semestre filter */}
                    <div className="relative">
                        <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'end-3' : 'start-3'} flex items-center text-slate-400`}>
                            <Icon icon={ICONS.tag} className="h-4 w-4" />
                        </span>
                        <select value={semestreFilter} onChange={e => handleSemestre(e.target.value)}
                            className={`appearance-none rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-700 shadow-sm transition
                                focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                                ${isRTL ? 'ps-8 pe-9' : 'ps-9 pe-8'}`}>
                            <option value="">{locale === 'ar' ? 'جميع الفصول' : 'Tous les semestres'}</option>
                            {semestres.map(s => {
                                const filiereCode = s.niveau?.filiere?.code || '';
                                const niveauCode = s.niveau?.code || '';
                                const suffix = niveauCode ? (filiereCode ? ` — ${niveauCode} (${filiereCode})` : ` (${niveauCode})`) : '';
                                return (
                                <option key={s.id} value={s.id}>
                                    {s.code} — {locale === 'ar' ? (s.nom_ar || s.nom_fr) : (s.nom_fr || s.nom_ar)}{suffix}
                                </option>
                                );
                            })}
                        </select>
                        <span className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'start-3' : 'end-3'} flex items-center text-slate-400`}>
                            <Icon icon={ICONS.chevDown} className="h-4 w-4" />
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
                                    ? <Squares2X2Icon className="h-4 w-4" />
                                    : <Bars3BottomLeftIcon className="h-4 w-4" />
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
                                <button onClick={() => handleSearch('')} className="ms-1 hover:text-red-500"><Icon icon={ICONS.close} className="h-3 w-3" /></button>
                            </span>
                        )}
                        {typeFilter && (
                            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${typePill(typeFilter)}`}>
                                {typeFilter}
                                <button onClick={() => handleType('')} className="ms-1 hover:text-red-500"><Icon icon={ICONS.close} className="h-3 w-3" /></button>
                            </span>
                        )}
                        {semestreFilter && (
                            <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                                {semestres?.find(s => s.id == semestreFilter)?.code || semestreFilter}
                                <button onClick={() => handleSemestre('')} className="ms-1 hover:text-red-500"><Icon icon={ICONS.close} className="h-3 w-3" /></button>
                            </span>
                        )}
                        <button onClick={() => { handleSearch(''); handleType(''); handleSemestre(''); }} className="text-xs text-slate-400 hover:text-red-400 transition">
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
                                        <th onClick={() => handleSort(nameSortField)}
                                            className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'} cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400 transition`}>
                                            {t('name')}<SortIcon field={nameSortField} />
                                        </th>
                                        <th onClick={() => handleSort('code_module')}
                                            className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'} cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400 transition`}>
                                            {t('moduleCode')}<SortIcon field="code_module" />
                                        </th>
                                        <th onClick={() => handleSort('type_module')}
                                            className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'} cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400 transition`}>
                                            {t('moduleType')}<SortIcon field="type_module" />
                                        </th>
                                        <th onClick={() => handleSort('coef')}
                                            className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'} cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400 transition`}>
                                            {t('moduleCoefficient')}<SortIcon field="coef" />
                                        </th>
                                        <th className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('students')}
                                        </th>
                                        <th className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('moduleSemestre')}
                                        </th>
                                        <th className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {locale === 'ar' ? 'الأستاذ' : 'Professeur'}
                                        </th>
                                        <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-end">
                                            {t('actions')}
                                        </th>
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
export default function ModulesIndex({ modules, semestres, types, filters, stats, profs }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <ModulesContent modules={modules} semestres={semestres} types={types} filters={filters} stats={stats} profs={profs} />
            </AdminLayout>
        </LanguageProvider>
    );
}


