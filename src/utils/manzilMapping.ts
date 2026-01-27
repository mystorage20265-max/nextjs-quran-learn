/**
 * Manzil Mapping Utilities
 * Provides verse ranges for each of the 7 Manzils
 * Since Quran.com API doesn't have Manzil endpoints, we use predefined ranges
 */

export interface ManzilRange {
    manzilNumber: number;
    startVerse: string; // verse key format "chapter:verse"
    endVerse: string;
    startAbsolute: number; // absolute verse number (1-6236)
    endAbsolute: number;
}

/**
 * Manzil verse ranges (7 Manzils)
 * Source: https://en.wikipedia.org/wiki/Manzil_(Quran)
 */
export const MANZIL_RANGES: ManzilRange[] = [
    {
        manzilNumber: 1,
        startVerse: '1:1',     // Al-Fatihah 1
        endVerse: '4:147',      // An-Nisa 147
        startAbsolute: 1,
        endAbsolute: 640
    },
    {
        manzilNumber: 2,
        startVerse: '4:148',    // An-Nisa 148
        endVerse: '9:93',       // At-Tawbah 93
        startAbsolute: 641,
        endAbsolute: 1251
    },
    {
        manzilNumber: 3,
        startVerse: '9:94',     // At-Tawbah 94
        endVerse: '16:128',     // An-Nahl 128
        startAbsolute: 1252,
        endAbsolute: 2028
    },
    {
        manzilNumber: 4,
        startVerse: '17:1',     // Al-Isra 1
        endVerse: '25:77',      // Al-Furqan 77
        startAbsolute: 2029,
        endAbsolute: 2870
    },
    {
        manzilNumber: 5,
        startVerse: '26:1',     // Ash-Shu'ara 1
        endVerse: '36:83',      // Ya-Sin 83
        startAbsolute: 2871,
        endAbsolute: 3732
    },
    {
        manzilNumber: 6,
        startVerse: '37:1',     // As-Saffat 1
        endVerse: '49:18',      // Al-Hujurat 18
        startAbsolute: 3733,
        endAbsolute: 4630
    },
    {
        manzilNumber: 7,
        startVerse: '50:1',     // Qaf 1
        endVerse: '114:6',      // An-Nas 6
        startAbsolute: 4631,
        endAbsolute: 6236
    }
];

/**
 * Get Manzil range by Manzil number (1-7)
 */
export function getManzilRange(manzilNumber: number): ManzilRange {
    if (manzilNumber < 1 || manzilNumber > 7) {
        throw new Error(`Invalid Manzil number: ${manzilNumber}. Must be between 1 and 7.`);
    }

    return MANZIL_RANGES[manzilNumber - 1];
}

/**
 * Get all verse keys in a Manzil
 */
export function getManzilVerseKeys(manzilNumber: number): string[] {
    const range = getManzilRange(manzilNumber);
    const verseKeys: string[] = [];

    // Parse start and end
    const [startChapter, startVerse] = range.startVerse.split(':').map(Number);
    const [endChapter, endVerse] = range.endVerse.split(':').map(Number);

    // Helper: Get verses count per chapter
    const versesPerChapter = [
        7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
        123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
        112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
        34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
        54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
        60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
        14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
        28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
        29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
        15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
        11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
        5, 4, 5, 6
    ];

    for (let chapter = startChapter; chapter <= endChapter; chapter++) {
        const firstVerse = (chapter === startChapter) ? startVerse : 1;
        const lastVerse = (chapter === endChapter) ? endVerse : versesPerChapter[chapter - 1];

        for (let verse = firstVerse; verse <= lastVerse; verse++) {
            verseKeys.push(`${chapter}:${verse}`);
        }
    }

    return verseKeys;
}

/**
 * Get Manzil number for a given verse key
 */
export function getManzilForVerse(verseKey: string): number {
    const [chapter, verse] = verseKey.split(':').map(Number);

    for (let i = 0; i < MANZIL_RANGES.length; i++) {
        const range = MANZIL_RANGES[i];
        const [startChapter, startVerse] = range.startVerse.split(':').map(Number);
        const [endChapter, endVerse] = range.endVerse.split(':').map(Number);

        if (chapter > endChapter || (chapter === endChapter && verse > endVerse)) {
            continue;
        }

        if (chapter < startChapter || (chapter === startChapter && verse < startVerse)) {
            continue;
        }

        return range.manzilNumber;
    }

    throw new Error(`Verse ${verseKey} not found in any Manzil`);
}

/**
 * Get total verse count in a Manzil
 */
export function getManzilVerseCount(manzilNumber: number): number {
    const range = getManzilRange(manzilNumber);
    return range.endAbsolute - range.startAbsolute + 1;
}

export default {
    getManzilRange,
    getManzilVerseKeys,
    getManzilForVerse,
    getManzilVerseCount,
    MANZIL_RANGES,
};
