/**
 * Quran.com API Service (v4)
 * Modern API integration replacing api.alquran.cloud
 * Documentation: https://api-docs.quran.com/docs/category/quran
 */

const QURAN_API_BASE = 'https://api.quran.com/api/v4';
const AUDIO_CDN_BASE = 'https://verses.quran.com';

// ==================== TYPES ====================

export interface QuranComChapter {
    id: number;
    revelation_place: 'makkah' | 'madinah';
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: [number, number];
    translated_name: {
        language_name: string;
        name: string;
    };
}

export interface QuranComWord {
    id: number;
    position: number;
    audio_url: string;
    char_type_name: string;
    code_v1: string;
    code_v2: string;
    line_number: number;
    page_number: number;
    text_uthmani: string;
    text_simple?: string;
    verse_key: string;
    translation?: {
        text: string;
        language_name: string;
    };
    transliteration?: {
        text: string;
        language_name: string;
    };
}

export interface QuranComVerse {
    id: number;
    verse_number: number;
    verse_key: string;
    text_uthmani: string;
    text_simple?: string;
    juz_number: number;
    hizb_number: number;
    rub_el_hizb_number: number;
    page_number: number;
    words?: QuranComWord[];
    translations?: Array<{
        resource_id: number;
        text: string;
    }>;
}

export interface TranslationResource {
    id: number;
    name: string;
    author_name: string;
    slug: string;
    language_name: string;
}

// ==================== TRANSLATION MAPPINGS ====================

export const TRANSLATION_MAP: Record<string, number> = {
    'en.sahih': 131,           // Sahih International
    'en.asad': 17,             // Muhammad Asad
    'en.pickthall': 19,        // Pickthall
    'en.yusufali': 21,         // Yusuf Ali
    'en.hilali': 203,          // Muhsin Khan
    'en.maududi': 95,          // Maududi
    'en.shakir': 22,           // Shakir
    'en.ahmedali': 16,         // Ahmed Ali
    'en.daryabadi': 18,        // Daryabadi
};

export const DEFAULT_TRANSLATION = 131; // Sahih International

// ==================== CHAPTER/SURAH APIs ====================

/**
 * Get all chapters metadata
 */
export async function getChapters(language: string = 'en'): Promise<QuranComChapter[]> {
    const url = `${QURAN_API_BASE}/chapters?language=${language}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch chapters: ${response.statusText}`);
    }

    const data = await response.json();
    return data.chapters;
}

/**
 * Get single chapter metadata
 */
export async function getChapter(chapterId: number, language: string = 'en'): Promise<QuranComChapter> {
    const url = `${QURAN_API_BASE}/chapters/${chapterId}?language=${language}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch chapter ${chapterId}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.chapter;
}

/**
 * Get verses by chapter with optional translations and word-by-word data
 */
export async function getVersesByChapter(
    chapterNumber: number,
    options: {
        translations?: number | number[];
        words?: boolean;
        wordFields?: string;
        perPage?: number;
        page?: number;
    } = {}
): Promise<{ verses: QuranComVerse[]; pagination?: any }> {
    const params = new URLSearchParams();

    // Add translations
    if (options.translations) {
        const translations = Array.isArray(options.translations)
            ? options.translations.join(',')
            : options.translations.toString();
        params.append('translations', translations);
    }

    // Add word-by-word data
    if (options.words) {
        params.append('words', 'true');
        params.append('word_fields', options.wordFields || 'text_uthmani,code_v1,code_v2,page_number,verse_key,position');
    }

    // Pagination
    if (options.perPage) {
        params.append('per_page', options.perPage.toString());
    }
    if (options.page) {
        params.append('page', options.page.toString());
    }

    const url = `${QURAN_API_BASE}/verses/by_chapter/${chapterNumber}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch verses for chapter ${chapterNumber}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        verses: data.verses,
        pagination: data.pagination
    };
}

// ==================== JUZ APIs ====================

/**
 * Get verses by Juz number
 */
export async function getVersesByJuz(
    juzNumber: number,
    options: {
        translations?: number | number[];
        words?: boolean;
        perPage?: number;
    } = {}
): Promise<{ verses: QuranComVerse[] }> {
    const params = new URLSearchParams();

    if (options.translations) {
        const translations = Array.isArray(options.translations)
            ? options.translations.join(',')
            : options.translations.toString();
        params.append('translations', translations);
    }

    if (options.words) {
        params.append('words', 'true');
        params.append('word_fields', 'text_uthmani,code_v1,code_v2,page_number,verse_key,position');
    }

    if (options.perPage) {
        params.append('per_page', options.perPage.toString());
    }

    const url = `${QURAN_API_BASE}/verses/by_juz/${juzNumber}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch Juz ${juzNumber}: ${response.statusText}`);
    }

    const data = await response.json();
    return { verses: data.verses };
}

