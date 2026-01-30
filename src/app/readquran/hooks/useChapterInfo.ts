/**
 * Standalone Quran UI - useChapterInfo Hook
 * Hook for fetching chapter metadata and list of all chapters
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchChapterInfo, fetchAllChapters, type ApiChapterInfo } from '../utils/apiUtils';

// ============================================================================
// TYPES
// ============================================================================

export interface ChapterInfo {
  id: number;
  name: string;
  nameArabic: string;
  nameComplex: string;
  versesCount: number;
  revelationPlace: 'makkah' | 'madinah';
  revelationOrder: number;
  pages: number[];
  translatedName: string;
  bismillahPre: boolean;
}

export interface UseChapterInfoReturn {
  chapterInfo: ChapterInfo | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseAllChaptersReturn {
  chapters: ChapterInfo[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// ============================================================================
// CACHE
// ============================================================================

const chapterCache = new Map<number, { data: ChapterInfo; timestamp: number }>();
const allChaptersCache: { data: ChapterInfo[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour (chapter data rarely changes)

function transformChapterInfo(apiChapter: ApiChapterInfo): ChapterInfo {
  return {
    id: apiChapter.id,
    name: apiChapter.name_simple,
    nameArabic: apiChapter.name_arabic,
    nameComplex: apiChapter.name_complex,
    versesCount: apiChapter.verses_count,
    revelationPlace: apiChapter.revelation_place as 'makkah' | 'madinah',
    revelationOrder: apiChapter.revelation_order,
    pages: apiChapter.pages,
    translatedName: apiChapter.translated_name.name,
    bismillahPre: apiChapter.bismillah_pre,
  };
}

// ============================================================================
// SINGLE CHAPTER HOOK
// ============================================================================

export function useChapterInfo(chapterId: number): UseChapterInfoReturn {
  const [chapterInfo, setChapterInfo] = useState<ChapterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = chapterCache.get(chapterId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setChapterInfo(cached.data);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const apiChapter = await fetchChapterInfo(chapterId);
      const transformed = transformChapterInfo(apiChapter);

      // Update cache
      chapterCache.set(chapterId, { data: transformed, timestamp: Date.now() });

      setChapterInfo(transformed);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch chapter info');
      setError(error);
      console.error('Error fetching chapter info:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    chapterCache.delete(chapterId);
    await fetchData();
  }, [chapterId, fetchData]);

  return {
    chapterInfo,
    isLoading,
    error,
    refresh,
  };
}

// ============================================================================
// ALL CHAPTERS HOOK
// ============================================================================

export function useAllChapters(): UseAllChaptersReturn {
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      if (
        allChaptersCache.data &&
        Date.now() - allChaptersCache.timestamp < CACHE_DURATION
      ) {
        setChapters(allChaptersCache.data);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const apiChapters = await fetchAllChapters();
      const transformed = apiChapters.map(transformChapterInfo);

      // Update cache
      allChaptersCache.data = transformed;
      allChaptersCache.timestamp = Date.now();

      setChapters(transformed);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch chapters');
      setError(error);
      console.error('Error fetching all chapters:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    allChaptersCache.data = null;
    allChaptersCache.timestamp = 0;
    await fetchData();
  }, [fetchData]);

  return {
    chapters,
    isLoading,
    error,
    refresh,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get chapter name by ID (useful for quick lookups)
 */
export function getChapterNameById(chapterId: number, chapters: ChapterInfo[]): string {
  const chapter = chapters.find((ch) => ch.id === chapterId);
  return chapter ? chapter.name : `Chapter ${chapterId}`;
}

/**
 * Search chapters by name
 */
export function searchChapters(query: string, chapters: ChapterInfo[]): ChapterInfo[] {
  const lowerQuery = query.toLowerCase();
  return chapters.filter(
    (chapter) =>
      chapter.name.toLowerCase().includes(lowerQuery) ||
      chapter.nameArabic.includes(query) ||
      chapter.translatedName.toLowerCase().includes(lowerQuery) ||
      String(chapter.id) === query
  );
}

/**
 * Get chapters by revelation place
 */
export function getChaptersByRevelationPlace(
  place: 'makkah' | 'madinah',
  chapters: ChapterInfo[]
): ChapterInfo[] {
  return chapters.filter((chapter) => chapter.revelation_place === place);
}
