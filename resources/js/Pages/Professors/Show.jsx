import AdminLayout from '@/Layouts/AdminLayout';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
    mail:    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    phone:   'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    id:      'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
    star:    'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    modules: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    check:   'M5 13l4 4L19 7',
    close:   'M6 18L18 6M6 6l12 12',
    users:   'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    calendar:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    groups:  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 4h-6m0 0h-6m6 0V5M9 11h6',
    empty:   'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    plus:    'M12 4v16m8-8H4',
    folder:  'M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v1M2 6v12a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2H2z',
    search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    lock:    'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
};

const GP = (grade) => {
    const m = {
        'PES': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'PH':  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'PA':  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    };
    return m[grade] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
};

const TP = (t) => {
    const m = {
        'Cours': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        'TD':    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
        'TP':    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return m[t] ?? 'bg-slate-100 text-slate-600';
};

function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg   = flash?.success || flash?.error;
    const isErr = !!flash?.error;
    useEffect(() => {
        if (msg) { setVisible(true); const timer = setTimeout(() => setVisible(false), 4000); return () => clearTimeout(timer); }
    }, [msg, flash]);
    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium ${isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={isErr ? ICONS.close : ICONS.check} />
            </svg>
            {msg}
        </div>
    );
}

function ProfAvatar({ prof }) {
    const { locale } = useLanguage();
    const user = prof?.user;
    const initial = user
        ? (locale === 'ar'
            ? (user.prenom_ar?.[0] || user.prenom_fr?.[0] || '?')
            : (user.prenom_fr?.[0] || user.prenom_ar?.[0] || '?'))
        : '?';
    return (
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-slate-800 overflow-hidden shrink-0">
            {user?.avatar_url
                ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                : initial
            }
        </div>
    );
}

