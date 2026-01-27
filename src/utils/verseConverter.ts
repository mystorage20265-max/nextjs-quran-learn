/**
 * Verse Number Conversion Utilities
 * Converts between absolute verse numbers (1-6236) and verse keys (e.g., "2:255")
 */

// Total verses per chapter (114 chapters)
const VERSES_PER_CHAPTER = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, // 1-10
    123, 111, 43, 52, 99, 128, 111, 110, 98, 135,  // 11-20
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60,     // 21-30
    34, 30, 73, 54, 45, 83, 182, 88, 75, 85,       // 31-40
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45,        // 41-50
    60, 49, 62, 55, 78, 96, 29, 22, 24, 13,        // 51-60
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44,        // 61-70
    28, 28, 20, 56, 40, 31, 50, 40, 46, 42,        // 71-80
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20,        // 81-90
    15, 21, 11, 8, 8, 19, 5, 8, 8, 11,             // 91-100
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3,                 // 101-110
    5, 4, 5, 6                                      // 111-114
];

/**
 * Convert absolute verse number (1-6236) to verse key (e.g., "2:255")
 */
export function absoluteToVerseKey(absoluteNumber: number): string {
    if (absoluteNumber < 1 || absoluteNumber > 6236) {
        throw new Error(`Invalid absolute verse number: ${absoluteNumber}. Must be between 1 and 6236.`);
    }

    let remaining = absoluteNumber;

    for (let chapter = 0; chapter < VERSES_PER_CHAPTER.length; chapter++) {
        const versesInChapter = VERSES_PER_CHAPTER[chapter];

        if (remaining <= versesInChapter) {
            return `${chapter + 1}:${remaining}`;
        }

        remaining -= versesInChapter;
    }

    throw new Error(`Failed to convert absolute number ${absoluteNumber}`);
}

/**
 * Convert verse key (e.g., "2:255") to absolute verse number
 */
export function verseKeyToAbsolute(verseKey: string): number {
    const [chapterStr, verseStr] = verseKey.split(':');
    const chapter = parseInt(chapterStr, 10);
    const verse = parseInt(verseStr, 10);

    if (chapter < 1 || chapter > 114) {
        throw new Error(`Invalid chapter number: ${chapter}. Must be between 1 and 114.`);
    }

    if (verse < 1 || verse > VERSES_PER_CHAPTER[chapter - 1]) {
        throw new Error(`Invalid verse number: ${verse} for chapter ${chapter}.`);
    }

    let absolute = 0;

    // Sum all verses from chapters before this one
    for (let i = 0; i < chapter - 1; i++) {
        absolute += VERSES_PER_CHAPTER[i];
    }

    // Add the verse number in this chapter
    absolute += verse;

    return absolute;
}

/**
 * Get verse count for a specific chapter
 */
export function getChapterVerseCount(chapterNumber: number): number {
    if (chapterNumber < 1 || chapterNumber > 114) {
        throw new Error(`Invalid chapter number: ${chapterNumber}`);
    }
    return VERSES_PER_CHAPTER[chapterNumber - 1];
}

/**
 * Get total verse count in Quran
 */
export function getTotalVerseCount(): number {
    return 6236;
}

/**
 * Validate verse key format
 */
export function isValidVerseKey(verseKey: string): boolean {
    const regex = /^\d{1,3}:\d{1,3}$/;
    if (!regex.test(verseKey)) {
        return false;
    }

    try {
        verseKeyToAbsolute(verseKey);
        return true;
    } catch {
        return false;
    }
}

/**
 * Parse verse reference (supports multiple formats)
 * Examples: "2:255", "2-255", chapter 2, verse 255
 */
export function parseVerseReference(reference: string | number): { chapter: number; verse: number } {
    if (typeof reference === 'number') {
        // Absolute number
        const verseKey = absoluteToVerseKey(reference);
        const [chapter, verse] = verseKey.split(':').map(Number);
        return { chapter, verse };
    }

    // String format
    const normalized = reference.replace('-', ':');
    const [chapterStr, verseStr] = normalized.split(':');

    return {
        chapter: parseInt(chapterStr, 10),
        verse: parseInt(verseStr, 10)
    };
}

/**
 * Get verse range between two verse keys
 */
export function getVerseRange(startKey: string, endKey: string): string[] {
    const startAbsolute = verseKeyToAbsolute(startKey);
    const endAbsolute = verseKeyToAbsolute(endKey);

    const verseKeys: string[] = [];

    for (let i = startAbsolute; i <= endAbsolute; i++) {
        verseKeys.push(absoluteToVerseKey(i));
    }

    return verseKeys;
}

export default {
    absoluteToVerseKey,
    verseKeyToAbsolute,
    getChapterVerseCount,
    getTotalVerseCount,
    isValidVerseKey,
    parseVerseReference,
    getVerseRange,
};
