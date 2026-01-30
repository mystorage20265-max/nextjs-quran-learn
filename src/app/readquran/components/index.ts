/**
 * Standalone Quran UI - Component Exports
 * Barrel export for all components
 */

// Core components
export { VerseCard } from './VerseCard';
export { QuranWord } from './QuranWord';
export { TranslationText } from './TranslationText/TranslationText';
export { WaqfMark } from './WaqfMark/WaqfMark';

// Layout components
export { TopActions } from './TopActions/TopActions';
export { BottomActions } from './BottomActions/BottomActions';

// Reading views
export { Mushaf ReadingView } from './MushafReadingView/MushafReadingView';
export { QuranReader } from './QuranReader';

// Page components
export { Page } from './Page';
export { PageNavigation } from './PageNavigation';

// Type exports
export type { VerseCardProps } from '../types';
export type { QuranWordProps } from '../types';
export type { WaqfMarkProps } from '../types';
export type { PageProps } from './Page';
export type { PageNavigationProps } from './PageNavigation';
