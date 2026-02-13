import React from 'react';
import './SurahCard.scss';

interface SurahCardProps {
    number: number;
    nameEnglish: string;
    nameArabic: string;
    versesCount: number;
    revelationPlace: string;
    onClick: () => void;
    isActive?: boolean;
}

export const SurahCard: React.FC<SurahCardProps> = ({
    number,
    nameEnglish,
    nameArabic,
    versesCount,
    revelationPlace,
    onClick,
    isActive = false,
}) => {
    return (
        <button
            className={`surah-card-btn ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="surah-number">
                {number}
            </div>

            <div className="surah-details">
                <div className="surah-header">
                    <span className="surah-name-en">{nameEnglish}</span>
                    <span className="surah-name-ar">{nameArabic}</span>
                </div>

                <div className="surah-meta">
                    <span className="surah-meaning">
                        {revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'}
                    </span>
                    <span className="surah-verses">
                        {versesCount} Verses
                    </span>
                </div>
            </div>
        </button>
    );
};
