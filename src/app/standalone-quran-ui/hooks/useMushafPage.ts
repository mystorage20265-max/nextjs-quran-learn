/**
 * Standalone Quran UI - useMushafPage Hook
 * Custom hook for fetching and managing Mushaf page data
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchVersesByPage, transformApiVerse, type ApiVersesResponse, type FetchVersesOptions } from '../utils/apiUtils';
import type { Verse } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface UseMushafPageOptions {
  translations?: number[];
  wordTranslationLanguage?: string;
  initialPage?: number;
}

export interface UseMushafPageReturn {
  verses: Verse[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  goToPage: (pageNumber: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useMushafPage(options: UseMushafPageOptions = {}): UseMushafPageReturn {
  const {
    translations = [131], // Default: Sahih International
    wordTranslationLanguage = 'en',
    initialPage = 1,
  } = options;

  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Quran has 604 pages
  const totalPages = 604;

  /**
   * Fetch verses for a specific page
   */
  const fetchPage = useCallback(async (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchOptions: FetchVersesOptions = {
        translations,
        wordTranslationLanguage,
        wordFields: ['text_uthmani', 'verse_key', 'location', 'char_type_name', 'translation'],
      };

      const response: ApiVersesResponse = await fetchVersesByPage(pageNumber, fetchOptions);
      
      if (response.verses && response.verses.length > 0) {
        const transformedVerses = response.verses.map(transformApiVerse);
        setVerses(transformedVerses);
        setCurrentPage(pageNumber);
      } else {
        setVerses([]);
        setError(new Error('No verses found for this page'));
      }
    } catch (err) {
      console.error('Error fetching page:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch page'));
      setVerses([]);
    } finally {
      setIsLoading(false);
    }
  }, [translations, wordTranslationLanguage, totalPages]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      fetchPage(pageNumber);
    }
  }, [fetchPage, totalPages]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchPage(currentPage + 1);
    }
  }, [currentPage, fetchPage, totalPages]);

  /**
   * Go to previous page
   */
  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      fetchPage(currentPage - 1);
    }
  }, [currentPage, fetchPage]);

  /**
   * Refetch current page
   */
  const refetch = useCallback(() => {
    fetchPage(currentPage);
  }, [currentPage, fetchPage]);

  /**
   * Fetch initial page on mount
   */
  useEffect(() => {
    fetchPage(initialPage);
  }, []);// Only run on mount

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        previousPage();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        nextPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextPage, previousPage]);

  return {
    verses,
    currentPage,
    totalPages,
    isLoading,
    error,
    goToPage,
    nextPage,
    previousPage,
    refetch,
  };
}
