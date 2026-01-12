import React from 'react';

interface Chapter {
    id: number;
    name: string;
    nameArabic: string;
    nameTranslation: string;
    versesCount: number;
    revelationPlace: string;
}

interface SurahCardProps {
    chapter: Chapter;
    onClick: () => void;
}

export default function SurahCard({ chapter, onClick }: SurahCardProps) {
    return (
        <div className="mq-surah-card" onClick={onClick}>
            <div className="mq-surah-number">
                {chapter.id}
            </div>
            <div className="mq-surah-info">
                <div className="mq-surah-name-row">
                    <span className="mq-surah-name-en">{chapter.name}</span>
                    <span className="mq-surah-name-ar">{chapter.nameArabic}</span>
                </div>
                <div className="mq-surah-meta">
                    <span>{chapter.nameTranslation}</span>
                    <span>•</span>
                    <span>{chapter.versesCount} verses</span>
                    <span>•</span>
                    <span>{chapter.revelationPlace}</span>
                </div>
            </div>
        </div>
    );
}
