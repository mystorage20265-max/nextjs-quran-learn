'use client';

import React, { useEffect, useState } from 'react';
import { GlyphVerse, fetchPageGlyphs, fetchChapterGlyphs } from '@/services/quranGlyphApi';
import { GlyphWord } from './GlyphWord';
import { extractPageNumbers, preloadGlyphFonts } from '@/utils/glyphFontLoader';
import './MushafPage.css';

interface MushafPageProps {
    pageNumber?: number;
    chapterNumber?: number;
    mode?: 'page' | 'chapter';
}

export function MushafPage({ pageNumber, chapterNumber, mode = 'page' }: MushafPageProps) {
    const [verses, setVerses] = useState<GlyphVerse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                let data;
                if (mode === 'page' && pageNumber) {
                    data = await fetchPageGlyphs(pageNumber);
                } else if (mode === 'chapter' && chapterNumber) {
                    data = await fetchChapterGlyphs(chapterNumber);
                } else {
                    throw new Error('Invalid mode or missing page/chapter number');
                }

                setVerses(data.verses);

                // Extract and preload fonts for all pages in the data
                const pageNumbers = extractPageNumbers(data.verses);
                await preloadGlyphFonts(pageNumbers);
                setFontsLoaded(true);
                setLoading(false);
            } catch (err) {
                console.error('Error loading Mushaf data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
                setLoading(false);
            }
        }

        loadData();
    }, [pageNumber, chapterNumber, mode]);

    if (loading) {
        return (
            <div className="mushaf-loading">
                <div className="mushaf-spinner"></div>
                <p>Loading authentic Mushaf...</p>
                {!fontsLoaded && <p className="mushaf-loading-fonts">Loading fonts...</p>}
            </div>
        );
    }

    if (error) {
        return (
            <div className="mushaf-error">
                <div className="mushaf-error-icon">⚠️</div>
                <h3>Error Loading Page</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="mushaf-retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    if (verses.length === 0) {
        return (
            <div className="mushaf-empty">
                <p>No verses found</p>
            </div>
        );
    }

    // Group words by line
    const lineGroups = new Map<number, typeof verses[0]['words']>();

    verses.forEach(verse => {
        verse.words.forEach(word => {
            const lineNum = word.line_number;
            if (!lineGroups.has(lineNum)) {
                lineGroups.set(lineNum, []);
            }
            lineGroups.get(lineNum)!.push(word);
        });
    });

    const sortedLines = Array.from(lineGroups.entries()).sort((a, b) => a[0] - b[0]);

    return (
        <div className="mushaf-page-container" data-page={pageNumber} data-chapter={chapterNumber}>
            <div className="mushaf-page">
                {sortedLines.map(([lineNumber, words]) => (
                    <div key={lineNumber} className="mushaf-line" data-line={lineNumber}>
                        <div className="mushaf-words">
                            {words.map(word => (
                                <GlyphWord
                                    key={word.id}
                                    word={word}
                                    showTooltip={true}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mushaf-page-footer">
                <div className="mushaf-page-number">
                    {mode === 'page' && pageNumber && `Page ${pageNumber}`}
                    {mode === 'chapter' && chapterNumber && `Chapter ${chapterNumber}`}
                </div>
            </div>
        </div>
    );
}

export default MushafPage;
