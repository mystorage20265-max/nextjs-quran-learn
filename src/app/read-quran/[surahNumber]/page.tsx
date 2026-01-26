'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import TafsirSection from '../components/TafsirSection';
import InteractiveWord from '../components/InteractiveWord';
import { parseTranslationWithFootnotes } from '../lib/translationUtils';
import { MushafPage } from '@/components/Quran/MushafPage';

// Convert English numbers to Arabic-Indic numerals (۰۱۲۳۴۵۶۷۸۹)
const toArabicNumeral = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

// Remove unwanted Quranic symbols from text (verse markers, pause marks, etc.)
const cleanArabicText = (text: string): string => {
    return text
        // Remove verse end markers (۞, numbers in circles like ۝۩, etc.)
        .replace(/[\u06D6-\u06ED]/g, '') // Arabic small high signs
        .replace(/[\u06D6-\u06DC]/g, '') // Quranic annotation signs
        .replace(/۝/g, '') // End of Ayah
        .replace(/۩/g, '') // Place of Sajdah
        .replace(/[\u0610-\u061A]/g, '') // Additional Arabic signs
        .replace(/[\u064B-\u065F]/g, (match) => {
            // Keep most tashkeel but remove some special marks
            return match;
        });
};

interface SurahPageProps {
    params: Promise<{ surahNumber: string }>;
}