function InfoRow({ icon, label, value, mono }) {
    return (
        <div className="flex items-center gap-3 py-2.5">
            <Icon d={icon} className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[5rem]">{label}</span>
            <span className={`text-sm text-slate-700 dark:text-slate-200 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
        </div>
    );
}

function SectionCard({ title, icon, children }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-700/30">
                <Icon d={icon} className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{title}</span>
            </div>
            <div className="px-5 py-1 divide-y divide-slate-50 dark:divide-slate-700/30">{children}</div>
        </div>
    );
}

function ShowPage() {
    const { t, locale, isRTL } = useLanguage();
    const { prof, assignableGroupes } = usePage().props;
    const user = prof?.user;
    const isActive = user?.is_active !== false;
    const groupes = prof?.groupes ?? [];
    const [showAssign, setShowAssign] = useState(false);
    const [searchGroupes, setSearchGroupes] = useState('');
    const [removingGroupeId, setRemovingGroupeId] = useState(null);
    const [unassigning, setUnassigning] = useState(false);
    const [showAllGroupes, setShowAllGroupes] = useState(false);
    const PAGE_SIZE = 5;
    const displayedGroupes = showAllGroupes ? groupes : groupes.slice(0, PAGE_SIZE);

    const displayName = isRTL
        ? `${user?.prenom_ar ?? user?.prenom_fr ?? ''} ${user?.nom_ar ?? user?.nom_fr ?? ''}`.trim() || user?.email
        : `${user?.prenom_fr ?? ''} ${user?.nom_fr ?? ''}`.trim() || user?.email;

    const displayNameAlt = isRTL
        ? `${user?.prenom_fr ?? ''} ${user?.nom_fr ?? ''}`.trim()
        : `${user?.prenom_ar ?? ''} ${user?.nom_ar ?? ''}`.trim();

    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    const { flash } = usePage().props;

    const availableGroupes = (assignableGroupes ?? []).filter(g =>
        !searchGroupes || g.code.toLowerCase().includes(searchGroupes.toLowerCase()) ||
        (g.nom_fr || '').toLowerCase().includes(searchGroupes.toLowerCase()) ||
        (g.nom_ar || '').includes(searchGroupes)
    );

    const handleAssign = (groupe) => {
        router.post(route('professors.assign-groupe', [prof.id, groupe.id]), {}, {
            preserveScroll: true,
            onSuccess: () => setShowAssign(false),
        });
    };

    const confirmRemove = (groupe) => {
        setRemovingGroupeId(null);
        setUnassigning(true);
        router.delete(route('professors.unassign-groupe', [prof.id, groupe.id]), {
            preserveScroll: true,
            onFinish: () => setUnassigning(false),
        });
    };

    return (
        <>
            <Head title={displayName ?? t('viewProfessor')} />
            <Toast flash={flash} t={t} />

            {unassigning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                    <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 px-5 py-3 shadow-lg">
                        <svg className="h-5 w-5 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {locale === 'ar' ? 'جاري إزالة المجموعة...' : 'Désassignation en cours...'}
                        </span>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <button
                    onClick={() => router.visit(route('professors.index'))}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                    <Icon d={isRTL ? 'M14 5l7 7m0 0l-7 7m7-7H3' : ICONS.back} className="h-4 w-4" />
                    {t('backToProfessors')}
                </button>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                <div className="relative h-36 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 15% 60%, white 1.5px, transparent 1.5px), radial-gradient(circle at 85% 25%, white 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }} />
                    <span className={`absolute top-4 end-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-white/30
                        ${isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/80 text-white'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300'}`} />
                        {isActive ? t('active') : t('inactive')}
                    </span>
                </div>

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
                        <div className="flex flex-wrap items-center gap-2">
                            {prof.grade && (
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${GP(prof.grade)}`}>
                                    <Icon d={ICONS.star} className="h-3 w-3" fill="currentColor" />
                                    {prof.grade}
                                </span>
                            )}
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
                                ${groupes.length > 0 ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'}`}>
                                <Icon d={ICONS.groups} className="h-3 w-3" />
                                {prof.groupes_count ?? groupes.length} {locale === 'ar' ? 'مجموعة' : 'groupe(s)'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="lg:col-span-1 flex flex-col gap-5">
                    <SectionCard title={t('profContact')} icon={ICONS.phone}>
                        <InfoRow icon={ICONS.mail}  label={t('email')}     value={user?.email ?? '—'} />
                        <InfoRow icon={ICONS.phone} label={t('telephone')} value={prof.telephone || <span className="italic text-slate-400">{t('noPhone')}</span>} />
                        <InfoRow icon={ICONS.id}    label={t('cin')}       value={prof.cin || <span className="italic text-slate-400">{t('noCin')}</span>} mono={!!prof.cin} />
                    </SectionCard>

                    <SectionCard title={t('profAcademic')} icon={ICONS.star}>
                        <InfoRow icon={ICONS.star} label={t('profGrade')} value={prof.grade ? <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${GP(prof.grade)}`}>{prof.grade}</span> : <span className="italic text-slate-400">{t('noGrade')}</span>} />
                        <InfoRow icon={ICONS.calendar} label={t('memberSince')} value={joinedDate} />
                        <InfoRow icon={ICONS.user} label={locale === 'ar' ? 'آخر اتصال' : 'Dernière connexion'}
                            value={!user?.must_change_password
                                ? <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"><Icon d={ICONS.check} className="h-3.5 w-3.5" />{locale === 'ar' ? 'متصل' : 'Connecté'}</span>
                                : <span className="inline-flex items-center gap-1 text-slate-400 italic"><Icon d={ICONS.close} className="h-3.5 w-3.5" />{locale === 'ar' ? 'لم يتصل بعد' : 'Jamais connecté'}</span>} />
                        <InfoRow icon={ICONS.lock} label={locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                            value={user?.must_change_password
                                ? <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 text-amber-700 dark:text-amber-400 font-semibold text-[11px]"><Icon d={ICONS.star} className="h-3 w-3" fill="currentColor" />{locale === 'ar' ? 'تغيير إجباري' : 'Chang. obligatoire'}</span>
                                : <span className="inline-flex items-center gap-1 text-slate-400"><Icon d={ICONS.check} className="h-3.5 w-3.5" />{locale === 'ar' ? 'تم التغيير' : 'Modifié'}</span>} />
                    </SectionCard>
                </div>

                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 px-5 py-4 bg-slate-50/70 dark:bg-slate-700/30 flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <Icon d={ICONS.groups} className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {locale === 'ar' ? 'المجموعات' : 'Groupes'}
                                </h3>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold
                                    ${groupes.length > 0 ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'}`}>
                                    {groupes.length}
                                </span>
                            </div>
                            <button onClick={() => setShowAssign(true)}
                                className="flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition">
                                <Icon d={ICONS.plus} className="h-3.5 w-3.5" />
                                {locale === 'ar' ? 'إضافة مجموعة' : 'Assigner'}
                            </button>
                        </div>

                        {groupes.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center py-16 px-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50 mb-3">
                                    <Icon d={ICONS.empty} className="h-7 w-7 text-slate-300 dark:text-slate-500" />
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {locale === 'ar' ? 'لا توجد مجموعات' : 'Aucun groupe assigné'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 overflow-y-auto">
                                {displayedGroupes.map(g => {
                                    const mod = g.module;
                                    const sem = mod?.semestre;
                                    const niv = sem?.niveau;
                                    const fil = niv?.filiere;
                                    const modName = mod ? (locale === 'ar' ? (mod.nom_ar || mod.nom_fr) : (mod.nom_fr || mod.nom_ar)) : '—';
                                    const gName = locale === 'ar' ? (g.nom_ar || g.code) : (g.nom_fr || g.code);
                                    const nivName = niv ? (locale === 'ar' ? (niv.nom_ar || niv.nom_fr) : (niv.nom_fr || niv.nom_ar)) : '';
                                    const semName = sem ? (locale === 'ar' ? (sem.nom_ar || sem.nom_fr) : (sem.nom_fr || sem.nom_ar)) : '';
                                    return (
                                    <div key={g.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors group">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30">
                                                <Icon d={ICONS.users} className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                            </div>
                                            <div className="min-w-0 flex-1 flex items-center gap-1.5 text-[13px] text-slate-700 dark:text-slate-200 truncate">
                                                <span className="font-bold truncate">{gName}</span>
                                                <code className="shrink-0 rounded bg-slate-100 dark:bg-slate-700 px-1 py-px text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">{g.code}</code>
                                                {mod && (
                                                    <>
                                                        <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
                                                        <span className="font-medium truncate">{modName}</span>
                                                        <code className="shrink-0 text-[11px] text-slate-400 font-mono">{mod.code_module}</code>
                                                    </>
                                                )}
                                                {sem && (
                                                    <>
                                                        <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
                                                        <span className="shrink-0 inline-flex items-center rounded bg-amber-50 dark:bg-amber-900/20 px-1.5 py-px text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                                            <svg className="h-2.5 w-2.5 me-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            {sem.code}
                                                        </span>
                                                    </>
                                                )}
                                                {niv && (
                                                    <>
                                                        <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
                                                        <span className="shrink-0 inline-flex items-center rounded bg-sky-50 dark:bg-sky-900/20 px-1.5 py-px text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                                                            <svg className="h-2.5 w-2.5 me-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                            {nivName || niv.code}
                                                        </span>
                                                    </>
                                                )}
                                                {fil && (
                                                    <>
                                                        <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
                                                        <span className="shrink-0 inline-flex items-center rounded bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-px text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                            <svg className="h-2.5 w-2.5 me-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                            {fil.code}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {removingGroupeId === g.id ? (
                                                    <div className="flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-1">
                                                        <span className="text-[10px] font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                                                            {locale === 'ar' ? 'تأكيد الإزالة؟' : 'Confirmer ?'}
                                                        </span>
                                                        <button onClick={() => confirmRemove(g)}
                                                            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 transition">
                                                            {locale === 'ar' ? 'نعم' : 'Oui'}
                                                        </button>
                                                        <button onClick={() => setRemovingGroupeId(null)}
                                                            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                                                            {locale === 'ar' ? 'إلغاء' : 'Non'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setRemovingGroupeId(g.id)}
                                                        title={locale === 'ar' ? 'إزالة' : 'Retirer'}
                                                        className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                                                        <Icon d={ICONS.close} className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {groupes.length > PAGE_SIZE && (
                            <div className="border-t border-slate-100 dark:border-slate-700/60 px-5 py-3">
                                <button onClick={() => setShowAllGroupes(!showAllGroupes)}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                    <Icon d={showAllGroupes ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} className="h-3.5 w-3.5" />
                                    {showAllGroupes
                                        ? (locale === 'ar' ? 'عرض أقل' : 'Voir moins')
                                        : (locale === 'ar'
                                            ? `عرض ${groupes.length - PAGE_SIZE} أخرى`
                                            : `Voir ${groupes.length - PAGE_SIZE} autres`)}
                                </button>
                            </div>
                        )}

                        {/* ── Assign modal overlay ── */}
                        {showAssign && (
                            <>
                                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => { setShowAssign(false); setSearchGroupes(''); }} />
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                    <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 flex flex-col max-h-[80vh] overflow-hidden">
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                                                    <Icon d={ICONS.groups} className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                                                        {locale === 'ar' ? 'إضافة مجموعة' : 'Assigner un groupe'}
                                                    </h2>
                                                    <p className="text-[11px] text-slate-400">
                                                        {locale === 'ar' ? 'اختر مجموعة من القائمة' : 'Sélectionnez un groupe dans la liste'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={() => { setShowAssign(false); setSearchGroupes(''); }}
                                                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                                                <Icon d={ICONS.close} className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Search */}
                                        <div className="px-5 pt-4 pb-2">
                                            <div className="relative">
                                                <span className="absolute inset-y-0 start-3 flex items-center text-slate-400">
                                                    <Icon d={ICONS.search} className="h-4 w-4" />
                                                </span>
                                                <input type="text" value={searchGroupes} onChange={e => setSearchGroupes(e.target.value)}
                                                    placeholder={locale === 'ar' ? 'بحث بالرمز أو الاسم...' : 'Rechercher par code ou nom...'}
                                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 ps-10 pe-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30 transition"
                                                    autoFocus />
                                            </div>
                                        </div>

                                        {/* List */}
                                        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-1 min-h-[200px]">
                                            {availableGroupes.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
                                                        <Icon d={ICONS.empty} className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        {searchGroupes
                                                            ? (locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat')
                                                            : (locale === 'ar' ? 'لا توجد مجموعات متاحة' : 'Aucun groupe disponible')}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                        {locale === 'ar' ? 'جميع المجموعات مشغلة بالفعل' : 'Tous les groupes sont déjà assignés'}
                                                    </p>
                                                </div>
                                            ) : availableGroupes.map(g => {
                                                const mod = g.module;
                                                const gName = locale === 'ar' ? (g.nom_ar || g.code) : (g.nom_fr || g.code);
                                                const modName = mod ? (locale === 'ar' ? (mod.nom_ar || mod.nom_fr) : (mod.nom_fr || mod.nom_ar)) : '';
                                                return (
                                                    <button key={g.id} onClick={() => handleAssign(g)}
                                                        className="flex w-full items-center gap-3 rounded-xl border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 px-4 py-3 text-left transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10 group">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30">
                                                            <Icon d={ICONS.groups} className="h-4 w-4 text-violet-600 dark:text-violet-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{gName}</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                                {modName && <>{modName}</>}
                                                                {mod?.code_module && <><span className="mx-1">·</span><code className="font-mono">{mod.code_module}</code></>}
                                                                {mod?.semestre?.niveau?.filiere && <><span className="mx-1">·</span><span className="font-medium">{mod.semestre.niveau.filiere.code}</span></>}
                                                            </p>
                                                        </div>
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition">
                                                            <Icon d={ICONS.plus} className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

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
