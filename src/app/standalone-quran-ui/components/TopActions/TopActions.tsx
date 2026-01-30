/**
 * Standalone Quran UI - TopActions Component
 * Self-contained verse header with actions
 */

import React from 'react';
import { classNames, toArabicNumerals } from '../../utils';
import type { TopActionsProps } from '../../types';
import './TopActions.scss';

export const TopActions: React.FC<TopActionsProps> = ({
  verseNumber,
  verseKey,
  isBookmarked = false,
  onBookmarkToggle,
  onPlayClick,
  className,
}) => {
  return (
    <div className={classNames('top-actions', className)}>
      <div className="top-actions__left">
        <div className="top-actions__verse-number">
          <span className="top-actions__verse-number-arabic">
            {toArabicNumerals(verseNumber)}
          </span>
          <span className="top-actions__verse-number-latin">
            {verseNumber}
          </span>
        </div>
      </div>

      <div className="top-actions__right">
        {onPlayClick && (
          <button
            className="top-actions__button"
            onClick={onPlayClick}
            aria-label="Play verse audio"
            title="Play verse"
          >
            <svg
              className="top-actions__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        )}

        {onBookmarkToggle && (
          <button
            className={classNames(
              'top-actions__button',
              isBookmarked && 'top-actions__button--active'
            )}
            onClick={onBookmarkToggle}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
          >
            <svg
              className="top-actions__icon"
              viewBox="0 0 24 24"
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TopActions;
