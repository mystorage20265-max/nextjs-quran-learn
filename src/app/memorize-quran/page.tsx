// Memorize Quran Page - Advanced Redesign
// Mobile-first, Light UI, Focus Mode, Hide/Reveal
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import './styles/memorize-quran.css';
import SurahCard from './components/SurahCard';
import VerseCard from './components/VerseCard';
import BottomPlayer from './components/BottomPlayer';
import FocusMode from './components/FocusMode';

interface Chapter {
    id: number;
    name: string;
    nameArabic: string;
    nameTranslation: string;
    versesCount: number;
    revelationPlace: string;
}

interface Verse {
    id: number;
    verseKey: string;
    verseNumber: number;
    textUthmani: string;
    translation: string;
}

interface Reciter {
    id: number;
    name: string;
    style: string;
}

type ViewMode = 'selection' | 'player';

export default function MemorizeQuranPage() {
    // UI State
    const [viewMode, setViewMode] = useState<ViewMode>('selection');
    const [searchQuery, setSearchQuery] = useState('');
    const [focusModeActive, setFocusModeActive] = useState(false);
    const [hideModeActive, setHideModeActive] = useState(false);
    const [revealedVerses, setRevealedVerses] = useState<Set<number>>(new Set());
    const [showSettings, setShowSettings] = useState(false);

    // Data State
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [reciters, setReciters] = useState<Reciter[]>([]);
    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingVerses, setLoadingVerses] = useState(false);

    // Selection state
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [selectedReciter, setSelectedReciter] = useState<number>(7);
    const [fromVerse, setFromVerse] = useState<number>(1);
    const [toVerse, setToVerse] = useState<number>(7);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(-1);
    const [loopEnabled, setLoopEnabled] = useState(false);
    const [repeatCount, setRepeatCount] = useState(3);
    const [currentRepeat, setCurrentRepeat] = useState(0);
    const [pauseBetweenVerses, setPauseBetweenVerses] = useState(2);

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isPlayingRef = useRef(false);

    // Fetch chapters and reciters on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [chaptersRes, recitersRes] = await Promise.all([
                    fetch('/api/memorize-quran?action=chapters'),
                    fetch('/api/memorize-quran?action=reciters')
                ]);

                const chaptersData = await chaptersRes.json();
                const recitersData = await recitersRes.json();

                setChapters(chaptersData.chapters || []);
                setReciters(recitersData.reciters || []);

                if (chaptersData.chapters?.[0]) {
                    setToVerse(Math.min(7, chaptersData.chapters[0].versesCount));
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
        return () => { stopPlayback(); };
    }, []);

    // Fetch verses when chapter or range changes
    useEffect(() => {
        if (selectedChapter && viewMode === 'player') {
            fetchVerses();
        }
    }, [selectedChapter, fromVerse, toVerse, viewMode]);

    const fetchVerses = async () => {
        setLoadingVerses(true);
        try {
            const res = await fetch(
                `/api/memorize-quran?action=verses&chapter=${selectedChapter}&from=${fromVerse}&to=${toVerse}`
            );
            const data = await res.json();
            setVerses(data.verses || []);
            setRevealedVerses(new Set()); // Reset revealed state
        } catch (error) {
            console.error('Error fetching verses:', error);
        } finally {
            setLoadingVerses(false);
        }
    };

    const handleChapterSelect = (chapterId: number) => {
        const chapter = chapters.find(c => c.id === chapterId);
        if (chapter) {
            setSelectedChapter(chapterId);
            setFromVerse(1);
            setToVerse(Math.min(7, chapter.versesCount));
            setViewMode('player');
            stopPlayback();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBackToSelection = () => {
        stopPlayback();
        setViewMode('selection');
        setFocusModeActive(false);
        setHideModeActive(false);
    };

    const filteredChapters = chapters.filter(chapter =>
        chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.nameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.nameArabic.includes(searchQuery) ||
        chapter.id.toString().includes(searchQuery)
    );

    // Audio playback functions
    const playVerseAudio = useCallback(async (verse: Verse): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(
                    `/api/memorize-quran?action=audio&reciter=${selectedReciter}&verseKey=${verse.verseKey}`
                );
                const data = await res.json();

                if (!data.audioUrl) {
                    reject(new Error('Audio URL not found'));
                    return;
                }

                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }

                audioRef.current = new Audio(data.audioUrl);
                audioRef.current.onended = () => resolve();
                audioRef.current.onerror = () => reject(new Error('Audio playback failed'));
                await audioRef.current.play();
            } catch (error) {
                reject(error);
            }
        });
    }, [selectedReciter]);

    const playSequence = useCallback(async () => {
        if (verses.length === 0) return;

        isPlayingRef.current = true;
        let verseIndex = currentVerseIndex >= 0 ? currentVerseIndex : 0;
        let repeatNum = (verseIndex === currentVerseIndex) ? currentRepeat : 0;

        const playNext = async () => {
            if (!isPlayingRef.current) return;

            if (verseIndex >= verses.length) {
                if (loopEnabled) {
                    verseIndex = 0;
                    repeatNum = 0;
                } else {
                    stopPlayback();
                    return;
                }
            }

            const verse = verses[verseIndex];
            setCurrentVerseIndex(verseIndex);
            setCurrentRepeat(repeatNum + 1);

            try {
                await playVerseAudio(verse);

                if (repeatNum < repeatCount - 1) {
                    repeatNum++;
                    playbackTimeoutRef.current = setTimeout(() => {
                        if (isPlayingRef.current) playNext();
                    }, 500);
                } else {
                    verseIndex++;
                    repeatNum = 0;
                    playbackTimeoutRef.current = setTimeout(() => {
                        if (isPlayingRef.current) playNext();
                    }, pauseBetweenVerses * 1000);
                }
            } catch (error) {
                console.error('Playback error:', error);
                verseIndex++;
                repeatNum = 0;
                if (isPlayingRef.current) playNext();
            }
        };

        playNext();
    }, [verses, loopEnabled, repeatCount, pauseBetweenVerses, playVerseAudio, currentVerseIndex, currentRepeat]);

    const startPlayback = () => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        if (currentVerseIndex === -1) {
            setCurrentVerseIndex(0);
            setCurrentRepeat(0);
        }
        playSequence();
    };

    const stopPlayback = () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentVerseIndex(-1);
        setCurrentRepeat(0);

        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
            playbackTimeoutRef.current = null;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const pausePlayback = () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
        if (audioRef.current) audioRef.current.pause();
    };

    const resumePlayback = () => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        if (audioRef.current && !audioRef.current.ended) {
            audioRef.current.play();
            playSequence();
        } else {
            startPlayback();
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            pausePlayback();
        } else if (currentVerseIndex >= 0) {
            resumePlayback();
        } else {
            startPlayback();
        }
    };

    const handlePrevVerse = () => {
        if (currentVerseIndex > 0) {
            pausePlayback();
            setCurrentVerseIndex(currentVerseIndex - 1);
            setCurrentRepeat(0);
        }
    };

    const handleNextVerse = () => {
        if (currentVerseIndex < verses.length - 1) {
            pausePlayback();
            setCurrentVerseIndex(currentVerseIndex + 1);
            setCurrentRepeat(0);
        }
    };

    const playSingleVerse = async (verse: Verse, index: number) => {
        stopPlayback();
        setCurrentVerseIndex(index);
        setIsPlaying(true);
        isPlayingRef.current = true;

        try {
            await playVerseAudio(verse);
        } catch (error) {
            console.error('Single verse playback error:', error);
        } finally {
            setIsPlaying(false);
            isPlayingRef.current = false;
        }
    };

    const handleRevealVerse = (index: number) => {
        setRevealedVerses(prev => new Set([...prev, index]));
    };

    const toggleHideMode = () => {
        setHideModeActive(!hideModeActive);
        setRevealedVerses(new Set()); // Reset reveals
    };

    const revealAllVerses = () => {
        setRevealedVerses(new Set(verses.map((_, i) => i)));
    };

    const currentChapter = chapters.find(c => c.id === selectedChapter);
    const progress = verses.length > 0 && currentVerseIndex >= 0
        ? ((currentVerseIndex + 1) / verses.length) * 100
        : 0;

    if (loading) {
        return (
            <main className="memorize-page">
                <div className="memorize-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Loading Memorize Quran...</p>
                    </div>
                </div>
            </main>
        );
    }

    // Focus Mode View
    if (focusModeActive && currentVerseIndex >= 0 && verses[currentVerseIndex]) {
        return (
            <FocusMode
                verseText={verses[currentVerseIndex].textUthmani}
                verseNumber={verses[currentVerseIndex].verseNumber}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onPrev={handlePrevVerse}
                onNext={handleNextVerse}
                onClose={() => setFocusModeActive(false)}
            />
        );
    }

    return (
        <main className="memorize-page">
            <div className="memorize-container">
                {/* Header */}
                <header className="memorize-header">
                    <h1 className="memorize-title">
                        <i className="fas fa-brain"></i>
                        Memorize Quran
                        <span className="memorize-title-arabic">حفظ القرآن</span>
                    </h1>
                    <p className="memorize-subtitle">
                        Master the Quran verse by verse with focused learning
                    </p>
                </header>

                {/* VIEW: SELECTION */}
                {viewMode === 'selection' && (
                    <section className="memorize-selection">
                        <div className="mq-search-container">
                            <i className="fas fa-search mq-search-icon"></i>
                            <input
                                type="text"
                                className="mq-search-input"
                                placeholder="Search Surah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="mq-surah-grid">
                            {filteredChapters.map((chapter) => (
                                <SurahCard
                                    key={chapter.id}
                                    chapter={chapter}
                                    onClick={() => handleChapterSelect(chapter.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* VIEW: PLAYER */}
                {viewMode === 'player' && currentChapter && (
                    <div className="memorize-controls-wrapper">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button className="back-btn" onClick={handleBackToSelection}>
                                <i className="fas fa-arrow-left"></i>
                                Back
                            </button>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className={`focus-mode-toggle ${hideModeActive ? 'active' : ''}`}
                                    onClick={toggleHideMode}
                                >
                                    <i className="fas fa-eye-slash"></i>
                                    {hideModeActive ? 'Hide On' : 'Test Me'}
                                </button>
                                <button
                                    className={`focus-mode-toggle ${focusModeActive ? 'active' : ''}`}
                                    onClick={() => {
                                        if (currentVerseIndex < 0) setCurrentVerseIndex(0);
                                        setFocusModeActive(true);
                                    }}
                                >
                                    <i className="fas fa-expand"></i>
                                    Focus
                                </button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <section className="memorize-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className="panel-section-title" style={{ marginBottom: 0 }}>
                                    <i className="fas fa-book-open"></i>
                                    {currentChapter.name}
                                </h2>
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--mq-text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                    onClick={() => setShowSettings(!showSettings)}
                                >
                                    <i className={`fas fa-${showSettings ? 'chevron-up' : 'cog'}`}></i>
                                    {showSettings ? 'Less' : 'Settings'}
                                </button>
                            </div>

                            {showSettings && (
                                <div className="controls-grid" style={{ marginTop: '1rem' }}>
                                    <div className="control-group">
                                        <label className="control-label">
                                            <i className="fas fa-microphone"></i>
                                            Reciter
                                        </label>
                                        <select
                                            className="control-select"
                                            value={selectedReciter}
                                            onChange={(e) => setSelectedReciter(parseInt(e.target.value))}
                                        >
                                            {reciters.map((reciter) => (
                                                <option key={reciter.id} value={reciter.id}>
                                                    {reciter.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="control-group">
                                        <label className="control-label">
                                            <i className="fas fa-list-ol"></i>
                                            Verses ({currentChapter.versesCount} total)
                                        </label>
                                        <div className="verse-range">
                                            <input
                                                type="number"
                                                className="control-input"
                                                min={1}
                                                max={currentChapter.versesCount}
                                                value={fromVerse}
                                                onChange={(e) => setFromVerse(Math.max(1, Math.min(parseInt(e.target.value) || 1, currentChapter.versesCount)))}
                                            />
                                            <span className="verse-range-separator">to</span>
                                            <input
                                                type="number"
                                                className="control-input"
                                                min={fromVerse}
                                                max={currentChapter.versesCount}
                                                value={toVerse}
                                                onChange={(e) => setToVerse(Math.max(fromVerse, Math.min(parseInt(e.target.value) || fromVerse, currentChapter.versesCount)))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showSettings && (
                                <div className="loop-settings">
                                    <div className="loop-setting">
                                        <i className="fas fa-redo"></i>
                                        <span>Repeat:</span>
                                        <input
                                            type="number"
                                            className="loop-input control-input"
                                            min={1}
                                            max={10}
                                            value={repeatCount}
                                            onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                                        />
                                        <span>×</span>
                                    </div>
                                    <div className="loop-setting">
                                        <i className="fas fa-clock"></i>
                                        <span>Pause:</span>
                                        <input
                                            type="number"
                                            className="loop-input control-input"
                                            min={0}
                                            max={10}
                                            value={pauseBetweenVerses}
                                            onChange={(e) => setPauseBetweenVerses(Math.max(0, parseInt(e.target.value) || 0))}
                                        />
                                        <span>sec</span>
                                    </div>
                                    <button
                                        className={`player-btn ${loopEnabled ? 'player-btn-active' : 'player-btn-secondary'}`}
                                        onClick={() => setLoopEnabled(!loopEnabled)}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        <i className="fas fa-infinity"></i>
                                        Loop
                                    </button>
                                </div>
                            )}

                            {/* Progress */}
                            {currentVerseIndex >= 0 && (
                                <div className="memorize-progress">
                                    <div className="progress-label">
                                        <span>
                                            Verse {currentVerseIndex + 1} of {verses.length} • Repeat {currentRepeat}/{repeatCount}
                                        </span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Hide Mode Controls */}
                        {hideModeActive && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <button
                                    className="player-btn player-btn-secondary"
                                    onClick={() => setRevealedVerses(new Set())}
                                >
                                    <i className="fas fa-eye-slash"></i> Hide All
                                </button>
                                <button
                                    className="player-btn player-btn-primary"
                                    onClick={revealAllVerses}
                                >
                                    <i className="fas fa-eye"></i> Reveal All
                                </button>
                            </div>
                        )}

                        {/* Verses Display */}
                        <section className="verses-container">
                            {loadingVerses ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p className="loading-text">Loading verses...</p>
                                </div>
                            ) : (
                                <div className="verses-list">
                                    {verses.map((verse, index) => (
                                        <VerseCard
                                            key={verse.id}
                                            verse={verse}
                                            index={index}
                                            isActive={currentVerseIndex === index}
                                            isHideMode={hideModeActive}
                                            isRevealed={revealedVerses.has(index)}
                                            onPlay={() => playSingleVerse(verse, index)}
                                            onReveal={() => handleRevealVerse(index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Bottom Player */}
                        {verses.length > 0 && (
                            <BottomPlayer
                                isPlaying={isPlaying}
                                currentVerse={currentVerseIndex >= 0 ? currentVerseIndex : 0}
                                totalVerses={verses.length}
                                currentRepeat={currentRepeat}
                                repeatCount={repeatCount}
                                onPlayPause={handlePlayPause}
                                onPrev={handlePrevVerse}
                                onNext={handleNextVerse}
                                onStop={stopPlayback}
                            />
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
