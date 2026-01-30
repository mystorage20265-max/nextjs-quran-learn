/**
 * Standalone Quran UI - VerseCard Component
 * Self-contained verse display with all features
 */

import React, { useCallback } from 'react';
import { QuranWord } from '../QuranWord/QuranWord';
import { WaqfMark } from '../WaqfMark/WaqfMark';
import { TranslationText } from '../TranslationText/TranslationText';
import { TopActions } from '../TopActions/TopActions';
import { classNames } from '../../utils';
import { CharType } from '../../types';
import type { VerseCardProps, Word } from '../../types';
import './VerseCard.scss';

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  theme = 'dark',
  showTranslation = true,
  showWordByWord = false,
  showWordByWordTransliteration = false,
  isHighlighted = false,
  isBookmarked = false,
  onWordClick,
  onBookmarkToggle,
  onPlayClick,
  className,
}) => {
  const handleWordClick = useCallback(
    (word: Word) => {
      onWordClick?.(word);
    },
    [onWordClick]
  );

  const handleBookmarkToggle = useCallback(() => {
    onBookmarkToggle?.(verse.verseKey);
  }, [verse.verseKey, onBookmarkToggle]);

  const handlePlayClick = useCallback(() => {
    onPlayClick?.(verse.verseKey);
  }, [verse.verseKey, onPlayClick]);

  return (
    <div
      className={classNames(
        'verse-card',
        `theme-${theme}`,
        isHighlighted && 'verse-card--highlighted',
        showWordByWord && 'verse-card--word-by-word',
        className
      )}
      data-verse-key={verse.verseKey}
      data-verse-number={verse.verseNumber}
    >
      {/* Top Actions */}
      <TopActions
        verseNumber={verse.verseNumber}
        verseKey={verse.verseKey}
        isBookmarked={isBookmarked}
        onBookmarkToggle={onBookmarkToggle ? handleBookmarkToggle : undefined}
        onPlayClick={onPlayClick ? handlePlayClick : undefined}
      />

      {/* Arabic Text */}
      <div className="verse-card__arabic">
        {verse.words.map((word, index) => {
          // Handle pause marks separately
          if (word.charType === CharType.Pause) {
            return (
              <WaqfMark
                key={`${word.location}-${index}`}
                text={word.text}
              />
            );
          }

          // Regular words
          return (
            <QuranWord
              key={`${word.location}-${index}`}
              word={word}
              isHighlighted={false}
              showTooltip={!showWordByWord}
              showWordByWord={showWordByWord}
              showTransliteration={showWordByWordTransliteration}
              onClick={onWordClick ? handleWordClick : undefined}
            />
          );
        })}
      </div>

      {/* Translations */}
      {showTranslation && verse.translations && verse.translations.length > 0 && (
        <div className="verse-card__translations">
          {verse.translations.map((translation) => (
            <TranslationText
              key={translation.id}
              translation={translation}
              showResourceName={verse.translations.length > 1}
            />
          ))}
        </div>
      )}

      {/* Bottom Actions (Tabs) - Optional */}
      {/* Developers can add tabs via props if needed */}

      {/* Separator */}
      <div className="verse-card__separator" />
    </div>
  );
};

export default VerseCard;
