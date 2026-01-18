import React from 'react';

interface BottomPlayerProps {
    isPlaying: boolean;
    currentVerse: number;
    totalVerses: number;
    currentRepeat: number;
    repeatCount: number;
    onPlayPause: () => void;
    onPrev: () => void;
    onNext: () => void;
    onStop: () => void;
}

export default function BottomPlayer({
    isPlaying,
    currentVerse,
    totalVerses,
    currentRepeat,
    repeatCount,
    onPlayPause,
    onPrev,
    onNext,
    onStop
}: BottomPlayerProps) {
    if (totalVerses === 0) return null;

    return (
        <div className="bottom-player">
            <button
                className="bottom-player-btn secondary"
                onClick={onPrev}
                aria-label="Previous verse"
                disabled={currentVerse <= 0}
            >
                <i className="fas fa-step-backward"></i>
            </button>

            <button
                className="bottom-player-btn secondary"
                onClick={onStop}
                aria-label="Stop"
            >
                <i className="fas fa-stop"></i>
            </button>

            <button
                className="bottom-player-btn play"
                onClick={onPlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
            </button>

            <div className="bottom-player-info">
                <div className="bottom-player-verse">
                    Verse {currentVerse + 1} / {totalVerses}
                </div>
                <div className="bottom-player-progress">
                    Repeat {currentRepeat}/{repeatCount}
                </div>
            </div>

            <button
                className="bottom-player-btn secondary"
                onClick={onNext}
                aria-label="Next verse"
                disabled={currentVerse >= totalVerses - 1}
            >
                <i className="fas fa-step-forward"></i>
            </button>
        </div>
    );
}
