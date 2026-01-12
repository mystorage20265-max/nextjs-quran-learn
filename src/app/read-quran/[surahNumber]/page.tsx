'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    getChapter,
    getAllVerses,
    Chapter,
    VerseWithTranslation,
    POPULAR_RECITERS,
    TRANSLATIONS
} from '../lib/api';

interface SurahPageProps {
    params: Promise<{ surahNumber: string }>;
}

export default function SurahReadingPage({ params }: SurahPageProps) {
    // Unwrap params Promise using React.use()
    const { surahNumber: surahNumberStr } = use(params);
    const surahNumber = parseInt(surahNumberStr);

    // Get query params
    const searchParams = useSearchParams();
    const initialMode = searchParams.get('mode');
    const tafsirId = searchParams.get('tafsir');

    // State
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [verses, setVerses] = useState<VerseWithTranslation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tafsirContent, setTafsirContent] = useState<Record<string, string>>({});

    // Settings
    const [readingMode, setReadingMode] = useState<'translation' | 'reading'>(
        (initialMode === 'reading' || initialMode === 'translation') ? initialMode : 'translation'
    );
    const [selectedTranslation, setSelectedTranslation] = useState('en.sahih');
    const [selectedReciter, setSelectedReciter] = useState(7);
    const [fontSize, setFontSize] = useState(28);
    const [showSettings, setShowSettings] = useState(false);

    // Audio
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerse, setCurrentVerse] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Bookmarks
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [showBookmarkToast, setShowBookmarkToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'warning'>('success');

    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [chapterData, versesData] = await Promise.all([
                getChapter(surahNumber),
                getAllVerses(surahNumber, selectedTranslation)
            ]);
            setChapter(chapterData);
            setVerses(versesData);

            // Fetch Tafsir if currently in URL
            if (tafsirId) {
                // Dynamically import to avoid circular dep issues if any, or just direct import
                const { getTafsirContent } = await import('../lib/api');
                const tContent = await getTafsirContent(tafsirId, surahNumber);
                setTafsirContent(tContent);
            }

        } catch (err) {
            console.error(err);
            setError('Failed to load Surah data');
        } finally {
            setLoading(false);
        }
    }, [surahNumber, selectedTranslation, tafsirId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            setSelectedTranslation(pendingChange.value as string);
        } else if (pendingChange.type === 'reciter') {
            setSelectedReciter(pendingChange.value as number);
        }

        setPendingChange(null);
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

    // Fetch data
    useEffect(() => {
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

                setChapter(chapterData);
                setVerses(versesData);
            } catch (err) {
                console.error(err);
                setError('Failed to load surah. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [surahNumber, selectedTranslation]);

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

    // Play verse audio
    const playVerse = useCallback((verseNumber: number) => {
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
        // Try multiple audio sources with different formats
        // Prioritize EveryAyah as it has the most predictable folder structure
        const audioUrls = [
            // EveryAyah - dynamic folder (Most reliable)
            `https://everyayah.com/data/${folder}/${surahPadded}${versePadded}.mp3`,
            // Islamic Network - dynamic slug
            `https://cdn.islamic.network/quran/audio/128/${slug}/${globalAyahId}.mp3`,
            // Quran.com verses CDN (Fallback)
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
            if (!isMountedRef.current) {
                return;
            }

            if (currentUrlIndex >= audioUrls.length) {
                console.error('All audio sources failed');
                if (isMountedRef.current) {
                    setIsPlaying(false);
                }
                return;
            }

            const audio = new Audio(audioUrls[currentUrlIndex]);
            audioRef.current = audio;

            audio.onplay = () => {
                // Check if still mounted before updating state
                if (isMountedRef.current) {
                    setIsPlaying(true);
                    setCurrentVerse(verseNumber);
                }
            };

            audio.onended = () => {
                // Check if still mounted before auto-playing next
                if (!isMountedRef.current) {
                    return;
                }
                // Auto-play next verse
                if (verseNumber < verses.length) {
                    playVerse(verseNumber + 1);
                } else {
                    setIsPlaying(false);
                    setCurrentVerse(null);
                }
            };

            audio.onerror = () => {
                // Check if still mounted before retrying
                if (!isMountedRef.current) {
                    return;
                }
                console.warn(`Audio source ${currentUrlIndex + 1} failed for ${slug}, trying next...`);
                currentUrlIndex++;
                tryNextUrl();
            };

            audio.play().catch((err) => {
                // Check if still mounted before retrying
                if (!isMountedRef.current) {
                    return;
                }
                console.warn('Audio play failed:', err);
                currentUrlIndex++;
                tryNextUrl();
            });
        };

        tryNextUrl();
    }, [surahNumber, verses, selectedReciter]);

    // Stop audio
    const stopAudio = useCallback(() => {
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

    // Info Panel Toggle
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="rq-container">
            {/* Back Link */}
            <Link
                href="/read-quran"
                className="rq-back-btn"
            >
                ← Back to All Surahs
            </Link>

            {/* Surah Header - Simplified Modern Look */}
            <header style={{
                textAlign: 'center',
                margin: '24px 0 40px',
                padding: '32px 24px',
                background: 'linear-gradient(135deg, var(--rq-primary) 0%, #064E3B 100%)',
                borderRadius: '24px',
                color: 'white',
                boxShadow: '0 10px 30px rgba(5, 150, 105, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Pattern Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.3
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        fontFamily: 'var(--font-arabic)',
                        fontSize: '3.5rem',
                        marginBottom: '8px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {chapter.name_arabic}
                    </h1>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: '8px',
                        opacity: 0.95
                    }}>
                        {chapter.name_simple}
                    </h2>
                    <p style={{
                        fontSize: '1rem',
                        opacity: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        {chapter.translated_name.name}
                    </p>

                    {/* Info Toggle Button */}
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        style={{
                            marginTop: '20px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '8px 24px',
                            borderRadius: '50px',
                            color: 'white',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <span>{showInfo ? 'Hide Info' : 'Show Info'}</span>
                        <span style={{ fontSize: '0.8rem' }}>{showInfo ? '▲' : '▼'}</span>
                    </button>
                </div>
            </header>

            {/* Collapsible Surah Info Panel */}
            {showInfo && (
                <div className="rq-info-panel" style={{
                    animation: 'slideDown 0.3s ease-out',
                    marginBottom: '32px'
                }}>
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
                <div className="rq-toolbar-group">
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
                    </div>
                </div>

                <div className="rq-toolbar-group">
                    {/* Play Button */}
                    <button className="rq-toolbar-btn play-btn" onClick={playAll}>
                        {isPlaying ? '⏸️ Pause' : '▶️ Play Audio'}
                    </button>

                    {/* Settings Button */}
                    <button className="rq-toolbar-btn settings-btn" onClick={() => setShowSettings(true)}>
                        ⚙️ Settings
                    </button>
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
                            {/* Verse number in top left */}
                            <span className="rq-verse-number-corner">{verse.verse_number}</span>

                            <div className="rq-verse-arabic">{verse.text_uthmani}</div>
                            <div className="rq-verse-translation">
                                {verse.translations?.[0]?.text || 'Translation not available'}
                            </div>

                            {/* Tafsir Content */}
                            {tafsirId && tafsirContent[verse.verse_key] && (
                                <div className="rq-verse-tafsir" style={{
                                    marginTop: '16px',
                                    padding: '16px',
                                    background: '#F8FAFC',
                                    borderRadius: '8px',
                                    borderLeft: '4px solid var(--rq-primary)',
                                    fontSize: '1rem',
                                    color: '#334155',
                                    fontFamily: 'var(--font-primary)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--rq-primary)' }}>Tafsir:</strong>
                                    <div dangerouslySetInnerHTML={{ __html: tafsirContent[verse.verse_key] }} />
                                </div>
                            )}

                            <div className="rq-verse-actions">
                                <button
                                    className="rq-verse-action-btn"
                                    onClick={() => playVerse(verse.verse_number)}
                                    title="Play"
                                >
                                    🔊
                                </button>
                                <button
                                    className="rq-verse-action-btn"
                                    onClick={() => copyVerse(verse)}
                                    title="Copy"
                                >
                                    📋
                                </button>
                                <button
                                    className={`rq-verse-action-btn ${isBookmarked(verse.verse_key) ? 'active' : ''}`}
                                    onClick={() => toggleBookmark(verse.verse_key)}
                                    title={isBookmarked(verse.verse_key) ? 'Remove Bookmark' : 'Bookmark'}
                                >
                                    {isBookmarked(verse.verse_key) ? '⭐' : '🔖'}
                                </button>
                                <button
                                    className="rq-verse-action-btn"
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
                                            setToastMessage('⚠️ Sharing not supported. Copied to clipboard - use Chrome for native sharing!');
                                            setShowBookmarkToast(true);
                                            setTimeout(() => setShowBookmarkToast(false), 5000);
                                        } catch (clipboardErr) {
                                            // Last resort fallback for older browsers
                                            const textArea = document.createElement('textarea');
                                            textArea.value = shareText + '\n\n' + shareUrl;
                                            document.body.appendChild(textArea);
                                            textArea.select();
                                            document.execCommand('copy');
                                            document.body.removeChild(textArea);
                                            setToastType('warning');
                                            setToastMessage('⚠️ Sharing not supported. Copied to clipboard - use Chrome for native sharing!');
                                            setShowBookmarkToast(true);
                                            setTimeout(() => setShowBookmarkToast(false), 5000);
                                        }
                                    }}
                                    title="Share"
                                >
                                    📤
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    // Reading Mode (Mushaf style)
                    <div className="rq-reading-mode">
                        <div className="rq-reading-text" style={{ fontSize: `${fontSize + 4}px` }}>
                            {verses.map((verse) => (
                                <span key={verse.id}>
                                    {verse.text_uthmani}
                                    <span className="rq-reading-verse-marker">{verse.verse_number}</span>
                                </span>
                            ))}
                        </div>
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
            {isPlaying && currentVerse && (
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
            )}


            {/* Confirmation Modal */}
            {pendingChange && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
            )}

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
            {showSettings && (
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
            )}

            {/* Toast Notification */}
            {showBookmarkToast && (
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
            )}
        </div>
    );
}
