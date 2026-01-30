/**
 * Standalone Quran UI - QuranReader Component
 * Main reader component with verse display, navigation, and controls
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VerseCard } from '../VerseCard/VerseCard';
import { useQuranData, QuranDataType } from '../../hooks/useQuranData';
import { useChapterInfo } from '../../hooks/useChapterInfo';
import { useVerseState } from '../../hooks/useVerseState';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { getVerseAudioUrl } from '../../utils/apiUtils';
import { classNames } from '../../utils';
import type { ThemeMode, Verse } from '../../types';
import './QuranReader.scss';

// ============================================================================
// TYPES
// ============================================================================

export interface QuranReaderProps {
  chapterId?: number;
  verseKey?: string;
  initialPage?: number;
  theme?: ThemeMode;
  translations?: number[];
  reciterId?: number;
  showTranslation?: boolean;
  showWordByWord?: boolean;
  showWordByWordTransliteration?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const QuranReader: React.FC<QuranReaderProps> = ({
  chapterId = 1, // Default: Al-Fatiha
  theme = 'dark',
  translations = [131], // Default: Sahih International
  reciterId = 7, // Default: Mishari Rashid al-`Afasy
  showTranslation = true,
  showWordByWord = false,
  showWordByWordTransliteration = false,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentChapter, setCurrentChapter] = useState(chapterId);

  // Hooks
  const verseState = useVerseState({
    theme,
    showTranslation,
    showWordByWord,
    showWordByWordTransliteration,
  });

  const audioPlayer = useAudioPlayer();

  const { chapterInfo, isLoading: isLoadingChapter } = useChapterInfo(currentChapter);

  const {
    verses,
    isLoading: isLoadingVerses,
    error,
  } = useQuranData(currentChapter, {
    type: QuranDataType.Chapter,
    translations,
    wordTranslationLanguage: 'en',
    wordTransliteration: showWordByWordTransliteration,
    perPage: 'all', // Load all verses at once
    reciter: reciterId,
  });

  /**
   * Handle word click
   */
  const handleWordClick = useCallback(
    (word: any) => {
      verseState.highlightWord(word.location);
      
      // Play word audio if available
      if (word.audio) {
        audioPlayer.playWord(word);
      }
    },
    [verseState, audioPlayer]
  );

  /**
   * Handle play verse
   */
  const handlePlayVerse = useCallback(
    (verseKey: string) => {
      const audioUrl = getVerseAudioUrl(verseKey, reciterId);
      audioPlayer.play(verseKey, audioUrl);
    },
    [audioPlayer, reciterId]
  );

  /**
   * Handle bookmark toggle
   */
  const handleBookmarkToggle = useCallback(
    (verseKey: string) => {
      verseState.toggleBookmark(verseKey);
    },
    [verseState]
  );

  /**
   * Navigate to previous chapter
   */
  const gotoPreviousChapter = useCallback(() => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentChapter]);

  /**
   * Navigate to next chapter
   */
  const gotoNextChapter = useCallback(() => {
    if (currentChapter < 114) {
      setCurrentChapter(currentChapter + 1);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentChapter]);

  /**
   * Scroll to top when chapter changes
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapter]);

  /**
   * Render loading state
   */
  if (isLoadingChapter || (isLoadingVerses && verses.length === 0)) {
    return (
      <div className={classNames('quran-reader', `theme-${theme}`, className)}>
        <div className="quran-reader__loading">
          <div className="quran-reader__spinner"></div>
          <p>Loading Quran...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className={classNames('quran-reader', `theme-${theme}`, className)}>
        <div className="quran-reader__error">
          <h3>Failed to load Quran data</h3>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('quran-reader', `theme-${theme}`, className)}>
      {/* Header */}
      <div className="quran-reader__header">
        <div className="quran-reader__chapter-info">
          <h1 className="quran-reader__chapter-name">
            {chapterInfo?.name || `Chapter ${currentChapter}`}
          </h1>
          <p className="quran-reader__chapter-meta">
            {chapterInfo && (
              <>
                <span>{chapterInfo.nameArabic}</span>
                <span className="separator">•</span>
                <span>{chapterInfo.versesCount} verses</span>
                <span className="separator">•</span>
                <span className="capitalize">{chapterInfo.revelationPlace}</span>
              </>
            )}
          </p>
        </div>

        <div className="quran-reader__navigation">
          <button
            className="nav-button"
            onClick={gotoPreviousChapter}
            disabled={currentChapter === 1}
            aria-label="Previous chapter"
          >
            ← Previous
          </button>
          <span className="chapter-number">
            {currentChapter} / 114
          </span>
          <button
            className="nav-button"
            onClick={gotoNextChapter}
            disabled={currentChapter === 114}
            aria-label="Next chapter"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Verses Container */}
      <div className="quran-reader__verses" ref={containerRef}>
        {verses.map((verse: Verse) => (
          <VerseCard
            key={verse.verseKey}
            verse={verse}
            theme={theme}
            showTranslation={verseState.showTranslation}
            showWordByWord={verseState.showWordByWord}
            isBookmarked={verseState.bookmarkedVerses.has(verse.verseKey)}
            onWordClick={handleWordClick}
            onBookmarkToggle={handleBookmarkToggle}
            onPlayClick={handlePlayVerse}
          />
        ))}

        {/* End of Chapter */}
        {verses.length > 0 && (
          <div className="quran-reader__end-of-chapter">
            <div className="divider"></div>
            <p>End of Chapter {currentChapter}</p>
            {currentChapter < 114 && (
              <button
                className="next-chapter-button"
                onClick={gotoNextChapter}
              >
                Continue to Chapter {currentChapter + 1}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
