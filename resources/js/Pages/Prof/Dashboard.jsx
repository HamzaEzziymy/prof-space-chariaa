import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRightIcon,
    BookOpenIcon,
    CheckCircleIcon,
    ClipboardDocumentCheckIcon,
    ClockIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import ProfLayout from '@/Layouts/ProfLayout';

const nf = (value, locale) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'fr-FR').format(value ?? 0);

function moduleName(module, isRTL) {
    return isRTL
        ? (module.nom_ar || module.nom_fr || '')
        : (module.nom_fr || module.nom_ar || '');
}

function DashboardContent({ totalStudents = 0, dashboardStats = {}, modulesOverview = [] }) {
    const { locale, isRTL } = useLanguage();
    const { auth } = usePage().props;
    const user = auth?.user;
    const [modulePage, setModulePage] = useState(0);

    const today = new Date().toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const name = user
        ? (isRTL
            ? `${user.prenom_ar || user.prenom_fr || ''} ${user.nom_ar || user.nom_fr || ''}`.trim()
            : `${user.prenom_fr || ''} ${user.nom_fr || ''}`.trim())
        : '';

    const labels = {
        title: locale === 'ar' ? 'لوحة الأستاذ' : 'Tableau de bord professeur',
        greeting: locale === 'ar' ? 'مرحبا' : 'Bonjour',
        subtitle: locale === 'ar'
            ? 'نظرة مختصرة على الوحدات والنقط التي تحتاج إلى معالجة.'
            : 'Vue courte sur vos modules et les notes à traiter.',
        modules: locale === 'ar' ? 'الوحدات' : 'Modules',
        students: locale === 'ar' ? 'الطلبة' : 'Etudiants',
        entered: locale === 'ar' ? 'النقط المدخلة' : 'Notes saisies',
        pending: locale === 'ar' ? 'في الانتظار' : 'En attente',
        readyModules: locale === 'ar' ? 'وحدات جاهزة' : 'Modules prêts',
        priority: locale === 'ar' ? 'الأولوية الحالية' : 'Priorité actuelle',
        priorityDone: locale === 'ar' ? 'كل شيء منظم' : 'Tout est à jour',
        priorityDoneText: locale === 'ar'
            ? 'لا توجد نقط معلقة في الوحدات الجاهزة.'
            : 'Aucune note en attente dans les modules prêts.',
        continue: locale === 'ar' ? 'متابعة الإدخال' : 'Continuer la saisie',
        modulesProgress: locale === 'ar' ? 'تقدم الوحدات' : 'Progression des modules',
        ready: locale === 'ar' ? 'جاهزة' : 'Prêt',
        notReady: locale === 'ar' ? 'غير جاهزة' : 'Non prêt',
        open: locale === 'ar' ? 'فتح' : 'Ouvrir',
        noModules: locale === 'ar' ? 'لا توجد وحدات مرتبطة بحسابك حاليا.' : 'Aucun module lié à votre compte pour le moment.',
        inscriptions: locale === 'ar' ? 'تسجيل' : 'inscriptions',
        studentsLabel: locale === 'ar' ? 'طالب' : 'étudiants',
        shownModules: locale === 'ar' ? 'وحدة' : 'modules',
        previous: locale === 'ar' ? 'السابق' : 'Précédent',
        next: locale === 'ar' ? 'التالي' : 'Suivant',
        page: locale === 'ar' ? 'صفحة' : 'Page',
    };

    const modules = [...modulesOverview];
    const sortedModules = modules.sort((a, b) => {
        if (a.ready !== b.ready) return a.ready ? -1 : 1;
        return (b.pending ?? 0) - (a.pending ?? 0);
    });
    const priorityModule = sortedModules.find((module) => module.ready && module.pending > 0);
    const overallProgress = dashboardStats.progress ?? 0;
    const modulesPerPage = 4;
    const totalModulePages = Math.max(Math.ceil(sortedModules.length / modulesPerPage), 1);
    const activeModulePage = Math.min(modulePage, totalModulePages - 1);
    const pagedModules = sortedModules.slice(
        activeModulePage * modulesPerPage,
        activeModulePage * modulesPerPage + modulesPerPage
    );

    const cards = [
        {
            label: labels.modules,
            value: dashboardStats.modulesCount ?? modules.length,
            sub: `${nf(dashboardStats.readyModules ?? 0, locale)} ${labels.readyModules}`,
            icon: BookOpenIcon,
            tone: 'emerald',
        },
        {
            label: labels.students,
            value: totalStudents,
            sub: labels.studentsLabel,
            icon: UserGroupIcon,
            tone: 'sky',
        },
        {
            label: labels.entered,
            value: `${overallProgress}%`,
            sub: `${nf(dashboardStats.enteredNotes ?? 0, locale)} / ${nf(dashboardStats.totalExamInscriptions ?? 0, locale)}`,
            icon: ClipboardDocumentCheckIcon,
            tone: 'violet',
        },
        {
            label: labels.pending,
            value: dashboardStats.pendingNotes ?? 0,
            sub: labels.entered,
            icon: ClockIcon,
            tone: 'amber',
        },
    ];

    return (
        <>
            <Head title={labels.title} />

            <ProfLayout wide>
                <div className="-mx-2 -my-3 space-y-4 sm:-mx-1" dir={isRTL ? 'rtl' : 'ltr'}>
                    <section className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 text-white shadow-lg shadow-primary/20 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
                            <div>
                                <p className="text-sm font-medium text-white/70">{today}</p>
                                <h1 className="mt-1 text-2xl font-bold">
                                    {labels.greeting}{name ? `, ${name}` : ''}
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm text-white/70">
                                    {labels.subtitle}
                                </p>
                            </div>

                            <div className={`flex w-fit items-center gap-3 rounded-xl bg-white/15 px-4 py-3 text-white ring-1 ring-white/20 backdrop-blur ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <CheckCircleIcon className="h-5 w-5 text-white/80" />
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                    <p className="text-xs font-medium text-white/70">{labels.entered}</p>
                                    <p className="text-xl font-bold tabular-nums">{overallProgress}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
                        <div className="pointer-events-none absolute -bottom-10 -right-4 h-40 w-40 rounded-full bg-white/5" />
                    </section>

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card) => (
                            <StatCard key={card.label} {...card} locale={locale} isRTL={isRTL} />
                        ))}
                    </section>

                    <section className="grid grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{labels.priority}</h2>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {priorityModule ? `${nf(priorityModule.pending, locale)} ${labels.pending}` : labels.priorityDoneText}
                                    </p>
                                </div>
                                <span className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                                    <ClockIcon className="h-5 w-5" />
                                </span>
                            </div>

                            {priorityModule ? (
                                <div className="mt-4 space-y-4">
                                    <div className={isRTL ? 'text-right' : 'text-left'}>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{moduleName(priorityModule, isRTL)}</p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {priorityModule.code_module || ''} · {nf(priorityModule.exam_total, locale)} {labels.inscriptions}
                                        </p>
                                    </div>
                                    <ProgressBar value={priorityModule.progress} />
                                    <Link
                                        href={route('prof.modules.show', { module: priorityModule.id })}
                                        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 ${isRTL ? 'flex-row-reverse' : ''}`}
                                    >
                                        {labels.continue}
                                        <ArrowRightIcon className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    {labels.priorityDone}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <div className={`sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{labels.modulesProgress}</h2>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {nf(sortedModules.length, locale)} {labels.shownModules}
                                    </p>
                                </div>
                                <div className={`hidden items-center gap-2 text-[11px] font-medium text-slate-400 sm:flex ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span>{labels.ready}</span>
                                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                                    <span>{labels.notReady}</span>
                                </div>
                            </div>

                            {sortedModules.length > 0 ? (
                                <>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {pagedModules.map((module) => (
                                            <ModuleRow
                                                key={module.id}
                                                module={module}
                                                labels={labels}
                                                locale={locale}
                                                isRTL={isRTL}
                                            />
                                        ))}
                                    </div>

                                    {totalModulePages > 1 && (
                                        <div className={`flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            <button
                                                type="button"
                                                onClick={() => setModulePage((page) => Math.max(page - 1, 0))}
                                                disabled={activeModulePage === 0}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                                            >
                                                {labels.previous}
                                            </button>
                                            <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                {Array.from({ length: totalModulePages }, (_, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => setModulePage(index)}
                                                        className={`h-7 min-w-7 rounded-lg px-2 text-xs font-bold transition ${
                                                            activeModulePage === index
                                                                ? 'bg-primary text-white shadow-sm'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                                        }`}
                                                        aria-label={`${labels.page} ${index + 1}`}
                                                    >
                                                        {nf(index + 1, locale)}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setModulePage((page) => Math.min(page + 1, totalModulePages - 1))}
                                                disabled={activeModulePage === totalModulePages - 1}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                                            >
                                                {labels.next}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="p-6 text-center text-sm text-slate-400">{labels.noModules}</p>
                            )}
                        </div>
                    </section>
                </div>
            </ProfLayout>
        </>
    );
}

function StatCard({ label, value, sub, icon: Icon, tone, locale, isRTL }) {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300',
        sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300',
        violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300',
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-1.5 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                        {typeof value === 'number' ? nf(value, locale) : value}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{sub}</p>
                </div>
                <div className={`rounded-xl p-3 ${tones[tone]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

function ModuleRow({ module, labels, locale, isRTL }) {
    return (
        <div className={`flex flex-col gap-3 px-4 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-700/30 md:items-center ${isRTL ? 'text-right md:flex-row-reverse' : 'text-left md:flex-row'}`}>
            <div className="min-w-0 flex-1">
                <div className={`flex min-w-0 items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${module.ready ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={moduleName(module, isRTL)}>
                        {moduleName(module, isRTL)}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${module.ready ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300'}`}>
                        {module.ready ? labels.ready : labels.notReady}
                    </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                    {module.code_module || '-'} · {nf(module.students_count, locale)} {labels.studentsLabel} · {nf(module.exam_total, locale)} {labels.inscriptions}
                </p>
            </div>

            <div className="w-full md:w-44">
                <div className={`mb-1 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{module.progress}%</span>
                    <span>{nf(module.pending, locale)} {labels.pending}</span>
                </div>
                <ProgressBar value={module.progress} muted={!module.ready} />
            </div>

            <Link
                href={route('prof.modules.show', { module: module.id })}
                className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
                {labels.open}
                <ArrowRightIcon className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
        </div>
    );
}

function ProgressBar({ value, muted = false }) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
                className={`h-full rounded-full ${muted ? 'bg-slate-300 dark:bg-slate-600' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(Math.max(value ?? 0, 0), 100)}%` }}
            />
        </div>
    );
}

export default function Dashboard({ prof, totalStudents, dashboardStats, modulesOverview }) {
    return (
        <LanguageProvider defaultLocale="ar">
            <DashboardContent
                prof={prof}
                totalStudents={totalStudents}
                dashboardStats={dashboardStats}
                modulesOverview={modulesOverview}
            />
        </LanguageProvider>
    );
}
