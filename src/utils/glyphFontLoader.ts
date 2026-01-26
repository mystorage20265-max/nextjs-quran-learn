/**
 * Dynamic Glyph Font Loader
 * Loads page-specific QPC V2 fonts on-demand from CDN
 */

const FONT_CDN_BASE = 'https://cdn.qurancdn.com/fonts';
const loadedFonts = new Set<number>();

/**
 * Dynamically load a glyph font for a specific page
 * @param pageNumber Page number (1-604)
 */
export function loadGlyphFont(pageNumber: number): Promise<void> {
    // Check if already loaded
    if (loadedFonts.has(pageNumber)) {
        return Promise.resolve();
    }

    const fontFamily = `p${pageNumber}-v2`;
    const fontUrl = `${FONT_CDN_BASE}/QCF_P${String(pageNumber).padStart(3, '0')}.woff2`;

    return new Promise((resolve, reject) => {
        // Create font-face dynamically
        const fontFace = new FontFace(fontFamily, `url(${fontUrl})`, {
            display: 'swap',
            unicodeRange: 'U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF',
        });

        fontFace.load()
            .then((loaded) => {
                document.fonts.add(loaded);
                loadedFonts.add(pageNumber);
                console.log(`✅ Loaded glyph font for page ${pageNumber}`);
                resolve();
            })
            .catch((error) => {
                console.error(`❌ Failed to load glyph font for page ${pageNumber}:`, error);
                reject(error);
            });
    });
}

/**
 * Preload fonts for multiple pages
 * @param pageNumbers Array of page numbers to preload
 */
export async function preloadGlyphFonts(pageNumbers: number[]): Promise<void> {
    const uniquePages = [...new Set(pageNumbers)];
    const loadPromises = uniquePages.map(page => loadGlyphFont(page).catch(err => {
        console.warn(`Skipping page ${page} due to error:`, err);
    }));

    await Promise.all(loadPromises);
}

/**
 * Get all unique page numbers from verse data
 * @param verses Array of verses with word data
 * @returns Array of unique page numbers
 */
export function extractPageNumbers(verses: any[]): number[] {
    const pages = new Set<number>();

    verses.forEach(verse => {
        if (verse.words && Array.isArray(verse.words)) {
            verse.words.forEach((word: any) => {
                const page = word.v2_page || word.v1_page || word.page_number;
                if (page) {
                    pages.add(page);
                }
            });
        }
    });

    return Array.from(pages);
}

/**
 * Check if a font is already loaded
 * @param pageNumber Page number to check
 * @returns True if font is loaded
 */
export function isFontLoaded(pageNumber: number): boolean {
    return loadedFonts.has(pageNumber);
}

/**
 * Clear loaded fonts cache (useful for testing)
 */
export function clearFontCache(): void {
    loadedFonts.clear();
}
