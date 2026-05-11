'use client';

import React from 'react';
import '../styles/read-quran-features.css';

export default function ReadQuranFeatures() {
    return (
        <section className="rq-features-viewport" aria-labelledby="rq-features-title">
            <div className="rq-features-composition">
                <h2 id="rq-features-title" className="rq-features-heading">Explore reading modes</h2>
                <p className="rq-features-sub">Premium, distraction-free ways to engage with the Noble Quran.</p>

                <div className="rq-cards">
                    {/* Card 1 — Read by Surah */}
                    <article className="rq-card">
                        <div className="rq-card-illus rq-illus-rehal" aria-hidden="true">
                            <svg width="84" height="64" viewBox="0 0 84 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="6" y="10" width="72" height="36" rx="6" fill="#F7F3E9" />
                                <path d="M8 46 L42 18 L76 46" stroke="#C8A96B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="24" y="18" width="36" height="20" rx="4" fill="#fff" stroke="#EDE7DA" />
                            </svg>
                        </div>
                        <div className="rq-card-content">
                            <div className="rq-card-title">Read by Surah</div>
                            <div className="rq-card-desc">Read the Quran chapter by chapter with Arabic text and English translation.</div>
                        </div>
                        <div className="rq-card-meta">114 Chapters</div>
                    </article>

                    {/* Card 2 — Read by Juz */}
                    <article className="rq-card">
                        <div className="rq-card-illus rq-illus-juz" aria-hidden="true">
                            <svg width="84" height="64" viewBox="0 0 84 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="42" cy="32" r="20" stroke="#C8A96B" strokeWidth="6" strokeLinecap="round" strokeDasharray="4 6" />
                                <path d="M42 12 C52 8, 64 10, 68 20" stroke="#0F3D2E" strokeWidth="1.5" opacity="0.6" />
                                <path d="M6 52 C20 44, 36 44, 78 52" stroke="#E9E2D6" strokeWidth="6" opacity="0.6" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="rq-card-content">
                            <div className="rq-card-title">Read by Juz</div>
                            <div className="rq-card-desc">Follow the Quran in 30 Juz for simple and structured reading.</div>
                        </div>
                        <div className="rq-card-meta">30 Juz</div>
                    </article>

                    {/* Card 3 — Search the Quran */}
                    <article className="rq-card">
                        <div className="rq-card-illus rq-illus-search" aria-hidden="true">
                            <div className="rq-search-mock">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 21l-4.35-4.35" stroke="#0F3D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="11" cy="11" r="5" stroke="#0F3D2E" strokeWidth="1.5" />
                                </svg>
                                <div className="rq-search-bar" />
                            </div>
                        </div>
                        <div className="rq-card-content">
                            <div className="rq-card-title">Search the Quran</div>
                            <div className="rq-card-desc">Search verses quickly using words or phrases.</div>
                        </div>
                        <div className="rq-card-meta">Find anywhere</div>
                    </article>

                    {/* Card 4 — Listen to Recitation */}
                    <article className="rq-card">
                        <div className="rq-card-illus rq-illus-audio" aria-hidden="true">
                            <svg width="84" height="64" viewBox="0 0 84 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="8" y="18" width="68" height="28" rx="8" fill="#F7F3E9" />
                                <path d="M18 34 L30 26 L42 34 L54 22 L66 34" stroke="#0F3D2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
                                <circle cx="22" cy="32" r="6" stroke="#C8A96B" strokeWidth="1.5" fill="#fff" />
                            </svg>
                        </div>
                        <div className="rq-card-content">
                            <div className="rq-card-title">Listen to Recitation</div>
                            <div className="rq-card-desc">Listen to Quran recitation with clear and smooth audio playback.</div>
                        </div>
                        <div className="rq-card-meta">Audio</div>
                    </article>
                </div>
            </div>
        </section>
    );
}
