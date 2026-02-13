import React, { useState } from 'react';
import { SurahCard } from '../SurahCard/SurahCard'; // Ensure correct import path
import './SurahGrid.scss';

interface Chapter {
    id: number;
    name: string;      // English Name
    nameArabic: string;
    versesCount: number;
    revelationPlace: string;
}

interface SurahGridProps {
    chapters: Chapter[];
    selectedChapterId: number;
    onSelectChapter: (id: number) => void;
}

export const SurahGrid: React.FC<SurahGridProps> = ({
    chapters,
    selectedChapterId,
    onSelectChapter,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChapters = chapters.filter(chapter =>
        chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.id.toString().includes(searchQuery)
    );

    return (
        <div className="surah-grid-container">
            <div className="surah-grid-header">
                <h3>Select Surah</h3>
                <div className="surah-search">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Find Surah..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="surah-grid">
                {filteredChapters.map(chapter => (
                    <SurahCard
                        key={chapter.id}
                        number={chapter.id}
                        nameEnglish={chapter.name}
                        nameArabic={chapter.nameArabic}
                        versesCount={chapter.versesCount}
                        revelationPlace={chapter.revelationPlace}
                        onClick={() => onSelectChapter(chapter.id)}
                        isActive={selectedChapterId === chapter.id}
                    />
                ))}
            </div>

            {filteredChapters.length === 0 && (
                <div className="no-results">
                    No surahs found matching "<b>{searchQuery}</b>"
                </div>
            )}
        </div>
    );
};
