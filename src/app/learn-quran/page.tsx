'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './styles/learn-quran.css';

interface Lesson {
    id: number;
    title: string;
    description: string;
    items: any[];
}

export default function LearnQuranPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/learn-quran')
            .then(res => res.json())
            .then(data => {
                setLessons(data.curriculum.lessons);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load lessons', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="learn-quran-page">
            <div className="lq-hero">
                <div className="lq-container">
                    <h1>Learn Noorani Qaida</h1>
                    <p>Master the Arabic alphabet and Quran reading rules with our interactive audio lessons. Start your journey from the basics to advanced tajweed.</p>
                </div>
            </div>

            <div className="lq-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading Curriculum...</div>
                ) : (
                    <div className="lq-lesson-grid">
                        {lessons.map((lesson) => (
                            <Link href={`/learn-quran/lesson/${lesson.id}`} key={lesson.id} className="lq-card">
                                <div className="lq-card-number">{lesson.id}</div>
                                <div className="lq-card-content">
                                    <span className="lq-card-badge">Lesson {lesson.id}</span>
                                    <h3>{lesson.title}</h3>
                                    <p>{lesson.description}</p>
                                    <div className="lq-card-meta">
                                        <span style={{ fontSize: '0.8rem', color: 'var(--lq-text-secondary)' }}>
                                            {lesson.items.length > 0 ? `${lesson.items.length} Items` : 'Practice'}
                                        </span>
                                        <span className="lq-btn-start">Start Lesson</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
