'use client';

/**
 * Enhanced ReadQuran Page
 * Premium Quran reading experience with advanced features
 */

import React, { useState, useEffect } from 'react';
import { Scheherazade_New, Amiri_Quran } from 'next/font/google';
import {
    VerseCard,
    useVerseState,
    useQuranData,
    useAllChapters,
    QuranDataType,
    type Word,
} from './index';
import { AudioPlayerBar } from './components/AudioPlayerBar/AudioPlayerBar';
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel';
import { SearchBar } from './components/SearchBar/SearchBar';
import { TafsirPanel } from './components/TafsirPanel/TafsirPanel';
// import { StickyToolbar } from './components/StickyToolbar/StickyToolbar'; // Hidden from UI
import { Dashboard } from './components/Dashboard/Dashboard';
import { useEnhancedAudio } from './hooks/useEnhancedAudio';
import { useSettings } from './hooks/useSettings';
import { useProgress } from './hooks/useProgress';
import './styles/tokens.scss';
import './styles.css';
import '../read-quran/styles/read-quran.css';

// Load Arabic fonts
const scheherazade = Scheherazade_New({
    weight: ['400', '700'],
    subsets: ['arabic'],
    display: 'swap',
});

const amiri = Amiri_Quran({
    weight: '400',
    subsets: ['arabic'],
    display: 'swap',
});

export default function ReadQuranPage() {
    // State management
    const audio = useEnhancedAudio();
    const { preferences, updatePreferences } = useSettings();
    const progress = useProgress();
    const verseState = useVerseState({
        theme: preferences.theme,
        showTranslation: preferences.showTranslation,
        showWordByWord: preferences.showWordByWord,
    });

    // UI State
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isTafsirOpen, setIsTafsirOpen] = useState(false);
    const [selectedVerseForTafsir, setSelectedVerseForTafsir] = useState<string | null>(null);

    // Fetch all chapters
    const { chapters } = useAllChapters();

    // Fetch chapter data with pagination
    const { verses, isLoading, error, currentPage, totalPages, goToPage } = useQuranData(selectedChapter, {
        type: QuranDataType.Chapter,
        translations: preferences.selectedTranslations,
        wordTranslationLanguage: 'en',
        wordTransliteration: preferences.showTransliteration,
        perPage: 10,
    });

    const currentChapter = chapters.find(ch => ch.id === selectedChapter);

    // Sync verseState with preferences
    useEffect(() => {
        verseState.updatePreferences({
            theme: preferences.theme,
            showTranslation: preferences.showTranslation,
            showWordByWord: preferences.showWordByWord,
        });
    }, [preferences]);

    // Setup playlist when verses load
    useEffect(() => {
        if (verses.length > 0) {
            const verseKeys = verses.map(v => v.verseKey);
            audio.setPlaylist(verseKeys);
        }
    }, [verses]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handlers
    const handleWordClick = (word: Word) => {
        if (word.audioUrl) {
            audio.playWord(word.audioUrl);
        }
    };

    const handleBookmarkToggle = (verseKey: string) => {
        verseState.toggleBookmark(verseKey);
    };

    const handlePlayClick = (verseKey: string) => {
        // Use audio.play which will automatically generate the URL via audioService
        audio.play(verseKey);
        progress.markAsRead(verseKey);
    };

    const handleTafsirClick = (verseKey: string) => {
        setSelectedVerseForTafsir(verseKey);
        setIsTafsirOpen(true);
    };

    const handleSearch = (verseKey: string) => {
        const [chapterStr] = verseKey.split(':');
        const chapterId = parseInt(chapterStr);

        if (chapterId !== selectedChapter) {
            setSelectedChapter(chapterId);
        }

        // Scroll to verse after a short delay
        setTimeout(() => {
            const verseElement = document.querySelector(`[data-verse-key="${verseKey}"]`);
            if (verseElement) {
                verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getFontClass = () => {
        return preferences.arabicFont === 'amiri' ? amiri.className : scheherazade.className;
    };

    return (
        <div
            className={`${getFontClass()} theme-${preferences.theme} readquran-page`}
            suppressHydrationWarning
            style={{
                '--arabic-font-size': `${preferences.arabicFontSize}px`,
                '--translation-font-size': `${preferences.translationFontSize}px`,
            } as React.CSSProperties}
        >
            <div className="readquran-container">
                {/* New Dashboard Layout */}
                <Dashboard
                    chapters={chapters}
                    selectedChapterId={selectedChapter}
                    onSelectChapter={(id) => setSelectedChapter(id)}
                    stats={{
                        versesRead: progress.totalVersesRead,
                        daysRead: progress.readingStreak, // Using streak as placeholder for days read
                        dayStreak: progress.readingStreak,
                        totalTime: progress.formattedReadingTime
                    }}
                />

                {/* Verses Display */}
                <div className="verses-container">
                    {isLoading && (
                        <div className="loading-state">
                            <div className="loading-spinner">⏳</div>
                            <p>Loading Quran verses...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <div className="error-icon">⚠️</div>
                            <p>Error loading verses: {error.message}</p>
                        </div>
                    )}

                    {!isLoading && !error && verses.length > 0 && (
                        <div className="verses-list">
                            {verses.map((verse) => (
                                <div key={verse.verseKey} data-verse-key={verse.verseKey}>
                                    <VerseCard
                                        verse={verse}
                                        theme={preferences.theme}
                                        showTranslation={preferences.showTranslation}
                                        showWordByWord={preferences.showWordByWord}
                                        showWordByWordTransliteration={preferences.showTransliteration}
                                        isHighlighted={audio.currentVerseKey === verse.verseKey}
                                        isBookmarked={verseState.bookmarkedVerses.has(verse.verseKey)}
                                        onWordClick={handleWordClick}
                                        onBookmarkToggle={handleBookmarkToggle}
                                        onPlayClick={handlePlayClick}
                                    />
                                    {/* Tafsir Button */}
                                    <button
                                        className="verse-tafsir-btn"
                                        onClick={() => handleTafsirClick(verse.verseKey)}
                                    >
                                        📚 Tafsir Ibn Kathir
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && !error && verses.length > 0 && totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                ← Previous
                            </button>
                            <div className="pagination-info">
                                Page {currentPage} of {totalPages}
                            </div>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Audio Player */}
            <AudioPlayerBar
                visible={audio.currentVerseKey !== null}
                verseInfo={currentChapter ? {
                    surahName: currentChapter.name,
                    verseNumber: audio.currentVerseKey ? parseInt(audio.currentVerseKey.split(':')[1]) : 0,
                } : undefined}
                onClose={audio.stop}
            />

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Search Bar */}
            <SearchBar
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSearch={handleSearch}
                chapters={chapters}
            />

            {/* Tafsir Panel */}
            <TafsirPanel
                isOpen={isTafsirOpen}
                verseKey={selectedVerseForTafsir}
                onClose={() => setIsTafsirOpen(false)}
            />

            {/* Sticky Toolbar - Hidden for cleaner Dashboard UI */}
            {/* <StickyToolbar
                onSearchClick={() => setIsSearchOpen(true)}
                onSettingsClick={() => setIsSettingsOpen(true)}
                onBookmarksClick={() => alert('Bookmarks feature coming soon!')}
                theme={preferences.theme}
                onThemeChange={(theme) => updatePreferences({ theme })}
            /> */}
        </div>
    );
}
