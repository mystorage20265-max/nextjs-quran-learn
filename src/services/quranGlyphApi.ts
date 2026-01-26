/**
 * Quran Glyph API Service
 * Interfaces with Quran.com API v4 to fetch word-by-word glyph data
 */

export interface GlyphWord {
    id: number;
    position: number;
    audio_url: string | null;
    char_type_name: string;
    code_v1: string;
    code_v2: string;
    line_number: number;
    page_number: number;
    text_uthmani: string;
    verse_key: string;
    v1_page: number;
    v2_page: number;
    translation?: {
        text: string;
        language_name: string;
    };
    transliteration?: {
        text: string;
        language_name: string;
    };
}

export interface GlyphVerse {
    id: number;
    verse_number: number;
    verse_key: string;
    hizb_number: number;
    rub_el_hizb_number: number;
    ruku_number: number;
    manzil_number: number;
    sajdah_number: number | null;
    page_number: number;
    juz_number: number;
    words: GlyphWord[];
}

export interface PageGlyphData {
    verses: GlyphVerse[];
    pagination: {
        per_page: number;
        current_page: number;
        next_page: number | null;
        total_pages: number;
        total_records: number;
    };
}

const API_BASE_URL = 'https://api.quran.com/api/v4';

/**
 * Fetch glyph data for a specific Quran page
 * @param pageNumber Page number (1-604)
 * @returns Promise with glyph verse data
 */
export async function fetchPageGlyphs(pageNumber: number): Promise<PageGlyphData> {
    if (pageNumber < 1 || pageNumber > 604) {
        throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/verses/by_page/${pageNumber}?words=true&word_fields=text_uthmani,code_v1,code_v2,v1_page,v2_page,line_number,page_number&per_page=50`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch page ${pageNumber}:`, error);
        throw error;
    }
}

/**
 * Fetch glyph data for a specific chapter (surah)
 * @param chapterNumber Chapter number (1-114)
 * @returns Promise with glyph verse data
 */
export async function fetchChapterGlyphs(chapterNumber: number): Promise<PageGlyphData> {
    if (chapterNumber < 1 || chapterNumber > 114) {
        throw new Error(`Invalid chapter number: ${chapterNumber}. Must be between 1 and 114.`);
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/verses/by_chapter/${chapterNumber}?words=true&word_fields=text_uthmani,code_v1,code_v2,v1_page,v2_page,line_number,page_number&per_page=300`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch chapter ${chapterNumber}:`, error);
        throw error;
    }
}

/**
 * Get the font family name for a given page number
 * @param pageNumber Page number (1-604)
 * @returns Font family name (e.g., "p1-v2")
 */
export function getGlyphFontFamily(pageNumber: number): string {
    return `p${pageNumber}-v2`;
}

/**
 * Check if a word is a verse end marker
 * @param word Glyph word object
 * @returns True if word is end marker
 */
export function isEndMarker(word: GlyphWord): boolean {
    return word.char_type_name === 'end';
}
