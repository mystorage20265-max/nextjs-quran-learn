'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './ComingSoon.css';

interface ComingSoonProps {
    title?: string;
    subtitle?: string;
}

const FEATURES = [
    {
        icon: 'auto_stories',
        title: 'Interactive Tafsir',
        desc: 'Traverse centuries of scholarship with a modern interface. Deep, contextual, and profoundly intuitive.',
    },
    {
        icon: 'record_voice_over',
        title: 'AI Tajweed Coach',
        desc: "Perfect your recitation with an AI coach that understands both phonetic precision and the heart's devotion.",
    },
    {
        icon: 'school',
        title: 'Guided Hifz Plan',
        desc: 'Smart spaced-repetition memorisation system tailored to your pace and learning style.',
    },
];

export default function ComingSoon({
    title = 'Coming Soon',
    subtitle = "We're building something extraordinary",
}: ComingSoonProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setProgress(68), 600);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="cs-root">
            {/* Ambient background */}
            <div className="cs-bg">
                <div className="cs-orb cs-orb-1" />
                <div className="cs-orb cs-orb-2" />
                <div className="cs-orb cs-orb-3" />
                <div className="cs-grid" />
            </div>

            {/* Top accent bar */}
            <div className="cs-top-bar" />

            {/* ── Header ── */}
            <header className="cs-header">
                <Link href="/" className="cs-logo">
                    <div className="cs-logo-icon">
                        <span className="material-symbols-outlined">auto_stories</span>
                    </div>
                    <div className="cs-logo-text">
                        <span className="cs-logo-name">Nur Quran</span>
                        <span className="cs-logo-sub">Learning Hub</span>
                    </div>
                </Link>

                <div className="cs-live-badge">
                    <div className="cs-live-dot" />
                    In Development
                </div>
            </header>

            {/* ── Main ── */}
            <main className="cs-main">
                {/* Eyebrow */}
                <div className="cs-label">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mosque</span>
                    Something sacred is unfolding
                </div>

                {/* Hero text */}
                <h1 className="cs-hero-title">{title}</h1>
                <p className="cs-hero-sub">Stay tuned</p>

                <div className="cs-divider" />

                <p className="cs-tagline">{subtitle}</p>



                {/* Feature cards */}
                <div className="cs-cards">
                    {FEATURES.map(f => (
                        <div key={f.title} className="cs-card">
                            <div className="cs-card-icon-wrap">
                                <span className="material-symbols-outlined">{f.icon}</span>
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="cs-progress-wrap">
                    <div className="cs-progress-label">
                        <span>Development Progress</span>
                        <span style={{ color: '#11d442' }}>{progress}%</span>
                    </div>
                    <div className="cs-progress-track">
                        <div className="cs-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </main>

        </div>
    );
}
