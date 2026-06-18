import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

function StatCard({ icon, label, value, sub, color = 'indigo' }) {
    const colorMap = {
        indigo: 'from-indigo-500 to-indigo-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        rose: 'from-rose-500 to-rose-600',
        violet: 'from-violet-500 to-violet-600',
        cyan: 'from-cyan-500 to-cyan-600',
    };
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-lg`}>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{value ?? '—'}</p>
                {sub !== undefined && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
            </div>
        </div>
    );
}

function DistributionBar({ label, count, max, color, pct }) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-16 text-right text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
            <div className="flex-1">
                <div className="h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className={`h-full rounded-full transition-all duration-500 ${color}`}
                        style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }} />
                </div>
            </div>
            <span className="w-10 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">{count}</span>
            <span className="w-12 text-right text-xs text-slate-400">{pct !== undefined ? `${pct}%` : ''}</span>
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

function NotesContent({ filieres, niveaux, semestres, modules, stats, perModule, distribution, filters, t, locale, isRTL }) {
    const [filiereId, setFiliereId]   = useState(filters?.filiere_id ?? '');
    const [niveauId, setNiveauId]     = useState(filters?.niveau_id ?? '');
    const [semestreId, setSemestreId] = useState(filters?.semestre_id ?? '');
    const [moduleId, setModuleId]     = useState(filters?.module_id ?? '');
    const [nexam, setNexam]           = useState(filters?.Nexam ?? '');

    const applyFilters = (overrides = {}) => {
        const params = {};
        const f = { filiereId, niveauId, semestreId, moduleId, nexam, ...overrides };
        if (f.filiereId)  params.filiere_id  = f.filiereId;
        if (f.niveauId)   params.niveau_id   = f.niveauId;
        if (f.semestreId) params.semestre_id = f.semestreId;
        if (f.moduleId)   params.module_id   = f.moduleId;
        if (f.nexam)      params.Nexam       = f.nexam;
        router.get(route('notes.index'), params, { preserveState: true, replace: true });
    };

    const handleFiliere  = (v) => { setFiliereId(v); setNiveauId(''); setSemestreId(''); setModuleId(''); applyFilters({ filiereId: v, niveauId: '', semestreId: '', moduleId: '' }); };
    const handleNiveau   = (v) => { setNiveauId(v); setSemestreId(''); setModuleId(''); applyFilters({ niveauId: v, semestreId: '', moduleId: '' }); };
    const handleSemestre = (v) => { setSemestreId(v); setModuleId(''); applyFilters({ semestreId: v, moduleId: '' }); };
    const handleModule   = (v) => { setModuleId(v); applyFilters({ moduleId: v }); };
    const handleNexam    = (v) => { setNexam(v); applyFilters({ Nexam: v }); };

    const total = (stats?.pass_count ?? 0) + (stats?.fail_count ?? 0);
    const passRate = total > 0 ? Math.round((stats.pass_count / total) * 100) : null;
    const maxDist = Math.max(...Object.values(distribution), 1);

    const icons = {
        users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        modules: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        academic: 'M12 14l9-5-9-5-9 5 9 5zm0 0l-6.16-3.422M12 14l6.16-3.422M12 14v6',
        trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('notesTitle')}</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('notesSubtitle')}</p>
                </div>

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
                    <SelectFilter label={locale === 'ar' ? 'رقم الامتحان' : 'N° Examen'} value={nexam} onChange={handleNexam}
                        options={[1,2,3,4,5,6].map(n => ({ value: n, label: `${locale === 'ar' ? 'امتحان' : 'Examen'} ${n}` }))}
                        placeholder={locale === 'ar' ? 'الكل...' : 'Tous...'} />
                </div>

                {stats && (
                    <>
                        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                            <StatCard icon={icons.users} label={locale === 'ar' ? 'إجمالي الطلاب' : 'Total Étudiants'} value={stats.total_students} color="indigo" />
                            <StatCard icon={icons.modules} label={locale === 'ar' ? 'إجمالي المواد' : 'Total Modules'} value={stats.total_modules} color="violet" />
                            <StatCard icon={icons.clipboard} label={locale === 'ar' ? 'إجمالي التسجيلات' : 'Total Inscriptions'} value={stats.total_inscriptions} color="cyan" />
                            <StatCard icon={icons.chart} label={locale === 'ar' ? 'معدل النتيجة العادية' : 'Moy. Note Normale'} value={stats.avg_note_normale} sub="/20" color="emerald" />
                            <StatCard icon={icons.trending} label={locale === 'ar' ? 'معدل النتيجة النهائية' : 'Moy. Note Finale'} value={stats.avg_note_finale} sub="/20" color="amber" />
                            <StatCard icon={icons.academic} label={locale === 'ar' ? 'نسبة النجاح' : 'Taux Réussite'}
                                value={passRate !== null ? `${passRate}%` : '—'}
                                sub={locale === 'ar' ? `${stats.pass_count} ناجح / ${stats.fail_count} راسب` : `${stats.pass_count} validé / ${stats.fail_count} non validé`}
                                color="rose" />
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {locale === 'ar' ? 'توزيع النتائج' : 'Distribution des notes'}
                                </h3>
                                <div className="space-y-3">
                                    <DistributionBar label={locale === 'ar' ? 'بدون' : 'N/R'} count={distribution.no_grade} max={maxDist} color="bg-slate-400" pct={stats.total_inscriptions > 0 ? Math.round((distribution.no_grade / stats.total_inscriptions) * 100) : 0} />
                                    <DistributionBar label="0-5" count={distribution['0_5']} max={maxDist} color="bg-red-400" pct={stats.total_inscriptions > 0 ? Math.round((distribution['0_5'] / stats.total_inscriptions) * 100) : 0} />
                                    <DistributionBar label="5-10" count={distribution['5_10']} max={maxDist} color="bg-orange-400" pct={stats.total_inscriptions > 0 ? Math.round((distribution['5_10'] / stats.total_inscriptions) * 100) : 0} />
                                    <DistributionBar label="10-15" count={distribution['10_15']} max={maxDist} color="bg-emerald-400" pct={stats.total_inscriptions > 0 ? Math.round((distribution['10_15'] / stats.total_inscriptions) * 100) : 0} />
                                    <DistributionBar label="15-20" count={distribution['15_20']} max={maxDist} color="bg-green-500" pct={stats.total_inscriptions > 0 ? Math.round((distribution['15_20'] / stats.total_inscriptions) * 100) : 0} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {locale === 'ar' ? 'حالة التقييم' : 'État des évaluations'}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{locale === 'ar' ? 'مع نتيجة عادية' : 'Avec note normale'}</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.with_note_normale}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{locale === 'ar' ? 'مع نتيجة استدراكية' : 'Avec note rattrapage'}</span>
                                        <span className="font-bold text-amber-600 dark:text-amber-400">{stats.with_note_rattrapage}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{locale === 'ar' ? 'مع نتيجة نهائية' : 'Avec note finale'}</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.with_note_finale}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{locale === 'ar' ? 'ناجحون (معدل >= 10)' : 'Validés (moy. >= 10)'}</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.pass_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 dark:bg-red-900/20">
                                        <span className="text-sm font-semibold text-red-700 dark:text-red-300">{locale === 'ar' ? 'راسبون (معدل < 10)' : 'Non validés (moy. < 10)'}</span>
                                        <span className="font-bold text-red-600 dark:text-red-400">{stats.fail_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {perModule.length > 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {locale === 'ar' ? 'إحصائيات حسب المواد' : 'Statistiques par module'}
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                                                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">#</th>
                                                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'المادة' : 'Module'}</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'الطلاب' : 'Étudiants'}</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'معدل النتيجة' : 'Moy. Note'}</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'ناجح' : 'Validé'}</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'راسب' : 'Non validé'}</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{locale === 'ar' ? 'نسبة النجاح' : '% Réussite'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {perModule.map((m, idx) => {
                                                const modTotal = (m.pass_count ?? 0) + (m.fail_count ?? 0);
                                                const modRate = modTotal > 0 ? Math.round((m.pass_count / modTotal) * 100) : null;
                                                return (
                                                    <tr key={m.module_id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                                                        <td className="px-4 py-3 text-xs text-slate-400">{idx + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                                                {locale === 'ar' ? (m.nom_ar || m.nom_fr) : m.nom_fr}
                                                            </span>
                                                            <span className="ms-2 text-xs text-slate-400">({m.code_module})</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">{m.student_count}</td>
                                                        <td className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">{m.avg_note_finale ?? '—'}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                                {m.pass_count}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                                                {m.fail_count}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                                modRate >= 50
                                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                            }`}>
                                                                {modRate !== null ? `${modRate}%` : '—'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!stats?.total_inscriptions && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 dark:border-slate-700 dark:bg-slate-800">
                        <svg className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-sm text-slate-400 dark:text-slate-500">
                            {locale === 'ar' ? 'لا توجد إحصائيات متاحة. يرجى تحديد الفلتر المناسب.' : 'Aucune statistique disponible. Sélectionnez un filtre.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function NotesIndex({ filieres, niveaux, semestres, modules, stats, perModule, distribution, filters }) {
    const { locale, isRTL } = useLanguage();
    const { t } = useLanguage();
    return (
        <LanguageProvider>
            <AdminLayout>
                <Head title={t('notesManagement')} />
                <NotesContent {...{ filieres, niveaux, semestres, modules, stats, perModule, distribution, filters, t, locale, isRTL }} />
            </AdminLayout>
        </LanguageProvider>
    );
}
