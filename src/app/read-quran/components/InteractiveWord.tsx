'use client';

import { useState, useRef, useEffect } from 'react';
import { Word } from '../lib/api';

interface InteractiveWordProps {
    word: Word;
    onPlayAudio?: (wordId: number) => void;
}

export default function InteractiveWord({ word, onPlayAudio }: InteractiveWordProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
    const wordRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Handle click to pin/unpin tooltip
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPinned(!isPinned);
        setShowTooltip(!isPinned);
    };

    // Handle mouse enter for desktop hover
    const handleMouseEnter = () => {
        if (!isPinned) {
            setShowTooltip(true);
        }
    };

    // Handle mouse leave for desktop hover
    const handleMouseLeave = () => {
        if (!isPinned) {
            setShowTooltip(false);
        }
    };

    // Calculate tooltip position to avoid viewport edges
    useEffect(() => {
        if (showTooltip && wordRef.current && tooltipRef.current) {
            const wordRect = wordRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            // Check if tooltip would go off top of screen
            if (wordRect.top - tooltipRect.height - 8 < 0) {
                setTooltipPosition('bottom');
            } else {
                setTooltipPosition('top');
            }
        }
    }, [showTooltip]);

    // Close pinned tooltips when clicking outside
    useEffect(() => {
        if (isPinned) {
            const handleClickOutside = (e: MouseEvent) => {
                if (
                    wordRef.current &&
                    tooltipRef.current &&
                    !wordRef.current.contains(e.target as Node) &&
                    !tooltipRef.current.contains(e.target as Node)
                ) {
                    setIsPinned(false);
                    setShowTooltip(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside as any);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchstart', handleClickOutside as any);
            };
        }
    }, [isPinned]);

    const translation = word.translation?.text || 'No translation';
    const transliteration = word.transliteration?.text || '';

    return (
        <span className="interactive-word-wrapper">
            <span
                ref={wordRef}
                className={`interactive-word ${showTooltip ? 'active' : ''}`}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                role="button"
                tabIndex={0}
                aria-label={`${word.text_uthmani}: ${translation}`}
            >
                {word.text_uthmani}
            </span>

            {showTooltip && (
                <div
                    ref={tooltipRef}
                    className={`word-tooltip ${tooltipPosition} ${isPinned ? 'pinned' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="word-tooltip-content">
                        <div className="word-tooltip-arabic">{word.text_uthmani}</div>
                        {transliteration && (
                            <div className="word-tooltip-transliteration">{transliteration}</div>
                        )}
                        <div className="word-tooltip-translation">{translation}</div>
                        {word.audio_url && onPlayAudio && (
                            <button
                                className="word-tooltip-audio-btn"
                                onClick={() => onPlayAudio(word.id)}
                                aria-label="Play word audio"
                            >
                                🔊 Play
                            </button>
                        )}
                    </div>
                    <div className={`word-tooltip-arrow ${tooltipPosition}`}></div>
                </div>
            )}
        </span>
    );
}
