'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    X, ChevronLeft, ChevronRight, BookOpen,
    Loader2, BookMarked, ScrollText, User,
    RefreshCw
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
        fullName: 'Tafsir Ibn Kathir',
        label: 'Classical • 14th Century',
        color: '#f59e0b',
        icon: BookMarked,
        desc: 'One of the most celebrated classical Quranic commentaries by Imam Ibn Kathir (1301–1373 CE). Renowned for its hadith-based approach.',
    },
    {
        id: 168,
        key: 'maarif',
        name: "Ma'arif Al-Qur'an",
        fullName: "Ma'arif ul-Quran",
        label: 'Contemporary • Mufti Shafi',
        color: '#f59e0b',
        icon: ScrollText,
        desc: "A comprehensive 8-volume commentary by Mufti Muhammad Shafi Usmani, combining classical and modern scholarship.",
    },
    {
        id: 817,
        key: 'tazkirul',
        name: 'Tazkirul Quran',
        fullName: 'Tazkirul Quran',
        label: 'Modern • Wahid U. Khan',
        color: '#6366f1',
        icon: User,
        desc: 'A modern commentary by Wahid Uddin Khan focused on making the Quranic message accessible to contemporary readers.',
    },
] as const;

type ScholarKey = typeof SCHOLARS[number]['key'];

