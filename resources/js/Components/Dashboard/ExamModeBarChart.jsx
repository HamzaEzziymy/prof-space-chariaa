import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useLanguage } from '@/i18n/LanguageContext';

const AXIS_GREEN = '#16a34a';
const NORMALE_GREEN = '#22c55e';
const RATTRAPAGE_ORANGE = '#f97316';

function percent(entered, total) {
    if (!total) return 0;
    return Math.round((entered / total) * 100);
}

function shortModuleName(name) {
    if (!name) return '';
    return name.length > 12 ? `${name.slice(0, 11)}...` : name;
}

function getModuleName(module, locale) {
    if (locale === 'ar') {
        return module.nom_ar || module.nameAr || module.name_ar || module.name || module.nom_fr || '';
    }

    return module.nom_fr || module.name || module.nameFr || module.nom_ar || module.nameAr || '';
}

export default function ExamModeBarChart({ title, modules = [] }) {
    const { locale, isRTL } = useLanguage();

    const labels = {
        normale: locale === 'ar' ? 'عادي' : 'Normale',
        rattrapage: locale === 'ar' ? 'استدراك' : 'Rattrapage',
        yAxis: locale === 'ar' ? '% النقط المدخلة' : '% notes saisi',
        xAxis: locale === 'ar' ? 'الوحدات' : 'modules',
        entered: locale === 'ar' ? 'النقط المدخلة' : 'notes saisies',
    };

    const data = [...modules]
        .map((module) => {
            const displayName = getModuleName(module, locale);
            const normaleTotal = module.normaleCount ?? 0;
            const rattrapageTotal = module.rattrapageCount ?? 0;
            const normaleEntered = (module.normaleValidated ?? 0) + (module.normaleFailed ?? 0) + (module.normaleAbsent ?? 0);
            const rattrapageEntered = (module.rattrapageValidated ?? 0) + (module.rattrapageFailed ?? 0) + (module.rattrapageAbsent ?? 0);

            return {
                module: shortModuleName(displayName),
                fullName: displayName,
                normale: percent(normaleEntered, normaleTotal),
                rattrapage: percent(rattrapageEntered, rattrapageTotal),
                normaleEntered,
                normaleTotal,
                rattrapageEntered,
                rattrapageTotal,
            };
        })
        .filter((module) => module.normaleTotal > 0 || module.rattrapageTotal > 0)
        .sort((a, b) => Math.max(b.normale, b.rattrapage) - Math.max(a.normale, a.rattrapage))
        .slice(0, 10);

    if (!data.length) return null;

    return (
        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/40 dark:bg-slate-800">
            <div className={`mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${isRTL ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
                <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {title}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {labels.yAxis}
                    </p>
                </div>
            </div>

            <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 18, right: 20, left: 8, bottom: 16 }}
                        barCategoryGap="28%"
                        barGap={8}
                    >
                        <CartesianGrid stroke="#dcfce7" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="module"
                            reversed={isRTL}
                            axisLine={{ stroke: AXIS_GREEN, strokeWidth: 4 }}
                            tickLine={{ stroke: AXIS_GREEN, strokeWidth: 3 }}
                            tick={<ModuleAxisTick isRTL={isRTL} />}
                            interval={0}
                        />
                        <YAxis
                            domain={[0, 100]}
                            ticks={[0, 25, 50, 75, 100]}
                            axisLine={{ stroke: AXIS_GREEN, strokeWidth: 4 }}
                            tickLine={{ stroke: AXIS_GREEN, strokeWidth: 3 }}
                            tick={{ fill: AXIS_GREEN, fontSize: 12, fontWeight: 700 }}
                            tickFormatter={(value) => `${value}`}
                            label={{
                                value: labels.yAxis,
                                angle: -90,
                                position: 'insideLeft',
                                fill: AXIS_GREEN,
                                fontSize: 14,
                                fontWeight: 700,
                                dy: 52,
                            }}
                            unit="%"
                        />
                        <Tooltip content={<ChartTooltip labels={labels} />} cursor={{ fill: 'rgba(34, 197, 94, 0.08)' }} />
                        <Legend
                            verticalAlign="top"
                            align="center"
                            iconType="rect"
                            wrapperStyle={{
                                color: AXIS_GREEN,
                                fontWeight: 700,
                                paddingBottom: 18,
                            }}
                        />
                        <Bar
                            dataKey="normale"
                            name={labels.normale}
                            fill={NORMALE_GREEN}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={42}
                        />
                        <Bar
                            dataKey="rattrapage"
                            name={labels.rattrapage}
                            fill={RATTRAPAGE_ORANGE}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={42}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div
                className={`mt-1 flex ${isRTL ? 'justify-start pl-16' : 'justify-end pr-2'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {labels.xAxis}
                </span>
            </div>
        </section>
    );
}

function ModuleAxisTick({ x, y, payload, isRTL }) {
    return (
        <text
            x={x}
            y={y + 16}
            textAnchor="middle"
            direction={isRTL ? 'rtl' : 'ltr'}
            unicodeBidi="plaintext"
            fill={AXIS_GREEN}
            fontSize={13}
            fontWeight={700}
        >
            {payload.value}
        </text>
    );
}

function ChartTooltip({ active, payload, label, labels }) {
    if (!active || !payload?.length) return null;

    const row = payload[0]?.payload;

    return (
        <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">
                {row?.fullName ?? label}
            </p>
            <div className="space-y-1">
                {payload.map((item) => {
                    const isNormale = item.dataKey === 'normale';
                    const entered = isNormale ? row.normaleEntered : row.rattrapageEntered;
                    const total = isNormale ? row.normaleTotal : row.rattrapageTotal;

                    return (
                        <div key={item.dataKey} className="flex items-center justify-between gap-5">
                            <span className="font-medium" style={{ color: item.color }}>
                                {item.name}
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {item.value}% ({entered}/{total} {labels.entered})
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
