'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getChapters, Chapter } from './lib/api';

type TabType = 'surah' | 'juz' | 'revelation';

export default function ReadQuranPage() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('surah');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch chapters on mount
    useEffect(() => {
        async function loadChapters() {
            try {
                setLoading(true);
                const data = await getChapters();
                setChapters(data);
            } catch (err) {
                setError('Failed to load chapters. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadChapters();
    }, []);

    // Filter and sort chapters based on active tab and search
    const displayedChapters = useMemo(() => {
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

        // Sort based on tab
        if (activeTab === 'revelation') {
            return [...filtered].sort((a, b) => a.revelation_order - b.revelation_order);
        }

        return filtered;
    }, [chapters, searchQuery, activeTab]);

    // Group chapters by Juz (approximate)
    const juzGroups = useMemo(() => {
        if (activeTab !== 'juz') return null;

        const groups: { [key: number]: Chapter[] } = {};
        chapters.forEach((ch) => {
            // Approximate juz based on chapter position
            const juz = Math.ceil(ch.id / 4);
            if (!groups[juz]) groups[juz] = [];
            groups[juz].push(ch);
        });
        return groups;
    }, [chapters, activeTab]);

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
                    <p style={{ color: '#ef4444' }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '16px',
                            padding: '8px 24px',
                            background: 'var(--rq-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rq-container">
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
                        placeholder="Search by surah name, number, or meaning..."
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
                    className={`rq-tab ${activeTab === 'revelation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('revelation')}
                >
                    ⏳ Revelation Order
                </button>
            </div>

            {/* Surah Grid */}
            {activeTab !== 'juz' ? (
                <div className="rq-surah-grid">
                    {displayedChapters.map((chapter) => (
                        <SurahCard key={chapter.id} chapter={chapter} showOrder={activeTab === 'revelation'} />
                    ))}
                </div>
            ) : (
                // Juz View
                <div>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => (
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
                                {chapters
                                    .filter((ch) => ch.pages && ch.pages[0] >= (juzNum - 1) * 20 + 1 && ch.pages[0] <= juzNum * 20)
                                    .map((chapter) => (
                                        <SurahCard key={chapter.id} chapter={chapter} />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {displayedChapters.length === 0 && searchQuery && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--rq-text-secondary)' }}>
                    <p>No surahs found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
}

// Surah Card Component
function SurahCard({ chapter, showOrder = false }: { chapter: Chapter; showOrder?: boolean }) {
    return (
        <Link href={`/read-quran/${chapter.id}`} className="rq-surah-card">
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
