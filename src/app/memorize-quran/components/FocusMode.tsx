import React from 'react';

interface FocusModeProps {
    verseText: string;
    verseNumber: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onPrev: () => void;
    onNext: () => void;
    onClose: () => void;
}

export default function FocusMode({
    verseText,
    verseNumber,
    isPlaying,
    onPlayPause,
    onPrev,
    onNext,
    onClose
}: FocusModeProps) {
    return (
        <div className="focus-mode">
            <button className="focus-mode-close" onClick={onClose}>
                <i className="fas fa-times"></i> Exit Focus
            </button>

            <p className="focus-mode-verse">
                {verseText}
                <span className="verse-end"> ۝{verseNumber} </span>
            </p>

            <div className="focus-mode-controls">
                <button
                    className="bottom-player-btn secondary"
                    onClick={onPrev}
                    aria-label="Previous verse"
                >
                    <i className="fas fa-step-backward"></i>
                </button>

                <button
                    className="bottom-player-btn play"
                    onClick={onPlayPause}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                </button>

                <button
                    className="bottom-player-btn secondary"
                    onClick={onNext}
                    aria-label="Next verse"
                >
                    <i className="fas fa-step-forward"></i>
                </button>
            </div>
        </div>
    );
}
