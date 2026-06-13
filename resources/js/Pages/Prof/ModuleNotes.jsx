import { useState, useCallback, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import ProfLayout from '@/Layouts/ProfLayout';

const Icon = ({ d, className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const I = {
    student:    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    check:      'M5 13l4 4L19 7',
    close:      'M6 18L18 6M6 6l12 12',
    save:       'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4',
    template:   'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    nexam:      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
};

function computeDecision(note) {
    if (note === null || note === undefined || note === '') return null;
    const v = parseFloat(note);
    if (isNaN(v)) return null;
    return v > 10;
}

function Toast({ message, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg"
            style={{ backgroundColor: type === 'success' ? '#059669' : '#dc2626' }}
        >
            <Icon d={type === 'success' ? I.check : I.close} className="w-4 h-4 shrink-0" />
            {message}
            <button onClick={onClose} className="opacity-70 hover:opacity-100">
                <Icon d={I.close} className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

function ModuleNotesContent({ module, students }) {
    const { locale, isRTL } = useLanguage();
    const { auth } = usePage().props;

    const [notesData, setNotesData] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const getNoteField = (statut) => statut === 'rattrapage' ? 'note_rattrapage' : statut === 'finale' ? 'note_finale' : 'note_normale';

    useEffect(() => {
        const notes = {};
        students.forEach(s => {
            const field = getNoteField(s.statut);
            notes[s.etud_mod_id] = {
                [field]: s[field] ?? '',
                _original: s[field] ?? '',
            };
        });
        setNotesData({ ...notes });
    }, [students]);

    const handleNoteChange = (etudModId, field, value) => {
        setNotesData(prev => ({
            ...prev,
            [etudModId]: { ...prev[etudModId], [field]: value },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const notes = [];
            students.forEach(s => {
                const d = notesData[s.etud_mod_id];
                if (!d) return;
                const field = getNoteField(s.statut);
                const val = d[field];
                if (val === '' || val === null || val === undefined) return;
                notes.push({
                    etud_mod_id: s.etud_mod_id,
                    Nexam: s.nexam ?? 1,
                    [field]: parseFloat(val),
                });
            });

            if (notes.length === 0) { setSaving(false); return; }

            await window.axios.post(`/prof/modules/${module.id}/notes`, { notes });

            // Update originals
            const updated = { ...notesData };
            students.forEach(s => {
                const d = updated[s.etud_mod_id];
                if (!d) return;
                const field = getNoteField(s.statut);
                d._original = d[field];
            });
            setNotesData(updated);

            setToast({ message: locale === 'ar' ? 'تم حفظ النقاط بنجاح' : 'Notes enregistrées avec succès', type: 'success' });
        } catch {
            setToast({ message: locale === 'ar' ? 'خطأ في الحفظ' : 'Erreur de sauvegarde', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const getNoteVal = (etudModId, field) => {
        return notesData[etudModId]?.[field] ?? '';
    };

    const getDecision = (etudModId, statut) => {
        const field = getNoteField(statut);
        const note = getNoteVal(etudModId, field);
        const passed = computeDecision(note);
        if (passed === null) return null;
        if (isRTL) return passed ? 'مستوفي' : 'غير مستوفي';
        return passed ? 'Validé' : 'Non validé';
    };

    const isDirty = () => {
        return students.some(s => {
            const d = notesData[s.etud_mod_id];
            if (!d) return false;
            const field = getNoteField(s.statut);
            return String(d._original ?? '') !== String(d[field] ?? '');
        });
    };

    const statutLabel = (statut) => {
        if (isRTL) return statut === 'normale' ? 'عادي' : statut === 'rattrapage' ? 'استدراك' : 'نهائي';
        return statut === 'normale' ? 'Normale' : statut === 'rattrapage' ? 'Rattrapage' : 'Finale';
    };

    const moduleName = isRTL ? (module.nom_ar || module.nom_fr) : (module.nom_fr || module.nom_ar);

    return (
        <>
            <Head title={moduleName} />

            <ProfLayout wide>
                <div className="space-y-6">

                    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 text-white shadow-lg shadow-primary/20 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div>
                                <p className="text-sm font-medium text-white/70">{module.code_module}</p>
                                <h2 className="mt-1 text-2xl font-bold">{moduleName}</h2>
                                <p className="mt-1 text-sm text-white/70">
                                    {students.length} {locale === 'ar' ? 'طالب مسجل' : 'étudiant(s) inscrit(s)'}
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                                <Icon d={I.student} className="w-4 h-4" />
                                {students.length}
                            </span>
                        </div>
                        <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
                        <div className="pointer-events-none absolute -bottom-10 -right-4 h-40 w-40 rounded-full bg-white/5" />
                    </div>

                    {students.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-600 dark:bg-slate-800">
                            <Icon d={I.template} className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                            <p className="mt-3 text-sm font-medium text-slate-400">
                                {locale === 'ar' ? 'لا يوجد طلاب مسجلون في هذا الوحدة' : 'Aucun étudiant inscrit dans ce module'}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                                <th className={`px-5 py-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>#</th>
                                                <th className={`px-5 py-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    {locale === 'ar' ? 'الطالب' : 'Étudiant'}
                                                </th>
                                                <th className="px-5 py-3 font-medium text-left">CNE</th>
                                                <th className="px-5 py-3 font-medium text-center">
                                                    {locale === 'ar' ? 'الحالة' : 'Statut'}
                                                </th>
                                                <th className="px-5 py-3 font-medium text-center">
                                                    {locale === 'ar' ? 'النقطة' : 'Note'}
                                                </th>
                                                <th className="px-5 py-3 font-medium text-center">
                                                    {locale === 'ar' ? 'القرار' : 'Décision'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((s, i) => {
                                                const sname = isRTL ? `${s.nom_ar} ${s.prenom_ar}` : `${s.nom_fr} ${s.prenom_fr}`;
                                                const field = getNoteField(s.statut);
                                                const noteVal = getNoteVal(s.etud_mod_id, field);
                                                const decision = getDecision(s.etud_mod_id, s.statut);
                                                const passed = computeDecision(noteVal);

                                                return (
                                                    <tr key={s.etud_mod_id} className="border-b border-slate-50 text-slate-600 transition hover:bg-slate-50/50 dark:border-slate-700/30 dark:text-slate-300 dark:hover:bg-slate-700/20">
                                                        <td className="px-5 py-2.5 text-slate-400">{i + 1}</td>
                                                        <td className={`px-5 py-2.5 text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                                            {sname}
                                                        </td>
                                                        <td className="px-5 py-2.5 font-mono text-xs">{s.CNE}</td>
                                                        <td className="px-5 py-2.5 text-center">
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                                s.statut === 'normale' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                s.statut === 'rattrapage' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                                            }`}>
                                                                {statutLabel(s.statut)}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-2.5 text-center">
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                min="0"
                                                                max="20"
                                                                value={noteVal}
                                                                onChange={(e) => handleNoteChange(s.etud_mod_id, field, e.target.value)}
                                                                className={`w-16 rounded-md border px-2 py-1 text-center text-xs font-medium transition-all focus:ring-2 focus:ring-primary/30 ${
                                                                    noteVal > 10
                                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                                        : noteVal !== ''
                                                                        ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                                                                        : 'border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                                                                }`}
                                                            />
                                                        </td>
                                                        <td className="px-5 py-2.5 text-center">
                                                            {decision ? (
                                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                                                    passed
                                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300'
                                                                }`}>
                                                                    <Icon d={passed ? I.check : I.close} className="w-3 h-3" />
                                                                    {decision}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-300 dark:text-slate-600">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-3 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                                {isDirty() && (
                                    <p className="text-xs text-amber-500 font-medium">
                                        {locale === 'ar' ? 'تغييرات غير محفوظة' : 'Modifications non sauvegardées'}
                                    </p>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary/90 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:from-primary/90 hover:to-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            {locale === 'ar' ? 'جارٍ الحفظ...' : 'Sauvegarde...'}
                                        </>
                                    ) : (
                                        <>
                                            <Icon d={I.save} className="w-3.5 h-3.5" />
                                            {locale === 'ar' ? 'حفظ النقاط' : 'Enregistrer les notes'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </ProfLayout>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}

export default function ModuleNotes(props) {
    return (
        <LanguageProvider defaultLocale="ar">
            <ModuleNotesContent {...props} />
        </LanguageProvider>
    );
}
