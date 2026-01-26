import React, { useEffect } from 'react';
import classNames from 'classnames';
import VerseText from '../VerseText';
import { GlyphWord as GlyphWordType } from '@/services/quranGlyphApi';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import styles from './Line.module.scss';

export interface LineProps {
    /** Unique key for this line (e.g., "Page1-Line9") */
    lineKey: string;
    /** Words in this line */
    words: GlyphWordType[];
    /** Verse key (e.g., "1:1") */
    verseKey: string;
    /** Page number */
    pageNumber: number;
    /** Chapter ID */
    chapterId: number;
    /** Hizb number */
    hizbNumber?: number;
    /** Whether this line is currently highlighted (during audio playback) */
    isHighlighted?: boolean;
    /** Callback when line becomes visible */
    onIntersection?: (verseKey: string) => void;
    /** Callback when auto-scroll is needed */
    onNeedScroll?: (verseKey: string) => void;
    /** Font size */
    fontSize?: number;
    /** Currently playing word */
    currentPlayingWord?: string;
    /** Word click handler */
    onWordClick?: (word: GlyphWordType) => void;
}

/**
 * Line Component
 * Represents a line of Quranic text with intersection observation
 * Based on Quran.com's Line component structure
 */
const Line: React.FC<LineProps> = ({
    lineKey,
    words,
    verseKey,
    pageNumber,
    chapterId,
    hizbNumber,
    isHighlighted = false,
    onIntersection,
    onNeedScroll,
    fontSize = 28,
    currentPlayingWord,
    onWordClick,
}) => {
    // Observe when this line enters viewport
    const ref = useIntersectionObserver<HTMLDivElement>(
        (isIntersecting) => {
            if (isIntersecting && onIntersection) {
                onIntersection(verseKey);
            }
        },
        { threshold: 0.5 }
    );

    // Auto-scroll when highlighted
    useEffect(() => {
        if (isHighlighted && onNeedScroll) {
            onNeedScroll(verseKey);
        }
    }, [isHighlighted, verseKey, onNeedScroll]);

    return (
        <div
            ref={ref}
            id={lineKey}
            data-verse-key={verseKey}
            data-page={pageNumber}
            data-chapter-id={chapterId}
            data-hizb={hizbNumber}
            className={classNames(styles.container, {
                [styles.highlighted]: isHighlighted,
            })}
        >
            <div className={styles.line}>
                <VerseText
                    words={words}
                    verseKey={verseKey}
                    isReadingMode={true}
                    isHighlighted={isHighlighted}
                    fontSize={fontSize}
                    currentPlayingWord={currentPlayingWord}
                    onWordClick={onWordClick}
                />
            </div>
        </div>
    );
};

export default Line;
