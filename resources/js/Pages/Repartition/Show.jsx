import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
    chevLeft:   'M15 19l-7-7 7-7',
    chevRight:  'M9 5l7 7-7 7',
    building:   'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    male:       'M16 3h5m0 0v5m0-5l-6 6M9 15a6 6 0 100-12 6 6 0 000 12z',
    female:     'M12 14a6 6 0 100-12 6 6 0 000 12zm0 0v8m-4-4h8',
    users:      'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    shuffle:    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    alert:      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
    doorOpen:   'M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z',
    empty:      'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
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

function StatCard({ label, value, icon, color }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon d={icon} className="h-5 w-5" />
            </div>
            <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
        </div>
    );
}

function RepartitionShowContent({ niveau, semestres, modules, salles, students, totalCapacite, filters, t, locale, isRTL }) {
    const { flash } = usePage().props;
    const [moduleId, setModuleId]     = useState(filters?.module_id ?? '');
    const [nexam, setNexam]           = useState(filters?.Nexam ?? 1);
    const [assignMap, setAssignMap]   = useState({});
    const [saving, setSaving]         = useState(false);

    const niveauName = locale === 'ar' ? (niveau.nom_ar || niveau.nom_fr) : (niveau.nom_fr || niveau.nom_ar);
    const filiereCode = niveau.filiere?.code || '';
    const filiereName = locale === 'ar' ? (niveau.filiere?.nom_ar || niveau.filiere?.nom_fr || '') : (niveau.filiere?.nom_fr || niveau.filiere?.nom_ar || '');

    const moduleOptions = modules.map(m => ({
        value: m.id,
        label: `${locale === 'ar' ? (m.nom_ar || m.nom_fr) : m.nom_fr || m.nom_ar} (${m.code_module})`,
    }));

    // Init assignMap from server data
    useEffect(() => {
        const map = {};
        (students ?? []).forEach(s => {
            if (s.id_salle) map[s.etud_mod_id] = s.id_salle;
        });
        setAssignMap(map);
    }, [students]);

    const applyFilters = (overrides = {}) => {
        const params = {};
        const f = { moduleId, nexam, ...overrides };
        if (f.moduleId) params.module_id = f.moduleId;
        params.Nexam = f.nexam;
        router.get(route('repartition.show', niveau.id), params, { preserveState: true, replace: true });
    };

    const handleModule = (v) => { setModuleId(v); applyFilters({ moduleId: v }); };
    const handleNexam  = (v) => { setNexam(v); applyFilters({ nexam: v }); };

    const hasModule = !!moduleId;
    const sallesWithCap = salles.filter(s => s.capacite > 0);

    const getRoomStudents = (salleId) =>
        (students ?? []).filter(s => (assignMap[s.etud_mod_id] ?? null) === salleId);

    const getUnassigned = () =>
        (students ?? []).filter(s => !assignMap[s.etud_mod_id]);

    const assignStudent = (etudModId, salleId) => {
        setAssignMap(prev => ({ ...prev, [etudModId]: salleId }));
    };

    const autoDistribute = () => {
        if (sallesWithCap.length === 0 || !students) return;
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
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const assignedCount = Object.keys(assignMap).length;
    const unassignedStudents = getUnassigned();

    const roomStats = sallesWithCap.map(s => ({
        ...s,
        count: getRoomStudents(s.id).length,
        fillPct: s.capacite > 0 ? Math.round((getRoomStudents(s.id).length / s.capacite) * 100) : 0,
        overCap: getRoomStudents(s.id).length > s.capacite,
    }));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <Toast flash={flash} t={t} />

                {/* Breadcrumb */}
                <div className="mb-4">
                    <Link href={route('repartition.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition">
                        <Icon d={I.chevLeft} className="h-3.5 w-3.5" />
                        {t('repartitionGoBack')}
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                            <Icon d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{niveauName}</h1>
                                <code className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">{niveau.code}</code>
                            </div>
                            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                {filiereCode ? `${filiereName} (${filiereCode})` : ''}
                                {semestres.length > 0 ? ` · ${semestres.length} semestre(s)` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <SelectFilter label={t('selectModule')} value={moduleId} onChange={handleModule}
                        options={moduleOptions} placeholder={locale === 'ar' ? 'اختر المادة...' : 'Module...'} />
                    <SelectFilter label={t('selectNexam')} value={nexam} onChange={handleNexam}
                        options={[1,2,3,4,5,6].map(n => ({ value: n, label: `${t('nexamLabel')} ${n}` }))} />
                </div>

                {!hasModule ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 dark:border-slate-700 dark:bg-slate-800">
                        <Icon d={I.search} className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-400 dark:text-slate-500">{t('repartitionNoModule')}</p>
                    </div>
                ) : !students || students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 dark:border-slate-700 dark:bg-slate-800">
                        <Icon d={I.empty} className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-400 dark:text-slate-500">{t('repartitionNoStudents')}</p>
                    </div>
                ) : sallesWithCap.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 dark:border-slate-700 dark:bg-slate-800">
                        <Icon d={I.alert} className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-400 dark:text-slate-500">{t('repartitionNoSalles')}</p>
                    </div>
                ) : (
                    <>
                        {/* Stats bar */}
                        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatCard label={t('repartitionTotalStudents')} value={students.length}
                                icon={I.users} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                            <StatCard label={t('repartitionTotalCapacity')} value={totalCapacite}
                                icon={I.doorOpen} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
                            <StatCard label={t('repartitionAssigned')} value={assignedCount}
                                icon={I.check} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
                            <StatCard label={t('repartitionUnassigned')} value={unassignedStudents.length}
                                icon={I.alert} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                        </div>

                        {/* Actions */}
                        <div className="sticky top-4 z-10 mb-6 flex items-center justify-between rounded-xl border bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <button onClick={autoDistribute}
                                className="flex items-center gap-2 rounded-xl bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50">
                                <Icon d={I.shuffle} className="h-4 w-4" />
                                {t('repartitionAuto')}
                            </button>
                            <button onClick={save} disabled={saving}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95 ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                {saving ? (
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                ) : <Icon d={I.check} className="h-4 w-4" />}
                                {saving ? '...' : t('repartitionSave')}
                            </button>
                        </div>

                        {/* Room grid */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                            {roomStats.map(room => {
                                const rStudents = getRoomStudents(room.id);
                                return (
                                    <div key={room.id} className={`rounded-2xl border bg-white shadow-sm dark:bg-slate-800 overflow-hidden ${room.overCap ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}>
                                        <div className={`px-4 py-3 flex items-center justify-between border-b ${room.overCap ? 'border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10' : 'border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'}`}>
                                            <div className="flex items-center gap-2.5">
                                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${room.overCap ? 'bg-red-100 dark:bg-red-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                                                    <Icon d={I.building} className={`h-4 w-4 ${room.overCap ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                        {locale === 'ar' ? (room.nomSalle_ar || room.nomSalle_fr || room.code_salle) : (room.nomSalle_fr || room.nomSalle_ar || room.code_salle)}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-mono">{room.code_salle}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${room.overCap ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {rStudents.length}<span className="text-xs font-normal text-slate-400">/{room.capacite}</span>
                                                </p>
                                                <p className="text-[10px] text-slate-400">{t('repartitionCapacity')}</p>
                                            </div>
                                        </div>

                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700">
                                            <div className={`h-full transition-all duration-500 ${room.overCap ? 'bg-red-500' : room.fillPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(room.fillPct, 100)}%` }} />
                                        </div>

                                        <div className="max-h-60 overflow-y-auto p-2">
                                            {rStudents.length === 0 ? (
                                                <p className="py-4 text-center text-xs text-slate-400">{locale === 'ar' ? 'لا يوجد طلاب' : 'Aucun étudiant'}</p>
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

                            {unassignedStudents.length > 0 && (
                                <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 shadow-sm dark:border-amber-800 dark:bg-amber-900/10 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-amber-100 dark:border-amber-900/30">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                                <Icon d={I.alert} className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-white">{t('repartitionUnassigned')}</p>
                                                <p className="text-[11px] text-amber-600 dark:text-amber-400">{unassignedStudents.length} {t('repartitionStudents')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto p-2">
                                        {unassignedStudents.map(s => (
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
                    </>
                )}
            </div>
        </div>
    );
}

export default function RepartitionShow({ niveau, semestres, modules, salles, students, totalCapacite, filters }) {
    const { t, locale, isRTL } = useLanguage();
    return (
        <LanguageProvider>
            <AdminLayout>
                <Head title={`${locale === 'ar' ? niveau.nom_ar || niveau.nom_fr : niveau.nom_fr || niveau.nom_ar} — ${t('repartitionTitle')}`} />
                <RepartitionShowContent {...{ niveau, semestres, modules, salles, students, totalCapacite, filters, t, locale, isRTL }} />
            </AdminLayout>
        </LanguageProvider>
    );
}
