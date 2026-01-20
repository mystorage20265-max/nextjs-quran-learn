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

    return (
        <div className="focus-mode">
            {/* Header with Exit and Test Mode */}
            <div className="focus-mode-header">
                <button className="focus-mode-close" onClick={onClose}>
                    <i className="fas fa-times"></i> Exit
                </button>
                <div className="focus-mode-verse-num">
                    Verse {verseNumber}
                </div>
                <button
                    className={`focus-mode-test-btn ${isTestMode ? 'active' : ''}`}
                    onClick={() => setIsTestMode(!isTestMode)}
                >
                    <i className={`fas fa-eye${isTestMode ? '-slash' : ''}`}></i>
                    {isTestMode ? 'Show' : 'Hide'}
                </button>
            </div>

            {/* Main Content - Verse */}
            <div className="focus-mode-content">
                <div className={`focus-mode-verse-wrapper ${isTestMode ? 'is-testing' : ''}`}>
                    <p className="focus-mode-verse">
                        {verseText}
                        <span className="verse-end-mark"> ۝{verseNumber} </span>
                    </p>
                </div>

                {/* Repeat Progress Dots */}
                <div className="focus-mode-repeat-progress">
                    <div className="repeat-dot-container">
                        {Array.from({ length: repeatCount }).map((_, i) => (
                            <div
                                key={i}
                                className={`repeat-dot ${i < currentRepeat ? 'completed' : ''} ${i === currentRepeat - 1 && isPlaying ? 'active' : ''}`}
                            ></div>
                        ))}
                    </div>
                    <span className="repeat-text">{currentRepeat}/{repeatCount}</span>
                </div>
            </div>

            {/* Footer - Controls */}
            <div className="focus-mode-footer">
                <button className="focus-ctrl-btn" onClick={onPrev}>
                    <i className="fas fa-step-backward"></i>
                </button>
                <button className="focus-ctrl-btn play" onClick={onPlayPause}>
                    <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                </button>
                <button className="focus-ctrl-btn" onClick={onNext}>
                    <i className="fas fa-step-forward"></i>
                </button>
            </div>
        </div>
    );
}
