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
    const [selectedTranslation, setSelectedTranslation] = useState(131);
    const [selectedReciter, setSelectedReciter] = useState(7);
    const [fontSize, setFontSize] = useState(28);
    const [showSettings, setShowSettings] = useState(false);

    // Audio
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerse, setCurrentVerse] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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

    // Play verse audio
    const playVerse = useCallback((verseNumber: number) => {
        const verseKey = `${surahNumber}:${verseNumber}`;
        const audioUrl = `https://verses.quran.com/Alafasy/mp3/${verseKey.replace(':', '_')}.mp3`;

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(audioUrl);
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
            console.error('Audio failed to load');
            setIsPlaying(false);
        };

        audio.play().catch(console.error);
    }, [surahNumber, verses.length]);

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
                                <button className="rq-verse-action-btn" title="Bookmark">
                                    🔖
                                </button>
                                <button className="rq-verse-action-btn" title="Share">
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
                        onChange={(e) => setSelectedTranslation(parseInt(e.target.value))}
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
        </div>
    );
}
