import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import StatCard from '@/Components/Dashboard/StatCard';
import ExamModeBarChart from '@/Components/Dashboard/ExamModeBarChart';
import DonutChart from '@/Components/Dashboard/DonutChart';
import RecentActivityTable from '@/Components/Dashboard/RecentActivityTable';

function DashboardContent({ stats, examModeStats, recentProfs, recentStudents }) {
    const { t, locale, isRTL } = useLanguage();

    const today = new Date().toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const sexData = [
        { label: locale === 'ar' ? 'ذكور' : 'Hommes', value: stats?.maleCount ?? 0, color: '#6366f1' },
        { label: locale === 'ar' ? 'إناث' : 'Femmes', value: stats?.femaleCount ?? 0, color: '#ec4899' },
    ];

    const profRows = (recentProfs ?? []).map((p) => ({
        avatar: true,
        avatarInitial: ((p.user?.prenom_fr?.[0] ?? '') + (p.user?.nom_fr?.[0] ?? '')) || '?',
        name: `${p.user?.prenom_fr ?? ''} ${p.user?.nom_fr ?? ''}`.trim() || '—',
        email: p.user?.email ?? '—',
        grade: p.grade ?? '—',
        status: p.user?.is_active ? 'active' : 'inactive',
    }));

    const profCols = [
        { key: 'avatar', label: t('name') },
        { key: 'grade',  label: t('grade') },
        { key: 'status', label: t('status') },
    ];

    const studentRows = (recentStudents ?? []).map((s) => ({
        avatar: true,
        avatarInitial: ((s.prenom_fr?.[0] ?? '') + (s.nom_fr?.[0] ?? '')) || '?',
        name: `${s.prenom_fr ?? ''} ${s.nom_fr ?? ''}`.trim() || '—',
        email: s.CNE ?? '—',
        filier: s.niveau?.nom_fr ?? s.filier ?? '—',
        status: 'active',
    }));

    const studentCols = [
        { key: 'avatar', label: t('name') },
        { key: 'filier', label: 'Filière' },
        { key: 'status', label: t('status') },
    ];

    return (
        <>
            <Head title={t('dashboard')} />

            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

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

                    <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-10 -right-4 h-40 w-40 rounded-full bg-white/5" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard
                        title={t('totalProfessors')}
                        value={stats?.profsCount ?? 0}
                        icon="👨‍🏫"
                        color="primary"
                    />
                    <StatCard
                        title={t('totalStudents')}
                        value={stats?.studentsCount ?? 0}
                        icon="🎓"
                        color="blue"
                    />
                    <StatCard
                        title={t('totalModules')}
                        value={stats?.modulesCount ?? 0}
                        change={stats?.activeModulesCount != null ? `${stats.activeModulesCount} actifs` : ''}
                        changeType="up"
                        icon="📚"
                        color="emerald"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ExamModeBarChart
                            title={t('examModeStats')}
                            modules={examModeStats ?? []}
                        />
                    </div>
                    <div>
                        <DonutChart
                            title={t('sexDistribution')}
                            data={sexData}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <RecentActivityTable
                        title={t('professors')}
                        rows={profRows}
                        columns={profCols}
                        viewAllRoute={route('professors.index')}
                    />
                    <RecentActivityTable
                        title={t('students')}
                        rows={studentRows}
                        columns={studentCols}
                        viewAllRoute={route('etudiants.index')}
                    />
                </div>

            </div>
        </>
    );
}

export default function Dashboard({ stats, examModeStats, recentProfs, recentStudents }) {
    return (
        <LanguageProvider>
            <AdminLayout>
                <DashboardContent stats={stats} examModeStats={examModeStats} recentProfs={recentProfs} recentStudents={recentStudents} />
            </AdminLayout>
        </LanguageProvider>
    );
}
