'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, ArrowRight, Book, GraduationCap } from 'lucide-react';
import { getChapters, getTafsirs, Chapter, Tafsir } from './lib/api';
import { getLastRead, getProgressPercentage, getProgress, LastReadPosition } from './lib/progress';
import './styles/read-quran.css';

type TabType = 'surah' | 'juz' | 'tafsir';

export default function ReadQuranPage() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [tafsirs, setTafsirs] = useState<Tafsir[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('surah');
    const [searchTerm, setSearchTerm] = useState('');
    const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);
    const [progress, setProgress] = useState(0);
    const [totalRead, setTotalRead] = useState(0);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [chaptersData, tafsirsData] = await Promise.all([
                    getChapters(),
                    getTafsirs()
                ]);
                setChapters(chaptersData);
                setTafsirs(tafsirsData);

                // Load progress data
                setLastRead(getLastRead());
                setProgress(getProgressPercentage());
                setTotalRead(getProgress().totalRead);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const displayedContent = useMemo(() => {
        if (activeTab === 'tafsir') {
            if (!searchTerm) return tafsirs;
            const query = searchTerm.toLowerCase();
            return tafsirs.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.author_name.toLowerCase().includes(query) ||
                t.language_name.toLowerCase().includes(query)
            );
        }

        if (!searchTerm) return chapters;
        const query = searchTerm.toLowerCase();
        return chapters.filter(
            (ch) =>
                ch.name_simple.toLowerCase().includes(query) ||
                ch.name_arabic.includes(searchTerm) ||
                ch.translated_name.name.toLowerCase().includes(query) ||
                ch.id.toString() === query
        );
    }, [chapters, tafsirs, searchTerm, activeTab]);

    if (loading) {
        return (
            <div className="read-quran-page">
                <div className="rq-container">
                    <div className="rq-loading">
                        <div className="rq-spinner"></div>
                        <p>Loading the Noble Quran...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Juz mapping helper
    const JUZ_START_SURAHS: { [key: number]: number[] } = {
        1: [1, 2], 2: [2], 3: [2, 3], 4: [3, 4], 5: [4], 6: [4, 5], 7: [5, 6], 8: [6, 7], 9: [7, 8], 10: [8, 9],
        11: [9, 10, 11], 12: [11, 12], 13: [12, 13, 14], 14: [15, 16], 15: [17, 18], 16: [18, 19, 20], 17: [21, 22],
        18: [23, 24, 25], 19: [25, 26, 27], 20: [27, 28, 29], 21: [29, 30, 31, 32, 33], 22: [33, 34, 35, 36],
        23: [36, 37, 38, 39], 24: [39, 40, 41], 25: [41, 42, 43, 44, 45], 26: [46, 47, 48, 49, 50, 51],
        27: [51, 52, 53, 54, 55, 56, 57], 28: [58, 59, 60, 61, 62, 63, 64, 65, 66],
        29: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77],
        30: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114]
    };

    return (
        <div className="read-quran-page">
            <div className="rq-container">
                {/* Hero Section */}
                <header className="rq-hero">
                    <div className="rq-hero-badge">📖</div>
                    <h1>Read the Noble Quran</h1>
                    <p>Explore the Holy Quran with beautiful Arabic text, translations, and audio recitations</p>
                </header>

                {/* Search & Tabs */}
                <div className="rq-controls">
                    <div className="rq-search-container">
                        <div className="rq-search">
                            <Search className="rq-search-icon" size={24} />
                            <input
                                type="text"
                                placeholder="Search by surah name, number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rq-tabs">
                        <button
                            className={`rq-tab ${activeTab === 'surah' ? 'active' : ''}`}
                            onClick={() => setActiveTab('surah')}
                        >
                            <span style={{ marginRight: '8px' }}>📜</span> Surah
                        </button>
                        <button
                            className={`rq-tab ${activeTab === 'juz' ? 'active' : ''}`}
                            onClick={() => setActiveTab('juz')}
                        >
                            <span style={{ marginRight: '8px' }}>📚</span> Juz
                        </button>
                        <button
                            className={`rq-tab ${activeTab === 'tafsir' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tafsir')}
                        >
                            <span style={{ marginRight: '8px' }}>📚</span> Tafsir
                        </button>
                    </div>
                </div>

                {/* Last Read Banner (Clean Vercel Style) */}
                {lastRead && (
                    <div style={{ maxWidth: '800px', margin: '0 auto 40px', animation: 'v-slideUp 1s ease-out 0.8s backwards' }}>
                        <Link href={`/read-quran/${lastRead.surahId}#verse-${lastRead.verseNumber}`} style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '16px',
                            padding: '16px 24px',
                            textDecoration: 'none',
                            color: 'white',
                            transition: 'all 0.3s'
                        }} className="hover:scale-[1.01]">
                            <Clock size={20} className="text-emerald-500 mr-4" />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--rq-text-secondary)' }}>Continue Reading</div>
                                <div style={{ fontWeight: '700' }}>Surah {lastRead.surahName} • Ayah {lastRead.verseNumber}</div>
                            </div>
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                )}

                {/* Content Area */}
                <div className="rq-content-area">
                    {activeTab === 'surah' && (
                        <div className="rq-surah-grid">
                            {(displayedContent as Chapter[]).map((chapter, index) => (
                                <SurahCard key={chapter.id} chapter={chapter} index={index} />
                            ))}
                        </div>
                    )}

                    {activeTab === 'juz' && (
                        <div className="rq-juz-view">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                                const juzSurahs = chapters.filter(ch =>
                                    JUZ_START_SURAHS[juzNum]?.includes(ch.id)
                                );
                                if (juzSurahs.length === 0) return null;
                                return (
                                    <div key={juzNum} className="rq-juz-section" style={{ marginBottom: '40px' }}>
                                        <h2 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            color: 'var(--rq-primary)',
                                            marginBottom: '20px',
                                            paddingBottom: '10px',
                                            borderBottom: '1px solid var(--rq-border)'
                                        }}>
                                            Juz {juzNum}
                                        </h2>
                                        <div className="rq-surah-grid">
                                            {juzSurahs.map((chapter, index) => (
                                                <SurahCard key={chapter.id} chapter={chapter} index={index} initialMode="reading" />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'tafsir' && (
                        <div className="rq-surah-grid">
                            {(displayedContent as Tafsir[]).map((tafsir, index) => (
                                <Link
                                    href={`/read-quran/tafsir/${tafsir.id}`}
                                    key={tafsir.id}
                                    className="rq-surah-card"
                                    style={{ '--delay': index } as React.CSSProperties}
                                >
                                    <div className="rq-surah-number">{index + 1}</div>
                                    <div className="rq-surah-info">
                                        <div className="rq-surah-header">
                                            <h3 className="rq-surah-name">{tafsir.name}</h3>
                                        </div>
                                        <div className="rq-surah-meta">
                                            <span className="rq-meta-item">👤 {tafsir.author_name}</span>
                                            <span className="rq-meta-item">🌐 {tafsir.language_name}</span>
                                        </div>
                                    </div>
                                    <div className="rq-card-hover-icon">
                                        <ArrowRight size={20} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {displayedContent.length === 0 && (
                        <div className="rq-no-results">
                            <p>No content found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Surah Card Component
function SurahCard({ chapter, index, initialMode = 'translation' }: { chapter: Chapter, index: number, initialMode?: string }) {
    return (
        <Link
            href={`/read-quran/${chapter.id}${initialMode === 'reading' ? '?mode=reading' : ''}`}
            className="rq-surah-card"
            style={{ '--delay': index } as React.CSSProperties}
        >
            <div className="rq-surah-number">
                {chapter.id}
            </div>
            <div className="rq-surah-info">
                <div className="rq-surah-header">
                    <h3 className="rq-surah-name">{chapter.name_simple}</h3>
                    <span className="rq-surah-arabic">{chapter.name_arabic}</span>
                </div>
                <div className="rq-surah-meta">
                    <span className="rq-meta-item">
                        {chapter.revelation_place === 'makkah' ? '🕋' : '🕌'} {chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}
                    </span>
                    <span className="rq-meta-item">
                        📄 {chapter.verses_count} Verses
                    </span>
                </div>
            </div>
        </Link>
    );
}
