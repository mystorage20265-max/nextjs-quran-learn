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

        fetch('/data/learn-quran.json')
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
    }, [lessonId]);

    const playTTS = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA'; // Arabic (Saudi Arabia)
            utterance.rate = 0.9; // Slightly slower for learning
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("Text-to-Speech not supported");
        }
    };

    const playAudio = (item: LessonItem) => {
        const audioUrl = item.audio
            ? (lesson?.audioBase ? `${lesson.audioBase}${item.audio}` : item.audio)
            : null;

        setPlayingItem(item.id || item.text);

        if (!audioUrl) {
            // No audio file defined, try TTS immediately
            console.log("No audio file, trying TTS for:", item.text);
            playTTS(item.text);
            setTimeout(() => setPlayingItem(null), 1000); // Reset playing state
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Add error handler for 404/fail
        audio.onerror = () => {
            console.warn(`Audio failed to load for ${item.text}, falling back to TTS`);
            playTTS(item.text);
            setPlayingItem(null);
        };

        audio.onended = () => {
            setPlayingItem(null);
        };

        audio.play().catch(e => {
            console.error("Audio playback error", e);
            // Fallback to TTS on play error (e.g. not supported or blocked)
            playTTS(item.text);
            setPlayingItem(null);
        });
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
                    <p style={{ maxWidth: '800px', color: 'var(--lq-text-secondary)' }}>{lesson.description}</p>
                </div>
            </div>

            <div className="lq-container">
                <div className="lq-item-grid">
                    {lesson.items.length > 0 ? (
                        lesson.items.map((item, idx) => (
                            <button
                                key={idx}
                                className={`lq-item-card ${playingItem === (item.id || item.text) ? 'playing' : ''}`}
                                onClick={() => playAudio(item)}
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
