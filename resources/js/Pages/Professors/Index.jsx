import AdminLayout from '@/Layouts/AdminLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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
    prof:       'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    plus:       'M12 4v16m8-8H4',
    search:     'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    edit:       'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    close:      'M6 18L18 6M6 6l12 12',
    check:      'M5 13l4 4L19 7',
    chevLeft:   'M15 19l-7-7 7-7',
    chevRight:  'M9 5l7 7-7 7',
    chevDown:   'M19 9l-7 7-7-7',
    empty:      'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    phone:      'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    id:         'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
    modules:    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    filter:     'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    star:       'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    warn:       'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    user:       'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
};

// ─── Grade colour map ─────────────────────────────────────────────────────────
const GRADE_META = {
    'PES':                { pill: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
    'PA':                 { pill: 'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300'    },
    'PH':                 { pill: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
    'Docteur':            { pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    'Professeur Habilité':{ pill: 'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300'  },
};
const defaultGradePill = 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300';
const gradePill = (g) => GRADE_META[g]?.pill ?? defaultGradePill;

// ─── Avatar ───────────────────────────────────────────────────────────────────
function ProfAvatar({ prof, size = 'md' }) {
    const sz = size === 'xl' ? 'h-20 w-20 text-2xl' : size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
    const user = prof?.user;
    const initial = (user?.prenom_fr?.[0] ?? user?.nom_fr?.[0] ?? '?').toUpperCase();
    const src = user?.avatar_url;
    return src
        ? <img src={src} alt="avatar" className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800`} />
        : <div className={`${sz} rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white dark:ring-slate-800`}>{initial}</div>;
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ id, label, value, onChange, required, error, placeholder, hint, dir, type = 'text' }) {
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <input id={id} type={type} value={value ?? ''} onChange={onChange}
                placeholder={placeholder} dir={dir}
                className={`block w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition
                    focus:outline-none focus:ring-2 dark:text-white dark:placeholder-slate-500
                    ${error
                        ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:bg-red-900/10 dark:border-red-600'
                        : 'border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800'
                    }`}
            />
            {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
            {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                    <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Select field ─────────────────────────────────────────────────────────────
function SelectField({ id, label, value, onChange, required, error, hint, children }) {
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="ms-0.5 text-red-400">*</span>}
            </label>
            <div className="relative">
                <select id={id} value={value ?? ''} onChange={onChange}
                    className={`block w-full appearance-none rounded-xl border px-4 py-2.5 pe-9 text-sm shadow-sm transition
                        focus:outline-none focus:ring-2 dark:text-white
                        ${error
                            ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:bg-red-900/10 dark:border-red-600'
                            : 'border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800'
                        }`}>
                    {children}
                </select>
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-slate-400">
                    <Icon d={ICONS.chevDown} className="h-4 w-4" />
                </span>
            </div>
            {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
            {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                    <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Section divider ──────────────────────────────────────────────────────────
function SectionDivider({ emoji, label }) {
    return (
        <div className="flex items-center gap-2.5 py-1">
            <span className="text-base leading-none">{emoji}</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
            <div className="flex-1 border-t border-slate-100 dark:border-slate-700/60" />
        </div>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon, color }) {
    const colors = {
        indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-900/20',  icon: 'text-indigo-600 dark:text-indigo-400',  ring: 'bg-indigo-100 dark:bg-indigo-900/40'  },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20',icon: 'text-emerald-600 dark:text-emerald-400',ring: 'bg-emerald-100 dark:bg-emerald-900/40' },
        rose:    { bg: 'bg-rose-50 dark:bg-rose-900/20',      icon: 'text-rose-600 dark:text-rose-400',      ring: 'bg-rose-100 dark:bg-rose-900/40'      },
        violet:  { bg: 'bg-violet-50 dark:bg-violet-900/20',  icon: 'text-violet-600 dark:text-violet-400',  ring: 'bg-violet-100 dark:bg-violet-900/40'  },
    };
    const c = colors[color] ?? colors.indigo;
    return (
        <div className={`flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 ${c.bg} px-5 py-4`}>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.ring}`}>
                <Icon d={icon} className={`h-5 w-5 ${c.icon}`} />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{value ?? 0}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ flash, t }) {
    const [visible, setVisible] = useState(false);
    const msg   = flash?.success || flash?.error;
    const isErr = !!flash?.error;
    const map   = {
        prof_created: t('profCreated'),
        prof_updated: t('profUpdated'),
        prof_deleted: t('profDeleted'),
    };
    useEffect(() => {
        if (msg) { setVisible(true); const id = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(id); }
    }, [msg, flash]);
    if (!visible || !msg) return null;
    return (
        <div className={`fixed bottom-6 end-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium
            ${isErr ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <Icon d={isErr ? ICONS.close : ICONS.check} className="h-4 w-4 shrink-0" />
            {map[msg] ?? msg}
        </div>
    );
}

// ─── Professor modal (create / edit) ─────────────────────────────────────────
function ProfessorModal({ mode, prof, availableUsers, onClose, t, isRTL, locale }) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        user_id:   prof?.user_id   ?? '',
        cin:       prof?.cin       ?? '',
        telephone: prof?.telephone ?? '',
        grade:     prof?.grade     ?? '',
    });

    const GRADE_SUGGESTIONS = [
        'PES', 'PA', 'PH', 'Docteur', 'Professeur Habilité', 'Maître de conférences',
    ];

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('professors.update', prof.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('professors.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };

    // For edit: the linked user info
    const linkedUser = isEdit ? prof?.user : null;
    const linkedUserLabel = linkedUser
        ? (isRTL
            ? `${linkedUser.prenom_ar ?? linkedUser.prenom_fr ?? ''} ${linkedUser.nom_ar ?? linkedUser.nom_fr ?? ''}`.trim()
            : `${linkedUser.prenom_fr ?? ''} ${linkedUser.nom_fr ?? ''}`.trim())
        : '';

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div
                className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isEdit ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                            <Icon
                                d={isEdit ? ICONS.edit : ICONS.prof}
                                className={`h-5 w-5 ${isEdit ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                            />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                {isEdit ? t('editProfessor') : t('addProfessor')}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isEdit
                                    ? (locale === 'ar' ? 'تعديل بيانات الأستاذ' : 'Modifier les informations du professeur')
                                    : (locale === 'ar' ? 'ربط مستخدم بفيش أستاذ' : 'Associer un compte utilisateur à un professeur')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition">
                        <Icon d={ICONS.close} className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                        {/* Linked user */}
                        <div className="space-y-3">
                            <SectionDivider emoji="👤" label={locale === 'ar' ? 'الحساب المرتبط' : 'Compte utilisateur'} />

                            {isEdit ? (
                                /* In edit mode — show who is linked (read-only visual) */
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                                    <ProfAvatar prof={prof} size="sm" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{linkedUserLabel}</p>
                                        <p className="text-xs text-slate-400 truncate">{linkedUser?.email}</p>
                                    </div>
                                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                        {locale === 'ar' ? 'مرتبط' : 'Lié'}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <SelectField
                                        id="user_id" label={t('selectUser')} value={data.user_id}
                                        onChange={e => setData('user_id', e.target.value)}
                                        required error={errors.user_id}
                                        hint={availableUsers.length === 0 ? t('noUsersAvailable') : undefined}
                                    >
                                        <option value="">{locale === 'ar' ? '— اختر مستخدماً —' : '— Choisir un utilisateur —'}</option>
                                        {availableUsers.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {isRTL
                                                    ? `${u.prenom_ar ?? u.prenom_fr ?? ''} ${u.nom_ar ?? u.nom_fr ?? ''} — ${u.email}`.trim()
                                                    : `${u.prenom_fr ?? ''} ${u.nom_fr ?? ''} — ${u.email}`.trim()
                                                }
                                            </option>
                                        ))}
                                    </SelectField>
                                    {availableUsers.length === 0 && (
                                        <p className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                                            <Icon d={ICONS.warn} className="h-4 w-4 shrink-0" />
                                            {locale === 'ar'
                                                ? 'جميع المستخدمين من نوع "أستاذ" مرتبطون بالفعل. أضف مستخدماً جديداً برتبة أستاذ أولاً.'
                                                : 'Tous les utilisateurs "prof" ont déjà une fiche. Créez d\'abord un utilisateur avec le rôle "prof".'}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Prof-specific details */}
                        <div className="space-y-4">
                            <SectionDivider emoji="🎓" label={locale === 'ar' ? 'بيانات الأستاذ' : 'Informations académiques'} />

                            {/* Grade with quick-pick buttons */}
                            <div className="space-y-1.5">
                                <Field
                                    id="grade" label={t('profGrade')} value={data.grade}
                                    onChange={e => setData('grade', e.target.value)}
                                    placeholder={locale === 'ar' ? 'أستاذ مؤهل، دكتور…' : 'PES, Docteur, PH…'}
                                    hint={t('profGradeHint')} error={errors.grade}
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {GRADE_SUGGESTIONS.map(g => (
                                        <button key={g} type="button"
                                            onClick={() => setData('grade', g)}
                                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition
                                                ${data.grade === g
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300'
                                                }`}>
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-4">
                            <SectionDivider emoji="📋" label={locale === 'ar' ? 'معلومات الاتصال' : 'Coordonnées'} />
                            <Field
                                id="cin" label={t('cin')} value={data.cin}
                                onChange={e => setData('cin', e.target.value)}
                                placeholder="A123456" hint={t('cinHint')} error={errors.cin}
                            />
                            <Field
                                id="telephone" label={t('telephone')} value={data.telephone}
                                onChange={e => setData('telephone', e.target.value)}
                                placeholder="+212 6XX XXXXXX" hint={t('telephoneHint')} error={errors.telephone}
                                type="tel"
                            />
                        </div>

                    </div>

                    {/* Footer */}
                    <div className={`flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={processing}
                            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60
                                ${isEdit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                            {processing
                                ? <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>{locale === 'ar' ? 'جاري الحفظ…' : 'Enregistrement…'}</>
                                : <><Icon d={ICONS.check} className="h-4 w-4" />{t('save')}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────
function DeleteModal({ prof, onClose, onConfirm, processing, t, isRTL, locale }) {
    const name = prof?.user
        ? (isRTL
            ? `${prof.user.prenom_ar ?? prof.user.prenom_fr ?? ''} ${prof.user.nom_ar ?? prof.user.nom_fr ?? ''}`.trim()
            : `${prof.user.prenom_fr ?? ''} ${prof.user.nom_fr ?? ''}`.trim())
        : '—';
    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-red-50 dark:bg-red-900/20">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                            <Icon d={ICONS.trash} className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">{t('confirmDeleteProfessor')}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]">{name}</p>
                        </div>
                    </div>
                    {/* Body */}
                    <div className="px-6 py-5">
                        <p className="text-sm text-slate-600 dark:text-slate-300">{t('confirmDeleteProfessorMsg')}</p>
                    </div>
                    {/* Footer */}
                    <div className={`flex gap-3 border-t border-slate-100 dark:border-slate-800 px-6 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button onClick={onClose}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                            {t('cancel')}
                        </button>
                        <button onClick={onConfirm} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition">
                            {processing
                                ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                : <Icon d={ICONS.trash} className="h-4 w-4" />
                            }
                            {t('delete')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ meta, t, isRTL }) {
    if (!meta || meta.last_page <= 1) return null;
    const { current_page, last_page, from, to, total, links } = meta;
    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700`}>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('showing')} <span className="font-semibold text-slate-700 dark:text-slate-200">{from}–{to}</span> {t('of')} <span className="font-semibold">{total}</span> {t('results')}
            </p>
            <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                    disabled={current_page === 1}
                    onClick={() => router.get(links.find(l => l.label.includes('Previous') || l.label.includes('«'))?.url ?? '#')}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                    <Icon d={isRTL ? ICONS.chevRight : ICONS.chevLeft} className="h-3.5 w-3.5" />
                    {t('prev')}
                </button>

                {/* Pages */}
                {links.filter(l => !l.label.includes('Previous') && !l.label.includes('Next') && !l.label.includes('«') && !l.label.includes('»')).map((link, i) => (
                    <button key={i}
                        disabled={!link.url}
                        onClick={() => link.url && router.get(link.url)}
                        className={`min-w-[2rem] rounded-lg border px-2.5 py-1.5 text-xs font-medium transition
                            ${link.active
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40'
                            }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}

                {/* Next */}
                <button
                    disabled={current_page === last_page}
                    onClick={() => router.get(links.find(l => l.label.includes('Next') || l.label.includes('»'))?.url ?? '#')}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                    {t('next')}
                    <Icon d={isRTL ? ICONS.chevLeft : ICONS.chevRight} className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

// ─── Professor card (grid view) ───────────────────────────────────────────────
function ProfCard({ prof, displayName, locale, isRTL, t, onEdit, onDelete }) {
    const isActive = prof.user?.is_active !== false;
    return (
        <div className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">

            {/* ── Cover — rounded top corners only, own overflow-hidden ── */}
            <div className="relative h-16 rounded-t-2xl overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex-shrink-0">
                <div className="absolute inset-0 opacity-[0.15]"
                    style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                {/* Status pill — top right */}
                <span className={`absolute top-2 end-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-white/30
                    ${isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/80 text-white'}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {isActive ? t('active') : t('inactive')}
                </span>
            </div>

            {/* ── Avatar (centered, overlapping cover) — z-10 so it sits above ── */}
            <div className="relative z-10 flex justify-center -mt-10">
                <div className="ring-[3px] ring-white dark:ring-slate-800 rounded-full shadow-md">
                    <ProfAvatar prof={prof} size="xl" />
                </div>
            </div>

            {/* ── Identity ── */}
            <div className="mt-3 px-4 pb-0 text-center space-y-1">
                <p className="font-bold text-slate-800 dark:text-white text-sm leading-snug line-clamp-1">
                    {displayName(prof)}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                    {prof.user?.email ?? '—'}
                </p>
                {prof.grade
                    ? <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${gradePill(prof.grade)}`}>
                        {prof.grade}
                      </span>
                    : <span className="inline-flex h-5" />
                }
            </div>

            {/* ── Stats row ── */}
            <div className="mx-4 mt-3 mb-4 grid grid-cols-2 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/30 overflow-hidden">
                <div className="flex flex-col items-center py-3 px-2 border-e border-slate-100 dark:border-slate-700/60">
                    <span className={`text-lg font-extrabold leading-none tabular-nums
                        ${prof.modules_count > 0 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-300 dark:text-slate-600'}`}>
                        {prof.modules_count ?? 0}
                    </span>
                    <span className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        {t('modules')}
                    </span>
                </div>
                <div className="flex flex-col items-center py-3 px-2">
                    {prof.cin
                        ? <>
                            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 leading-none font-mono tracking-widest line-clamp-1 max-w-full px-1">{prof.cin}</span>
                            <span className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t('cin')}</span>
                          </>
                        : <>
                            <span className="text-lg font-extrabold text-slate-200 dark:text-slate-700 leading-none">—</span>
                            <span className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t('cin')}</span>
                          </>
                    }
                </div>
            </div>

            {/* ── Footer actions ── */}
            <div className="mt-auto grid grid-cols-3 border-t border-slate-100 dark:border-slate-700/60 rounded-b-2xl overflow-hidden">
                {/* View */}
                <a href={route('professors.show', prof.id)}
                    title={locale === 'ar' ? 'عرض الملف' : 'Voir la fiche'}
                    className="flex flex-col items-center justify-center gap-1 py-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition border-e border-slate-100 dark:border-slate-700/60">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[9px] font-semibold uppercase tracking-wide">{locale === 'ar' ? 'عرض' : 'Voir'}</span>
                </a>
                {/* Edit */}
                <button onClick={onEdit}
                    title={t('edit')}
                    className="flex flex-col items-center justify-center gap-1 py-3 text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition border-e border-slate-100 dark:border-slate-700/60">
                    <Icon d={ICONS.edit} className="h-4 w-4" />
                    <span className="text-[9px] font-semibold uppercase tracking-wide">{t('edit')}</span>
                </button>
                {/* Delete */}
                <button onClick={onDelete}
                    title={t('delete')}
                    className="flex flex-col items-center justify-center gap-1 py-3 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition">
                    <Icon d={ICONS.trash} className="h-4 w-4" />
                    <span className="text-[9px] font-semibold uppercase tracking-wide">{t('delete')}</span>
                </button>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function ProfessorsPage() {
    const { t, locale, isRTL } = useLanguage();
    const { profs, grades, availableUsers, filters, stats, flash } = usePage().props;

    // UI state
    const [modal, setModal]           = useState(null);   // null | { type: 'create' | 'edit' | 'delete', prof }
    const [search, setSearch]         = useState(filters?.search ?? '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade ?? '');
    const [deleting, setDeleting]     = useState(false);
    const [viewMode, setViewMode]     = useViewMode('professors_view', 'list');
    const searchRef  = useRef(null);
    const isMounted  = useRef(false);

    // Debounced search — skip the very first render to avoid a spurious request on load
    useEffect(() => {
        if (!isMounted.current) { isMounted.current = true; return; }
        const timer = setTimeout(() => {
            router.get(route('professors.index'), { search, grade: gradeFilter }, {
                preserveState: true, replace: true, preserveScroll: true,
            });
        }, 350);
        return () => clearTimeout(timer);
    }, [search, gradeFilter]);

    const openCreate = () => setModal({ type: 'create', prof: null });
    const openEdit   = (prof) => setModal({ type: 'edit', prof });
    const openDelete = (prof) => setModal({ type: 'delete', prof });
    const closeModal = () => setModal(null);

    const handleDelete = () => {
        if (!modal?.prof) return;
        setDeleting(true);
        router.delete(route('professors.destroy', modal.prof.id), {
            onSuccess: () => { setDeleting(false); closeModal(); },
            onError:   () => setDeleting(false),
        });
    };

    const profList = profs?.data ?? [];
    const hasFilters = search || gradeFilter;

    // Helper: display name
    const displayName = (prof) => {
        if (!prof.user) return '—';
        return isRTL
            ? `${prof.user.prenom_ar ?? prof.user.prenom_fr ?? ''} ${prof.user.nom_ar ?? prof.user.nom_fr ?? ''}`.trim() || prof.user.email
            : `${prof.user.prenom_fr ?? ''} ${prof.user.nom_fr ?? ''}`.trim() || prof.user.email;
    };

    return (
        <>
            <Head title={t('professorsManagement')} />
            <Toast flash={flash} t={t} />

            {/* ── Header ── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('professorsManagement')}</h1>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {locale === 'ar'
                            ? `${stats?.total ?? 0} أستاذ مسجّل في المنظومة`
                            : `${stats?.total ?? 0} professeur${(stats?.total ?? 0) !== 1 ? 's' : ''} enregistré${(stats?.total ?? 0) !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
                    <Icon d={ICONS.plus} className="h-4 w-4" />
                    {t('addProfessor')}
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard value={stats?.total}       label={t('totalProfessorsStat')}   icon={ICONS.prof}    color="indigo"  />
                <StatCard value={stats?.active}      label={t('activeProfessors')}      icon={ICONS.check}   color="emerald" />
                <StatCard value={stats?.inactive}    label={t('inactiveProfessors')}    icon={ICONS.close}   color="rose"    />
                <StatCard value={stats?.withModules} label={t('professorsWithModules')} icon={ICONS.modules} color="violet"  />
            </div>

            {/* ── Search & filter bar ── */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-slate-400">
                        <Icon d={ICONS.search} className="h-4 w-4" />
                    </span>
                    <input
                        ref={searchRef}
                        type="search" value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('searchProfessors')}
                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 ps-10 pe-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition"
                    />
                </div>

                {/* Grade filter */}
                <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400">
                        <Icon d={ICONS.filter} className="h-4 w-4" />
                    </span>
                    <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
                        className="block appearance-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 ps-9 pe-9 text-sm text-slate-700 dark:text-white shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition min-w-[160px]">
                        <option value="">{t('allGrades')}</option>
                        {(grades ?? []).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-slate-400">
                        <Icon d={ICONS.chevDown} className="h-4 w-4" />
                    </span>
                </div>

                {/* Clear filters badge */}
                {hasFilters && (
                    <button onClick={() => { setSearch(''); setGradeFilter(''); }}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition whitespace-nowrap">
                        <Icon d={ICONS.close} className="h-3.5 w-3.5" />
                        {locale === 'ar' ? 'مسح الفلاتر' : 'Effacer les filtres'}
                    </button>
                )}

                {/* ── View toggle ── */}
                <div className="flex overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    {['grid', 'list'].map(v => (
                        <button key={v} onClick={() => setViewMode(v)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition
                                ${v === 'list' ? 'border-s border-slate-200 dark:border-slate-700' : ''}
                                ${viewMode === v
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
                            {v === 'grid'
                                ? <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                : <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                            }
                            <span className="hidden sm:inline">{v === 'grid' ? (locale === 'ar' ? 'شبكي' : 'Grille') : (locale === 'ar' ? 'قائمة' : 'Liste')}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            {profList.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                        <Icon d={ICONS.empty} className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{t('noProfessors')}</p>
                    <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                        {hasFilters
                            ? (locale === 'ar' ? 'جرّب تغيير معايير البحث' : 'Essayez de modifier vos critères de recherche')
                            : (locale === 'ar' ? 'ابدأ بإضافة أستاذ جديد' : 'Commencez par ajouter un premier professeur')}
                    </p>
                    {!hasFilters && (
                        <button onClick={openCreate}
                            className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                            <Icon d={ICONS.plus} className="h-4 w-4" />
                            {t('addProfessor')}
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* ── Grid view ── */
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {profList.map(prof => (
                            <ProfCard key={prof.id} prof={prof}
                                displayName={displayName} locale={locale} isRTL={isRTL} t={t}
                                onEdit={() => openEdit(prof)} onDelete={() => openDelete(prof)} />
                        ))}
                    </div>
                    <div className="mt-4">
                        <Pagination meta={profs} t={t} isRTL={isRTL} />
                    </div>
                </>
            ) : (
                /* ── List / Table view ── */
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
                                    <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('name')}</th>
                                    <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('email')}</th>
                                    <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('profGrade')}</th>
                                    <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('cin')}</th>
                                    <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('modules')}</th>
                                    <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('status')}</th>
                                    <th className="px-5 py-3.5 text-end text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                {profList.map(prof => {
                                    const isActive = prof.user?.is_active !== false;
                                    return (
                                        <tr key={prof.id}
                                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                                            {/* Name + avatar */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <ProfAvatar prof={prof} size="md" />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 dark:text-white truncate">
                                                            {displayName(prof)}
                                                        </p>
                                                        {prof.user && (isRTL
                                                            ? (prof.user.nom_fr || prof.user.prenom_fr) && <p className="text-xs text-slate-400 truncate">{prof.user.prenom_fr} {prof.user.nom_fr}</p>
                                                            : (prof.user.nom_ar || prof.user.prenom_ar) && <p className="text-xs text-slate-400 truncate">{prof.user.prenom_ar} {prof.user.nom_ar}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Email */}
                                            <td className="px-5 py-4">
                                                <span className="text-slate-600 dark:text-slate-300 text-sm truncate block max-w-[200px]">
                                                    {prof.user?.email ?? '—'}
                                                </span>
                                            </td>
                                            {/* Grade */}
                                            <td className="px-5 py-4">
                                                {prof.grade
                                                    ? <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${gradePill(prof.grade)}`}>{prof.grade}</span>
                                                    : <span className="text-slate-400 text-xs italic">—</span>
                                                }
                                            </td>
                                            {/* CIN */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-sm">
                                                    {prof.cin
                                                        ? <><Icon d={ICONS.id} className="h-3.5 w-3.5 text-slate-400 shrink-0" />{prof.cin}</>
                                                        : <span className="text-slate-400 italic text-xs">—</span>
                                                    }
                                                </div>
                                            </td>
                                            {/* Modules count */}
                                            <td className="px-5 py-4">
                                                <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
                                                    ${prof.modules_count > 0
                                                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'
                                                    }`}>
                                                    <Icon d={ICONS.modules} className="h-3 w-3" />
                                                    {prof.modules_count} {t('modulesCount')}
                                                </div>
                                            </td>
                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
                                                    ${isActive
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {isActive ? t('active') : t('inactive')}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                    <a href={route('professors.show', prof.id)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition"
                                                        title={locale === 'ar' ? 'عرض الملف' : 'Voir la fiche'}>
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </a>
                                                    <button onClick={() => openEdit(prof)}
                                                        title={t('edit')}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition">
                                                        <Icon d={ICONS.edit} className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => openDelete(prof)}
                                                        title={t('delete')}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition">
                                                        <Icon d={ICONS.trash} className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-5 pb-5">
                        <Pagination meta={profs} t={t} isRTL={isRTL} />
                    </div>
                </div>
            )}

            {/* ── Modals ── */}
            {modal?.type === 'create' && (
                <ProfessorModal
                    mode="create" prof={null}
                    availableUsers={availableUsers ?? []}
                    onClose={closeModal} t={t} isRTL={isRTL} locale={locale}
                />
            )}
            {modal?.type === 'edit' && (
                <ProfessorModal
                    mode="edit" prof={modal.prof}
                    availableUsers={availableUsers ?? []}
                    onClose={closeModal} t={t} isRTL={isRTL} locale={locale}
                />
            )}
            {modal?.type === 'delete' && (
                <DeleteModal
                    prof={modal.prof}
                    onClose={closeModal}
                    onConfirm={handleDelete}
                    processing={deleting}
                    t={t} isRTL={isRTL} locale={locale}
                />
            )}
        </>
    );
}

// ─── Export with language provider ───────────────────────────────────────────
export default function Professors(props) {
    return (
        <LanguageProvider>
            <AdminLayout title={<InnerTitle />}>
                <ProfessorsPage {...props} />
            </AdminLayout>
        </LanguageProvider>
    );
}

function InnerTitle() {
    const { t } = useLanguage();
    return <>{t('professors')}</>;
}
