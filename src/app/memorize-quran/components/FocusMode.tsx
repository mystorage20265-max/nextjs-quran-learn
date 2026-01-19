import React from 'react';

interface FocusModeProps {
    verseText: string;
    verseTranslation: string;
    verseNumber: number;
    isPlaying: boolean;
    currentRepeat: number;
    repeatCount: number;
    onPlayPause: () => void;
    onPrev: () => void;
    onNext: () => void;
    onClose: () => void;
}

export default function FocusMode({
    verseText,
    verseTranslation,
    verseNumber,
    isPlaying,
    currentRepeat,
    repeatCount,
    onPlayPause,
    onPrev,
    onNext,
    onClose
}: FocusModeProps) {
    const [isTestMode, setIsTestMode] = React.useState(false);
    const [showTranslation, setShowTranslation] = React.useState(false);

    return (
        <div className="focus-mode">
            <div className="focus-mode-header">
                <button className="focus-mode-close" onClick={onClose}>
                    <i className="fas fa-times"></i> Exit Focus
                </button>
            </div>

            <div className="focus-mode-content">
                <div className={`focus-mode-verse-wrapper ${isTestMode ? 'is-testing' : ''}`}>
                    <p className="focus-mode-verse">
                        {verseText}
                        <span className="verse-end"> ۝{verseNumber} </span>
                    </p>
                    {isTestMode && (
                        <button
                            className="reveal-btn"
                            onClick={() => setIsTestMode(false)}
                            style={{ opacity: 1 }}
                        >
                            <i className="fas fa-eye"></i> Reveal
                        </button>
                    )}
                </div>

                {showTranslation && (
                    <p className="focus-mode-translation">
                        {verseTranslation}
                    </p>
                )}

                <div className="focus-mode-repeat-progress">
                    <div className="repeat-dot-container">
                        {Array.from({ length: repeatCount }).map((_, i) => (
                            <div
                                key={i}
                                className={`repeat-dot ${i < currentRepeat ? 'completed' : ''} ${i === currentRepeat - 1 && isPlaying ? 'active' : ''}`}
                            ></div>
                        ))}
                    </div>
                    <span className="repeat-text">Repeat {currentRepeat}/{repeatCount}</span>
                </div>
            </div>

            <div className="focus-mode-footer">
                <div className="focus-mode-tools">
                    <button
                        className={`tool-btn ${isTestMode ? 'active' : ''}`}
                        onClick={() => setIsTestMode(!isTestMode)}
                        title="Test Mode (Blur Verse)"
                    >
                        <i className={`fas fa-eye${isTestMode ? '' : '-slash'}`}></i>
                        {isTestMode ? 'Learning' : 'Testing'}
                    </button>
                    <button
                        className={`tool-btn ${showTranslation ? 'active' : ''}`}
                        onClick={() => setShowTranslation(!showTranslation)}
                        title="Toggle Translation"
                    >
                        <i className="fas fa-language"></i>
                        Translation
                    </button>
                </div>

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
        </div>
    );
}
