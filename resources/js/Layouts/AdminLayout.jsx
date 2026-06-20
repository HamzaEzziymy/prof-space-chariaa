import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
    HomeIcon,
    UserGroupIcon,
    AcademicCapIcon,
    BookOpenIcon,
    BuildingOffice2Icon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    Squares2X2Icon,
    CalendarDaysIcon,
    UserIcon,
    Cog6ToothIcon,
    BellIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
    ArrowRightOnRectangleIcon,
    SunIcon,
    MoonIcon,
    ShareIcon,
    WrenchScrewdriverIcon,
    ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function SideNavItem({ href, icon: IconComponent, label, active, collapsed, isRTL }) {
    const [tooltip, setTooltip] = useState(null);

    const handleMouseEnter = (e) => {
        if (!collapsed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            top: rect.top + rect.height / 2,
            ...(isRTL
                ? { right: window.innerWidth - rect.left + 8 }
                : { left: rect.right + 8 }),
        });
    };

    return (
        <>
            <Link
                href={href}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setTooltip(null)}
                className={[
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                        ? 'bg-primary text-white shadow-md'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white',
                    collapsed ? 'justify-center' : '',
                ].join(' ')}
            >
                <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                    <IconComponent className="w-5 h-5" />
                </span>
                {!collapsed && <span className="truncate">{label}</span>}
            </Link>

            {/* Tooltip — fixed-position, escapes sidebar overflow */}
            {collapsed && tooltip && (
                <div
                    className="pointer-events-none fixed z-[999] -translate-y-1/2 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg whitespace-nowrap"
                    style={{ top: tooltip.top, ...(isRTL ? { right: tooltip.right } : { left: tooltip.left }) }}
                >
                    {label}
                </div>
            )}
        </>
    );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function AdminLayout({ children, title }) {
    const { t, locale, toggleLocale, isRTL } = useLanguage();
    const { auth, appSettings } = usePage().props;
    const user = auth?.user;

    const appName    = isRTL ? (appSettings?.app_name_ar || appSettings?.app_name || t('appName'))
                             : (appSettings?.app_name    || t('appName'));
    const appTagline = isRTL ? (appSettings?.app_tagline_ar || appSettings?.app_tagline || t('adminPanel'))
                             : (appSettings?.app_tagline    || t('adminPanel'));

    const [sidebarOpen, setSidebarOpen]           = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        () => localStorage.getItem('sidebar_collapsed') === 'true'
    );
    const [darkMode, setDarkMode]   = useState(() => localStorage.getItem('theme') === 'dark');
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen]     = useState(false);
    const profileRef = useRef(null);
    const notifRef   = useRef(null);

    const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
    useEffect(() => {
        const onResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
            if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { setSidebarOpen(false); }, [isRTL, isDesktop]);

    const navItems = [
        { key: 'dashboard',          href: route('dashboard'),                  icon: HomeIcon,                    label: t('dashboard')        },
        { key: 'structure',          href: route('structure.index'),            icon: ShareIcon,                   label: t('structure')        },
        { key: 'professors',         href: route('professors.index'),           icon: UserGroupIcon,               label: t('professors')       },
        { key: 'students',           href: route('etudiants.index'),            icon: AcademicCapIcon,             label: t('students')         },
        { key: 'modules',            href: route('modules.index'),              icon: BookOpenIcon,                label: t('modules')          },
        { key: 'inscriptions',       href: route('inscriptions.index'),         icon: ClipboardDocumentListIcon,   label: t('inscriptions')     },
        { key: 'exam-inscriptions',  href: route('inscription-examen.index'),   icon: ClipboardDocumentCheckIcon, label: t('examInscriptions') },
        { key: 'grades',             href: route('notes.index'),                icon: DocumentTextIcon,            label: t('grades')           },
    ];

    const adminItems = [
        ...(user?.role === 'super_admin'
            ? [{ key: 'users',    href: route('users.index'),    icon: UserIcon,       label: t('users')    }]
            : []),
        ...(user?.role === 'super_admin'
            ? [{ key: 'settings', href: route('settings.index'), icon: Cog6ToothIcon,  label: t('settings') }]
            : []),
    ];

    const currentRoute = route().current();
    const currentRouteKey = currentRoute?.includes('settings')          ? 'settings'
        : currentRoute?.includes('users')               ? 'users'
        : currentRoute?.includes('professors')          ? 'professors'
        : currentRoute?.includes('etudiants')           ? 'students'
        : currentRoute?.includes('notes')               ? 'grades'
        : currentRoute?.includes('inscription-examen')  ? 'exam-inscriptions'
        : currentRoute?.includes('inscriptions')        ? 'inscriptions'
        : currentRoute?.includes('structure')           ? 'structure'
        : currentRoute?.includes('modules')             ? 'modules'
        : currentRoute?.includes('dashboard')           ? 'dashboard'
        : currentRoute ?? '';

    const SIDEBAR_W = sidebarCollapsed ? 72 : 256;

    const sidebarVisible = isDesktop || sidebarOpen;
    const sidebarStyle = {
        position:  'fixed',
        top:       0,
        bottom:    0,
        width:     SIDEBAR_W,
        zIndex:    40,
        ...(isRTL ? { right: 0, left: 'auto' } : { left: 0, right: 'auto' }),
        transform: sidebarVisible
            ? 'translateX(0)'
            : isRTL ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease, width 0.3s ease',
    };

    const mainStyle = isDesktop
        ? (isRTL
            ? { marginRight: SIDEBAR_W, marginLeft: 0,  transition: 'margin 0.3s ease' }
            : { marginLeft:  SIDEBAR_W, marginRight: 0, transition: 'margin 0.3s ease' })
        : { marginLeft: 0, marginRight: 0 };

    const userDisplay = user
        ? (isRTL
            ? `${user.prenom_ar ?? user.prenom_fr ?? ''} ${user.nom_ar ?? user.nom_fr ?? ''}`.trim()
            : `${user.prenom_fr ?? ''} ${user.nom_fr ?? ''}`.trim())
        : 'Admin';

    const userInitial = user
        ? ((isRTL ? user.nom_ar?.[0] : user.nom_fr?.[0]) ?? user.email?.[0]?.toUpperCase())
        : 'A';

    return (
        <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
        >
            {/* ── Mobile overlay ── */}
            {sidebarOpen && !isDesktop && (
                <div
                    className="fixed inset-0 z-30 bg-black/50"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                style={sidebarStyle}
                className="flex flex-col bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm"
            >
                {/* Logo */}
                <div className={`flex h-16 shrink-0 items-center border-b border-slate-200 dark:border-slate-700/60 px-4 gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden ${appSettings?.app_favicon_url ? '' : 'bg-primary'}`}>
                        {appSettings?.app_favicon_url
                            ? <img src={appSettings.app_favicon_url} alt={appName} className="h-full w-full object-cover" />
                            : <span className="text-lg font-bold text-white">{appName?.[0] ?? 'P'}</span>
                        }
                    </div>
                    {!sidebarCollapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none truncate">{appName}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{appTagline}</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4">
                    <div className="space-y-0.5">
                        {!sidebarCollapsed && (
                            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {t('menu')}
                            </p>
                        )}
                        {navItems.map((item) => (
                            <SideNavItem
                                key={item.key}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={currentRouteKey === item.key}
                                collapsed={sidebarCollapsed}
                                isRTL={isRTL}
                            />
                        ))}
                    </div>

                    {adminItems.length > 0 && (
                        <div className="my-3 border-t border-slate-200 dark:border-slate-700/60" />
                    )}

                    {adminItems.length > 0 && (
                        <div className="space-y-0.5">
                            {!sidebarCollapsed && (
                                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Admin
                                </p>
                            )}
                            {adminItems.map((item) => (
                                <SideNavItem
                                    key={item.key}
                                    href={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                    active={currentRouteKey === item.key}
                                    collapsed={sidebarCollapsed}
                                    isRTL={isRTL}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex-1" />

                    {!sidebarCollapsed && (
                        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                    {user?.avatar_url
                                        ? <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                                        : userInitial}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-800 dark:text-white truncate">{userDisplay}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Main content ── */}
            <div style={mainStyle} className="flex flex-1 flex-col overflow-hidden">

                {/* ── Topbar ── */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">

                    {/* Start side */}
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
                        >
                            {sidebarOpen
                                ? <XMarkIcon className="w-5 h-5" />
                                : <Bars3Icon className="w-5 h-5" />}
                        </button>

                        {/* Desktop collapse */}
                        <button
                            onClick={() => {
                                const next = !sidebarCollapsed;
                                setSidebarCollapsed(next);
                                localStorage.setItem('sidebar_collapsed', next);
                            }}
                            className="hidden lg:flex rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <Bars3Icon className="w-5 h-5" />
                        </button>

                        {title && (
                            <h1 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                {title}
                            </h1>
                        )}
                    </div>

                    {/* End side */}
                    <div className="flex items-center gap-2">

                        {/* Language toggle */}
                        <button
                            onClick={toggleLocale}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <span className="text-base leading-none">{locale === 'fr' ? '🇲🇦' : '🇫🇷'}</span>
                            <span>{locale === 'fr' ? 'عربية' : 'Français'}</span>
                        </button>

                        {/* Dark mode */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            {darkMode
                                ? <SunIcon className="w-5 h-5" />
                                : <MoonIcon className="w-5 h-5" />}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <BellIcon className="w-5 h-5" />
                                <span
                                    className="absolute top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800"
                                    style={{ [isRTL ? 'left' : 'right']: 4 }}
                                />
                            </button>

                            {notifOpen && (
                                <div
                                    className="absolute top-10 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
                                    style={{ [isRTL ? 'left' : 'right']: 0 }}
                                >
                                    <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
                                        <p className="font-semibold text-slate-700 dark:text-white">{t('recentActivity')}</p>
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">3</span>
                                    </div>
                                    {[
                                        { icon: '👤', text: t('newStudentRegistered'), time: `5 ${t('minutesAgo')}` },
                                        { icon: '📚', text: t('moduleCreated'),        time: `1 ${t('hoursAgo')}` },
                                        { icon: '📝', text: t('gradeUpdated'),         time: `2 ${t('daysAgo')}` },
                                    ].map((n, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                            <span className="text-xl">{n.icon}</span>
                                            <div>
                                                <p className="text-sm text-slate-700 dark:text-slate-200">{n.text}</p>
                                                <p className="text-xs text-slate-400">{n.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                    {user?.avatar_url
                                        ? <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                                        : userInitial}
                                </div>
                                <div className="hidden sm:block" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">{userDisplay}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{user?.role ? t(user.role) : t('admin')}</p>
                                </div>
                                <ChevronDownIcon className="w-4 h-4 text-slate-400 hidden sm:block" />
                            </button>

                            {profileOpen && (
                                <div
                                    className="absolute top-12 z-50 w-52 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 py-1"
                                    style={{ [isRTL ? 'left' : 'right']: 0 }}
                                >
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        {t('profile')}
                                    </Link>
                                    <Link
                                        href={route('settings.index')}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        <Cog6ToothIcon className="w-4 h-4" />
                                        {t('settings')}
                                    </Link>
                                    <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        replace
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                        {t('logout')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
