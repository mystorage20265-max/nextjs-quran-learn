// Read Quran - Fresh API Layer
// Using Quran.com API (api.quran.com) - No dependencies on existing code

const API_BASE = 'https://api.quran.com/api/v4';

// Types
export interface Chapter {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

export interface Verse {
    id: number;
    verse_key: string;
    verse_number: number;
    hizb_number: number;
    rub_el_hizb_number: number;
    ruku_number: number;
    manzil_number: number;
    sajdah_number: number | null;
    page_number: number;
    juz_number: number;
    text_uthmani: string;
    text_indopak?: string;   // Indo-Pak Nastaliq script
    text_imlaei?: string;
    words?: Word[];
}

export interface Word {
    id: number;
    position: number;
    char_type_name?: string;
    text_uthmani: string;
    text_indopak?: string;   // Indo-Pak Nastaliq script per word
    text_imlaei: string;
    translation: {
        text: string;
        language_name: string;
    };
    transliteration: {
        text: string;
        language_name: string;
    };
    audio_url?: string;
}

export interface Translation {
    resource_id: number;
    text: string;
}

export interface VerseWithTranslation extends Verse {
    translations: Translation[];
}

export interface Reciter {
    id: number;
    reciter_name: string;
    style: string | null;
    translated_name: {
        name: string;
        language_name: string;
    };
}

export interface AudioFile {
    url: string;
    duration: number;
    format: string;
    segments: number[][];
}

// API Response Types
interface ChaptersResponse {
    chapters: Chapter[];
}

interface ChapterResponse {
    chapter: Chapter;
}

interface VersesResponse {
    verses: VerseWithTranslation[];
    pagination: {
        per_page: number;
        current_page: number;
        next_page: number | null;
        total_pages: number;
        total_records: number;
    };
}

interface RecitersResponse {
    reciters: Reciter[];
}

// Fetch with retry logic
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 3600 } // Cache for 1 hour
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
    throw new Error('All retries failed');
}

// ============ API FUNCTIONS ============

// ============ CACHE LAYER ============
const clientCache = new Map<string, any>();

/**
 * Get all 114 chapters/surahs
 */
export async function getChapters(): Promise<Chapter[]> {
    const cacheKey = 'chapters';
    if (clientCache.has(cacheKey)) return clientCache.get(cacheKey);

    try {
        const response = await fetchWithRetry(`${API_BASE}/chapters?language=en`);
        const data: ChaptersResponse = await response.json();
        data.chapters.forEach(c => {
            if (c.name_simple === "Ali 'Imran") c.name_simple = "Al 'Imran";
        });
        clientCache.set(cacheKey, data.chapters);
        return data.chapters;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        throw error;
    }
}

/**
 * Get single chapter info
 */
export async function getChapter(chapterId: number): Promise<Chapter> {
    const cacheKey = `chapter-${chapterId}`;
    if (clientCache.has(cacheKey)) return clientCache.get(cacheKey);

    try {
        const response = await fetchWithRetry(`${API_BASE}/chapters/${chapterId}?language=en`);
        const data: ChapterResponse = await response.json();
        if (data.chapter.name_simple === "Ali 'Imran") data.chapter.name_simple = "Al 'Imran";
        clientCache.set(cacheKey, data.chapter);
        return data.chapter;
    } catch (error) {
        console.error(`Error fetching chapter ${chapterId}:`, error);
        throw error;
    }
}

/**
 * Get verses for a chapter with translations.
 * Fetches Indo-Pak text from QuranCDN (full diacritics incl. sukun) and
 * translation from api.quran.com in parallel. Maps via verse_key directly.
 */
