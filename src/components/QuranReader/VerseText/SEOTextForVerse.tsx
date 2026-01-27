import React from 'react';
import { GlyphWord } from '@/services/quranGlyphApi';
import styles from './SEOTextForVerse.module.scss';

export interface SEOTextForVerseProps {
    /** Array of words in the verse */
    words: GlyphWord[];
}

/**
 * SEOTextForVerse Component
 * Renders hidden text for search engine optimization
 * Includes both Uthmani and simplified Arabic text
 * Based on Quran.com's SEO strategy
 */
const SEOTextForVerse: React.FC<SEOTextForVerseProps> = ({ words }) => {
    if (!words || words.length === 0) {
        return null;
    }

    // Extract Uthmani text
    const uthmaniText = words.map((word) => word.text_uthmani).join(' ');

    // Extract simplified text (if available)
    const simplifiedText = words
        .map((word) => (word as any).text_simple || word.text_uthmani)
        .join(' ');

    return (
        <>
            {/* Screen reader only - Uthmani text */}
            <span className={styles.srOnly} lang="ar">
                {uthmaniText}
            </span>

            {/* Screen reader only - Simplified text */}
            {simplifiedText !== uthmaniText && (
                <span className={styles.srOnly} lang="ar">
                    {simplifiedText}
                </span>
            )}
        </>
    );
};

export default SEOTextForVerse;
