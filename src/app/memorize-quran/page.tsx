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
    const [playbackRate, setPlaybackRate] = useState(1);
    const [verseRatings, setVerseRatings] = useState<Record<string, 'hard' | 'easy' | null>>({});

    // Challenge Mode State
    const [challengeLevel, setChallengeLevel] = useState<0 | 1 | 2>(0);
    const [revealedWords, setRevealedWords] = useState<Record<string, Set<number>>>({});
    const [mistakes, setMistakes] = useState(0);

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

    // Apply playback rate to audio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

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

    const toggleHideMode = () => {
        setHideModeActive(!hideModeActive);
        setRevealedVerses(new Set()); // Reset reveals
    };

    const toggleChallengeMode = () => {
        setChallengeLevel(prev => (prev === 2 ? 0 : prev + 1) as 0 | 1 | 2);
        setRevealedWords({}); // Reset revealed words
        setMistakes(0); // Reset mistakes
    };

    const handleWordClick = (verseKey: string, wordIndex: number) => {
        if (challengeLevel === 0) return;
        setRevealedWords(prev => {
            const currentSet = prev[verseKey] || new Set();
            if (currentSet.has(wordIndex)) return prev;

            const newSet = new Set(currentSet);
            newSet.add(wordIndex);

            // Increment mistakes only if it was actually masked
            setMistakes(m => m + 1);

            return { ...prev, [verseKey]: newSet };
        });
    };

    // Helper to render verse with masked words
    const renderChallengeVerse = (verse: Verse) => {
        if (challengeLevel === 0) return <div className="verse-arabic">{verse.textUthmani}</div>;

        const words = verse.textUthmani.split(' ');
        return (
            <div className="verse-arabic challenge-mode">
                {words.map((word, idx) => {
                    // Simple deterministic random based on verse id + word index
                    const isMasked = (verse.id * 7 + idx * 13) % 10 < (challengeLevel * 3);
                    const isRevealed = revealedWords[verse.verseKey]?.has(idx);

                    if (isMasked && !isRevealed) {
                        return (
                            <span
                                key={idx}
                                className="word-masked"
                                onClick={() => handleWordClick(verse.verseKey, idx)}
                            >
                                {word.replace(/./g, '?')}
                            </span>
                        );
                    }
                    return <span key={idx} className="word-visible">{word} </span>;
                })}
            </div>
        );
    };

    const handleRating = (verseKey: string, rating: 'hard' | 'easy') => {
        setVerseRatings(prev => ({
            ...prev,
            [verseKey]: prev[verseKey] === rating ? null : rating
        }));
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
                audioRef.current.playbackRate = playbackRate; // Apply rate
                audioRef.current.onended = () => resolve();
                audioRef.current.onerror = () => reject(new Error('Audio playback failed'));
                await audioRef.current.play();
            } catch (error) {
                reject(error);
            }
        });
    }, [selectedReciter, playbackRate]); // Add playbackRate dependency

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



    const revealAllVerses = () => {
        setRevealedVerses(new Set(verses.map((_, i) => i)));
    };

    // Keyboard Shortcuts - placed after function definitions
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (viewMode !== 'player') return;
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case 'ArrowLeft':
                    handlePrevVerse();
                    break;
                case 'ArrowRight':
                    handleNextVerse();
                    break;
                case 'KeyH':
                    toggleHideMode();
                    break;
                case 'KeyC':
                    toggleChallengeMode();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }); // No dependencies - re-attaches on every render with latest function references

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
                verseTranslation={verses[currentVerseIndex].translation}
                verseNumber={verses[currentVerseIndex].verseNumber}
                isPlaying={isPlaying}
                currentRepeat={currentRepeat}
                repeatCount={repeatCount}
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
                {/* VIEW: SELECTION */}
                {viewMode === 'selection' && (
                    <>
                        {/* Header */}
                        <header className="memorize-header">
                            <h1 className="memorize-title">
                                Memorize Quran
                                <span className="memorize-title-arabic">حفظ القرآن</span>
                            </h1>
                            <p className="memorize-subtitle">
                                Master the Quran verse by verse with focused learning
                            </p>
                        </header>

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
                    </>
                )}

                {/* VIEW: PLAYER */}
                {viewMode === 'player' && currentChapter && (
                    <div className="memorize-player-view">
                        {/* Unified Sticky Header */}
                        <div className="mq-player-header">
                            <button className="back-btn-icon" onClick={handleBackToSelection}>
                                <i className="fas fa-chevron-left"></i>
                            </button>

                            <div className="mq-header-info">
                                <h1 className="mq-surah-title">{currentChapter.name}</h1>
                                <span className="mq-surah-subtitle">{currentChapter.nameTranslation}</span>
                            </div>

                            <div className="mq-header-actions">
                                {challengeLevel > 0 && (
                                    <div className="mistake-counter" title="Mistakes / Peeks">
                                        <span className="mistake-label">Mistakes:</span>
                                        <span className="mistake-value">{mistakes}</span>
                                    </div>
                                )}
                                <button
                                    className={`action-btn ${challengeLevel > 0 ? 'active' : ''}`}
                                    onClick={toggleChallengeMode}
                                    title="Challenge Mode (Fill Blanks) [Shortcut: C]"
                                >
                                    <i className="fas fa-puzzle-piece"></i>
                                    {challengeLevel === 1 && <span className="badge-mini">1</span>}
                                    {challengeLevel === 2 && <span className="badge-mini">2</span>}
                                </button>
                                <button
                                    className={`action-btn ${hideModeActive ? 'active' : ''}`}
                                    onClick={toggleHideMode}
                                    title="Test Mode (Hide Text)"
                                >
                                    <i className={`fas fa-eye${hideModeActive ? '-slash' : ''}`}></i>
                                </button>
                                <button
                                    className={`action-btn ${showSettings ? 'active' : ''}`}
                                    onClick={() => setShowSettings(!showSettings)}
                                    title="Settings"
                                >
                                    <i className="fas fa-sliders-h"></i>
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Settings Panel */}
                        {showSettings && (
                            <div className="mq-settings-drawer">
                                <div className="settings-row">
                                    <div className="setting-group">
                                        <label>Reciter</label>
                                        <select
                                            className="mq-select"
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
                                    <div className="setting-group">
                                        <label>Repeat</label>
                                        <div className="stepper">
                                            <button onClick={() => setRepeatCount(Math.max(1, repeatCount - 1))}>-</button>
                                            <span>{repeatCount}x</span>
                                            <button onClick={() => setRepeatCount(Math.min(10, repeatCount + 1))}>+</button>
                                        </div>
                                    </div>
                                    <div className="setting-group">
                                        <label>Speed</label>
                                        <div className="stepper">
                                            <button onClick={() => setPlaybackRate(Math.max(0.5, playbackRate - 0.25))}>-</button>
                                            <span>{playbackRate}x</span>
                                            <button onClick={() => setPlaybackRate(Math.min(2.0, playbackRate + 0.25))}>+</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="settings-row">
                                    <div className="setting-group">
                                        <label>Verse Range</label>
                                        <div className="range-inputs">
                                            <input
                                                type="number"
                                                className="mq-input-sm"
                                                value={fromVerse}
                                                min={1}
                                                onChange={(e) => setFromVerse(Number(e.target.value))}
                                            />
                                            <span>-</span>
                                            <input
                                                type="number"
                                                className="mq-input-sm"
                                                value={toVerse}
                                                max={currentChapter.versesCount}
                                                onChange={(e) => setToVerse(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="setting-group">
                                        <label>Loop</label>
                                        <button
                                            className={`toggle-pill ${loopEnabled ? 'active' : ''}`}
                                            onClick={() => setLoopEnabled(!loopEnabled)}
                                        >
                                            {loopEnabled ? 'On' : 'Off'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verses List - Clean Design */}
                        <section className="verses-container-clean">
                            {loadingVerses ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                </div>
                            ) : (
                                <div className="verses-scroll">
                                    {verses.map((verse, index) => (
                                        <div key={verse.id} className="verse-wrapper">
                                            <div className={`verse-card ${currentVerseIndex === index ? 'active' : ''} ${hideModeActive ? 'hidden-mode' : ''} ${revealedVerses.has(index) ? 'revealed' : ''}`}>
                                                <div className="verse-header">
                                                    <span className="verse-number">{verse.verseNumber}</span>
                                                    <button className="verse-play-btn" onClick={() => playSingleVerse(verse, index)}>
                                                        <i className={`fas fa-${isPlaying && currentVerseIndex === index ? 'pause' : 'play'}`}></i>
                                                    </button>
                                                </div>

                                                {/* Challenge Mode Rendering */}
                                                {renderChallengeVerse(verse)}

                                                <p className="verse-translation">{verse.translation}</p>
                                            </div>

                                            <div className="verse-feedback">
                                                <button
                                                    className={`feedback-btn easy ${verseRatings[verse.verseKey] === 'easy' ? 'active' : ''}`}
                                                    onClick={() => handleRating(verse.verseKey, 'easy')}
                                                >
                                                    Easy
                                                </button>
                                                <button
                                                    className={`feedback-btn hard ${verseRatings[verse.verseKey] === 'hard' ? 'active' : ''}`}
                                                    onClick={() => handleRating(verse.verseKey, 'hard')}
                                                >
                                                    Hard
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Spacer for bottom player */}
                                    <div style={{ height: '140px' }}></div>
                                </div>
                            )}
                        </section>

                        {/* Floating Action Button for Focus */}
                        <button
                            className="fab-focus"
                            onClick={() => {
                                if (currentVerseIndex < 0) setCurrentVerseIndex(0);
                                setFocusModeActive(true);
                            }}
                        >
                            <i className="fas fa-expand"></i> Focus
                        </button>

                        {/* Simplified Glass Player */}
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
