'use client';

import { useMemo } from 'react';

interface TafsirSectionProps {
    verseKey: string;
    content: string;
}

/**
 * Brief Tafsir - Fixed 5-10 lines, minimal UI
 * Uses CSS variables for dark mode compatibility
 */
export default function TafsirSection({ verseKey, content }: TafsirSectionProps) {
    // Extract only first ~500 chars (5-10 lines)
    const briefText = useMemo(() => {
        const cleaned = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        if (cleaned.length <= 500) return cleaned;

        // Cut at sentence boundary
        const cut = cleaned.substring(0, 500).lastIndexOf('.');
        return cleaned.substring(0, cut > 300 ? cut + 1 : 480);
    }, [content]);

    return (
        <p
            className="tafsir-brief"
            style={{
                marginTop: '12px',
                padding: '12px 16px',
                fontSize: '0.9rem',
                lineHeight: '1.7',
                color: 'var(--rq-text-secondary)',
                background: 'var(--rq-bg-subtle)',
                borderLeft: '3px solid var(--rq-primary)',
                borderRadius: '0 6px 6px 0'
            }}
        >
            {briefText}
        </p>
    );
}
