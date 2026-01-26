/**
 * Font Helper Utilities
 * Utilities for managing Quran glyph fonts
 */

export type QuranFont = 'code_v1' | 'code_v2';
export type FontScale = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Get the font family name for a specific page
 * @param pageNumber Page number (1-604)
 * @param version Font version ('v1' or 'v2')
 * @returns Font family name (e.g., 'p1-v2')
 */
export function getFontFaceNameForPage(pageNumber: number, version: 'v1' | 'v2' = 'v2'): string {
    return `p${pageNumber}-${version}`;
}

/**
 * Get CSS class name for font scaling
 * @param fontSize Font size value (16-48px typically)
 * @param isFontLoaded Whether the custom font is loaded
 * @returns CSS class name for font scaling
 */
export function getFontClassName(fontSize: number, isFontLoaded: boolean): string {
    // Map font size to scale (1-6)
    let scale: FontScale;
    if (fontSize <= 16) scale = 1;
    else if (fontSize <= 20) scale = 2;
    else if (fontSize <= 28) scale = 3;
    else if (fontSize <= 36) scale = 4;
    else if (fontSize <= 42) scale = 5;
    else scale = 6;

    return `quran-font-size-${scale}${isFontLoaded ? '' : '-fallback'}`;
}

/**
 * Get the word text based on available font
 * @param qpcUthmaniHafs Fallback Uthmani text
 * @param textCodeV1 Code V1 glyph
 * @param textCodeV2 Code V2 glyph
 * @param font Selected font type
 * @param isFontLoaded Whether custom font is loaded
 * @returns Text to render
 */
export function getWordText(
    qpcUthmaniHafs: string,
    textCodeV1: string | undefined,
    textCodeV2: string | undefined,
    font: QuranFont,
    isFontLoaded: boolean
): string {
    if (!isFontLoaded) {
        return qpcUthmaniHafs;
    }

    if (font === 'code_v2' && textCodeV2) {
        return textCodeV2;
    }

    if (font === 'code_v1' && textCodeV1) {
        return textCodeV1;
    }

    return qpcUthmaniHafs;
}

/**
 * Check if a page should be center-aligned (like Al-Fatihah)
 * @param pageNumber Page number
 * @returns True if page should be center-aligned
 */
export function isCenterAlignedPage(pageNumber: number): boolean {
    // Pages 1-2 (Al-Fatihah) are typically center-aligned
    // Add more pages as needed
    return pageNumber === 1 || pageNumber === 2;
}
