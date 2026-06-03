import { useLanguage } from '@/i18n/LanguageContext';

// A lightweight pure-CSS/SVG bar chart — no external chart library needed
export default function BarChart({ title, data = [], color = '#6366f1' }) {
    const { isRTL } = useLanguage();

    if (!data.length) return null;

    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className={`mb-5 text-sm font-semibold text-slate-700 dark:text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                {title}
            </h3>

            <div className={`flex items-end gap-2 h-40 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {data.map((item, i) => {
                    const heightPercent = (item.value / max) * 100;
                    return (
                        <div
                            key={i}
                            className="group flex flex-1 flex-col items-center gap-1"
                        >
                            {/* Tooltip */}
                            <div className="relative flex flex-1 w-full items-end">
                                <div
                                    className="w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer"
                                    style={{
                                        height: `${Math.max(heightPercent, 4)}%`,
                                        background: color,
                                        opacity: 0.85,
                                    }}
                                    title={`${item.label}: ${item.value}`}
                                />
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full text-center">
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
