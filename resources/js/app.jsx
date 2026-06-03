import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from '@/i18n/LanguageContext';

createInertiaApp({
    // Title uses the live app name from the database (shared via appSettings)
    title: (title) => {
        const settings = window.__inertia_initial_page__?.props?.appSettings;
        const appName = settings?.app_name ?? import.meta.env.VITE_APP_NAME ?? 'ProfSpace';
        return title ? `${title} – ${appName}` : appName;
    },
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        // Make initial page available for the title resolver above
        window.__inertia_initial_page__ = props;

        const root = createRoot(el);
        root.render(
            <LanguageProvider>
                <App {...props} />
            </LanguageProvider>
        );
    },
    progress: {
        color: '#6366f1',
    },
});
