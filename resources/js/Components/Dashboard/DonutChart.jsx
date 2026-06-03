import { useLanguage } from '@/i18n/LanguageContext';

// Pure SVG donut chart
export default function DonutChart({ title, data = [] }) {
    const { isRTL } = useLanguage();

    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const cx = 80, cy = 80;

    let offset = 0;
    const segments = data.map((item) => {
        const dash = (item.value / total) * circumference;
        const gap = circumference - dash;
        const seg = { ...item, dash, gap, offset };
        offset += dash;
        return seg;
    });

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className={`mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                {title}
            </h3>

            <div className={`flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* SVG */}
                <div className="flex-shrink-0">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                        {/* Background circle */}
                        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="18" className="dark:stroke-slate-700" />
                        {segments.map((seg, i) => (
                            <circle
                                key={i}
                                cx={cx} cy={cy} r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth="18"
                                strokeDasharray={`${seg.dash} ${seg.gap}`}
                                strokeDashoffset={-seg.offset + circumference * 0.25}
                                strokeLinecap="butt"
                                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                            />
                        ))}
                        {/* Center text */}
                        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-700 dark:fill-white" fontSize="20" fontWeight="bold">
                            {total}
                        </text>
                        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-400" fontSize="10">
                            Total
                        </text>
                    </svg>
                </div>

                {/* Legend */}
                <div className={`flex flex-col gap-2.5 ${isRTL ? 'items-end' : 'items-start'}`}>
                    {data.map((item, i) => (
                        <div key={i} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
