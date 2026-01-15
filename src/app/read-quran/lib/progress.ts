// Read Quran - Progress & Last Read Tracking
// Stores reading progress and last position in localStorage

const STORAGE_KEYS = {
    LAST_READ: 'quran-last-read',
    PROGRESS: 'quran-reading-progress',
};

// ============ LAST READ POSITION ============

export interface LastReadPosition {
    surahId: number;
    surahName: string;
    verseNumber: number;
    timestamp: number;
}

/**
 * Save the user's last read position
 */
export function saveLastRead(surahId: number, surahName: string, verseNumber: number): void {
    if (typeof window === 'undefined') return;

    const position: LastReadPosition = {
        surahId,
        surahName,
        verseNumber,
        timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(position));
}

/**
 * Get the user's last read position
 */
export function getLastRead(): LastReadPosition | null {
    if (typeof window === 'undefined') return null;

    try {
        const saved = localStorage.getItem(STORAGE_KEYS.LAST_READ);
        if (!saved) return null;
        return JSON.parse(saved) as LastReadPosition;
    } catch {
        return null;
    }
}

/**
 * Clear the last read position
 */
export function clearLastRead(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.LAST_READ);
}

// ============ READING PROGRESS ============

export interface ReadingProgress {
    readVerses: string[]; // Array of verse keys like "2:142"
    totalRead: number;
    lastUpdated: number;
}

const TOTAL_VERSES = 6236; // Total verses in the Quran

/**
 * Mark a verse as read
 */
export function markVerseRead(verseKey: string): void {
    if (typeof window === 'undefined') return;

    const progress = getProgress();

    if (!progress.readVerses.includes(verseKey)) {
        progress.readVerses.push(verseKey);
        progress.totalRead = progress.readVerses.length;
        progress.lastUpdated = Date.now();

        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    }
}

/**
 * Mark multiple verses as read (for efficiency)
 */
export function markVersesRead(verseKeys: string[]): void {
    if (typeof window === 'undefined') return;

    const progress = getProgress();
    let changed = false;

    verseKeys.forEach(verseKey => {
        if (!progress.readVerses.includes(verseKey)) {
            progress.readVerses.push(verseKey);
            changed = true;
        }
    });

    if (changed) {
        progress.totalRead = progress.readVerses.length;
        progress.lastUpdated = Date.now();
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    }
}

/**
 * Get reading progress
 */
export function getProgress(): ReadingProgress {
    if (typeof window === 'undefined') {
        return { readVerses: [], totalRead: 0, lastUpdated: 0 };
    }

    try {
        const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        if (!saved) {
            return { readVerses: [], totalRead: 0, lastUpdated: 0 };
        }
        return JSON.parse(saved) as ReadingProgress;
    } catch {
        return { readVerses: [], totalRead: 0, lastUpdated: 0 };
    }
}

/**
 * Get reading progress percentage
 */
export function getProgressPercentage(): number {
    const progress = getProgress();
    return Math.round((progress.totalRead / TOTAL_VERSES) * 100 * 10) / 10; // 1 decimal place
}

/**
 * Check if a verse has been read
 */
export function isVerseRead(verseKey: string): boolean {
    const progress = getProgress();
    return progress.readVerses.includes(verseKey);
}

/**
 * Get surah reading progress
 */
export function getSurahProgress(surahId: number, totalVerses: number): { read: number; percentage: number } {
    const progress = getProgress();
    const surahPattern = `${surahId}:`;
    const readInSurah = progress.readVerses.filter(v => v.startsWith(surahPattern)).length;

    return {
        read: readInSurah,
        percentage: Math.round((readInSurah / totalVerses) * 100),
    };
}

/**
 * Clear all reading progress
 */
export function clearProgress(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
}

/**
 * Get total verses constant
 */
export function getTotalVerses(): number {
    return TOTAL_VERSES;
}
