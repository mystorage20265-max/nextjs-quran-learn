/**
 * Adapter to bridge existing API with glyph-based components
 * Fetches both verse translations and glyph data, merging them
 */

import { fetchChapterGlyphs, GlyphVerse, GlyphWord } from '@/services/quranGlyphApi';
import { getAllVerses, VerseWithTranslation, getVersesWithWords } from './api';

export interface EnrichedVerse extends VerseWithTranslation {
    glyphWords?: GlyphWord[];
}

/**
 * Get verses with both translation and glyph data
 * @param chapterId Chapter number
 * @param translationId Translation identifier
 * @returns Verses with enriched glyph data
 */
export async function getVersesWithGlyphs(
    chapterId: number,
    translationId: string = 'en.sahih'
): Promise<GlyphVerse[]> {
    try {
        //Fetch glyph data from Quran.com API
        const glyphData = await fetchChapterGlyphs(chapterId);

        // Fetch translation data
        const verses = await getAllVerses(chapterId, translationId);

        // Merge glyph data with translations
        const enrichedVerses: GlyphVerse[] = glyphData.verses.map((glyphVerse) => {
            const matchingVerse = verses.find(v => v.verse_key === glyphVerse.verse_key);

            return {
                ...glyphVerse,
                translations: matchingVerse?.translations || [],
            } as GlyphVerse & { translations: any[] };
        });

        return enrichedVerses;
    } catch (error) {
        console.error('Error fetching verses with glyphs:', error);
        throw error;
    }
}

/**
 * Get verses with word-by-word and glyph data
 * @param chapterId Chapter number  
 * @param translationId Translation identifier
 * @returns Verses with word-by-word enrichment
 */
export async function getVersesWithWordsAndGlyphs(
    chapterId: number,
    translationId: string = '131'
): Promise<VerseWithTranslation[]> {
    try {
        // Use the existing getVersesWithWords which already includes word translations
        const verses = await getVersesWithWords(chapterId, translationId);

        // Optionally enrich with glyph data if needed
        const glyphData = await fetchChapterGlyphs(chapterId);

        // Merge glyph codes into word data
        const enriched = verses.map((verse) => {
            const glyphVerse = glyphData.verses.find(v => v.verse_key === verse.verse_key);

            if (glyphVerse && verse.words && verse.words.length > 0) {
                verse.words = verse.words.map((word, idx) => {
                    const glyphWord = glyphVerse.words[idx];
                    return {
                        ...word,
                        ...glyphWord, // Merge glyph properties (code_v1, code_v2, page_number, etc.)
                    };
                });
            }

            return verse;
        });

        return enriched;
    } catch (error) {
        console.error('Error fetching verses with words and glyphs:', error);
        // Fallback to just word data without glyphs
        return getVersesWithWords(chapterId, translationId);
    }
}
