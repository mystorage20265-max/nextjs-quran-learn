'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    X, ChevronLeft, ChevronRight, BookOpen,
    Copy, Check, Loader2, BookMarked, ScrollText, User
} from 'lucide-react';
import { getTafsirContent } from '../lib/api';

interface Verse {
    id: number;
    verse_number: number;
    verse_key: string;
    text_uthmani?: string;
    text_indopak?: string;
    translations?: { text: string }[];
}

interface Chapter {
    id: number;
    name_arabic: string;
    name_simple: string;
    translated_name?: { name: string };
    verses_count: number;
    revelation_place?: string;
}

interface TafseerModalProps {
    isOpen: boolean;
    onClose: () => void;
    verse: Verse | null;
    chapter: Chapter | null;
    allVerses: Verse[];
    onNavigate: (verseNumber: number) => void;
    surahNumber: number;
    cleanArabicText: (text: string) => string;
    removeBismillah?: (text: string) => string;
}

const SCHOLARS = [
    {
        id: 169,
        key: 'ibn-kathir',
        name: 'Ibn Kathir',
        label: 'Abridged',
        icon: BookMarked,
        desc: 'One of the most celebrated classical Quranic commentaries, authored by Imam Ibn Kathir (1301–1373 CE).',
    },
    {
        id: 168,
        key: 'maarif',
        name: "Ma'arif Al-Qur'an",
        label: 'Mufti Shafi Usmani',
        icon: ScrollText,
        desc: 'A comprehensive 8-volume Urdu tafseer translated to English, authored by Mufti Muhammad Shafi Usmani.',
    },
    {
        id: 817,
        key: 'tazkirul',
        name: 'Tazkirul Quran',
        label: 'Wahid Uddin Khan',
        icon: User,
        desc: 'A modern commentary focused on making the Quran accessible to contemporary readers.',
    },
] as const;

type ScholarKey = typeof SCHOLARS[number]['key'];

// Sanitize tafseer HTML: keep paragraph structure but strip unsafe tags
function sanitizeTafseerHtml(html: string): string {
    if (!html) return '';
    return html
        // Remove script/style/iframe
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
        // Strip all on* event handlers
        .replace(/\s+on\w+="[^"]*"/gi, '')
        .replace(/\s+on\w+='[^']*'/gi, '')
        // Remove sup footnote elements
        .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
        // Convert h1/h2/h3 → strong paragraphs
        .replace(/<h[1-3][^>]*>/gi, '<p><strong>')
        .replace(/<\/h[1-3]>/gi, '</strong></p>')
        // Convert divs to paragraphs
        .replace(/<div[^>]*>/gi, '<p>')
        .replace(/<\/div>/gi, '</p>')
        // Strip all except safe tags
        .replace(/<(?!\/?(?:p|strong|em|br|b|i|ul|ol|li|blockquote)\b)[^>]+>/gi, '')
        // Decode entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        // Collapse excessive whitespace
        .replace(/\s{3,}/g, ' ')
        .trim();
}

