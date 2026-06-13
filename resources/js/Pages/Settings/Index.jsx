import { useState, useEffect, useRef } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useLanguage } from '@/i18n/LanguageContext';

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const IC = {
    check:    'M5 13l4 4L19 7',
    warning:  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    upload:   'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
    pencil:   'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    globe:    'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    mail:     'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    phone:    'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    tool:     'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    image:    'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    camera:   'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
    shield:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
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
                <Icon d={ok ? IC.check : IC.warning} className="w-3.5 h-3.5" />
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
                <Icon d={icon} className="w-4 h-4" />
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
            {error && <p className="flex items-center gap-1 text-[11px] text-red-500"><Icon d={IC.warning} className="w-3 h-3" />{error}</p>}
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
                            <Icon d={icon} className={`w-4 h-4 ${iconColor}`} />
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
                ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                : <Icon d={IC.check} className="w-4 h-4" />}
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
                            <Icon d={IC.upload} className="w-4 h-4 text-slate-400" />
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
                    <Icon d={IC.warning} className="w-3 h-3" />
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
export default function SettingsIndex({ settings }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;

    return (
        <AdminLayout title={t('settings')}>
            <Head title={t('settings')} />
            <Toast message={flash?.success} type="success" />
            <Toast message={flash?.error}   type="error" />

            <div className="space-y-5 pb-8">

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
                        <svg className="h-16 w-16 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                        </svg>
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
                    <Icon d={IC.pencil} className="w-3.5 h-3.5" />
                    {editing ? 'Fermer' : 'Modifier'}
                </button>
            </div>

            {/* ── Favicon: outside overflow-hidden banner, overlapping via negative margin ── */}
            <div className="flex justify-center -mt-7 relative z-20">
                <div className="h-14 w-14 rounded-xl border-4 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-700 shadow-lg overflow-hidden flex items-center justify-center">
                    {settings.app_favicon_url ? (
                        <img src={settings.app_favicon_url} alt="Icon" className="h-full w-full object-contain p-1" />
                    ) : (
                        <Icon d={IC.image} className="w-6 h-6 text-slate-300 dark:text-slate-500" />
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
                        <Input value={data.app_name} onChange={e => setData('app_name', e.target.value)} placeholder="ProfSpace" />
                    </Field>
                    <Field label={t('settingsAppNameAr')} error={errors.app_name_ar} required>
                        <Input dir="rtl" value={data.app_name_ar} onChange={e => setData('app_name_ar', e.target.value)} placeholder="فضاء الأستاذ" />
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
                        <Input value={data.institution_name} onChange={e => setData('institution_name', e.target.value)} placeholder="Université Mohammed V..." />
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
                        <Icon d={IC.warning} className="w-4 h-4 text-amber-600 dark:text-amber-400" />
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
                                <Icon d={IC.shield} className="w-4 h-4 text-red-600 dark:text-red-400" />
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
