import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
    HomeIcon,
    BookOpenIcon,
    UserIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
    ArrowRightOnRectangleIcon,
    SunIcon,
    MoonIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function ProfLayout({ children, wide }) {
    const { t, locale, toggleLocale, isRTL } = useLanguage();
    const { auth, appSettings, profModules } = usePage().props;
    const user = auth?.user;

    const appName = isRTL
        ? (appSettings?.app_name_ar || appSettings?.app_name || t('appName'))
        : (appSettings?.app_name || t('appName'));

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        () => localStorage.getItem('prof_sidebar_collapsed') === 'true'
    );
    const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [tooltip, setTooltip] = useState(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const onResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!isDesktop) setSidebarCollapsed(false);
    }, [isDesktop]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { setSidebarOpen(false); }, [isRTL, isDesktop]);

    const handleToggle = useCallback(() => {
        if (isDesktop) {
            const next = !sidebarCollapsed;
            setSidebarCollapsed(next);
            localStorage.setItem('prof_sidebar_collapsed', next);
        } else {
            setSidebarOpen(prev => !prev);
        }
    }, [isDesktop, sidebarCollapsed]);

    const SIDEBAR_W = sidebarCollapsed ? 72 : 256;
    const sidebarVisible = isDesktop || sidebarOpen;

    const modules = profModules ?? [];

    const currentRoute = route().current();
    const currentParams = route().params;
    const isOnDashboard = currentRoute === 'prof.dashboard';
    const selectedModuleId = currentRoute === 'prof.modules.show' ? Number(currentParams?.module) : null;

    const sidebarStyle = {
        position: 'fixed',
        top: 0,
        bottom: 0,
        width: SIDEBAR_W,
        zIndex: 40,
        ...(isRTL ? { right: 0, left: 'auto' } : { left: 0, right: 'auto' }),
        transform: sidebarVisible ? 'translateX(0)' : (isRTL ? 'translateX(100%)' : 'translateX(-100%)'),
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
        : '';

    const userInitial = user
        ? ((isRTL ? user.nom_ar?.[0] : user.nom_fr?.[0]) ?? user.email?.[0]?.toUpperCase())
        : 'P';

    const handleMouseEnter = (e, label) => {
        if (!sidebarCollapsed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            top: rect.top + rect.height / 2,
            ...(isRTL
                ? { right: window.innerWidth - rect.left + 8 }
                : { left: rect.right + 8 }),
            label,
        });
    };

    return (
        <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
        >
            {/* Mobile overlay */}
            {sidebarOpen && !isDesktop && (
                <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Tooltip */}
            {sidebarCollapsed && tooltip && (
                <div
                    className="pointer-events-none fixed z-[999] -translate-y-1/2 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg whitespace-nowrap"
                    style={{ top: tooltip.top, ...(isRTL ? { right: tooltip.right } : { left: tooltip.left }) }}
                >
                    {tooltip.label}
                </div>
            )}

            {/* Sidebar */}
            <aside style={sidebarStyle} className="flex flex-col bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">

                {/* Logo */}
                <div className={`flex h-14 shrink-0 items-center border-b border-slate-200 dark:border-slate-700/60 px-4 gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden">
                        {appSettings?.app_favicon_url
                            ? <img src={appSettings.app_favicon_url} alt={appName} className="h-full w-full object-cover" />
                            : <span className="text-lg font-bold text-primary">{appName?.[0] ?? 'P'}</span>
                        }
                    </div>
                    {!sidebarCollapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none truncate">{appName}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                                {locale === 'ar' ? 'فضاء الأستاذ' : 'Espace professeur'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4">
                    <div className="space-y-0.5">
                        {/* Dashboard link */}
                        <Link
                            href={route('prof.dashboard')}
                            onMouseEnter={(e) => handleMouseEnter(e, locale === 'ar' ? 'لوحة التحكم' : 'Tableau de bord')}
                            onMouseLeave={() => setTooltip(null)}
                            className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isOnDashboard
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        >
                            <span className={`flex-shrink-0 ${isOnDashboard ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                <HomeIcon className="w-5 h-5" />
                            </span>
                            {!sidebarCollapsed && (
                                <span className="truncate">{locale === 'ar' ? 'لوحة التحكم' : 'Tableau de bord'}</span>
                            )}
                        </Link>
                    </div>

                    {modules.length > 0 && (
                        <>
                            <div className="my-3 border-t border-slate-200 dark:border-slate-700/60" />

                            <div className="space-y-0.5">
                                {!sidebarCollapsed && (
                                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        {locale === 'ar' ? 'الوحدات المدرّسة' : 'Mes modules'}
                                    </p>
                                )}

                                {modules.map(mod => {
                                    const name = isRTL ? (mod.nom_ar || mod.nom_fr) : (mod.nom_fr || mod.nom_ar);
                                    const isSelected = selectedModuleId === mod.id;

                                    if (sidebarCollapsed) {
                                        return (
                                            <Link
                                                key={mod.id}
                                                href={route('prof.modules.show', { module: mod.id })}
                                                onMouseEnter={(e) => handleMouseEnter(e, name)}
                                                onMouseLeave={() => setTooltip(null)}
                                                className={`flex w-full items-center justify-center rounded-lg px-2 py-2.5 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
                                                    isSelected ? 'text-primary bg-primary/5' : 'text-slate-400 dark:text-slate-500'
                                                }`}
                                            >
                                                <BookOpenIcon className="w-4 h-4" />
                                            </Link>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={mod.id}
                                            href={route('prof.modules.show', { module: mod.id })}
                                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-primary/5 to-transparent text-primary font-medium'
                                                    : 'text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            <BookOpenIcon className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                                            <span className="truncate">{name}</span>
                                            {mod.code_module && (
                                                <span className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] ${
                                                    isSelected
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                                                }`}>
                                                    {mod.code_module}
                                                </span>
                                            )}
                                            {isSelected && (
                                                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Push user card to bottom */}
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

            {/* Main content */}
            <div style={mainStyle} className="flex flex-1 flex-col overflow-hidden">

                {/* Header */}
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                        {/* Toggle button */}
                        <button
                            onClick={handleToggle}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title={
                                isDesktop
                                    ? (sidebarCollapsed
                                        ? (locale === 'ar' ? 'توسيع' : 'Développer')
                                        : (locale === 'ar' ? 'طي' : 'Réduire'))
                                    : (sidebarOpen
                                        ? (locale === 'ar' ? 'إغلاق' : 'Fermer')
                                        : (locale === 'ar' ? 'قائمة' : 'Menu'))
                            }
                        >
                            {!isDesktop && sidebarOpen
                                ? <XMarkIcon className="w-4 h-4" />
                                : <Bars3Icon className="w-4 h-4" />}
                        </button>

                        <Link href={route('prof.dashboard')} className="flex items-center gap-2.5 lg:hidden">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold overflow-hidden">
                                {appSettings?.app_favicon_url
                                    ? <img src={appSettings.app_favicon_url} alt="" className="h-full w-full object-cover rounded-lg" />
                                    : appName[0]
                                }
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{appName}</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-1">
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
                            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        >
                            {darkMode
                                ? <SunIcon className="w-4 h-4" />
                                : <MoonIcon className="w-4 h-4" />}
                        </button>

                        {/* Profile */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white overflow-hidden">
                                    {user?.avatar_url
                                        ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                                        : userInitial
                                    }
                                </div>
                                <div className="hidden sm:block" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-tight">{userDisplay}</p>
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                        {locale === 'ar' ? 'أستاذ' : 'Professeur'}
                                    </p>
                                </div>
                                <ChevronDownIcon className="w-3 h-3 text-slate-400 hidden sm:block" />
                            </button>

                            {profileOpen && (
                                <div
                                    className="absolute top-10 z-50 w-44 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 py-1"
                                    style={{ [isRTL ? 'left' : 'right']: 0 }}
                                >
                                    <Link
                                        href={route('prof.dashboard')}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        <HomeIcon className="w-4 h-4" />
                                        {locale === 'ar' ? 'لوحة التحكم' : 'Tableau de bord'}
                                    </Link>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        {t('profile')}
                                    </Link>
                                    <div className="border-t border-slate-100 dark:border-slate-700" />
                                    <Link
                                        href={route('prof.logout')}
                                        method="post"
                                        as="button"
                                        replace
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                <main className={`flex-1 overflow-y-auto mx-auto w-full ${wide ? 'max-w-none' : 'max-w-5xl'} px-6 py-8`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
