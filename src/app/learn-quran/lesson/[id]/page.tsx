'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import '../../styles/learn-quran.css';

interface LessonItem {
    id?: string;
    text: string;
    name?: string;
    audio?: string;
    imageSrc?: string;
}

interface Lesson {
    id: number;
    title: string;
    description: string;
    audioBase?: string;
    items: LessonItem[];
}

export default function LessonDetailPage() {
    const params = useParams();
    const lessonId = params?.id ? Number(params.id) : null;

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingItem, setPlayingItem] = useState<string | null>(null);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [autoRepeat, setAutoRepeat] = useState(false);
    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [fontSize, setFontSize] = useState(3.0); // Default 3rem

    // REFS for Reactive State Access inside callbacks
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isPlayingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const playbackRateRef = useRef(1.0);
    const autoRepeatRef = useRef(false);
    const isMidSequenceRef = useRef(false);

    // Sync refs with state
    useEffect(() => { playbackRateRef.current = playbackRate; }, [playbackRate]);
    useEffect(() => { autoRepeatRef.current = autoRepeat; }, [autoRepeat]);

    // Apply speed change immediately to active audio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    // MAPPING: English Name -> Spelled out Arabic for TTS
    const ARABIC_LETTER_MAP: Record<string, string> = {
        // Basic Letters
        "Alif": "ألف", "Ba": "باء", "Ta": "تاء", "Tha": "ثاء",
        "Jim": "جيم", "Ha": "حاء", "Kha": "خاء", "Dal": "دال",
        "Dhal": "ذال", "Ra": "راء", "Za": "زاي", "Seen": "سين",
        "Sheen": "شين", "Sad": "صاد", "Dad": "ضاد", "Tah": "طاء", "Ta": "طاء", // Handle variations
        "Zah": "ظاء", "Ain": "عين", "Ghain": "غين", "Fa": "فاء",
        "Qaf": "قاف", "Kaf": "كاف", "Lam": "لام", "Meem": "ميم",
        "Noon": "نون", "Waw": "واو", "Hamza": "همزة", "Ya": "ياء",

        // Joint Letters & Variations (Lesson 2+)
        "Lam Alif": "لام ألف", "Lam Ha": "لام حاء", "Ba Alif": "باء ألف",
        "Ba Lam": "باء لام", "Ta Lam": "تاء لام", "Tha Lam": "ثاء لام",
        "Noon Lam": "نون لام", "Ya Lam": "ياء لام", "Ta Alif": "تاء ألف",
        "Ya Alif": "ياء ألف", "Tha Alif": "ثاء ألف", "Noon Alif": "نون ألف",
        "Ba Seen": "باء سين", "Ya Seen": "ياء سين", "Noon Seen": "نون سين",
        "Ta Seen": "تاء سين", "Tha Seen": "ثاء سين", "Ba Tha": "باء ثاء",
        "Ta Tha": "تاء ثاء", "Noon Ta": "نون ثاء", "Ya Tha": "ياء ثاء",
        "Ba Ta": "باء تاء", "Ya Ta": "ياء تاء", "Noon Ta": "نون تاء",
        "Ta Ta": "تاء تاء", "Ya Ha": "ياء حاء", "Ta Ha": "تاء حاء",
        "Ba Ha": "باء حاء", "Ya Ha": "ياء حاء", "Ha Alif": "حاء ألف",
        "Ha Tha": "حاء ثاء", "Sad Ha": "صاد حاء", "Dal Ha": "دال حاء",
        "Ain Alif": "عين ألف", "Ghain Alif": "غين ألف", "Ha Ya": "حاء ياء",
        "Jim Alif": "جيم ألف", "Kha Alif": "خاء ألف", "Kha Ba": "خاء باء",
        "Jim Ta": "جيم تاء", "Ta Ha": "تاء حاء", "Ya Jim Ba": "ياء جيم باء",
        "Ba Kha Ta": "باء خاء تاء", "Ta Ha": "تاء حاء", "Ba Ta": "باء تاء",
        "Ya Ha": "ياء حاء", "Ta Ha": "تاء حاء", "Noon Ta": "نون تاء",
        "Ha Tha": "حاء ثاء", "Meem Ra": "ميم راء", "Noon Tha Noon": "نون ثاء نون"
    };

    // MAPPING: English Name -> Audio File from Lesson 1
    const LETTER_AUDIO_MAP: Record<string, string> = {
        "Alif": "1_alif.mp3", "Ba": "2_baa.mp3", "Ta": "3_taa.mp3", "Tha": "4_thaa.mp3",
        "Jim": "5_jeem.mp3", "Ha": "6_haa.mp3", "Kha": "7_khaa.mp3", "Dal": "8_daal.mp3",
        "Dhal": "9_zaal.mp3", "Ra": "10_raa.mp3", "Za": "11_zaa.mp3", "Seen": "12_seen.mp3",
        "Sheen": "13_sheen.mp3", "Sad": "14_saad.mp3", "Dad": "15_daad.mp3", "Tah": "16_taah.mp3",
        "Zah": "17_zhaa.mp3", "Ain": "18_ain.mp3", "Ghain": "19_ghain.mp3", "Fa": "20_faa.mp3",
        "Qaf": "21_qaaf.mp3", "Kaf": "22_kaaf.mp3", "Lam": "23_laam.mp3", "Meem": "24_meem.mp3",
        "Noon": "25_noon.mp3", "Waw": "27_waw.mp3", "Ha (Soft)": "26_haah.mp3", "Hamza": "28_hamzah.mp3",
        "Ya": "30_yaa.mp3"
    };

    const playGoogleFallback = (text: string, onComplete?: () => void) => {
        const encodedText = encodeURIComponent(text);
        const audioUrl = `/api/tts-proxy?text=${encodedText}&lang=ar`;

        const audio = new Audio(audioUrl);
        audio.onended = () => { if (onComplete) onComplete(); };
        audio.onerror = (e) => {
            console.error("Proxy TTS Fallback Failed", e);
            if (onComplete) onComplete();
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                if (e.name !== 'AbortError') console.error("Proxy TTS Playback Error", e);
                if (onComplete) onComplete();
            });
        }
    };

    const playTTSfallback = (text: string, englishName?: string, onComplete?: () => void) => {
        let textToSpeak = text;
        if (englishName) {
            if (ARABIC_LETTER_MAP[englishName]) {
                textToSpeak = ARABIC_LETTER_MAP[englishName];
            } else {
                const parts = englishName.split(' ');
                const mappedParts = parts.map(p => ARABIC_LETTER_MAP[p] || p);
                if (mappedParts.some(p => /[\u0600-\u06FF]/.test(p))) {
                    textToSpeak = mappedParts.join(' ');
                }
            }
        }

        const availableVoices = window.speechSynthesis.getVoices();
        const arabicVoices = availableVoices.filter(v => v.lang.includes('ar'));
        const maleVoice = arabicVoices.find(v => v.name.toLowerCase().includes('male'))
            || arabicVoices.find(v => v.name.toLowerCase().includes('david'))
            || arabicVoices.find(v => v.name.toLowerCase().includes('maged'));

        const selectedVoice = maleVoice
            || arabicVoices.find(v => v.name.includes('Google') && v.lang.includes('ar'))
            || arabicVoices.find(v => v.name.includes('Microsoft') && v.lang.includes('ar'))
            || arabicVoices[0];

        if (selectedVoice) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
            utterance.rate = 0.9 * playbackRateRef.current; // Use REF
            utterance.volume = 1.0;

            utterance.onend = () => { if (onComplete) onComplete(); };
            utterance.onerror = () => { playGoogleFallback(textToSpeak, onComplete); };
            window.speechSynthesis.speak(utterance);
        } else {
            playGoogleFallback(textToSpeak, onComplete);
        }
    };

    const playTTS = (text: string, englishName?: string, onComplete?: () => void) => {
        if (englishName && englishName.includes(' ')) {
            playSequence(englishName, onComplete);
            return;
        }
        if (englishName && LETTER_AUDIO_MAP[englishName]) {
            playSequence(englishName, onComplete);
            return;
        }
        playTTSfallback(text, englishName, onComplete);
    };

    const playSequence = (englishName: string, onComplete?: () => void) => {
        if (isMidSequenceRef.current) return;
        isMidSequenceRef.current = true;

        const parts = englishName.split(' ');
        const audioFiles: string[] = [];
        for (const p of parts) {
            const file = LETTER_AUDIO_MAP[p];
            if (file) audioFiles.push(file);
        }

        if (audioFiles.length !== parts.length) {
            isMidSequenceRef.current = false;
            const arabicText = parts.map(p => ARABIC_LETTER_MAP[p] || p).join(' ');
            playTTSfallback(arabicText, englishName, onComplete);
            return;
        }

        let idx = 0;
        const base = "https://raw.githubusercontent.com/adnan/Arabic-Alphabet/master/sounds/";

        const playNextPart = () => {
            // Check if we should stop (e.g. user clicked stop)
            if (!isPlayingRef.current && isPlayingAll) {
                isMidSequenceRef.current = false;
                return;
            }

            if (idx >= audioFiles.length) {
                isMidSequenceRef.current = false;
                if (onComplete) onComplete();
                return;
            }

            const url = base + audioFiles[idx];
            const audio = new Audio(url);
            audio.playbackRate = playbackRateRef.current; // Use REF
            audioRef.current = audio;

            audio.onended = () => {
                idx++;
                setTimeout(playNextPart, 0);
            };

            audio.onerror = () => {
                idx++;
                playNextPart();
            };

            audio.play().catch(e => {
                console.error("Sequence play error", e);
                idx++;
                playNextPart();
            });
        };

        playNextPart();
    };


    const playAudio = (item: LessonItem, onComplete?: () => void) => {
        const audioUrl = item.audio
            ? (lesson?.audioBase ? `${lesson?.audioBase}${item.audio}` : item.audio)
            : null;

        setPlayingItem(item.id || item.text);

        const handleCompletion = () => {
            setPlayingItem(null);
            if (onComplete) onComplete();
        };

        let repeatCount = 0;

        const executePlay = () => {
            // CHECK REFS for LATEST settings (Reactive!)
            const maxRepeats = autoRepeatRef.current ? 3 : 1;

            if (repeatCount >= maxRepeats) {
                handleCompletion();
                return;
            }

            if (!audioUrl) {
                playTTS(item.text, item.name, () => {
                    repeatCount++;
                    setTimeout(executePlay, 500);
                });
                return;
            }

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            const audio = new Audio(audioUrl);
            audio.playbackRate = playbackRateRef.current; // Use REF
            audioRef.current = audio;

            audio.onerror = () => {
                playTTS(item.text, item.name, handleCompletion);
            };

            audio.onended = () => {
                repeatCount++;
                // Check REF again to decide if we should continue
                const currentMaxRepeats = autoRepeatRef.current ? 3 : 1;
                if (repeatCount < currentMaxRepeats) {
                    setTimeout(executePlay, 300);
                } else {
                    handleCompletion();
                }
            };

            audio.play().catch(e => {
                if (e.name === 'AbortError') return;
                handleCompletion();
            });
        };

        executePlay();
    };

    const stopPlayAll = () => {
        setIsPlayingAll(false);
        isPlayingRef.current = false;
        isMidSequenceRef.current = false;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        window.speechSynthesis.cancel();
        setPlayingItem(null);
    };

    const handlePlayAll = () => {
        if (!lesson || !lesson.items.length) return;

        setIsPlayingAll(true);
        isPlayingRef.current = true;

        let currentIndex = 0;

        const playNext = () => {
            if (!isPlayingRef.current || currentIndex >= lesson.items.length) {
                stopPlayAll();
                return;
            }

            const item = lesson.items[currentIndex];
            const element = document.getElementById(`item-${currentIndex}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            playAudio(item, () => {
                if (isPlayingRef.current) {
                    currentIndex++;
                    timeoutRef.current = setTimeout(playNext, 500);
                }
            });
        };

        playNext();
    };

    useEffect(() => {
        if (!lessonId) return;

        fetch(`/api/learn-quran?t=${new Date().getTime()}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                const found = data.curriculum.lessons.find((l: Lesson) => l.id === lessonId);
                if (found) {
                    setLesson(found);
                } else {
                    setLesson(null);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load lesson', err);
                setLoading(false);
            });

        return () => {
            stopPlayAll();
            window.speechSynthesis.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [lessonId]);

    if (loading) return (
        <div className="lq-container" style={{ paddingTop: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <div className="rq-spinner"></div>
            <p style={{ marginTop: '20px', color: 'var(--lq-text-muted)' }}>Loading Lesson...</p>
        </div>
    );
    if (!lesson) return <div className="lq-container">Lesson Not Found</div>;

    return (
        <div className="learn-quran-page">
            <div className="lq-detail-header">
                <div className="lq-container" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <Link href="/learn-quran" className="lq-back-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                                Back to Lessons
                            </Link>
                            <h1>{lesson?.title || 'Loading...'}</h1>
                            <p style={{ maxWidth: '800px', color: 'var(--lq-text-muted)', marginBottom: '32px', fontSize: '1.1rem' }}>{lesson?.description}</p>
                        </div>

                        {/* SETTINGS TOGGLE BUTTON */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className={`lq-settings-btn ${showSettings ? 'active' : ''}`}
                                onClick={() => setShowSettings(!showSettings)}
                                title="Audio & Display Settings"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                Settings
                            </button>

                            {/* SETTINGS POPOVER */}
                            {showSettings && (
                                <div className="lq-settings-popover">
                                    <div className="lq-settings-header">
                                        <h3>Class Settings</h3>
                                        <button onClick={() => setShowSettings(false)} className="lq-close-btn">&times;</button>
                                    </div>

                                    {/* Size Control */}
                                    <div className="lq-setting-row">
                                        <label>Text Size</label>
                                        <div className="lq-size-control">
                                            <button onClick={() => setFontSize(Math.max(2, fontSize - 0.5))} disabled={fontSize <= 2}>A-</button>
                                            <span>{fontSize}x</span>
                                            <button onClick={() => setFontSize(Math.min(5, fontSize + 0.5))} disabled={fontSize >= 5}>A+</button>
                                        </div>
                                    </div>

                                    <hr className="lq-divider" />

                                    {/* Speed Control */}
                                    <div className="lq-setting-row">
                                        <label>Audio Speed</label>
                                        <div className="lq-speed-control">
                                            <span>0.5x</span>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.25"
                                                value={playbackRate}
                                                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                                                className="lq-slider"
                                            />
                                            <span>1.5x</span>
                                        </div>
                                        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--lq-primary)', marginTop: '4px', fontWeight: '600' }}>Current: {playbackRate}x</div>
                                    </div>

                                    <hr className="lq-divider" />

                                    {/* Repeat Toggle */}
                                    <div className="lq-setting-row" style={{ justifyContent: 'space-between' }}>
                                        <label>Repeat 3x</label>
                                        <label className="lq-toggle">
                                            <input
                                                type="checkbox"
                                                checked={autoRepeat}
                                                onChange={(e) => setAutoRepeat(e.target.checked)}
                                            />
                                            <span className="lq-slider-round"></span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', marginTop: '10px' }}>
                        <button
                            className={`lq-play-main ${isPlayingAll ? 'playing' : ''}`}
                            onClick={isPlayingAll ? stopPlayAll : handlePlayAll}
                        >
                            {isPlayingAll ? (
                                <>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                                    Stop Session
                                </>
                            ) : (
                                <>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                    Start Practice Session
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="lq-container">
                <div className="lq-item-grid">
                    {lesson?.items?.length ? (
                        lesson?.items.map((item, idx) => (
                            <button
                                key={idx}
                                id={`item-${idx}`}
                                className={`lq-item-card ${playingItem === (item.id || item.text) ? 'playing' : ''}`}
                                onClick={() => {
                                    stopPlayAll(); // Stop auto-play if user interacts manually
                                    playAudio(item);
                                }}
                            >
                                {item.imageSrc ? (
                                    <div className="lq-item-image-wrapper">
                                        <img src={item.imageSrc} alt={item.name || item.text} className="lq-item-img" draggable="false" />
                                    </div>
                                ) : (
                                    <div className="lq-item-text" style={{ fontSize: `${fontSize}rem` }}>{item.text}</div>
                                )}
                                {item.name && <div className="lq-item-name">{item.name}</div>}
                            </button>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid var(--lq-border-subtle)' }}>
                            <p>Content loading or not found...</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="lq-nav-buttons-container">
                    {/* Previous Button */}
                    <div style={{ flex: 1 }}>
                        {lesson.id > 1 ? (
                            <Link href={`/learn-quran/lesson/${lesson.id - 1}`} className="lq-nav-btn prev">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                                Previous Lesson
                            </Link>
                        ) : (
                            <div style={{ flex: 1 }}></div> // Spacer
                        )}
                    </div>

                    {/* Next Button - Check max lessons (currently 18) */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        {lesson.id < 18 ? (
                            <Link href={`/learn-quran/lesson/${lesson.id + 1}`} className="lq-nav-btn next">
                                Next Lesson
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                            </Link>
                        ) : (
                            <Link href="/learn-quran" className="lq-nav-btn next" style={{ background: 'var(--lq-accent)' }}>
                                Complete Course
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
