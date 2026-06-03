import { useLanguage } from '@/i18n/LanguageContext';

export default function StatCard({ title, value, change, changeType = 'up', icon, color = 'primary', subtitle }) {
    const { isRTL } = useLanguage();

    const colors = {
        primary: {
            bg: 'bg-primary/10 dark:bg-primary/20',
            icon: 'text-primary',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            badgeDown: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            border: 'border-primary/20',
        },
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: 'text-blue-500',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            badgeDown: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            border: 'border-blue-100 dark:border-blue-800',
        },
        emerald: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            icon: 'text-emerald-500',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            badgeDown: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            border: 'border-emerald-100 dark:border-emerald-800',
        },
        violet: {
            bg: 'bg-violet-50 dark:bg-violet-900/20',
            icon: 'text-violet-500',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            badgeDown: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            border: 'border-violet-100 dark:border-violet-800',
        },
        amber: {
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            icon: 'text-amber-500',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            badgeDown: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            border: 'border-amber-100 dark:border-amber-800',
        },
    };

    const c = colors[color] || colors.primary;

    return (
        <div className={`
            relative overflow-hidden rounded-2xl border bg-white p-5
            shadow-sm transition-all duration-200 hover:shadow-md
            dark:bg-slate-800 dark:border-slate-700 ${c.border}
        `}>
            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="mt-1.5 text-3xl font-bold text-slate-800 dark:text-white tabular-nums">
                        {value ?? '—'}
                    </p>
                    {subtitle && (
                        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
                    )}
                    {change !== undefined && (
                        <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${changeType === 'up' ? c.badge : c.badgeDown}`}>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d={changeType === 'up'
                                        ? 'M5 10l7-7m0 0l7 7m-7-7v18'
                                        : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
                                />
                            </svg>
                            {change}
                        </div>
                    )}
                </div>

                <div className={`rounded-2xl p-3 ${c.bg}`}>
                    <span className={`text-2xl ${c.icon}`}>{icon}</span>
                </div>
            </div>

            {/* Decorative background shape */}
            <div className={`pointer-events-none absolute -bottom-4 ${isRTL ? '-left-4' : '-right-4'} h-20 w-20 rounded-full opacity-5 ${c.bg}`} />
        </div>
    );
}
