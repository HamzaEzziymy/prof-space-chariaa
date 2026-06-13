import { Head, usePage } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import ProfLayout from '@/Layouts/ProfLayout';

const Icon = ({ d, className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const I = {
    book:   'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    users:  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 4h-6m0 0h-6m6 0V5M9 11h6',
    student:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
};

function DashboardContent({ prof, totalStudents }) {
    const { locale, isRTL } = useLanguage();
    const { auth, profModules } = usePage().props;
    const user = auth?.user;
    const modules = profModules ?? [];

    const today = new Date().toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
        weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric',
    });

    const profName = user
        ? (isRTL
            ? `${user.prenom_ar ?? ''} ${user.nom_ar ?? ''}`.trim()
            : `${user.prenom_fr ?? ''} ${user.nom_fr ?? ''}`.trim())
        : '';

    return (
        <>
            <Head title={locale === 'ar' ? 'لوحة التحكم' : 'Tableau de bord'} />

            <ProfLayout wide>
                <div className="space-y-6">

                    {/* Welcome banner */}
                    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 text-white shadow-lg shadow-primary/20 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div>
                                <p className="text-sm font-medium text-white/70">{today}</p>
                                <h2 className="mt-1 text-2xl font-bold">
                                    {locale === 'ar' ? `مرحباً، ${profName}` : `Bonjour, ${profName}`} 👋
                                </h2>
                                <p className="mt-1 text-sm text-white/70">
                                    {locale === 'ar' ? 'مرحباً بك في فضاء الأستاذ' : 'Bienvenue dans votre espace professeur'}
                                </p>
                            </div>
                            <div className="hidden sm:block text-6xl opacity-20 select-none">📚</div>
                        </div>
                        <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
                        <div className="pointer-events-none absolute -bottom-10 -right-4 h-40 w-40 rounded-full bg-white/5" />
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                            {
                                label: locale === 'ar' ? 'الوحدات' : 'Modules',
                                value: modules.length,
                                icon: <Icon d={I.book} className="w-6 h-6" />,
                                color: 'primary',
                                desc: locale === 'ar' ? 'الوحدات المدرّسة' : 'Modules enseignés',
                            },
                            {
                                label: locale === 'ar' ? 'الطلاب' : 'Étudiants',
                                value: totalStudents,
                                icon: <Icon d={I.student} className="w-6 h-6" />,
                                color: 'violet',
                                desc: locale === 'ar' ? 'إجمالي الطلاب' : 'Total étudiants',
                            },
                        ].map((stat, i) => {
                            const colors = {
                                primary: { bg: 'bg-primary/10 dark:bg-primary/20', icon: 'text-primary', border: 'border-primary/20' },
                                blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-500', border: 'border-blue-100 dark:border-blue-800' },
                                violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-500', border: 'border-violet-100 dark:border-violet-800' },
                            };
                            const c = colors[stat.color] || colors.primary;

                            return (
                                <div key={i} className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-800 dark:border-slate-700 ${c.border}`}>
                                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className={isRTL ? 'text-right' : 'text-left'}>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                            <p className="mt-1.5 text-3xl font-bold text-slate-800 dark:text-white tabular-nums">
                                                {stat.value ?? '—'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">{stat.desc}</p>
                                        </div>
                                        <div className={`rounded-2xl p-3 ${c.bg}`}>
                                            <span className={c.icon}>{stat.icon}</span>
                                        </div>
                                    </div>
                                    <div className={`pointer-events-none absolute -bottom-4 ${isRTL ? '-left-4' : '-right-4'} h-20 w-20 rounded-full opacity-5 ${c.bg}`} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            { label: locale === 'ar' ? 'الوحدات النشطة' : 'Modules actifs', value: modules.length, color: 'bg-indigo-500' },
                            { label: locale === 'ar' ? 'الطلاب المسجلون' : 'Étudiants inscrits', value: totalStudents, color: 'bg-amber-500' },
                        ].map((item, i) => (
                            <div key={i} className={`rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Hint */}
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-600 dark:bg-slate-800">
                        <span className="text-4xl opacity-30 select-none">📝</span>
                        <p className="mt-3 text-sm font-medium text-slate-400">
                            {locale === 'ar' ? 'اختر وحدة من القائمة الجانبية لإدخال النقاط' : 'Sélectionnez un module dans la barre latérale pour saisir les notes'}
                        </p>
                    </div>
                </div>
            </ProfLayout>
        </>
    );
}

export default function Dashboard({ prof, totalStudents }) {
    return (
        <LanguageProvider defaultLocale="ar">
            <DashboardContent prof={prof} totalStudents={totalStudents} />
        </LanguageProvider>
    );
}
