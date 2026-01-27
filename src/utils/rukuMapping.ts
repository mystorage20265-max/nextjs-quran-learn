/**
 * Ruku Mapping Utilities
 * Ruku (ركوع) are logical divisions within the Quran
 * Total: 556 Rukus across 114 chapters
 * Since Quran.com API doesn't support Ruku, we use predefined mappings
 */

export interface RukuRange {
    rukuNumber: number;
    chapter: number;
    startVerse: number;
    endVerse: number;
    verseKey: string; // Format: "chapter:startVerse-endVerse"
}

/**
 * Simplified Ruku mappings (first 50 for now - can be extended)
 * Format: [ruku#, chapter, startVerse, endVerse]
 */
const RUKU_DATA: [number, number, number, number][] = [
    // Al-Fatihah
    [1, 1, 1, 7],

    // Al-Baqarah
    [2, 2, 1, 20],
    [3, 2, 21, 29],
    [4, 2, 30, 39],
    [5, 2, 40, 46],
    [6, 2, 47, 59],
    [7, 2, 60, 61],
    [8, 2, 62, 71],
    [9, 2, 72, 82],
    [10, 2, 83, 86],
    [11, 2, 87, 96],
    [12, 2, 97, 103],
    [13, 2, 104, 112],
    [14, 2, 113, 121],
    [15, 2, 122, 129],
    [16, 2, 130, 141],
    [17, 2, 142, 147],
    [18, 2, 148, 151],
    [19, 2, 152, 163],
    [20, 2, 164, 167],
    [21, 2, 168, 176],
    [22, 2, 177, 182],
    [23, 2, 183, 188],
    [24, 2, 189, 196],
    [25, 2, 197, 210],
    [26, 2, 211, 216],
    [27, 2, 217, 221],
    [28, 2, 222, 228],
    [29, 2, 229, 237],
    [30, 2, 238, 242],
    [31, 2, 243, 248],
    [32, 2, 249, 253],
    [33, 2, 254, 257],
    [34, 2, 258, 260],
    [35, 2, 261, 266],
    [36, 2, 267, 273],
    [37, 2, 274, 281],
    [38, 2, 282, 283],
    [39, 2, 284, 286],

    // Ali 'Imran
    [40, 3, 1, 9],
    [41, 3, 10, 20],
    [42, 3, 21, 30],
    [43, 3, 31, 41],
    [44, 3, 42, 54],
    [45, 3, 55, 63],
    [46, 3, 64, 71],
    [47, 3, 72, 80],
    [48, 3, 81, 91],
    [49, 3, 92, 101],
    [50, 3, 102, 109],
];

/**
 * Get Ruku range by Ruku number
 * Note: Only first 50 Rukus mapped. Extend RUKU_DATA array for more.
 */
export function getRukuRange(rukuNumber: number): RukuRange | null {
    const data = RUKU_DATA.find(([ruku]) => ruku === rukuNumber);

    if (!data) {
        console.warn(`Ruku ${rukuNumber} not yet mapped. Please extend RUKU_DATA array.`);
        return null;
    }

    const [ruku, chapter, startVerse, endVerse] = data;

    return {
        rukuNumber: ruku,
        chapter,
        startVerse,
        endVerse,
        verseKey: `${chapter}:${startVerse}-${endVerse}`
    };
}

/**
 * Get all verse keys in a Ruku
 */
export function getRukuVerseKeys(rukuNumber: number): string[] {
    const range = getRukuRange(rukuNumber);

    if (!range) {
        return [];
    }

    const verseKeys: string[] = [];
    for (let verse = range.startVerse; verse <= range.endVerse; verse++) {
        verseKeys.push(`${range.chapter}:${verse}`);
    }

    return verseKeys;
}

/**
 * Get Ruku number for a given verse
 * Note: Only works for mapped Rukus
 */
export function getRukuForVerse(verseKey: string): number | null {
    const [chapter, verse] = verseKey.split(':').map(Number);

    for (const [rukuNum, rukuChapter, startVerse, endVerse] of RUKU_DATA) {
        if (rukuChapter === chapter && verse >= startVerse && verse <= endVerse) {
            return rukuNum;
        }
    }

    return null;
}

/**
 * Check if a Ruku is mapped
 */
export function isRukuMapped(rukuNumber: number): boolean {
    return RUKU_DATA.some(([ruku]) => ruku === rukuNumber);
}

/**
 * Get total number of mapped Rukus
 */
export function getMappedRukuCount(): number {
    return RUKU_DATA.length;
}

/**
 * WORKAROUND: Estimate Ruku by proportion
 * For unmapped Rukus, estimate based on chapter progress
 * Total Rukus: 556
 */
export function estimateRukuRange(rukuNumber: number): RukuRange | null {
    if (rukuNumber < 1 || rukuNumber > 556) {
        return null;
    }

    // If mapped, return exact range
    const mapped = getRukuRange(rukuNumber);
    if (mapped) {
        return mapped;
    }

    // Otherwise, provide a fallback warning
    console.warn(`Ruku ${rukuNumber} not precisely mapped. Consider adding to RUKU_DATA array.`);

    // Fallback: assume each Ruku ~11 verses (6236 verses / 556 rukus)
    // This is very approximate!
    const estimatedChapter = Math.ceil(rukuNumber / 4.87); // Rough estimate

    return {
        rukuNumber,
        chapter: Math.min(estimatedChapter, 114),
        startVerse: 1,
        endVerse: 10,
        verseKey: `${estimatedChapter}:1-10`
    };
}

export default {
    getRukuRange,
    getRukuVerseKeys,
    getRukuForVerse,
    isRukuMapped,
    getMappedRukuCount,
    estimateRukuRange,
};
