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
 */
export async function getVerses(
    chapterId: number,
    translationId: number = 131, // Dr. Mustafa Khattab - The Clear Quran
    page: number = 1,
    perPage: number = 50
): Promise<VersesResponse> {
    try {
        const url = `${API_BASE}/verses/by_chapter/${chapterId}?language=en&words=false&translations=${translationId}&fields=text_uthmani&page=${page}&per_page=${perPage}`;
        const response = await fetchWithRetry(url);
        const data: VersesResponse = await response.json();
        return data;
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
    translationId: number = 131
): Promise<VerseWithTranslation[]> {
    const allVerses: VerseWithTranslation[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const data = await getVerses(chapterId, translationId, page, 50);
        allVerses.push(...data.verses);
        hasMore = data.pagination.next_page !== null;
        page++;
    }

    return allVerses;
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
export const POPULAR_RECITERS = [
    { id: 7, name: 'Mishari Rashid al-`Afasy' },
    { id: 2, name: 'Abdul Rahman Al-Sudais' },
    { id: 1, name: 'Abdul Basit Abdul Samad' },
    { id: 5, name: 'Saad Al-Ghamdi' },
    { id: 6, name: 'Mahmoud Khalil Al-Hussary' },
    { id: 4, name: 'Abu Bakr al-Shatri' },
    { id: 3, name: 'Abdullah Awad al-Juhani' },
    { id: 10, name: 'Maher Al Muaiqly' },
];

// Popular translations
export const TRANSLATIONS = [
    { id: 131, name: 'Dr. Mustafa Khattab', language: 'English' },
    { id: 20, name: 'Sahih International', language: 'English' },
    { id: 85, name: 'Pickthall', language: 'English' },
    { id: 22, name: 'Yusuf Ali', language: 'English' },
    { id: 234, name: 'Taqi Usmani', language: 'English' },
    { id: 97, name: 'Mufti Taqi Usmani', language: 'Urdu' },
    { id: 161, name: 'Al-Hilali & Khan', language: 'English' },
];
