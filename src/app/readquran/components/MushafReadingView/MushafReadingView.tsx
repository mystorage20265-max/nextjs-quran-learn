/**
 * Standalone Quran UI - Enhanced MushafReadingView Component
 * Now with page-based reading, navigation, and API integration
 */

import React from 'react';
import { useMushafPage } from '../../hooks/useMushafPage';
import { Page } from '../Page';
import { PageNavigation } from '../PageNavigation';
import { classNames } from '../../utils';
import type { ThemeMode } from '../../types';
import './MushafReadingView.scss';

// ============================================================================
// TYPES
// ============================================================================

export interface MushafReadingViewProps {
  initialPage?: number;
  theme?: ThemeMode;
  showTranslation?: boolean;
  showNavigation?: boolean;
  translations?: number[];
  wordTranslationLanguage?: string;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MushafReadingView: React.FC<MushafReadingViewProps> = ({
  initialPage = 1,
  theme = 'dark',
  showTranslation = true,
  showNavigation = true,
  translations = [131], // Sahih International
  wordTranslationLanguage = 'en',
  className,
}) => {
  const {
    verses,
    currentPage,
    totalPages,
    isLoading,
    error,
    goToPage,
    nextPage,
    previousPage,
  } = useMushafPage({
    initialPage,
    translations,
    wordTranslationLanguage,
  });

  /**
   * Handle verse click
   */
  const handleVerseClick = (verseKey: string) => {
    console.log('Verse clicked:', verseKey);
    // Can be extended to show verse details, play audio, etc.
  };

  /**
   * Render loading state
   */
  if (isLoading && verses.length === 0) {
    return (
      <div className={classNames('mushaf-reading', `theme-${theme}`, className)}>
        <div className="mushaf-reading__loading">
          <div className="mushaf-reading__spinner" />
          <p>Loading page {currentPage}...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error && verses.length === 0) {
    return (
      <div className={classNames('mushaf-reading', `theme-${theme}`, className)}>
        <div className="mushaf-reading__error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3>Failed to load page</h3>
          <p>{error.message}</p>
          <button onClick={() => goToPage(currentPage)} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('mushaf-reading', `theme-${theme}`, className)}>
      <div className="mushaf-reading__container">
        {/* Page Display */}
        <Page
          verses={verses}
          pageNumber={currentPage}
          showTranslation={showTranslation}
          onVerseClick={handleVerseClick}
        />

        {/* Loading Overlay for Page Transitions */}
        {isLoading && (
          <div className="mushaf-reading__page-loading">
            <div className="mushaf-reading__spinner" />
          </div>
        )}

        {/* Page Navigation */}
        {showNavigation && (
          <PageNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={previousPage}
            onNext={nextPage}
            onPageSelect={goToPage}
            showPageInput={true}
          />
        )}
      </div>
    </div>
  );
};

export default MushafReadingView;
