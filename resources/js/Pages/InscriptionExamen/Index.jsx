import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

function Icon({ d, className = 'w-5 h-5', fill = 'none' }) {
    return (
        <svg className={className} fill={fill} stroke={fill === 'none' ? 'currentColor' : 'none'}
            strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const I = {
    search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    plus:    'M12 4v16m8-8H4',
    trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    check:   'M5 13l4 4L19 7',
    close:   'M6 18L18 6M6 6l12 12',
    upload:  'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    download:'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2v-7a2 2 0 012-2h.172M15 3h4a2 2 0 012 2v4M11 3H7a2 2 0 00-2 2v.172',
    file:    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
    users:   'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    book:    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    door:    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    chevronDown: 'M19 9l-7 7-7-7',
    chevronUp:   'M5 15l7-7 7 7',
};

function StatCard({ icon, label, value, color }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-3 shadow-sm">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon d={icon} className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function StudentCombo({ items, value, onChange, placeholder, disabled, locale }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef();
    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const selected = items?.find(i => i.id === value);
    const filtered = items?.filter(i => {
        const q = query.toLowerCase();
        return !q || (i.nom_fr + ' ' + i.prenom_fr + ' ' + (i.CNE || '') + ' ' + i.nom_ar + ' ' + i.prenom_ar).toLowerCase().includes(q);
    }) || [];
    if (disabled && selected) {
        return (
            <div className="relative">
                <input type="text" value={locale === 'ar' ? (selected.nom_ar || selected.nom_fr) + ' ' + (selected.prenom_ar || selected.prenom_fr) : selected.nom_fr + ' ' + selected.prenom_fr + (selected.CNE ? ' (' + selected.CNE + ')' : '')} readOnly
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed" />
            </div>
        );
    }
    return (
        <div ref={ref} className="relative">
            <input type="text" value={open ? query : (selected ? (locale === 'ar' ? (selected.nom_ar || selected.nom_fr) + ' ' + (selected.prenom_ar || selected.prenom_fr) : selected.nom_fr + ' ' + selected.prenom_fr + (selected.CNE ? ' (' + selected.CNE + ')' : '')) : '')}
                onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(null); }}
                onFocus={() => { setOpen(true); setQuery(''); }}
                placeholder={placeholder || ''}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition" />
            {open && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg max-h-60 overflow-y-auto">
                    {filtered.length > 0 ? filtered.map(i => (
                        <button key={i.id} type="button" onClick={() => { onChange(i.id); setOpen(false); setQuery(''); }}
                            className={`w-full text-start px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center gap-3
                                ${value === i.id ? 'bg-indigo-50 dark:bg-indigo-900/20 font-medium' : ''}`}>
                            <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                {(locale === 'ar' ? (i.prenom_ar?.[0] || i.prenom_fr?.[0] || i.nom_ar?.[0] || i.nom_fr?.[0] || '?') : (i.prenom_fr?.[0] || i.nom_fr?.[0] || '?')).toUpperCase()}
                            </div>
                            <span>{locale === 'ar' ? ((i.nom_ar || i.nom_fr) + ' ' + (i.prenom_ar || i.prenom_fr)) : (i.nom_fr + ' ' + i.prenom_fr)}</span>
                            {i.CNE && <code className="ml-auto text-[10px] text-slate-400 font-mono">{i.CNE}</code>}
                        </button>
                    )) : (
                        <p className="px-4 py-3 text-xs text-slate-400">Aucun résultat</p>
                    )}
                </div>
            )}
        </div>
    );
}