export default function TafseerModal({
    isOpen,
    onClose,
    verse,
    chapter,
    allVerses,
    onNavigate,
    surahNumber,
    cleanArabicText,
    removeBismillah,
}: TafseerModalProps) {
    const [activeScholar, setActiveScholar] = useState<ScholarKey>('ibn-kathir');
    const [tafsirCache, setTafsirCache] = useState<Partial<Record<ScholarKey, Record<string, string>>>>({});
    const [loading, setLoading] = useState<Partial<Record<ScholarKey, boolean>>>({});
    const [errors, setErrors] = useState<Partial<Record<ScholarKey, boolean>>>({});
    const [copied, setCopied] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // ESC key to close
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    // Fetch tafseer for active scholar + current surah (lazy, cached per surah)
    const fetchScholarTafsir = useCallback(async (scholarKey: ScholarKey, scholarId: number) => {
        if (tafsirCache[scholarKey]) return; // already cached
        if (loading[scholarKey]) return;     // already loading
        setLoading(prev => ({ ...prev, [scholarKey]: true }));
        try {
            const content = await getTafsirContent(scholarId, surahNumber);
            setTafsirCache(prev => ({ ...prev, [scholarKey]: content }));
            setErrors(prev => ({ ...prev, [scholarKey]: false }));
        } catch {
            setErrors(prev => ({ ...prev, [scholarKey]: true }));
        } finally {
            setLoading(prev => ({ ...prev, [scholarKey]: false }));
        }
    }, [surahNumber, tafsirCache, loading]);

    // Fetch when modal opens or scholar tab changes
    useEffect(() => {
        if (!isOpen || !verse) return;
        const scholar = SCHOLARS.find(s => s.key === activeScholar)!;
        fetchScholarTafsir(scholar.key, scholar.id);
    }, [isOpen, activeScholar, verse, fetchScholarTafsir]);

    // Reset cache when surah changes
    useEffect(() => {
        setTafsirCache({});
        setLoading({});
        setErrors({});
    }, [surahNumber]);

    // Scroll content to top when verse or scholar changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [verse?.verse_number, activeScholar]);

    if (!verse || !chapter) return null;

    const scholar = SCHOLARS.find(s => s.key === activeScholar)!;
    const cachedContent = tafsirCache[activeScholar];
    const tafsirText = cachedContent?.[verse.verse_key] ?? null;
    const isLoading = loading[activeScholar];
    const hasError = errors[activeScholar];

    const arabicText = cleanArabicText(
        verse.verse_number === 1 && removeBismillah
            ? removeBismillah(verse.text_indopak ?? verse.text_uthmani ?? '')
            : (verse.text_indopak ?? verse.text_uthmani ?? '')
    );
    const translation = verse.translations?.[0]?.text ?? 'Translation not available.';
    const currentIndex = allVerses.findIndex(v => v.verse_number === verse.verse_number);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allVerses.length - 1;

    const handleCopy = () => {
        const rawText = tafsirText
            ? tafsirText.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim()
            : '';
        const text = `${arabicText}\n\n${translation}\n\n— Tafseer ${scholar.name} (${verse.verse_key})\n\n${rawText}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`tsm-backdrop ${isOpen ? 'tsm-backdrop--open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={`Tafseer for verse ${verse.verse_key}`}
                className={`tsm-panel ${isOpen ? 'tsm-panel--open' : ''}`}
            >
                {/* ── HEADER ── */}
                <div className="tsm-header">
                    <div className="tsm-header-meta">
                        <div className="tsm-surah-badge">
                            <BookOpen size={13} />
                            <span>{chapter.name_simple}</span>
                        </div>
                        <div className="tsm-verse-label">
                            <span className="tsm-surah-arabic">{chapter.name_arabic}</span>
                            <span className="tsm-dot">·</span>
                            <span>Verse {verse.verse_number} of {chapter.verses_count}</span>
                        </div>
                    </div>

                    <div className="tsm-header-actions">
                        {/* Verse Navigation */}
                        <button
                            className="tsm-nav-btn"
                            onClick={() => hasPrev && onNavigate(allVerses[currentIndex - 1].verse_number)}
                            disabled={!hasPrev}
                            title="Previous verse"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <span className="tsm-nav-count">{verse.verse_number}/{chapter.verses_count}</span>
                        <button
                            className="tsm-nav-btn"
                            onClick={() => hasNext && onNavigate(allVerses[currentIndex + 1].verse_number)}
                            disabled={!hasNext}
                            title="Next verse"
                        >
                            <ChevronRight size={15} />
                        </button>
                        <button className="tsm-close-btn" onClick={onClose} title="Close">
                            <X size={17} />
                        </button>
                    </div>
                </div>

                {/* ── SCROLLABLE BODY ── */}
                <div className="tsm-body" ref={contentRef}>

                    {/* Verse Card */}
                    <div className="tsm-verse-card">
                        <div className="tsm-verse-key-row">
                            <span className="tsm-verse-key-badge">{verse.verse_key}</span>
                            {chapter.revelation_place && (
                                <span className="tsm-revelation-badge">{chapter.revelation_place}</span>
                            )}
                        </div>
                        <p className="tsm-arabic-text" dir="rtl" lang="ar">{arabicText}</p>
                        <p className="tsm-translation-text">{translation}</p>
                    </div>

                    {/* Scholar Tabs */}
                    <div className="tsm-tabs-header">
                        <p className="tsm-tabs-label">Tafseer Commentary</p>
                        <div className="tsm-tabs">
                            {SCHOLARS.map(s => {
                                const Icon = s.icon;
                                return (
                                    <button
                                        key={s.key}
                                        className={`tsm-tab ${activeScholar === s.key ? 'tsm-tab--active' : ''}`}
                                        onClick={() => setActiveScholar(s.key)}
                                    >
                                        <Icon size={13} />
                                        <span className="tsm-tab-name">{s.name}</span>
                                        {loading[s.key] && <span className="tsm-tab-dot tsm-tab-dot--loading" />}
                                        {tafsirCache[s.key] && !loading[s.key] && (
                                            <span className="tsm-tab-dot tsm-tab-dot--loaded" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scholar Info Banner */}
                    <div className="tsm-scholar-banner">
                        <div className="tsm-scholar-icon-wrap">
                            <scholar.icon size={16} />
                        </div>
                        <div className="tsm-scholar-info">
                            <p className="tsm-scholar-name">{scholar.name} — <em>{scholar.label}</em></p>
                            <p className="tsm-scholar-desc">{scholar.desc}</p>
                        </div>
                    </div>

                    {/* Tafseer Content */}
                    <div className="tsm-content-area">
                        {isLoading && (
                            <div className="tsm-loading">
                                <Loader2 size={20} className="tsm-spinner" />
                                <span>Loading {scholar.name} commentary…</span>
                            </div>
                        )}

                        {!isLoading && hasError && (
                            <div className="tsm-error">
                                <p>Could not load tafseer. Please check your connection and try again.</p>
                                <button
                                    className="tsm-retry-btn"
                                    onClick={() => {
                                        // Reset error so fetchScholarTafsir can retry
                                        setErrors(prev => ({ ...prev, [activeScholar]: false }));
                                        setTafsirCache(prev => {
                                            const copy = { ...prev };
                                            delete copy[activeScholar];
                                            return copy;
                                        });
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {!isLoading && !hasError && cachedContent && !tafsirText && (
                            <div className="tsm-empty">
                                <BookOpen size={32} className="tsm-empty-icon" />
                                <p>Tafseer is not available for this verse in this commentary.</p>
                            </div>
                        )}

                        {!isLoading && !hasError && tafsirText && (
                            <div
                                className="tsm-tafseer-prose"
                                dangerouslySetInnerHTML={{ __html: sanitizeTafseerHtml(tafsirText) }}
                            />
                        )}

                        {/* Skeleton placeholders while first loading */}
                        {!isLoading && !hasError && !cachedContent && (
                            <div className="tsm-skeleton-wrap">
                                {[100, 90, 95, 80, 70].map((w, i) => (
                                    <div key={i} className="tsm-skeleton" style={{ width: `${w}%` }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="tsm-footer">
                    <div className="tsm-footer-nav">
                        <button
                            className="tsm-footer-nav-btn"
                            onClick={() => hasPrev && onNavigate(allVerses[currentIndex - 1].verse_number)}
                            disabled={!hasPrev}
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <span className="tsm-footer-verse-key">{verse.verse_key}</span>
                        <button
                            className="tsm-footer-nav-btn"
                            onClick={() => hasNext && onNavigate(allVerses[currentIndex + 1].verse_number)}
                            disabled={!hasNext}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                    <button className="tsm-copy-btn" onClick={handleCopy}>
                        {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Tafseer</>}
                    </button>
                </div>
            </div>
        </>
    );
}
