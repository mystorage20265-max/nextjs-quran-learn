import React from 'react';
import Line from './Line';
import { GlyphWord as GlyphWordType, GlyphVerse } from '@/services/quranGlyphApi';
import styles from './ReadingView.module.scss';

export interface ReadingViewProps {
    /** Array of verses with glyph words */
    verses: GlyphVerse[];
    /** Currently playing verse number */
    currentVerse?: number | null;
    /** Font size for Arabic text */
    fontSize?: number;
    /** Callback when verse becomes visible */
    onVerseIntersection?: (verseKey: string) => void;
    /** Word click handler */
    onWordClick?: (word: GlyphWordType) => void;
}

/**
 * ReadingView Component
 * Displays verses in a continuous reading format (like mushaf pages)
 */
const ReadingView: React.FC<ReadingViewProps> = ({
    verses,
    currentVerse,
    fontSize = 28,
    onVerseIntersection,
    onWordClick,
}) => {
    const handleScroll = (verseKey: string) => {
        const element = document.querySelector(`[data-verse-key="${verseKey}"]`);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    };

    return (
        <div className={styles.container}>
            {verses.map((verse) => {
                const lineKey = `verse-${verse.verse_key}`;
                const isHighlighted = currentVerse === verse.verse_number;

                return (
                    <Line
                        key={lineKey}
                        lineKey={lineKey}
                        words={verse.words}
                        verseKey={verse.verse_key}
                        pageNumber={verse.page_number}
                        chapterId={parseInt(verse.verse_key.split(':')[0])}
                        hizbNumber={verse.hizb_number}
                        isHighlighted={isHighlighted}
                        onIntersection={onVerseIntersection}
                        onNeedScroll={handleScroll}
                        fontSize={fontSize}
                        onWordClick={onWordClick}
                    />
                );
            })}
        </div>
    );
};

export default ReadingView;
