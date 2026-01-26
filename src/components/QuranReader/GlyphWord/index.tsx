import React from 'react';
import classNames from 'classnames';
import { getFontFaceNameForPage, getWordText, QuranFont } from '@/utils/fontHelper';
import styles from './GlyphWord.module.scss';

export interface GlyphWordProps {
    /** Uthmani text (fallback) */
    text_uthmani: string;
    /** Code V1 glyph representation */
    code_v1?: string;
    /** Code V2 glyph representation */
    code_v2?: string;
    /** Page number for font selection */
    pageNumber: number;
    /** Selected font type */
    font?: QuranFont;
    /** Whether the page-specific font is loaded */
    isFontLoaded: boolean;
    /** Optional font scale (1-6) */
    fontScale?: number;
}

/**
 * GlyphWord Component
 * Renders a Quran word using page-specific glyph fonts with fallback
 */
const GlyphWord: React.FC<GlyphWordProps> = ({
    text_uthmani,
    code_v1,
    code_v2,
    pageNumber,
    font = 'code_v2',
    isFontLoaded,
    fontScale = 3,
}) => {
    // Get the appropriate word text based on font availability
    const wordText = getWordText(text_uthmani, code_v1, code_v2, font, isFontLoaded);

    // Get font family for this page
    const fontFamily = isFontLoaded
        ? getFontFaceNameForPage(pageNumber, 'v2')
        : 'KFGQPC Uthmanic Script HAFS';

    return (
        <span
            dangerouslySetInnerHTML={{ __html: wordText }}
            data-font-scale={fontScale}
            data-font={font}
            data-page={pageNumber}
            className={classNames(styles.styledWord, {
                [styles.fallbackText]: !isFontLoaded,
            })}
            style={{ fontFamily }}
        />
    );
};

export default GlyphWord;
