/**
 * Standalone Quran UI - Main Entry Point
 * Export all components, hooks, types, and utilities
 */

// Components
export { VerseCard } from './components/VerseCard/VerseCard';
export { QuranWord } from './components/QuranWord/QuranWord';
export { WaqfMark } from './components/WaqfMark/WaqfMark';
export { TranslationText } from './components/TranslationText/TranslationText';
export { TopActions } from './components/TopActions/TopActions';
export { BottomActions } from './components/BottomActions/BottomActions';
export { QuranReader } from './components/QuranReader/QuranReader';
export { MushafReadingView } from './components/MushafReadingView/MushafReadingView';

// Hooks
export { useVerseState, usePersistedVerseState } from './hooks/useVerseState';
export type { UseVerseStateReturn } from './hooks/useVerseState';
export { useAudioPlayer, useAudioAutoScroll } from './hooks/useAudioPlayer';
export type { UseAudioPlayerReturn } from './hooks/useAudioPlayer';
export { useQuranData, QuranDataType } from './hooks/useQuranData';
export type { UseQuranDataReturn, UseQuranDataOptions } from './hooks/useQuranData';
export { useChapterInfo, useAllChapters } from './hooks/useChapterInfo';
export type { UseChapterInfoReturn, UseAllChaptersReturn, ChapterInfo } from './hooks/useChapterInfo';

// Types
export type {
  Word,
  Translation,
  Verse,
  VerseCardProps,
  QuranWordProps,
  TranslationTextProps,
  WaqfMarkProps,
  TopActionsProps,
  BottomActionsProps,
  AudioState,
  AudioControls,
  VerseState,
  VerseActions,
  ReadingPreferences,
  TabConfig,
  ThemeMode,
  ThemeConfig,
} from './types';

export { CharType, WaqfType } from './types';

// Utilities
export * from './utils';