export async function getVerses(
    chapterId: number,
    resourceId: string = '131', // Sahih International resource ID
    page: number = 1,
    perPage: number = 300
): Promise<VersesResponse> {
    const cacheKey = `verses-${chapterId}-${resourceId}-${page}`;
    if (clientCache.has(cacheKey)) return clientCache.get(cacheKey);
    try {
        // Parallel: Indo-Pak text (QuranCDN) + Arabic+translation (quran.com)
        const [indopakRes, translationRes] = await Promise.all([
            fetchWithRetry(`https://api.qurancdn.com/api/v4/quran/verses/indopak?chapter_number=${chapterId}&per_page=${perPage}`),
            fetchWithRetry(`${API_BASE}/verses/by_chapter/${chapterId}?language=en&translations=${resourceId}&fields=text_uthmani&per_page=${perPage}`),
        ]);

        const [indopakJson, translationJson] = await Promise.all([
            indopakRes.json(),
            translationRes.json(),
        ]);

        if (!translationJson.verses) {
            throw new Error('Failed to fetch verses');
        }

        // Build verse_key → indopak text map
        const indopakMap = new Map<string, string>();
        (indopakJson?.verses || []).forEach((v: { verse_key: string; text_indopak: string }) => {
            indopakMap.set(v.verse_key, v.text_indopak);
        });

        const verses: VerseWithTranslation[] = translationJson.verses.map((verse: any) => {
            const indopakText = indopakMap.get(verse.verse_key) || verse.text_uthmani;
            return {
                id: verse.id,
                verse_key: verse.verse_key,
                verse_number: verse.verse_number,
                hizb_number: verse.hizb_number || 1,
                rub_el_hizb_number: verse.rub_el_hizb_number || 1,
                ruku_number: verse.ruku_number || 1,
                manzil_number: verse.manzil_number || 1,
                sajdah_number: verse.sajdah_number || null,
                page_number: verse.page_number || 1,
                juz_number: verse.juz_number || 1,
                text_uthmani: indopakText,   // use Indo-Pak as primary text
                text_indopak: indopakText,
                translations: verse.translations || []
            };
        });

        const result = {
            verses,
            pagination: translationJson.pagination || {
                per_page: perPage,
                current_page: page,
                next_page: null,
                total_pages: 1,
                total_records: verses.length
            }
        };
        clientCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error(`Error fetching verses for chapter ${chapterId}:`, error);
        throw error;
    }
}

/**
 * Get all verses for a chapter (handles pagination)
 */
export async function getAllVerses(
    chapterId: number,
    resourceId: string = '131'
): Promise<VerseWithTranslation[]> {
    const data = await getVerses(chapterId, resourceId);
    return data.verses;
}

/**
 * Get verses with word-by-word data (translations and transliterations)
 * Uses Quran.com API v4 with words parameter
 */
export async function getVersesWithWords(
    chapterId: number,
    translationId: string = '131', // Sahih International (English)
    wordLanguage: string = 'en' // Default to English for word translations/transliterations
): Promise<VerseWithTranslation[]> {
    const cacheKey = `verses-words-${chapterId}-${translationId}-${wordLanguage}`;
    if (clientCache.has(cacheKey)) return clientCache.get(cacheKey);
    try {
        // Fetch Quran.com words data AND QuranCDN IndoPak text in parallel.
        // Quran.com's text_indopak omits sukun (U+0652); QuranCDN has the full diacritics.
        const url = `${API_BASE}/verses/by_chapter/${chapterId}?language=${wordLanguage}&words=true&translations=${translationId}&fields=text_uthmani,text_indopak&word_fields=text_uthmani,text_indopak,text_imlaei,translation,transliteration&translation_fields=text,resource_name&per_page=300`;

        const [response, indopakRes] = await Promise.all([
            fetchWithRetry(url),
            fetchWithRetry(`https://api.qurancdn.com/api/v4/quran/verses/indopak?chapter_number=${chapterId}&per_page=300`),
        ]);

        const [data, indopakJson] = await Promise.all([
            response.json(),
            indopakRes.json(),
        ]);

        if (!data.verses) {
            throw new Error('Failed to fetch verses with words');
        }

        // Build verse_key → full indopak text map (with sukun) from QuranCDN
        const indopakMap = new Map<string, string>();
        (indopakJson?.verses || []).forEach((v: { verse_key: string; text_indopak: string }) => {
            indopakMap.set(v.verse_key, v.text_indopak);
        });

        // Map the response to our VerseWithTranslation type
        const verses: VerseWithTranslation[] = data.verses.map((verse: any) => {
            // Prefer QuranCDN indopak (has sukun) over Quran.com indopak (missing sukun)
            const fullIndopak = indopakMap.get(verse.verse_key)
                || verse.text_indopak
                || verse.text_uthmani;
            return {
                id: verse.id,
                verse_key: verse.verse_key,
                verse_number: verse.verse_number,
                hizb_number: verse.hizb_number || 1,
                rub_el_hizb_number: verse.rub_el_hizb_number || 1,
                ruku_number: verse.ruku_number || 1,
                manzil_number: verse.manzil_number || 1,
                sajdah_number: verse.sajdah_number || null,
                page_number: verse.page_number || 1,
                juz_number: verse.juz_number || 1,
                text_uthmani: fullIndopak,   // use full indopak as primary text
                text_indopak: fullIndopak,   // explicit alias
                text_imlaei: verse.text_imlaei,
                translations: verse.translations || [],
                words: verse.words?.map((word: any) => ({
                    id: word.id,
                    position: word.position,
                    char_type_name: word.char_type_name,
                    text_uthmani: word.text_uthmani,
                    text_indopak: word.text_indopak || word.text_uthmani,
                    text_imlaei: word.text_imlaei || word.text_uthmani,
                    translation: word.translation || { text: '', language_name: 'english' },
                    transliteration: word.transliteration || { text: '', language_name: 'english' },
                    audio_url: word.audio_url || null
                })) || []
            };
        });

        clientCache.set(cacheKey, verses);
        return verses;
    } catch (error) {
        console.error(`Error fetching verses with words for chapter ${chapterId}:`, error);
        // Fallback to regular verses if word data fails
        return getAllVerses(chapterId, translationId);
    }
}

