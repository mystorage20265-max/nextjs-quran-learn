// Shared utility for tracking recently visited surahs
// Storage key used across the app
export const RECENT_SURAHS_KEY = 'recentSurahs';
export const MAX_RECENT = 3;

export interface RecentSurah {
    num: number;
    name: string;
    ar: string;
    v: number;       // verses count
    timestamp: number; // Unix ms
}

/** Read the current list from localStorage (safe — returns [] on error). */
export function getRecentSurahs(): RecentSurah[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(RECENT_SURAHS_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as RecentSurah[];
    } catch {
        return [];
    }
}

/**
 * Record a surah visit:
 *  - Removes any existing entry for this surah
 *  - Prepends the new entry (most recent first)
 *  - Trims to MAX_RECENT
 *  - Saves to localStorage
 *  - Dispatches a custom 'recentSurahsUpdated' event so GlobalSidebar
 *    can update instantly within the same tab.
 */
export function trackSurahVisit(surah: Omit<RecentSurah, 'timestamp'>): void {
    if (typeof window === 'undefined') return;
    const prev = getRecentSurahs().filter(s => s.num !== surah.num);
    const next: RecentSurah[] = [
        { ...surah, timestamp: Date.now() },
        ...prev,
    ].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SURAHS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('recentSurahsUpdated'));
}

/**
 * Clear all recently-visited surahs.
 * Dispatches both the custom event (same tab) and a StorageEvent polyfill
 * so every open tab picks up the change instantly.
 */
export function clearRecentSurahs(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(RECENT_SURAHS_KEY);
    // Same-tab update
    window.dispatchEvent(new Event('recentSurahsUpdated'));
    // Cross-tab update: manually fire a storage event so other tabs react
    window.dispatchEvent(new StorageEvent('storage', {
        key: RECENT_SURAHS_KEY,
        oldValue: null,
        newValue: null,
        storageArea: localStorage,
    }));
}
