'use client';

import { useState, useMemo } from 'react';

interface TafsirSectionProps {
    verseKey: string;
    content: string;
}

/**
 * Simple Tafsir Section - Clean, minimal UI inspired by alim.org
 * Shows brief summary first, full content on expand
 */
export default function TafsirSection({ verseKey, content }: TafsirSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Strip HTML and clean up content
    const cleanContent = useMemo(() => {
        return content
            .replace(/<[^>]*>/g, '')  // Remove HTML tags
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .replace(/\([^)]*\)/g, '') // Remove parenthetical references
            .trim();
    }, [content]);

    // Extract brief summary (first sentence or ~100 chars)
    const briefSummary = useMemo(() => {
        // Try to get first sentence
        const firstSentence = cleanContent.match(/^[^.!?]+[.!?]/);
        if (firstSentence && firstSentence[0].length <= 200) {
            return firstSentence[0].trim();
        }

        // Fallback: first 120 characters at word boundary
        if (cleanContent.length <= 150) return cleanContent;
        const cutoff = cleanContent.substring(0, 150).lastIndexOf(' ');
        return cleanContent.substring(0, cutoff > 80 ? cutoff : 120) + '...';
    }, [cleanContent]);

    const isShortContent = cleanContent.length <= 200;

    return (
        <div className="tafsir-simple">
            {/* Simple Header */}
            <div className="tafsir-simple-header">
                <span className="tafsir-simple-title">📖 Brief Tafsir</span>
                {!isShortContent && (
                    <button
                        className="tafsir-simple-toggle"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Brief ▲' : 'Full ▼'}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="tafsir-simple-content">
                {isExpanded ? (
                    // Full content (with HTML for formatting if needed)
                    <div
                        className="tafsir-simple-text tafsir-full"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : (
                    // Brief summary - just plain text, easy to read
                    <div className="tafsir-simple-preview">
                        <p>{briefSummary}</p>
                        {!isShortContent && (
                            <button
                                className="tafsir-simple-read-more"
                                onClick={() => setIsExpanded(true)}
                            >
                                Read full tafsir →
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
