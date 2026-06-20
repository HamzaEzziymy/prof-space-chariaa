import { useState, useEffect, useRef } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import {
    ArrowPathIcon,
    ArrowUpTrayIcon,
    BuildingOffice2Icon,
    CameraIcon,
    CheckIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    MapPinIcon,
    PencilIcon,
    PhotoIcon,
    PhoneIcon,
    ShieldCheckIcon,
    WrenchScrewdriverIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/Layouts/AdminLayout';
import { useLanguage } from '@/i18n/LanguageContext';

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = ({ icon: IconComponent, className = 'w-5 h-5' }) => (
    <IconComponent className={className} aria-hidden="true" />
);

const IC = {
    check: CheckIcon,
    warning: ExclamationTriangleIcon,
    upload: ArrowUpTrayIcon,
    pencil: PencilIcon,
    globe: GlobeAltIcon,
    building: BuildingOffice2Icon,
    mail: EnvelopeIcon,
    phone: PhoneIcon,
    location: MapPinIcon,
    tool: WrenchScrewdriverIcon,
    image: PhotoIcon,
    camera: CameraIcon,
    shield: ShieldCheckIcon,
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success' }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        if (!message) return;
        setShow(true);
        const t = setTimeout(() => setShow(false), 4000);
        return () => clearTimeout(t);
    }, [message]);
    if (!message || !show) return null;
    const ok = type === 'success';
    return (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium text-white shadow-2xl ${ok ? 'bg-emerald-600' : 'bg-red-500'}`}>
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <Icon icon={ok ? IC.check : IC.warning} className="w-3.5 h-3.5" />
            </span>
            {message}
        </div>
    );
}

// ─── Field ────────────────────────────────────────────────────────────────────
const inputCls = 'w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20 transition';

function Input({ icon, className = '', ...props }) {
    if (!icon) return <input className={`${inputCls} ${className}`} {...props} />;
    return (
        <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon icon={icon} className="w-4 h-4" />
            </span>
            <input className={`${inputCls} pl-10 ${className}`} {...props} />
        </div>
    );
}

function Textarea({ className = '', ...props }) {
    return <textarea rows={3} className={`${inputCls} resize-none ${className}`} {...props} />;
}

function Field({ label, hint, error, required, children }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {label}{required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {hint  && <p className="text-[11px] text-slate-400 leading-relaxed">{hint}</p>}
            {error && <p className="flex items-center gap-1 text-[11px] text-red-500"><Icon icon={IC.warning} className="w-3 h-3" />{error}</p>}
        </div>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ title, description, icon, iconColor = 'text-indigo-500', iconBg = 'bg-indigo-50 dark:bg-indigo-500/10', children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden ${className}`}>
            {title && (
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/60">
                    {icon && (
                        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                            <Icon icon={icon} className={`w-4 h-4 ${iconColor}`} />
                        </span>
                    )}
                    <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
                        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
                    </div>
                </div>
            )}
            <div className="p-5">{children}</div>
        </div>
    );
}

