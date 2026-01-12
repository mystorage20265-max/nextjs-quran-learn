'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getChapters, Chapter } from '../../lib/api';

interface PageProps {
    params: Promise<{ tafsirId: string }>;
}

export default function TafsirSurahSelectionPage({ params }: PageProps) {
    const { tafsirId } = use(params);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getChapters().then(setChapters).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="rq-container">
                <div className="rq-loading">
                    <div className="rq-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rq-container">
            <section className="rq-hero">
                <h1>📚 Select a Surah</h1>
                <p>Choose a chapter to read with Tafsir ID: {tafsirId}</p>
            </section>

            <div className="rq-surah-grid">
                {chapters.map((chapter) => (
                    <TafsirSurahCard
                        key={chapter.id}
                        chapter={chapter}
                        tafsirId={tafsirId}
                    />
                ))}
            </div>
        </div>
    );
}

function TafsirSurahCard({ chapter, tafsirId }: { chapter: Chapter; tafsirId: string }) {
    return (
        <Link
            href={`/read-quran/${chapter.id}?tafsir=${tafsirId}`}
            className="rq-surah-card"
        >
            <div className="rq-surah-number">{chapter.id}</div>
            <div className="rq-surah-info">
                <div className="rq-surah-name-row">
                    <span className="rq-surah-name-en">{chapter.name_simple}</span>
                    <span className="rq-surah-name-ar">{chapter.name_arabic}</span>
                </div>
                <div className="rq-surah-meta">
                    <span>{chapter.translated_name.name}</span>
                </div>
            </div>
        </Link>
    );
}