function ModuleCombo({ items, value, onChange, placeholder, disabled }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef();
    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const selected = items?.find(i => i.id === value);
    const filtered = items?.filter(i => {
        const q = query.toLowerCase();
        return !q || (i.nom_fr + ' ' + i.nom_ar + ' ' + (i.code_module || '')).toLowerCase().includes(q);
    }) || [];
    if (disabled && selected) {
        return (
            <div>
                <input type="text" value={selected.nom_fr + (selected.code_module ? ' (' + selected.code_module + ')' : '')} readOnly
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed" />
            </div>
        );
    }
    return (
        <div ref={ref} className="relative">
            <input type="text" value={open ? query : (selected ? (selected.nom_fr + (selected.code_module ? ' (' + selected.code_module + ')' : '')) : '')}
                onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(null); }}
                onFocus={() => { setOpen(true); setQuery(''); }}
                placeholder={placeholder || ''}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition" />
            {open && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg max-h-60 overflow-y-auto">
                    {filtered.length > 0 ? filtered.map(i => (
                        <button key={i.id} type="button" onClick={() => { onChange(i.id); setOpen(false); setQuery(''); }}
                            className={`w-full text-start px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center gap-3
                                ${value === i.id ? 'bg-indigo-50 dark:bg-indigo-900/20 font-medium' : ''}`}>
                            <span>{i.nom_fr}</span>
                            {i.code_module && <code className="ml-auto text-[10px] text-slate-400 font-mono">{i.code_module}</code>}
                        </button>
                    )) : (
                        <p className="px-4 py-3 text-xs text-slate-400">Aucun résultat</p>
                    )}
                </div>
            )}
        </div>
    );
}

