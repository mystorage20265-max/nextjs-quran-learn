'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    X,
    Bookmark,
    Copy,
    Share2,
    Volume2,
    ChevronDown,
    BookOpen
} from 'lucide-react';
import {
    getChapter,
    getAllVerses,
    getVersesWithWords,
    Chapter,
    VerseWithTranslation,
    POPULAR_RECITERS,
    TRANSLATIONS
} from '../lib/api';
import { saveLastRead, markVerseRead } from '../lib/progress';
import { parseTranslationWithFootnotes } from '../lib/translationUtils';
import '../styles/reader.css';

// Clean Arabic text - only remove verse markers, keep all diacritics (harakat/tashkeel)
const cleanArabicText = (text: string): string => {
    return text
        .replace(/۝/g, '')
        .replace(/۩/g, '')
        .replace(/\u06DD/g, '')
        .replace(/[\u0610-\u061A]/g, '')
        .replace(/[\u06D6-\u06ED]/g, '')
        .replace(/[\u06EE\u06EF]/g, '')
        .replace(/[\uFBB2-\uFBC2]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

const removeBismillah = (text: string): string => {
    const stripDiacritics = (s: string) => s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
    const stripped = stripDiacritics(text);
    const bismillahPattern = /^بسم\s+[اٱ]لله\s+[اٱ]لرحم[اٰ]ن\s+[اٱ]لرحيم\s*/u;
    const match = stripped.match(bismillahPattern);
    if (match) {
        const matchedLen = match[0].length;
        let count = 0;
        let cutIndex = 0;
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            const isDiacritic = (code >= 0x0610 && code <= 0x061A) ||
                (code >= 0x064B && code <= 0x065F) ||
                code === 0x0670 ||
                (code >= 0x06D6 && code <= 0x06ED);
            if (!isDiacritic) count++;
            if (count >= matchedLen) { cutIndex = i + 1; break; }
        }
        return text.slice(cutIndex).trim();
    }
    return text;
};

const toArabicNumeral = (num: number): string => {
    const d = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(c => d[parseInt(c)]).join('');
};

interface SurahPageProps {
    params: Promise<{ surahNumber: string }>;
}

type ReadingMode = 'translation' | 'reading' | 'word-by-word';

export default function SurahReadingPage({ params }: SurahPageProps) {
    const { surahNumber: surahNumberStr } = use(params);
    const surahNumber = parseInt(surahNumberStr);
    const searchParams = useSearchParams();
    const initialMode = searchParams?.get('mode') ?? 'translation';

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [verses, setVerses] = useState<VerseWithTranslation[]>([]);
    const [versesWithWords, setVersesWithWords] = useState<VerseWithTranslation[]>([]);
    const [loading, setLoading] = useState(true);
    const [wordDataLoading, setWordDataLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [readingMode, setReadingMode] = useState<ReadingMode>(
        (initialMode === 'reading' || initialMode === 'word-by-word')
            ? initialMode as ReadingMode
            : 'translation'
    );
    const [selectedTranslation, setSelectedTranslation] = useState('en.sahih');
    const [selectedReciter, setSelectedReciter] = useState(7);
    const [fontSize, setFontSize] = useState(32);
    const [showSettings, setShowSettings] = useState(false);
    const [showTranslation, setShowTranslation] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerse, setCurrentVerse] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playbackIdRef = useRef(0);
    const isMountedRef = useRef(true);

    const [showVerseNav, setShowVerseNav] = useState(false);
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [expandedTafsir, setExpandedTafsir] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

    // Load chapter data
    useEffect(() => {
        let isCancelled = false;
        async function loadData() {
            if (surahNumber < 1 || surahNumber > 114) { setError('Invalid surah number'); setLoading(false); return; }
            try {
                setLoading(true);
                const [chapterData, versesData] = await Promise.all([
                    getChapter(surahNumber),
                    getAllVerses(surahNumber, selectedTranslation)
                ]);
                if (isCancelled) return;
                setChapter(chapterData);
                setVerses(versesData);
            } catch {
                if (!isCancelled) setError('Failed to load Surah');
            } finally {
                if (!isCancelled) setLoading(false);
            }
        }
        loadData();
        return () => { isCancelled = true; };
    }, [surahNumber, selectedTranslation]);

    // Load word-by-word data
    useEffect(() => {
        let isCancelled = false;
        async function loadWordData() {
            if (readingMode !== 'word-by-word' || !chapter) return;
            try {
                setWordDataLoading(true);
                const translationMap: Record<string, string> = {
                    'en.sahih': '131', 'en.pickthall': '22', 'en.yusufali': '21',
                    'en.asad': '206', 'ur.jalandhry': '97', 'ur.ahmedali': '96',
                    'fr.hamidullah': '31', 'es.asad': '83'
                };
                const resourceId = translationMap[selectedTranslation] || '131';
                const wordData = await getVersesWithWords(surahNumber, resourceId);
                if (!isCancelled) setVersesWithWords(wordData);
            } catch {
                if (!isCancelled) setVersesWithWords(verses);
            } finally {
                if (!isCancelled) setWordDataLoading(false);
            }
        }
        loadWordData();
        return () => { isCancelled = true; };
    }, [readingMode, surahNumber, chapter, verses, selectedTranslation]);

    // Load bookmarks
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('quran-bookmarks');
            if (saved) setBookmarks(JSON.parse(saved));
        }
    }, []);

    // Cleanup
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        };
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (currentVerse && isPlaying && autoScroll) {
            const el = document.getElementById(`verse-${currentVerse}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentVerse, isPlaying, autoScroll]);

    // Save progress
    useEffect(() => {
        if (chapter && currentVerse) {
            saveLastRead(surahNumber, chapter.name_simple, currentVerse);
            markVerseRead(`${surahNumber}:${currentVerse}`);
        }
    }, [currentVerse, chapter, surahNumber]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            switch (e.code) {
                case 'Space': e.preventDefault(); if (isPlaying) stopAudio(); else playVerse(currentVerse || 1); break;
                case 'ArrowRight': if (currentVerse && currentVerse < verses.length) playVerse(currentVerse + 1); break;
                case 'ArrowLeft': if (currentVerse && currentVerse > 1) playVerse(currentVerse - 1); break;
                case 'Escape': stopAudio(); setShowSettings(false); setShowVerseNav(false); break;
                case 'KeyS': if (e.metaKey || e.ctrlKey) { e.preventDefault(); setShowSettings(true); } break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, currentVerse, verses.length]);

    const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    };

    const toggleBookmark = useCallback((verseKey: string) => {
        const isBookmarked = bookmarks.includes(verseKey);
        const newBookmarks = isBookmarked ? bookmarks.filter(b => b !== verseKey) : [...bookmarks, verseKey];
        setBookmarks(newBookmarks);
        localStorage.setItem('quran-bookmarks', JSON.stringify(newBookmarks));
        showToast(isBookmarked ? 'Bookmark removed' : 'Verse bookmarked!');
    }, [bookmarks]);

    const copyVerse = useCallback((verse: VerseWithTranslation) => {
        const text = `${verse.text_uthmani}\n\n${verse.translations?.[0]?.text || ''}\n\n— Quran ${verse.verse_key}`;
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    }, []);

    const shareVerse = useCallback(async (verse: VerseWithTranslation) => {
        const text = `${verse.text_uthmani}\n\n${verse.translations?.[0]?.text || ''}\n\n— Quran ${verse.verse_key}`;
        const url = `${window.location.origin}/read-quran/${surahNumber}#verse-${verse.verse_number}`;
        if (navigator.share) {
            try { await navigator.share({ title: `Quran ${verse.verse_key}`, text, url }); } catch { }
        } else {
            navigator.clipboard.writeText(text + '\n\n' + url);
            showToast('Link copied!', 'warning');
        }
    }, [surahNumber]);

    const playVerse = useCallback((verseNumber: number) => {
        const myPlaybackId = ++playbackIdRef.current;
        if (!isMountedRef.current) return;
        const verse = verses.find(v => v.verse_number === verseNumber);
        if (!verse) return;
        const reciter = POPULAR_RECITERS.find(r => r.id === selectedReciter);
        const folder = reciter?.folder || 'Alafasy_128kbps';
        const surahPadded = surahNumber.toString().padStart(3, '0');
        const versePadded = verseNumber.toString().padStart(3, '0');
        const audioUrl = `https://everyayah.com/data/${folder}/${surahPadded}${versePadded}.mp3`;
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onplay = () => { if (isMountedRef.current && myPlaybackId === playbackIdRef.current) { setIsPlaying(true); setCurrentVerse(verseNumber); } };
        audio.onended = () => {
            if (!isMountedRef.current || myPlaybackId !== playbackIdRef.current) return;
            if (verseNumber < verses.length) playVerse(verseNumber + 1);
            else { setIsPlaying(false); setCurrentVerse(null); }
        };
        audio.onerror = () => { if (isMountedRef.current && myPlaybackId === playbackIdRef.current) { setIsPlaying(false); showToast('Audio failed to load', 'warning'); } };
        audio.play().catch(() => showToast('Could not play audio', 'warning'));
    }, [surahNumber, verses, selectedReciter]);

    const stopAudio = useCallback(() => {
        playbackIdRef.current++;
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setIsPlaying(false);
        setCurrentVerse(null);
    }, []);

    const playPrev = useCallback(() => { if (currentVerse && currentVerse > 1) playVerse(currentVerse - 1); }, [currentVerse, playVerse]);
    const playNext = useCallback(() => { if (currentVerse && currentVerse < verses.length) playVerse(currentVerse + 1); }, [currentVerse, verses.length, playVerse]);

    const jumpToVerse = useCallback((verseNumber: number) => {
        setShowVerseNav(false);
        const el = document.getElementById(`verse-${verseNumber}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="nq-shell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 16 }}>
                    <div className="reader-spinner" />
                    <p style={{ color: '#94a3b8', fontFamily: 'Lexend, sans-serif' }}>Loading Surah…</p>
                </div>
            </div>
        );
    }

    if (error || !chapter) {
        return (
            <div className="nq-shell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 16 }}>
                    <p style={{ color: '#f85149' }}>{error || 'Surah not found'}</p>
                    <Link href="/" style={{ color: '#11d442' }}>← Go Home</Link>
                </div>
            </div>
        );
    }

    const displayVerses = readingMode === 'word-by-word' && versesWithWords.length > 0 ? versesWithWords : verses;
    const currentReciter = POPULAR_RECITERS.find(r => r.id === selectedReciter);

    return (
        <>
            <style>{`
                .nq-shell{position:fixed;inset:0;z-index:9999;display:flex;overflow:hidden;background:#f6f8f6;font-family:'Lexend','Figtree',sans-serif}
                .dark .nq-shell{background:#102215}
                .nq-sidebar{width:80px;flex-shrink:0;background:white;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;justify-content:space-between;padding:24px 0;transition:width 0.2s}
                @media(min-width:1024px){.nq-sidebar{width:256px}}
                .dark .nq-sidebar{background:#0f172a;border-color:#1e293b}
                .nq-main{flex:1;display:flex;flex-direction:column;min-width:0;position:relative}
                .nq-header{height:80px;background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);border-bottom:1px solid #e2e8f0;padding:0 32px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;z-index:10}
                .dark .nq-header{background:rgba(15,23,42,0.8);border-color:#1e293b}
                .nq-content{flex:1;display:flex;flex-direction:column;overflow:hidden}
                @media(min-width:1280px){.nq-content{display:grid;grid-template-columns:1fr 256px}}
                .nq-scroll{flex:1;overflow-y:auto;padding:32px 48px 140px}
                @media(max-width:1280px){.nq-scroll{padding:32px 40px 140px}}
                .nq-right{flex-shrink:0;border-left:1px solid #e2e8f0;background:white;display:none;flex-direction:column;overflow:hidden}
                @media(min-width:1280px){.nq-right{display:flex;width:256px}}
                .dark .nq-right{background:#0f172a;border-color:#1e293b}
                .nq-islamic{background-image:radial-gradient(circle at 2px 2px,rgba(17,212,66,0.05) 1px,transparent 0);background-size:24px 24px}
                /* Bismillah */
                .nq-bismillah{display:flex;flex-direction:column;align-items:center;margin-bottom:48px}
                .nq-bismillah-text{font-family:var(--rq-font-arabic);font-size:36px;color:#1e293b;padding:32px 0;opacity:0.9}
                .dark .nq-bismillah-text{color:#e2e8f0}
                .nq-bismillah-hr{width:128px;height:4px;background:linear-gradient(90deg,transparent,rgba(17,212,66,0.3),transparent);border:none;margin:0}
                /* Verse cards */
                .nq-ayah-card{position:relative;padding:24px;border-radius:16px;border:1px solid transparent;transition:all 0.3s;margin-bottom:48px}
                .nq-ayah-card:hover{background:rgba(17,212,66,0.05);border-color:rgba(17,212,66,0.1)}
                .nq-ayah-card.nq-playing{background:rgba(17,212,66,0.05);border-color:rgba(17,212,66,0.25);box-shadow:0 2px 12px rgba(17,212,66,0.08)}
                .nq-active-accent{position:absolute;left:-3px;top:32px;width:6px;height:48px;background:#11d442;border-radius:3px}
                .nq-arabic-row{display:flex;flex-direction:row-reverse;align-items:flex-start;gap:24px;margin-bottom:0}
                .nq-arabic-text{font-family:var(--rq-font-arabic);font-size:var(--nq-fs,36px);line-height:2;text-align:right;flex:1;color:#1e293b;direction:rtl}
                .dark .nq-arabic-text{color:#e2e8f0}
                .nq-verse-badge{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;border:1px solid rgba(17,212,66,0.4);font-size:14px;font-weight:700;color:#11d442;margin-right:8px;font-family:'Lexend',sans-serif;cursor:pointer;vertical-align:middle;transition:background 0.15s}
                .nq-verse-badge:hover{background:rgba(17,212,66,0.1)}
                .nq-playing .nq-verse-badge{border-color:#11d442;background:rgba(17,212,66,0.12)}
                .nq-translation-row{margin-top:24px;padding-left:16px;border-left:2px solid #e2e8f0;transition:border-color 0.2s}
                .nq-ayah-card:hover .nq-translation-row{border-color:rgba(17,212,66,0.3)}
                .nq-ayah-card.nq-playing .nq-translation-row{border-color:rgba(17,212,66,0.5)}
                .nq-translation-text{color:#475569;font-size:18px;line-height:1.8}
                .dark .nq-translation-text{color:#94a3b8}
                .nq-ayah-card.nq-playing .nq-translation-text{color:#1e293b;font-weight:500}
                .dark .nq-ayah-card.nq-playing .nq-translation-text{color:#e2e8f0}
                /* Hover actions */
                .nq-actions{position:absolute;top:16px;right:16px;display:flex;gap:8px;opacity:0;transition:opacity 0.2s}
                .nq-ayah-card:hover .nq-actions{opacity:1}
                .nq-action-btn{padding:8px;background:white;border:none;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.08);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color 0.15s}
                .dark .nq-action-btn{background:#1e293b}
                .nq-action-btn:hover{color:#11d442}
                .nq-bookmarked{color:#11d442!important}
                .nq-active-btn{color:#11d442!important}
                /* Sidebar nav */
                .nq-nav-link{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;text-decoration:none;font-weight:500;font-size:14px;color:#64748b;transition:background 0.15s;white-space:nowrap}
                .nq-nav-link:hover{background:#f8fafc}
                .dark .nq-nav-link:hover{background:#1e293b}
                .nq-nav-link.active{background:rgba(17,212,66,0.1);color:#11d442;font-weight:600}
                @media(max-width:1023px){.nq-nav-label{display:none}}
                /* Header buttons */
                .nq-hdr-btn{padding:8px;border:none;border-radius:8px;background:#f1f5f9;color:#64748b;cursor:pointer;display:flex;align-items:center;transition:all 0.15s}
                .dark .nq-hdr-btn{background:#1e293b;color:#94a3b8}
                .nq-hdr-btn:hover{color:#11d442}
                .nq-hdr-toggle-group{display:flex;align-items:center;background:#f1f5f9;border-radius:8px;padding:4px;gap:2px}
                .dark .nq-hdr-toggle-group{background:#1e293b}
                .nq-hdr-toggle{padding:4px 12px;border-radius:6px;border:none;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;background:transparent;color:#64748b}
                .nq-hdr-toggle.active{background:white;color:#0f172a;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
                .dark .nq-hdr-toggle.active{background:#0f172a;color:white}
                .nq-bkmk-btn{width:40px;height:40px;background:#11d442;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;cursor:pointer;box-shadow:0 4px 14px rgba(17,212,66,0.3)}
                /* Audio bar */
                .nq-audio-bar{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);width:min(800px,90%);background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border:1px solid #e2e8f0;border-radius:24px;box-shadow:0 8px 32px rgba(0,0,0,0.12);z-index:20;padding:16px}
                .dark .nq-audio-bar{background:rgba(15,23,42,0.95);border-color:#1e293b}
                .nq-audio-progress-row{margin-bottom:8px}
                .nq-audio-progress-track{width:100%;height:4px;background:#f1f5f9;border-radius:999px;overflow:hidden;cursor:pointer;position:relative}
                .dark .nq-audio-progress-track{background:#1e293b}
                .nq-audio-progress-fill{height:100%;background:#11d442;border-radius:999px;transition:width 0.3s}
                .nq-audio-bar-inner{display:flex;align-items:center;justify-content:space-between;gap:24px}
                .nq-reciter-info{display:flex;align-items:center;gap:12px;flex:1;min-width:0}
                .nq-reciter-avatar{position:relative;width:40px;height:40px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0}
                .dark .nq-reciter-avatar{background:#1e293b}
                .nq-reciter-badge{position:absolute;bottom:-4px;right:-4px;background:#11d442;color:white;font-size:8px;font-weight:700;padding:1px 4px;border-radius:999px;border:2px solid white;font-family:'Lexend',sans-serif}
                .nq-reciter-name{margin:0;font-size:12px;font-weight:700;color:#0f172a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                .dark .nq-reciter-name{color:#e2e8f0}
                .nq-reciter-sub{margin:0;font-size:10px;color:#94a3b8}
                .nq-audio-controls{display:flex;align-items:center;gap:24px}
                .nq-ctrl-btn{background:none;border:none;color:#64748b;cursor:pointer;display:flex;align-items:center;padding:0;transition:color 0.15s}
                .nq-ctrl-btn:hover{color:#11d442}
                .nq-ctrl-btn.lg{color:#334155}
                .dark .nq-ctrl-btn.lg{color:#e2e8f0}
                .nq-play-btn{width:48px;height:48px;background:#11d442;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;cursor:pointer;box-shadow:0 4px 20px rgba(17,212,66,0.35);transition:transform 0.15s}
                .nq-play-btn:hover{transform:scale(1.05)}
                .nq-audio-right{display:flex;align-items:center;gap:12px;flex:1;justify-content:flex-end;min-width:0}
                .nq-volume-track{width:80px;height:4px;background:#f1f5f9;border-radius:999px;overflow:hidden}
                .dark .nq-volume-track{background:#1e293b}
                .nq-volume-fill{height:100%;background:#94a3b8;border-radius:999px}
                /* Right panel */
                .nq-panel-section{padding:24px;border-bottom:1px solid #f1f5f9}
                .dark .nq-panel-section{border-color:#1e293b}
                .nq-panel-title{font-weight:700;font-size:14px;color:#1e293b;display:flex;align-items:center;gap:8px;margin:0 0 16px}
                .dark .nq-panel-title{color:#e2e8f0}
                .nq-tajweed-card{padding:16px;border-radius:12px;margin-bottom:12px}
                .nq-tajweed-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
                .nq-tajweed-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em}
                .nq-tajweed-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
                .nq-tajweed-desc{font-size:13px;color:#64748b;line-height:1.5}
                .dark .nq-tajweed-desc{color:#94a3b8}
                /* scrollbar */
                .nq-scroll::-webkit-scrollbar{width:5px}
                .nq-scroll::-webkit-scrollbar-track{background:transparent}
                .nq-scroll::-webkit-scrollbar-thumb{background:rgba(17,212,66,0.2);border-radius:3px}
                .nq-right::-webkit-scrollbar{width:4px}
                .nq-right::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.08);border-radius:2px}
                /* Mode tabs */
                .nq-mode-tabs{display:flex;gap:4px;padding:0 32px;background:rgba(255,255,255,0.8);border-bottom:1px solid #e2e8f0;height:48px;align-items:center;flex-shrink:0}
                .dark .nq-mode-tabs{background:rgba(15,23,42,0.8);border-color:#1e293b}
                .nq-mode-tab{padding:6px 16px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.15s;background:transparent;color:#64748b;font-family:'Lexend',sans-serif}
                .nq-mode-tab.active{background:#11d442;color:white}
            `}</style>

            <div className="nq-shell">
                {/* SIDEBAR */}
                <aside className="nq-sidebar">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 12px' }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
                            <div style={{ background: 'rgba(17,212,66,0.15)', borderRadius: 10, padding: 8, flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ color: '#11d442', fontSize: 26 }}>auto_stories</span>
                            </div>
                            <div className="nq-nav-label">
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a', lineHeight: 1 }}>Nur Quran</p>
                                <p style={{ margin: 0, color: '#11d442', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Learning Hub</p>
                            </div>
                        </div>
                        {/* Nav */}
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Link href="/" className="nq-nav-link">
                                <span className="material-symbols-outlined" style={{ fontSize: 22, flexShrink: 0 }}>home</span>
                                <span className="nq-nav-label">Home</span>
                            </Link>
                            <Link href="/read-quran/1" className="nq-nav-link active">
                                <span className="material-symbols-outlined" style={{ fontSize: 22, flexShrink: 0 }}>menu_book</span>
                                <span className="nq-nav-label">Quran</span>
                            </Link>
                            <Link href="/memorize-quran" className="nq-nav-link">
                                <span className="material-symbols-outlined" style={{ fontSize: 22, flexShrink: 0 }}>ads_click</span>
                                <span className="nq-nav-label">Memorization</span>
                            </Link>
                            <div style={{ margin: '8px 0', borderTop: '1px solid #f1f5f9' }} />
                            <Link href="/prayer-times" className="nq-nav-link">
                                <span className="material-symbols-outlined" style={{ fontSize: 22, flexShrink: 0 }}>calculate</span>
                                <span className="nq-nav-label">Prayer Times</span>
                            </Link>
                            <button onClick={() => setShowSettings(true)} className="nq-nav-link" style={{ border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 22, flexShrink: 0 }}>settings</span>
                                <span className="nq-nav-label">Settings</span>
                            </button>
                        </nav>
                    </div>
                    {/* Profile */}
                    <div style={{ padding: '0 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#11d442,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0, border: '2px solid rgba(17,212,66,0.3)' }}>A</div>
                            <div className="nq-nav-label" style={{ minWidth: 0 }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ahmed Khalid</p>
                                <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>Premium Member</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN */}
                <div className="nq-main">
                    {/* Header */}
                    <header className="nq-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <Link href="/" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#11d442'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}>
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {chapter.name_simple}
                                    <span style={{ fontSize: 14, fontWeight: 400, color: '#94a3b8' }}>
                                        {chapter.translated_name.name} • {chapter.verses_count} Verses
                                    </span>
                                </h2>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* Verse nav */}
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setShowVerseNav(!showVerseNav)}
                                    className="nq-hdr-btn" style={{ gap: 6, display: 'flex', alignItems: 'center', padding: '6px 12px' }}>
                                    <span style={{ fontSize: 13, fontWeight: 500 }}>Ayah {currentVerse || '—'}</span>
                                    <ChevronDown size={14} />
                                </button>
                                {showVerseNav && (
                                    <div className="verse-nav-panel" style={{ top: 44 }}>
                                        <div className="verse-nav-grid">
                                            {verses.map(v => (
                                                <button key={v.verse_number}
                                                    className={`verse-nav-item ${currentVerse === v.verse_number ? 'current' : ''}`}
                                                    onClick={() => jumpToVerse(v.verse_number)}>
                                                    {v.verse_number}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Translation / Transliteration toggle */}
                            <div className="nq-hdr-toggle-group">
                                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#64748b', marginRight: 2 }}>format_size</span>
                                <div style={{ width: 1, height: 16, background: '#cbd5e1', margin: '0 4px' }} />
                                <button className={`nq-hdr-toggle ${showTranslation ? 'active' : ''}`} onClick={() => setShowTranslation(true)}>Translation</button>
                                <button className={`nq-hdr-toggle ${!showTranslation ? 'active' : ''}`} onClick={() => setShowTranslation(false)}>Arabic only</button>
                            </div>
                            {/* Bookmark current verse */}
                            <button
                                className="nq-bkmk-btn"
                                onClick={() => currentVerse && toggleBookmark(`${surahNumber}:${currentVerse}`)}
                                title="Bookmark current verse"
                            >
                                <Bookmark size={18} />
                            </button>
                        </div>
                    </header>

                    {/* Mode tabs */}
                    <div className="nq-mode-tabs">
                        {(['translation', 'word-by-word', 'reading'] as ReadingMode[]).map(m => (
                            <button key={m} className={`nq-mode-tab ${readingMode === m ? 'active' : ''}`} onClick={() => setReadingMode(m)}>
                                {m === 'word-by-word' ? 'Word by Word' : m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Content area */}
                    <div className="nq-content">
                        {/* Scrollable verse area */}
                        <div className="nq-scroll nq-islamic" style={{ '--nq-fs': `${fontSize}px` } as React.CSSProperties}>
                            {/* Bismillah Header Card */}
                            {chapter.bismillah_pre && (
                                <div style={{
                                    maxWidth: 896,
                                    margin: '0 auto 48px',
                                    borderRadius: 24,
                                    background: 'linear-gradient(180deg, #fdf8f0 0%, #fdf4e8 50%, #faf0e0 100%)',
                                    border: '1px solid rgba(234,179,8,0.15)',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}>
                                    {/* Orange top decoration */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 120,
                                        height: 5,
                                        background: 'linear-gradient(90deg, #f97316, #fb923c, #f97316)',
                                        borderRadius: '0 0 8px 8px',
                                    }} />
                                    {/* Tiny icon above */}
                                    <div style={{ textAlign: 'center', paddingTop: 28, marginBottom: -6 }}>
                                        <span style={{ fontSize: 18, color: '#f97316', opacity: 0.7, fontFamily: 'var(--rq-font-arabic)' }}>﷽</span>
                                    </div>
                                    {/* Arabic text */}
                                    <div style={{
                                        fontFamily: 'var(--rq-font-arabic)',
                                        fontSize: 'clamp(32px, 5vw, 52px)',
                                        textAlign: 'center',
                                        direction: 'rtl',
                                        color: '#1c1c1c',
                                        padding: '16px 48px 20px',
                                        lineHeight: 1.8,
                                        fontFeatureSettings: '"liga" 1, "calt" 1',
                                        textRendering: 'optimizeLegibility',
                                    }}>
                                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                    </div>
                                    {/* Translation */}
                                    <div style={{
                                        textAlign: 'center',
                                        color: '#6b7280',
                                        fontSize: 15,
                                        fontStyle: 'italic',
                                        paddingBottom: 28,
                                        fontFamily: "'Lexend', sans-serif",
                                        fontWeight: 400,
                                    }}>
                                        In the Name of Allah—the Most Compassionate, Most Merciful.
                                    </div>
                                </div>
                            )}


                            {/* Verses */}
                            <div style={{ maxWidth: 896, margin: '0 auto' }}>
                                {readingMode === 'reading' ? (
                                    <div style={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 20,
                                        padding: '40px 48px',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                    }}>
                                        <p style={{
                                            fontFamily: 'var(--rq-font-arabic)',
                                            fontSize: `${fontSize}px`,
                                            lineHeight: 2.4,
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            color: '#1e293b',
                                            margin: 0,
                                            wordSpacing: '0.05em',
                                            fontFeatureSettings: '"liga" 1, "calt" 1',
                                            textRendering: 'optimizeLegibility',
                                        }}>
                                            {verses.map((verse) => (
                                                <span key={verse.id}>
                                                    {verse.verse_number === 1 && chapter.bismillah_pre
                                                        ? cleanArabicText(removeBismillah(verse.text_uthmani))
                                                        : cleanArabicText(verse.text_uthmani)}
                                                    {' '}
                                                    <span
                                                        onClick={() => playVerse(verse.verse_number)}
                                                        title={`Play verse ${verse.verse_number}`}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: '50%',
                                                            border: '1px solid rgba(17,212,66,0.4)',
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            color: '#11d442',
                                                            fontFamily: "'Lexend', sans-serif",
                                                            cursor: 'pointer',
                                                            verticalAlign: 'middle',
                                                            marginRight: 6,
                                                            background: currentVerse === verse.verse_number ? 'rgba(17,212,66,0.12)' : 'transparent',
                                                            transition: 'background 0.15s',
                                                        }}
                                                    >
                                                        {toArabicNumeral(verse.verse_number)}
                                                    </span>
                                                    {' '}
                                                </span>
                                            ))}
                                        </p>
                                    </div>

                                ) : readingMode === 'word-by-word' ? (
                                    <div className="reader-verses">
                                        {wordDataLoading ? (
                                            <div className="reader-loading"><div className="reader-spinner" /><p className="reader-loading-text">Loading word data…</p></div>
                                        ) : displayVerses.map((verse) => (
                                            <div key={verse.id} id={`verse-${verse.verse_number}`} className={`reader-verse ${currentVerse === verse.verse_number ? 'playing' : ''}`}>
                                                <div className="reader-verse-header">
                                                    <span className="reader-verse-number">{verse.verse_number}</span>
                                                    <button className="verse-mini-play" onClick={() => playVerse(verse.verse_number)}><Volume2 size={14} /></button>
                                                </div>
                                                <div className="reader-verse-words">
                                                    {verse.words && verse.words.length > 0 ? (
                                                        verse.words.filter((w: any) => w.char_type_name !== 'end').map((word: any, idx: number) => (
                                                            <div key={word.id || idx} className="word-item">
                                                                <span className="word-arabic">{cleanArabicText(word.text_uthmani)}</span>
                                                                {word.transliteration?.text && <span className="word-transliteration">{word.transliteration.text}</span>}
                                                                {word.translation?.text && <span className="word-translation">{word.translation.text}</span>}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="reader-verse-arabic">{verse.verse_number === 1 && chapter.bismillah_pre ? cleanArabicText(removeBismillah(verse.text_uthmani)) : cleanArabicText(verse.text_uthmani)}</div>
                                                    )}
                                                </div>
                                                {showTranslation && <div className="reader-verse-translation">{parseTranslationWithFootnotes(verse.translations?.[0]?.text || '')}</div>}
                                                <div className="reader-verse-actions">
                                                    <button className="verse-action-btn" onClick={() => copyVerse(verse)}><Copy size={14} /><span>Copy</span></button>
                                                    <button className={`verse-action-btn ${bookmarks.includes(verse.verse_key) ? 'bookmarked' : ''}`} onClick={() => toggleBookmark(verse.verse_key)}><Bookmark size={14} /><span>{bookmarks.includes(verse.verse_key) ? 'Saved' : 'Save'}</span></button>
                                                    <button className="verse-action-btn" onClick={() => shareVerse(verse)}><Share2 size={14} /><span>Share</span></button>
                                                    <button className={`verse-tafsir-toggle ${expandedTafsir === verse.verse_number ? 'active' : ''}`} onClick={() => setExpandedTafsir(expandedTafsir === verse.verse_number ? null : verse.verse_number)}><BookOpen size={14} /><span>Tafsir</span></button>
                                                </div>
                                                {expandedTafsir === verse.verse_number && <div className="verse-tafsir-panel"><div className="verse-tafsir-title">Brief Tafsir</div><div className="verse-tafsir-content">Tafsir for verse {verse.verse_number}. Integrate a Tafsir API for detailed explanations.</div></div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Translation mode — new card design
                                    <div>
                                        {verses.map((verse) => (
                                            <div key={verse.id} id={`verse-${verse.verse_number}`} className={`nq-ayah-card ${currentVerse === verse.verse_number ? 'nq-playing' : ''}`}>
                                                {currentVerse === verse.verse_number && <div className="nq-active-accent" />}
                                                <div className="nq-arabic-row">
                                                    <span className="nq-arabic-text">
                                                        {verse.verse_number === 1 && chapter.bismillah_pre ? cleanArabicText(removeBismillah(verse.text_uthmani)) : cleanArabicText(verse.text_uthmani)}
                                                        {' '}
                                                        <span className="nq-verse-badge" onClick={() => playVerse(verse.verse_number)} title={`Play verse ${verse.verse_number}`}>
                                                            {toArabicNumeral(verse.verse_number)}
                                                        </span>
                                                    </span>
                                                </div>
                                                {showTranslation && (
                                                    <div className="nq-translation-row">
                                                        <p className="nq-translation-text">{parseTranslationWithFootnotes(verse.translations?.[0]?.text || 'Translation not available')}</p>
                                                    </div>
                                                )}
                                                <div className="nq-actions">
                                                    <button className="nq-action-btn" onClick={() => playVerse(verse.verse_number)} title="Play"><Volume2 size={14} /></button>
                                                    <button className="nq-action-btn" onClick={() => shareVerse(verse)} title="Share"><Share2 size={14} /></button>
                                                    <button className="nq-action-btn" onClick={() => copyVerse(verse)} title="Copy"><Copy size={14} /></button>
                                                    <button className={`nq-action-btn ${bookmarks.includes(verse.verse_key) ? 'nq-bookmarked' : ''}`} onClick={() => toggleBookmark(verse.verse_key)} title="Bookmark"><Bookmark size={14} /></button>
                                                </div>
                                                {expandedTafsir === verse.verse_number && (
                                                    <div className="verse-tafsir-panel"><div className="verse-tafsir-title">Brief Tafsir</div><div className="verse-tafsir-content">Tafsir for verse {verse.verse_number}. Integrate a Tafsir API.</div></div>
                                                )}
                                            </div>
                                        ))}
                                        {/* Surah navigation */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                                            {surahNumber > 1 ? <Link href={`/read-quran/${surahNumber - 1}`} className="reader-nav-btn"><ChevronLeft size={18} /><span>Previous Surah</span></Link> : <div />}
                                            {surahNumber < 114 && <Link href={`/read-quran/${surahNumber + 1}`} className="reader-nav-btn primary"><span>Next Surah</span><ChevronRight size={18} /></Link>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT PANEL — Tajweed + Notes */}
                        <aside className="nq-right nq-scroll">
                            <div className="nq-panel-section">
                                <h3 className="nq-panel-title">
                                    <span className="material-symbols-outlined" style={{ color: '#11d442', fontSize: 20 }}>auto_fix_high</span>
                                    Tajweed Rules
                                </h3>
                                <div className="nq-tajweed-card" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
                                    <div className="nq-tajweed-header">
                                        <span className="nq-tajweed-label" style={{ color: '#ea580c' }}>Ghunnah</span>
                                        <span className="nq-tajweed-dot" style={{ background: '#f97316' }} />
                                    </div>
                                    <p className="nq-tajweed-desc">Nasal sound produced for 2 counts on Noon or Meem Mushaddad.</p>
                                </div>
                                <div className="nq-tajweed-card" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                                    <div className="nq-tajweed-header">
                                        <span className="nq-tajweed-label" style={{ color: '#2563eb' }}>Qalqalah</span>
                                        <span className="nq-tajweed-dot" style={{ background: '#3b82f6' }} />
                                    </div>
                                    <p className="nq-tajweed-desc">Echoing sound on letters: Qaf, Ta, Ba, Jeem, Dal.</p>
                                </div>
                                <div className="nq-tajweed-card" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                                    <div className="nq-tajweed-header">
                                        <span className="nq-tajweed-label" style={{ color: '#9333ea' }}>Madd</span>
                                        <span className="nq-tajweed-dot" style={{ background: '#a855f7' }} />
                                    </div>
                                    <p className="nq-tajweed-desc">Lengthening of vowel sounds for specific counts.</p>
                                </div>
                            </div>
                            <div className="nq-panel-section">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <h3 className="nq-panel-title" style={{ margin: 0 }}>Personal Notes</h3>
                                    <button style={{ color: '#11d442', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>
                                </div>
                                {currentVerse ? (
                                    <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16, fontSize: 13 }}>
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '0 0 6px' }}>Ayah {currentVerse}</p>
                                        <p style={{ color: '#475569', margin: 0 }}>Tap "+ Add" to add a note for this ayah.</p>
                                    </div>
                                ) : (
                                    <p style={{ color: '#94a3b8', fontSize: 13 }}>Select a verse to add notes.</p>
                                )}
                            </div>
                        </aside>
                    </div>

                    {/* AUDIO BAR */}
                    <div className="nq-audio-bar">
                        <div className="nq-audio-progress-row">
                            <div className="nq-audio-progress-track">
                                <div className="nq-audio-progress-fill" style={{ width: currentVerse && verses.length ? `${(currentVerse / verses.length) * 100}%` : '0%' }} />
                            </div>
                        </div>
                        <div className="nq-audio-bar-inner">
                            <div className="nq-reciter-info">
                                <div className="nq-reciter-avatar">
                                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#11d442' }}>person</span>
                                    <span className="nq-reciter-badge">HQ</span>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p className="nq-reciter-name">{currentReciter?.name || 'Mishary Alafasy'}</p>
                                    <p className="nq-reciter-sub">{currentVerse ? `Reciting: Ayah ${currentVerse}` : 'Ready to play'}</p>
                                </div>
                            </div>
                            <div className="nq-audio-controls">
                                <button className="nq-ctrl-btn" title="Repeat"><span className="material-symbols-outlined" style={{ fontSize: 22 }}>repeat_one</span></button>
                                <button className="nq-ctrl-btn lg" onClick={playPrev} title="Previous (←)"><SkipBack size={26} /></button>
                                <button className="nq-play-btn" onClick={() => isPlaying ? stopAudio() : playVerse(currentVerse || 1)} title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                </button>
                                <button className="nq-ctrl-btn lg" onClick={playNext} title="Next (→)"><SkipForward size={26} /></button>
                                <button className="nq-ctrl-btn" title="Shuffle"><span className="material-symbols-outlined" style={{ fontSize: 22 }}>shuffle</span></button>
                            </div>
                            <div className="nq-audio-right">
                                <Volume2 size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                <div className="nq-volume-track"><div className="nq-volume-fill" style={{ width: '75%' }} /></div>
                                <button className="nq-ctrl-btn" onClick={() => setShowSettings(true)} title="Settings"><span className="material-symbols-outlined" style={{ fontSize: 22 }}>more_vert</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <>
                    <div className="reader-settings-overlay" onClick={() => setShowSettings(false)} />
                    <div className="reader-settings-panel">
                        <div className="settings-header">
                            <h2 className="settings-title">Settings</h2>
                            <button className="settings-close-btn" onClick={() => setShowSettings(false)}><X size={18} /></button>
                        </div>
                        <div className="settings-content">
                            <div className="settings-section">
                                <label className="settings-label">Arabic Font Size</label>
                                <div className="font-size-control">
                                    <input type="range" min="24" max="52" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="font-size-slider" />
                                    <span className="font-size-value">{fontSize}px</span>
                                </div>
                            </div>
                            <div className="settings-section">
                                <label className="settings-label">Translation</label>
                                <select className="settings-select" value={selectedTranslation} onChange={(e) => setSelectedTranslation(e.target.value)}>
                                    {TRANSLATIONS.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.language})</option>)}
                                </select>
                            </div>
                            <div className="settings-section">
                                <label className="settings-label">Reciter</label>
                                <select className="settings-select" value={selectedReciter} onChange={(e) => setSelectedReciter(parseInt(e.target.value))}>
                                    {POPULAR_RECITERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="settings-section">
                                <div className="settings-toggle">
                                    <div className="toggle-info"><div className="toggle-label">Show Translation</div><div className="toggle-desc">Display translation below Arabic</div></div>
                                    <div className={`toggle-switch ${showTranslation ? 'active' : ''}`} onClick={() => setShowTranslation(!showTranslation)} />
                                </div>
                                <div className="settings-toggle">
                                    <div className="toggle-info"><div className="toggle-label">Auto-Scroll</div><div className="toggle-desc">Scroll to verse during playback</div></div>
                                    <div className={`toggle-switch ${autoScroll ? 'active' : ''}`} onClick={() => setAutoScroll(!autoScroll)} />
                                </div>
                            </div>
                            <div className="keyboard-hints">
                                <div className="keyboard-hints-title">Keyboard Shortcuts</div>
                                <div className="keyboard-hint"><span className="keyboard-key">Space</span><span className="keyboard-action">Play / Pause</span></div>
                                <div className="keyboard-hint"><span className="keyboard-key">←</span><span className="keyboard-action">Previous verse</span></div>
                                <div className="keyboard-hint"><span className="keyboard-key">→</span><span className="keyboard-action">Next verse</span></div>
                                <div className="keyboard-hint"><span className="keyboard-key">Esc</span><span className="keyboard-action">Stop / Close</span></div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Toast */}
            {toast && <div className={`reader-toast ${toast.type}`}>{toast.message}</div>}

            {/* Close verse nav on outside click */}
            {showVerseNav && <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setShowVerseNav(false)} />}
        </>
    );
}
