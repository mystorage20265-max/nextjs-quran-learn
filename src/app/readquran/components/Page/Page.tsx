/**
 * Standalone Quran UI - Page Component
 * Displays a single Mushaf page with line-based rendering
 */

import React, { useMemo } from 'react';
import { MushafLine } from '../MushafLine';
import { groupLinesByVerses } from '../../utils/groupLinesByVerses';
import type { Verse } from '../../types';
import './Page.scss';

// ============================================================================
// TYPES
// ============================================================================

export interface PageProps {
  verses: Verse[];
  pageNumber: number;
  showTranslation?: boolean;
  onVerseClick?: (verseKey: string) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Page: React.FC<PageProps> = ({
  verses,
  pageNumber,
  showTranslation = false,
  onVerseClick,
  className = '',
}) => {
  // Group words by lines for Mushaf layout
  const lines = useMemo(() => {
    if (!verses || verses.length === 0) {
      return {};
    }
    return groupLinesByVerses(verses);
  }, [verses]);

  if (!verses || verses.length === 0) {
    return null;
  }

  // Check if page should use center alignment (e.g., Al-Fat iha - page 1)
  const isCenterAlignedPage = pageNumber === 1;

  return (
    <div className={`quran-page ${className}`} data-page={pageNumber}>
      <div className="quran-page__content">
        {/* Render lines */}
        <div className="quran-page__lines">
          {Object.keys(lines).map((lineKey, lineIndex) => (
            <MushafLine
              key={lineKey}
              lineKey={lineKey}
              words={lines[lineKey]}
              isCenterAligned={isCenterAlignedPage}
            />
          ))}
        </div>

        {/* Translation Section (if enabled) */}
        {showTranslation && (
          <div className="quran-page__translations">
            {verses.map((verse) => (
              <div
                key={verse.verseKey}
                className="quran-page__translation"
                onClick={() => onVerseClick?.(verse.verseKey)}
              >
                <span className="verse-number">{verse.verseNumber}.</span>{' '}
                {verse.translations && verse.translations.length > 0 && (
                  <span className="translation-text">{verse.translations[0].text}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Page Number Footer */}
        <div className="quran-page__footer">
          <span className="page-number">{pageNumber}</span>
        </div>
      </div>
    </div>
  );
};

export default Page;
