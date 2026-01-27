'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Square,
    Settings,
    X,
    Bookmark,
    Copy,
    Share2,
    Volume2,
    ChevronDown,
    BookOpen
} from 'lucide-react';
import {
    getChapter,
    getAllVerses,
    getVersesWithWords,
    Chapter,
    VerseWithTranslation,
    POPULAR_RECITERS,
    TRANSLATIONS
} from '../lib/api';
import { saveLastRead, markVerseRead } from '../lib/progress';
import { parseTranslationWithFootnotes } from '../lib/translationUtils';
import '../styles/reader.css';

// Clean Arabic text - only remove verse markers, keep all diacritics (harakat/tashkeel)
const cleanArabicText = (text: string): string => {
    return text
        // Only remove verse end markers and sajdah symbols, NOT diacritics
        .replace(/۝/g, '')     // End of ayah marker
        .replace(/۩/g, '')     // Sajdah marker
        .replace(/\u06DD/g, '') // Arabic end of ayah
        .trim();
};

// Convert number to Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩)
const toArabicNumeral = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
};

interface SurahPageProps {
    params: Promise<{ surahNumber: string }>;
}

type ReadingMode = 'translation' | 'reading' | 'word-by-word' | 'mushaf';

export default function SurahReadingPage({ params }: SurahPageProps) {
    const { surahNumber: surahNumberStr } = use(params);
    const surahNumber = parseInt(surahNumberStr);
    const searchParams = useSearchParams();
    const initialMode = searchParams?.get('mode') ?? 'translation';

    // State
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [verses, setVerses] = useState<VerseWithTranslation[]>([]);
    const [versesWithWords, setVersesWithWords] = useState<VerseWithTranslation[]>([]);
    const [loading, setLoading] = useState(true);
    const [wordDataLoading, setWordDataLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Settings
    const [readingMode, setReadingMode] = useState<ReadingMode>(
        (initialMode === 'reading' || initialMode === 'word-by-word' || initialMode === 'mushaf') 
            ? initialMode as ReadingMode 
            : 'mushaf' // Default to Mushaf view (Quran.com style)
    );
    const [selectedTranslation, setSelectedTranslation] = useState('en.sahih');
    const [selectedReciter, setSelectedReciter] = useState(7);
    const [fontSize, setFontSize] = useState(32);
    const [showSettings, setShowSettings] = useState(false);
    const [showTranslation, setShowTranslation] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);

    // Audio
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerse, setCurrentVerse] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playbackIdRef = useRef(0);
    const isMountedRef = useRef(true);

    // UI State
    const [showVerseNav, setShowVerseNav] = useState(false);
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [expandedTafsir, setExpandedTafsir] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

    // Load chapter data
    useEffect(() => {
        let isCancelled = false;

        async function loadData() {
            if (surahNumber < 1 || surahNumber > 114) {
                setError('Invalid surah number');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const [chapterData, versesData] = await Promise.all([
                    getChapter(surahNumber),
                    getAllVerses(surahNumber, selectedTranslation)
                ]);

                if (isCancelled) return;
                setChapter(chapterData);
                setVerses(versesData);
            } catch (err) {
                if (!isCancelled) setError('Failed to load Surah');
            } finally {
                if (!isCancelled) setLoading(false);
            }
        }

        loadData();
        return () => { isCancelled = true; };
    }, [surahNumber, selectedTranslation]);

    // Load word-by-word data when mode changes
    useEffect(() => {
        let isCancelled = false;

        async function loadWordData() {
            if (readingMode !== 'word-by-word' || !chapter) return;

            try {
                setWordDataLoading(true);
                const translationMap: Record<string, string> = {
                    'en.sahih': '131', 'en.pickthall': '22', 'en.yusufali': '21',
                    'en.asad': '206', 'ur.jalandhry': '97', 'ur.ahmedali': '96',
                    'fr.hamidullah': '31', 'es.asad': '83'
                };
                const resourceId = translationMap[selectedTranslation] || '131';
                const wordData = await getVersesWithWords(surahNumber, resourceId);

                if (!isCancelled) setVersesWithWords(wordData);
            } catch (err) {
                if (!isCancelled) setVersesWithWords(verses);
            } finally {
                if (!isCancelled) setWordDataLoading(false);
            }
        }

        loadWordData();
        return () => { isCancelled = true; };
    }, [readingMode, surahNumber, chapter, verses, selectedTranslation]);

    // Load bookmarks
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('quran-bookmarks');
            if (saved) setBookmarks(JSON.parse(saved));
        }
    }, []);

    // Component cleanup
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Auto-scroll to playing verse
    useEffect(() => {
        if (currentVerse && isPlaying && autoScroll) {
            const el = document.getElementById(`verse-${currentVerse}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentVerse, isPlaying, autoScroll]);

    // Save reading progress
    useEffect(() => {
        if (chapter && currentVerse) {
            saveLastRead(surahNumber, chapter.name_simple, currentVerse);
            markVerseRead(`${surahNumber}:${currentVerse}`);
        }
    }, [currentVerse, chapter, surahNumber]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (isPlaying) stopAudio();
                    else if (currentVerse) playVerse(currentVerse);
                    else playVerse(1);
                    break;
                case 'ArrowRight':
                    if (currentVerse && currentVerse < verses.length) playVerse(currentVerse + 1);
                    break;
                case 'ArrowLeft':
                    if (currentVerse && currentVerse > 1) playVerse(currentVerse - 1);
                    break;
                case 'Escape':
                    stopAudio();
                    setShowSettings(false);
                    setShowVerseNav(false);
                    break;
                case 'KeyS':
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        setShowSettings(true);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, currentVerse, verses.length]);

    // Toast helper
    const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    };

    // Bookmark toggle
    const toggleBookmark = useCallback((verseKey: string) => {
        const isBookmarked = bookmarks.includes(verseKey);
        const newBookmarks = isBookmarked
            ? bookmarks.filter(b => b !== verseKey)
            : [...bookmarks, verseKey];

        setBookmarks(newBookmarks);
        localStorage.setItem('quran-bookmarks', JSON.stringify(newBookmarks));
        showToast(isBookmarked ? 'Bookmark removed' : 'Verse bookmarked!');
    }, [bookmarks]);

    // Copy verse
    const copyVerse = useCallback((verse: VerseWithTranslation) => {
        const text = `${verse.text_uthmani}\n\n${verse.translations?.[0]?.text || ''}\n\n— Quran ${verse.verse_key}`;
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    }, []);

    // Share verse
    const shareVerse = useCallback(async (verse: VerseWithTranslation) => {
        const text = `${verse.text_uthmani}\n\n${verse.translations?.[0]?.text || ''}\n\n— Quran ${verse.verse_key}`;
        const url = `${window.location.origin}/read-quran/${surahNumber}#verse-${verse.verse_number}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: `Quran ${verse.verse_key}`, text, url });
            } catch {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(text + '\n\n' + url);
            showToast('Link copied!', 'warning');
        }
    }, [surahNumber]);

    // Play verse audio
    const playVerse = useCallback((verseNumber: number) => {
        const myPlaybackId = ++playbackIdRef.current;
        if (!isMountedRef.current) return;

        const verse = verses.find(v => v.verse_number === verseNumber);
        if (!verse) return;

        const reciter = POPULAR_RECITERS.find(r => r.id === selectedReciter);
        const folder = reciter?.folder || 'Alafasy_128kbps';
        const surahPadded = surahNumber.toString().padStart(3, '0');
        const versePadded = verseNumber.toString().padStart(3, '0');

        const audioUrl = `https://everyayah.com/data/${folder}/${surahPadded}${versePadded}.mp3`;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onplay = () => {
                if (isMountedRef.current && myPlaybackId === playbackIdRef.current) {
                    setIsPlaying(true);
                    setCurrentVerse(verseNumber);
                }
            };

            audio.onended = () => {
                if (!isMountedRef.current || myPlaybackId !== playbackIdRef.current) return;
                if (verseNumber < verses.length) {
                    playVerse(verseNumber + 1);
                } else {
                    setIsPlaying(false);
                    setCurrentVerse(null);
                }
            };

            audio.onerror = () => {
            if (isMountedRef.current && myPlaybackId === playbackIdRef.current) {
                setIsPlaying(false);
                showToast('Audio failed to load', 'warning');
            }
        };

        audio.play().catch(() => {
            showToast('Could not play audio', 'warning');
        });
    }, [surahNumber, verses, selectedReciter]);

    const stopAudio = useCallback(() => {
        playbackIdRef.current++;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setCurrentVerse(null);
    }, []);

    const playPrev = useCallback(() => {
        if (currentVerse && currentVerse > 1) playVerse(currentVerse - 1);
    }, [currentVerse, playVerse]);

    const playNext = useCallback(() => {
        if (currentVerse && currentVerse < verses.length) playVerse(currentVerse + 1);
    }, [currentVerse, verses.length, playVerse]);

    const jumpToVerse = useCallback((verseNumber: number) => {
        setShowVerseNav(false);
        const el = document.getElementById(`verse-${verseNumber}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="quran-reader">
                <div className="reader-container">
                    <div className="reader-loading">
                        <div className="reader-spinner"></div>
                        <p className="reader-loading-text">Loading Surah...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !chapter) {
        return (
            <div className="quran-reader">
                <div className="reader-container">
                    <div className="reader-loading">
                        <p style={{ color: '#f85149', marginBottom: 16 }}>{error || 'Surah not found'}</p>
                        <Link href="/read-quran" className="reader-nav-btn primary">
                        ← Back to Surahs
                    </Link>
                    </div>
                </div>
            </div>
        );
    }

    const displayVerses = readingMode === 'word-by-word' && versesWithWords.length > 0 ? versesWithWords : verses;

    return (
        <div className="quran-reader" style={{ '--arabic-font-size': `${fontSize}px` } as React.CSSProperties}>
            <div className="reader-container">
                {/* Sticky Header */}
                <div className="reader-sticky-header">
                    <div className="reader-header-content">
                        <Link href="/read-quran" className="reader-back-btn">
                            <ChevronLeft size={18} />
                            <span>All Surahs</span>
            </Link>

                        <div className="reader-surah-info">
                            <h1 className="reader-surah-name">
                                <span>{chapter.name_simple}</span>
                                <span className="reader-surah-name-arabic">{chapter.name_arabic}</span>
                    </h1>
                            <p className="reader-surah-meta">
                                {chapter.translated_name.name} • {chapter.verses_count} verses • {chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}
                            </p>
                        </div>

                        <div className="reader-header-actions">
                            {/* Verse Navigation */}
                            <div className="verse-nav-dropdown">
                    <button
                                    className="verse-nav-trigger"
                                    onClick={() => setShowVerseNav(!showVerseNav)}
                    >
                                    <span>Ayah</span>
                                    <ChevronDown size={16} />
                    </button>

                                {showVerseNav && (
                                    <div className="verse-nav-panel">
                                        <div className="verse-nav-grid">
                                            {verses.map(v => (
                                                <button
                                                    key={v.verse_number}
                                                    className={`verse-nav-item ${currentVerse === v.verse_number ? 'current' : ''}`}
                                                    onClick={() => jumpToVerse(v.verse_number)}
                                                >
                                                    {v.verse_number}
                                                </button>
                                            ))}
                    </div>
                </div>
            )}
                            </div>

                            <button
                                className={`reader-action-btn ${isPlaying ? 'active' : ''}`}
                                onClick={() => isPlaying ? stopAudio() : playVerse(currentVerse || 1)}
                                title={isPlaying ? 'Stop (Space)' : 'Play (Space)'}
                            >
                                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                            <button
                                className="reader-action-btn"
                                onClick={() => setShowSettings(true)}
                                title="Settings (⌘S)"
                            >
                                <Settings size={18} />
                    </button>
                        </div>
                </div>

                    {/* Reading Mode Tabs */}
                    <div className="reading-mode-tabs">
                        <button
                            className={`reading-mode-tab ${readingMode === 'mushaf' ? 'active' : ''}`}
                            onClick={() => setReadingMode('mushaf')}
                        >
                            Mushaf
                        </button>
                        <button
                            className={`reading-mode-tab ${readingMode === 'translation' ? 'active' : ''}`}
                            onClick={() => setReadingMode('translation')}
                        >
                            Translation
                        </button>
                        <button
                            className={`reading-mode-tab ${readingMode === 'word-by-word' ? 'active' : ''}`}
                            onClick={() => setReadingMode('word-by-word')}
                        >
                            Word by Word
                        </button>
                        <button
                            className={`reading-mode-tab ${readingMode === 'reading' ? 'active' : ''}`}
                            onClick={() => setReadingMode('reading')}
                        >
                            Reading
                        </button>
                    </div>
            </div>

            {/* Bismillah */}
            {chapter.bismillah_pre && (
                    <div className="reader-bismillah">
                        <div className="reader-bismillah-text">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </div>
                        <div className="reader-bismillah-translation">
                            In the Name of Allah—the Most Compassionate, Most Merciful.
                        </div>
                </div>
            )}

            {/* Verses */}
                {readingMode === 'mushaf' ? (
                    // Mushaf Mode - Quran.com Style
                    <div className="reader-mushaf">
                        <div className="reader-mushaf-text">
                            {verses.map((verse) => (
                                <span key={verse.id}>
                                    {cleanArabicText(verse.text_uthmani)}
                                    <span 
                                        className="verse-number-badge"
                                        onClick={() => playVerse(verse.verse_number)}
                                        title={`Play verse ${verse.verse_number}`}
                                    >
                                        {toArabicNumeral(verse.verse_number)}
                                    </span>
                                </span>
                            ))}
                        </div>
                        
                        {/* Translation below mushaf text */}
                        {showTranslation && (
                            <div className="mushaf-translations">
                                {verses.map((verse) => (
                                    <div key={verse.id} className="mushaf-translation-item">
                                        <span className="mushaf-verse-ref">{toArabicNumeral(verse.verse_number)}</span>
                                        <span className="mushaf-translation-text">
                                            {parseTranslationWithFootnotes(verse.translations?.[0]?.text || '')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : readingMode === 'reading' ? (
                    // Continuous Reading Mode
                    <div className="reader-continuous">
                        <div className="reader-continuous-text">
                            {verses.map((verse) => (
                                <span key={verse.id}>
                                    {cleanArabicText(verse.text_uthmani)}
                                    <span className="verse-end-marker">{verse.verse_number}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                ) : readingMode === 'word-by-word' ? (
                    // Word-by-Word Mode
                    <div className="reader-verses">
                        {wordDataLoading ? (
                            <div className="reader-loading">
                                <div className="reader-spinner"></div>
                                <p className="reader-loading-text">Loading word data...</p>
                            </div>
                        ) : (
                            displayVerses.map((verse) => (
                        <div
                            key={verse.id}
                            id={`verse-${verse.verse_number}`}
                                    className={`reader-verse ${currentVerse === verse.verse_number ? 'playing' : ''}`}
                                >
                                    <div className="reader-verse-header">
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="reader-verse-number">{verse.verse_number}</span>
                                            <button
                                                className="verse-mini-play"
                                                onClick={() => playVerse(verse.verse_number)}
                                                title="Play verse"
                                            >
                                                <Volume2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Word-by-Word Display */}
                                    <div className="reader-verse-words">
                                        {verse.words && verse.words.length > 0 ? (
                                            verse.words.map((word, idx) => (
                                                <div
                                                    key={word.id || idx}
                                                    className="word-item"
                                                >
                                                    <span className="word-arabic">{word.text_uthmani}</span>
                                                    {word.transliteration?.text && (
                                                        <span className="word-transliteration">{word.transliteration.text}</span>
                                                    )}
                                                    {word.translation?.text && (
                                                        <span className="word-translation">{word.translation.text}</span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="reader-verse-arabic">{cleanArabicText(verse.text_uthmani)}</div>
                                        )}
                            </div>

                                    {showTranslation && (
                                        <div className="reader-verse-translation">
                                            {parseTranslationWithFootnotes(verse.translations?.[0]?.text || '')}
                                        </div>
                                    )}

                                    <div className="reader-verse-actions">
                                        <button className="verse-action-btn" onClick={() => copyVerse(verse)}>
                                            <Copy size={14} />
                                            <span>Copy</span>
                                </button>
                                <button
                                            className={`verse-action-btn ${bookmarks.includes(verse.verse_key) ? 'bookmarked' : ''}`}
                                    onClick={() => toggleBookmark(verse.verse_key)}
                                        >
                                            <Bookmark size={14} />
                                            <span>{bookmarks.includes(verse.verse_key) ? 'Saved' : 'Save'}</span>
                                        </button>
                                        <button className="verse-action-btn" onClick={() => shareVerse(verse)}>
                                            <Share2 size={14} />
                                            <span>Share</span>
                                </button>
                                <button
                                            className={`verse-tafsir-toggle ${expandedTafsir === verse.verse_number ? 'active' : ''}`}
                                            onClick={() => setExpandedTafsir(expandedTafsir === verse.verse_number ? null : verse.verse_number)}
                                        >
                                            <BookOpen size={14} />
                                            <span>Tafsir</span>
                                </button>
                            </div>

                                    {expandedTafsir === verse.verse_number && (
                                        <div className="verse-tafsir-panel">
                                            <div className="verse-tafsir-title">Brief Tafsir</div>
                                            <div className="verse-tafsir-content">
                                                Tafsir content for verse {verse.verse_number} would be loaded here. You can integrate with a Tafsir API to display detailed explanations.
                        </div>
                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    // Translation Mode
                    <div className="reader-verses">
                        {verses.map((verse) => (
                            <div
                                key={verse.id}
                                id={`verse-${verse.verse_number}`}
                                className={`reader-verse ${currentVerse === verse.verse_number ? 'playing' : ''}`}
                            >
                                <div className="reader-verse-header">
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span className="reader-verse-number">{verse.verse_number}</span>
                                        <button
                                            className="verse-mini-play"
                                            onClick={() => playVerse(verse.verse_number)}
                                            title="Play verse"
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                        </div>
                                    </div>

                                <div className="reader-verse-arabic">
                                    {cleanArabicText(verse.text_uthmani)}
                                    </div>

                                {showTranslation && (
                                    <div className="reader-verse-translation">
                                        {parseTranslationWithFootnotes(verse.translations?.[0]?.text || 'Translation not available')}
                                    </div>
                                )}

                                <div className="reader-verse-actions">
                                    <button className="verse-action-btn play-btn" onClick={() => playVerse(verse.verse_number)}>
                                        <Volume2 size={14} />
                                        <span>Play</span>
                                    </button>
                                    <button className="verse-action-btn" onClick={() => copyVerse(verse)}>
                                        <Copy size={14} />
                                        <span>Copy</span>
                                    </button>
                                    <button
                                        className={`verse-action-btn ${bookmarks.includes(verse.verse_key) ? 'bookmarked' : ''}`}
                                        onClick={() => toggleBookmark(verse.verse_key)}
                                    >
                                        <Bookmark size={14} />
                                        <span>{bookmarks.includes(verse.verse_key) ? 'Saved' : 'Save'}</span>
                                    </button>
                                    <button className="verse-action-btn" onClick={() => shareVerse(verse)}>
                                        <Share2 size={14} />
                                        <span>Share</span>
                                    </button>
                                    <button
                                        className={`verse-tafsir-toggle ${expandedTafsir === verse.verse_number ? 'active' : ''}`}
                                        onClick={() => setExpandedTafsir(expandedTafsir === verse.verse_number ? null : verse.verse_number)}
                                    >
                                        <BookOpen size={14} />
                                        <span>Tafsir</span>
                                    </button>
                                </div>

                                {expandedTafsir === verse.verse_number && (
                                    <div className="verse-tafsir-panel">
                                        <div className="verse-tafsir-title">Brief Tafsir</div>
                                        <div className="verse-tafsir-content">
                                            Tafsir content for verse {verse.verse_number} would be loaded here. You can integrate with a Tafsir API to display detailed explanations.
                            </div>
                    </div>
                )}
            </div>
                        ))}
                    </div>
                )}

                {/* Surah Navigation */}
                <div className="reader-nav-buttons">
                {surahNumber > 1 ? (
                        <Link href={`/read-quran/${surahNumber - 1}`} className="reader-nav-btn">
                            <ChevronLeft size={18} />
                            <span>Previous Surah</span>
                    </Link>
                ) : <div></div>}

                {surahNumber < 114 && (
                        <Link href={`/read-quran/${surahNumber + 1}`} className="reader-nav-btn primary">
                            <span>Next Surah</span>
                            <ChevronRight size={18} />
                    </Link>
                )}
                </div>
            </div>

            {/* Floating Audio Player */}
            {isPlaying && currentVerse && (
                <div className="reader-audio-player">
                    <button className="audio-close-btn" onClick={stopAudio} title="Close">
                        <X size={14} />
                    </button>

                    <div className="audio-player-info">
                        <div className="audio-player-verse">Verse {currentVerse} of {verses.length}</div>
                        <div className="audio-player-surah">{chapter.name_simple} • {chapter.name_arabic}</div>
                        </div>

                    <div className="audio-player-controls">
                        <button className="audio-control-btn" onClick={playPrev} title="Previous (←)">
                            <SkipBack size={18} />
                            </button>
                        <button className="audio-control-btn primary" onClick={stopAudio} title="Stop (Space)">
                            <Square size={20} />
                            </button>
                        <button className="audio-control-btn" onClick={playNext} title="Next (→)">
                            <SkipForward size={18} />
                            </button>
                        </div>

                    <div className="audio-player-progress">
                        <span className="audio-progress-text">{currentVerse}/{verses.length}</span>
                        <div className="audio-progress-bar">
                            <div
                                className="audio-progress-fill"
                                    style={{ width: `${(currentVerse / verses.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <>
                    <div className="reader-settings-overlay" onClick={() => setShowSettings(false)} />
                    <div className="reader-settings-panel">
                        <div className="settings-header">
                            <h2 className="settings-title">Settings</h2>
                            <button className="settings-close-btn" onClick={() => setShowSettings(false)}>
                                <X size={18} />
                    </button>
                </div>

                        <div className="settings-content">
                            {/* Font Size */}
                            <div className="settings-section">
                                <label className="settings-label">Arabic Font Size</label>
                                <div className="font-size-control">
                    <input
                        type="range"
                                        min="24"
                                        max="52"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                                        className="font-size-slider"
                    />
                                    <span className="font-size-value">{fontSize}px</span>
                    </div>
                </div>

                            {/* Translation */}
                            <div className="settings-section">
                                <label className="settings-label">Translation</label>
                    <select
                                    className="settings-select"
                        value={selectedTranslation}
                                    onChange={(e) => setSelectedTranslation(e.target.value)}
                    >
                        {TRANSLATIONS.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} ({t.language})
                            </option>
                        ))}
                    </select>
                </div>

                            {/* Reciter */}
                            <div className="settings-section">
                                <label className="settings-label">Reciter</label>
                    <select
                                    className="settings-select"
                        value={selectedReciter}
                                    onChange={(e) => setSelectedReciter(parseInt(e.target.value))}
                    >
                        {POPULAR_RECITERS.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>

                            {/* Toggles */}
                            <div className="settings-section">
                                <div className="settings-toggle">
                                    <div className="toggle-info">
                                        <div className="toggle-label">Show Translation</div>
                                        <div className="toggle-desc">Display translation below Arabic</div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${showTranslation ? 'active' : ''}`}
                                        onClick={() => setShowTranslation(!showTranslation)}
                                    />
            </div>

                                <div className="settings-toggle">
                                    <div className="toggle-info">
                                        <div className="toggle-label">Auto-Scroll</div>
                                        <div className="toggle-desc">Scroll to verse during playback</div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${autoScroll ? 'active' : ''}`}
                                        onClick={() => setAutoScroll(!autoScroll)}
                                    />
                                </div>
                            </div>

                            {/* Keyboard Shortcuts */}
                            <div className="keyboard-hints">
                                <div className="keyboard-hints-title">Keyboard Shortcuts</div>
                                <div className="keyboard-hint">
                                    <span className="keyboard-key">Space</span>
                                    <span className="keyboard-action">Play / Pause</span>
                    </div>
                                <div className="keyboard-hint">
                                    <span className="keyboard-key">←</span>
                                    <span className="keyboard-action">Previous verse</span>
                                </div>
                                <div className="keyboard-hint">
                                    <span className="keyboard-key">→</span>
                                    <span className="keyboard-action">Next verse</span>
                                </div>
                                <div className="keyboard-hint">
                                    <span className="keyboard-key">Esc</span>
                                    <span className="keyboard-action">Stop / Close</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Toast */}
            {toast && (
                <div className={`reader-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* Click outside to close verse nav */}
            {showVerseNav && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 50 }}
                    onClick={() => setShowVerseNav(false)}
                />
            )}
        </div>
    );
}
