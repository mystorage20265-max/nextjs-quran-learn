import React from 'react';
import classNames from 'classnames';
import QuranWord from '../QuranWord';
import { GlyphWord as GlyphWordType } from '@/services/quranGlyphApi';
import { isCenterAlignedPage } from '@/utils/fontHelper';
import styles from './VerseText.module.scss';

export interface VerseTextProps {
    words: GlyphWordType[];
    isReadingMode?: boolean;
    isHighlighted?: boolean;
    fontSize?: number;
    verseKey: string;
    currentPlayingWord?: string; // Format: "verseKey:position"
    onWordClick?: (word: GlyphWordType) => void;
}

/**
 * VerseText Component
 * Renders the Arabic text of a verse with proper formatting and word-by-word support
 */
const VerseText: React.FC<VerseTextProps> = ({
    words,
    isReadingMode = false,
    isHighlighted = false,
    fontSize = 28,
    verseKey,
    currentPlayingWord,
    onWordClick,
}) => {
    if (!words || words.length === 0) {
        return null;
    }

    const firstWord = words[0];
    const pageNumber = firstWord?.page_number;
    const centerAlignPage = pageNumber ? isCenterAlignedPage(pageNumber) : false;

    // Determine if this is the first verse for SEO (h1 tag)
    const shouldShowH1ForSEO = verseKey === '1:1';
    const VerseTextContainer = shouldShowH1ForSEO ? 'h1' : 'div';

    return (
        <>
            {/* SEO-friendly hidden text for search engines */}
            <span className={styles.seoText}>
                {words.map((w) => w.text_uthmani).join(' ')}
            </span>

            <VerseTextContainer
                data-testid={`verse-arabic-${verseKey}`}
                className={classNames(styles.verseTextContainer, {
                    [styles.highlighted]: isHighlighted,
                })}
            >
                <div
                    translate="no"
                    dir="rtl"
                    className={classNames(styles.verseText, {
                        [styles.verseTextCenterAlign]: isReadingMode && centerAlignPage,
                        [styles.verseTextSpaceBetween]: isReadingMode && !centerAlignPage,
                    })}
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {words.map((word) => {
                        const wordLocation = `${word.verse_key}:${word.position}`;
                        const isWordHighlighted = currentPlayingWord === wordLocation;

                        return (
                            <QuranWord
                                key={word.id || wordLocation}
                                word={word}
                                isHighlighted={isWordHighlighted}
                                onWordClick={onWordClick}
                                showTooltip={!isReadingMode}
                            />
                        );
                    })}
                </div>
            </VerseTextContainer>
        </>
    );
};

export default VerseText;
