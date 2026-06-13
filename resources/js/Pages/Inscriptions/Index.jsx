import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, Fragment } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

/* ── Icons ───────────────────────────────────────────────────────────────────*/
function Icon({ d, className = 'w-5 h-5', fill = 'none' }) {
    return (
        <svg className={className} fill={fill} stroke={fill === 'none' ? 'currentColor' : 'none'}
            strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const I = {
    search:   'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    plus:     'M12 4v16m8-8H4',
    trash:    'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    check:    'M5 13l4 4L19 7',
    close:    'M6 18L18 6M6 6l12 12',
    down:     'M19 9l-7 7-7-7',
    up:       'M5 15l7-7 7 7',
    upload:   'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    download: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2v-7a2 2 0 012-2h.172M15 3h4a2 2 0 012 2v4M11 3H7a2 2 0 00-2 2v.172',
    grid:     'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    list:     'M4 6h16M4 10h16M4 14h16M4 18h16',
    users:    'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    book:     'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    student:  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    file:     'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
    excel:    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1v5h5M8 13h3m-3 4h3m2-4h3m-3 4h3',
    link:     'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
};

/* ── Stat card ───────────────────────────────────────────────────────────────*/
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

/* ── Async student search combobox ──────────────────────────────────────────*/
function StudentCombo({ value, onChange, placeholder, disabled, locale }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const ref = useRef();
    const timer = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (disabled && selected) return;
        if (!query || query.length < 1) { setResults([]); return; }
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(route('inscriptions.searchStudents'), { params: { q: query } });
                setResults(res.data ?? []);
            } catch { setResults([]); }
            setLoading(false);
        }, 300);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [query, disabled]);

    const infoLine = (i) => {
        const parts = [];
        if (i.niveau) parts.push(locale === 'ar' ? i.niveau.nom_ar : i.niveau.nom_fr);
        if (i.filiere) parts.push(locale === 'ar' ? i.filiere.nom_ar : i.filiere.nom_fr);
        return parts.join(' · ');
    };

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
                onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) { onChange(null); setSelected(null); } }}
                onFocus={() => { setOpen(true); }}
                placeholder={placeholder || ''}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition" />
            {open && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg max-h-72 overflow-y-auto">
                    {loading ? (
                        <p className="px-4 py-3 text-xs text-slate-400 animate-pulse">{locale === 'ar' ? 'جاري البحث...' : 'Recherche...'}</p>
                    ) : results.length > 0 ? results.map(i => (
                        <button key={i.id} type="button" onClick={() => { onChange(i.id, i); setSelected(i); setOpen(false); setQuery(''); }}
                            className={`w-full text-start px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition
                                ${value === i.id ? 'bg-indigo-50 dark:bg-indigo-900/20 font-medium' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    {(locale === 'ar' ? (i.prenom_ar?.[0] || i.prenom_fr?.[0] || i.nom_ar?.[0] || i.nom_fr?.[0] || '?') : (i.prenom_fr?.[0] || i.nom_fr?.[0] || '?')).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                                            {locale === 'ar' ? ((i.nom_ar || i.nom_fr) + ' ' + (i.prenom_ar || i.prenom_fr)) : (i.nom_fr + ' ' + i.prenom_fr)}
                                        </span>
                                        {i.CNE && <code className="shrink-0 text-[10px] text-slate-400 font-mono">{i.CNE}</code>}
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{infoLine(i)}</p>
                                </div>
                            </div>
                        </button>
                    )) : query ? (
                        <p className="px-4 py-3 text-xs text-slate-400">{locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat'}</p>
                    ) : (
                        <p className="px-4 py-3 text-xs text-slate-400">{locale === 'ar' ? 'ابدأ الكتابة للبحث...' : 'Tapez pour rechercher...'}</p>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Module search combobox ──────────────────────────────────────────────────*/
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
            <div className="relative">
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

/* ── Add inscription modal (multi-module) ────────────────────────────────────*/
function AddModal({ allModules, preselectedModuleId, preselectedStudentId, onClose, t, locale }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        etudiant_id: preselectedStudentId ?? null,
        module_ids: preselectedModuleId ? [preselectedModuleId] : [],
    });

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (preselectedStudentId && !selectedStudent) {
            axios.get(route('inscriptions.searchStudents'), { params: { q: '' } })
                .then(res => {
                    const s = (res.data ?? []).find(x => x.id === preselectedStudentId);
                    if (s) setSelectedStudent(s);
                })
                .catch(() => {});
        }
    }, [preselectedStudentId]);

    const enrolledIds = selectedStudent?.module_ids || [];
    const availableModules = allModules?.filter(m => !enrolledIds.includes(m.id)) || [];

    const filtered = availableModules.filter(i => {
        const q = query.toLowerCase();
        return !q || (i.nom_fr + ' ' + i.nom_ar + ' ' + (i.code_module || '')).toLowerCase().includes(q);
    });

    const toggleModule = (id) => {
        setData('module_ids', data.module_ids.includes(id)
            ? data.module_ids.filter(x => x !== id)
            : [...data.module_ids, id]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inscriptions.store'), {
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 flex flex-col max-h-[95vh]">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                            {locale === 'ar' ? 'تسجيل جديد' : 'Nouvelle inscription'}
                        </h2>
                        <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            <Icon d={I.close} className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
                        <div className="p-6 space-y-5 overflow-y-auto min-h-[300px]">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {locale === 'ar' ? 'الطالب' : 'Étudiant'}
                                </label>
                            <StudentCombo value={data.etudiant_id}
                                onChange={(id, student) => { setData('etudiant_id', id); setSelectedStudent(student ?? null); setData('module_ids', []); }}
                                placeholder={locale === 'ar' ? 'ابحث عن طالب...' : 'Rechercher un étudiant...'}
                                disabled={!!preselectedStudentId} locale={locale} />
                                {errors.etudiant_id && <p className="text-xs text-red-500">{errors.etudiant_id}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {locale === 'ar' ? 'الوحدات' : 'Modules'}
                                </label>
                                <div ref={ref} className="relative">
                                    <input type="text" value={open ? query : ''}
                                        onChange={e => { setQuery(e.target.value); setOpen(true); }}
                                        onFocus={() => { if (data.etudiant_id) setOpen(true); }}
                                        placeholder={!data.etudiant_id
                                            ? (locale === 'ar' ? 'اختر طالباً أولاً' : 'Sélectionnez d\'abord un étudiant')
                                            : (locale === 'ar' ? 'ابحث عن وحدات...' : 'Rechercher des modules...')}
                                        disabled={!data.etudiant_id}
                                        className={`block w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 transition ${!data.etudiant_id ? 'border-slate-100 dark:border-slate-700/50 text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600'}`} />
                                    {open && (
                                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg max-h-60 overflow-y-auto">
                                            {filtered.length > 0 ? filtered.map(i => {
                                                const sel = data.module_ids.includes(i.id);
                                                const sub = [
                                                    i.semestre ? (locale === 'ar' ? i.semestre.nom_ar : i.semestre.nom_fr) : '',
                                                    i.niveau ? (locale === 'ar' ? i.niveau.nom_ar : i.niveau.nom_fr) : '',
                                                    i.filiere ? (locale === 'ar' ? i.filiere.nom_ar : i.filiere.nom_fr) : '',
                                                ].filter(Boolean).join(' · ');
                                                return (
                                                    <button key={i.id} type="button" onClick={() => toggleModule(i.id)}
                                                        className={`w-full text-start px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${sel ? 'bg-indigo-50 dark:bg-indigo-900/20 font-medium' : ''}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition ${sel ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                                                                {sel && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{i.nom_fr}</span>
                                                                    {i.code_module && <code className="shrink-0 text-[10px] text-slate-400 font-mono">{i.code_module}</code>}
                                                                    {i.coefficient != null && <span className="shrink-0 text-[10px] text-slate-400">Coef: {i.coefficient}</span>}
                                                                </div>
                                                                {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            }) : (
                                                <p className="px-4 py-3 text-xs text-slate-400">{locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat'}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Selected module chips */}
                                {data.module_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {data.module_ids.map(id => {
                                            const m = allModules?.find(x => x.id === id);
                                            if (!m) return null;
                                            const sub = [
                                                m.semestre ? (locale === 'ar' ? m.semestre.nom_ar : m.semestre.nom_fr) : '',
                                                m.niveau ? (locale === 'ar' ? m.niveau.nom_ar : m.niveau.nom_fr) : '',
                                                m.filiere ? (locale === 'ar' ? m.filiere.nom_ar : m.filiere.nom_fr) : '',
                                            ].filter(Boolean).join(' · ');
                                            return (
                                                <span key={id} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 text-xs text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                    <span className="font-medium">{m.nom_fr}</span>
                                                    {sub && <span className="text-indigo-400 dark:text-indigo-400">— {sub}</span>}
                                                    <button type="button" onClick={() => toggleModule(id)} className="ml-0.5 hover:text-indigo-900 dark:hover:text-indigo-100 transition">
                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.module_ids && <p className="text-xs text-red-500">{errors.module_ids}</p>}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
                            <button type="button" onClick={onClose}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                {t('cancel')}
                            </button>
                            <button type="submit" disabled={processing || !data.etudiant_id || data.module_ids.length === 0}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50">
                                {processing ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    : <Icon d={I.check} className="h-4 w-4" />}
                                {locale === 'ar' ? `تسجيل (${data.module_ids.length})` : `Inscrire (${data.module_ids.length})`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

/* ── Excel import modal (full-featured) ──────────────────────────────────────*/
function ExcelModal({ onClose, t, isRTL, locale }) {
    const [file, setFile]         = useState(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus]     = useState('idle'); // idle | previewing | loading | done | error
    const [preview, setPreview]   = useState(null);
    const [report, setReport]     = useState(null);
    const fileInput               = useRef(null);

    const COLS = [
        { name: 'CNE',         req: true  },
        { name: 'code_module', req: true  },
    ];

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
            if (!data['cne'])         reasons.push(locale === 'ar' ? 'CNE مطلوب' : 'CNE requis');
            if (!data['code_module']) reasons.push(locale === 'ar' ? 'code_module مطلوب' : 'code_module requis');
            if (reasons.length === 0) valid.push({ lineNum, data });
            else                      invalid.push({ lineNum, data, reasons });
        });
        return { valid, invalid, header };
    };

    const handleFile = async (f) => {
        if (!f) return;
        const ok = ['csv', 'xlsx', 'xls', 'ods', 'tsv', 'txt'].some(ext =>
            f.name.toLowerCase().endsWith('.' + ext));
        if (!ok || f.size > 5 * 1024 * 1024) return;
        setFile(f); setReport(null); setPreview(null);
        try {
            const rows = await parseFileWithSheetJS(f);
            setPreview(validateRows(rows));
        } catch { setPreview(null); }
        setStatus('previewing');
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const reset = () => {
        setFile(null); setPreview(null); setReport(null); setStatus('idle');
    };

    const submit = async () => {
        if (!file) return;
        setStatus('loading');
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await window.axios.post(route('inscriptions.import'), fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setReport(res.data);
            setStatus('done');
            const imported = res.data.imported ?? 0;
            const hasErrors = (res.data.report ?? []).some(r => r.status === 'rejected');
            if (imported > 0 && !hasErrors) {
                router.reload({ only: ['items', 'stats'] });
                setTimeout(() => onClose(), 400);
            } else if (imported > 0) {
                router.reload({ only: ['items', 'stats'] });
            }
        } catch (err) {
            const data = err.response?.data;
            setReport({ error: data?.error ?? 'unknown', message: data?.message, report: [] });
            setStatus('error');
        }
    };

    const downloadRejectedReport = () => {
        const rejected = (report?.report ?? []).filter(r => r.status === 'rejected');
        if (rejected.length === 0) return;
        const rows = rejected.map(r => ({ Ligne: r.line, CNE: r.cne ?? '', Code_module: r.code_module ?? '', Raison: r.reason }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rejets');
        ws['!cols'] = [{ wch: 8 }, { wch: 16 }, { wch: 16 }, { wch: 40 }];
        const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'rapport_rejets_inscriptions.xlsx'; a.click();
        URL.revokeObjectURL(url);
    };

    const downloadTemplate = () => {
        const header = COLS.map(c => c.name).join(',');
        const example = 'CNE123456,MATH101';
        const blob = new Blob([header + '\n' + example], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'inscriptions_template.csv'; a.click();
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

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/20 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                                <Icon d={I.upload} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{t('importTitle')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('importSubtitle')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 transition">
                            <Icon d={I.close} className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                        {/* Column schema */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                                <Icon d={I.search} className="h-4 w-4 text-slate-400" />
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

                        {/* Drop zone */}
                        {!file && (
                            <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInput.current?.click()}
                                className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all
                                    ${dragging
                                        ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20'
                                        : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-emerald-500'}`}>
                                <input ref={fileInput} type="file" accept=".csv,.xlsx,.xls,.ods,.tsv,.txt"
                                    className="hidden" onChange={e => handleFile(e.target.files[0])} />
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition">
                                    <Icon d={I.upload} className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition" />
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{t('importDrop')}</p>
                                <p className="text-xs text-slate-400">{t('importOr')}</p>
                                <span className="mt-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    {t('importBrowse')}
                                </span>
                                <p className="mt-2 text-[11px] text-slate-400">{t('importFormats')}</p>
                            </div>
                        )}

                        {/* File bar */}
                        {file && status !== 'done' && (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10 px-4 py-3">
                                <span className="text-2xl">{fileIcon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} Ko</p>
                                </div>
                                <button onClick={reset}
                                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition">
                                    <Icon d={I.close} className="h-3.5 w-3.5" />
                                    {locale === 'ar' ? 'إزالة' : 'Changer'}
                                </button>
                            </div>
                        )}

                        {/* Preview */}
                        {hasPreview && status !== 'done' && (
                            <div className="space-y-3">
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
                                        <p className="text-[11px] text-red-500">{locale === 'ar' ? 'غير صالح' : 'Invalides'}</p>
                                    </div>
                                </div>

                                {preview.valid.length > 0 && (
                                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 border-b border-emerald-200 dark:border-emerald-800">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                {locale === 'ar' ? `${preview.valid.length} تسجيلًا ستُستورد` : `${preview.valid.length} inscription(s) à importer`}
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto max-h-48">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">#</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">CNE</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">code_module</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preview.valid.map(row => (
                                                        <tr key={row.lineNum} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10">
                                                            <td className="px-3 py-2 text-slate-400">{row.lineNum}</td>
                                                            <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">{row.data['cne'] || '—'}</code></td>
                                                            <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">{row.data['code_module'] || '—'}</code></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

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
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">CNE</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">code_module</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-red-500">{locale === 'ar' ? 'الأخطاء' : 'Erreurs'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preview.invalid.map(row => (
                                                        <tr key={row.lineNum} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-red-50/40 dark:hover:bg-red-900/10">
                                                            <td className="px-3 py-2 text-slate-400">{row.lineNum}</td>
                                                            <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">{row.data['cne'] || '—'}</code></td>
                                                            <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">{row.data['code_module'] || '—'}</code></td>
                                                            <td className="px-3 py-2">{row.reasons.map((r, i) => (
                                                                <span key={i} className="me-1 inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">{r}</span>
                                                            ))}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Post-submit report */}
                        {status === 'done' && report && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-center">
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{report.imported}</p>
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500">{locale === 'ar' ? 'تم استيرادها' : 'Importés'}</p>
                                    </div>
                                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-center">
                                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{report.skipped}</p>
                                        <p className="text-[11px] text-amber-500">{locale === 'ar' ? 'تم تجاهلها' : 'Ignorés'}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center">
                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{(report.imported ?? 0) + (report.skipped ?? 0)}</p>
                                        <p className="text-[11px] text-slate-400">{locale === 'ar' ? 'المجموع' : 'Total'}</p>
                                    </div>
                                </div>

                                {report.report?.filter(r => r.status === 'rejected').length > 0 && (
                                    <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
                                        <div className="flex items-center justify-between gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 border-b border-red-200 dark:border-red-800">
                                            <div className="flex items-center gap-2">
                                                <Icon d={I.trash} className="h-4 w-4 text-red-500" />
                                                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                                    {locale === 'ar' ? 'تقرير الأخطاء' : 'Rapport des rejets'}
                                                </span>
                                            </div>
                                            <button type="button" onClick={downloadRejectedReport}
                                                className="flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                                <Icon d={I.download} className="h-3 w-3" />
                                                {locale === 'ar' ? 'تحميل' : 'Télécharger'}
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto max-h-52">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">{locale === 'ar' ? 'السطر' : 'Ligne'}</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">CNE</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">code_module</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-red-500">{locale === 'ar' ? 'السبب' : 'Raison'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.report.filter(r => r.status === 'rejected').map((row, i) => (
                                                        <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-red-50/30 dark:hover:bg-red-900/10">
                                                            <td className="px-3 py-2 text-slate-400 font-mono">{row.line}</td>
                                                            <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 font-bold text-slate-600 dark:text-slate-300">{row.cne || '—'}</code></td>
                                                            <td className="px-3 py-2"><code className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 font-bold text-slate-600 dark:text-slate-300">{row.code_module || '—'}</code></td>
                                                            <td className="px-3 py-2 text-red-500 dark:text-red-400">{row.reason}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {(!report.report || report.report.filter(r => r.status === 'rejected').length === 0) && report.imported > 0 && (
                                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-4 py-3">
                                        <Icon d={I.check} className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                            {locale === 'ar' ? 'تم استيراد جميع التسجيلات بنجاح' : 'Toutes les inscriptions ont été importées avec succès'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fatal error */}
                        {status === 'error' && report && (
                            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
                                <Icon d={I.close} className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                        {report.error === 'parse_error' ? t('importParseError') : t('importEmpty')}
                                    </p>
                                    {report.message && <p className="text-xs text-red-500">{report.message}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className={`flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-6 py-4 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="button" onClick={downloadTemplate}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                            <Icon d={I.download} className="h-4 w-4 text-emerald-500" />
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
                                            <><Icon d={I.upload} className="h-4 w-4" />{t('importStart')}</>
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

/* ── Main page ───────────────────────────────────────────────────────────────*/
function PageContent() {
    const { t, locale, isRTL } = useLanguage();
    const { items, groupBy, filters, allModules, niveaux, stats, flash } = usePage().props;

    const [search, setSearch] = useState(filters?.search || '');
    const [expanded, setExpanded] = useState(new Set());
    const [childrenCache, setChildrenCache] = useState({});
    const [loadingChild, setLoadingChild] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showExcel, setShowExcel] = useState(false);
    const [preselectedModuleId, setPreselectedModuleId] = useState(null);
    const [preselectedStudentId, setPreselectedStudentId] = useState(null);
    const [toast, setToast] = useState(null);

    /* Toast flash messages */
    useEffect(() => {
        if (flash?.success || flash?.error) {
            const map = {
                inscription_created: locale === 'ar' ? 'تم التسجيل بنجاح' : 'Inscription enregistrée',
                inscription_deleted: locale === 'ar' ? 'تم حذف التسجيل' : 'Inscription supprimée',
                inscription_already_exists: locale === 'ar' ? 'الطالب مسجل بالفعل' : 'Inscription déjà existante',
            };
            setToast({ text: map[flash.success || flash.error] || flash.success || flash.error, isErr: !!flash.error });
            const id = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(id);
        }
    }, [flash]);

    /* Search with debounce */
    const searchTimeout = useRef(null);
    const handleSearch = (val) => {
        setSearch(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(route('inscriptions.index'), { search: val, group_by: groupBy, niveau_id: filters?.niveau_id }, { preserveState: true, replace: true });
        }, 400);
    };

    /* Niveau filter */
    const handleNiveauFilter = (val) => {
        router.get(route('inscriptions.index'), { search, group_by: groupBy, niveau_id: val || '' }, { preserveState: true, replace: true });
    };

    /* Toggle grouping */
    const toggleGroup = (val) => {
        router.get(route('inscriptions.index'), { search, group_by: val, niveau_id: filters?.niveau_id }, { preserveState: true, replace: true });
    };

    const doDelete = (parentId, pivotId) => {
        setConfirmDeleteId(null);
        deleteForm.delete(route('inscriptions.destroy', pivotId), {
            preserveScroll: true,
            onSuccess: () => {
                setChildrenCache(prev => {
                    const next = { ...prev };
                    if (next[parentId]) next[parentId] = next[parentId].filter(c => c.pivot_id !== pivotId);
                    return next;
                });
            },
            onFinish: () => setConfirmDeleteId(null),
        });
    };

    const toggleExpand = (id) => {
        setExpanded(prev => {
            const next = new Set(prev);
            const willExpand = !next.has(id);
            if (willExpand) {
                if (!childrenCache[id]) {
                    setLoadingChild(id);
                    const routeName = isModuleView ? 'inscriptions.moduleStudents' : 'inscriptions.studentModules';
                    axios.get(route(routeName, id))
                        .then(res => {
                            setChildrenCache(prev2 => ({ ...prev2, [id]: res.data ?? [] }));
                            setLoadingChild(null);
                        })
                        .catch(() => setLoadingChild(null));
                }
            }
            willExpand ? next.add(id) : next.delete(id);
            return next;
        });
    };

    const isModuleView = groupBy === 'module';
    const deleteForm = useForm();
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    return (
        <>
            <Head title={t('inscriptionPedagogique')} />

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium
                    ${toast.isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    <Icon d={toast.isErr ? I.close : I.check} className="h-4 w-4 shrink-0" />
                    {toast.text}
                </div>
            )}

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white">{t('inscriptionPedagogique')}</h1>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                        {locale === 'ar' ? 'إدارة تسجيلات الطلاب في الوحدات الدراسية' : 'Gérer les inscriptions des étudiants aux modules'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowExcel(true)}
                        title={locale === 'ar' ? 'استيراد Excel' : 'Import Excel'}
                        className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 active:scale-95 transition">
                        <Icon d={I.excel} className="h-4 w-4" />
                        <span className="hidden sm:inline">{locale === 'ar' ? 'استيراد Excel' : 'Import Excel'}</span>
                    </button>
                    <button onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition">
                        <Icon d={I.plus} className="h-4 w-4" />
                        {locale === 'ar' ? 'تسجيل جديد' : 'Nouvelle inscription'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard icon={I.link} label={locale === 'ar' ? 'إجمالي التسجيلات' : 'Total inscriptions'}
                    value={stats?.total ?? 0} color="bg-indigo-500" />
                <StatCard icon={I.users} label={locale === 'ar' ? 'الطلاب المسجلين' : 'Étudiants inscrits'}
                    value={stats?.students ?? 0} color="bg-emerald-500" />
                <StatCard icon={I.book} label={locale === 'ar' ? 'الوحدات النشطة' : 'Modules actifs'}
                    value={stats?.modules ?? 0} color="bg-violet-500" />
            </div>

            {/* Group toggle + search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                    <button onClick={() => toggleGroup('student')}
                        className={`px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5
                            ${!isModuleView
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                        <Icon d={I.users} className="h-3.5 w-3.5" />
                        {locale === 'ar' ? 'حسب الطالب' : 'Par étudiant'}
                    </button>
                    <button onClick={() => toggleGroup('module')}
                        className={`px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5
                            ${isModuleView
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                        <Icon d={I.book} className="h-3.5 w-3.5" />
                        {locale === 'ar' ? 'حسب الوحدة' : 'Par module'}
                    </button>
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Icon d={I.search} className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" value={search}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder={isModuleView
                            ? (locale === 'ar' ? 'ابحث عن وحدة...' : 'Rechercher un module...')
                            : (locale === 'ar' ? 'ابحث عن طالب...' : 'Rechercher un étudiant...')}
                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ps-9 pe-4 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition shadow-sm" />
                </div>
                {/* Niveau filter */}
                <select value={filters?.niveau_id ?? ''}
                    onChange={e => handleNiveauFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 transition shadow-sm">
                    <option value="">{locale === 'ar' ? 'كل المستويات' : 'Tous les niveaux'}</option>
                    {niveaux?.map(n => (
                        <option key={n.id} value={n.id}>
                            {locale === 'ar' ? (n.nom_ar || n.nom_fr) : n.nom_fr}
                            {n.filiere ? ` (${locale === 'ar' ? n.filiere.nom_ar : n.filiere.nom_fr})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tree view */}
            {items?.data?.length > 0 ? (
                <div className="space-y-3">
                    {items.data.map(item => {
                        const isOpen = expanded.has(item.id);
                        const children = childrenCache[item.id] ?? [];
                        const hasChildren = item.inscriptions_count > 0;
                        return (
                            <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                                {/* Parent card */}
                                <div className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
                                    onClick={() => toggleExpand(item.id)}>
                                    {isModuleView ? (
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                                                <Icon d={I.book} className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                                        {locale === 'ar' ? (item.nom_ar || item.nom_fr) : (item.nom_fr || item.nom_ar || '')}
                                                    </span>
                                                    <code className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.code_module || ''}</code>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    {item.semestre && <span className="text-xs text-slate-400">{locale === 'ar' ? item.semestre.nom_ar : item.semestre.nom_fr}</span>}
                                                    {item.niveau && <span className="text-xs text-slate-400">{locale === 'ar' ? item.niveau.nom_ar : item.niveau.nom_fr}</span>}
                                                    {item.filiere && <span className="text-xs text-slate-400">{locale === 'ar' ? item.filiere.nom_ar : item.filiere.nom_fr}</span>}
                                                    <span className="text-xs text-slate-300">·</span>
                                                    <span className={`text-xs ${hasChildren ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                                        {hasChildren
                                                            ? (locale === 'ar' ? `${item.inscriptions_count} طالب` : `${item.inscriptions_count} étudiant${item.inscriptions_count > 1 ? 's' : ''}`)
                                                            : (locale === 'ar' ? 'لا يوجد طلاب' : 'Aucun étudiant')}
                                                    </span>
                                                    {item.coefficient && <><span className="text-xs text-slate-300">·</span><span className="text-xs text-slate-400">{locale === 'ar' ? 'المعامل:' : 'Coeff:'} {item.coefficient}</span></>}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-indigo-300 dark:ring-indigo-600">
                                                {item.photo_url
                                                    ? <img src={item.photo_url} alt="" className="h-full w-full object-cover" />
                                                    : <span className="text-xs font-bold text-slate-500">{(item.prenom_fr?.[0] || item.nom_fr?.[0] || '?').toUpperCase()}</span>
                                                }
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                                        {locale === 'ar'
                                                            ? (item.nom_ar || item.nom_fr || '') + ' ' + (item.prenom_ar || item.prenom_fr || '')
                                                            : (item.nom_fr || '') + ' ' + (item.prenom_fr || '')}
                                                    </span>
                                                    {item.CNE && <code className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.CNE}</code>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    {item.niveau && <span className="text-xs text-slate-400">{locale === 'ar' ? item.niveau.nom_ar : item.niveau.nom_fr}</span>}
                                                    {item.filiere && <span className="text-xs text-slate-400">{locale === 'ar' ? item.filiere.nom_ar : item.filiere.nom_fr}</span>}
                                                    <span className="text-xs text-slate-300">·</span>
                                                    <span className={`text-xs ${hasChildren ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                                        {hasChildren
                                                            ? (locale === 'ar' ? `${item.inscriptions_count} وحدة` : `${item.inscriptions_count} module${item.inscriptions_count > 1 ? 's' : ''}`)
                                                            : (locale === 'ar' ? 'لا توجد وحدات' : 'Aucun module')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <Icon d={isOpen ? I.down : I.up} className="h-4 w-4 text-slate-400 shrink-0" />
                                </div>

                                {/* Expanded children */}
                                {isOpen && hasChildren && (
                                    <div className="border-t border-slate-100 dark:border-slate-700/60">
                                        {loadingChild === item.id ? (
                                            <div className="px-5 py-6 text-center">
                                                <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                                            </div>
                                        ) : children.length === 0 ? (
                                            <div className="px-5 py-4 text-center text-xs text-slate-400">
                                                {locale === 'ar' ? 'لا يوجد بيانات' : 'Aucune donnée'}
                                            </div>
                                        ) : children.map((child, cIdx) => (
                                            <div key={`${item.id}-${child.id}`}
                                                className={`flex items-center justify-between px-5 py-3 ${cIdx < children.length - 1 ? 'border-b border-slate-50 dark:border-slate-700/30' : ''} hover:bg-slate-50/70 dark:hover:bg-slate-700/20 transition`}>
                                                {isModuleView ? (
                                                    <>
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="relative flex items-center">
                                                                <div className="absolute start-0 top-1/2 w-4 border-t border-slate-300 dark:border-slate-600" style={{ [isRTL ? 'right' : 'left']: '-8px' }} />
                                                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden ${isRTL ? 'mr-5' : 'ml-5'}`}>
                                                                    {child.photo_url
                                                                        ? <img src={child.photo_url} alt="" className="h-full w-full object-cover" />
                                                                        : <span className="text-[9px] font-bold text-slate-500">{(child.prenom_fr?.[0] || child.nom_fr?.[0] || '?').toUpperCase()}</span>
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                                                        {locale === 'ar'
                                                                            ? (child.nom_ar || child.nom_fr || '') + ' ' + (child.prenom_ar || child.prenom_fr || '')
                                                                            : (child.nom_fr || '') + ' ' + (child.prenom_fr || '')}
                                                                    </span>
                                                                    {child.CNE && <code className="text-[10px] font-mono text-slate-400">{child.CNE}</code>}
                                                                </div>
                                                                {(child.niveau || child.filiere) && (
                                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                                        {[child.niveau ? (locale === 'ar' ? child.niveau.nom_ar : child.niveau.nom_fr) : '', child.filiere ? (locale === 'ar' ? child.filiere.nom_ar : child.filiere.nom_fr) : ''].filter(Boolean).join(' · ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {confirmDeleteId === child.pivot_id ? (
                                                            <span className="inline-flex items-center gap-1 shrink-0">
                                                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'تأكيد؟' : 'Confirmer ?'}</span>
                                                                <button onClick={(e) => { e.stopPropagation(); doDelete(item.id, child.pivot_id); }}
                                                                    disabled={deleteForm.processing}
                                                                    className="rounded-lg bg-red-500 hover:bg-red-600 px-2 py-1 text-[10px] font-semibold text-white transition disabled:opacity-50">
                                                                    {locale === 'ar' ? 'نعم' : 'Oui'}
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                                                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                                    {locale === 'ar' ? 'لا' : 'Non'}
                                                                </button>
                                                            </span>
                                                        ) : (
                                                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(child.pivot_id); }}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 px-2.5 py-1 text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0">
                                                                <Icon d={I.trash} className="h-3 w-3" />
                                                                {locale === 'ar' ? 'إلغاء' : 'Retirer'}
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="relative flex items-center">
                                                                <div className="absolute start-0 top-1/2 w-4 border-t border-slate-300 dark:border-slate-600" style={{ [isRTL ? 'right' : 'left']: '-8px' }} />
                                                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20 ${isRTL ? 'mr-5' : 'ml-5'}`}>
                                                                    <Icon d={I.book} className="h-3.5 w-3.5 text-violet-500" />
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                                                        {locale === 'ar' ? (child.nom_ar || child.nom_fr) : (child.nom_fr || child.nom_ar || '')}
                                                                    </span>
                                                                    {child.code_module && <code className="text-[10px] font-mono text-slate-400">{child.code_module}</code>}
                                                                </div>
                                                                <span className="text-xs text-slate-400">{locale === 'ar' ? 'المعامل:' : 'Coeff:'} {child.coefficient ?? '—'}</span>
                                                                {(child.semestre || child.niveau || child.filiere) && (
                                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                                        {[child.semestre ? (locale === 'ar' ? child.semestre.nom_ar : child.semestre.nom_fr) : '', child.niveau ? (locale === 'ar' ? child.niveau.nom_ar : child.niveau.nom_fr) : '', child.filiere ? (locale === 'ar' ? child.filiere.nom_ar : child.filiere.nom_fr) : ''].filter(Boolean).join(' · ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {confirmDeleteId === child.pivot_id ? (
                                                            <span className="inline-flex items-center gap-1 shrink-0">
                                                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'تأكيد؟' : 'Confirmer ?'}</span>
                                                                <button onClick={(e) => { e.stopPropagation(); doDelete(item.id, child.pivot_id); }}
                                                                    disabled={deleteForm.processing}
                                                                    className="rounded-lg bg-red-500 hover:bg-red-600 px-2 py-1 text-[10px] font-semibold text-white transition disabled:opacity-50">
                                                                    {locale === 'ar' ? 'نعم' : 'Oui'}
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                                                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                                    {locale === 'ar' ? 'لا' : 'Non'}
                                                                </button>
                                                            </span>
                                                        ) : (
                                                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(child.pivot_id); }}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 px-2.5 py-1 text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0">
                                                                <Icon d={I.trash} className="h-3 w-3" />
                                                                {locale === 'ar' ? 'إلغاء' : 'Retirer'}
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        {isModuleView ? (
                                            <div className="border-t border-slate-50 dark:border-slate-700/30 px-5 py-2.5 text-center">
                                                <button onClick={() => { setPreselectedModuleId(item.id); setShowAdd(true); }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition">
                                                    <Icon d={I.plus} className="h-3 w-3" />{locale === 'ar' ? 'تسجيل طالب' : 'Inscrire un étudiant'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-t border-slate-50 dark:border-slate-700/30 px-5 py-2.5 text-center">
                                                <button onClick={() => { setPreselectedStudentId(item.id); setShowAdd(true); }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition">
                                                    <Icon d={I.plus} className="h-3 w-3" />{locale === 'ar' ? 'تسجيل وحدة' : 'Inscrire un module'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Empty expanded state */}
                                {isOpen && !hasChildren && (
                                    <div className="border-t border-slate-100 dark:border-slate-700/60 px-5 py-6 text-center space-y-3">
                                        <p className="text-xs text-slate-400">
                                            {isModuleView
                                                ? (locale === 'ar' ? 'لا يوجد طلاب مسجلون في هذه الوحدة' : 'Aucun étudiant inscrit dans ce module')
                                                : (locale === 'ar' ? 'هذا الطالب غير مسجل في أي وحدة' : 'Aucun module inscrit pour cet étudiant')}
                                        </p>
                                        {isModuleView ? (
                                            <button onClick={() => { setPreselectedModuleId(item.id); setShowAdd(true); }}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition">
                                                <Icon d={I.plus} className="h-3 w-3" />{locale === 'ar' ? 'تسجيل طالب' : 'Inscrire un étudiant'}
                                            </button>
                                        ) : (
                                            <button onClick={() => { setPreselectedStudentId(item.id); setShowAdd(true); }}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition">
                                                <Icon d={I.plus} className="h-3 w-3" />{locale === 'ar' ? 'تسجيل وحدة' : 'Inscrire un module'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex flex-col items-center justify-center py-16 px-5">
                    <Icon d={isModuleView ? I.book : I.users} className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-400">
                        {search
                            ? (locale === 'ar' ? 'لا توجد نتائج للبحث' : 'Aucun résultat')
                            : (locale === 'ar' ? 'لا توجد تسجيلات بعد' : 'Aucune inscription pour le moment')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {locale === 'ar' ? 'استخدم زر "تسجيل جديد" لإضافة تسجيل' : 'Utilisez le bouton "Nouvelle inscription" pour ajouter'}
                    </p>
                </div>
            )}

            {/* Pagination */}
            {items?.last_page > 1 && (
                <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                        {items.from}–{items.to} / {items.total}
                    </p>
                    <div className="flex gap-1">
                        {items.links?.filter(l => !['...'].includes(l.label)).map((link, i) => (
                            <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                disabled={!link.url}
                                className={`h-8 min-w-8 rounded-lg text-xs font-medium transition
                                    ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            {showAdd && <AddModal allModules={allModules} preselectedModuleId={preselectedModuleId} preselectedStudentId={preselectedStudentId} onClose={() => { setShowAdd(false); setPreselectedModuleId(null); setPreselectedStudentId(null); }} t={t} locale={locale} />}
            {showExcel && <ExcelModal onClose={() => { setShowExcel(false); router.reload({ only: ['items', 'stats'] }); }} t={t} locale={locale} />}
        </>
    );
}

export default function InscriptionsIndex(props) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <PageContent {...props} />
            </AdminLayout>
        </LanguageProvider>
    );
}
