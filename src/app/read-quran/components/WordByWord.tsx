'use client';

import { useMemo } from 'react';

interface WordData {
    id: number;
    position: number;
    text_uthmani: string;
    text_imlaei?: string;
    char_type_name?: string;
}

// Audio segment: [word_position, start_ms, end_ms]
type AudioSegment = [number, number, number];

interface WordByWordProps {
    words: WordData[];
    segments?: AudioSegment[];
    currentTimeMs: number;
    isPlaying: boolean;
    verseNumber: number;
}

/**
 * Word-by-Word Arabic text with audio highlighting
 * Highlights each word as it's being recited
 */
export default function WordByWord({
    words,
    segments = [],
    currentTimeMs,
    isPlaying,
    verseNumber,
}: WordByWordProps) {

    // Find which word should be highlighted based on current time
    const highlightedWordPosition = useMemo(() => {
        if (!isPlaying || !segments || segments.length === 0) return -1;

        // Find the segment that matches current time
        for (const segment of segments) {
            const [wordPosition, startMs, endMs] = segment;
            if (currentTimeMs >= startMs && currentTimeMs <= endMs) {
                return wordPosition;
            }
        }

        return -1;
    }, [isPlaying, segments, currentTimeMs]);

    // Filter out "end" marker words (like verse end markers)
    const displayWords = useMemo(() => {
        return words.filter(word => word.char_type_name !== 'end');
    }, [words]);

    if (!displayWords || displayWords.length === 0) {
        return null;
    }

    return (
        <div className="word-by-word-container" dir="rtl">
            {displayWords.map((word) => (
                <span
                    key={word.id}
                    className={`quran-word ${highlightedWordPosition === word.position ? 'highlighted' : ''}`}
                    data-position={word.position}
                >
                    {word.text_uthmani}
                </span>
            ))}
        </div>
    );
}
