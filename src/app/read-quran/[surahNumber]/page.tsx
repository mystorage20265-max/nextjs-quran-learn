'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import Link from 'next/link';
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

    // State
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [verses, setVerses] = useState<VerseWithTranslation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Settings
    const [readingMode, setReadingMode] = useState<'translation' | 'reading'>('translation');
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

    // Load bookmarks from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('quran-bookmarks');
            if (saved) {
                setBookmarks(JSON.parse(saved));
            }
        }
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
        // Find the verse to get its global ID
        const verse = verses.find(v => v.verse_number === verseNumber);
        if (!verse) {
            console.error('Verse not found:', verseNumber);
            return;
        }

        // Use multiple audio source formats
        // Islamic Network CDN uses global ayah numbers (1-6236)
        const globalAyahId = verse.id; // This is the global verse number
        const surahPadded = surahNumber.toString().padStart(3, '0');
        const versePadded = verseNumber.toString().padStart(3, '0');

        // Try multiple audio sources with different formats
        const audioUrls = [
            // Islamic Network - uses global ayah number
            `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahId}.mp3`,
            // EveryAyah - uses padded surah+verse format
            `https://everyayah.com/data/Alafasy_128kbps/${surahPadded}${versePadded}.mp3`,
            // Quran.com verses CDN
            `https://verses.quran.com/Alafasy/mp3/${surahNumber}_${verseNumber}.mp3`,
            // Backup: entire surah audio
            `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`
        ];

        if (audioRef.current) {
            audioRef.current.pause();
        }

        let currentUrlIndex = 0;

        const tryNextUrl = () => {
            if (currentUrlIndex >= audioUrls.length) {
                console.error('All audio sources failed');
                setIsPlaying(false);
                return;
            }

            const audio = new Audio(audioUrls[currentUrlIndex]);
            audioRef.current = audio;

            audio.onplay = () => {
                setIsPlaying(true);
                setCurrentVerse(verseNumber);
            };

            audio.onended = () => {
                // Auto-play next verse
                if (verseNumber < verses.length) {
                    playVerse(verseNumber + 1);
                } else {
                    setIsPlaying(false);
                    setCurrentVerse(null);
                }
            };

            audio.onerror = () => {
                console.warn(`Audio source ${currentUrlIndex + 1} failed, trying next...`);
                currentUrlIndex++;
                tryNextUrl();
            };

            audio.play().catch((err) => {
                console.warn('Audio play failed:', err);
                currentUrlIndex++;
                tryNextUrl();
            });
        };

        tryNextUrl();
    }, [surahNumber, verses]);

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

    // Copy verse
    const copyVerse = useCallback((verse: VerseWithTranslation) => {
        const text = `${verse.text_uthmani}\n\n${verse.translations[0]?.text || ''}\n\n— Quran ${surahNumber}:${verse.verse_number}`;
        navigator.clipboard.writeText(text);
    }, [surahNumber]);

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
            {/* Back Link */}
            <Link
                href="/read-quran"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--rq-text-secondary)',
                    textDecoration: 'none',
                    marginBottom: '16px',
                    fontSize: '0.95rem'
                }}
            >
                ← Back to All Surahs
            </Link>

            {/* Surah Header */}
            <header className="rq-surah-header">
                <h1 className="rq-surah-title">{chapter.name_arabic}</h1>
                <h2 className="rq-surah-title-en">{chapter.name_simple}</h2>
                <p className="rq-surah-subtitle">
                    {chapter.translated_name.name} • {chapter.verses_count} Verses • {chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}
                </p>
            </header>

            {/* Surah Info Panel */}
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
                    <button className="rq-toolbar-btn" onClick={playAll}>
                        {isPlaying ? '⏸️ Pause' : '▶️ Play Audio'}
                    </button>

                    {/* Settings Button */}
                    <button className="rq-toolbar-btn" onClick={() => setShowSettings(true)}>
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
                        >
                            <div className="rq-verse-arabic" style={{ fontSize: `${fontSize}px` }}>
                                {verse.text_uthmani}
                                <span className="rq-verse-number">{verse.verse_number}</span>
                            </div>
                            <div className="rq-verse-translation">
                                {verse.translations?.[0]?.text || 'Translation not available'}
                            </div>
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
                                    style={isBookmarked(verse.verse_key) ? { background: 'var(--rq-primary)', color: 'white' } : {}}
                                >
                                    {isBookmarked(verse.verse_key) ? '⭐' : '🔖'}
                                </button>
                                <button
                                    className="rq-verse-action-btn"
                                    onClick={() => {
                                        const shareText = `${verse.text_uthmani}\n\n${verse.translations?.[0]?.text || ''}\n\n— Quran ${verse.verse_key}`;
                                        if (navigator.share) {
                                            navigator.share({
                                                title: `Quran ${verse.verse_key}`,
                                                text: shareText,
                                            }).catch(console.error);
                                        } else {
                                            navigator.clipboard.writeText(shareText);
                                            setToastMessage('Copied to clipboard for sharing!');
                                            setShowBookmarkToast(true);
                                            setTimeout(() => setShowBookmarkToast(false), 2000);
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
                                    {' '}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '32px 0',
                marginTop: '32px',
                borderTop: '1px solid var(--rq-border)'
            }}>
                {surahNumber > 1 && (
                    <Link
                        href={`/read-quran/${surahNumber - 1}`}
                        className="rq-toolbar-btn"
                    >
                        ← Previous Surah
                    </Link>
                )}
                <div style={{ flex: 1 }} />
                {surahNumber < 114 && (
                    <Link
                        href={`/read-quran/${surahNumber + 1}`}
                        className="rq-toolbar-btn"
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
                        onChange={(e) => setSelectedTranslation(e.target.value)}
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
                        onChange={(e) => setSelectedReciter(parseInt(e.target.value))}
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
                    background: 'var(--rq-primary)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 2000,
                    animation: 'fadeIn 0.3s ease'
                }}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
