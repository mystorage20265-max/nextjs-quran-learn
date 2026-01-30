/**
 * Storage Service
 * Manages localStorage for user preferences, bookmarks, and reading progress
 */

export interface UserPreferences {
    theme: 'dark' | 'light' | 'sepia';
    arabicFontSize: number;
    translationFontSize: number;
    arabicFont: 'scheherazade' | 'amiri';
    selectedTranslations: number[];
    showTranslation: boolean;
    showWordByWord: boolean;
    showTransliteration: boolean;
    reciterId: number;
    playbackSpeed: number;
    volume: number;
    autoScroll: boolean;
}

export interface Bookmark {
    verseKey: string;
    timestamp: number;
    note?: string;
    tags?: string[];
    surahName?: string;
    verseNumber?: number;
}

export interface ReadingProgress {
    lastRead: {
        verseKey: string;
        timestamp: number;
    };
    versesRead: Set<string>;
    readingStreak: number;
    lastReadDate: string;
    totalTimeSpent: number; // in seconds
}

const STORAGE_KEYS = {
    PREFERENCES: 'readquran_preferences',
    BOOKMARKS: 'readquran_bookmarks',
    PROGRESS: 'readquran_progress',
};

const DEFAULT_PREFERENCES: UserPreferences = {
    theme: 'dark',
    arabicFontSize: 28,
    translationFontSize: 16,
    arabicFont: 'scheherazade',
    selectedTranslations: [131], // Sahih International
    showTranslation: true,
    showWordByWord: false,
    showTransliteration: true,
    reciterId: 7, // Mishary
    playbackSpeed: 1,
    volume: 0.8,
    autoScroll: true,
};

class StorageService {
    // === PREFERENCES ===

    getPreferences(): UserPreferences {
        if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
            if (stored) {
                return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
        return DEFAULT_PREFERENCES;
    }

    savePreferences(preferences: Partial<UserPreferences>) {
        if (typeof window === 'undefined') return;

        try {
            const current = this.getPreferences();
            const updated = { ...current, ...preferences };
            localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    // === BOOKMARKS ===

    getBookmarks(): Bookmark[] {
        if (typeof window === 'undefined') return [];

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
        return [];
    }

    addBookmark(bookmark: Bookmark) {
        if (typeof window === 'undefined') return;

        try {
            const bookmarks = this.getBookmarks();
            const exists = bookmarks.find(b => b.verseKey === bookmark.verseKey);

            if (!exists) {
                bookmarks.push(bookmark);
                localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
            }
        } catch (error) {
            console.error('Error adding bookmark:', error);
        }
    }

    removeBookmark(verseKey: string) {
        if (typeof window === 'undefined') return;

        try {
            const bookmarks = this.getBookmarks().filter(b => b.verseKey !== verseKey);
            localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    }

    updateBookmark(verseKey: string, updates: Partial<Bookmark>) {
        if (typeof window === 'undefined') return;

        try {
            const bookmarks = this.getBookmarks();
            const index = bookmarks.findIndex(b => b.verseKey === verseKey);

            if (index !== -1) {
                bookmarks[index] = { ...bookmarks[index], ...updates };
                localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
            }
        } catch (error) {
            console.error('Error updating bookmark:', error);
        }
    }

    // === READING PROGRESS ===

    getProgress(): ReadingProgress {
        if (typeof window === 'undefined') {
            return {
                lastRead: { verseKey: '1:1', timestamp: Date.now() },
                versesRead: new Set(),
                readingStreak: 0,
                lastReadDate: new Date().toISOString().split('T')[0],
                totalTimeSpent: 0,
            };
        }

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
            if (stored) {
                const data = JSON.parse(stored);
                // Convert array back to Set
                data.versesRead = new Set(data.versesRead || []);
                return data;
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }

        return {
            lastRead: { verseKey: '1:1', timestamp: Date.now() },
            versesRead: new Set(),
            readingStreak: 0,
            lastReadDate: new Date().toISOString().split('T')[0],
            totalTimeSpent: 0,
        };
    }

    saveProgress(progress: Partial<ReadingProgress>) {
        if (typeof window === 'undefined') return;

        try {
            const current = this.getProgress();
            const updated = { ...current, ...progress };

            // Convert Set to array for JSON storage
            const toStore = {
                ...updated,
                versesRead: Array.from(updated.versesRead),
            };

            localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(toStore));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    markVerseAsRead(verseKey: string) {
        if (typeof window === 'undefined') return;

        const progress = this.getProgress();
        progress.versesRead.add(verseKey);
        progress.lastRead = { verseKey, timestamp: Date.now() };

        // Update streak
        const today = new Date().toISOString().split('T')[0];
        const lastDate = new Date(progress.lastReadDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            progress.readingStreak += 1;
        } else if (diffDays > 1) {
            progress.readingStreak = 1;
        }

        progress.lastReadDate = today;
        this.saveProgress(progress);
    }

    addReadingTime(seconds: number) {
        if (typeof window === 'undefined') return;

        const progress = this.getProgress();
        progress.totalTimeSpent += seconds;
        this.saveProgress(progress);
    }

    // === EXPORT/IMPORT ===

    exportData() {
        return {
            preferences: this.getPreferences(),
            bookmarks: this.getBookmarks(),
            progress: {
                ...this.getProgress(),
                versesRead: Array.from(this.getProgress().versesRead),
            },
            exportDate: new Date().toISOString(),
        };
    }

    importData(data: any) {
        if (typeof window === 'undefined') return;

        try {
            if (data.preferences) {
                this.savePreferences(data.preferences);
            }

            if (data.bookmarks) {
                localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
            }

            if (data.progress) {
                const progress = {
                    ...data.progress,
                    versesRead: new Set(data.progress.versesRead || []),
                };
                this.saveProgress(progress);
            }
        } catch (error) {
            console.error('Error importing data:', error);
        }
    }

    clearAllData() {
        if (typeof window === 'undefined') return;

        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}

export const storageService = new StorageService();
