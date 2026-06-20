import { useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { AcademicCapIcon, ShieldCheckIcon, UsersIcon, BookOpenIcon, ClipboardDocumentListIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

function HomeContent() {
    const { locale, toggleLocale, isRTL } = useLanguage();
    const { appSettings } = usePage().props;
    const isAr = locale === 'ar';
    const logoUrl = appSettings?.app_logo_url;
    const iconUrl = appSettings?.app_favicon_url;

    const arrowRotate = (isSecond) => (isRTL ? !isSecond : isSecond) ? 'rotate-180' : '';

    return (
        <>
            <Head title={isAr ? 'كلية الشريعة بفاس - المنصة البيداغوجية' : 'Faculté de Chariaa — Plateforme pédagogique'} />
            <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>

                <div className="bg-slate-900 text-white text-[11px]">
                    <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-9">
                        <div className="flex items-center gap-2 rtl:flex-row-reverse">
                            <span className="text-base">🇲🇦</span>
                            <span className="font-medium">{isAr ? 'المملكة المغربية' : 'Royaume du Maroc'}</span>
                            <span className="opacity-30 mx-1">|</span>
                            <span className="opacity-70 hidden sm:inline">{isAr ? 'وزارة التعليم العالي' : 'Ministère de l\'Enseignement Supérieur'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={toggleLocale} className="flex items-center gap-1.5 hover:underline opacity-70 hover:opacity-100 transition flex-shrink-0">
                                <span>{isAr ? 'Français' : 'العربية'}</span>
                                <span className="text-xs">{isAr ? '🇫🇷' : '🇲🇦'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <header className="bg-white border-b border-slate-200 shadow-sm">
                    <div className="mx-auto max-w-6xl px-4">
                        <div className="flex items-center py-4">
                            <div className={`shrink-0 flex items-center ${isAr ? 'mr-auto' : ''}`}>
                                {logoUrl
                                    ? <img src={logoUrl} alt="" className="h-20 w-auto max-w-[380px] object-contain" />
                                    : iconUrl
                                        ? <img src={iconUrl} alt="" className="h-20 w-auto max-w-[380px] object-contain" />
                                        : <span className="text-lg font-extrabold text-indigo-600">FSH</span>
                                }
                            </div>
                            {!isAr && <div className="mr-auto" />}
                        </div>
                    </div>
                </header>

                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url('/storage/images/zllij-bg.png')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-800/50 via-indigo-900/40 to-slate-900/50" />

                    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white/70 border border-white/10 mb-5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {isAr ? 'منصة التسيير البيداغوجي الرقمية' : 'Plateforme de gestion pédagogique'}
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                                {isAr ? (
                                    <>مساحة <span className="text-indigo-300">الأساتذة</span> والإدارة</>
                                ) : (
                                    <>Espace <span className="text-indigo-300">Professeurs</span> & Administration</>
                                )}
                            </h2>
                            <p className="mt-3 text-sm text-white/50 max-w-xl mx-auto">
                                {isAr
                                    ? 'منصة متكاملة لتسيير وتدبير الشؤون البيداغوجية : إدارة الطلبة، الأساتذة، الوحدات، النقط والتقارير'
                                    : 'Plateforme complète pour la gestion pédagogique : étudiants, professeurs, modules, notes et rapports'}
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                            <button type="button" onClick={() => router.visit(route('login'))}
                                className="group relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-7 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 hover:bg-white w-full text-left rtl:text-right">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                <div className={`flex items-start gap-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200">
                                        <ShieldCheckIcon className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-slate-800">{isAr ? 'الإدارة' : 'Administration'}</h3>
                                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                            {isAr ? 'إدارة الأساتذة، الطلبة، الوحدات، الامتحانات والنقط' : 'Gérer les professeurs, étudiants, modules, examens et notes'}
                                        </p>
                                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 group-hover:gap-2.5 transition-all">
                                            {isAr ? 'دخول' : 'Se connecter'}
                                            <svg className={`h-3.5 w-3.5 ${arrowRotate(false)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button type="button" onClick={() => router.visit(route('prof.login'))}
                                className="group relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-7 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 hover:bg-white w-full text-left rtl:text-right">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                <div className={`flex items-start gap-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-200">
                                        <AcademicCapIcon className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-slate-800">{isAr ? 'فضاء الأستاذ' : 'Espace professeur'}</h3>
                                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                            {isAr ? 'الاطلاع على الوحدات المسندة، إدخال النقط ومتابعة الطلبة' : 'Consulter vos modules, saisir les notes et suivre vos étudiants'}
                                        </p>
                                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-violet-600 group-hover:gap-2.5 transition-all">
                                            {isAr ? 'دخول' : 'Se connecter'}
                                            <svg className={`h-3.5 w-3.5 ${arrowRotate(true)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden py-20 bg-gradient-to-b from-slate-50 to-white">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative mx-auto max-w-6xl px-4">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{isAr ? 'مزايا المنصة' : 'Fonctionnalités'}</h3>
                            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                                {isAr ? 'كل ما تحتاجه لتسيير الشؤون البيداغوجية في مكان واحد' : 'Tout ce qu\'il vous faut pour la gestion pédagogique en un seul endroit'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-3xl mx-auto">
                            {[
                                { Icon: UsersIcon,      label: isAr ? 'الطلبة' : 'Étudiants',     desc: isAr ? 'تسجيل، بحث، تصفية' : 'Inscription, recherche, filtres',     color: 'indigo' },
                                { Icon: BookOpenIcon,    label: isAr ? 'الوحدات' : 'Modules',      desc: isAr ? 'برامج، معاملات، أساتذة' : 'Programmes, coefficients, profs',  color: 'emerald' },
                                { Icon: ClipboardDocumentListIcon, label: isAr ? 'النقط' : 'Notes', desc: isAr ? 'إدخال، تصحيح، تقارير' : 'Saisie, correction, rapports',       color: 'amber' },
                                { Icon: CalendarDaysIcon, label: isAr ? 'الامتحانات' : 'Examens',  desc: isAr ? 'تسجيلات ونتائج' : 'Inscriptions et résultats',               color: 'rose' },
                            ].map(({ Icon, label, desc, color }, i) => {
                                const colors = {
                                    indigo:  { bg: 'bg-indigo-50 group-hover:bg-indigo-600',  txt: 'text-indigo-600 group-hover:text-white',  ring: 'ring-indigo-200/50' },
                                    emerald: { bg: 'bg-emerald-50 group-hover:bg-emerald-600', txt: 'text-emerald-600 group-hover:text-white', ring: 'ring-emerald-200/50' },
                                    amber:   { bg: 'bg-amber-50 group-hover:bg-amber-600',     txt: 'text-amber-600 group-hover:text-white',   ring: 'ring-amber-200/50' },
                                    rose:    { bg: 'bg-rose-50 group-hover:bg-rose-600',       txt: 'text-rose-600 group-hover:text-white',    ring: 'ring-rose-200/50' },
                                };
                                const c = colors[color];

                                return (
                                    <div key={i}
                                        className="group relative flex flex-col items-center rounded-2xl bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 ring-1 ring-slate-100 hover:ring-transparent">
                                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${c.bg} ${c.txt} shadow-sm group-hover:shadow-lg group-hover:shadow-${color}-200/50 mb-4`}>
                                            <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 mb-1">{label}</span>
                                        <span className="text-[11px] text-slate-400 leading-relaxed">{desc}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <footer className="bg-slate-900 text-white">
                    <div className="mx-auto max-w-6xl px-4 py-10">
                        <div className="grid gap-6 sm:grid-cols-3">
                            <div>
                                <h5 className="text-sm font-bold mb-2">{isAr ? 'كلية الشريعة بفاس' : 'Faculté de Chariaa — Fès'}</h5>
                                <p className="text-xs text-white/50 leading-relaxed">
                                    {isAr
                                        ? 'كلية الشريعة بفاس إحدى مؤسسات جامعة سيدي محمد بن عبد الله، المتخصصة في العلوم الشرعية والقانونية.'
                                        : 'La Faculté de Chariaa de Fès est un établissement de l\'Université Sidi Mohamed Ben Abdellah.'}
                                </p>
                            </div>
                            <div>
                                <h5 className="text-sm font-bold mb-2">{isAr ? 'روابط سريعة' : 'Liens rapides'}</h5>
                                <ul className="space-y-1 text-xs text-white/50">
                                    <li><a href="https://usmba.ac.ma" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">{isAr ? 'جامعة سيدي محمد بن عبد الله' : 'Université USMBA'}</a></li>
                                    <li><a href="https://chariaa.usmba.ac.ma" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">{isAr ? 'الموقع الرسمي للكلية' : 'Site officiel de la faculté'}</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-sm font-bold mb-2">{isAr ? 'اتصل بنا' : 'Contact'}</h5>
                                <ul className="space-y-1 text-xs text-white/50">
                                    <li>{isAr ? 'بفاس، المغرب' : 'Fès, Maroc'}</li>
                                    <li>contact@chariaa.usmba.ac.ma</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 py-4">
                        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/70">
                            <p>&copy; {new Date().getFullYear()} {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}</p>
                            <p>{isAr ? 'تصميم وتطوير : Prof Space Chariaa' : 'Design & développement : Prof Space Chariaa'}</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default function Home({ auth }) {
    useEffect(() => {
        if (auth?.user) {
            router.visit(route('dashboard'), { replace: true });
        }
    }, []);

    return (
        <LanguageProvider defaultLocale="ar">
            {auth?.user ? null : <HomeContent />}
        </LanguageProvider>
    );
}
