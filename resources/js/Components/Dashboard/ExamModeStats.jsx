import { useLanguage } from '@/i18n/LanguageContext';

export default function ExamModeStats({ title, modules = [] }) {
    const { t, isRTL, locale } = useLanguage();

    if (!modules.length) return null;

    const maxModules = 7;
    const visible = modules.slice(0, maxModules);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className={`mb-5 text-sm font-semibold text-slate-700 dark:text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                {title}
            </h3>

            {/* Legend */}
            <div className={`flex items-center gap-4 mb-4 text-[11px] text-slate-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded bg-blue-500" />
                    {locale === 'ar' ? 'عادي' : 'Normale'}
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded bg-amber-500" />
                    {locale === 'ar' ? 'استدراك' : 'Rattrapage'}
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded bg-slate-200 dark:bg-slate-600" />
                    {locale === 'ar' ? 'بدون نقطة' : 'Sans note'}
                </span>
            </div>

            <div className="space-y-5">
                {visible.map((mod) => {
                    const nPct = mod.total > 0 ? Math.round((mod.normaleCount / mod.total) * 100) : 0;
                    const rPct = mod.total > 0 ? Math.round((mod.rattrapageCount / mod.total) * 100) : 0;
                    const ngPct = mod.total > 0 ? Math.round((mod.noGradeCount / mod.total) * 100) : 0;
                    const nvPct = mod.normaleCount > 0 ? Math.round((mod.normaleValidated / mod.normaleCount) * 100) : 0;
                    const nfPct = mod.normaleCount > 0 ? Math.round((mod.normaleFailed / mod.normaleCount) * 100) : 0;
                    const naPct = mod.normaleCount > 0 ? Math.round((mod.normaleAbsent / mod.normaleCount) * 100) : 0;
                    const rvPct = mod.rattrapageCount > 0 ? Math.round((mod.rattrapageValidated / mod.rattrapageCount) * 100) : 0;
                    const rfPct = mod.rattrapageCount > 0 ? Math.round((mod.rattrapageFailed / mod.rattrapageCount) * 100) : 0;

                    return (
                        <div key={mod.id}>
                            <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[60%]">
                                    {mod.name}
                                </span>
                                <span className="text-xs text-slate-400 tabular-nums">
                                    {mod.total} {t('students')}
                                </span>
                            </div>

                            {/* Mode split bar */}
                            <div className="h-6 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex mb-2">
                                {nPct > 0 && (
                                    <div
                                        className="h-full bg-blue-500 transition-all flex items-center justify-center"
                                        style={{ width: `${nPct}%` }}
                                    >
                                        {nPct > 15 && (
                                            <span className="text-[10px] font-bold text-white">
                                                {nPct}%
                                            </span>
                                        )}
                                    </div>
                                )}
                                {rPct > 0 && (
                                    <div
                                        className="h-full bg-amber-500 transition-all flex items-center justify-center"
                                        style={{ width: `${rPct}%` }}
                                    >
                                        {rPct > 15 && (
                                            <span className="text-[10px] font-bold text-white">
                                                {rPct}%
                                            </span>
                                        )}
                                    </div>
                                )}
                                {ngPct > 0 && (
                                    <div
                                        className="h-full bg-slate-200 dark:bg-slate-600 transition-all flex items-center justify-center"
                                        style={{ width: `${ngPct}%` }}
                                    />
                                )}
                            </div>

                            {/* Stats breakdown per mode */}
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg px-3 py-2">
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {locale === 'ar' ? 'عادي' : 'Normale'}{' '}
                                        <span className="text-blue-400">({nPct}%)</span>
                                    </span>
                                    <div className="flex items-center gap-3 mt-1 text-slate-500">
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium" title={locale === 'ar' ? 'ناجح' : 'Validé'}>
                                            ✓ {nvPct}%
                                        </span>
                                        <span className="text-red-500 font-medium" title={locale === 'ar' ? 'راسب' : 'Échec'}>
                                            ✗ {nfPct}%
                                        </span>
                                        {naPct > 0 && (
                                            <span className="text-slate-400" title={locale === 'ar' ? 'غائب' : 'Absent'}>
                                                — {naPct}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg px-3 py-2">
                                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                                        {locale === 'ar' ? 'استدراك' : 'Rattrapage'}{' '}
                                        <span className="text-amber-400">({rPct}%)</span>
                                    </span>
                                    <div className="flex items-center gap-3 mt-1 text-slate-500">
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                            ✓ {rvPct}%
                                        </span>
                                        <span className="text-red-500 font-medium">
                                            ✗ {rfPct}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {modules.length > maxModules && (
                <p className="mt-4 text-center text-xs text-slate-400">
                    +{modules.length - maxModules} {t('modules')}
                </p>
            )}
        </div>
    );
}
