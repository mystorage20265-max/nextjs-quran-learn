/**
 * Standalone Quran UI - Verse State Hook
 * Self-contained state management for verse selection and display preferences
 */

import { useState, useCallback, useMemo } from 'react';
import type { VerseState, VerseActions, ReadingPreferences } from '../types';

export interface UseVerseStateReturn extends VerseState, VerseActions {
  preferences: ReadingPreferences;
  updatePreferences: (updates: Partial<ReadingPreferences>) => void;
  resetState: () => void;
}

const DEFAULT_PREFERENCES: ReadingPreferences = {
  theme: 'dark',
  fontScale: {
    arabic: 3,
    translation: 2,
  },
  showTranslation: true,
  showWordByWord: false,
  showWordByWordTransliteration: false,
  enableAudio: true,
  autoScroll: true,
};

export function useVerseState(initialPreferences?: Partial<ReadingPreferences>): UseVerseStateReturn {
  // Verse selection state
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  const [highlightedWordLocation, setHighlightedWordLocation] = useState<string | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(new Set());

  // Reading preferences
  const [preferences, setPreferences] = useState<ReadingPreferences>({
    ...DEFAULT_PREFERENCES,
    ...initialPreferences,
  });

  // Verse actions
  const selectVerse = useCallback((verseKey: string) => {
    setSelectedVerseKey(verseKey);
  }, []);

  const highlightWord = useCallback((wordLocation: string | null) => {
    setHighlightedWordLocation(wordLocation);
  }, []);

  const toggleBookmark = useCallback((verseKey: string) => {
    setBookmarkedVerses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(verseKey)) {
        newSet.delete(verseKey);
      } else {
        newSet.add(verseKey);
      }
      return newSet;
    });
  }, []);

  const setShowTranslation = useCallback((show: boolean) => {
    setPreferences((prev) => ({ ...prev, showTranslation: show }));
  }, []);

  const setShowWordByWord = useCallback((show: boolean) => {
    setPreferences((prev) => ({ ...prev, showWordByWord: show }));
  }, []);

  const setShowWordByWordTransliteration = useCallback((show: boolean) => {
    setPreferences((prev) => ({ ...prev, showWordByWordTransliteration: show }));
  }, []);

  const updatePreferences = useCallback((updates: Partial<ReadingPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setSelectedVerseKey(null);
    setHighlightedWordLocation(null);
    setBookmarkedVerses(new Set());
    setPreferences({ ...DEFAULT_PREFERENCES, ...initialPreferences });
  }, [initialPreferences]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // State
      selectedVerseKey,
      highlightedWordLocation,
      bookmarkedVerses,
      showTranslation: preferences.showTranslation,
      showWordByWord: preferences.showWordByWord,
      showWordByWordTransliteration: preferences.showWordByWordTransliteration,

      // Actions
      selectVerse,
      highlightWord,
      toggleBookmark,
      setShowTranslation,
      setShowWordByWord,
      setShowWordByWordTransliteration,

      // Preferences
      preferences,
      updatePreferences,
      resetState,
    }),
    [
      selectedVerseKey,
      highlightedWordLocation,
      bookmarkedVerses,
      preferences,
      selectVerse,
      highlightWord,
      toggleBookmark,
      setShowTranslation,
      setShowWordByWord,
      setShowWordByWordTransliteration,
      updatePreferences,
      resetState,
    ]
  );
}

/**
 * Local storage persistence hook
 */
export function usePersistedVerseState(storageKey: string = 'quran-ui-state'): UseVerseStateReturn {
  // Load initial state from localStorage
  const getInitialPreferences = (): Partial<ReadingPreferences> => {
    if (typeof window === 'undefined') return {};

    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load preferences from localStorage:', error);
      return {};
    }
  };

  const verseState = useVerseState(getInitialPreferences());

  // Persist preferences to localStorage whenever they change
  const updatePreferences = useCallback(
    (updates: Partial<ReadingPreferences>) => {
      verseState.updatePreferences(updates);

      if (typeof window !== 'undefined') {
        try {
          const newPreferences = { ...verseState.preferences, ...updates };
          localStorage.setItem(storageKey, JSON.stringify(newPreferences));
        } catch (error) {
          console.error('Failed to save preferences to localStorage:', error);
        }
      }
    },
    [verseState, storageKey]
  );

  return {
    ...verseState,
    updatePreferences,
  };
}
