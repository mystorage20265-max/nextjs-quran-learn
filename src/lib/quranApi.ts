/**
 * Quran.com API v4 Client
 * 
 * A TypeScript client for interacting with the Quran.com API
 * to fetch verses, translations, audio, and word-by-word data.
 * 
 * @see https://api.quran.com/api/v4
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface Word {
    id: number;
    position: number;
    text_uthmani: string;
    text_imlaei?: string;
    translation: {
        text: string;
        language_name: string;
    };
    transliteration: {
        text: string;
        language_name: string;
    };
    audio: {
        url: string;
    };
}

export interface Translation {
    id: number;
    resource_id: number;
    text: string;
}

export interface Verse {
    id: number;
    verse_number: number;
    verse_key: string;
    text_uthmani: string;
    words?: Word[];
    translations?: Translation[];
}

export interface ChapterInfo {
    id: number;
    name_simple: string;
    name_arabic: string;
    name_complex: string;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    verses_count: number;
    pages: [number, number];
    translated_name: {
        language_name: string;
        name: string;
    };
}

export interface Pagination {
    per_page: number;
    current_page: number;
    total_pages: number;
    total_records: number;
}

export interface TranslationResource {
    id: number;
    name: string;
    author_name: string;
    language_name: string;
}

export interface RecitationResource {
    id: number;
    reciter_name: string;
    style: string;
    translated_name: {
        name: string;
        language_name: string;
    };
}

// ============================================================================
// API Client
// ============================================================================

const BASE_URL = 'https://api.quran.com/api/v4';
const DEFAULT_CACHE_TIME = 86400; // 24 hours in seconds

export class QuranAPI {
    /**
     * Fetch verses for a specific chapter (surah)
     * 
     * @param chapterNumber - Chapter number (1-114)
     * @param options - Optional parameters
     * @returns Object containing verses and pagination info
     */
    static async getVersesByChapter(
        chapterNumber: number,
        options: {
            language?: string;
            words?: boolean;
            translations?: number[];
            perPage?: number;
            page?: number;
        } = {}
    ): Promise<{ verses: Verse[]; pagination: Pagination }> {
        const {
            language = 'en',
            words = true,
            translations = [131], // Sahih International
            perPage = 50,
            page = 1,
        } = options;

        const params = new URLSearchParams({
            language,
            words: words.toString(),
            translations: translations.join(','),
            per_page: perPage.toString(),
            page: page.toString(),
        });

        const url = `${BASE_URL}/verses/by_chapter/${chapterNumber}?${params}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: DEFAULT_CACHE_TIME },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                verses: data.verses,
                pagination: data.pagination,
            };
        } catch (error) {
            console.error('[QuranAPI] Failed to fetch verses by chapter:', error);
            throw error;
        }
    }

    /**
     * Fetch a specific verse by key (e.g., "1:1")
     * 
     * @param verseKey - Verse key in format "chapter:verse" (e.g., "1:1")
     * @param options - Optional parameters
     * @returns Single verse object
     */
    static async getVerseByKey(
        verseKey: string,
        options: {
            language?: string;
            words?: boolean;
            translations?: number[];
        } = {}
    ): Promise<Verse> {
        const {
            language = 'en',
            words = true,
            translations = [131],
        } = options;

        const params = new URLSearchParams({
            language,
            words: words.toString(),
            translations: translations.join(','),
        });

        const url = `${BASE_URL}/verses/by_key/${verseKey}?${params}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: DEFAULT_CACHE_TIME },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.verse;
        } catch (error) {
            console.error('[QuranAPI] Failed to fetch verse by key:', error);
            throw error;
        }
    }

    /**
     * Fetch verses by page number (Mushaf page 1-604)
     * 
     * @param pageNumber - Page number (1-604)
     * @param options - Optional parameters
     * @returns Array of verses on the page
     */
    static async getVersesByPage(
        pageNumber: number,
        options: {
            language?: string;
            words?: boolean;
            translations?: number[];
        } = {}
    ): Promise<Verse[]> {
        const {
            language = 'en',
            words = true,
            translations = [131],
        } = options;

        const params = new URLSearchParams({
            language,
            words: words.toString(),
            translations: translations.join(','),
            per_page: '50',
        });

        const url = `${BASE_URL}/verses/by_page/${pageNumber}?${params}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: DEFAULT_CACHE_TIME },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.verses;
        } catch (error) {
            console.error('[QuranAPI] Failed to fetch verses by page:', error);
            throw error;
        }
    }

    /**
     * Fetch verses by Juz number (1-30)
     * 
     * @param juzNumber - Juz number (1-30)
     * @param options - Optional parameters
     * @returns Array of verses in the juz
     */
    static async getVersesByJuz(
        juzNumber: number,
        options: {
            language?: string;
            words?: boolean;
            translations?: number[];
        } = {}
    ): Promise<Verse[]> {
        const {
            language = 'en',
            words = true,
            translations = [131],
        } = options;

        const params = new URLSearchParams({
            language,
            words: words.toString(),
            translations: translations.join(','),
            per_page: '50',
        });

        const url = `${BASE_URL}/verses/by_juz/${juzNumber}?${params}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: DEFAULT_CACHE_TIME },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.verses;
        } catch (error) {
            console.error('[QuranAPI] Failed to fetch verses by juz:', error);
            throw error;
        }
    }

    /**
     * Get chapter (surah) information
     * 
     * @param chapterNumber - Chapter number (1-114)
     * @param language - Language code (default: 'en')
     * @returns Chapter metadata
     */
    static async getChapterInfo(
        chapterNumber: number,
        language: string = 'en'
    ): Promise<ChapterInfo> {
        const url = `${BASE_URL}/chapters/${chapterNumber}?language=${language}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: DEFAULT_CACHE_TIME },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.chapter;
        } catch (error) {
            console.error('[QuranAPI] Failed to fetch chapter info:', error);
            throw error;
        }
    }

    /**
     * Get all chapters list
     * 
     * @param language - Language code (default: 'en')
     * @returns Array of all chapters
     */
    static async getAllChapters(language: string = 'en'): Promise<ChapterInfo[]> {
        const url = `${BASE_URL}/chapters?language=${language}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: 604800 }, // Cache for 1 week
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.chapters;
        } catch (error) {
            console.error('[QuranAPI] Failed to fetch all chapters:', error);
            throw error;
        }
    }

    /**
     * Get available translations
     * 
     * @param language - Filter by language (optional)
     * @returns Array of translation resources
     */
    static async getTranslations(
        language?: string
    ): Promise<TranslationResource[]> {
        const params = language ? `?language=${language}` : '';
        const url = `${BASE_URL}/resources/translations${params}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: 604800 }, // Cache for 1 week
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.translations;
        } catch (error) {
            console.error('[QuranAPI] Failed to fetch translations:', error);
            throw error;
        }
    }

    /**
     * Get available recitations (audio reciters)
     * 
     * @param language - Filter by language (optional)
     * @returns Array of recitation resources
     */
    static async getRecitations(
        language?: string
    ): Promise<RecitationResource[]> {
        const params = language ? `?language=${language}` : '';
        const url = `${BASE_URL}/resources/recitations${params}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: 604800 }, // Cache for 1 week
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.recitations;
        } catch (error) {
            console.error('[QuranAPI] Failed to fetch recitations:', error);
            throw error;
        }
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate verse audio URL for a specific reciter
 * 
 * @param reciterId - ID of the reciter
 * @param chapterNumber - Chapter number
 * @param verseNumber - Verse number
 * @returns Audio URL
 */
export function getVerseAudioUrl(
    reciterId: number,
    chapterNumber: number,
    verseNumber: number
): string {
    const chapter = chapterNumber.toString().padStart(3, '0');
    const verse = verseNumber.toString().padStart(3, '0');
    return `https://verses.quran.com/${reciterId}/${chapter}_${verse}.mp3`;
}

/**
 * Common translation IDs for easy reference
 */
export const TRANSLATIONS = {
    SAHIH_INTERNATIONAL: 131,
    DR_MUSTAFA_KHATTAB: 20,
    PICKTHALL: 84,
    YUSUF_ALI: 85,
    TAFSIR_JALALAYN: 19,
} as const;

/**
 * Common reciter IDs
 */
export const RECITERS = {
    MISHARY_ALAFASY: 7,
    ABDUL_BASIT: 1,
    MINSHAWI: 5,
} as const;