// ─── Save Button ──────────────────────────────────────────────────────────────
function SaveBtn({ processing, label, variant = 'primary' }) {
    const base = 'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 transition-all duration-150 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed';
    const styles = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 focus:ring-red-500/40'
        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 focus:ring-indigo-500/40';
    return (
        <button type="submit" disabled={processing} className={`${base} ${styles}`}>
            {processing
                ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
                : <Icon icon={IC.check} className="w-4 h-4" />}
            {label}
        </button>
    );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description }) {
    return (
        <div className="flex items-start justify-between gap-6">
            <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
                {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>
            <button type="button" role="switch" aria-checked={checked} onClick={onChange}
                className={`relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}

// ─── Upload Panel (shown when "Modifier" is clicked) ─────────────────────────
function UploadPanel({ routeName, fieldName, dimensionLabel, hint, accept, onClose, t }) {
    const { data, setData, post, processing, errors, reset } = useForm({ [fieldName]: null });
    const [preview, setPreview] = useState(null);
    const [drag, setDrag]       = useState(false);
    const ref = useRef(null);

    const pick = (file) => {
        if (!file) return;
        setData(fieldName, file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route(routeName), {
            forceFormData: true,
            onSuccess: () => { reset(); setPreview(null); },
        });
    };

    return (
        <form onSubmit={submit} className="mt-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 p-4 space-y-3">
            {/* drop zone */}
            <div
                onClick={() => ref.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
                className={[
                    'relative cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed h-20 transition-all duration-150',
                    drag
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                        : preview
                            ? 'border-indigo-300 dark:border-indigo-600'
                            : 'border-slate-300 dark:border-slate-500 hover:border-indigo-300 hover:bg-white dark:hover:bg-slate-700',
                ].join(' ')}
            >
                {preview ? (
                    <img src={preview} alt="" className="h-full w-full object-contain rounded-xl p-2" />
                ) : (
                    <div className="flex items-center gap-2 select-none">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-600 shadow-sm">
                            <Icon icon={IC.upload} className="w-4 h-4 text-slate-400" />
                        </span>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Glisser ou cliquer</p>
                            <p className="text-[10px] text-slate-400">{dimensionLabel}</p>
                        </div>
                    </div>
                )}
                <input ref={ref} type="file" className="hidden" accept={accept} onChange={(e) => pick(e.target.files[0])} />
            </div>

            {hint && <p className="text-[11px] text-slate-400">{hint}</p>}

            {errors[fieldName] && (
                <p className="flex items-center gap-1 text-[11px] text-red-500">
                    <Icon icon={IC.warning} className="w-3 h-3" />
                    {errors[fieldName]}
                </p>
            )}

            <div className="flex items-center gap-2">
                {data[fieldName] && <SaveBtn processing={processing} label={t('save')} />}
                <button type="button" onClick={onClose}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
                    Annuler
                </button>
            </div>
        </form>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// Page
// ═════════════════════════════════════════════════════════════════════════════
export default function SettingsIndex({ settings, newUser = false }) {
    const { t, locale } = useLanguage();
    const { flash } = usePage().props;

    return (
        <AdminLayout title={t('settings')}>
            <Head title={t('settings')} />
            <Toast message={flash?.success} type="success" />
            <Toast message={flash?.error}   type="error" />

            <div className="space-y-5 pb-8">

                {/* ══ WELCOME BANNER FOR NEW USER ══════════════════════════ */}
                {newUser && (
                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/30 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                                {/* Animated Icon */}
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 animate-pulse">
                                        <CheckIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                                        {locale === 'ar' ? '🎉 أهلاً وسهلاً!' : '🎉 Bienvenue!'}
                                    </h2>
                                    <p className="text-sm sm:text-base text-emerald-800 dark:text-emerald-200 mb-4 leading-relaxed">
                                        {locale === 'ar' 
                                            ? 'تم إنشاء حسابك الأول بنجاح! أنت الآن مسؤول النظام. يمكنك البدء بتكوين النظام من خلال الإعدادات أدناه.'
                                            : 'Votre premier compte a été créé avec succès! Vous êtes maintenant l\'administrateur principal. Vous pouvez commencer à configurer le système via les paramètres ci-dessous.'
                                        }
                                    </p>

                                    {/* Quick Action Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-3 rounded-lg bg-white/60 dark:bg-slate-800/40 p-3 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/20">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex-shrink-0">
                                                <Icon icon={IC.building} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </span>
                                            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {locale === 'ar' ? 'تعريف مؤسستك' : 'Identifier votre établissement'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 rounded-lg bg-white/60 dark:bg-slate-800/40 p-3 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/20">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex-shrink-0">
                                                <Icon icon={IC.image} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </span>
                                            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {locale === 'ar' ? 'إضافة شعار العلامة التجارية' : 'Ajouter votre logo'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 rounded-lg bg-white/60 dark:bg-slate-800/40 p-3 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/20">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex-shrink-0">
                                                <Icon icon={IC.globe} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </span>
                                            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {locale === 'ar' ? 'معلومات الاتصال' : 'Infos de contact'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 rounded-lg bg-white/60 dark:bg-slate-800/40 p-3 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/20">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex-shrink-0">
                                                <Icon icon={IC.tool} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </span>
                                            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {locale === 'ar' ? 'تخصيص النظام' : 'Personnaliser'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-1 flex-shrink-0 text-emerald-400 hover:text-emerald-600 dark:text-emerald-500 dark:hover:text-emerald-400 transition"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ HERO: logo + icon ══════════════════════════════════════ */}
                <BrandHeroCard settings={settings} t={t} />

                {/* ══ APP IDENTITY ══════════════════════════════════════════ */}
                <IdentityCard settings={settings} t={t} />

                {/* ══ INSTITUTION & CONTACT ════════════════════════════════ */}
                <ContactCard settings={settings} t={t} />

                {/* ══ MAINTENANCE — danger zone at bottom ══════════════════ */}
                <MaintenanceCard settings={settings} t={t} />

            </div>
        </AdminLayout>
    );
}

// ─── Brand Hero Card ──────────────────────────────────────────────────────────
function BrandHeroCard({ settings, t }) {
    const [editing, setEditing] = useState(false);

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">

            {/* ── Banner: logo contained, bg adapts to dark/light mode ── */}
            <div className="relative h-36 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    {settings.app_logo_url ? (
                        <img src={settings.app_logo_url} alt="Logo" className="h-full w-full object-contain p-4" />
                    ) : (
                        <PhotoIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                    )}
                </div>

                {/* "Modifier" button */}
                <button
                    type="button"
                    onClick={() => setEditing(v => !v)}
                    className={[
                        'absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white transition',
                        editing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-black/40 hover:bg-black/60',
                    ].join(' ')}
                >
                    <Icon icon={IC.pencil} className="w-3.5 h-3.5" />
                    {editing ? 'Fermer' : 'Modifier'}
                </button>
            </div>

            {/* ── Favicon: outside overflow-hidden banner, overlapping via negative margin ── */}
            <div className="flex justify-center -mt-7 relative z-20">
                <div className="h-14 w-14 rounded-xl border-4 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-700 shadow-lg overflow-hidden flex items-center justify-center">
                    {settings.app_favicon_url ? (
                        <img src={settings.app_favicon_url} alt="Icon" className="h-full w-full object-contain p-1" />
                    ) : (
                        <Icon icon={IC.image} className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                    )}
                </div>
            </div>

            {/* ── Body ── */}
            <div className="pt-4 pb-5 px-5 space-y-4">

                {/* Combined edit panel — both logo + favicon */}
                {editing && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30 p-4 space-y-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Modifier les images
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Logo upload */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('settingsLogo')}</p>
                                    <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded">
                                        1360 × 314 px
                                    </span>
                                </div>
                                <UploadPanel
                                    routeName="settings.logo"
                                    fieldName="logo"
                                    dimensionLabel="1360 × 314 px"
                                    hint={t('settingsLogoHint')}
                                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                    onClose={() => setEditing(false)}
                                    t={t}
                                />
                            </div>

                            {/* Favicon upload */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('settingsFavicon')}</p>
                                    <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded">
                                        512 × 512 px
                                    </span>
                                </div>
                                <UploadPanel
                                    routeName="settings.favicon"
                                    fieldName="favicon"
                                    dimensionLabel="512 × 512 px"
                                    hint={t('settingsFaviconHint')}
                                    accept="image/png,image/x-icon,image/jpeg"
                                    onClose={() => setEditing(false)}
                                    t={t}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Status row */}
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${settings.app_logo_url ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {settings.app_logo_url ? 'Logo configuré' : 'Aucun logo'}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${settings.app_favicon_url ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {settings.app_favicon_url ? 'Icône configurée' : 'Aucune icône'}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Identity Card ────────────────────────────────────────────────────────────
function IdentityCard({ settings, t }) {
    const { data, setData, post, processing, errors } = useForm({
        app_name:       settings.app_name       ?? '',
        app_name_ar:    settings.app_name_ar    ?? '',
        app_tagline:    settings.app_tagline    ?? '',
        app_tagline_ar: settings.app_tagline_ar ?? '',
    });

    return (
        <Card
            icon={IC.globe}
            title="Identité de l'application"
            description="Nom et sous-titre affichés dans l'interface"
        >
            <form onSubmit={(e) => { e.preventDefault(); post(route('settings.general')); }} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label={t('settingsAppName')} error={errors.app_name} required>
                        <Input value={data.app_name} onChange={e => setData('app_name', e.target.value)} placeholder="ex: Nom de l'application" />
                    </Field>
                    <Field label={t('settingsAppNameAr')} error={errors.app_name_ar} required>
                        <Input dir="rtl" value={data.app_name_ar} onChange={e => setData('app_name_ar', e.target.value)} placeholder="ex: اسم التطبيق" />
                    </Field>
                    <Field label={t('settingsTagline')} error={errors.app_tagline}>
                        <Input value={data.app_tagline} onChange={e => setData('app_tagline', e.target.value)} placeholder="Gestion académique" />
                    </Field>
                    <Field label={t('settingsTaglineAr')} error={errors.app_tagline_ar}>
                        <Input dir="rtl" value={data.app_tagline_ar} onChange={e => setData('app_tagline_ar', e.target.value)} placeholder="الإدارة الأكاديمية" />
                    </Field>
                </div>
                <div className="flex justify-end pt-1">
                    <SaveBtn processing={processing} label={t('save')} />
                </div>
            </form>
        </Card>
    );
}

// ─── Contact Card ─────────────────────────────────────────────────────────────
function ContactCard({ settings, t }) {
    const { data, setData, post, processing, errors } = useForm({
        app_name:            settings.app_name            ?? '',
        app_name_ar:         settings.app_name_ar         ?? '',
        app_tagline:         settings.app_tagline         ?? '',
        app_tagline_ar:      settings.app_tagline_ar      ?? '',
        contact_email:       settings.contact_email       ?? '',
        contact_phone:       settings.contact_phone       ?? '',
        institution_name:    settings.institution_name    ?? '',
        institution_address: settings.institution_address ?? '',
    });

    return (
        <Card
            icon={IC.building}
            title="Établissement & Contact"
            description="Coordonnées de votre institution"
        >
            <form onSubmit={(e) => { e.preventDefault(); post(route('settings.general')); }} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label={t('settingsInstitution')} error={errors.institution_name}>
                        <Input value={data.institution_name} onChange={e => setData('institution_name', e.target.value)} placeholder="ex: Nom de l'établissement" />
                    </Field>
                    <Field label={t('settingsContactEmail')} error={errors.contact_email}>
                        <Input type="email" icon={IC.mail} value={data.contact_email} onChange={e => setData('contact_email', e.target.value)} placeholder="contact@universite.ma" />
                    </Field>
                    <Field label={t('settingsContactPhone')} error={errors.contact_phone}>
                        <Input icon={IC.phone} value={data.contact_phone} onChange={e => setData('contact_phone', e.target.value)} placeholder="+212 5..." />
                    </Field>
                    <Field label={t('settingsAddress')} error={errors.institution_address}>
                        <Input icon={IC.location} value={data.institution_address} onChange={e => setData('institution_address', e.target.value)} placeholder="Adresse complète" />
                    </Field>
                </div>
                <div className="flex justify-end pt-1">
                    <SaveBtn processing={processing} label={t('save')} />
                </div>
            </form>
        </Card>
    );
}

// ─── Maintenance Card (danger zone) ──────────────────────────────────────────
function MaintenanceCard({ settings, t }) {
    const { data, setData, post, processing } = useForm({
        maintenance_mode:       settings.maintenance_mode       ?? false,
        maintenance_message:    settings.maintenance_message    ?? '',
        maintenance_message_ar: settings.maintenance_message_ar ?? '',
    });

    return (
        <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-700/40 bg-amber-50/50 dark:bg-amber-900/10 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-amber-200/60 dark:border-amber-700/30 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                        <Icon icon={IC.warning} className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t('settingsMaintenance')}</p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-500 mt-0.5">Zone sensible — affecte l'accès utilisateur</p>
                    </div>
                </div>
                {/* Live status pill */}
                <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    data.maintenance_mode
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${data.maintenance_mode ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {data.maintenance_mode ? t('settingsMaintenanceActive') : t('settingsMaintenanceInactive')}
                </span>
            </div>

            <div className="p-5 space-y-5">
                <form onSubmit={(e) => { e.preventDefault(); post(route('settings.maintenance')); }} className="space-y-5">

                    {/* Toggle */}
                    <Toggle
                        checked={data.maintenance_mode}
                        onChange={() => setData('maintenance_mode', !data.maintenance_mode)}
                        label={t('settingsMaintenanceMode')}
                        description={t('settingsMaintenanceWarning')}
                    />

                    {/* Warning alert when active */}
                    {data.maintenance_mode && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-700/30 dark:bg-red-900/20 px-4 py-3.5">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40 mt-0.5">
                                <Icon icon={IC.shield} className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </span>
                            <div>
                                <p className="text-xs font-semibold text-red-700 dark:text-red-400">Mode maintenance actif</p>
                                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5 leading-relaxed">
                                    L'application est inaccessible pour tous les utilisateurs non-administrateurs.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label={t('settingsMaintenanceMsg')}>
                            <Textarea
                                value={data.maintenance_message}
                                onChange={e => setData('maintenance_message', e.target.value)}
                                placeholder="Maintenance en cours. Revenez bientôt."
                                className="bg-white dark:bg-slate-800"
                            />
                        </Field>
                        <Field label={t('settingsMaintenanceMsgAr')}>
                            <Textarea
                                dir="rtl"
                                value={data.maintenance_message_ar}
                                onChange={e => setData('maintenance_message_ar', e.target.value)}
                                placeholder="الموقع تحت الصيانة."
                                className="bg-white dark:bg-slate-800"
                            />
                        </Field>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-amber-700/20">
                        <p className="text-xs text-amber-700/70 dark:text-amber-500">
                            {data.maintenance_mode
                                ? '⚠️ Actuellement en maintenance'
                                : 'Application accessible normalement'}
                        </p>
                        <SaveBtn processing={processing} label={t('save')} variant={data.maintenance_mode ? 'danger' : 'primary'} />
                    </div>
                </form>
            </div>
        </div>
    );
}
