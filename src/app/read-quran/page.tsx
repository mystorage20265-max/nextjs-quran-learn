'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getChapters, getTafsirs, Chapter, Tafsir } from './lib/api';
import { getLastRead, getProgressPercentage, getProgress, LastReadPosition } from './lib/progress';

type TabType = 'surah' | 'juz' | 'tafsir';

export default function ReadQuranPage() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [tafsirs, setTafsirs] = useState<Tafsir[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('surah');
    const [searchQuery, setSearchQuery] = useState('');
    const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);
    const [progressPercent, setProgressPercent] = useState(0);
    const [totalRead, setTotalRead] = useState(0);

    // Fetch data on mount
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
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Load last read position and progress
    useEffect(() => {
        const saved = getLastRead();
        if (saved) setLastRead(saved);

        setProgressPercent(getProgressPercentage());
        setTotalRead(getProgress().totalRead);
    }, []);

    // Filter and sort chapters/tafsirs based on active tab and search
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const displayedContent = useMemo(() => {
        if (activeTab === 'tafsir') {
            if (!searchQuery) return tafsirs;
            const query = searchQuery.toLowerCase();
            return tafsirs.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.author_name.toLowerCase().includes(query) ||
                t.language_name.toLowerCase().includes(query)
            );
        }

        let filtered = chapters;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = chapters.filter(
                (ch) =>
                    ch.name_simple.toLowerCase().includes(query) ||
                    ch.name_arabic.includes(searchQuery) ||
                    ch.translated_name.name.toLowerCase().includes(query) ||
                    ch.id.toString() === query
            );
        }

        return filtered;
    }, [chapters, tafsirs, searchQuery, activeTab]);

    // Note: Juz view uses hardcoded JUZ_START_SURAHS mapping for accurate Juz-to-Surah associations

    if (loading) {
        return (
            <div className="rq-container">
                <div className="rq-loading">
                    <div className="rq-spinner"></div>
                    <p style={{ marginTop: '16px' }}>Loading Quran...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rq-container">
                <div className="rq-loading">
                    <p className="rq-error-text">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rq-retry-btn"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rq-container">
            {/* Continue Reading Banner */}
            {lastRead && (
                <Link
                    href={`/read-quran/${lastRead.surahId}#verse-${lastRead.verseNumber}`}
                    className="rq-continue-reading"
                >
                    <span className="rq-continue-icon">▶️</span>
                    <div className="rq-continue-text">
                        <span className="rq-continue-label">Continue Reading</span>
                        <span className="rq-continue-position">
                            {lastRead.surahName}, Verse {lastRead.verseNumber}
                        </span>
                    </div>
                    <span className="rq-continue-arrow">→</span>
                </Link>
            )}

            {/* Reading Progress */}
            {totalRead > 0 && (
                <div className="rq-progress-section">
                    <div className="rq-progress-header">
                        <span>📊 Reading Progress</span>
                        <span className="rq-progress-percent">{progressPercent}%</span>
                    </div>
                    <div className="rq-progress-bar-container">
                        <div
                            className="rq-progress-bar-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="rq-progress-detail">{totalRead} of 6,236 verses read</span>
                </div>
            )}

            {/* Hero Section */}
            <section className="rq-hero">
                <h1>📖 Read the Noble Quran</h1>
                <p>
                    Explore the Holy Quran with beautiful Arabic text, translations, and audio recitations
                </p>
            </section>

            {/* Search Bar */}
            <div className="rq-search-container">
                <div className="rq-search">
                    <span className="rq-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder={activeTab === 'tafsir' ? "Search tafsirs by name, author..." : "Search by surah name, number..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="rq-tabs">
                <button
                    className={`rq-tab ${activeTab === 'surah' ? 'active' : ''}`}
                    onClick={() => setActiveTab('surah')}
                >
                    📜 Surah
                </button>
                <button
                    className={`rq-tab ${activeTab === 'juz' ? 'active' : ''}`}
                    onClick={() => setActiveTab('juz')}
                >
                    📚 Juz
                </button>
                <button
                    className={`rq-tab ${activeTab === 'tafsir' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tafsir')}
                >
                    📚 Tafsir
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'tafsir' ? (
                // Tafsir Grid
                <div className="rq-surah-grid">
                    {(displayedContent as Tafsir[]).map((tafsir, index) => (
                        <Link href={`/read-quran/tafsir/${tafsir.id}`} key={tafsir.id} className="rq-surah-card">
                            <div className="rq-surah-number">
                                {index + 1}
                            </div>
                            <div className="rq-surah-info">
                                <div className="rq-surah-name-row">
                                    <span className="rq-surah-name-en">{tafsir.name}</span>
                                </div>
                                <div className="rq-surah-meta">
                                    <span>
                                        👤 {tafsir.author_name}
                                    </span>
                                    <span>
                                        🌐 {tafsir.language_name}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : activeTab === 'surah' ? (
                // Surah Grid
                <div className="rq-surah-grid">
                    {(displayedContent as Chapter[]).map((chapter) => (
                        <SurahCard
                            key={chapter.id}
                            chapter={chapter}
                            initialMode="translation"
                        />
                    ))}
                </div>
            ) : (
                // Juz View
                <div>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                        // Proper Juz to Surah mapping (which surahs START in each Juz)
                        const JUZ_START_SURAHS: { [key: number]: number[] } = {
                            1: [1, 2], // Al-Fatiha, Al-Baqarah (starts)
                            2: [2], // Al-Baqarah (continues)
                            3: [2, 3], // Al-Baqarah ends, Al-Imran starts
                            4: [3, 4], // Al-Imran, An-Nisa
                            5: [4], // An-Nisa continues
                            6: [4, 5], // An-Nisa, Al-Ma'idah
                            7: [5, 6], // Al-Ma'idah, Al-An'am
                            8: [6, 7], // Al-An'am, Al-A'raf
                            9: [7, 8], // Al-A'raf, Al-Anfal
                            10: [8, 9], // Al-Anfal, At-Tawbah
                            11: [9, 10, 11], // At-Tawbah, Yunus, Hud
                            12: [11, 12], // Hud, Yusuf
                            13: [12, 13, 14], // Yusuf, Ar-Ra'd, Ibrahim
                            14: [15, 16], // Al-Hijr, An-Nahl
                            15: [17, 18], // Al-Isra, Al-Kahf
                            16: [18, 19, 20], // Al-Kahf, Maryam, Taha
                            17: [21, 22], // Al-Anbiya, Al-Hajj
                            18: [23, 24, 25], // Al-Mu'minun, An-Nur, Al-Furqan
                            19: [25, 26, 27], // Al-Furqan, Ash-Shu'ara, An-Naml
                            20: [27, 28, 29], // An-Naml, Al-Qasas, Al-Ankabut
                            21: [29, 30, 31, 32, 33], // Al-Ankabut, Ar-Rum, Luqman, As-Sajdah, Al-Ahzab
                            22: [33, 34, 35, 36], // Al-Ahzab, Saba, Fatir, Ya-Sin
                            23: [36, 37, 38, 39], // Ya-Sin, As-Saffat, Sad, Az-Zumar
                            24: [39, 40, 41], // Az-Zumar, Ghafir, Fussilat
                            25: [41, 42, 43, 44, 45], // Fussilat, Ash-Shura, Az-Zukhruf, Ad-Dukhan, Al-Jathiyah
                            26: [46, 47, 48, 49, 50, 51], // Al-Ahqaf to Adh-Dhariyat
                            27: [51, 52, 53, 54, 55, 56, 57], // Adh-Dhariyat to Al-Hadid
                            28: [58, 59, 60, 61, 62, 63, 64, 65, 66], // Al-Mujadila to At-Tahrim
                            29: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77], // Al-Mulk to Al-Mursalat
                            30: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114] // An-Naba to An-Nas
                        };

                        const juzSurahs = chapters.filter(ch =>
                            JUZ_START_SURAHS[juzNum]?.includes(ch.id)
                        );

                        // Skip empty Juz sections
                        if (juzSurahs.length === 0) return null;

                        return (
                            <div key={juzNum} style={{ marginBottom: '32px' }}>
                                <h3 style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    color: 'var(--rq-text)',
                                    marginBottom: '16px',
                                    paddingBottom: '8px',
                                    borderBottom: '2px solid var(--rq-primary)'
                                }}>
                                    Juz {juzNum}
                                </h3>
                                <div className="rq-surah-grid">
                                    {juzSurahs.map((chapter) => (
                                        <SurahCard
                                            key={chapter.id}
                                            chapter={chapter}
                                            initialMode="reading"
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
            }

            {/* Empty State */}
            {
                displayedContent.length === 0 && searchQuery && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--rq-text-secondary)' }}>
                        <p>No content found matching "{searchQuery}"</p>
                    </div>
                )
            }
        </div >
    );
}

// Surah Card Component
function SurahCard({
    chapter,
    showOrder = false,
    initialMode = 'translation'
}: {
    chapter: Chapter;
    showOrder?: boolean;
    initialMode?: 'translation' | 'reading';
}) {
    return (
        <Link href={`/read-quran/${chapter.id}?mode=${initialMode}`} className="rq-surah-card">
            <div className="rq-surah-number">
                {showOrder ? chapter.revelation_order : chapter.id}
            </div>
            <div className="rq-surah-info">
                <div className="rq-surah-name-row">
                    <span className="rq-surah-name-en">{chapter.name_simple}</span>
                    <span className="rq-surah-name-ar">{chapter.name_arabic}</span>
                </div>
                <div className="rq-surah-meta">
                    <span>
                        {chapter.translated_name.name}
                    </span>
                    <span>
                        📄 {chapter.verses_count} verses
                    </span>
                    <span>
                        {chapter.revelation_place === 'makkah' ? '🕋 Meccan' : '🕌 Medinan'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
