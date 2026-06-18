import { Head, Link } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { useState } from 'react';

function HomeContent() {
    const { locale, toggleLocale, isRTL } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);

    const isAr = locale === 'ar';

    const navLinks = [
        { label: isAr ? 'الرئيسية' : 'Accueil', href: '#' },
        { label: isAr ? 'الكلية' : 'Faculté', href: '#' },
        { label: isAr ? 'التكوينات' : 'Formations', href: '#' },
        { label: isAr ? 'الإعلانات' : 'Annonces', href: '#' },
        { label: isAr ? 'الموارد' : 'Ressources', href: '#' },
        { label: isAr ? 'اتصل بنا' : 'Contact', href: '#' },
    ];

    const announcements = [
        {
            title: isAr ? 'برنامج الامتحانات للموسم الجامعي 2025-2026' : 'Programme des examens 2025-2026',
            date: '15 يونيو 2026',
            cat: isAr ? 'سلك الإجازة' : 'Licence',
        },
        {
            title: isAr ? 'نتائج مباراة توظيف أستاذ محاضر' : 'Résultat du recrutement d\'un professeur',
            date: '10 يونيو 2026',
            cat: isAr ? 'التوظيفات' : 'Recrutement',
        },
        {
            title: isAr ? 'فتح الترشيحات للتسجيل بسلك الدكتوراه' : 'Ouverture des inscriptions en Doctorat',
            date: '05 يونيو 2026',
            cat: isAr ? 'سلك الدكتوراه' : 'Doctorat',
        },
        {
            title: isAr ? 'ندوة دولية: المنهج النقدي في التراث الإسلامي' : 'Colloque international: Méthode critique dans l\'héritage islamique',
            date: '20 مايو 2026',
            cat: isAr ? 'ندوات' : 'Colloques',
        },
    ];

    return (
        <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* ════════════════════════════════════════════════
               TOP MINISTRY BAR
            ════════════════════════════════════════════════ */}
            <div className="bg-[#1a3a5c] text-white text-[11px]">
                <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-9">
                    <div className="flex items-center gap-2 rtl:flex-row-reverse">
                        <span className="text-base">🇲🇦</span>
                        <span className="font-medium">{isAr ? 'المملكة المغربية' : 'Royaume du Maroc'}</span>
                        <span className="opacity-50 mx-1">|</span>
                        <span className="opacity-80">{isAr ? 'وزارة التعليم العالي والبحث العلمي والابتكار' : 'Ministère de l\'Enseignement Supérieur, de la Recherche Scientifique et de l\'Innovation'}</span>
                    </div>
                    <button type="button" onClick={toggleLocale} className="flex items-center gap-1.5 hover:underline opacity-80 hover:opacity-100 transition flex-shrink-0">
                        <span>{isAr ? 'Français' : 'العربية'}</span>
                        <span className="text-xs">{isAr ? '🇫🇷' : '🇲🇦'}</span>
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════════════
               FACULTY HEADER
            ════════════════════════════════════════════════ */}
            <header className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 shadow-sm">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex items-center gap-4 sm:gap-6 py-5">
                        {/* Logo */}
                        <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/5 border-2 border-primary/20">
                            <div className="text-center">
                                <div className="text-primary font-extrabold text-lg sm:text-xl leading-none">FSH</div>
                                <div className="text-[9px] text-primary/60 font-medium leading-tight mt-0.5">{isAr ? 'الشريعة' : 'CHARIAA'}</div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">
                                {isAr ? 'كلية الشريعة بفاس' : 'Faculté de Chariaa — Fès'}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                {isAr
                                    ? 'جامعة سيدي محمد بن عبد الله — فاس'
                                    : 'Université Sidi Mohamed Ben Abdellah — Fès'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                                {isAr ? 'شعبة الشريعة والقانون' : 'Département des sciences juridiques'}
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                            <a href="https://chariaa.usmba.ac.ma" target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline font-medium">
                                chariaa.usmba.ac.ma
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Nav ── */}
                <div className="border-t border-slate-200 bg-slate-50">
                    <div className="mx-auto max-w-6xl px-4">
                        <nav className="hidden md:flex items-center gap-1 text-sm">
                            {navLinks.map((link, i) => (
                                <a key={i} href={link.href} className="px-4 py-3 text-slate-600 hover:text-primary hover:bg-primary/5 transition font-medium border-b-2 border-transparent hover:border-primary">
                                    {link.label}
                                </a>
                            ))}
                            <div className="mr-auto" />
                            <span className="text-[11px] text-slate-400 px-2">{isAr ? 'هاتف : 0535...' : 'Tél. : 0535...'}</span>
                        </nav>
                        {/* Mobile menu toggle */}
                        <div className="md:hidden flex items-center justify-between py-2">
                            <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-600 p-1">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    {menuOpen
                                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    }
                                </svg>
                            </button>
                            <span className="text-xs text-slate-400">📧 contact@chariaa.usmba.ac.ma</span>
                        </div>
                        {menuOpen && (
                            <div className="md:hidden pb-3 space-y-1">
                                {navLinks.map((link, i) => (
                                    <a key={i} href={link.href} className="block px-3 py-2 text-sm text-slate-600 hover:bg-primary/5 hover:text-primary rounded-lg transition">
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ════════════════════════════════════════════════
               HERO SLIDER AREA
            ════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2b45] via-[#1a3a5c] to-[#2a5298] text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
                <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-primary/10 blur-3xl"></div>

                <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-28">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white/80 mb-6 border border-white/10">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {isAr ? 'منصة التسيير البيداغوجي الرقمية' : 'Plateforme pédagogique numérique'}
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                            {isAr ? (
                                <>مساحة <span className="text-primary-300">الأساتذة</span></>
                            ) : (
                                <>Espace <span className="text-primary-300">Professeurs</span></>
                            )}
                        </h2>
                        <p className="mt-4 text-sm sm:text-base text-white/70 max-w-lg leading-relaxed">
                            {isAr
                                ? 'منصة متكاملة لتسيير وتدبير الشؤون البيداغوجية : إدارة الطلبة، الأساتذة، الوحدات، جداول الامتحانات، النقط والتقارير'
                                : 'Une plateforme complète pour la gestion pédagogique : étudiants, professeurs, modules, examens, notes et rapports'}
                        </p>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
               ESPACES / LOGIN CARDS
            ════════════════════════════════════════════════ */}
            <section className="relative -mt-8 z-10">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Admin */}
                        <Link
                            href={route('login')}
                            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/40"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                            <div className="flex items-start gap-5">
                                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
                                    <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.25.25 0 01-.248 0l-.657-.38c-.523-.3-.71-.96-.463-1.51.4-.892.732-1.822.985-2.784m0-9.18c.253-.962.584-1.892.985-2.783.247-.55.06-1.21-.463-1.511l-.657-.38a.25.25 0 00-.248 0l-.657.38c-.523.3-.71.96-.463 1.51.4.892.732 1.822.985 2.783M12 6.75v12" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800">{isAr ? 'الإدارة' : 'Administration'}</h3>
                                    <p className="mt-1 text-xs sm:text-sm text-slate-400">{isAr ? 'إدارة الأساتذة، الطلبة، الوحدات، الامتحانات والنقط' : 'Gérer les professeurs, étudiants, modules, examens et notes'}</p>
                                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all">
                                        {isAr ? 'دخول' : 'Se connecter'}
                                        <svg className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Professeur */}
                        <Link
                            href={route('prof.login')}
                            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 hover:border-violet-400/40"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-violet-500"></div>
                            <div className="flex items-start gap-5">
                                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-20">
                                    <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800">{isAr ? 'فضاء الأستاذ' : 'Espace professeur'}</h3>
                                    <p className="mt-1 text-xs sm:text-sm text-slate-400">{isAr ? 'الاطلاع على الوحدات المسندة، إدخال النقط ومتابعة الطلبة' : 'Consulter vos modules, saisir les notes et suivre vos étudiants'}</p>
                                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 group-hover:gap-2.5 transition-all">
                                        {isAr ? 'دخول' : 'Se connecter'}
                                        <svg className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
               QUICK LINKS GRID
            ════════════════════════════════════════════════ */}
            <section className="py-16">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
                        {[
                            { icon: '🎓', label: isAr ? 'التسجيل' : 'Inscription', desc: isAr ? 'التسجيل بسلك الإجازة' : 'Inscription en Licence' },
                            { icon: '📝', label: isAr ? 'الامتحانات' : 'Examens', desc: isAr ? 'جداول ونتائج الامتحانات' : 'Calendriers et résultats' },
                            { icon: '📚', label: isAr ? 'المكتبة' : 'Bibliothèque', desc: isAr ? 'الموارد الرقمية' : 'Ressources numériques' },
                            { icon: '📅', label: isAr ? 'الجدول الزمني' : 'Emploi du temps', desc: isAr ? 'جداول الحصص' : 'Horaires des cours' },
                        ].map((item, i) => (
                            <a key={i} href="#" className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all group">
                                <span className="text-2xl sm:text-3xl">{item.icon}</span>
                                <span className="mt-2 text-sm font-bold text-slate-700 group-hover:text-primary transition">{item.label}</span>
                                <span className="mt-0.5 text-[11px] text-slate-400 text-center">{item.desc}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
               FORMATIONS SECTION
            ════════════════════════════════════════════════ */}
            <section className="py-14 bg-slate-50 border-t border-slate-100">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-bold text-slate-800">{isAr ? 'التكوينات' : 'Formations'}</h3>
                        <p className="mt-1.5 text-sm text-slate-400">{isAr ? 'مسالك التكوين المتاحة بكلية الشريعة بفاس' : 'Filères proposées à la Faculté de Chariaa — Fès'}</p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-3">
                        {[
                            { title: isAr ? 'سلك الإجازة' : 'Licence', items: [isAr ? 'الشريعة والقانون' : 'Droit et sciences islamiques', isAr ? 'القضاء والقانون' : 'Justice et droit', isAr ? 'الدراسات الإسلامية' : 'Études islamiques'], color: 'border-l-primary' },
                            { title: isAr ? 'سلك الماستر' : 'Master', items: [isAr ? 'قضاء الأسرة' : 'Justice familiale', isAr ? 'مهن العمل الاجتماعي' : 'Métiers du travail social', isAr ? 'العلوم الشرعية' : 'Sciences juridiques'], color: 'border-l-violet-500' },
                            { title: isAr ? 'سلك الدكتوراه' : 'Doctorat', items: [isAr ? 'الشريعة والقانون' : 'Droit et sciences islamiques', isAr ? 'الدراسات الإسلامية' : 'Études islamiques'], color: 'border-l-emerald-500' },
                        ].map((cycle, i) => (
                            <div key={i} className={`rounded-2xl bg-white border border-slate-200 p-6 shadow-sm border-l-4 ${cycle.color}`}>
                                <h4 className="text-lg font-bold text-slate-800">{cycle.title}</h4>
                                <ul className="mt-3 space-y-2">
                                    {cycle.items.map((item, j) => (
                                        <li key={j} className="text-sm text-slate-500 flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
               ANNOUNCEMENTS
            ════════════════════════════════════════════════ */}
            <section className="py-14">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{isAr ? 'آخر الإعلانات' : 'Dernières annonces'}</h3>
                            <p className="text-sm text-slate-400 mt-0.5">{isAr ? 'أحدث المستجدات بالكلية' : 'Les actualités de la faculté'}</p>
                        </div>
                        <a href="#" className="text-sm text-primary hover:underline font-medium">{isAr ? 'عرض الكل' : 'Voir tout'}</a>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {announcements.map((item, i) => (
                            <a key={i} href="#" className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.25.25 0 01-.248 0l-.657-.38c-.523-.3-.71-.96-.463-1.51.4-.892.732-1.822.985-2.784m0-9.18c.253-.962.584-1.892.985-2.783.247-.55.06-1.21-.463-1.511l-.657-.38a.25.25 0 00-.248 0l-.657.38c-.523.3-.71.96-.463 1.51.4.892.732 1.822.985 2.783M12 6.75v12" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium">{item.cat}</span>
                                        <span>{item.date}</span>
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-slate-700 group-hover:text-primary transition line-clamp-2">{item.title}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
               FOOTER
            ════════════════════════════════════════════════ */}
            <footer className="bg-[#1a3a5c] text-white">
                <div className="mx-auto max-w-6xl px-4 py-10">
                    <div className="grid gap-8 sm:grid-cols-3">
                        <div>
                            <h5 className="text-sm font-bold mb-3">{isAr ? 'كلية الشريعة بفاس' : 'Faculté de Chariaa — Fès'}</h5>
                            <p className="text-xs text-white/60 leading-relaxed">
                                {isAr
                                    ? 'كلية الشريعة بفاس إحدى مؤسسات جامعة سيدي محمد بن عبد الله، المتخصصة في العلوم الشرعية والقانونية.'
                                    : 'La Faculté de Chariaa de Fès est l\'un des établissements de l\'Université Sidi Mohamed Ben Abdellah, spécialisée dans les sciences juridiques et islamiques.'}
                            </p>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold mb-3">{isAr ? 'روابط سريعة' : 'Liens rapides'}</h5>
                            <ul className="space-y-1.5 text-xs text-white/60">
                                {[
                                    { label: isAr ? 'جامعة سيدي محمد بن عبد الله' : 'Université USMBA', href: 'https://usmba.ac.ma' },
                                    { label: isAr ? 'الموقع الرسمي للكلية' : 'Site officiel de la faculté', href: 'https://chariaa.usmba.ac.ma' },
                                    { label: isAr ? 'الخدمات الرقمية' : 'Services numériques', href: '#' },
                                ].map((link, i) => (
                                    <li key={i}>
                                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">{link.label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold mb-3">{isAr ? 'اتصل بنا' : 'Contact'}</h5>
                            <ul className="space-y-1.5 text-xs text-white/60">
                                <li>{isAr ? 'بفاس، المغرب' : 'Fès, Maroc'}</li>
                                <li>📧 contact@chariaa.usmba.ac.ma</li>
                                <li>📞 0535... / 0535...</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10 py-4">
                    <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
                        <p>&copy; {new Date().getFullYear()} {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}</p>
                        <p>{isAr ? 'تصميم وتطوير : Prof Space Chariaa' : 'Design & développement : Prof Space Chariaa'}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function Home({ auth }) {
    return (
        <LanguageProvider defaultLocale="ar">
            <Head title="كلية الشريعة بفاس - مساحة الأساتذة" />
            {auth?.user ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <p className="text-slate-400">{'أنت متصل بالفعل'}</p>
                        <Link href={route('dashboard')} className="mt-4 inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
                            {'الذهاب إلى لوحة التحكم ←'}
                        </Link>
                    </div>
                </div>
            ) : (
                <HomeContent />
            )}
        </LanguageProvider>
    );
}
