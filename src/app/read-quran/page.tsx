'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, ArrowRight, ChevronRight, MapPin } from 'lucide-react';
import { getChapters, getTafsirs, Chapter, Tafsir } from './lib/api';
import { getLastRead, getProgressPercentage, getProgress, LastReadPosition } from './lib/progress';
import './styles/reader.css';



export default function ReadQuranPage() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);
    const [progress, setProgress] = useState(0);
    const [totalRead, setTotalRead] = useState(0);

    useEffect(() => {
        async function loadData() {
            try {
                const chaptersData = await getChapters();
                setChapters(chaptersData);
                setLastRead(getLastRead());
                setProgress(getProgressPercentage());
                setTotalRead(getProgress().totalRead);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredChapters = useMemo(() => {
        if (!searchTerm) return chapters;
        const query = searchTerm.toLowerCase();
        return chapters.filter(
            (ch) =>
                ch.name_simple.toLowerCase().includes(query) ||
                ch.name_arabic.includes(searchTerm) ||
                ch.translated_name.name.toLowerCase().includes(query) ||
                ch.id.toString() === query
        );
    }, [chapters, searchTerm]);

    if (loading) {
        return (
            <div className="quran-reader">
                <div className="reader-container" style={{ paddingTop: 120 }}>
                    <div className="reader-loading">
                        <div className="reader-spinner"></div>
                        <p className="reader-loading-text">Loading the Noble Quran...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quran-reader">
            <div className="reader-container" style={{ paddingTop: 100, maxWidth: 1000 }}>
                {/* Hero Section */}
                <header style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        background: 'var(--reader-primary-soft)',
                        borderRadius: '16px',
                        marginBottom: 20
                    }}>
                        <BookOpen size={28} color="var(--reader-primary)" />
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(28px, 5vw, 40px)',
                        fontWeight: 800,
                        color: 'var(--reader-text)',
                        marginBottom: 12,
                        letterSpacing: '-0.02em'
                    }}>
                        Read the Noble Quran
                    </h1>
                    <p style={{
                        fontSize: 16,
                        color: 'var(--reader-text-secondary)',
                        maxWidth: 500,
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        Beautiful Arabic text with translations and audio recitations from world-renowned Qaris.
                    </p>
                </header>

                {/* Continue Reading Card */}
                {lastRead && (
                    <Link
                        href={`/read-quran/${lastRead.surahId}#verse-${lastRead.verseNumber}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            padding: '20px 24px',
                            background: 'var(--reader-bg-card)',
                            border: '1px solid var(--reader-border)',
                            borderRadius: 16,
                            textDecoration: 'none',
                            marginBottom: 32,
                            transition: 'all 0.2s ease'
                        }}
                        className="hover-lift"
                    >
                        <div style={{
                            width: 48,
                            height: 48,
                            background: 'var(--reader-primary-soft)',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Clock size={22} color="var(--reader-primary)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: 'var(--reader-text-muted)', marginBottom: 4 }}>
                                Continue Reading
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--reader-text)' }}>
                                Surah {lastRead.surahName} • Ayah {lastRead.verseNumber}
                            </div>
                        </div>
                        <ChevronRight size={20} color="var(--reader-primary)" />
                    </Link>
                )}

                {/* Progress Bar */}
                {progress > 0 && (
                    <div style={{
                        background: 'var(--reader-bg-card)',
                        border: '1px solid var(--reader-border)',
                        borderRadius: 12,
                        padding: '16px 20px',
                        marginBottom: 32
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 10
                        }}>
                            <span style={{ fontSize: 14, color: 'var(--reader-text-secondary)' }}>
                                Reading Progress
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--reader-primary)' }}>
                                {progress.toFixed(1)}%
                            </span>
                        </div>
                        <div style={{
                            height: 6,
                            background: 'var(--reader-border)',
                            borderRadius: 3,
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${progress}%`,
                                background: 'var(--reader-primary)',
                                borderRadius: 3,
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--reader-text-muted)', marginTop: 8 }}>
                            {totalRead} verses read
                        </div>
                    </div>
                )}

                {/* Mushaf Page Reader Banner */}
                <Link
                    href="/quran-pages"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '18px 24px',
                        background: 'linear-gradient(135deg, var(--reader-primary-soft) 0%, var(--reader-gold-soft) 100%)',
                        border: '1px solid var(--reader-primary)',
                        borderRadius: 16,
                        textDecoration: 'none',
                        marginBottom: 24,
                        transition: 'all 0.25s ease',
                    }}
                    className="hover-lift"
                >
                    <div style={{
                        width: 48,
                        height: 48,
                        background: 'var(--reader-primary)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <BookOpen size={22} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--reader-text-muted)', marginBottom: 3 }}>
                            NEW — Distraction-free reading
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--reader-text)', marginBottom: 3 }}>
                            Mushaf Page Reader
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--reader-text-secondary)' }}>
                            Flip through 604 high-resolution Quran pages with page-turn animations
                        </div>
                    </div>
                    <ArrowRight size={20} color="var(--reader-primary)" style={{ flexShrink: 0 }} />
                </Link>

                {/* Search */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 20px',
                    background: 'var(--reader-bg-card)',
                    border: '1px solid var(--reader-border)',
                    borderRadius: 12,
                    marginBottom: 24
                }}>
                    <Search size={20} color="var(--reader-text-muted)" />
                    <input
                        type="text"
                        placeholder="Search surah by name or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--reader-text)',
                            fontSize: 15,
                            outline: 'none'
                        }}
                    />
                </div>



                {/* Surah Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 12
                }}>
                    {filteredChapters.map((chapter) => (
                        <SurahCard key={chapter.id} chapter={chapter} />
                    ))}
                </div>

                {filteredChapters.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'var(--reader-text-secondary)'
                    }}>
                        <p>No surahs found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .hover-lift:hover {
                    border-color: var(--reader-border-light);
                    transform: translateY(-2px);
                }
                .hover-card:hover {
                    border-color: var(--reader-primary);
                    background: var(--reader-bg-hover);
                }
            `}</style>
        </div>
    );
}

// Surah Card Component
function SurahCard({ chapter }: { chapter: Chapter }) {
    return (
        <Link
            href={`/read-quran/${chapter.id}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 20px',
                background: 'var(--reader-bg-card)',
                border: '1px solid var(--reader-border)',
                borderRadius: 12,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
            }}
            className="surah-card"
        >
            <div style={{
                width: 44,
                height: 44,
                background: 'var(--reader-bg-elevated)',
                border: '1px solid var(--reader-border)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--reader-text-muted)'
            }}>
                {chapter.id}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 6
                }}>
                    <span style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--reader-text)'
                    }}>
                        {chapter.name_simple}
                    </span>
                    <span style={{
                        fontFamily: "var(--font-arabic)",
                        fontSize: 20,
                        color: 'var(--reader-primary)'
                    }}>
                        {chapter.name_arabic}
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 12,
                    color: 'var(--reader-text-muted)'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} />
                        {chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}
                    </span>
                    <span>•</span>
                    <span>{chapter.verses_count} verses</span>
                </div>
            </div>

            <style jsx>{`
                .surah-card:hover {
                    border-color: var(--reader-primary);
                    background: var(--reader-bg-hover);
                }
                .surah-card:hover > div:first-child {
                    background: var(--reader-primary);
                    border-color: var(--reader-primary);
                    color: white;
                }
            `}</style>
        </Link>
    );
}
