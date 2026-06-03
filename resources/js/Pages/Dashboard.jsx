import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import StatCard from '@/Components/Dashboard/StatCard';
import BarChart from '@/Components/Dashboard/BarChart';
import DonutChart from '@/Components/Dashboard/DonutChart';
import RecentActivityTable from '@/Components/Dashboard/RecentActivityTable';

// ─── Inner component (needs language context) ────────────────────────────────
function DashboardContent({ stats }) {
    const { t, locale, isRTL } = useLanguage();

    const today = new Date().toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Bar chart: monthly enrollment data (mock — replace with real props)
    const monthlyData = [
        { label: t('jan'), value: 12 },
        { label: t('feb'), value: 19 },
        { label: t('mar'), value: 15 },
        { label: t('apr'), value: 27 },
        { label: t('may'), value: 32 },
        { label: t('jun'), value: 24 },
        { label: t('jul'), value: 8 },
        { label: t('aug'), value: 5 },
        { label: t('sep'), value: 38 },
        { label: t('oct'), value: 41 },
        { label: t('nov'), value: 35 },
        { label: t('dec'), value: 29 },
    ];

    // Donut chart: grade distribution
    const gradeData = [
        { label: '16–20', value: stats?.excellentCount ?? 42, color: '#22c55e' },
        { label: '12–16', value: stats?.goodCount ?? 98, color: '#6366f1' },
        { label: '10–12', value: stats?.averageCount ?? 63, color: '#f59e0b' },
        { label: '< 10', value: stats?.failCount ?? 27, color: '#ef4444' },
    ];

    // Recent professors table rows (mock)
    const profRows = [
        { avatar: true, avatarInitial: 'BM', name: 'Benali Mohamed', email: 'benali@univ.ma', grade: 'PES', status: 'active' },
        { avatar: true, avatarInitial: 'AF', name: 'Alaoui Fatima', email: 'alaoui@univ.ma', grade: 'PA', status: 'active' },
        { avatar: true, avatarInitial: 'OK', name: 'Ouali Karim', email: 'ouali@univ.ma', grade: 'PH', status: 'inactive' },
        { avatar: true, avatarInitial: 'ZN', name: 'Ziani Nadia', email: 'ziani@univ.ma', grade: 'PES', status: 'active' },
    ];

    const profCols = [
        { key: 'avatar', label: t('name') },
        { key: 'grade', label: t('grade') },
        { key: 'status', label: t('status') },
    ];

    // Recent students table rows (mock)
    const studentRows = [
        { avatar: true, avatarInitial: 'AH', name: 'Ahmed Hassan', email: 'ahmed@student.ma', filier: 'Droit Privé', status: 'active' },
        { avatar: true, avatarInitial: 'SM', name: 'Sara Moussaoui', email: 'sara@student.ma', filier: 'Droit Public', status: 'active' },
        { avatar: true, avatarInitial: 'YB', name: 'Youssef Benjelloun', email: 'youssef@student.ma', filier: 'Chariaa', status: 'pending' },
        { avatar: true, avatarInitial: 'LF', name: 'Layla Filali', email: 'layla@student.ma', filier: 'Droit Privé', status: 'active' },
        { avatar: true, avatarInitial: 'MK', name: 'Mehdi Kasmi', email: 'mehdi@student.ma', filier: 'Chariaa', status: 'inactive' },
    ];

    const studentCols = [
        { key: 'avatar', label: t('name') },
        { key: 'filier', label: 'Filière' },
        { key: 'status', label: t('status') },
    ];

    return (
        <>
            <Head title={t('dashboard')} />

            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* ── Welcome banner ── */}
                <div className={`
                    relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 text-white shadow-lg shadow-primary/20
                    ${isRTL ? 'text-right' : 'text-left'}
                `}>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                            <p className="text-sm font-medium text-white/70">{today}</p>
                            <h2 className="mt-1 text-2xl font-bold">
                                {t('welcomeBack')} 👋
                            </h2>
                            <p className="mt-1 text-sm text-white/70">{t('adminPanel')}</p>
                        </div>
                        <div className="hidden sm:block text-6xl opacity-20 select-none">🎓</div>
                    </div>

                    {/* Decorative circles */}
                    <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-10 -right-4 h-40 w-40 rounded-full bg-white/5" />
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title={t('totalProfessors')}
                        value={stats?.profsCount ?? 48}
                        change="+3 ce mois"
                        changeType="up"
                        icon="👨‍🏫"
                        color="primary"
                    />
                    <StatCard
                        title={t('totalStudents')}
                        value={stats?.studentsCount ?? 1240}
                        change="+82 ce mois"
                        changeType="up"
                        icon="🎓"
                        color="blue"
                    />
                    <StatCard
                        title={t('totalModules')}
                        value={stats?.modulesCount ?? 34}
                        change="+2 ce mois"
                        changeType="up"
                        icon="📚"
                        color="emerald"
                    />
                    <StatCard
                        title={t('totalRooms')}
                        value={stats?.sallesCount ?? 18}
                        subtitle={t('active')}
                        icon="🏛️"
                        color="amber"
                    />
                </div>

                {/* ── Charts row ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <BarChart
                            title={t('enrollmentTrend')}
                            data={monthlyData}
                            color="#6366f1"
                        />
                    </div>
                    <div>
                        <DonutChart
                            title={t('gradeDistribution')}
                            data={gradeData}
                        />
                    </div>
                </div>

                {/* ── Tables row ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <RecentActivityTable
                        title={t('professors')}
                        rows={profRows}
                        columns={profCols}
                    />
                    <RecentActivityTable
                        title={t('students')}
                        rows={studentRows}
                        columns={studentCols}
                    />
                </div>

                {/* ── Quick stats mini row ── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: locale === 'ar' ? 'الوحدات النشطة' : 'Modules actifs', value: stats?.activeModulesCount ?? 28, color: 'bg-indigo-500' },
                        { label: locale === 'ar' ? 'الامتحانات المجدولة' : 'Examens planifiés', value: stats?.scheduledExams ?? 12, color: 'bg-emerald-500' },
                        { label: locale === 'ar' ? 'النتائج المدخلة' : 'Notes saisies', value: stats?.gradesEntered ?? 876, color: 'bg-amber-500' },
                        { label: locale === 'ar' ? 'المستخدمون النشطون' : 'Utilisateurs actifs', value: stats?.activeUsers ?? 52, color: 'bg-rose-500' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={`rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className={`h-2 w-2 rounded-full ${item.color}`} />
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{item.value}</p>
                        </div>
                    ))}
                </div>

            </div>
        </>
    );
}

// ─── Page export (wraps with language provider) ───────────────────────────────
export default function Dashboard({ stats }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <DashboardContent stats={stats} />
            </AdminLayout>
        </LanguageProvider>
    );
}
