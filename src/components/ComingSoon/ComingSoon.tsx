'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import './ComingSoon.css';

interface ComingSoonProps {
    title?: string;
    subtitle?: string;
}

const FEATURES = [
    {
        icon: '📖',
        title: 'Interactive Tafsir',
        desc: 'Traverse centuries of scholarship with a modern interface. Deep, contextual, and profoundly intuitive.',
    },
    {
        icon: '🎙️',
        title: 'AI Tajweed Coach',
        desc: "Perfect your recitation with an AI coach that understands both phonetic precision and the heart's devotion.",
    },
    {
        icon: '🧠',
        title: 'Guided Hifz Plan',
        desc: 'Smart spaced-repetition memorisation system tailored to your pace and learning style.',
    },
];

const MILESTONES = [
    { label: 'Research', done: true },
    { label: 'Design', done: true },
    { label: 'Development', done: false },
    { label: 'Launch', done: false },
];

export default function ComingSoon({
    title = 'Coming Soon',
    subtitle = "We're crafting something extraordinary for the Ummah",
}: ComingSoonProps) {
    const [progress, setProgress] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [activeCard, setActiveCard] = useState<number | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setProgress(68), 600);
        return () => clearTimeout(t);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    }, []);

    return (
        <div className="cs-root" onMouseMove={handleMouseMove}>
            {/* Ambient background */}
            <div className="cs-bg">
                <div className="cs-orb cs-orb-1" />
                <div className="cs-orb cs-orb-2" />
                <div className="cs-orb cs-orb-3" />
                <div className="cs-grid" />
                {/* Cursor‑follow radial glow */}
                <div
                    className="cs-cursor-glow"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(245,158,11,0.06), transparent 60%)`,
                    }}
                />
            </div>

            {/* Top accent bar */}
            <div className="cs-top-bar" />

            {/* ── Header ── */}
            <header className="cs-header">
                <Link href="/" className="cs-logo">
                    <div className="cs-logo-icon">✦</div>
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
                    ✦ Something sacred is unfolding
                </div>

                {/* Hero text */}
                <h1 className="cs-hero-title">{title}</h1>
                <p className="cs-hero-sub">Stay tuned</p>

                <div className="cs-divider">
                    <span className="cs-divider-diamond">◆</span>
                </div>

                <p className="cs-tagline">{subtitle}</p>

                {/* Milestones */}
                <div className="cs-milestones">
                    {MILESTONES.map((m, i) => (
                        <React.Fragment key={m.label}>
                            <div className={`cs-milestone ${m.done ? 'cs-milestone-done' : ''}`}>
                                <div className="cs-milestone-dot">{m.done ? '✓' : (i + 1)}</div>
                                <span className="cs-milestone-label">{m.label}</span>
                            </div>
                            {i < MILESTONES.length - 1 && (
                                <div className={`cs-milestone-line ${m.done ? 'cs-milestone-line-done' : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Feature cards */}
                <div className="cs-cards">
                    {FEATURES.map((f, i) => (
                        <div
                            key={f.title}
                            className={`cs-card ${activeCard === i ? 'cs-card-active' : ''}`}
                            onMouseEnter={() => setActiveCard(i)}
                            onMouseLeave={() => setActiveCard(null)}
                        >
                            <div className="cs-card-icon-wrap">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                            <div className="cs-card-number">{String(i + 1).padStart(2, '0')}</div>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="cs-progress-wrap">
                    <div className="cs-progress-label">
                        <span>Development Progress</span>
                        <span className="cs-progress-pct">{progress}%</span>
                    </div>
                    <div className="cs-progress-track">
                        <div className="cs-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Back to home CTA */}
                <Link href="/" className="cs-cta">
                    ← Return Home
                </Link>
            </main>
        </div>
    );
}
