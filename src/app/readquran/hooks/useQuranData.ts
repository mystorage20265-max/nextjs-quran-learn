/**
 * Standalone Quran UI - useQuranData Hook
 * Hook for fetching and caching Quran verses with pagination
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchVersesByChapter,
  fetchVersesByPage,
  fetchVersesByJuz,
  transformApiVerse,
  type FetchVersesOptions,
  type ApiVersesResponse,
} from '../utils/apiUtils';
import type { Verse } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export enum QuranDataType {
  Chapter = 'chapter',
  Page = 'page',
  Juz = 'juz',
  Verse = 'verse',
}

export interface UseQuranDataOptions extends FetchVersesOptions {
  type?: QuranDataType;
  enabled?: boolean; // Whether to fetch immediately
}

export interface UseQuranDataReturn {
  verses: Verse[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
}

// ============================================================================
// CACHE
// ============================================================================

const cache = new Map<string, { data: Verse[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(type: QuranDataType, id: number, options: UseQuranDataOptions): string {
  const parts = [
    type,
    String(id),
    `trans:${(options.translations || []).join(',')}`,
    `page:${options.page || 1}`,
  ];
  return parts.join('|');
}

function getFromCache(key: string): Verse[] | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setInCache(key: string, data: Verse[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================================================
// HOOK
// ============================================================================

export function useQuranData(
  id: number,
  options: UseQuranDataOptions = {}
): UseQuranDataReturn {
  const {
    type = QuranDataType.Chapter,
    enabled = true,
    translations = [131], // Default: Sahih International
    wordTranslationLanguage = 'en',
    wordTransliteration = false,
    perPage = 10,
    page: initialPage = 1,
    reciter,
  } = options;

  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch verses based on type
   */
  const fetchVerses = useCallback(
    async (pageNum: number, append: boolean = false) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsLoading(true);
      setError(null);

      try {
        const fetchOptions: FetchVersesOptions = {
          translations,
          wordTranslationLanguage,
          wordTransliteration,
          perPage,
          page: pageNum,
          reciter,
        };

        // Check cache first
        const cacheKey = getCacheKey(type, id, { ...fetchOptions, page: pageNum });
        const cachedData = getFromCache(cacheKey);
        
        if (cachedData) {
          if (append) {
            setVerses((prev) => [...prev, ...cachedData]);
          } else {
            setVerses(cachedData);
          }
          setIsLoading(false);
          return;
        }

        // Fetch from API
        let response: ApiVersesResponse;
        
        switch (type) {
          case QuranDataType.Chapter:
            response = await fetchVersesByChapter(id, fetchOptions);
            break;
          case QuranDataType.Page:
            response = await fetchVersesByPage(id, fetchOptions);
            break;
          case QuranDataType.Juz:
            response = await fetchVersesByJuz(id, fetchOptions);
            break;
          default:
            throw new Error(`Unsupported data type: ${type}`);
        }

        if (signal.aborted) return;

        // Transform API verses to internal format
        const transformedVerses = response.verses.map(transformApiVerse);
        
        // Update cache
        setInCache(cacheKey, transformedVerses);

        // Update state
        if (append) {
          setVerses((prev) => [...prev, ...transformedVerses]);
        } else {
          setVerses(transformedVerses);
        }

        // Update pagination info
        if (response.pagination) {
          setCurrentPage(response.pagination.current_page);
          setTotalPages(response.pagination.total_pages);
          setHasMore(response.pagination.current_page < response.pagination.total_pages);
        } else {
          // No pagination (e.g., fetching all verses for a page)
          setHasMore(false);
        }
      } catch (err) {
        if (!signal.aborted) {
          const error = err instanceof Error ? err : new Error('Failed to fetch verses');
          setError(error);
          console.error('Error fetching Quran data:', error);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [id, type, translations, wordTranslationLanguage, wordTransliteration, perPage, reciter]
  );

  /**
   * Load initial data
   */
  useEffect(() => {
    if (enabled) {
      fetchVerses(initialPage, false);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, fetchVerses, initialPage]);

  /**
   * Load more verses (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchVerses(currentPage + 1, true);
  }, [hasMore, isLoading, currentPage, fetchVerses]);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    setCurrentPage(initialPage);
    setVerses([]);
    await fetchVerses(initialPage, false);
  }, [initialPage, fetchVerses]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback(
    async (pageNum: number) => {
      if (pageNum < 1 || pageNum > totalPages) return;
      setVerses([]);
      await fetchVerses(pageNum, false);
    },
    [totalPages, fetchVerses]
  );

  return {
    verses,
    isLoading,
    error,
    hasMore,
    currentPage,
    totalPages,
    loadMore,
    refresh,
    goToPage,
  };
}
