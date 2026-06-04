import { useEffect, useState } from 'react';

/**
 * Persists grid/list view mode preference in localStorage.
 * @param {string} key   - unique storage key per page, e.g. 'professors_view'
 * @param {'grid'|'list'} defaultMode
 */
export function useViewMode(key, defaultMode = 'grid') {
    const [viewMode, setViewModeState] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored === 'grid' || stored === 'list' ? stored : defaultMode;
        } catch {
            return defaultMode;
        }
    });

    const setViewMode = (mode) => {
        setViewModeState(mode);
        try { localStorage.setItem(key, mode); } catch { /* ignore */ }
    };

    return [viewMode, setViewMode];
}
