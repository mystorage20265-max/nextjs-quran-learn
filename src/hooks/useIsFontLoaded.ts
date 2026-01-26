import { useState, useEffect } from 'react';

/**
 * Hook to check if a page-specific glyph font has loaded
 * @param pageNumber Quran page number (1-604)
 * @returns boolean indicating if the font is loaded and ready
 */
export function useIsFontLoaded(pageNumber: number | undefined): boolean {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!pageNumber || typeof window === 'undefined') {
            setIsLoaded(false);
            return;
        }

        const fontFamily = `p${pageNumber}-v2`;

        // Check if font is already loaded
        if (document.fonts.check(`16px ${fontFamily}`)) {
            setIsLoaded(true);
            return;
        }

        // Wait for font to load
        document.fonts.load(`16px ${fontFamily}`).then(() => {
            setIsLoaded(true);
        }).catch((err) => {
            console.warn(`Failed to load font ${fontFamily}:`, err);
            setIsLoaded(false);
        });
    }, [pageNumber]);

    return isLoaded;
}
