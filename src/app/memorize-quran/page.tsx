// Memorize Quran Page - Redesigned
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import './styles/memorize-quran.css';
import SurahCard from './components/SurahCard';

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

    // Data State
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [reciters, setReciters] = useState<Reciter[]>([]);
    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingVerses, setLoadingVerses] = useState(false);

    // Selection state
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [selectedReciter, setSelectedReciter] = useState<number>(7); // Mishary Alafasy
    const [fromVerse, setFromVerse] = useState<number>(1);
    const [toVerse, setToVerse] = useState<number>(7);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(-1);
    const [loopEnabled, setLoopEnabled] = useState(false);
    const [repeatCount, setRepeatCount] = useState(3);
    const [currentRepeat, setCurrentRepeat] = useState(0);
    const [pauseBetweenVerses, setPauseBetweenVerses] = useState(2); // seconds

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

                // Set default toVerse based on first chapter
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

        // Cleanup on unmount
        return () => {
            stopPlayback();
        };
    }, []);

    // Fetch verses when chapter or range changes (only if in player mode or pre-fetching)
    useEffect(() => {
        if (selectedChapter && viewMode === 'player') {
            fetchVerses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChapter, fromVerse, toVerse, viewMode]);

    const fetchVerses = async () => {
        setLoadingVerses(true);
        try {
            const res = await fetch(
                `/api/memorize-quran?action=verses&chapter=${selectedChapter}&from=${fromVerse}&to=${toVerse}`
            );
            const data = await res.json();
            setVerses(data.verses || []);
        } catch (error) {
            console.error('Error fetching verses:', error);
        } finally {
            setLoadingVerses(false);
        }
    };

    // Handle chapter selection from grid
    const handleChapterSelect = (chapterId: number) => {
        const chapter = chapters.find(c => c.id === chapterId);
        if (chapter) {
            setSelectedChapter(chapterId);
            setFromVerse(1);
            setToVerse(Math.min(7, chapter.versesCount));
            setViewMode('player');
            stopPlayback();
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBackToSelection = () => {
        stopPlayback();
        setViewMode('selection');
    };

    // Filter chapters based on search
    const filteredChapters = chapters.filter(chapter =>
        chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.nameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.nameArabic.includes(searchQuery) ||
        chapter.id.toString().includes(searchQuery)
    );

    // Audio playback functions (Same as before)
    const playVerseAudio = useCallback(async (verse: Verse): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                // Fetch audio URL
                const res = await fetch(
                    `/api/memorize-quran?action=audio&reciter=${selectedReciter}&verseKey=${verse.verseKey}`
                );
                const data = await res.json();

                if (!data.audioUrl) {
                    reject(new Error('Audio URL not found'));
                    return;
                }

                // Stop any existing audio
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }

                // Create new audio element
                audioRef.current = new Audio(data.audioUrl);

                audioRef.current.onended = () => {
                    resolve();
                };

                audioRef.current.onerror = () => {
                    reject(new Error('Audio playback failed'));
                };

                await audioRef.current.play();
            } catch (error) {
                reject(error);
            }
        });
    }, [selectedReciter]);

    const playSequence = useCallback(async () => {
        if (verses.length === 0) return;

        isPlayingRef.current = true;
        let verseIndex = 0;
        // Resume from current index if valid
        if (currentVerseIndex !== -1 && currentVerseIndex < verses.length) {
            verseIndex = currentVerseIndex;
        }

        // Reset repeats if starting fresh or new index
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

            // Only increment repeats if we are repeating the SAME verse
            // If it's a new verse, repeatNum starts at 0 (1st play)
            // But UI displays 1-based index (Repeat 1/3)
            setCurrentRepeat(repeatNum + 1);

            try {
                await playVerseAudio(verse);

                // Check if we need to repeat this verse
                if (repeatNum < repeatCount - 1) {
                    repeatNum++;
                    // Small pause before repeat
                    playbackTimeoutRef.current = setTimeout(() => {
                        if (isPlayingRef.current) playNext();
                    }, 500);
                } else {
                    // Move to next verse
                    verseIndex++;
                    repeatNum = 0;
                    // Pause between verses
                    playbackTimeoutRef.current = setTimeout(() => {
                        if (isPlayingRef.current) playNext();
                    }, pauseBetweenVerses * 1000);
                }
            } catch (error) {
                console.error('Playback error:', error);
                // Try next verse on error
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
        // If restarting, reset indices unless resuming
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

        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const resumePlayback = () => {
        setIsPlaying(true);
        isPlayingRef.current = true;

        // If audio is loaded and paused, just play it
        if (audioRef.current && !audioRef.current.ended) {
            audioRef.current.play();
            // We need to hook back into the sequence after this audio ends
            // simpler to just restart sequence logic from current index?
            // Re-triggering sequence logic is safer for loops/repeats
            playSequence();
        } else {
            startPlayback();
        }
    };

    // Play single verse
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

    // Calculate progress
    const progress = verses.length > 0 && currentVerseIndex >= 0
        ? ((currentVerseIndex + 1) / verses.length) * 100
        : 0;

    const currentChapter = chapters.find(c => c.id === selectedChapter);

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
                        Master the Quran verse by verse with loop, repeat, and pause controls
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
                                placeholder="Search Surah by name or number..."
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
                        <button className="back-btn" onClick={handleBackToSelection}>
                            <i className="fas fa-arrow-left"></i>
                            Select different Surah
                        </button>

                        {/* Controls Panel */}
                        <section className="memorize-panel">
                            <h2 className="panel-section-title">
                                <i className="fas fa-sliders-h"></i>
                                Settings for {currentChapter.name}
                            </h2>
                            <div className="controls-grid">
                                {/* Reciter Selector */}
                                <div className="control-group">
                                    <label className="control-label">
                                        <i className="fas fa-microphone"></i>
                                        Select Reciter
                                    </label>
                                    <select
                                        className="control-select"
                                        value={selectedReciter}
                                        onChange={(e) => setSelectedReciter(parseInt(e.target.value))}
                                    >
                                        {reciters.map((reciter) => (
                                            <option key={reciter.id} value={reciter.id}>
                                                {reciter.name} ({reciter.style})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Verse Range */}
                                <div className="control-group">
                                    <label className="control-label">
                                        <i className="fas fa-list-ol"></i>
                                        Verse Range (Max {currentChapter.versesCount})
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

                            {/* Loop Settings */}
                            <div className="loop-settings">
                                <div className="loop-setting">
                                    <label>Repeat each verse:</label>
                                    <input
                                        type="number"
                                        className="loop-input control-input"
                                        min={1}
                                        max={10}
                                        value={repeatCount}
                                        onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <span>times</span>
                                </div>
                                <div className="loop-setting">
                                    <label>Pause between:</label>
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
                            </div>

                            {/* Player Controls */}
                            <div className="player-buttons">
                                {!isPlaying ? (
                                    <button className="player-btn player-btn-primary" onClick={startPlayback}>
                                        <i className="fas fa-play"></i>
                                        Start Memorization
                                    </button>
                                ) : (
                                    <>
                                        <button className="player-btn player-btn-secondary" onClick={pausePlayback}>
                                            <i className="fas fa-pause"></i>
                                            Pause
                                        </button>
                                        {/* Resume is same as Play really, but contextually different */}
                                        <button className="player-btn player-btn-primary" onClick={resumePlayback}>
                                            <i className="fas fa-play"></i>
                                            Resume
                                        </button>
                                    </>
                                )}
                                <button className="player-btn player-btn-secondary" onClick={stopPlayback}>
                                    <i className="fas fa-stop"></i>
                                    Stop
                                </button>
                                <button
                                    className={`player-btn ${loopEnabled ? 'player-btn-active' : 'player-btn-secondary'}`}
                                    onClick={() => setLoopEnabled(!loopEnabled)}
                                    title="Loop selected range"
                                >
                                    <i className="fas fa-redo"></i>
                                    Loop Range
                                </button>
                            </div>

                            {/* Progress */}
                            {currentVerseIndex >= 0 && (
                                <div className="memorize-progress">
                                    <div className="progress-label">
                                        <span>
                                            Verse {currentVerseIndex + 1} of {verses.length} | Repeat {currentRepeat}/{repeatCount}
                                        </span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </section>

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
                                        <article
                                            key={verse.id}
                                            className={`verse-card ${currentVerseIndex === index ? 'active' : ''}`}
                                            onClick={() => playSingleVerse(verse, index)}
                                        >
                                            <div className="verse-header">
                                                <span className="verse-number">{verse.verseNumber}</span>
                                                <button
                                                    className="verse-play-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playSingleVerse(verse, index);
                                                    }}
                                                    aria-label={`Play verse ${verse.verseNumber}`}
                                                >
                                                    <i className="fas fa-play"></i>
                                                </button>
                                            </div>
                                            <p className="verse-arabic">
                                                {verse.textUthmani}
                                                <span className="verse-end"> ۝ </span>
                                            </p>
                                            <p className="verse-translation">{verse.translation}</p>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
}
