import { useLanguage } from '@/i18n/LanguageContext';

const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function RecentActivityTable({ title, rows = [], columns = [] }) {
    const { t, isRTL } = useLanguage();

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {/* Header */}
            <div className={`flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
                <button className="text-xs font-medium text-primary hover:underline">
                    {t('viewAll')}
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-5 py-8 text-center text-sm text-slate-400"
                                >
                                    —
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, ri) => (
                                <tr
                                    key={ri}
                                    className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                                >
                                    {columns.map((col, ci) => (
                                        <td
                                            key={ci}
                                            className={`px-5 py-3.5 ${isRTL ? 'text-right' : 'text-left'}`}
                                        >
                                            {col.key === 'status' ? (
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[row[col.key]] || statusColors.active}`}>
                                                    {t(row[col.key])}
                                                </span>
                                            ) : col.key === 'avatar' ? (
                                                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                                        {row.avatarInitial ?? '?'}
                                                    </div>
                                                    <div className={isRTL ? 'text-right' : 'text-left'}>
                                                        <p className="font-medium text-slate-700 dark:text-slate-200">{row.name}</p>
                                                        <p className="text-xs text-slate-400">{row.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 dark:text-slate-300">{row[col.key]}</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
