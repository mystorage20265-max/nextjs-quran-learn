import React from 'react';
import './ContinueFloatingButton.scss';

interface ContinueFloatingButtonProps {
    surahName: string;
    verseNumber: number;
    onClick: () => void;
}

export const ContinueFloatingButton: React.FC<ContinueFloatingButtonProps> = ({
    surahName,
    verseNumber,
    onClick,
}) => {
    return (
        <button className="continue-floating-btn" onClick={onClick}>
            <span className="continue-text">Continue: </span>
            <span className="continue-location">
                <span className="surah">{surahName}</span>
                <span className="separator">·</span>
                <span className="ayah">Ayah {verseNumber}</span>
            </span>
            <span className="continue-arrow">→</span>
        </button>
    );
};
