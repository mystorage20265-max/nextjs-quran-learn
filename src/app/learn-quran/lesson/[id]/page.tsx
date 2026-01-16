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
    const params = useParams(); // Use generic params first
    // params can be Record<string, string | string[]>
    // Safely cast or parse
    const lessonId = params?.id ? Number(params.id) : null;

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingItem, setPlayingItem] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!lessonId) return;

        // Cache-busting: Force fresh data to ensure audio mappings are updated
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

        // Cleanup: Stop audio when leaving the page
        return () => {
            stopPlayAll();
            window.speechSynthesis.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [lessonId]);

    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        // Load voices ensure they are ready
        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();
            setVoices(available);
        };

        loadVoices();

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

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
        "Ta Tha": "تاء ثاء", "Noon Tha": "نون ثاء", "Ya Tha": "ياء ثاء",
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

    // MAPPING: English Name -> Audio File from Lesson 1 (Base path: https://raw.githubusercontent.com/adnan/Arabic-Alphabet/master/sounds/)
    // High-quality human male voice audio files for individual letters
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

    const playSequence = (englishName: string, onComplete?: () => void) => {
        // Break name into parts: "Noon Tha Noon" -> ["Noon", "Tha", "Noon"]
        const parts = englishName.split(' ');

        const audioFiles: string[] = [];
        for (const p of parts) {
            const file = LETTER_AUDIO_MAP[p];
            if (file) audioFiles.push(file);
        }

        // Validate: If we can't map all parts, fallback to TTS
        if (audioFiles.length !== parts.length) {
            console.log("Sequence partial miss, falling back to Smart TTS for:", englishName);
            const arabicText = parts.map(p => ARABIC_LETTER_MAP[p] || p).join(' ');
            playTTSfallback(arabicText, englishName, onComplete);
            return;
        }

        console.log(`Playing Sequence: ${englishName} -> ${audioFiles.join(' + ')}`);

        let idx = 0;
        const base = "https://raw.githubusercontent.com/adnan/Arabic-Alphabet/master/sounds/";

        const playNextPart = () => {
            if (idx >= audioFiles.length) {
                if (onComplete) onComplete();
                return;
            }

            const url = base + audioFiles[idx];
            const audio = new Audio(url);
            audio.defaultPlaybackRate = 1.25; // Force default
            audio.playbackRate = 1.25;        // Force instance
            audioRef.current = audio;

            audio.onended = () => {
                idx++;
                setTimeout(playNextPart, 0); // No gap for fluid sentence
            };

            audio.onerror = () => {
                console.error("Sequence part failed:", url);
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

    const playTTS = (text: string, englishName?: string, onComplete?: () => void) => {
        // STRATEGY: Try Sequence Player First (for Tajweed/Human voice), then TTS
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

    const playTTSfallback = (text: string, englishName?: string, onComplete?: () => void) => {
        // STRATEGY: Smart TTS
        // 1. Convert English Name (e.g., "Sad Ha") -> Arabic Spelled ("صاد حاء")
        // 2. This ensures "Noon Tha Noon" is read as letters, not a weird word.

        // Determine text to speak: Mapped Name > Original Name > Original Text
        let textToSpeak = text;
        if (englishName) {
            if (ARABIC_LETTER_MAP[englishName]) {
                textToSpeak = ARABIC_LETTER_MAP[englishName];
            } else {
                // Heuristic: If multi-part name (e.g. "Ba Alif"), try to map parts
                const parts = englishName.split(' ');
                const mappedParts = parts.map(p => ARABIC_LETTER_MAP[p] || p);
                // Only use if all parts mapped successfully to Arabic (contains Arabic char)
                if (mappedParts.some(p => /[\u0600-\u06FF]/.test(p))) {
                    textToSpeak = mappedParts.join(' ');
                }
            }
        }

        console.log(`TTS: Speaking '${textToSpeak}' (Original: ${text})`);

        const availableVoices = window.speechSynthesis.getVoices();
        const arabicVoices = availableVoices.filter(v => v.lang.includes('ar'));

        // FILTER: Prioritize Arabic Natural Voices (Google, Microsoft)
        // Order of preference: 
        // 1. Explicit MALE voice (David, Maged, or just 'Male')
        // 2. Google Arabic (High quality)
        // 3. Microsoft Arabic (Good)

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
            // Louder and slightly faster for 'natural' feel
            utterance.rate = 0.9;
            utterance.volume = 1.0;

            utterance.onend = () => { if (onComplete) onComplete(); };
            utterance.onerror = (e) => {
                console.error("Local TTS Error, falling back...", e);
                playGoogleFallback(textToSpeak, onComplete);
            };

            console.log("Using Voice:", selectedVoice.name);
            window.speechSynthesis.speak(utterance);
        } else {
            // OPTION 2: No Local Arabic Voice -> Use Google Fallback immediately
            console.log("No Local Arabic Voice found. Using Google proxy.");
            playGoogleFallback(textToSpeak, onComplete);
        }
    };

    const playGoogleFallback = (text: string, onComplete?: () => void) => {
        const encodedText = encodeURIComponent(text);
        // Force 'ar' lang for Google Translate TTS
        const audioUrl = `/api/tts-proxy?text=${encodedText}&lang=ar`;

        const audio = new Audio(audioUrl);
        audio.onended = () => { if (onComplete) onComplete(); };
        audio.onerror = (e) => {
            console.error("Proxy TTS Fallback Failed", e);
            playLocalDefaultFallback(text, onComplete);
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                // Ignore interruption errors
                if (e.name !== 'AbortError') console.error("Proxy TTS Playback Error", e);
                if (onComplete) onComplete();
            });
        }
    };

    const playLocalDefaultFallback = (text: string, onComplete?: () => void) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.onend = () => { if (onComplete) onComplete(); };
            utterance.onerror = () => { if (onComplete) onComplete(); };
            window.speechSynthesis.speak(utterance);
        } else {
            if (onComplete) onComplete();
        }
    };

    const playAudio = (item: LessonItem, onComplete?: () => void) => {
        const audioUrl = item.audio
            ? (lesson?.audioBase ? `${lesson?.audioBase}${item.audio}` : item.audio)
            : null;

        setPlayingItem(item.id || item.text);

        // Fallback to TTS if no audio file is provided
        if (!audioUrl) {
            console.log("No audio file found for:", item.text, "- Using TTS Fallback");
            // Pass item.name so we can map "Sad Ha" -> "صاد حاء"
            playTTS(item.text, item.name, () => {
                setPlayingItem(null);
                if (onComplete) onComplete();
            });
            return;
        }

        // PREVENT OVERLAP: Stop any existing audio immediately
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onerror = () => {
            console.error(`Audio failed to load for ${item.text}`);
            // DISABLE FALLBACK to keep voice consistent
            setPlayingItem(null);
            if (onComplete) onComplete();
        };

        audio.onended = () => {
            setPlayingItem(null);
            if (onComplete) onComplete();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                // Ignore "The play() request was interrupted" errors which happen when
                // quickly switching between items (normal behavior)
                if (e.name === 'AbortError' || e.message?.includes('interrupted')) {
                    // unexpected interruption is okay
                    return;
                }
                console.error("Audio playback error", e);
                setPlayingItem(null);
                if (onComplete) onComplete();
            });
        }
    };

    const isPlayingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

            // Scroll logic (optional)
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

    const stopPlayAll = () => {
        setIsPlayingAll(false);
        isPlayingRef.current = false;

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
                <div className="lq-container">
                    <Link href="/learn-quran" className="lq-back-btn">
                        ← Back to Lessons
                    </Link>
                    <h1>{lesson.title}</h1>
                    <p style={{ maxWidth: '800px', color: 'var(--lq-text-secondary)', marginBottom: '20px' }}>{lesson.description}</p>

                    <button
                        className={`lq-btn-start ${isPlayingAll ? 'playing' : ''}`}
                        onClick={isPlayingAll ? stopPlayAll : handlePlayAll}
                        style={{ padding: '12px 24px', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        {isPlayingAll ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z" /></svg>
                                Stop Lesson
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                Play Full Lesson
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="lq-container">
                <div className="lq-item-grid">
                    {lesson.items.length > 0 ? (
                        lesson.items.map((item, idx) => (
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
                                    <div className="lq-item-text">{item.text}</div>
                                )}
                                {item.name && <div className="lq-item-name">{item.name}</div>}
                            </button>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'var(--lq-bg-card)', borderRadius: 'var(--lq-radius-lg)', border: '1px solid var(--lq-border)' }}>
                            <p>Content for this lesson is coming soon.</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', gap: '20px' }}>

                    {/* Previous Button */}
                    <div style={{ flex: 1 }}>
                        {lesson.id > 1 ? (
                            <Link href={`/learn-quran/lesson/${lesson.id - 1}`} className="lq-nav-btn prev">
                                <span>←</span> Previous Lesson
                            </Link>
                        ) : (
                            <div style={{ flex: 1 }}></div> // Spacer
                        )}
                    </div>

                    {/* Next Button - Check max lessons (currently 18) */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        {lesson.id < 18 ? (
                            <Link href={`/learn-quran/lesson/${lesson.id + 1}`} className="lq-nav-btn next">
                                Next Lesson <span>→</span>
                            </Link>
                        ) : (
                            <Link href="/learn-quran" className="lq-nav-btn complete">
                                Complete Course <span>✓</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
