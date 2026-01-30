/**
 * Standalone Quran UI - Usage Examples
 * Complete examples showing how to use the component library
 */

import React from 'react';
import {
  VerseCard,
  useVerseState,
  useAudioPlayer,
  type Verse,
  type Word,
} from './index';

// ============================================================================
// EXAMPLE 1: Basic Verse Display
// ============================================================================

export function BasicVerseExample() {
  const sampleVerse: Verse = {
    id: 1,
    verseNumber: 1,
    verseKey: '1:1',
    chapterId: 1,
    pageNumber: 1,
    hizbNumber: 1,
    juzNumber: 1,
    words: [
      {
        id: 1,
        position: 1,
        text: 'بِسۡمِ',
        translation: 'In the name',
        transliteration: 'Bismi',
        verseKey: '1:1',
        location: '1:1:1',
        charType: 'word' as any,
      },
      {
        id: 2,
        position: 2,
        text: 'ٱللَّهِ',
        translation: 'of Allah',
        transliteration: 'Allahi',
        verseKey: '1:1',
        location: '1:1:2',
        charType: 'word' as any,
      },
      // ... more words
    ],
    translations: [
      {
        id: 1,
        text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        languageId: 1,
        languageName: 'English',
        resourceName: 'Sahih International',
      },
    ],
  };

  return (
    <VerseCard
      verse={sampleVerse}
      theme="dark"
      showTranslation={true}
    />
  );
}

// ============================================================================
// EXAMPLE 2: Word-by-Word Display
// ============================================================================

export function WordByWordExample() {
  const sampleVerse: Verse = {
    /* ... same as above ... */
  } as any;

  return (
    <VerseCard
      verse={sampleVerse}
      theme="light"
      showTranslation={true}
      showWordByWord={true}
      showWordByWordTransliteration={true}
    />
  );
}

// ============================================================================
// EXAMPLE 3: Interactive with State Management
// ============================================================================

export function InteractiveVerseExample() {
  const verseState = useVerseState({
    theme: 'dark',
    showTranslation: true,
    showWordByWord: false,
  });

  const audioPlayer = useAudioPlayer();

  const sampleVerse: Verse = {
    /* ... */
  } as any;

  const handleWordClick = (word: Word) => {
    console.log('Word clicked:', word);
    verseState.highlightWord(word.location);
    
    // Play word audio if available
    if (word.audioUrl) {
      audioPlayer.playWord(word);
    }
  };

  const handleBookmarkToggle = (verseKey: string) => {
    verseState.toggleBookmark(verseKey);
  };

  const handlePlayClick = (verseKey: string) => {
    audioPlayer.play(verseKey, sampleVerse.audioUrl);
  };

  const isBookmarked = verseState.bookmarkedVerses.has(sampleVerse.verseKey);
  const isHighlighted = audioPlayer.currentVerseKey === sampleVerse.verseKey;

  return (
    <div className="theme-dark">
      <VerseCard
        verse={sampleVerse}
        theme={verseState.preferences.theme}
        showTranslation={verseState.showTranslation}
        showWordByWord={verseState.showWordByWord}
        showWordByWordTransliteration={verseState.showWordByWordTransliteration}
        isHighlighted={isHighlighted}
        isBookmarked={isBookmarked}
        onWordClick={handleWordClick}
        onBookmarkToggle={handleBookmarkToggle}
        onPlayClick={handlePlayClick}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Multiple Verses with Persisted State
// ============================================================================

export function MultipleVersesExample() {
  const verseState = usePersistedVerseState('my-quran-app');
  const audioPlayer = useAudioPlayer();

  const verses: Verse[] = [
    /* ... array of verses ... */
  ] as any[];

  return (
    <div className={`theme-${verseState.preferences.theme}`}>
      {verses.map((verse) => (
        <VerseCard
          key={verse.verseKey}
          verse={verse}
          theme={verseState.preferences.theme}
          showTranslation={verseState.showTranslation}
          showWordByWord={verseState.showWordByWord}
          isHighlighted={audioPlayer.currentVerseKey === verse.verseKey}
          isBookmarked={verseState.bookmarkedVerses.has(verse.verseKey)}
          onWordClick={(word) => {
            verseState.highlightWord(word.location);
            if (word.audioUrl) audioPlayer.playWord(word);
          }}
          onBookmarkToggle={(verseKey) => verseState.toggleBookmark(verseKey)}
          onPlayClick={(verseKey) => {
            audioPlayer.play(verseKey, verse.audioUrl);
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Theme Switcher
// ============================================================================

export function ThemeSwitcherExample() {
  const verseState = useVerseState();

  const sampleVerse: Verse = {
    /* ... */
  } as any;

  return (
    <div>
      {/* Theme Switcher Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => verseState.updatePreferences({ theme: 'dark' })}>
          Dark Theme
        </button>
        <button onClick={() => verseState.updatePreferences({ theme: 'light' })}>
          Light Theme
        </button>
        <button onClick={() => verseState.updatePreferences({ theme: 'sepia' })}>
          Sepia Theme
        </button>
      </div>

      {/* Verse Card */}
      <div className={`theme-${verseState.preferences.theme}`}>
        <VerseCard
          verse={sampleVerse}
          theme={verseState.preferences.theme}
          showTranslation={verseState.showTranslation}
        />
      </div>
    </div>
  );
}
