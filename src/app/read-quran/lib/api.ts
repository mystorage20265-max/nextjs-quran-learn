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
    text_imlaei?: string;
    words?: Word[];
}

export interface Word {
    id: number;
    position: number;
    text_uthmani: string;
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

/**
 * Get all 114 chapters/surahs
 */
export async function getChapters(): Promise<Chapter[]> {
    try {
        const response = await fetchWithRetry(`${API_BASE}/chapters?language=en`);
        const data: ChaptersResponse = await response.json();
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
    try {
        const response = await fetchWithRetry(`${API_BASE}/chapters/${chapterId}?language=en`);
        const data: ChapterResponse = await response.json();
        return data.chapter;
    } catch (error) {
        console.error(`Error fetching chapter ${chapterId}:`, error);
        throw error;
    }
}

/**
 * Get verses for a chapter with translations
 * Uses alquran.cloud API which reliably returns translations
 */
export async function getVerses(
    chapterId: number,
    translationId: string = 'en.sahih', // Sahih International
    page: number = 1,
    perPage: number = 50
): Promise<VersesResponse> {
    try {
        // Use alquran.cloud API which returns translations inline
        const ALQURAN_API = 'https://api.alquran.cloud/v1';

        // Fetch both Arabic and translation
        const url = `${ALQURAN_API}/surah/${chapterId}/editions/quran-uthmani,${translationId}`;
        const response = await fetchWithRetry(url);
        const data = await response.json();

        if (data.code !== 200 || !data.data) {
            throw new Error('Failed to fetch verses');
        }

        const arabicData = data.data[0];
        const translationData = data.data[1];

        // Merge Arabic and translations
        const verses: VerseWithTranslation[] = arabicData.ayahs.map((ayah: any, index: number) => ({
            id: ayah.number,
            verse_key: `${chapterId}:${ayah.numberInSurah}`,
            verse_number: ayah.numberInSurah,
            hizb_number: ayah.hizbQuarter || 1,
            rub_el_hizb_number: 1,
            ruku_number: ayah.ruku || 1,
            manzil_number: ayah.manzil || 1,
            sajdah_number: ayah.sajda ? ayah.number : null,
            page_number: ayah.page || 1,
            juz_number: ayah.juz || 1,
            text_uthmani: ayah.text,
            translations: [{
                resource_id: 20,
                text: translationData?.ayahs?.[index]?.text || 'Translation not available'
            }]
        }));

        return {
            verses,
            pagination: {
                per_page: perPage,
                current_page: page,
                next_page: null,
                total_pages: 1,
                total_records: verses.length
            }
        };
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
    translationId: string = 'en.sahih'
): Promise<VerseWithTranslation[]> {
    const data = await getVerses(chapterId, translationId);
    return data.verses;
}

/**
 * Get verses with word-by-word data (translations and transliterations)
 * Uses Quran.com API v4 with words parameter
 */
export async function getVersesWithWords(
    chapterId: number,
    translationId: string = '131' // Sahih International
): Promise<VerseWithTranslation[]> {
    try {
        // Quran.com API endpoint for verses with words
        const url = `${API_BASE}/verses/by_chapter/${chapterId}?language=en&words=true&translations=${translationId}&word_fields=text_uthmani,text_imlaei,translation,transliteration&translation_fields=text,resource_name&per_page=300`;

        const response = await fetchWithRetry(url);
        const data = await response.json();

        if (!data.verses) {
            throw new Error('Failed to fetch verses with words');
        }

        // Map the response to our VerseWithTranslation type
        const verses: VerseWithTranslation[] = data.verses.map((verse: any) => ({
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
            text_uthmani: verse.text_uthmani,
            text_imlaei: verse.text_imlaei,
            translations: verse.translations || [],
            words: verse.words?.map((word: any) => ({
                id: word.id,
                position: word.position,
                text_uthmani: word.text_uthmani,
                text_imlaei: word.text_imlaei || word.text_uthmani,
                translation: word.translation || { text: '', language_name: 'english' },
                transliteration: word.transliteration || { text: '', language_name: 'english' },
                audio_url: word.audio_url || null
            })) || []
        }));

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
