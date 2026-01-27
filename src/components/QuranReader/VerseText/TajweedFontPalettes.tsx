import React from 'react';

export interface TajweedFontPalettesProps {
    /** Page number for page-specific Tajweed colors */
    pageNumber: number;
    /** Selected Quran font */
    quranFont?: 'code_v1' | 'code_v2';
}

/**
 * TajweedFontPalettes Component
 * Injects page-specific CSS for Tajweed rule highlighting
 * Based on Quran.com's Tajweed color system
 */
const TajweedFontPalettes: React.FC<TajweedFontPalettesProps> = ({
    pageNumber,
    quranFont = 'code_v2',
}) => {
    // Only inject styles for Tajweed-enabled fonts
    if (quranFont !== 'code_v2') {
        return null;
    }

    // Generate CSS for page-specific Tajweed highlighting
    const tajweedStyles = `
        .page-${pageNumber} .tajweed-ghunnah {
            color: var(--tajweed-color-ghunnah);
        }
        .page-${pageNumber} .tajweed-idghaam {
            color: var(--tajweed-color-idghaam);
        }
        .page-${pageNumber} .tajweed-qalqalah {
            color: var(--tajweed-color-qalqalah);
        }
        .page-${pageNumber} .tajweed-ikhfa {
            color: var(--tajweed-color-ikhfa);
        }
        .page-${pageNumber} .tajweed-iqlab {
            color: var(--tajweed-color-iqlab);
        }
        .page-${pageNumber} .tajweed-madd {
            color: var(--tajweed-color-madd);
        }
        .page-${pageNumber} .tajweed-hamza-wasl {
            color: var(--tajweed-color-hamza-wasl);
        }
        .page-${pageNumber} .tajweed-silent {
            color: var(--tajweed-color-silent);
        }
    `;

    return <style dangerouslySetInnerHTML={{ __html: tajweedStyles }} />;
};

export default TajweedFontPalettes;
