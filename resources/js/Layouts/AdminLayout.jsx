import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8}
        viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const icons = {
    dashboard:  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    professors: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    students:   'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    modules:    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    rooms:      'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    grades:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    users:      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    settings:   'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    bell:       'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    menu:       'M4 6h16M4 12h16M4 18h7',
    close:      'M6 18L18 6M6 6l12 12',
    chevronDown:'M19 9l-7 7-7-7',
    logout:     'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    sun:        'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    moon:       'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
};

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function SideNavItem({ href, iconKey, label, active, collapsed, isRTL }) {
    const [tooltip, setTooltip] = useState(null); // { top, left/right }

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
                        : 'text-slate-400 hover:bg-white/10 hover:text-white',
                    collapsed ? 'justify-center' : '',
                ].join(' ')}
            >
                <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}>
                    <Icon d={icons[iconKey]} />
                </span>
                {!collapsed && <span className="truncate">{label}</span>}
            </Link>

            {/* Tooltip rendered via portal-style fixed positioning — escapes sidebar overflow */}
            {collapsed && tooltip && (
                <div
                    className="pointer-events-none fixed z-[999] -translate-y-1/2 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg whitespace-nowrap"
                    style={{ top: tooltip.top, ...( isRTL ? { right: tooltip.right } : { left: tooltip.left }) }}
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
    const { auth } = usePage().props;
    const user = auth?.user;

    const [sidebarOpen, setSidebarOpen]       = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode]             = useState(() => localStorage.getItem('theme') === 'dark');
    const [profileOpen, setProfileOpen]       = useState(false);
    const [notifOpen, setNotifOpen]           = useState(false);
    const profileRef = useRef(null);
    const notifRef   = useRef(null);

    // Window width tracking for mobile breakpoint
    const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
    useEffect(() => {
        const onResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Dark mode
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
            if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Reset mobile sidebar when switching language or going to desktop
    useEffect(() => { setSidebarOpen(false); }, [isRTL, isDesktop]);

    const navItems = [
        { key: 'dashboard',  href: route('dashboard'), iconKey: 'dashboard',  label: t('dashboard')  },
        { key: 'professors', href: '#',                iconKey: 'professors', label: t('professors') },
        { key: 'students',   href: '#',                iconKey: 'students',   label: t('students')   },
        { key: 'modules',    href: '#',                iconKey: 'modules',    label: t('modules')    },
        { key: 'rooms',      href: '#',                iconKey: 'rooms',      label: t('examRooms')  },
        { key: 'grades',     href: '#',                iconKey: 'grades',     label: t('grades')     },
    ];
    const adminItems = [
        { key: 'users',    href: '#', iconKey: 'users',    label: t('users')    },
        { key: 'settings', href: '#', iconKey: 'settings', label: t('settings') },
    ];

    const currentRoute = route().current();
    const SIDEBAR_W    = sidebarCollapsed ? 72 : 256; // px

    // ── Sidebar position:
    //   LTR → anchored to left.  Hidden = translateX(-100%).  Visible = translateX(0).
    //   RTL → anchored to right. Hidden = translateX(+100%).  Visible = translateX(0).
    const sidebarVisible = isDesktop || sidebarOpen;
    const sidebarStyle = {
        position:  'fixed',
        top:       0,
        bottom:    0,
        width:     SIDEBAR_W,
        zIndex:    40,
        // Anchor to the correct edge
        ...(isRTL ? { right: 0, left: 'auto' } : { left: 0, right: 'auto' }),
        // Slide transform for mobile
        transform: sidebarVisible
            ? 'translateX(0)'
            : isRTL ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease, width 0.3s ease',
    };

    // ── Main content offset:
    //   LTR → margin-left = sidebar width.
    //   RTL → margin-right = sidebar width, margin-left = 0.
    const mainStyle = isDesktop
        ? (isRTL
            ? { marginRight: SIDEBAR_W, marginLeft: 0,        transition: 'margin 0.3s ease' }
            : { marginLeft:  SIDEBAR_W, marginRight: 0,       transition: 'margin 0.3s ease' })
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
            className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900"
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
                className="flex flex-col bg-slate-800 dark:bg-slate-950 overflow-hidden"
            >
                {/* Logo */}
                <div className={`flex h-16 shrink-0 items-center border-b border-white/10 px-4 gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
                        <span className="text-lg font-bold text-white">P</span>
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <p className="text-sm font-bold text-white leading-none">{t('appName')}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{t('adminPanel')}</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4">
                    {/* Main items */}
                    <div className="space-y-0.5">
                        {!sidebarCollapsed && (
                            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                {t('menu')}
                            </p>
                        )}
                        {navItems.map((item) => (
                            <SideNavItem
                                key={item.key}
                                href={item.href}
                                iconKey={item.iconKey}
                                label={item.label}
                                active={currentRoute === item.key}
                                collapsed={sidebarCollapsed}
                                isRTL={isRTL}
                            />
                        ))}
                    </div>

                    <div className="my-3 border-t border-white/10" />

                    {/* Admin items */}
                    <div className="space-y-0.5">
                        {!sidebarCollapsed && (
                            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                Admin
                            </p>
                        )}
                        {adminItems.map((item) => (
                            <SideNavItem
                                key={item.key}
                                href={item.href}
                                iconKey={item.iconKey}
                                label={item.label}
                                active={currentRoute === item.key}
                                collapsed={sidebarCollapsed}
                                isRTL={isRTL}
                            />
                        ))}
                    </div>

                    {/* Push user card to bottom */}
                    <div className="flex-1" />

                    {!sidebarCollapsed && (
                        <div className="rounded-xl bg-white/5 p-3">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                                    {userInitial}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-white truncate">{userDisplay}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Main content ── */}
            <div
                style={mainStyle}
                className="flex flex-1 flex-col overflow-hidden"
            >
                {/* ── Topbar ── */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">

                    {/* Start side */}
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
                        >
                            <Icon d={sidebarOpen ? icons.close : icons.menu} />
                        </button>

                        {/* Desktop collapse */}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden lg:flex rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <Icon d={icons.menu} />
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
                            <Icon d={darkMode ? icons.sun : icons.moon} />
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <Icon d={icons.bell} />
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
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                                    {userInitial}
                                </div>
                                <div className="hidden sm:block" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">{userDisplay}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{user?.role ? t(user.role) : t('admin')}</p>
                                </div>
                                <Icon d={icons.chevronDown} className="w-4 h-4 text-slate-400 hidden sm:block" />
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
                                        <Icon d={icons.users} className="w-4 h-4" />
                                        {t('profile')}
                                    </Link>
                                    <Link
                                        href="#"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        <Icon d={icons.settings} className="w-4 h-4" />
                                        {t('settings')}
                                    </Link>
                                    <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Icon d={icons.logout} className="w-4 h-4" />
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