// ==================== PAGE APIs ====================

/**
 * Get verses by page number (Mushaf page 1-604)
 */
export async function getVersesByPage(
    pageNumber: number,
    options: {
        translations?: number | number[];
        words?: boolean;
        perPage?: number;
    } = {}
): Promise<{ verses: QuranComVerse[] }> {
    const params = new URLSearchParams();

    if (options.translations) {
        const translations = Array.isArray(options.translations)
            ? options.translations.join(',')
            : options.translations.toString();
        params.append('translations', translations);
    }

    if (options.words) {
        params.append('words', 'true');
        params.append('word_fields', 'text_uthmani,code_v1,code_v2,page_number,verse_key,position');
    }

    if (options.perPage) {
        params.append('per_page', options.perPage.toString());
    }

    const url = `${QURAN_API_BASE}/verses/by_page/${pageNumber}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch page ${pageNumber}: ${response.statusText}`);
    }

    const data = await response.json();
    return { verses: data.verses };
}

// ==================== HIZB APIs ====================

/**
 * Get verses by Hizb number
 */
export async function getVersesByHizb(
    hizbNumber: number,
    options: {
        translations?: number | number[];
        words?: boolean;
    } = {}
): Promise<{ verses: QuranComVerse[] }> {
    const params = new URLSearchParams();

    if (options.translations) {
        const translations = Array.isArray(options.translations)
            ? options.translations.join(',')
            : options.translations.toString();
        params.append('translations', translations);
    }

    if (options.words) {
        params.append('words', 'true');
    }

    const url = `${QURAN_API_BASE}/verses/by_hizb/${hizbNumber}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch Hizb ${hizbNumber}: ${response.statusText}`);
    }

    const data = await response.json();
    return { verses: data.verses };
}

// ==================== VERSE APIs ====================

/**
 * Get single verse by verse key (e.g., "2:255")
 */
export async function getVerseByKey(
    verseKey: string,
    options: {
        translations?: number | number[];
        words?: boolean;
    } = {}
): Promise<QuranComVerse> {
    const params = new URLSearchParams();

    if (options.translations) {
        const translations = Array.isArray(options.translations)
            ? options.translations.join(',')
            : options.translations.toString();
        params.append('translations', translations);
    }

    if (options.words) {
        params.append('words', 'true');
        params.append('word_fields', 'text_uthmani,code_v1,code_v2,page_number,verse_key,position,audio_url');
    }

    const url = `${QURAN_API_BASE}/verses/by_key/${verseKey}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch verse ${verseKey}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.verse;
}

// ==================== AUDIO APIs ====================

/**
 * Get audio URL for a verse
 * @param verseKey Verse key in format "chapter:verse" (e.g., "2:255")
 * @param reciter Reciter identifier (default: ar.alafasy)
 */
export function getVerseAudioUrl(verseKey: string, reciter: string = 'ar.alafasy'): string {
    return `${AUDIO_CDN_BASE}/${reciter}/${verseKey}.mp3`;
}

/**
 * Get audio URLs for multiple verses
 */
export function getVersesAudioUrls(verseKeys: string[], reciter: string = 'ar.alafasy'): string[] {
    return verseKeys.map(key => getVerseAudioUrl(key, reciter));
}

// ==================== RECITER APIs ====================

export interface Reciter {
    id: number;
    name: string;
    translated_name: { name: string; language_name: string };
    style: string;
}

/**
 * Get list of available reciters
 */
export async function getReciters(language: string = 'en'): Promise<Reciter[]> {
    const url = `${QURAN_API_BASE}/resources/recitations?language=${language}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch reciters: ${response.statusText}`);
    }

    const data = await response.json();
    return data.recitations;
}

// ==================== TRANSLATION APIs ====================

/**
 * Get list of available translations
 */
export async function getTranslations(language?: string): Promise<TranslationResource[]> {
    const params = new URLSearchParams();
    if (language) {
        params.append('language', language);
    }

    const url = `${QURAN_API_BASE}/resources/translations?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch translations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translations;
}

// ==================== SEARCH APIs ====================

/**
 * Search Quran text
 */
export async function searchQuran(
    query: string,
    options: {
        size?: number;
        page?: number;
        language?: string;
    } = {}
): Promise<any> {
    const params = new URLSearchParams();
    params.append('q', query);

    if (options.size) params.append('size', options.size.toString());
    if (options.page) params.append('page', options.page.toString());
    if (options.language) params.append('language', options.language);

    const url = `${QURAN_API_BASE}/search?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
}

export default {
    getChapters,
    getChapter,
    getVersesByChapter,
    getVersesByJuz,
    getVersesByPage,
    getVersesByHizb,
    getVerseByKey,
    getVerseAudioUrl,
    getVersesAudioUrls,
    getReciters,
    getTranslations,
    searchQuran,
};