/**
 * Get available reciters
 */
export async function getReciters(): Promise<Reciter[]> {
    try {
        const response = await fetchWithRetry(`${API_BASE}/resources/recitations?language=en`);
        const data: RecitersResponse = await response.json();
        return data.reciters;
    } catch (error) {
        console.error('Error fetching reciters:', error);
        throw error;
    }
}

export interface Tafsir {
    id: number;
    name: string;
    author_name: string;
    slug: string;
    language_name: string;
    translated_name: {
        name: string;
        language_name: string;
    };
}

interface TafsirsResponse {
    tafsirs: Tafsir[];
}

/**
 * Get available Tafsirs
 */
export async function getTafsirs(): Promise<Tafsir[]> {
    try {
        const response = await fetchWithRetry(`${API_BASE}/resources/tafsirs?language=en`);
        const data: TafsirsResponse = await response.json();
        return data.tafsirs;
    } catch (error) {
        console.error('Error fetching tafsirs:', error);
        throw error;
    }
}

/**
 * Get audio URL for a chapter
 */
export function getChapterAudioUrl(reciterId: number, chapterId: number): string {
    return `https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${chapterId}&segments=true`;
}

/**
 * Get verse audio URL
 */
export function getVerseAudioUrl(reciterId: number, verseKey: string): string {
    // Format: "1:1" for Al-Fatiha verse 1
    return `https://verses.quran.com/${reciterId}/${verseKey.replace(':', '_')}.mp3`;
}

// Popular reciters with their IDs
// Popular reciters with their IDs and audio identifiers
export const POPULAR_RECITERS = [
    {
        id: 7,
        name: 'Mishari Rashid al-`Afasy',
        slug: 'ar.alafasy',
        folder: 'Alafasy_128kbps'
    },
    {
        id: 2,
        name: 'Abdul Rahman Al-Sudais',
        slug: 'ar.abdurrahmaansudais',
        folder: 'Abdurrahmaan_As-Sudais_192kbps'
    },
    {
        id: 1,
        name: 'Abdul Basit Abdul Samad',
        slug: 'ar.abdulbasitmurattal',
        folder: 'Abdul_Basit_Murattal_192kbps'
    },
    {
        id: 5,
        name: 'Saad Al-Ghamdi',
        slug: 'ar.saadalghamdi',
        folder: 'Saad_Al-Ghamdi_128kbps'
    },
    {
        id: 6,
        name: 'Mahmoud Khalil Al-Hussary',
        slug: 'ar.husary',
        folder: 'Husary_128kbps'
    },
    {
        id: 4,
        name: 'Abu Bakr al-Shatri',
        slug: 'ar.shaatri',
        folder: 'Abu_Bakr_Ash-Shaatree_128kbps'
    },
    {
        id: 10,
        name: 'Maher Al Muaiqly',
        slug: 'ar.mahermuaiqly',
        folder: 'MaherAlMuaiqly128kbps'
    },
];

/**
 * Get Tafsir content for a specific chapter
 */
export async function getTafsirContent(tafsirId: number | string, chapterId: number): Promise<Record<string, string>> {
    try {
        const url = `${API_BASE}/tafsirs/${tafsirId}/by_chapter/${chapterId}?language=en`;
        const response = await fetchWithRetry(url);
        const data = await response.json();

        // Map response to verse_key: text
        const content: Record<string, string> = {};
        data.tafsirs.forEach((item: any) => {
            content[item.verse_key] = item.text;
        });

        return content;
    } catch (error) {
        console.error(`Error fetching tafsir ${tafsirId} for chapter ${chapterId}:`, error);
        return {};
    }
}

// Popular translations (alquran.cloud edition identifiers)
export const TRANSLATIONS = [
    { id: 'en.sahih', name: 'Sahih International', language: 'English' },
    { id: 'en.pickthall', name: 'Pickthall', language: 'English' },
    { id: 'en.yusufali', name: 'Yusuf Ali', language: 'English' },
    { id: 'en.asad', name: 'Muhammad Asad', language: 'English' },
    { id: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhry', language: 'Urdu' },
    { id: 'ur.ahmedali', name: 'Ahmed Ali', language: 'Urdu' },
    { id: 'fr.hamidullah', name: 'Muhammad Hamidullah', language: 'French' },
    { id: 'es.asad', name: 'Muhammad Asad', language: 'Spanish' },
];