function formatTafseerHtml(raw: string): string {
    if (!raw) return '';

    let html = raw
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
        .replace(/\s+on\w+="[^"]*"/gi, '')
        .replace(/\s+on\w+='[^']*'/gi, '')
        .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
        .replace(/<div[^>]*>/gi, '<p>').replace(/<\/div>/gi, '</p>')
        .replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1')
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '<h2>$1</h2>')
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '<h2>$1</h2>')
        .replace(/<(?!\/?(?:p|strong|em|br|b|i|ul|ol|li|blockquote|h2)\b)[^>]+>/gi, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
        .replace(/\s{3,}/g, ' ')
        .trim();

    const paragraphs = html
        .split(/(<p>[\s\S]*?<\/p>|<h2>[\s\S]*?<\/h2>|<br\s*\/?>)/gi)
        .map(s => s.trim())
        .filter(Boolean);

    const sections: string[] = [];
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            sections.push('<ul class="tsm-list">' + listItems.map(li => '<li>' + li + '</li>').join('') + '</ul>');
            listItems = [];
        }
    };

    for (const block of paragraphs) {
        if (/<h2>/i.test(block)) {
            flushList();
            const text = block.replace(/<[^>]+>/g, '').trim();
            if (text) sections.push('<div class="tsm-section-heading">' + text + '</div>');
            continue;
        }

        const text = block.replace(/<[^>]+>/g, '').trim();
        if (!text || text.length < 3) continue;

        const isBoldOnly = /^<p>\s*<(strong|b)>[^<]{3,80}<\/(strong|b)>\s*<\/p>$/i.test(block);
        const isShortWithColon = text.endsWith(':') && text.length < 80 && !text.includes('.');
        const isAllCaps = text === text.toUpperCase() && text.length < 60 && /[A-Z]/.test(text);

        if (isBoldOnly || isShortWithColon || isAllCaps) {
            flushList();
            const clean = text.replace(/:$/, '');
            sections.push('<div class="tsm-section-heading">' + clean + '</div>');
            continue;
        }

        const startsWithBullet = /^(\d+[\.\)]\s|[-\u2022\u00B7]\s|[a-z]\)\s)/i.test(text);
        if (startsWithBullet && text.length < 200) {
            const content = text.replace(/^(\d+[\.\)]\s|[-\u2022\u00B7]\s|[a-z]\)\s)/i, '');
            listItems.push(content);
            continue;
        }

        const isQuote = (text.startsWith('"') && text.includes('"')) ||
            /^(Allah|The Prophet|Narrated|It was|Ibn Abbas|Ibn Mas)/i.test(text);

        if (isQuote && text.length < 400) {
            flushList();
            const innerHtml = block.replace(/<p>/gi, '').replace(/<\/p>/gi, '');
            sections.push('<blockquote class="tsm-quote">' + innerHtml + '</blockquote>');
            continue;
        }

        flushList();
        const innerHtml = block.replace(/<\/?p>/gi, '').trim();
        sections.push('<p class="tsm-para">' + innerHtml + '</p>');
    }

    flushList();
    return sections.join('\n');
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

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const currentIndex = verse ? allVerses.findIndex(v => v.verse_number === verse.verse_number) : -1;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allVerses.length - 1;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && hasPrev) onNavigate(allVerses[currentIndex - 1].verse_number);
            if (e.key === 'ArrowRight' && hasNext) onNavigate(allVerses[currentIndex + 1].verse_number);
        };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose, hasPrev, hasNext, currentIndex, allVerses, onNavigate]);

    const fetchScholarTafsir = useCallback(async (scholarKey: ScholarKey, scholarId: number) => {
        if (tafsirCache[scholarKey]) return;
        if (loading[scholarKey]) return;
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

    useEffect(() => {
        if (!isOpen || !verse) return;
        const scholar = SCHOLARS.find(s => s.key === activeScholar)!;
        fetchScholarTafsir(scholar.key, scholar.id);
    }, [isOpen, activeScholar, verse, fetchScholarTafsir]);

    useEffect(() => {
        setTafsirCache({});
        setLoading({});
        setErrors({});
    }, [surahNumber]);

    useEffect(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, [verse?.verse_number, activeScholar]);

    if (!verse || !chapter) return null;

    const scholar = SCHOLARS.find(s => s.key === activeScholar)!;
    const cachedContent = tafsirCache[activeScholar];
    const tafsirText = cachedContent?.[verse.verse_key] ?? null;
    const isScholarLoading = loading[activeScholar];
    const hasError = errors[activeScholar];

    const arabicText = cleanArabicText(
        verse.verse_number === 1 && removeBismillah
            ? removeBismillah(verse.text_indopak ?? verse.text_uthmani ?? '')
            : (verse.text_indopak ?? verse.text_uthmani ?? '')
    );
    const translation = verse.translations?.[0]?.text ?? 'Translation not available.';

    const handleRetry = () => {
        setErrors(prev => ({ ...prev, [activeScholar]: false }));
        setTafsirCache(prev => { const c = { ...prev }; delete c[activeScholar]; return c; });
    };

    const formattedTafsir = tafsirText ? formatTafseerHtml(tafsirText) : '';
    const wordCount = tafsirText ? tafsirText.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length : 0;

    return (
        <>
            <div className={`tsm-backdrop ${isOpen ? 'tsm-backdrop--open' : ''}`} onClick={onClose} aria-hidden="true" />
            <div
                className={`tsm-modal-wrap ${isOpen ? 'tsm-modal-wrap--open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={'Tafseer for verse ' + verse.verse_key}
                onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="tsm-modal">
                    <div className="tsm-top-accent" style={{ background: 'linear-gradient(90deg,' + scholar.color + ',#2dd4bf)' }} />

                    <div className="tsm-header">
                        <div className="tsm-header-left">
                            <div className="tsm-surah-badge">
                                <BookOpen size={12} />
                                <span>{chapter.name_simple}</span>
                                {chapter.revelation_place && (
                                    <span className="tsm-rev-chip">{chapter.revelation_place}</span>
                                )}
                            </div>
                            <div className="tsm-header-title">
                                <span className="tsm-header-arabic">{chapter.name_arabic}</span>
                                <span className="tsm-header-dot">·</span>
                                <span>Verse {verse.verse_number} of {chapter.verses_count}</span>
                            </div>
                        </div>
                        <div className="tsm-header-right">
                            <button className="tsm-nav-btn" onClick={() => hasPrev && onNavigate(allVerses[currentIndex - 1].verse_number)} disabled={!hasPrev} title="Previous verse">
                                <ChevronLeft size={15} />
                            </button>
                            <span className="tsm-nav-pill">{verse.verse_key}</span>
                            <button className="tsm-nav-btn" onClick={() => hasNext && onNavigate(allVerses[currentIndex + 1].verse_number)} disabled={!hasNext} title="Next verse">
                                <ChevronRight size={15} />
                            </button>
                            <button className="tsm-close-btn" onClick={onClose} title="Close (Esc)">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="tsm-body" ref={contentRef}>
                        <div className="tsm-verse-card" style={{ '--sc': scholar.color } as React.CSSProperties}>
                            <div className="tsm-verse-card-header">
                                <span className="tsm-verse-key-badge" style={{ color: scholar.color, borderColor: scholar.color + '55', background: scholar.color + '18' }}>
                                    {verse.verse_key}
                                </span>
                                {chapter.revelation_place && (
                                    <span className="tsm-rev-badge">{chapter.revelation_place}</span>
                                )}
                            </div>
                            <p className="tsm-arabic-text" dir="rtl" lang="ar">{arabicText}</p>
                            <div className="tsm-translation-wrap">
                                <p className="tsm-translation-text">{translation}</p>
                            </div>
                        </div>

                        <div className="tsm-scholar-section">
                            <p className="tsm-section-label">
                                <BookOpen size={12} />
                                <span>Choose Commentary</span>
                            </p>
                            <div className="tsm-scholar-grid">
                                {SCHOLARS.map(s => {
                                    const Icon = s.icon;
                                    const isActive = activeScholar === s.key;
                                    const isLoaded = !!tafsirCache[s.key] && !loading[s.key];
                                    return (
                                        <button
                                            key={s.key}
                                            className={'tsm-scholar-card' + (isActive ? ' tsm-scholar-card--active' : '')}
                                            style={isActive ? { '--sc': s.color, borderColor: s.color + '66', '--sc-bg': s.color + '14' } as React.CSSProperties : {}}
                                            onClick={() => setActiveScholar(s.key)}
                                        >
                                            <div className="tsm-sc-top">
                                                <div className="tsm-sc-icon" style={isActive ? { background: s.color + '20', color: s.color, borderColor: s.color + '44' } : {}}>
                                                    <Icon size={14} />
                                                </div>
                                                <div className="tsm-sc-status">
                                                    {loading[s.key] && <Loader2 size={10} className="tsm-sc-spin" />}
                                                    {isLoaded && <span className="tsm-sc-loaded" />}
                                                </div>
                                            </div>
                                            <p className="tsm-sc-name" style={isActive ? { color: s.color } : {}}>{s.name}</p>
                                            <p className="tsm-sc-label">{s.label}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="tsm-scholar-info-bar" style={{ borderLeftColor: scholar.color, background: scholar.color + '0a' }}>
                                <p className="tsm-scholar-info-title" style={{ color: scholar.color }}>{scholar.fullName}</p>
                                <p className="tsm-scholar-info-desc">{scholar.desc}</p>
                            </div>
                        </div>

                        <div className="tsm-content-section">
                            <p className="tsm-section-label">
                                <ScrollText size={12} />
                                <span>Commentary</span>
                                {wordCount > 0 && <span className="tsm-word-count">~{wordCount} words</span>}
                            </p>

                            {isScholarLoading && (
                                <div className="tsm-loading-state">
                                    <div className="tsm-loading-spinner" style={{ borderTopColor: scholar.color }} />
                                    <p className="tsm-loading-text">Loading {scholar.name}…</p>
                                    <div className="tsm-skeleton-wrap">
                                        {[100, 88, 95, 72, 84, 60].map((w, i) => (
                                            <div key={i} className="tsm-skeleton" style={{ width: w + '%', animationDelay: (i * 0.12) + 's' }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isScholarLoading && hasError && (
                                <div className="tsm-error-state">
                                    <div className="tsm-error-icon">!</div>
                                    <p className="tsm-error-title">Failed to load commentary</p>
                                    <p className="tsm-error-desc">Please check your connection and try again.</p>
                                    <button className="tsm-retry-btn" onClick={handleRetry} style={{ borderColor: scholar.color, color: scholar.color, background: scholar.color + '12' }}>
                                        <RefreshCw size={12} /> Retry
                                    </button>
                                </div>
                            )}

                            {!isScholarLoading && !hasError && cachedContent && !tafsirText && (
                                <div className="tsm-empty-state">
                                    <BookOpen size={34} className="tsm-empty-icon" />
                                    <p className="tsm-empty-title">Not Available</p>
                                    <p className="tsm-empty-desc">No commentary available for this verse. Try another scholar.</p>
                                </div>
                            )}

                            {!isScholarLoading && !hasError && !cachedContent && (
                                <div className="tsm-skeleton-wrap">
                                    {[100, 88, 95, 72, 84, 60].map((w, i) => (
                                        <div key={i} className="tsm-skeleton" style={{ width: w + '%', animationDelay: (i * 0.12) + 's' }} />
                                    ))}
                                </div>
                            )}

                            {!isScholarLoading && !hasError && formattedTafsir && (
                                <div className="tsm-prose" dangerouslySetInnerHTML={{ __html: formattedTafsir }} />
                            )}
                        </div>
                    </div>

                    <div className="tsm-footer">
                        <div className="tsm-footer-nav">
                            <button className="tsm-footer-nav-btn" onClick={() => hasPrev && onNavigate(allVerses[currentIndex - 1].verse_number)} disabled={!hasPrev}>
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <span className="tsm-footer-verse">{verse.verse_key}</span>
                            <button className="tsm-footer-nav-btn" onClick={() => hasNext && onNavigate(allVerses[currentIndex + 1].verse_number)} disabled={!hasNext}>
                                Next <ChevronRight size={14} />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
