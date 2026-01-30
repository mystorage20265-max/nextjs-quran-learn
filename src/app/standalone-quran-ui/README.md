# Standalone Quran UI Component Library

A self-contained, modular component library for building Quran reading interfaces with Word-by-Word translation support.

## ✨ Features

### 🎨 **Complete UI Components**
- **VerseCard** - Full-featured verse display with translations
- **QuranWord** - Interactive Arabic words with tooltips
- **TranslationText** - Multi-language translation rendering
- **WaqfMark** - Color-coded pause marks
- **TopActions** - Verse header with play/bookmark controls
- **BottomActions** - Tabbed navigation for notes/tafsir

### 🎯 **Core Capabilities**
- ✅ Word-by-word translation display (inline & tooltip)
- ✅ Word-level transliteration
- ✅ Interactive word clicking & hovering
- ✅ Audio playback (verse & word-level)
- ✅ Bookmark management
- ✅ Theme switching (Dark, Light, Sepia)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ RTL language support
- ✅ Keyboard navigation
- ✅ Screen reader accessibility

### 🔧 **Technical Excellence**
- ✅ **100% Self-Contained** - No shared dependencies
- ✅ **TypeScript** - Full type safety
- ✅ **SCSS Modules** - Independent styling per component
- ✅ **State Management** - Built-in hooks (useVerseState, useAudioPlayer)
- ✅ **localStorage Persistence** - Auto-save preferences
- ✅ **Clean Architecture** - Modular & scalable

---

## 📂 Directory Structure

```
standalone-quran-ui/
├── components/           # All UI components
│   ├── VerseCard/
│   │   ├── VerseCard.tsx
│   │   └── VerseCard.scss
│   ├── QuranWord/
│   ├── TranslationText/
│   ├── WaqfMark/
│   ├── TopActions/
│   └── BottomActions/
├── hooks/               # State management hooks
│   ├── useVerseState.ts
│   └── useAudioPlayer.ts
├── types/               # TypeScript definitions
│   └── index.ts
├── styles/              # Theme tokens & mixins
│   ├── tokens.scss
│   └── mixins.scss
├── utils/               # Helper functions
│   └── index.ts
├── index.ts             # Main export file
├── examples.tsx         # Usage examples
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Copy to Your Project

Copy the entire `standalone-quran-ui` folder into your React/Next.js project:

```bash
# Your project structure
your-project/
├── src/
│   └── components/
│       └── standalone-quran-ui/  ← Paste here
```

### 2. Import & Use

```tsx
import { VerseCard } from './components/standalone-quran-ui';

function MyComponent() {
  const verse = {
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
        charType: 'word',
      },
      // ... more words
    ],
    translations: [
      {
        id: 131,
        text: 'In the name of Allah, the Entirely Merciful...',
        languageId: 1,
        languageName: 'English',
        resourceName: 'Sahih International',
      },
    ],
  };

  return (
    <div className="theme-dark">
      <VerseCard 
        verse={verse} 
        theme="dark" 
        showTranslation 
        showWordByWord={false}
      />
    </div>
  );
}
```

### 3. Apply Theme

Wrap in theme className:

```tsx
<div className="theme-dark">       {/* Dark theme */}
<div className="theme-light">      {/* Light theme */}
<div className="theme-sepia">      {/* Sepia theme */}
```

---

## 📚 Usage Examples

### Basic Verse Display

```tsx
<VerseCard verse={verseData} theme="dark" showTranslation />
```

### Word-by-Word Translation

```tsx
<VerseCard 
  verse={verseData} 
  showWordByWord={true}
  showWordByWordTransliteration={true}
/>
```

### Interactive with State

```tsx
import { VerseCard, useVerseState, useAudioPlayer } from './standalone-quran-ui';

function InteractiveVerse() {
  const verseState = useVerseState();
  const audio = useAudioPlayer();

  return (
    <VerseCard
      verse={verse}
      theme={verseState.preferences.theme}
      isBookmarked={verseState.bookmarkedVerses.has(verse.verseKey)}
      onWordClick={(word) => audio.playWord(word)}
      onBookmarkToggle={(key) => verseState.toggleBookmark(key)}
      onPlayClick={(key) => audio.play(key, verse.audioUrl)}
    />
  );
}
```

---

## 🎨 Theming

Three built-in themes with full CSS custom property support:

```tsx
// Dark Theme (default)
<div className="theme-dark">
  <VerseCard verse={verse} theme="dark" />
</div>

// Light Theme
<div className="theme-light">
  <VerseCard verse={verse} theme="light" />
</div>

// Sepia Theme
<div className="theme-sepia">
  <VerseCard verse={verse} theme="sepia" />
</div>
```

### Custom Theme Colors

Override CSS tokens:

```css
:root {
  --quran-color-accent: #your-color;
  --quran-color-bg-default: #your-bg;
  --quran-font-size-base: 1.125rem;
}
```

---

## 🪝 State Management Hooks

### useVerseState

```tsx
const state = useVerseState();

// Access state
state.selectedVerseKey
state.bookmarkedVerses
state.preferences.theme

// Update state  
state.toggleBookmark('1:1')
state.updatePreferences({ theme: 'light' })
```

### useAudioPlayer

```tsx
const audio = useAudioPlayer();

// Play audio
audio.play('1:1', 'audio-url')
audio.playWord(wordData)

// Control playback
audio.pause()
audio.setVolume(0.8)
audio.setPlaybackRate(1.5)
```

---

## 📱 Responsive & Accessible

- ✅ Mobile-first responsive design
- ✅ Touch-friendly on mobile/tablet
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA labels for screen readers
- ✅ Semantic HTML structure
- ✅ RTL language support

---

## 📖 Documentation

See **[Developer Guide](../../.gemini/antigravity/brain/[conversation-id]/developer-guide.md)** for:
- Complete API reference
- Advanced usage patterns
- Customization guide
- Full TypeScript types
- FAQ

---

## 🔨 Component API

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `VerseCard` | Main verse display | `verse`, `theme`, `showTranslation`, `showWordByWord` |
| `QuranWord` | Interactive word | `word`, `onClick`, `showTooltip` |
| `TranslationText` | Translation display | `translation`, `fontSize` |
| `WaqfMark` | Pause marks | `text`, `type` |
| `TopActions` | Header actions | `verseNumber`, `onPlayClick`, `onBookmarkToggle` |
| `BottomActions` | Tab navigation | `tabs`, `activeTab`, `onTabChange` |

---

## ⚙️ Requirements

- **React** 16.8+ (hooks support)
- **TypeScript** 5.0+ (optional, but recommended)
- **SCSS** support (Next.js, Vite, CRA all supported)

---

## 🎯 Easy Integration

**No external dependencies!** Everything is self-contained:
- ✅ No Redux/MobX required
- ✅ No external CSS frameworks
- ✅ No API dependencies
- ✅ Copy-paste ready

Just copy the folder and start using!

---

## 📄 License

MIT - Free for commercial and personal use

---

## 💡 Example Projects

See `examples.tsx` for:
1. Basic verse display
2. Word-by-word translation
3. Interactive with state
4. Multi-verse reader
5. Theme switcher

---

## 🤝 Contributing

This is a standalone library. Customize freely for your projects!

---

**Built with ❤️ for the Muslim developer community**
