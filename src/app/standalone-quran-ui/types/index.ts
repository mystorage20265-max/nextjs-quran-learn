/**
 * Standalone Quran UI Component Library - Type Definitions
 * Self-contained types for all components
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface Word {
  id: number;
  position: number;
  text: string;
  textUthmani?: string;
  translation?: string;
  transliteration?: string;
  audioUrl?: string;
  verseKey: string;
  location: string;
  charType: CharType;
  pageNumber?: number;
  hizbNumber?: number;
  codeV1?: string;
  codeV2?: string;
}

export enum CharType {
  Word = 'word',
  End = 'end',
  Pause = 'pause',
}

export interface Translation {
  id: number;
  text: string;
  languageId: number;
  languageName: string;
  resourceName: string;
}

export interface Verse {
  id: number;
  verseNumber: number;
  verseKey: string;
  chapterId: number;
  pageNumber: number;
  hizbNumber: number;
  juzNumber: number;
  words: Word[];
  translations: Translation[];
  audioUrl?: string;
}

// ============================================================================
// WAQF (PAUSE MARKS) TYPES
// ============================================================================

export enum WaqfType {
  MustPause = 'meem',
  BetterToPause = 'sad-lam',
  Permissible = 'jeem',
  BetterToContinue = 'sad',
  MustContinue = 'ta',
  ProhibitedPause = 'la',
  SilentPause = 'seen',
  NonPause = '',
}

// ============================================================================
// AUDIO TYPES
// ============================================================================

export interface AudioState {
  isPlaying: boolean;
  currentVerseKey: string | null;
  currentWordLocation: string | null;
  audioUrl: string | null;
  playbackRate: number;
  volume: number;
}

export interface AudioControls {
  play: (verseKey: string) => void;
  pause: () => void;
  playWord: (word: Word) => void;
  seekTo: (timestamp: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
}

// ============================================================================
// THEME TYPES
// ============================================================================

export type ThemeMode = 'dark' | 'light' | 'sepia';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface VerseCardProps {
  verse: Verse;
  theme?: ThemeMode;
  showTranslation?: boolean;
  showWordByWord?: boolean;
  showWordByWordTransliteration?: boolean;
  isHighlighted?: boolean;
  isBookmarked?: boolean;
  onWordClick?: (word: Word) => void;
  onBookmarkToggle?: (verseKey: string) => void;
  onPlayClick?: (verseKey: string) => void;
  className?: string;
}

export interface QuranWordProps {
  word: Word;
  isHighlighted?: boolean;
  showTooltip?: boolean;
  showWordByWord?: boolean;
  showTransliteration?: boolean;
  onClick?: (word: Word) => void;
  onHover?: (word: Word) => void;
  className?: string;
}

export interface TranslationTextProps {
  translation: Translation;
  fontSize?: number;
  showResourceName?: boolean;
  className?: string;
}

export interface WaqfMarkProps {
  text: string;
  type?: WaqfType;  // Optional - auto-detected if not provided
  className?: string;
}

export interface TopActionsProps {
  verseNumber: number;
  verseKey: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onPlayClick?: () => void;
  className?: string;
}

export interface BottomActionsProps {
  verseKey: string;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface VerseState {
  selectedVerseKey: string | null;
  highlightedWordLocation: string | null;
  bookmarkedVerses: Set<string>;
  showTranslation: boolean;
  showWordByWord: boolean;
  showWordByWordTransliteration: boolean;
}

export interface VerseActions {
  selectVerse: (verseKey: string) => void;
  highlightWord: (wordLocation: string | null) => void;
  toggleBookmark: (verseKey: string) => void;
  setShowTranslation: (show: boolean) => void;
  setShowWordByWord: (show: boolean) => void;
  setShowWordByWordTransliteration: (show: boolean) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface FontScale {
  arabic: number;
  translation: number;
}

export interface ReadingPreferences {
  theme: ThemeMode;
  fontScale: FontScale;
  showTranslation: boolean;
  showWordByWord: boolean;
  showWordByWordTransliteration: boolean;
  enableAudio: boolean;
  autoScroll: boolean;
}