export default function SurahReadingPage({ params }: SurahPageProps) {
    // Unwrap params Promise using React.use()
    const { surahNumber: surahNumberStr } = use(params);
    const surahNumber = parseInt(surahNumberStr);

    // Get query params (searchParams can be null during SSR)
    const searchParams = useSearchParams();
    const initialMode = searchParams?.get('mode') ?? null;
    const tafsirId = searchParams?.get('tafsir') ?? null;

    // State
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [verses, setVerses] = useState<VerseWithTranslation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isChangingSettings, setIsChangingSettings] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tafsirContent, setTafsirContent] = useState<Record<string, string>>({});

    // Settings
    const [readingMode, setReadingMode] = useState<'translation' | 'reading' | 'word-by-word' | 'mushaf'>(
        (initialMode === 'reading' || initialMode === 'translation' || initialMode === 'word-by-word' || initialMode === 'mushaf') ? initialMode as any : 'translation'
    );
    const [selectedTranslation, setSelectedTranslation] = useState('en.sahih');
    const [selectedReciter, setSelectedReciter] = useState(7);
    const [fontSize, setFontSize] = useState(28);
    const [showSettings, setShowSettings] = useState(false);

    // Word-by-word data
    const [versesWithWords, setVersesWithWords] = useState<VerseWithTranslation[]>([]);
    const [wordDataLoading, setWordDataLoading] = useState(false);

    // Audio
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerse, setCurrentVerse] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Bookmarks
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [showBookmarkToast, setShowBookmarkToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'warning'>('success');
    const [showInfo, setShowInfo] = useState(false);

    // Debounce ref for IntersectionObserver
    const lastSaveRef = useRef<number>(0);

    // Fetch Data - Single source of truth for data loading
    useEffect(() => {
        let isCancelled = false;

        async function loadSurahData() {
            if (surahNumber < 1 || surahNumber > 114) {
                setError('Invalid surah number');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [chapterData, versesData] = await Promise.all([
                    getChapter(surahNumber),
                    getAllVerses(surahNumber, selectedTranslation)
                ]);

                if (isCancelled) return;

                setChapter(chapterData);
                setVerses(versesData);

                // Fetch Tafsir if in URL
                if (tafsirId) {
                    const { getTafsirContent } = await import('../lib/api');
                    const tContent = await getTafsirContent(tafsirId, surahNumber);
                    if (!isCancelled) {
                        setTafsirContent(tContent);
                    }
                }
            } catch (err) {
                console.error(err);
                if (!isCancelled) {
                    setError('Failed to load Surah data. Please try again.');
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                    setIsChangingSettings(false);
                }
            }
        }

        loadSurahData();

        return () => {
            isCancelled = true;
        };
    }, [surahNumber, selectedTranslation, tafsirId]);

    // Fetch word-by-word data when mode is switched
    useEffect(() => {
        let isCancelled = false;

        async function loadWordData() {
            if (readingMode !== 'word-by-word' || surahNumber < 1 || surahNumber > 114) {
                return;
            }

            try {
                setWordDataLoading(true);

                // Map alquran.cloud translation IDs to Quran.com resource IDs
                const translationMap: Record<string, string> = {
                    'en.sahih': '131',      // Sahih International
                    'en.pickthall': '22',   // Pickthall
                    'en.yusufali': '21',    // Yusuf Ali
                    'en.asad': '206',       // Muhammad Asad
                    'ur.jalandhry': '97',   // Fateh Muhammad Jalandhry (Urdu)
                    'ur.ahmedali': '96',    // Ahmed Ali (Urdu)
                    'fr.hamidullah': '31',  // Muhammad Hamidullah (French)
                    'es.asad': '83'         // Muhammad Asad (Spanish)
                };

                // Get verse translation resource ID and fetch word-by-word data
                // Note: Word translations and transliterations are in English by default
                const resourceId = translationMap[selectedTranslation] || '131';
                const wordData = await getVersesWithWords(surahNumber, resourceId);

                if (!isCancelled) {
                    setVersesWithWords(wordData);
                }
            } catch (err) {
                console.error('Error fetching word data:', err);
                if (!isCancelled) {
                    // Fallback to regular verses if word data fails
                    setVersesWithWords(verses);
                }
            } finally {
                if (!isCancelled) {
                    setWordDataLoading(false);
                }
            }
        }

        loadWordData();

        return () => {
            isCancelled = true;
        };
    }, [readingMode, surahNumber, verses, selectedTranslation]);

    // Confirmation State
    const [pendingChange, setPendingChange] = useState<{ type: 'reciter' | 'translation', value: string | number, name: string } | null>(null);

    // Handle Translation Change
    const handleTranslationChange = (newValue: string) => {
        const name = TRANSLATIONS.find(t => t.id === newValue)?.name || newValue;
        setPendingChange({ type: 'translation', value: newValue, name });
    };

    // Handle Reciter Change
    const handleReciterChange = (newValue: number) => {
        const name = POPULAR_RECITERS.find(r => r.id === newValue)?.name || 'Selected Reciter';
        setPendingChange({ type: 'reciter', value: newValue, name });
    };

    // Confirm Change
    const confirmChange = () => {
        if (!pendingChange) return;

        if (pendingChange.type === 'translation') {
            setIsChangingSettings(true);
            setSelectedTranslation(pendingChange.value as string);
        } else if (pendingChange.type === 'reciter') {
            setSelectedReciter(pendingChange.value as number);
        }

        setPendingChange(null);
        setShowSettings(false); // Auto-close settings so user can see the change
        setToastType('success');
        setToastMessage(`${pendingChange.type === 'reciter' ? 'Reciter' : 'Translation'} updated!`);
        setShowBookmarkToast(true);
        setTimeout(() => setShowBookmarkToast(false), 2000);
    };

    // Load bookmarks from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('quran-bookmarks');
            if (saved) {
                setBookmarks(JSON.parse(saved));
            }
        }
    }, []);

    // Save last read position when verse is viewed
    useEffect(() => {
        if (!chapter || verses.length === 0) return;

        // Save position when audio plays
        if (currentVerse) {
            saveLastRead(surahNumber, chapter.name_simple, currentVerse);
            markVerseRead(`${surahNumber}:${currentVerse}`);
        }
    }, [currentVerse, chapter, surahNumber, verses.length]);

    // Track visible verses for reading progress (debounced)
    useEffect(() => {
        if (!chapter || verses.length === 0) return;

        const DEBOUNCE_MS = 1000; // Minimum time between saves
        const readTimeouts: Map<number, NodeJS.Timeout> = new Map();

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const verseId = entry.target.id;
                        const verseNum = parseInt(verseId.replace('verse-', ''));
                        if (!isNaN(verseNum)) {
                            // Debounce: only save if enough time has passed
                            const now = Date.now();
                            if (now - lastSaveRef.current > DEBOUNCE_MS) {
                                lastSaveRef.current = now;
                                saveLastRead(surahNumber, chapter.name_simple, verseNum);
                            }

                            // Mark as read after 2 seconds of visibility (with cleanup)
                            if (!readTimeouts.has(verseNum)) {
                                const timeout = setTimeout(() => {
                                    markVerseRead(`${surahNumber}:${verseNum}`);
                                    readTimeouts.delete(verseNum);
                                }, 2000);
                                readTimeouts.set(verseNum, timeout);
                            }
                        }
                    } else {
                        // Clear timeout if verse scrolls out of view
                        const verseId = entry.target.id;
                        const verseNum = parseInt(verseId.replace('verse-', ''));
                        if (!isNaN(verseNum) && readTimeouts.has(verseNum)) {
                            clearTimeout(readTimeouts.get(verseNum));
                            readTimeouts.delete(verseNum);
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        // Observe all verse elements
        const verseElements = document.querySelectorAll('[id^="verse-"]');
        verseElements.forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
            // Cleanup all pending timeouts
            readTimeouts.forEach((timeout) => clearTimeout(timeout));
            readTimeouts.clear();
        };
    }, [chapter, surahNumber, verses.length]);

    // CRITICAL: Track if component is mounted to prevent zombie callbacks
    const isMountedRef = useRef(true);

    // CRITICAL: Comprehensive cleanup on component unmount (fixes dual audio bug)
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            // Mark as unmounted FIRST to prevent any callbacks
            isMountedRef.current = false;

            // Stop any playing audio when navigating away
            if (audioRef.current) {
                // Remove all event listeners to prevent callbacks
                audioRef.current.onplay = null;
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current.onpause = null;
                audioRef.current.onloadeddata = null;

                // Stop playback
                audioRef.current.pause();
                audioRef.current.currentTime = 0;

                // Clear source to stop any loading
                try {
                    audioRef.current.src = '';
                    audioRef.current.load(); // Force stop loading
                } catch (e) {
                    // Ignore errors during cleanup
                }

                audioRef.current = null;
            }

            // Reset state
            setIsPlaying(false);
            setCurrentVerse(null);
        };
    }, []);

    // Save bookmarks to localStorage
    const saveBookmarks = useCallback((newBookmarks: string[]) => {
        setBookmarks(newBookmarks);
        if (typeof window !== 'undefined') {
            localStorage.setItem('quran-bookmarks', JSON.stringify(newBookmarks));
        }
    }, []);

    // Toggle bookmark for a verse
    const toggleBookmark = useCallback((verseKey: string) => {
        const isBookmarked = bookmarks.includes(verseKey);
        let newBookmarks: string[];

        if (isBookmarked) {
            newBookmarks = bookmarks.filter(b => b !== verseKey);
            setToastMessage('Bookmark removed');
        } else {
            newBookmarks = [...bookmarks, verseKey];
            setToastMessage('Verse bookmarked!');
        }

        saveBookmarks(newBookmarks);
        setShowBookmarkToast(true);
        setTimeout(() => setShowBookmarkToast(false), 2000);
    }, [bookmarks, saveBookmarks]);

    // Check if verse is bookmarked
    const isBookmarked = useCallback((verseKey: string) => {
        return bookmarks.includes(verseKey);
    }, [bookmarks]);

    // Copy verse to clipboard
    const copyVerse = useCallback((verse: VerseWithTranslation) => {
        const textToCopy = `${verse.text_uthmani}\n\n${verse.translations?.[0]?.text || ''}\n\n— Quran ${verse.verse_key}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setToastMessage('Verse copied to clipboard!');
            setShowBookmarkToast(true);
            setTimeout(() => setShowBookmarkToast(false), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            setToastMessage('Failed to copy verse');
            setShowBookmarkToast(true);
            setTimeout(() => setShowBookmarkToast(false), 2000);
        });
    }, []);

    // REMOVED: Duplicate loadData useEffect - now handled by single useEffect above

    // Calculate global verse number (for audio URL)
    const getGlobalVerseNumber = useCallback((surahNum: number, verseNum: number): number => {
        // Verse numbers in the audio CDN are global (1 = Al-Fatiha:1, 8 = Al-Baqarah:1, etc.)
        // For simplicity, we'll use verse_key format which the CDN also supports
        const surahVerseOffsets: { [key: number]: number } = {
            1: 0, 2: 7, 3: 293, 4: 493, 5: 669, 6: 789, 7: 954, 8: 1160, 9: 1235, 10: 1364,
            // ... simplified - using surah:verse format instead
        };
        return (surahVerseOffsets[surahNum] || 0) + verseNum;
    }, []);

    const playbackIdRef = useRef(0);

    // Play verse audio
    const playVerse = useCallback((verseNumber: number) => {
        // Increment playback ID to invalidate any previous or pending sequences
        const myPlaybackId = ++playbackIdRef.current;

        // CRITICAL: Don't play if component is unmounted
        if (!isMountedRef.current) {
            return;
        }

        // Find the verse to get its global ID
        const verse = verses.find(v => v.verse_number === verseNumber);
        if (!verse) {
            console.error('Verse not found:', verseNumber);
            return;
        }

        // Get selected reciter info
        const reciter = POPULAR_RECITERS.find(r => r.id === selectedReciter);
        const slug = reciter?.slug || 'ar.alafasy';
        const folder = reciter?.folder || 'Alafasy_128kbps';

        // Use multiple audio source formats
        // Islamic Network CDN uses global ayah numbers (1-6236)
        const globalAyahId = verse.id;
        const surahPadded = surahNumber.toString().padStart(3, '0');
        const versePadded = verseNumber.toString().padStart(3, '0');

        // Try multiple audio sources with different formats
        // Prioritize EveryAyah as it has the most predictable folder structure
        const audioUrls = [
            `https://everyayah.com/data/${folder}/${surahPadded}${versePadded}.mp3`,
            `https://cdn.islamic.network/quran/audio/128/${slug}/${globalAyahId}.mp3`,
            `https://verses.quran.com/${slug.replace('ar.', '')}/mp3/${surahNumber}_${verseNumber}.mp3`
        ];

        // Stop any existing audio first
        if (audioRef.current) {
            audioRef.current.onplay = null;
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.pause();
            audioRef.current = null;
        }

        let currentUrlIndex = 0;

        const tryNextUrl = () => {
            // CRITICAL: Check mounted status before any action
            if (!isMountedRef.current) return;

            // CRITICAL: Verify this is still the active playback session
            if (myPlaybackId !== playbackIdRef.current) return;

            if (currentUrlIndex >= audioUrls.length) {
                console.error('All audio sources failed');
                if (isMountedRef.current && myPlaybackId === playbackIdRef.current) {
                    setIsPlaying(false);
                }
                return;
            }

            const audio = new Audio(audioUrls[currentUrlIndex]);
            audioRef.current = audio;

            audio.onplay = () => {
                if (isMountedRef.current && myPlaybackId === playbackIdRef.current) {
                    setIsPlaying(true);
                    setCurrentVerse(verseNumber);
                }
            };

            audio.onended = () => {
                if (!isMountedRef.current || myPlaybackId !== playbackIdRef.current) return;

                // Auto-play next verse
                if (verseNumber < verses.length) {
                    playVerse(verseNumber + 1);
                } else {
                    setIsPlaying(false);
                    setCurrentVerse(null);
                }
            };

            audio.onerror = () => {
                if (!isMountedRef.current || myPlaybackId !== playbackIdRef.current) return;

                console.warn(`Audio source ${currentUrlIndex + 1} failed for ${slug}, trying next...`);
                currentUrlIndex++;
                tryNextUrl();
            };

            audio.play().catch((err) => {
                if (!isMountedRef.current || myPlaybackId !== playbackIdRef.current) return;

                console.warn('Audio play failed:', err);
                currentUrlIndex++;
                tryNextUrl();
            });
        };

        tryNextUrl();
    }, [surahNumber, verses, selectedReciter]);

    // Auto-scroll to active verse
    useEffect(() => {
        if (currentVerse && isPlaying) {
            const verseElement = document.getElementById(`verse-${currentVerse}`);
            if (verseElement) {
                verseElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [currentVerse, isPlaying]);

    // Stop audio
    const stopAudio = useCallback(() => {
        // Invalidate any pending playbacks
        playbackIdRef.current++;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setCurrentVerse(null);
    }, []);

    // Play all from beginning
    const playAll = useCallback(() => {
        if (isPlaying) {
            stopAudio();
        } else {
            playVerse(1);
        }
    }, [isPlaying, stopAudio, playVerse]);

    if (loading) {
        return (
            <div className="rq-container">
                <div className="rq-loading">
                    <div className="rq-spinner"></div>
                    <p style={{ marginTop: '16px' }}>Loading Surah...</p>
                </div>
            </div>
        );
    }

    if (error || !chapter) {
        return (
            <div className="rq-container">
                <div className="rq-loading">
                    <p style={{ color: '#ef4444' }}>{error || 'Surah not found'}</p>
                    <Link
                        href="/read-quran"
                        style={{
                            marginTop: '16px',
                            padding: '8px 24px',
                            background: 'var(--rq-primary)',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none'
                        }}
                    >
                        ← Back to Surahs
                    </Link>
                </div>
            </div>
        );
    }



    return (
        <div className="rq-container">
            {/* Loading overlay for settings changes */}
            {isChangingSettings && (
                <div className="settings-loading-overlay">
                    <div className="rq-spinner"></div>
                    <p>Loading translation...</p>
                </div>
            )}

            {/* Back Link */}
            <Link
                href="/read-quran"
                className="rq-back-btn"
                aria-label="Go back to all surahs"
            >
                ← Back to All Surahs
            </Link>

            {/* Surah Header - Premium Cinematic Look */}
            <header className="surah-header-cinematic">
                <div className="surah-header-overlay" />

                <div className="surah-header-content">
                    <h1 className="surah-name-arabic-large">
                        {chapter.name_arabic}
                    </h1>
                    <h2 className="surah-name-english-large">
                        {chapter.name_simple}
                    </h2>
                    <p className="surah-meaning">
                        {chapter.translated_name.name}
                    </p>

                    {/* Info Toggle Button */}
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="info-toggle-btn"
                    >
                        <span>{showInfo ? 'Hide Info' : 'Show Info'}</span>
                        <span className="toggle-icon">{showInfo ? '▲' : '▼'}</span>
                    </button>
                </div>
            </header>

            {/* Collapsible Surah Info Panel */}
            {showInfo && (
                <div className="rq-info-panel">
                    <h3 className="rq-info-title">📋 Surah Information</h3>
                    <div className="rq-info-grid">
                        <div className="rq-info-item">
                            <div className="rq-info-value">{chapter.id}</div>
                            <div className="rq-info-label">Surah Number</div>
                        </div>
                        <div className="rq-info-item">
                            <div className="rq-info-value">{chapter.verses_count}</div>
                            <div className="rq-info-label">Verses</div>
                        </div>
                        <div className="rq-info-item">
                            <div className="rq-info-value">{chapter.revelation_order}</div>
                            <div className="rq-info-label">Revelation Order</div>
                        </div>
                        <div className="rq-info-item">
                            <div className="rq-info-value">{chapter.revelation_place === 'makkah' ? '🕋 Makkah' : '🕌 Madinah'}</div>
                            <div className="rq-info-label">Revealed In</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="rq-toolbar">
                <div className="rq-toolbar-group actions-group">
                    {/* Play Button */}
                    <button className="rq-toolbar-btn play-btn" onClick={playAll}>
                        {isPlaying ? '⏸️ Pause' : '▶️ Play Audio'}
                    </button>

                    {/* Settings Button */}
                    <button className="rq-toolbar-btn settings-btn" onClick={() => setShowSettings(true)}>
                        ⚙️ Settings
                    </button>
                </div>

                <div className="rq-toolbar-group mode-group">
                    {/* Mode Toggle */}
                    <div className="rq-mode-toggle">
                        <button
                            className={`rq-mode-btn ${readingMode === 'translation' ? 'active' : ''}`}
                            onClick={() => setReadingMode('translation')}
                        >
                            Translation
                        </button>
                        <button
                            className={`rq-mode-btn ${readingMode === 'reading' ? 'active' : ''}`}
                            onClick={() => setReadingMode('reading')}
                        >
                            Reading
                        </button>
                        <button
                            className={`rq-mode-btn ${readingMode === 'word-by-word' ? 'active' : ''}`}
                            onClick={() => setReadingMode('word-by-word')}
                        >
                            Word-by-Word
                        </button>
                        <button
                            className={`rq-mode-btn ${readingMode === 'mushaf' ? 'active' : ''}`}
                            onClick={() => setReadingMode('mushaf')}
                            title="Authentic Mushaf glyph rendering"
                        >
                            🕌 Mushaf
                        </button>
                    </div>
                </div>
            </div>

            {/* Bismillah */}
            {chapter.bismillah_pre && (
                <div className="rq-bismillah">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
            )}

            {/* Verses */}
            <div className="rq-verses">
                {readingMode === 'translation' ? (
                    // Translation Mode
                    verses.map((verse) => (
                        <div
                            key={verse.id}
                            className={`rq-verse ${currentVerse === verse.verse_number ? 'playing' : ''}`}
                            id={`verse-${verse.verse_number}`}
                        >
                            {/* Verse number in top left - Arabic-Indic numerals */}
                            <span className="rq-verse-number-corner">
                                {toArabicNumeral(verse.verse_number)}
                                {verse.sajdah_number && <span className="sajdah-marker" title="Sajdah (Prostration)">۩</span>}
                            </span>

                            <div className="rq-verse-arabic">{cleanArabicText(verse.text_uthmani)}</div>
                            <div className="rq-verse-translation">
                                {parseTranslationWithFootnotes(verse.translations?.[0]?.text || 'Translation not available')}
                            </div>

                            {/* Interactive Tafsir Section - Works with ALL Tafsirs */}
                            {tafsirId && tafsirContent[verse.verse_key] && (
                                <TafsirSection
                                    verseKey={verse.verse_key}
                                    content={tafsirContent[verse.verse_key]}
                                />
                            )}

                            <div className="rq-verse-actions">
                                <button
                                    className="rq-verse-action-btn"
                                    onClick={() => playVerse(verse.verse_number)}
                                    title="Play"
                                    aria-label={`Play verse ${verse.verse_number}`}
                                >
                                    🔊
                                </button>
                                <button
                                    className="rq-verse-action-btn"
                                    onClick={() => copyVerse(verse)}
                                    title="Copy"
                                    aria-label={`Copy verse ${verse.verse_number}`}
                                >
                                    📋
                                </button>
                                <button
                                    className={`rq-verse-action-btn ${isBookmarked(verse.verse_key) ? 'active' : ''}`}
                                    onClick={() => toggleBookmark(verse.verse_key)}
                                    title={isBookmarked(verse.verse_key) ? 'Remove Bookmark' : 'Bookmark'}
                                    aria-label={isBookmarked(verse.verse_key) ? `Remove bookmark from verse ${verse.verse_number}` : `Bookmark verse ${verse.verse_number}`}
                                >
                                    {isBookmarked(verse.verse_key) ? '⭐' : '🔖'}
                                </button>
                                <button
                                    className="rq-verse-action-btn"
                                    aria-label={`Share verse ${verse.verse_number}`}
                                    onClick={async () => {
                                        const shareText = `${verse.text_uthmani}\n\n${verse.translations?.[0]?.text || ''}\n\n— Quran ${verse.verse_key}`;
                                        const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/read-quran/${surahNumber}#verse-${verse.verse_number}` : '';

                                        // Try Web Share API first (works on mobile and some desktops)
                                        if (typeof navigator !== 'undefined' && navigator.share) {
                                            try {
                                                // Share with URL for best mobile app compatibility
                                                await navigator.share({
                                                    title: `Quran ${verse.verse_key} - ${chapter?.name_simple || 'Verse'}`,
                                                    text: shareText,
                                                    url: shareUrl,
                                                });
                                                // Only show toast if share completed (not cancelled)
                                                setToastMessage('Shared successfully!');
                                                setShowBookmarkToast(true);
                                                setTimeout(() => setShowBookmarkToast(false), 2000);
                                                return; // Exit early on success
                                            } catch (err: any) {
                                                // AbortError = user cancelled, don't show anything
                                                if (err.name === 'AbortError') {
                                                    return;
                                                }
                                                // NotAllowedError or other = try clipboard fallback
                                                console.log('Share API failed, trying clipboard:', err.message);
                                            }
                                        }

                                        // Fallback: Copy to clipboard (browser doesn't support native share)
                                        try {
                                            await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
                                            setToastType('warning');
                                            setToastMessage('📋 Copied! Native share requires Chrome.');
                                            setShowBookmarkToast(true);
                                            setTimeout(() => {
                                                setShowBookmarkToast(false);
                                                setToastType('success'); // Reset for next use
                                            }, 3000);
                                        } catch (clipboardErr) {
                                            // Last resort fallback for older browsers
                                            const textArea = document.createElement('textarea');
                                            textArea.value = shareText + '\n\n' + shareUrl;
                                            document.body.appendChild(textArea);
                                            textArea.select();
                                            document.execCommand('copy');
                                            document.body.removeChild(textArea);
                                            setToastType('warning');
                                            setToastMessage('📋 Copied! Native share requires Chrome.');
                                            setShowBookmarkToast(true);
                                            setTimeout(() => {
                                                setShowBookmarkToast(false);
                                                setToastType('success'); // Reset for next use
                                            }, 3000);
                                        }
                                    }}
                                    title="Share"
                                >
                                    📤
                                </button>
                            </div>
                        </div>
                    ))
                ) : readingMode === 'reading' ? (
                    // Reading Mode (Mushaf style)
                    <div className="rq-reading-mode">
                        <div className="rq-reading-text" style={{ fontSize: `${fontSize + 4}px` }}>
                            {verses.map((verse) => (
                                <span key={verse.id}>
                                    {cleanArabicText(verse.text_uthmani)}
                                    <span className="rq-reading-verse-marker">
                                        {toArabicNumeral(verse.verse_number)}
                                        {verse.sajdah_number && <span className="sajdah-marker-reading">۩</span>}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Word-by-Word Mode
                    <div className="word-by-word-mode">
                        {wordDataLoading ? (
                            <div className="rq-loading">
                                <div className="rq-spinner"></div>
                                <p>Loading word-by-word data...</p>
                            </div>
                        ) : versesWithWords.length > 0 ? (
                            versesWithWords.map((verse) => (
                                <div key={verse.id} className="word-by-word-verse" id={`verse-${verse.verse_number}`}>
                                    <div className="word-by-word-verse-header">
                                        <div className="word-by-word-verse-number">
                                            <span className="verse-number-badge">{verse.verse_number}</span>
                                            <span>Verse {verse.verse_number}</span>
                                        </div>
                                    </div>

                                    <div className="word-by-word-text">
                                        {verse.words && verse.words.length > 0 ? (
                                            verse.words.map((word) => (
                                                <InteractiveWord key={word.id} word={word} />
                                            ))
                                        ) : (
                                            <span>{cleanArabicText(verse.text_uthmani)}</span>
                                        )}
                                    </div>

                                    <div className="word-by-word-translation">
                                        {parseTranslationWithFootnotes(verse.translations?.[0]?.text || 'Translation not available')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rq-loading">
                                <p>Switch to word-by-word mode to see interactive translations</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="rq-navigation">
                {surahNumber > 1 ? (
                    <Link
                        href={`/read-quran/${surahNumber - 1}`}
                        className="rq-nav-btn prev"
                    >
                        ← Previous Surah
                    </Link>
                ) : <div></div>}

                {surahNumber < 114 && (
                    <Link
                        href={`/read-quran/${surahNumber + 1}`}
                        className="rq-nav-btn next"
                    >
                        Next Surah →
                    </Link>
                )}
            </div>

            {/* Audio Player Bar */}
            {
                isPlaying && currentVerse && (
                    <div className="rq-audio-player">
                        <div className="rq-player-info">
                            <div className="rq-player-verse">Verse {currentVerse}</div>
                            <div className="rq-player-surah">{chapter.name_simple}</div>
                        </div>

                        <div className="rq-player-controls">
                            <button
                                className="rq-player-btn secondary"
                                onClick={() => currentVerse > 1 && playVerse(currentVerse - 1)}
                            >
                                ⏮
                            </button>
                            <button className="rq-player-btn" onClick={stopAudio}>
                                ⏹
                            </button>
                            <button
                                className="rq-player-btn secondary"
                                onClick={() => currentVerse < verses.length && playVerse(currentVerse + 1)}
                            >
                                ⏭
                            </button>
                        </div>

                        <div className="rq-player-progress">
                            <span className="rq-time">{currentVerse}/{verses.length}</span>
                            <div className="rq-progress-bar">
                                <div
                                    className="rq-progress-fill"
                                    style={{ width: `${(currentVerse / verses.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )
            }


            {/* Confirmation Modal */}
            {
                pendingChange && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 12000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        fontFamily: 'var(--font-primary)'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '16px',
                            maxWidth: '400px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#1E293B' }}>Confirm Change</h3>
                            <p style={{ margin: '0 0 24px 0', color: '#64748B', lineHeight: '1.5' }}>
                                Are you sure you want to change the {pendingChange.type} to <strong>{pendingChange.name}</strong>?
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setPendingChange(null)}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        border: '1px solid #CBD5E1',
                                        background: 'white',
                                        color: '#64748B',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    No, Cancel
                                </button>
                                <button
                                    onClick={confirmChange}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#059669',
                                        color: 'white',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Yes, Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Settings Panel */}
            <div className={`rq-settings-panel ${showSettings ? 'open' : ''}`}>
                <div className="rq-settings-header">
                    <span className="rq-settings-title">⚙️ Settings</span>
                    <button className="rq-settings-close" onClick={() => setShowSettings(false)}>
                        ✕
                    </button>
                </div>

                <div className="rq-settings-section">
                    <label className="rq-settings-label">Arabic Font Size</label>
                    <input
                        type="range"
                        min="20"
                        max="48"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="rq-font-slider"
                    />
                    <div style={{ textAlign: 'center', color: 'var(--rq-text-secondary)', fontSize: '0.9rem' }}>
                        {fontSize}px
                    </div>
                </div>

                <div className="rq-settings-section">
                    <label className="rq-settings-label">Translation</label>
                    <select
                        className="rq-select"
                        value={selectedTranslation}
                        onChange={(e) => handleTranslationChange(e.target.value)}
                    >
                        {TRANSLATIONS.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} ({t.language})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rq-settings-section">
                    <label className="rq-settings-label">Reciter</label>
                    <select
                        className="rq-select"
                        value={selectedReciter}
                        onChange={(e) => handleReciterChange(parseInt(e.target.value))}
                    >
                        {POPULAR_RECITERS.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Overlay for settings */}
            {
                showSettings && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 1000
                        }}
                        onClick={() => setShowSettings(false)}
                    />
                )
            }

            {/* Toast Notification */}
            {
                showBookmarkToast && (
                    <div style={{
                        position: 'fixed',
                        bottom: isPlaying && currentVerse ? '100px' : '24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: toastType === 'warning' ? '#DC2626' : 'var(--rq-primary)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        boxShadow: toastType === 'warning' ? '0 4px 20px rgba(220, 38, 38, 0.4)' : '0 4px 12px rgba(0,0,0,0.2)',
                        zIndex: 2000,
                        animation: 'fadeIn 0.3s ease',
                        maxWidth: '90%',
                        textAlign: 'center',
                        fontSize: toastType === 'warning' ? '0.9rem' : '1rem',
                        fontWeight: toastType === 'warning' ? '600' : '500'
                    }}>
                        {toastMessage}
                    </div>
                )
            }
        </div >
    );
}

