'use client';

import { useState, useMemo } from 'react';

interface TafsirSectionProps {
    verseKey: string;
    content: string;
}

/**
 * Simple Tafsir Section - Clean, minimal UI inspired by alim.org
 * Just shows the tafsir text with a simple expand/collapse
 */
export default function TafsirSection({ verseKey, content }: TafsirSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Strip HTML for preview
    const strippedContent = useMemo(() => {
        return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }, [content]);

    // Extract preview text (first 200 chars)
    const preview = useMemo(() => {
        if (strippedContent.length <= 250) return strippedContent;
        const cutoff = strippedContent.substring(0, 250).lastIndexOf(' ');
        return strippedContent.substring(0, cutoff > 150 ? cutoff : 250) + '...';
    }, [strippedContent]);

    const isShortContent = strippedContent.length <= 250;

    return (
        <div className="tafsir-simple">
            {/* Simple Header */}
            <div className="tafsir-simple-header">
                <span className="tafsir-simple-title">📖 Tafsir</span>
                {!isShortContent && (
                    <button
                        className="tafsir-simple-toggle"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="tafsir-simple-content">
                {isExpanded || isShortContent ? (
                    // Full content
                    <div
                        className="tafsir-simple-text"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : (
                    // Preview
                    <div className="tafsir-simple-preview">
                        <p>{preview}</p>
                        <button
                            className="tafsir-simple-read-more"
                            onClick={() => setIsExpanded(true)}
                        >
                            Read more →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
