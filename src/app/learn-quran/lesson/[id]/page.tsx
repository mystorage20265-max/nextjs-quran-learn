'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import '../../styles/learn-quran.css';

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

        fetch('/api/learn-quran')
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

    const playTTS = (text: string, onComplete?: () => void) => {
        // STRATEGY: Hybrid Audio
        // 1. Check for Local Arabic Voice.
        // 2. If available, use Local TTS (it's faster).
        // 3. If NOT available, use Google Translate TTS API (Public, reliable fallback).

        const availableVoices = window.speechSynthesis.getVoices();
        const arabicVoice = availableVoices.find(v => v.lang === 'ar-SA' || v.lang.includes('ar'));

        if (arabicVoice) {
            // OPTION 1: Use Local TTS
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = arabicVoice;
            utterance.lang = arabicVoice.lang;
            utterance.rate = 0.8;
            utterance.volume = 1.0;

            utterance.onend = () => { if (onComplete) onComplete(); };
            utterance.onerror = (e) => {
                console.error("Local TTS Error, falling back...", e);
                playGoogleFallback(text, onComplete);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            // OPTION 2: No Local Arabic Voice -> Use Google Fallback immediately
            console.log("No Local Arabic Voice found. Using Google TTS fallback.");
            playGoogleFallback(text, onComplete);
        }
    };

    const playGoogleFallback = (text: string, onComplete?: () => void) => {
        // Use our Internal Proxy to avoid CORS errors
        const encodedText = encodeURIComponent(text);
        const audioUrl = `/api/tts-proxy?text=${encodedText}`;

        const audio = new Audio(audioUrl);
        audio.onended = () => { if (onComplete) onComplete(); };
        audio.onerror = (e) => {
            console.error("Proxy TTS Fallback Failed", e);
            // Final fallback: Try local default voice (will be accent-heavy but better than silence)
            playLocalDefaultFallback(text, onComplete);
        };
        audio.play().catch(e => {
            console.error("Proxy TTS Playback Error", e);
            if (onComplete) onComplete();
        });
    };

    const playLocalDefaultFallback = (text: string, onComplete?: () => void) => {
        // This is the "Last Resort" - will likely sound like an English speaker reading Arabic
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA'; // Try requesting it anyway
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

        // STRICT FIX: If no audio file, DO NOT use TTS. Just skip.
        if (!audioUrl) {
            console.log("No audio file found for:", item.text);
            // playTTS(item.text...) <-- REMOVED
            setPlayingItem(null);
            if (onComplete) onComplete();
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

        audio.play().catch(e => {
            console.error("Audio playback error", e);
            // DISABLE FALLBACK
            setPlayingItem(null);
            if (onComplete) onComplete();
        });
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

    if (loading) return <div className="lq-container" style={{ paddingTop: '40px' }}>Loading Lesson...</div>;
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
                                <span>⏹</span> Stop Lesson
                            </>
                        ) : (
                            <>
                                <span>▶</span> Play Full Lesson
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
                                <div className="lq-item-text">{item.text}</div>
                                {item.name && <div className="lq-item-name">{item.name}</div>}
                            </button>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'var(--lq-bg-card)', borderRadius: 'var(--lq-radius-lg)', border: '1px solid var(--lq-border)' }}>
                            <p>Content for this lesson is coming soon.</p>
                        </div>
                    )}
                </div>

                {/* Navigation (Next/Prev) could go here */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    {lesson.id > 1 && (
                        <Link href={`/learn-quran/lesson/${lesson.id - 1}`} className="lq-btn-start" style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
                            Next
                        </Link>
                    )}
                    {/* Actually, styling for Prev is tricky if reusing Next class. Better separate. */}
                </div>
            </div>
        </div>
    );
}
