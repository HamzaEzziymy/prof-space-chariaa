import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function Icon({ d, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const I = {
    search:     'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    check:      'M5 13l4 4L19 7',
    close:      'M6 18L18 6M6 6l12 12',
    chevDown:   'M19 9l-7 7-7-7',
    chevRight:  'M9 5l7 7-7 7',
    building:   'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    male:       'M16 3h5m0 0v5m0-5l-6 6M9 15a6 6 0 100-12 6 6 0 000 12z',
    female:     'M12 14a6 6 0 100-12 6 6 0 000 12zm0 0v8m-4-4h8',
    users:      'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    plus:       'M12 4v16m8-8H4',
    shuffle:    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    alert:      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
    doorOpen:   'M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z',
    empty:      'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    school:     'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zM12 14l-9-5v8a2 2 0 002 2h14a2 2 0 002-2V9l-9 5z',
};

function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg = flash?.success || flash?.error;
    const isErr = !!flash?.error;
    useEffect(() => {
        if (msg) { setVisible(true); const id = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(id); }
    }, [msg]);
    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium ${isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <Icon d={isErr ? I.close : I.check} className="h-4 w-4 shrink-0" />
            {msg}
        </div>
    );
}

// ─── Create Repartition Modal ─────────────────────────────────────────────────
function CreateRepartitionModal({ onClose, filieres, allNiveaux, allSemestres, allModules, salles, t, locale, isRTL }) {
    const [filiereId, setFiliereId]      = useState('');
    const [niveauId, setNiveauId]       = useState('');
    const [semestreId, setSemestreId]   = useState('');
    const [moduleId, setModuleId]       = useState('');
    const [nexam, setNexam]             = useState(1);
    const [students, setStudents]       = useState([]);
    const [loading, setLoading]         = useState(false);
    const [saving, setSaving]           = useState(false);
    const [assignMap, setAssignMap]     = useState({});
    const [step, setStep]               = useState('select'); // select | assign

    const sallesWithCap = salles.filter(s => s.capacite > 0);

    // Client-side cascading filters
    const niveauxForModal = filiereId
        ? allNiveaux.filter(n => n.filiere_id == filiereId)
        : [];

    const semestresForModal = niveauId
        ? allSemestres.filter(s => s.niveau_id == niveauId)
        : [];

    const modulesForModal = semestreId
        ? allModules.filter(m => m.semestre_id == semestreId)
        : [];

    const handleFiliere = (v) => { setFiliereId(v); setNiveauId(''); setSemestreId(''); setModuleId(''); setStudents([]); };
    const handleNiveau = (v) => { setNiveauId(v); setSemestreId(''); setModuleId(''); setStudents([]); };
    const handleSemestre = (v) => { setSemestreId(v); setModuleId(''); setStudents([]); };

    const handleModule = async (v) => {
        setModuleId(v);
        if (!v) { setStudents([]); return; }
        setLoading(true);
        try {
            const res = await window.axios.get(route('repartition.students', { module_id: v, Nexam: nexam }));
            setStudents(res.data);
            const map = {};
            res.data.forEach(s => { if (s.id_salle) map[s.etud_mod_id] = s.id_salle; });
            setAssignMap(map);
        } catch { setStudents([]); }
        setLoading(false);
    };

    const handleNexam = (v) => { setNexam(v); if (moduleId) handleModule(moduleId); };

    const assignStudent = (etudModId, salleId) => {
        setAssignMap(prev => ({ ...prev, [etudModId]: salleId }));
    };

    const autoDistribute = () => {
        if (sallesWithCap.length === 0 || students.length === 0) return;
        const sorted = [...students].sort((a, b) => {
            const na = (a.etudiant?.nom_fr || '') + (a.etudiant?.prenom_fr || '');
            const nb = (b.etudiant?.nom_fr || '') + (b.etudiant?.prenom_fr || '');
            return na.localeCompare(nb);
        });
        const caps = sallesWithCap.map(s => ({ id: s.id, remaining: s.capacite }));
        const map = {};
        let idx = 0;
        for (const s of sorted) {
            const room = caps[idx % caps.length];
            if (room.remaining <= 0) {
                const avail = caps.find(c => c.remaining > 0);
                if (!avail) break;
                map[s.etud_mod_id] = avail.id;
                avail.remaining--;
            } else {
                map[s.etud_mod_id] = room.id;
                room.remaining--;
            }
            idx++;
        }
        setAssignMap(map);
    };

    const save = () => {
        if (!moduleId || students.length === 0) return;
        setSaving(true);
        const repartition = Object.entries(assignMap).map(([etudModId, salleId]) => ({
            etud_mod_id: parseInt(etudModId),
            id_salle: salleId || null,
        }));
        router.post(route('repartition.save'), {
            module_id: parseInt(moduleId),
            Nexam: parseInt(nexam),
            repartition,
        }, {
            preserveScroll: true,
            onSuccess: () => { setTimeout(() => onClose(), 500); },
            onFinish: () => setSaving(false),
        });
    };

    const getRoomStudents = (salleId) => students.filter(s => (assignMap[s.etud_mod_id] ?? null) === salleId);
    const getUnassigned = () => students.filter(s => !assignMap[s.etud_mod_id]);
    const assignedCount = Object.keys(assignMap).length;
    const hasModule = !!moduleId;
    const stepLabel = step === 'select'
        ? (locale === 'ar' ? 'اختيار' : 'Sélection')
        : (locale === 'ar' ? 'توزيع' : 'Répartition');

    const goToAssign = () => {
        if (moduleId) setStep('assign');
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[94vh]"
                    dir={isRTL ? 'rtl' : 'ltr'}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-900/20 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                                <Icon d={I.plus} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{t('repartitionCreateTitle')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {step === 'select' ? t('repartitionCreateSubtitle') : stepLabel}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 transition">
                            <Icon d={I.close} className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <button onClick={() => setStep('select')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${step === 'select' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-600'}`}>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/20 text-[10px] font-bold">1</span>
                            {locale === 'ar' ? 'اختيار' : 'Sélection'}
                        </button>
                        <div className="h-px flex-1 border-t border-dashed border-slate-300 dark:border-slate-600" />
                        <button onClick={() => hasModule && goToAssign()}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${step === 'assign' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-600'}`}>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/20 text-[10px] font-bold">2</span>
                            {locale === 'ar' ? 'توزيع' : 'Répartition'}
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 px-6 py-5">
                        {step === 'select' ? (
                            <div className="space-y-5">
                                {/* Cascading selects */}
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('selectFiliere')}</label>
                                        <select value={filiereId} onChange={e => handleFiliere(e.target.value)}
                                            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                            <option value="">{locale === 'ar' ? 'اختر الشعبة...' : 'Filière...'}</option>
                                            {filieres.map(f => (
                                                <option key={f.id} value={f.id}>{f.code} — {locale === 'ar' ? (f.nom_ar || f.nom_fr) : f.nom_fr}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('selectNiveau')}</label>
                                        <select value={niveauId} onChange={e => handleNiveau(e.target.value)} disabled={!filiereId}
                                            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50">
                                            <option value="">{locale === 'ar' ? 'اختر المستوى...' : 'Niveau...'}</option>
                                            {niveauxForModal.map(n => (
                                                <option key={n.id} value={n.id}>{locale === 'ar' ? (n.nom_ar || n.nom_fr) : n.nom_fr} ({n.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('selectSemestre')}</label>
                                        <select value={semestreId} onChange={e => handleSemestre(e.target.value)} disabled={!niveauId}
                                            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50">
                                            <option value="">{locale === 'ar' ? 'اختر الفصل...' : 'Semestre...'}</option>
                                            {semestresForModal.map(s => (
                                                <option key={s.id} value={s.id}>{locale === 'ar' ? (s.nom_ar || s.nom_fr) : s.nom_fr} ({s.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('selectModule')}</label>
                                        <select value={moduleId} onChange={e => handleModule(e.target.value)} disabled={!semestreId}
                                            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50">
                                            <option value="">{locale === 'ar' ? 'اختر المادة...' : 'Module...'}</option>
                                            {modulesForModal.map(m => (
                                                <option key={m.id} value={m.id}>{locale === 'ar' ? (m.nom_ar || m.nom_fr) : m.nom_fr} ({m.code_module})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('selectNexam')}</label>
                                        <select value={nexam} onChange={e => handleNexam(e.target.value)}
                                            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                            {[1,2,3,4,5,6].map(n => (
                                                <option key={n} value={n}>{t('nexamLabel')} {n}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Students preview when module is selected */}
                                {loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <svg className="h-6 w-6 animate-spin text-slate-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    </div>
                                )}
                                {!loading && hasModule && (
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                {students.length} {t('repartitionStudents')}
                                            </span>
                                            <button onClick={goToAssign}
                                                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition">
                                                {locale === 'ar' ? 'توزيع' : 'Répartir'}
                                                <Icon d={I.chevRight} className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
                                            {students.slice(0, 20).map(s => (
                                                <div key={s.etud_mod_id} className="flex items-center gap-2 px-4 py-2 text-xs">
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                                                        {s.etudiant?.sexe === 'F'
                                                            ? <Icon d={I.female} className="h-2.5 w-2.5 text-rose-500" />
                                                            : <Icon d={I.male} className="h-2.5 w-2.5 text-indigo-500" />}
                                                    </span>
                                                    <span className="flex-1 text-slate-700 dark:text-slate-300">
                                                        {locale === 'ar'
                                                            ? `${s.etudiant?.prenom_ar || s.etudiant?.prenom_fr} ${s.etudiant?.nom_ar || s.etudiant?.nom_fr}`
                                                            : `${s.etudiant?.prenom_fr} ${s.etudiant?.nom_fr}`}
                                                    </span>
                                                    <code className="text-[10px] text-slate-400">{s.etudiant?.CNE}</code>
                                                </div>
                                            ))}
                                            {students.length > 20 && (
                                                <p className="px-4 py-2 text-xs text-slate-400 text-center">
                                                    {locale === 'ar' ? `و ${students.length - 20} آخرون` : `et ${students.length - 20} autres`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {!hasModule && !loading && (
                                    <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        <Icon d={I.search} className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{t('repartitionNoModule')}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── Step 2: Assignment ── */
                            <div className="space-y-5">
                                {/* Summary bar */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[ 
                                        { label: t('repartitionTotalStudents'), value: students.length, icon: I.users, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                                        { label: t('repartitionAssigned'), value: assignedCount, icon: I.check, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                                        { label: t('repartitionUnassigned'), value: getUnassigned().length, icon: I.alert, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                                    ].map((c, i) => (
                                        <div key={i} className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.color}`}>
                                                <Icon d={c.icon} className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{c.value}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Auto-distribute */}
                                <div className="flex items-center justify-between">
                                    <button onClick={autoDistribute}
                                        className="flex items-center gap-2 rounded-xl bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition">
                                        <Icon d={I.shuffle} className="h-4 w-4" />
                                        {t('repartitionAuto')}
                                    </button>
                                    <span className="text-xs text-slate-400">
                                        {locale === 'ar' ? `تم توزيع ${assignedCount} من ${students.length}` : `${assignedCount}/${students.length} assignés`}
                                    </span>
                                </div>

                                {/* Room + unassigned cards */}
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {sallesWithCap.map(room => {
                                        const rStudents = getRoomStudents(room.id);
                                        const cap = room.capacite;
                                        const overCap = rStudents.length > cap;
                                        const fillPct = cap > 0 ? Math.round((rStudents.length / cap) * 100) : 0;
                                        return (
                                            <div key={room.id} className={`rounded-2xl border shadow-sm dark:bg-slate-800 overflow-hidden ${overCap ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}>
                                                <div className={`px-4 py-3 flex items-center justify-between border-b ${overCap ? 'border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10' : 'border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'}`}>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${overCap ? 'bg-red-100 dark:bg-red-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                                                            <Icon d={I.building} className={`h-4 w-4 ${overCap ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                                {locale === 'ar' ? (room.nomSalle_ar || room.nomSalle_fr || room.code_salle) : (room.nomSalle_fr || room.nomSalle_ar || room.code_salle)}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 font-mono">{room.code_salle}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-sm font-bold ${overCap ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                                            {rStudents.length}<span className="text-xs font-normal text-slate-400">/{cap}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700">
                                                    <div className={`h-full transition-all duration-500 ${overCap ? 'bg-red-500' : fillPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${Math.min(fillPct, 100)}%` }} />
                                                </div>
                                                <div className="max-h-48 overflow-y-auto p-2">
                                                    {rStudents.length === 0 ? (
                                                        <p className="py-3 text-center text-xs text-slate-400">{locale === 'ar' ? 'لا يوجد طلاب' : 'Aucun étudiant'}</p>
                                                    ) : (
                                                        rStudents.map(s => (
                                                            <div key={s.etud_mod_id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/30 transition group/item">
                                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                                                                    {s.etudiant?.sexe === 'F'
                                                                        ? <Icon d={I.female} className="h-3 w-3 text-rose-500" />
                                                                        : <Icon d={I.male} className="h-3 w-3 text-indigo-500" />}
                                                                </span>
                                                                <span className="flex-1 truncate text-slate-700 dark:text-slate-300">
                                                                    {locale === 'ar'
                                                                        ? `${s.etudiant?.prenom_ar || s.etudiant?.prenom_fr} ${s.etudiant?.nom_ar || s.etudiant?.nom_fr}`
                                                                        : `${s.etudiant?.prenom_fr} ${s.etudiant?.nom_fr}`}
                                                                </span>
                                                                <code className="text-[10px] text-slate-400 font-mono">{s.etudiant?.CNE}</code>
                                                                <select value={room.id}
                                                                    onChange={e => assignStudent(s.etud_mod_id, e.target.value || null)}
                                                                    className="ml-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] opacity-0 group-hover/item:opacity-100 transition focus:opacity-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                                                                    {sallesWithCap.map(r => (
                                                                        <option key={r.id} value={r.id}>{r.code_salle}</option>
                                                                    ))}
                                                                    <option value="">—</option>
                                                                </select>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Unassigned card */}
                                    {getUnassigned().length > 0 && (
                                        <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-amber-100 dark:border-amber-900/30">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                                        <Icon d={I.alert} className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{t('repartitionUnassigned')}</p>
                                                        <p className="text-[11px] text-amber-600 dark:text-amber-400">{getUnassigned().length} {t('repartitionStudents')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto p-2">
                                                {getUnassigned().map(s => (
                                                    <div key={s.etud_mod_id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20 transition group/item">
                                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
                                                            {s.etudiant?.sexe === 'F'
                                                                ? <Icon d={I.female} className="h-3 w-3 text-rose-500" />
                                                                : <Icon d={I.male} className="h-3 w-3 text-indigo-500" />}
                                                        </span>
                                                        <span className="flex-1 truncate text-slate-700 dark:text-slate-300">
                                                            {locale === 'ar'
                                                                ? `${s.etudiant?.prenom_ar || s.etudiant?.prenom_fr} ${s.etudiant?.nom_ar || s.etudiant?.nom_fr}`
                                                                : `${s.etudiant?.prenom_fr} ${s.etudiant?.nom_fr}`}
                                                        </span>
                                                        <code className="text-[10px] text-slate-400 font-mono">{s.etudiant?.CNE}</code>
                                                        <select value=""
                                                            onChange={e => assignStudent(s.etud_mod_id, e.target.value || null)}
                                                            className="ml-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] opacity-0 group-hover/item:opacity-100 transition focus:opacity-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                                                            <option value="">{t('repartitionMove')}…</option>
                                                            {sallesWithCap.map(r => (
                                                                <option key={r.id} value={r.id}>{r.code_salle} — {locale === 'ar' ? (r.nomSalle_ar || r.nomSalle_fr) : (r.nomSalle_fr || r.nomSalle_ar)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className={`shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {step === 'assign' ? (
                            <>
                                <button onClick={() => setStep('select')}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                    {locale === 'ar' ? 'رجوع' : 'Retour'}
                                </button>
                                <div className="flex items-center gap-2">
                                    <button onClick={onClose}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                        {t('cancel')}
                                    </button>
                                    <button onClick={save} disabled={saving || students.length === 0}
                                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition active:scale-95">
                                        {saving ? (
                                            <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>...</>
                                        ) : (
                                            <><Icon d={I.check} className="h-4 w-4" />{t('repartitionSave')}</>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex w-full items-center justify-between">
                                <button onClick={onClose}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                    {t('cancel')}
                                </button>
                                <button onClick={goToAssign} disabled={!hasModule}
                                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition active:scale-95">
                                    {locale === 'ar' ? 'التالي' : 'Suivant'}
                                    <Icon d={I.chevRight} className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Niveau Card ──────────────────────────────────────────────────────────────
function NiveauCard({ niveau, t, locale, isRTL }) {
    const name = locale === 'ar' ? (niveau.nom_ar || niveau.nom_fr) : (niveau.nom_fr || niveau.nom_ar);
    const filiereCode = niveau.filiere?.code || '';
    const filiereName = locale === 'ar' ? (niveau.filiere?.nom_ar || niveau.filiere?.nom_fr || '') : (niveau.filiere?.nom_fr || niveau.filiere?.nom_ar || '');
    const total = parseInt(niveau.total_students || 0);
    const assigned = parseInt(niveau.assigned_count || 0);
    const unassigned = total - assigned;
    const fillPct = total > 0 ? Math.round((assigned / total) * 100) : 0;

    return (
        <Link href={route('repartition.show', niveau.id)}
            className="group block rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
            {/* Top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-400 to-purple-500" />

            <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                            <Icon d={I.school} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{name}</p>
                            <p className="text-xs text-slate-400 font-mono">{niveau.code}</p>
                        </div>
                    </div>
                    {/* Filiere badge */}
                    {filiereCode && (
                        <span className="shrink-0 rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {filiereCode}
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                            <Icon d={I.users} className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200">{total}</p>
                            <p className="text-[10px] text-slate-400">{locale === 'ar' ? 'طالب' : t('repartitionStudents')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                            <Icon d={I.check} className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200">{assigned}</p>
                            <p className="text-[10px] text-slate-400">{locale === 'ar' ? 'موزع' : t('repartitionAssigned')}</p>
                        </div>
                    </div>
                    {unassigned > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                <Icon d={I.alert} className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-amber-600 dark:text-amber-400">{unassigned}</p>
                                <p className="text-[10px] text-slate-400">{locale === 'ar' ? 'غير موزع' : t('repartitionUnassigned')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Fill bar */}
                <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>{locale === 'ar' ? 'نسبة التوزيع' : 'Taux de répartition'}</span>
                        <span>{fillPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${fillPct === 100 ? 'bg-emerald-500' : fillPct > 50 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                            style={{ width: `${fillPct}%` }} />
                    </div>
                </div>

                {/* View details */}
                <div className="flex items-center justify-center pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition">
                        {t('repartitionViewDetails')}
                        <Icon d={I.chevRight} className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
function RepartitionContent({ filieres, niveaux, allNiveaux, allSemestres, allModules, salles, t, locale, isRTL }) {
    const { flash } = usePage().props;
    const [showCreate, setShowCreate] = useState(false);

    // Group niveaux by filiere
    const grouped = {};
    niveaux.forEach(n => {
        const key = n.filiere?.id || 'other';
        if (!grouped[key]) grouped[key] = { filiere: n.filiere, niveaux: [] };
        grouped[key].niveaux.push(n);
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <Toast flash={flash} t={t} />

                {/* Header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('repartitionNiveauTitle')}</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('repartitionNiveauSubtitle')}</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition active:scale-95">
                        <Icon d={I.plus} className="h-4 w-4" />
                        {t('repartitionCreate')}
                    </button>
                </div>

                {/* No niveaux */}
                {niveaux.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-24 dark:border-slate-700 dark:bg-slate-800">
                        <Icon d={I.empty} className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                            {locale === 'ar' ? 'لا توجد مستويات بعد' : 'Aucun niveau pour le moment'}
                        </p>
                    </div>
                ) : (
                    /* Grouped by filiere */
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([key, group]) => (
                            <div key={key}>
                                {/* Filiere header */}
                                {group.filiere && (
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                                            <Icon d={I.school} className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                {locale === 'ar' ? (group.filiere.nom_ar || group.filiere.nom_fr) : (group.filiere.nom_fr || group.filiere.nom_ar)}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-mono">{group.filiere.code}</p>
                                        </div>
                                        <div className="flex-1 border-t border-slate-200 dark:border-slate-700 mx-3" />
                                        <span className="text-xs text-slate-400">{group.niveaux.length} {locale === 'ar' ? 'مستوى' : 'niveau(x)'}</span>
                                    </div>
                                )}

                                {/* Niveau cards grid */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {group.niveaux.map(n => (
                                        <NiveauCard key={n.id} niveau={n} t={t} locale={locale} isRTL={isRTL} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create modal */}
            {showCreate && (
                <CreateRepartitionModal
                    onClose={() => setShowCreate(false)}
                    filieres={filieres} allNiveaux={allNiveaux}
                    allSemestres={allSemestres} allModules={allModules}
                    salles={salles} t={t} locale={locale} isRTL={isRTL}
                />
            )}
        </div>
    );
}

export default function RepartitionIndex({ filieres, niveaux, allNiveaux, allSemestres, allModules, salles }) {
    const { t, locale, isRTL } = useLanguage();
    return (
        <LanguageProvider>
            <AdminLayout>
                <Head title={t('repartitionTitle')} />
                <RepartitionContent {...{ filieres, niveaux, allNiveaux, allSemestres, allModules, salles, t, locale, isRTL }} />
            </AdminLayout>
        </LanguageProvider>
    );
}