function AddModal({ onClose, t, locale, isRTL, allEtudiants, allModules, allGroupes, allSalles }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        etudiant_id: null,
        module_id: null,
        groupe_id: null,
        id_salle: null,
        Nexam: null,
        note_normale: '',
        note_rattrapage: '',
        note_finale: '',
    });

    const selectedStudent = allEtudiants?.find(e => e.id === data.etudiant_id);
    const enrolledIds = selectedStudent?.module_ids || [];
    const availableModules = allModules?.filter(m => !enrolledIds.includes(m.id)) || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inscription-examen.store'), {
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                            {locale === 'ar' ? 'تسجيل امتحان جديد' : 'Nouvelle inscription examen'}
                        </h2>
                        <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            <Icon d={I.close} className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'ar' ? 'الطالب' : 'Étudiant'}</label>
                            <StudentCombo items={allEtudiants} value={data.etudiant_id}
                                onChange={v => setData('etudiant_id', v)}
                                placeholder={locale === 'ar' ? 'ابحث عن طالب...' : 'Rechercher un étudiant...'} locale={locale} />
                            {errors.etudiant_id && <p className="text-xs text-red-500">{errors.etudiant_id}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'ar' ? 'الوحدة' : 'Module'}</label>
                            <ModuleCombo items={availableModules} value={data.module_id}
                                onChange={v => setData('module_id', v)}
                                placeholder={locale === 'ar' ? 'ابحث عن وحدة...' : 'Rechercher un module...'} />
                            {errors.module_id && <p className="text-xs text-red-500">{errors.module_id}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'ar' ? 'المجموعة' : 'Groupe'}</label>
                                <select value={data.groupe_id ?? ''} onChange={e => setData('groupe_id', e.target.value || null)}
                                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600">
                                    <option value="">{locale === 'ar' ? '— اختر —' : '— Sélectionner —'}</option>
                                    {allGroupes?.map(g => (
                                        <option key={g.id} value={g.id}>{g.code} — {g.module?.nom_fr}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'ar' ? 'القاعة' : 'Salle'}</label>
                                <select value={data.id_salle ?? ''} onChange={e => setData('id_salle', e.target.value || null)}
                                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600">
                                    <option value="">{locale === 'ar' ? '— اختر —' : '— Sélectionner —'}</option>
                                    {allSalles?.map(s => (
                                        <option key={s.id} value={s.id}>{s.code_salle} — {locale === 'ar' ? (s.nomSalle_ar || s.nomSalle_fr) : (s.nomSalle_fr || s.nomSalle_ar)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'ar' ? 'الامتحان رقم' : 'N° examen'}</label>
                                <input type="number" min="1" value={data.Nexam ?? ''} onChange={e => setData('Nexam', e.target.value ? parseInt(e.target.value) : null)}
                                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'ar' ? 'العلامة العادية' : 'Note normale'}</label>
                                <input type="number" step="0.01" min="0" max="20" value={data.note_normale} onChange={e => setData('note_normale', e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'ar' ? 'الاستدراكية' : 'Rattrapage'}</label>
                                <input type="number" step="0.01" min="0" max="20" value={data.note_rattrapage} onChange={e => setData('note_rattrapage', e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                {t('cancel')}
                            </button>
                            <button type="submit" disabled={processing || !data.etudiant_id || !data.module_id}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50">
                                {processing && <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                                <Icon d={I.check} className="h-4 w-4" />
                                {locale === 'ar' ? 'تسجيل' : 'Inscrire'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

function ExcelModal({ onClose, t, locale, isRTL }) {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus] = useState('idle');
    const [preview, setPreview] = useState(null);
    const [report, setReport] = useState(null);
    const fileInput = useRef(null);

    const COLS = [
        { name: 'CNE', req: true }, { name: 'code_module', req: true },
        { name: 'code_groupe', req: false }, { name: 'code_salle', req: false },
        { name: 'Nexam', req: false }, { name: 'note_normale', req: false },
        { name: 'note_rattrapage', req: false }, { name: 'note_finale', req: false },
    ];

    const parseFile = (f) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array', codepage: 1256 });
                const ws = wb.Sheets[wb.SheetNames[0]];
                resolve(XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }));
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(f);
    });

    const validateRows = (rows) => {
        if (rows.length < 2) return { valid: [], invalid: [] };
        const header = rows[0].map(h => String(h).toLowerCase().replace(/[\s\-]+/g, '_').trim());
        const valid = [], invalid = [];
        rows.slice(1).forEach((row, i) => {
            const ln = i + 2;
            const data = {};
            header.forEach((k, j) => { data[k] = String(row[j] ?? '').trim(); });
            if (Object.values(data).every(v => !v)) return;
            const reasons = [];
            if (!data['cne']) reasons.push('CNE requis');
            if (!data['code_module']) reasons.push('code_module requis');
            if (reasons.length) invalid.push({ lineNum: ln, data, reasons });
            else valid.push({ lineNum: ln, data });
        });
        return { valid, invalid };
    };

    const handleFile = async (f) => {
        if (!f) return;
        const ok = ['csv', 'xlsx', 'xls', 'ods', 'tsv'].some(ext => f.name.toLowerCase().endsWith('.' + ext));
        if (!ok || f.size > 5 * 1024 * 1024) return;
        setFile(f); setReport(null);
        try {
            const rows = await parseFile(f);
            setPreview(validateRows(rows));
        } catch { setPreview(null); }
        setStatus('previewing');
    };

    const reset = () => { setFile(null); setPreview(null); setReport(null); setStatus('idle'); };

    const submit = async () => {
        if (!file) return;
        setStatus('loading');
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await window.axios.post(route('inscription-examen.import'), fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setReport(res.data);
            setStatus('done');
            if ((res.data.imported ?? 0) > 0) {
                router.reload({ only: ['items', 'stats'] });
                setTimeout(() => onClose(), 600);
            }
        } catch (err) {
            setReport({ error: err.response?.data?.error ?? 'unknown', message: err.response?.data?.message, report: [] });
            setStatus('error');
        }
    };

    const downloadTemplate = () => {
        const header = COLS.map(c => c.name).join(',');
        const example = 'CNE123456,MATH101,GP1,SAL01,1,12.5,10.0,11.0';
        const blob = new Blob([header + '\n' + example], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'inscription_examen_template.csv'; a.click();
    };

    const ext = file?.name?.split('.').pop()?.toLowerCase();
    const isXlsx = ['xlsx', 'xls', 'ods'].includes(ext);
    const fileIcon = isXlsx ? '📊' : '📄';
    const hasPreview = preview && (preview.valid.length + preview.invalid.length) > 0;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[92vh]" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/20 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
                                <Icon d={I.upload} className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{locale === 'ar' ? 'استيراد تسجيلات الامتحان' : 'Importer inscriptions examen'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'رفع ملف Excel أو CSV' : 'Fichier Excel ou CSV'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 transition">
                            <Icon d={I.close} className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                                <Icon d={I.search} className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'الأعمدة المطلوبة' : 'Colonnes attendues'}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 px-4 py-3">
                                {COLS.map(c => (
                                    <div key={c.name} className="flex items-center gap-1.5">
                                        <code className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">{c.name}</code>
                                        <span className={`text-[10px] font-medium ${c.req ? 'text-red-500' : 'text-slate-400'}`}>{c.req ? 'Requis' : 'Optionnel'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {!file && (
                            <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                                onClick={() => fileInput.current?.click()}
                                className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all ${dragging ? 'border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20' : 'border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-amber-500'}`}>
                                <input ref={fileInput} type="file" accept=".csv,.xlsx,.xls,.ods,.tsv,.txt" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition">
                                    <Icon d={I.upload} className="h-6 w-6 text-slate-400 group-hover:text-amber-500 transition" />
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{locale === 'ar' ? 'اربط الملف هنا' : 'Déposez le fichier ici'}</p>
                                <span className="mt-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">{locale === 'ar' ? 'أو اختر ملفًا' : 'ou cliquez pour parcourir'}</span>
                            </div>
                        )}
                        {file && status !== 'done' && (
                            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10 px-4 py-3">
                                <span className="text-2xl">{fileIcon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} Ko</p>
                                </div>
                                <button onClick={reset} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition">
                                    <Icon d={I.close} className="h-3.5 w-3.5" />{locale === 'ar' ? 'تغيير' : 'Changer'}</button>
                            </div>
                        )}
                        {hasPreview && status !== 'done' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center">
                                        <p className="text-lg font-bold text-slate-800 dark:text-white">{preview.valid.length + preview.invalid.length}</p>
                                        <p className="text-[11px] text-slate-400">{locale === 'ar' ? 'المجموع' : 'Total'}</p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-center">
                                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{preview.valid.length}</p>
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500">{locale === 'ar' ? 'صالح' : 'Valides'}</p>
                                    </div>
                                    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-center">
                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{preview.invalid.length}</p>
                                        <p className="text-[11px] text-red-500">{locale === 'ar' ? 'غير صالح' : 'Invalides'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {status === 'done' && report && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-center">
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{report.imported}</p>
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500">{locale === 'ar' ? 'مستورد' : 'Importés'}</p>
                                    </div>
                                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-center">
                                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{report.skipped}</p>
                                        <p className="text-[11px] text-amber-500">{locale === 'ar' ? 'متخطى' : 'Ignorés'}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center">
                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{(report.imported ?? 0) + (report.skipped ?? 0)}</p>
                                        <p className="text-[11px] text-slate-400">{locale === 'ar' ? 'المجموع' : 'Total'}</p>
                                    </div>
                                </div>
                                {report.imported > 0 && (
                                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-4 py-3">
                                        <Icon d={I.check} className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{locale === 'ar' ? 'تم الاستيراد بنجاح' : 'Importation réussie'}</p>
                                    </div>
                                )}
                                {report.report?.some(r => r.status === 'rejected') && (
                                    <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
                                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 border-b border-red-200 dark:border-red-800">
                                            <Icon d={I.trash} className="h-4 w-4 text-red-500" />
                                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">{locale === 'ar' ? 'أخطاء' : 'Erreurs'}</span>
                                        </div>
                                        <div className="overflow-x-auto max-h-36">
                                            <table className="w-full text-xs">
                                                <thead><tr className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                    <th className="px-3 py-2 text-left font-semibold text-slate-500">#</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-slate-500">CNE</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-slate-500">Module</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-red-500">{locale === 'ar' ? 'السبب' : 'Raison'}</th>
                                                </tr></thead>
                                                <tbody>{report.report.filter(r => r.status === 'rejected').map((r, i) => (
                                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-red-50/30 dark:hover:bg-red-900/10">
                                                        <td className="px-3 py-2 text-slate-400 font-mono">{r.line}</td>
                                                        <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 font-bold text-slate-600 dark:text-slate-300">{r.cne || '—'}</code></td>
                                                        <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 font-bold text-slate-600 dark:text-slate-300">{r.code_module || '—'}</code></td>
                                                        <td className="px-3 py-2 text-red-500 dark:text-red-400">{r.reason}</td>
                                                    </tr>
                                                ))}</tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {status === 'error' && report && (
                            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
                                <Icon d={I.close} className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm font-semibold text-red-700 dark:text-red-400">{report.message || 'Erreur inconnue'}</p>
                            </div>
                        )}
                    </div>
                    <div className={`flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-6 py-4 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="button" onClick={downloadTemplate}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                            <Icon d={I.download} className="h-4 w-4 text-amber-500" />
                            {locale === 'ar' ? 'نموذج' : 'Télécharger modèle'}
                        </button>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {status === 'done' ? (
                                <button type="button" onClick={onClose} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">{locale === 'ar' ? 'إغلاق' : 'Fermer'}</button>
                            ) : (
                                <>
                                    <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">{t('cancel')}</button>
                                    <button type="button" onClick={submit} disabled={!file || status === 'loading'}
                                        className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 transition">
                                        {status === 'loading' ? <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{locale === 'ar' ? 'جارٍ الاستيراد...' : 'Importation...'}</>
                                            : <><Icon d={I.upload} className="h-4 w-4" />{locale === 'ar' ? 'استيراد' : 'Importer'}</>}
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

function PageContent() {
    const { t, locale, isRTL } = useLanguage();
    const { items, groupBy, allEtudiants, allModules, allGroupes, allSalles, stats, flash } = usePage().props;
    const [showAdd, setShowAdd] = useState(false);
    const [showExcel, setShowExcel] = useState(false);
    const [expanded, setExpanded] = useState(new Set());
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            const map = {
                inscription_examen_created: locale === 'ar' ? 'تم تسجيل الامتحان بنجاح' : 'Inscription examen enregistrée',
                inscription_examen_deleted: locale === 'ar' ? 'تم حذف تسجيل الامتحان' : 'Inscription examen supprimée',
            };
            setToast({ text: map[flash.success || flash.error] || flash.success || flash.error, isErr: !!flash.error });
            const id = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(id);
        }
    }, [flash]);

    const toggleGroup = (val) => {
        router.get(route('inscription-examen.index'), { group_by: val }, { preserveState: true, replace: true });
    };

    const toggleExpand = (id) => {
        setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };

    return (
        <>
            <Head title={t('examInscriptions')} />
            {toast && (
                <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium ${toast.isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    <Icon d={toast.isErr ? I.close : I.check} className="h-4 w-4 shrink-0" />
                    {toast.text}
                </div>
            )}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white">{t('examInscriptions')}</h1>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                        {locale === 'ar' ? 'إدارة تسجيلات الطلاب في الامتحانات' : 'Gérer les inscriptions des étudiants aux examens'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowExcel(true)}
                        className="flex items-center gap-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
                        <Icon d={I.upload} className="h-4 w-4" />
                        {locale === 'ar' ? 'استيراد Excel' : 'Importer Excel'}
                    </button>
                    <button onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition">
                        <Icon d={I.plus} className="h-4 w-4" />
                        {locale === 'ar' ? 'إضافة تسجيل' : 'Ajouter inscription'}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard icon={I.users} label={locale === 'ar' ? 'إجمالي التسجيلات' : 'Total inscriptions'} value={stats?.total ?? 0} color="bg-indigo-500" />
                <StatCard icon={I.door} label={locale === 'ar' ? 'بقاعات معينة' : 'Avec salle'} value={stats?.assigned_rooms ?? 0} color="bg-emerald-500" />
                <StatCard icon={I.book} label={locale === 'ar' ? 'بعلامات' : 'Avec notes'} value={stats?.with_grades ?? 0} color="bg-amber-500" />
            </div>

            {/* Group toggle */}
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => toggleGroup('module')}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${groupBy === 'module' ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <Icon d={I.book} className="h-3.5 w-3.5" />
                    {locale === 'ar' ? 'حسب الوحدة' : 'Par module'}
                </button>
                <button onClick={() => toggleGroup('groupe')}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${groupBy === 'groupe' ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <Icon d={I.users} className="h-3.5 w-3.5" />
                    {locale === 'ar' ? 'حسب المجموعة' : 'Par groupe'}
                </button>
            </div>

            {/* Grouped list */}
            <div className="space-y-3">
                {items?.data?.length > 0 ? items.data.map(item => {
                    const isMod = groupBy === 'module';
                    const title = isMod
                        ? (locale === 'ar' ? (item.nom_ar || item.nom_fr) : (item.nom_fr || item.nom_ar))
                        : item.code + ' — ' + (locale === 'ar' ? (item.nom_ar || item.nom_fr) : (item.nom_fr || item.nom_ar));
                    const subtitle = isMod ? item.code_module : (item.module ? (locale === 'ar' ? (item.module.nom_ar || item.module.nom_fr) : (item.module.nom_fr || item.module.nom_ar)) : '');
                    const count = item.inscriptions_count ?? item.inscriptions?.length ?? 0;
                    const iId = isMod ? item.id : item.id;
                    const isExpanded = expanded.has(iId);
                    const inscrits = item.inscriptions ?? [];
                    return (
                        <div key={iId} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                            <button onClick={() => toggleExpand(iId)}
                                className={`flex w-full items-center gap-3 px-5 py-4 transition ${isExpanded ? 'border-b border-slate-100 dark:border-slate-700/60' : ''}`}>
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${isMod ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                    <Icon d={isMod ? I.book : I.users} className={`h-4 w-4 ${isMod ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0 text-start">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{title}</p>
                                    {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{subtitle}</p>}
                                </div>
                                <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-300">{count}</span>
                                <Icon d={isExpanded ? I.chevronUp : I.chevronDown} className="h-4 w-4 text-slate-400 shrink-0" />
                            </button>
                            {isExpanded && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-700/60">
                                                <th className="px-4 py-2.5 text-start text-xs font-semibold text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'الطالب' : 'Étudiant'}</th>
                                                {isMod && <th className="px-4 py-2.5 text-start text-xs font-semibold text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'المجموعة' : 'Groupe'}</th>}
                                                <th className="px-4 py-2.5 text-start text-xs font-semibold text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'القاعة' : 'Salle'}</th>
                                                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">N°</th>
                                                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'العلامة' : 'Note'}</th>
                                                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'الاستدراك' : 'Ratt.'}</th>
                                                <th className="px-4 py-2.5 text-start text-xs font-semibold text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'القرار' : 'Décision'}</th>
                                                <th className="px-4 py-2.5 text-end text-xs font-semibold text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'إجراء' : 'Actions'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                                            {inscrits.map(ie => {
                                                const etud = ie.etudiant;
                                                const grp = ie.groupe;
                                                const sal = ie.salle;
                                                const etudName = etud ? (locale === 'ar' ? (etud.nom_ar || etud.nom_fr) + ' ' + (etud.prenom_ar || etud.prenom_fr) : etud.nom_fr + ' ' + etud.prenom_fr) : '—';
                                                const grpName = grp ? (locale === 'ar' ? (grp.nom_ar || grp.code) : (grp.nom_fr || grp.code)) : '—';
                                                const salName = sal ? (locale === 'ar' ? (sal.nomSalle_ar || sal.nomSalle_fr) : (sal.nomSalle_fr || sal.nomSalle_ar)) : '—';
                                                const decision = locale === 'ar' ? ie.decision_finale_ar : ie.decision_finale_fr;
                                                const isValid = decision === 'Validé' || decision === 'مستوفي';
                                                return (
                                                    <tr key={ie.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/10 transition-colors">
                                                        <td className="px-4 py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                                    {(etud?.prenom_fr?.[0] || etud?.nom_fr?.[0] || '?').toUpperCase()}
                                                                </div>
                                                                <span className="text-sm text-slate-700 dark:text-slate-200 truncate max-w-[160px]">{etudName}</span>
                                                                {etud?.CNE && <code className="text-[10px] text-slate-400 font-mono">{etud.CNE}</code>}
                                                            </div>
                                                        </td>
                                                        {isMod && <td className="px-4 py-2.5"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">{grpName}</code></td>}
                                                        <td className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200">{salName}</td>
                                                        <td className="px-4 py-2.5 text-center text-sm font-mono text-slate-600 dark:text-slate-300">{ie.Nexam ?? '—'}</td>
                                                        <td className="px-4 py-2.5 text-center text-sm font-mono text-slate-700 dark:text-slate-200">{ie.note_normale !== null ? Number(ie.note_normale).toFixed(2) : '—'}</td>
                                                        <td className="px-4 py-2.5 text-center text-sm font-mono text-slate-700 dark:text-slate-200">{ie.note_rattrapage !== null ? Number(ie.note_rattrapage).toFixed(2) : '—'}</td>
                                                        <td className="px-4 py-2.5">
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${isValid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                {decision}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-end">
                                                            <button onClick={() => router.delete(route('inscription-examen.destroy', ie.id), { preserveScroll: true })}
                                                                className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition"
                                                                title={locale === 'ar' ? 'حذف' : 'Supprimer'}>
                                                                <Icon d={I.trash} className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
                            <Icon d={I.file} className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'لا توجد تسجيلات امتحان بعد' : 'Aucune inscription examen'}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{locale === 'ar' ? 'أضف تسجيلًا جديدًا أو استورد من Excel' : 'Ajoutez une inscription ou importez depuis Excel'}</p>
                    </div>
                )}
            </div>

            {items?.last_page > 1 && (
                <div className="flex items-center justify-between px-4 py-3 mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <p className="text-xs text-slate-400">{locale === 'ar' ? `صفحة ${items.current_page} من ${items.last_page}` : `Page ${items.current_page} sur ${items.last_page}`}</p>
                    <div className="flex items-center gap-1">
                        {items.links?.filter(l => !isNaN(l.label)).map(l => (
                            <button key={l.label} onClick={() => l.url && router.get(l.url, {}, { preserveState: true, preserveScroll: true })}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${l.active ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {showAdd && <AddModal onClose={() => setShowAdd(false)} t={t} locale={locale} isRTL={isRTL}
                allEtudiants={allEtudiants} allModules={allModules} allGroupes={allGroupes} allSalles={allSalles} />}
            {showExcel && <ExcelModal onClose={() => setShowExcel(false)} t={t} locale={locale} isRTL={isRTL} />}
        </>
    );
}

export default function InscriptionExamenIndex(props) {
    return (
        <LanguageProvider>
            <AdminLayout title={<InnerTitle />}>
                <PageContent {...props} />
            </AdminLayout>
        </LanguageProvider>
    );
}

function InnerTitle() {
    const { t } = useLanguage();
    return <>{t('examInscriptions')}</>;
}
