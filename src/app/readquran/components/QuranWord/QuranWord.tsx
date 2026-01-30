/**
 * Standalone Quran UI - QuranWord Component
 * Self-contained interactive word component with tooltips and highlighting
 */

import React, { useState, useCallback } from 'react';
import { classNames } from '../../utils';
import type { QuranWordProps } from '../../types';
import './QuranWord.scss';

export const QuranWord: React.FC<QuranWordProps> = ({
  word,
  isHighlighted = false,
  showTooltip = true,
  showWordByWord = false,
  showTransliteration = false,
  onClick,
  onHover,
  className,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(word);
    },
    [word, onClick]
  );

  const handleMouseEnter = useCallback(() => {
    setIsTooltipOpen(true);
    onHover?.(word);
  }, [word, onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsTooltipOpen(false);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(word);
      }
    },
    [word, onClick]
  );

  // Show tooltip content if enabled
  const hasTooltipContent =
    showTooltip && (word.translation || word.transliteration);

  return (
    <div
      className={classNames(
        'quran-word',
        isHighlighted && 'quran-word--highlighted',
        showWordByWord && 'quran-word--word-by-word',
        onClick && 'quran-word--clickable',
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyPress={handleKeyPress}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={
        word.translation || word.transliteration || word.text
      }
      data-word-location={word.location}
    >
      {/* Main Arabic text */}
      <span className="quran-word__text">{word.text}</span>

      {/* Tooltip (desktop hover) */}
      {hasTooltipContent && isTooltipOpen && !showWordByWord && (
        <div className="quran-word__tooltip">
          {word.transliteration && (
            <div className="quran-word__tooltip-transliteration">
              {word.transliteration}
            </div>
          )}
          {word.translation && (
            <div className="quran-word__tooltip-translation">
              {word.translation}
            </div>
          )}
        </div>
      )}

      {/* Word-by-word inline display */}
      {showWordByWord && (
        <div className="quran-word__inline">
          {showTransliteration && word.transliteration && (
            <div className="quran-word__inline-transliteration">
              {word.transliteration}
            </div>
          )}
          {word.translation && (
            <div className="quran-word__inline-translation">
              {word.translation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuranWord;
