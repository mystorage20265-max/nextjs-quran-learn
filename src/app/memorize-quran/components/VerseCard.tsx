import React from 'react';

interface Verse {
    id: number;
    verseKey: string;
    verseNumber: number;
    textUthmani: string;
    translation: string;
}

interface VerseCardProps {
    verse: Verse;
    index: number;
    isActive: boolean;
    isHideMode: boolean;
    isRevealed: boolean;
    onPlay: () => void;
    onReveal: () => void;
}

export default function VerseCard({
    verse,
    index,
    isActive,
    isHideMode,
    isRevealed,
    onPlay,
    onReveal
}: VerseCardProps) {
    const cardClass = `verse-card ${isActive ? 'active' : ''} ${isHideMode ? 'hidden-mode' : ''} ${isRevealed ? 'revealed' : ''}`;

    return (
        <article className={cardClass} onClick={onPlay}>
            <div className="verse-header">
                <span className="verse-number">{verse.verseNumber}</span>
                <button
                    className="verse-play-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay();
                    }}
                    aria-label={`Play verse ${verse.verseNumber}`}
                >
                    <i className="fas fa-play"></i>
                </button>
            </div>

            <p className="verse-arabic">
                {verse.textUthmani}
                <span className="verse-end"> ۝ </span>
            </p>

            {isHideMode && !isRevealed && (
                <button
                    className="reveal-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onReveal();
                    }}
                >
                    <i className="fas fa-eye"></i> Reveal
                </button>
            )}

            <p className="verse-translation">{verse.translation}</p>
        </article>
    );
}
