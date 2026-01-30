/**
 * Standalone Quran UI - Page Navigation Component
 * Navigation controls for moving between Mushaf pages
 */

import React from 'react';
import './PageNavigation.scss';

// ============================================================================
// TYPES
// ============================================================================

export interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onPageSelect?: (page: number) => void;
  showPageInput?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onPageSelect,
  showPageInput = false,
  className = '',
}) => {
  const [inputPage, setInputPage] = React.useState(String(currentPage));

  React.useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage, 10);
    if (pageNum >= 1 && pageNum <= totalPages && onPageSelect) {
      onPageSelect(pageNum);
    } else {
      setInputPage(String(currentPage));
    }
  };

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className={`page-navigation ${className}`}>
      <div className="page-navigation__container">
        {/* Previous Button */}
        <button
          type="button"
          className="page-navigation__button page-navigation__button--prev"
          onClick={onPrevious}
          disabled={!hasPrevious}
          aria-label="Previous page"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Previous</span>
        </button>

        {/* Page Info/Input */}
        {showPageInput && onPageSelect ? (
          <form onSubmit={handlePageSubmit} className="page-navigation__input-form">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={inputPage}
              onChange={handlePageInput}
              className="page-navigation__input"
              aria-label="Page number"
            />
            <span className="page-navigation__total">of {totalPages}</span>
          </form>
        ) : (
          <div className="page-navigation__info">
            <span className="page-navigation__current">{currentPage}</span>
            <span className="page-navigation__separator">/</span>
            <span className="page-navigation__total">{totalPages}</span>
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          className="page-navigation__button page-navigation__button--next"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next page"
        >
          <span>Next</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M7.5 5L12.5 10L7.5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Keyboard Hint */}
      <div className="page-navigation__hint">
        <span>Use ↑↓ arrow keys to navigate</span>
      </div>
    </div>
  );
};

export default PageNavigation;
