import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [locale, setLocale] = useState(() => {
        return localStorage.getItem('locale') || 'fr';
    });

    const isRTL = locale === 'ar';

    useEffect(() => {
        localStorage.setItem('locale', locale);
        document.documentElement.setAttribute('lang', locale);
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    }, [locale, isRTL]);

    const t = (key) => {
        return translations[locale]?.[key] ?? translations['fr'][key] ?? key;
    };

    const toggleLocale = () => {
        setLocale((prev) => (prev === 'fr' ? 'ar' : 'fr'));
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
    return ctx;
}
