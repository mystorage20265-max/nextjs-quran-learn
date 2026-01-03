// Memorize Quran Page - Complete Feature with Quran.com API
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import './styles/memorize-quran.css';

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

export default function MemorizeQuranPage() {
    // State
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

    // Fetch verses when chapter or range changes
    useEffect(() => {
        if (selectedChapter) {
            fetchVerses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChapter, fromVerse, toVerse]);

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

    // Handle chapter change
    const handleChapterChange = (chapterId: number) => {
        setSelectedChapter(chapterId);
        const chapter = chapters.find(c => c.id === chapterId);
        if (chapter) {
            setFromVerse(1);
            setToVerse(Math.min(7, chapter.versesCount));
        }
        stopPlayback();
    };

    // Audio playback functions
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
        let repeatNum = 0;

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
    }, [verses, loopEnabled, repeatCount, pauseBetweenVerses, playVerseAudio]);

    const startPlayback = () => {
        setIsPlaying(true);
        isPlayingRef.current = true;
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

        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const resumePlayback = () => {
        if (audioRef.current && currentVerseIndex >= 0) {
            setIsPlaying(true);
            isPlayingRef.current = true;
            audioRef.current.play();
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

    const currentChapter = chapters.find(c => c.id === selectedChapter);

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

                {/* Controls Panel */}
                <section className="memorize-controls">
                    <div className="controls-grid">
                        {/* Surah Selector */}
                        <div className="control-group">
                            <label className="control-label">
                                <i className="fas fa-book-quran"></i>
                                Select Surah
                            </label>
                            <select
                                className="control-select"
                                value={selectedChapter}
                                onChange={(e) => handleChapterChange(parseInt(e.target.value))}
                            >
                                {chapters.map((chapter) => (
                                    <option key={chapter.id} value={chapter.id}>
                                        {chapter.id}. {chapter.name} ({chapter.nameArabic}) - {chapter.versesCount} verses
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                Verse Range
                            </label>
                            <div className="verse-range">
                                <input
                                    type="number"
                                    className="control-input"
                                    min={1}
                                    max={currentChapter?.versesCount || 1}
                                    value={fromVerse}
                                    onChange={(e) => setFromVerse(parseInt(e.target.value) || 1)}
                                />
                                <span className="verse-range-separator">to</span>
                                <input
                                    type="number"
                                    className="control-input"
                                    min={fromVerse}
                                    max={currentChapter?.versesCount || 1}
                                    value={toVerse}
                                    onChange={(e) => setToVerse(parseInt(e.target.value) || fromVerse)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Player Controls */}
                <section className="player-controls">
                    <div className="player-buttons">
                        {!isPlaying ? (
                            <button className="player-btn player-btn-primary" onClick={startPlayback}>
                                <i className="fas fa-play"></i>
                                Play All
                            </button>
                        ) : (
                            <>
                                <button className="player-btn player-btn-secondary" onClick={pausePlayback}>
                                    <i className="fas fa-pause"></i>
                                    Pause
                                </button>
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
                        >
                            <i className="fas fa-redo"></i>
                            Loop {loopEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* Loop Settings */}
                    <div className="loop-settings">
                        <div className="loop-setting">
                            <label>Repeat each verse:</label>
                            <input
                                type="number"
                                min={1}
                                max={10}
                                value={repeatCount}
                                onChange={(e) => setRepeatCount(parseInt(e.target.value) || 1)}
                            />
                            <span>times</span>
                        </div>
                        <div className="loop-setting">
                            <label>Pause between verses:</label>
                            <input
                                type="number"
                                min={0}
                                max={10}
                                value={pauseBetweenVerses}
                                onChange={(e) => setPauseBetweenVerses(parseInt(e.target.value) || 0)}
                            />
                            <span>seconds</span>
                        </div>
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
        </main>
    );
}
