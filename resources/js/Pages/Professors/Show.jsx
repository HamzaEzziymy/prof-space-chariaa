import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

// ─── Icon helper ──────────────────────────────────────────────────────────────
function Icon({ d, className = 'w-5 h-5', fill = 'none' }) {
    return (
        <svg className={className} fill={fill} stroke={fill === 'none' ? 'currentColor' : 'none'}
            strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const ICONS = {
    back:    'M10 19l-7-7m0 0l7-7m-7 7h18',
    plus:    'M12 4v16m8-8H4',
    search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    mail:    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    phone:   'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    id:      'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
    star:    'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    modules: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    check:   'M5 13l4 4L19 7',
    close:   'M6 18L18 6M6 6l12 12',
    users:   'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    calendar:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    empty:   'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warn:    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    chevDown:'M19 9l-7 7-7-7',
};

// ─── Grade colour map ─────────────────────────────────────────────────────────
const GRADE_META = {
    'PES':                 { pill: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
    'PA':                  { pill: 'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300'    },
    'PH':                  { pill: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
    'Docteur':             { pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    'Professeur Habilité': { pill: 'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300'  },
};
const defaultGradePill = 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300';
const gradePill = (g) => GRADE_META[g]?.pill ?? defaultGradePill;

// ─── Module type colour ───────────────────────────────────────────────────────
const TYPE_COLORS = {
    Fondamental: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
    Optionnel:   'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',
    Transversal: 'bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-300',
};
const typePill = (type) => TYPE_COLORS[type] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';

// ─── Avatar ───────────────────────────────────────────────────────────────────
function ProfAvatar({ prof }) {
    const user    = prof?.user;
    const initial = (user?.prenom_fr?.[0] ?? user?.nom_fr?.[0] ?? '?').toUpperCase();
    const src     = user?.avatar_url;
    return src
        ? <img src={src} alt="avatar" className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl" />
        : <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl text-white font-bold ring-4 ring-white dark:ring-slate-800 shadow-xl">{initial}</div>;
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, mono = false }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 mt-0.5">
                <Icon d={icon} className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-none mb-1">{label}</p>
                <p className={`text-sm font-medium text-slate-800 dark:text-white break-all ${mono ? 'font-mono tracking-wider' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ title, icon, children, action }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 px-5 py-4 bg-slate-50/70 dark:bg-slate-700/30">
                <div className="flex items-center gap-2.5">
                    <Icon d={icon} className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
                </div>
                {action}
            </div>
            <div className="px-5 py-1">{children}</div>
        </div>
    );
}

// ─── Assign Module slide-over ─────────────────────────────────────────────────
function AssignModuleModal({ prof, unassignedModules, onClose, locale, isRTL, t }) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null); // module object
    const [processing, setProcessing] = useState(false);

    // Filter modules by search query
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return unassignedModules;
        return unassignedModules.filter(m =>
            (m.nom_fr  ?? '').toLowerCase().includes(q) ||
            (m.nom_ar  ?? '').toLowerCase().includes(q) ||
            (m.code_module ?? '').toLowerCase().includes(q)
        );
    }, [search, unassignedModules]);

    const submit = (e) => {
        e.preventDefault();
        if (!selected || processing) return;
        setProcessing(true);
        router.post(
            route('professors.assignModule', prof.id),
            { module_id: selected.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    router.reload({ only: ['prof', 'unassignedModules'] });
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900"
                dir={isRTL ? 'rtl' : 'ltr'}>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                            <Icon d={ICONS.modules} className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                {locale === 'ar' ? 'تعيين وحدة للأستاذ' : 'Assigner un module'}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {locale === 'ar' ? 'اختر وحدة من القائمة غير المُسنَدة' : 'Choisissez parmi les modules sans professeur'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition">
                        <Icon d={ICONS.close} className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 flex flex-col overflow-hidden px-5 py-4 gap-3">

                        {/* Search */}
                        <div className="relative flex-shrink-0">
                            <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-slate-400">
                                <Icon d={ICONS.search} className="h-4 w-4" />
                            </span>
                            <input
                                type="search" value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={locale === 'ar' ? 'بحث بالاسم أو الرمز…' : 'Rechercher par nom ou code…'}
                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 ps-10 pe-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                            />
                        </div>

                        {/* Module list */}
                        {unassignedModules.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50 mb-3">
                                    <Icon d={ICONS.empty} className="h-6 w-6 text-slate-300 dark:text-slate-500" />
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {locale === 'ar' ? 'كل الوحدات مُسنَدة بالفعل' : 'Tous les modules sont déjà assignés'}
                                </p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center py-8 text-sm text-slate-400">
                                {locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat'}
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/60">
                                {filtered.map(mod => {
                                    const name = locale === 'ar' ? (mod.nom_ar || mod.nom_fr) : (mod.nom_fr || mod.nom_ar);
                                    const isSelected = selected?.id === mod.id;
                                    return (
                                        <button key={mod.id} type="button"
                                            onClick={() => setSelected(isSelected ? null : mod)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-start transition
                                                ${isSelected
                                                    ? 'bg-violet-50 dark:bg-violet-900/20'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
                                            {/* Selection indicator */}
                                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition
                                                ${isSelected
                                                    ? 'border-violet-600 bg-violet-600'
                                                    : 'border-slate-300 dark:border-slate-600'}`}>
                                                {isSelected && (
                                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </span>
                                            {/* Module info */}
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-sm font-medium truncate ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-800 dark:text-white'}`}>
                                                    {name}
                                                </p>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">{mod.code_module}</p>
                                            </div>
                                            {/* Type chip */}
                                            {mod.type_module && (
                                                <span className={`hidden sm:inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${typePill(mod.type_module)}`}>
                                                    {mod.type_module}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Selected preview */}
                        {selected && (
                            <div className="flex-shrink-0 flex items-center gap-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50 px-4 py-3">
                                <Icon d={ICONS.check} className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 truncate">
                                        {locale === 'ar' ? (selected.nom_ar || selected.nom_fr) : (selected.nom_fr || selected.nom_ar)}
                                    </p>
                                    <p className="text-[10px] text-violet-500 dark:text-violet-400 font-mono">{selected.code_module}</p>
                                </div>
                                <button type="button" onClick={() => setSelected(null)}
                                    className="text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition">
                                    <Icon d={ICONS.close} className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className={`flex-shrink-0 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                            {locale === 'ar' ? 'إلغاء' : 'Annuler'}
                        </button>
                        <button type="submit" disabled={!selected || processing}
                            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {processing
                                ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                : <Icon d={ICONS.check} className="h-4 w-4" />
                            }
                            {processing
                                ? (locale === 'ar' ? 'جاري التعيين…' : 'Assignation…')
                                : (locale === 'ar' ? 'تعيين الوحدة' : 'Assigner le module')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function ShowPage() {
    const { t, locale, isRTL } = useLanguage();
    const { prof, unassignedModules } = usePage().props;
    const [addModuleOpen, setAddModuleOpen] = useState(false);

    const user     = prof?.user;
    const isActive = user?.is_active !== false;
    const modules  = prof?.modules ?? [];

    const displayName = isRTL
        ? `${user?.prenom_ar ?? user?.prenom_fr ?? ''} ${user?.nom_ar ?? user?.nom_fr ?? ''}`.trim() || user?.email
        : `${user?.prenom_fr ?? ''} ${user?.nom_fr ?? ''}`.trim() || user?.email;

    const displayNameAlt = isRTL
        ? `${user?.prenom_fr ?? ''} ${user?.nom_fr ?? ''}`.trim()
        : `${user?.prenom_ar ?? ''} ${user?.nom_ar ?? ''}`.trim();

    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    return (
        <>
            <Head title={displayName ?? t('viewProfessor')} />

            {/* ── Back bar ── */}
            <div className="mb-6">
                <button
                    onClick={() => router.visit(route('professors.index'))}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                    <Icon d={isRTL ? 'M14 5l7 7m0 0l-7 7m7-7H3' : ICONS.back} className="h-4 w-4" />
                    {t('backToProfessors')}
                </button>
            </div>

            {/* ── Hero card ── */}
            <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                {/* Cover */}
                <div className="relative h-36 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 15% 60%, white 1.5px, transparent 1.5px), radial-gradient(circle at 85% 25%, white 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }} />
                    {/* Status pill */}
                    <span className={`absolute top-4 end-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-white/30
                        ${isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/80 text-white'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300'}`} />
                        {isActive ? t('active') : t('inactive')}
                    </span>
                </div>

                {/* Avatar + identity */}
                <div className="relative px-6 pb-6">
                    <div className="-mt-12 mb-4">
                        <ProfAvatar prof={prof} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{displayName}</h1>
                            {displayNameAlt && (
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{displayNameAlt}</p>
                            )}
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
                        </div>
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {prof.grade && (
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${gradePill(prof.grade)}`}>
                                    <Icon d={ICONS.star} className="h-3 w-3" fill="currentColor" />
                                    {prof.grade}
                                </span>
                            )}
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
                                ${modules.length > 0 ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'}`}>
                                <Icon d={ICONS.modules} className="h-3 w-3" />
                                {prof.modules_count ?? modules.length} {t('modulesCount')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Two-column layout ── */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                {/* Left: contact + academic */}
                <div className="lg:col-span-1 flex flex-col gap-5">

                    <SectionCard title={t('profContact')} icon={ICONS.phone}>
                        <InfoRow icon={ICONS.mail}  label={t('email')}     value={user?.email ?? '—'} />
                        <InfoRow icon={ICONS.phone} label={t('telephone')} value={prof.telephone || <span className="italic text-slate-400">{t('noPhone')}</span>} />
                        <InfoRow icon={ICONS.id}    label={t('cin')}       value={prof.cin || <span className="italic text-slate-400">{t('noCin')}</span>} mono={!!prof.cin} />
                    </SectionCard>

                    <SectionCard title={t('profAcademic')} icon={ICONS.star}>
                        <InfoRow
                            icon={ICONS.star}
                            label={t('profGrade')}
                            value={prof.grade
                                ? <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${gradePill(prof.grade)}`}>{prof.grade}</span>
                                : <span className="italic text-slate-400">{t('noGrade')}</span>
                            }
                        />
                        <InfoRow icon={ICONS.calendar} label={t('memberSince')} value={joinedDate} />
                        <InfoRow
                            icon={ICONS.check}
                            label={t('emailVerified')}
                            value={user?.email_verified_at
                                ? <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                    <Icon d={ICONS.check} className="h-3.5 w-3.5" />
                                    {locale === 'ar' ? 'موثّق' : 'Oui'}
                                  </span>
                                : <span className="italic text-slate-400">{locale === 'ar' ? 'غير موثّق' : 'Non'}</span>
                            }
                        />
                    </SectionCard>
                </div>

                {/* Right: modules */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden h-full flex flex-col">

                        {/* Header with "Add module" button */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 px-5 py-4 bg-slate-50/70 dark:bg-slate-700/30 flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <Icon d={ICONS.modules} className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('profModules')}</h3>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold
                                    ${modules.length > 0 ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'}`}>
                                    {modules.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setAddModuleOpen(true)}
                                className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95"
                            >
                                <Icon d={ICONS.plus} className="h-3.5 w-3.5" />
                                {locale === 'ar' ? 'إضافة وحدة' : 'Ajouter un module'}
                            </button>
                        </div>

                        {/* Module list */}
                        {modules.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center py-16 px-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50 mb-3">
                                    <Icon d={ICONS.empty} className="h-7 w-7 text-slate-300 dark:text-slate-500" />
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('noModulesAssigned')}</p>
                                <button
                                    onClick={() => setAddModuleOpen(true)}
                                    className="mt-4 flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-semibold text-white transition"
                                >
                                    <Icon d={ICONS.plus} className="h-3.5 w-3.5" />
                                    {locale === 'ar' ? 'إضافة أول وحدة' : 'Ajouter le premier module'}
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 overflow-y-auto">
                                {modules.map(mod => {
                                    const modName = locale === 'ar' ? (mod.nom_ar || mod.nom_fr) : (mod.nom_fr || mod.nom_ar);
                                    return (
                                        <div key={mod.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors">
                                            {/* Icon bubble */}
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                                                <Icon d={ICONS.modules} className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            {/* Name + code */}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{modName}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{mod.code_module}</p>
                                            </div>
                                            {/* Meta chips */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {mod.type_module && (
                                                    <span className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${typePill(mod.type_module)}`}>
                                                        {mod.type_module}
                                                    </span>
                                                )}
                                                {mod.coefficient && (
                                                    <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                                        ×{mod.coefficient}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                    <Icon d={ICONS.users} className="h-3 w-3" />
                                                    {mod.etudiants_count ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Assign module slide-over ── */}
            {addModuleOpen && (
                <AssignModuleModal
                    prof={prof}
                    unassignedModules={unassignedModules ?? []}
                    onClose={() => setAddModuleOpen(false)}
                    locale={locale}
                    isRTL={isRTL}
                    t={t}
                />
            )}
        </>
    );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function ProfessorShow(props) {
    return (
        <LanguageProvider>
            <AdminLayout title={<InnerTitle />}>
                <ShowPage {...props} />
            </AdminLayout>
        </LanguageProvider>
    );
}

function InnerTitle() {
    const { t } = useLanguage();
    return <>{t('viewProfessor')}</>;
}
