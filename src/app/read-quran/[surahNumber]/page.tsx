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
import { trackSurahVisit } from '@/lib/recentSurahs';
import '../styles/reader.css';

// Clean Indo-Pak text — strips all annotation/mark characters that render as boxes.
// Three ranges are stripped:
//   U+0610–U+061A: Arabic phonetic annotation marks (sallallaahu, alayhe, etc.)
//   U+06D6–U+06FF: Indo-Pak waqf / pause / sajda annotation glyphs
//   U+FBB2–U+FBC2: Arabic Presentation Forms used in some Quran editions
// Core Arabic letters and standard tashkeel (U+0621–U+06D5) are preserved.
const cleanIndopakText = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/[\u0610-\u061A]/g, '') // Arabic Quran-specific phonetic marks
        .replace(/\u06E1/g, '\u0652')     // IndoPak sukun (ۡ U+06E1) → standard sukun (ْ U+0652), BEFORE range strip
        .replace(/[\u06D6-\u06FF]/g, '') // waqf marks, annotation glyphs, Indo-Pak marks
        .replace(/[\uFBB2-\uFBC2]/g, '') // Arabic Presentation Forms (Quran edition marks)
        .replace(/\s{2,}/g, ' ')
        .trim();
};


const removeBismillah = (text: string): string => {
    if (!text) return '';
    const isStrippable = (code: number) =>
        (code >= 0x0610 && code <= 0x061A) ||
        (code >= 0x064B && code <= 0x065F) ||
        code === 0x0670 ||
        (code >= 0x06D6 && code <= 0x06ED) ||
        code === 0x0640 ||
        (code >= 0x06EE && code <= 0x06EF) ||
        (code >= 0xFBB2 && code <= 0xFBC2);
    const strip = (s: string) => Array.from(s).filter(c => !isStrippable(c.charCodeAt(0))).join('');
    const stripped = strip(text);
    const bismillahPattern = /^بسم\s+[اٱ]لله\s+[اٱ]لرحمن\s+[اٱ]لرحيم\s*/u;
    const match = stripped.match(bismillahPattern);
    if (match) {
        const matchedLen = match[0].length;
        let count = 0;
        let cutIndex = 0;
        for (let i = 0; i < text.length; i++) {
            if (!isStrippable(text.charCodeAt(i))) count++;
            if (count >= matchedLen) { cutIndex = i + 1; break; }
        }
        return text.slice(cutIndex).trim();
    }
    return text;
};

const isBismillahWord = (word: string): boolean => {
    const stripped = word.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u06EE\u06EF\uFBB2-\uFBC2]/g, '');
    return ['بسم', 'الله', 'ٱلله', 'الرحمن', 'ٱلرحمن', 'الرحيم', 'ٱلرحيم'].includes(stripped);
};

const toArabicNumeral = (num: number): string => {
    const d = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(c => d[parseInt(c)]).join('');
};

const AyahMarker = ({ number, size = 30 }: { number: number; size?: number }) => {
    const numStr = toArabicNumeral(number);
    const fs = numStr.length > 2 ? size * 0.3 : size * 0.36;
    const c = '#333';
    return (
        <svg width={size} height={size} viewBox="0 0 50 50" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
            <circle cx="25" cy="25" r="17.5" fill="none" stroke={c} strokeWidth="1" />
            <circle cx="25" cy="25" r="21.5" fill="none" stroke={c} strokeWidth="0.5" />
            <circle cx="25" cy="2.5" r="2.5" fill="none" stroke={c} strokeWidth="0.7" />
            <circle cx="25" cy="47.5" r="2.5" fill="none" stroke={c} strokeWidth="0.7" />
            <circle cx="2.5" cy="25" r="2.5" fill="none" stroke={c} strokeWidth="0.7" />
            <circle cx="47.5" cy="25" r="2.5" fill="none" stroke={c} strokeWidth="0.7" />
            <circle cx="9.5" cy="9.5" r="1" fill={c} />
            <circle cx="40.5" cy="9.5" r="1" fill={c} />
            <circle cx="9.5" cy="40.5" r="1" fill={c} />
            <circle cx="40.5" cy="40.5" r="1" fill={c} />
            <text x="25" y="26" textAnchor="middle" dominantBaseline="central"
                fontFamily="'Amiri Quran', 'Scheherazade New', serif"
                fontSize={fs} fill={c}>{numStr}</text>
        </svg>
    );
};

interface SurahPageProps {
    params: Promise<{ surahNumber: string }>;
}

type ReadingMode = 'translation' | 'reading' | 'word-by-word';

const ALL_SURAHS = [
    { number: 1, name: 'Al-Fatiha', translation: 'The Opening', arabic: 'الفاتحة' },
    { number: 2, name: 'Al-Baqarah', translation: 'The Cow', arabic: 'البقرة' },
    { number: 3, name: 'Ali \u2018Imran', translation: 'Family of Imran', arabic: 'آل عمران' },
    { number: 4, name: 'An-Nisa', translation: 'The Women', arabic: 'النساء' },
    { number: 5, name: 'Al-Ma\u2019idah', translation: 'The Table Spread', arabic: 'المائدة' },
    { number: 6, name: 'Al-An\u2018am', translation: 'The Cattle', arabic: 'الأنعام' },
    { number: 7, name: 'Al-A\u2018raf', translation: 'The Heights', arabic: 'الأعراف' },
    { number: 8, name: 'Al-Anfal', translation: 'The Spoils of War', arabic: 'الأنفال' },
    { number: 9, name: 'At-Tawbah', translation: 'The Repentance', arabic: 'التوبة' },
    { number: 10, name: 'Yunus', translation: 'Jonah', arabic: 'يونس' },
    { number: 11, name: 'Hud', translation: 'Hud', arabic: 'هود' },
    { number: 12, name: 'Yusuf', translation: 'Joseph', arabic: 'يوسف' },
    { number: 13, name: 'Ar-Ra\u2018d', translation: 'The Thunder', arabic: 'الرعد' },
    { number: 14, name: 'Ibrahim', translation: 'Abraham', arabic: 'إبراهيم' },
    { number: 15, name: 'Al-Hijr', translation: 'The Rocky Tract', arabic: 'الحجر' },
    { number: 16, name: 'An-Nahl', translation: 'The Bee', arabic: 'النحل' },
    { number: 17, name: 'Al-Isra', translation: 'The Night Journey', arabic: 'الإسراء' },
    { number: 18, name: 'Al-Kahf', translation: 'The Cave', arabic: 'الكهف' },
    { number: 19, name: 'Maryam', translation: 'Mary', arabic: 'مريم' },
    { number: 20, name: 'Ta-Ha', translation: 'Ta-Ha', arabic: 'طه' },
    { number: 21, name: 'Al-Anbya', translation: 'The Prophets', arabic: 'الأنبياء' },
    { number: 22, name: 'Al-Hajj', translation: 'The Pilgrimage', arabic: 'الحج' },
    { number: 23, name: 'Al-Mu\u2019minun', translation: 'The Believers', arabic: 'المؤمنون' },
    { number: 24, name: 'An-Nur', translation: 'The Light', arabic: 'النور' },
    { number: 25, name: 'Al-Furqan', translation: 'The Criterion', arabic: 'الفرقان' },
    { number: 26, name: 'Ash-Shu\u2018ara', translation: 'The Poets', arabic: 'الشعراء' },
    { number: 27, name: 'An-Naml', translation: 'The Ant', arabic: 'النمل' },
    { number: 28, name: 'Al-Qasas', translation: 'The Stories', arabic: 'القصص' },
    { number: 29, name: 'Al-\u2018Ankabut', translation: 'The Spider', arabic: 'العنكبوت' },
    { number: 30, name: 'Ar-Rum', translation: 'The Romans', arabic: 'الروم' },
    { number: 31, name: 'Luqman', translation: 'Luqman', arabic: 'لقمان' },
    { number: 32, name: 'As-Sajdah', translation: 'The Prostration', arabic: 'السجدة' },
    { number: 33, name: 'Al-Ahzab', translation: 'The Combined Forces', arabic: 'الأحزاب' },
    { number: 34, name: 'Saba', translation: 'Sheba', arabic: 'سبأ' },
    { number: 35, name: 'Fatir', translation: 'Originator', arabic: 'فاطر' },
    { number: 36, name: 'Ya-Sin', translation: 'Ya Sin', arabic: 'يس' },
    { number: 37, name: 'As-Saffat', translation: 'Those Ranged in Ranks', arabic: 'الصافات' },
    { number: 38, name: 'Sad', translation: 'The Letter Sad', arabic: 'ص' },
    { number: 39, name: 'Az-Zumar', translation: 'The Groups', arabic: 'الزمر' },
    { number: 40, name: 'Ghafir', translation: 'The Forgiver', arabic: 'غافر' },
    { number: 41, name: 'Fussilat', translation: 'Explained in Detail', arabic: 'فصلت' },
    { number: 42, name: 'Ash-Shuraa', translation: 'The Consultation', arabic: 'الشورى' },
    { number: 43, name: 'Az-Zukhruf', translation: 'The Gold Adornments', arabic: 'الزخرف' },
    { number: 44, name: 'Ad-Dukhan', translation: 'The Smoke', arabic: 'الدخان' },
    { number: 45, name: 'Al-Jathiyah', translation: 'The Kneeling', arabic: 'الجاثية' },
    { number: 46, name: 'Al-Ahqaf', translation: 'The Wind-Curved Sandhills', arabic: 'الأحقاف' },
    { number: 47, name: 'Muhammad', translation: 'Muhammad', arabic: 'محمد' },
    { number: 48, name: 'Al-Fath', translation: 'The Victory', arabic: 'الفتح' },
    { number: 49, name: 'Al-Hujurat', translation: 'The Rooms', arabic: 'الحجرات' },
    { number: 50, name: 'Qaf', translation: 'The Letter Qaf', arabic: 'ق' },
    { number: 51, name: 'Adh-Dhariyat', translation: 'The Winnowing Winds', arabic: 'الذاريات' },
    { number: 52, name: 'At-Tur', translation: 'The Mount', arabic: 'الطور' },
    { number: 53, name: 'An-Najm', translation: 'The Star', arabic: 'النجم' },
    { number: 54, name: 'Al-Qamar', translation: 'The Moon', arabic: 'القمر' },
    { number: 55, name: 'Ar-Rahman', translation: 'The Beneficent', arabic: 'الرحمن' },
    { number: 56, name: 'Al-Waqi\u2018ah', translation: 'The Inevitable', arabic: 'الواقعة' },
    { number: 57, name: 'Al-Hadid', translation: 'The Iron', arabic: 'الحديد' },
    { number: 58, name: 'Al-Mujadila', translation: 'The Pleading Woman', arabic: 'المجادلة' },
    { number: 59, name: 'Al-Hashr', translation: 'The Exile', arabic: 'الحشر' },
    { number: 60, name: 'Al-Mumtahanah', translation: 'She That is to be Examined', arabic: 'الممتحنة' },
    { number: 61, name: 'As-Saf', translation: 'The Ranks', arabic: 'الصف' },
    { number: 62, name: 'Al-Jumu\u2018ah', translation: 'The Congregation', arabic: 'الجمعة' },
    { number: 63, name: 'Al-Munafiqun', translation: 'The Hypocrites', arabic: 'المنافقون' },
    { number: 64, name: 'At-Taghabun', translation: 'The Mutual Disillusion', arabic: 'التغابن' },
    { number: 65, name: 'At-Talaq', translation: 'The Divorce', arabic: 'الطلاق' },
    { number: 66, name: 'At-Tahrim', translation: 'The Prohibition', arabic: 'التحريم' },
    { number: 67, name: 'Al-Mulk', translation: 'The Sovereignty', arabic: 'الملك' },
    { number: 68, name: 'Al-Qalam', translation: 'The Pen', arabic: 'القلم' },
    { number: 69, name: 'Al-Haqqah', translation: 'The Reality', arabic: 'الحاقة' },
    { number: 70, name: 'Al-Ma\u2018arij', translation: 'The Ascending Stairways', arabic: 'المعارج' },
    { number: 71, name: 'Nuh', translation: 'Noah', arabic: 'نوح' },
    { number: 72, name: 'Al-Jinn', translation: 'The Jinn', arabic: 'الجن' },
    { number: 73, name: 'Al-Muzzammil', translation: 'The Enshrouded One', arabic: 'المزمل' },
    { number: 74, name: 'Al-Muddaththir', translation: 'The Cloaked One', arabic: 'المدثر' },
    { number: 75, name: 'Al-Qiyamah', translation: 'The Resurrection', arabic: 'القيامة' },
    { number: 76, name: 'Al-Insan', translation: 'The Human', arabic: 'الإنسان' },
    { number: 77, name: 'Al-Mursalat', translation: 'The Emissaries', arabic: 'المرسلات' },
    { number: 78, name: 'An-Naba', translation: 'The Tidings', arabic: 'النبأ' },
    { number: 79, name: 'An-Nazi\u2018at', translation: 'Those Who Drag Forth', arabic: 'النازعات' },
    { number: 80, name: '\u2018Abasa', translation: 'He Frowned', arabic: 'عبس' },
    { number: 81, name: 'At-Takwir', translation: 'The Overthrowing', arabic: 'التكوير' },
    { number: 82, name: 'Al-Infitar', translation: 'The Cleaving', arabic: 'الانفطار' },
    { number: 83, name: 'Al-Mutaffifin', translation: 'The Defrauding', arabic: 'المطففين' },
    { number: 84, name: 'Al-Inshiqaq', translation: 'The Sundering', arabic: 'الانشقاق' },
    { number: 85, name: 'Al-Buruj', translation: 'The Mansions of the Stars', arabic: 'البروج' },
    { number: 86, name: 'At-Tariq', translation: 'The Morning Star', arabic: 'الطارق' },
    { number: 87, name: 'Al-A\u2018la', translation: 'The Most High', arabic: 'الأعلى' },
    { number: 88, name: 'Al-Ghashiyah', translation: 'The Overwhelming', arabic: 'الغاشية' },
    { number: 89, name: 'Al-Fajr', translation: 'The Dawn', arabic: 'الفجر' },
    { number: 90, name: 'Al-Balad', translation: 'The City', arabic: 'البلد' },
    { number: 91, name: 'Ash-Shams', translation: 'The Sun', arabic: 'الشمس' },
    { number: 92, name: 'Al-Layl', translation: 'The Night', arabic: 'الليل' },
    { number: 93, name: 'Ad-Duhaa', translation: 'The Morning Hours', arabic: 'الضحى' },
    { number: 94, name: 'Ash-Sharh', translation: 'The Relief', arabic: 'الشرح' },
    { number: 95, name: 'At-Tin', translation: 'The Fig', arabic: 'التين' },
    { number: 96, name: 'Al-\u2018Alaq', translation: 'The Clot', arabic: 'العلق' },
    { number: 97, name: 'Al-Qadr', translation: 'The Power', arabic: 'القدر' },
    { number: 98, name: 'Al-Bayyinah', translation: 'The Clear Proof', arabic: 'البينة' },
    { number: 99, name: 'Az-Zalzalah', translation: 'The Earthquake', arabic: 'الزلزلة' },
    { number: 100, name: 'Al-\u2018Adiyat', translation: 'The Chargers', arabic: 'العاديات' },
    { number: 101, name: 'Al-Qari\u2018ah', translation: 'The Calamity', arabic: 'القارعة' },
    { number: 102, name: 'At-Takathur', translation: 'The Rivalry in World Increase', arabic: 'التكاثر' },
    { number: 103, name: 'Al-\u2018Asr', translation: 'The Declining Day', arabic: 'العصر' },
    { number: 104, name: 'Al-Humazah', translation: 'The Traducer', arabic: 'الهمزة' },
    { number: 105, name: 'Al-Fil', translation: 'The Elephant', arabic: 'الفيل' },
    { number: 106, name: 'Quraysh', translation: 'Quraysh', arabic: 'قريش' },
    { number: 107, name: 'Al-Ma\u2018un', translation: 'The Small Kindnesses', arabic: 'الماعون' },
    { number: 108, name: 'Al-Kawthar', translation: 'The Abundance', arabic: 'الكوثر' },
    { number: 109, name: 'Al-Kafirun', translation: 'The Disbelievers', arabic: 'الكافرون' },
    { number: 110, name: 'An-Nasr', translation: 'The Divine Support', arabic: 'النصر' },
    { number: 111, name: 'Al-Masad', translation: 'The Palm Fiber', arabic: 'المسد' },
    { number: 112, name: 'Al-Ikhlas', translation: 'The Sincerity', arabic: 'الإخلاص' },
    { number: 113, name: 'Al-Falaq', translation: 'The Daybreak', arabic: 'الفلق' },
    { number: 114, name: 'An-Nas', translation: 'The Mankind', arabic: 'الناس' },
];

export default function SurahReadingPage({ params }: SurahPageProps) {
    const { surahNumber: surahNumberStr } = use(params);
    const surahNumber = parseInt(surahNumberStr);
    const searchParams = useSearchParams();
    const initialMode = searchParams?.get('mode') ?? 'reading';

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
    const surahBtnRef = useRef<HTMLButtonElement | null>(null);

    const [showVerseNav, setShowVerseNav] = useState(false);
    const [showSurahPicker, setShowSurahPicker] = useState(false);
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [expandedTafsir, setExpandedTafsir] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

    // Tooltip state for word meanings
    const [tooltip, setTooltip] = useState<{ meaning: string; x: number; y: number } | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);

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

    // Load Quran.com API data (proper Uthmani text) for reading & word-by-word modes
    useEffect(() => {
        let isCancelled = false;
        async function loadWordData() {
            if ((readingMode !== 'word-by-word' && readingMode !== 'reading') || !chapter) return;
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

    // Track recently visited surah
    useEffect(() => {
        if (!chapter) return;
        const meta = ALL_SURAHS.find(s => s.number === surahNumber);
        trackSurahVisit({
            num: surahNumber,
            name: chapter.name_simple,
            ar: meta?.arabic ?? '',
        });
    }, [chapter, surahNumber]);

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
        const arabicText = verse.text_indopak ?? verse.text_uthmani;
        const text = `${arabicText}\n\n${verse.translations?.[0]?.text || ''}\n\n— Quran ${verse.verse_key}`;
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    }, []);

    const shareVerse = useCallback(async (verse: VerseWithTranslation) => {
        const arabicText = verse.text_indopak ?? verse.text_uthmani;
        const text = `${arabicText}\n\n${verse.translations?.[0]?.text || ''}\n\n— Quran ${verse.verse_key}`;
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

    const displayVerses = (readingMode === 'word-by-word' || readingMode === 'reading') && versesWithWords.length > 0 ? versesWithWords : verses;
    const currentReciter = POPULAR_RECITERS.find(r => r.id === selectedReciter);

    return (
        <>
            <style>{`
                .nq-shell{position:fixed;inset:0;z-index:9999;display:flex;overflow:hidden;background:#f6f8f6;font-family:'Lexend','Figtree',sans-serif}
                .dark .nq-shell{background:#102215}
                .nq-sidebar{width:0;flex-shrink:0;background:white;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;justify-content:space-between;padding:24px 0;transition:width 0.2s;overflow:hidden}
                @media(min-width:640px){.nq-sidebar{width:56px}}
                @media(min-width:1024px){.nq-sidebar{width:256px}}
                .dark .nq-sidebar{background:#0f172a;border-color:#1e293b}
                .nq-main{flex:1;display:flex;flex-direction:column;min-width:0;position:relative}
                .nq-header{height:56px;background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);border-bottom:1px solid #e2e8f0;padding:0 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;z-index:10;gap:8px}
                @media(min-width:640px){.nq-header{height:64px;padding:0 24px}}
                @media(min-width:1024px){.nq-header{height:80px;padding:0 32px}}
                .dark .nq-header{background:rgba(15,23,42,0.8);border-color:#1e293b}
                .nq-content{flex:1;display:flex;flex-direction:column;overflow:hidden}
                @media(min-width:1280px){.nq-content{display:grid;grid-template-columns:1fr 256px}}
                .nq-scroll{flex:1;overflow-y:auto;padding:16px 16px 160px}
                @media(min-width:640px){.nq-scroll{padding:24px 24px 160px}}
                @media(min-width:1024px){.nq-scroll{padding:32px 48px 140px}}
                .nq-right{flex-shrink:0;border-left:1px solid #e2e8f0;background:white;display:none;flex-direction:column;overflow:hidden}
                @media(min-width:1280px){.nq-right{display:flex;width:256px}}
                .dark .nq-right{background:#0f172a;border-color:#1e293b}
                .nq-islamic{background-image:radial-gradient(circle at 2px 2px,rgba(17,212,66,0.05) 1px,transparent 0);background-size:24px 24px}
                /* Bismillah */
                .nq-bismillah{display:flex;flex-direction:column;align-items:center;margin-bottom:48px}
                .nq-bismillah-text{font-family:var(--rq-font-arabic),'Scheherazade New','Traditional Arabic',serif;font-size:36px;color:#1e293b;padding:32px 0;opacity:0.9}
                .dark .nq-bismillah-text{color:#e2e8f0}
                .nq-bismillah-hr{width:128px;height:4px;background:linear-gradient(90deg,transparent,rgba(17,212,66,0.3),transparent);border:none;margin:0}
                /* Verse cards */
                .nq-ayah-card{position:relative;padding:16px;border-radius:16px;border:1px solid transparent;transition:all 0.3s;margin-bottom:32px}
                @media(min-width:640px){.nq-ayah-card{padding:24px;margin-bottom:48px}}
                .nq-ayah-card:hover{background:rgba(17,212,66,0.05);border-color:rgba(17,212,66,0.1)}
                .nq-ayah-card.nq-playing{background:rgba(17,212,66,0.05);border-color:rgba(17,212,66,0.25);box-shadow:0 2px 12px rgba(17,212,66,0.08)}
                .nq-active-accent{position:absolute;left:-3px;top:32px;width:6px;height:48px;background:#11d442;border-radius:3px}
                .nq-arabic-row{display:flex;flex-direction:row-reverse;align-items:flex-start;gap:12px;margin-bottom:0}
                @media(min-width:640px){.nq-arabic-row{gap:24px}}
                .nq-arabic-text{font-family:var(--rq-font-arabic),'Scheherazade New','Traditional Arabic',serif;font-size:var(--nq-fs,26px);line-height:2;text-align:right;flex:1;color:#1e293b;direction:rtl}
                @media(min-width:640px){.nq-arabic-text{font-size:var(--nq-fs,36px)}}
                .dark .nq-arabic-text{color:#e2e8f0}
                .nq-verse-badge{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;border:1px solid rgba(17,212,66,0.4);font-size:12px;font-weight:700;color:#11d442;margin-right:6px;font-family:'Lexend',sans-serif;cursor:pointer;vertical-align:middle;transition:background 0.15s}
                @media(min-width:640px){.nq-verse-badge{width:40px;height:40px;font-size:14px;margin-right:8px}}
                .nq-verse-badge:hover{background:rgba(17,212,66,0.1)}
                .nq-playing .nq-verse-badge{border-color:#11d442;background:rgba(17,212,66,0.12)}
                .nq-translation-row{margin-top:14px;padding-left:12px;border-left:2px solid #e2e8f0;transition:border-color 0.2s}
                @media(min-width:640px){.nq-translation-row{margin-top:24px;padding-left:16px}}
                .nq-ayah-card:hover .nq-translation-row{border-color:rgba(17,212,66,0.3)}
                .nq-ayah-card.nq-playing .nq-translation-row{border-color:rgba(17,212,66,0.5)}
                .nq-translation-text{color:#475569;font-size:15px;line-height:1.8}
                @media(min-width:640px){.nq-translation-text{font-size:18px}}
                .dark .nq-translation-text{color:#94a3b8}
                .nq-ayah-card.nq-playing .nq-translation-text{color:#1e293b;font-weight:500}
                .dark .nq-ayah-card.nq-playing .nq-translation-text{color:#e2e8f0}
                /* Hover actions */
                .nq-actions{position:absolute;top:10px;right:10px;display:flex;gap:6px;opacity:0;transition:opacity 0.2s}
                @media(min-width:640px){.nq-actions{top:16px;right:16px;gap:8px}}
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
                .nq-hdr-btn{padding:6px 8px;border:none;border-radius:8px;background:#f1f5f9;color:#64748b;cursor:pointer;display:flex;align-items:center;transition:all 0.15s;font-size:12px}
                @media(min-width:640px){.nq-hdr-btn{padding:8px 12px;font-size:13px}}
                .dark .nq-hdr-btn{background:#1e293b;color:#94a3b8}
                .nq-hdr-btn:hover{color:#11d442}
                .nq-hdr-toggle-group{display:none;align-items:center;background:#f1f5f9;border-radius:8px;padding:4px;gap:2px}
                @media(min-width:600px){.nq-hdr-toggle-group{display:flex}}
                .dark .nq-hdr-toggle-group{background:#1e293b}
                .nq-hdr-toggle{padding:4px 10px;border-radius:6px;border:none;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;background:transparent;color:#64748b}
                @media(min-width:768px){.nq-hdr-toggle{padding:4px 12px;font-size:12px}}
                .nq-hdr-toggle.active{background:white;color:#0f172a;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
                .dark .nq-hdr-toggle.active{background:#0f172a;color:white}
                .nq-bkmk-btn{width:34px;height:34px;background:#11d442;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;cursor:pointer;box-shadow:0 4px 14px rgba(17,212,66,0.3);flex-shrink:0}
                @media(min-width:640px){.nq-bkmk-btn{width:40px;height:40px}}
                /* Audio bar */
                .nq-audio-bar{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);width:calc(100% - 20px);background:rgba(255,255,255,0.97);backdrop-filter:blur(16px);border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 8px 32px rgba(0,0,0,0.12);z-index:20;padding:10px 14px}
                @media(min-width:640px){.nq-audio-bar{bottom:20px;padding:13px 18px;border-radius:22px;width:calc(100% - 32px)}}
                @media(min-width:1024px){.nq-audio-bar{bottom:24px;padding:16px;border-radius:24px;width:min(800px,90%)}}
                .dark .nq-audio-bar{background:rgba(15,23,42,0.97);border-color:#1e293b}
                .nq-audio-progress-row{margin-bottom:8px}
                .nq-audio-progress-track{width:100%;height:4px;background:#f1f5f9;border-radius:999px;overflow:hidden;cursor:pointer;position:relative}
                .dark .nq-audio-progress-track{background:#1e293b}
                .nq-audio-progress-fill{height:100%;background:#11d442;border-radius:999px;transition:width 0.3s}
                .nq-audio-bar-inner{display:flex;align-items:center;justify-content:space-between;gap:8px}
                @media(min-width:640px){.nq-audio-bar-inner{gap:16px}}
                @media(min-width:1024px){.nq-audio-bar-inner{gap:24px}}
                .nq-reciter-info{display:none;align-items:center;gap:12px;flex:1;min-width:0}
                @media(min-width:768px){.nq-reciter-info{display:flex}}
                .nq-reciter-avatar{position:relative;width:40px;height:40px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0}
                .dark .nq-reciter-avatar{background:#1e293b}
                .nq-reciter-badge{position:absolute;bottom:-4px;right:-4px;background:#11d442;color:white;font-size:8px;font-weight:700;padding:1px 4px;border-radius:999px;border:2px solid white;font-family:'Lexend',sans-serif}
                .nq-reciter-name{margin:0;font-size:12px;font-weight:700;color:#0f172a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                .dark .nq-reciter-name{color:#e2e8f0}
                .nq-reciter-sub{margin:0;font-size:10px;color:#94a3b8}
                .nq-audio-controls{display:flex;align-items:center;gap:10px}
                @media(min-width:480px){.nq-audio-controls{gap:16px}}
                @media(min-width:1024px){.nq-audio-controls{gap:24px}}
                .nq-ctrl-btn{background:none;border:none;color:#64748b;cursor:pointer;display:flex;align-items:center;padding:0;transition:color 0.15s}
                .nq-ctrl-btn:hover{color:#11d442}
                .nq-ctrl-btn.lg{color:#334155}
                .nq-ctrl-btn.hide-xs{display:none}
                @media(min-width:480px){.nq-ctrl-btn.hide-xs{display:flex}}
                .dark .nq-ctrl-btn.lg{color:#e2e8f0}
                .nq-play-btn{width:42px;height:42px;background:#11d442;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;cursor:pointer;box-shadow:0 4px 20px rgba(17,212,66,0.35);transition:transform 0.15s;flex-shrink:0}
                @media(min-width:640px){.nq-play-btn{width:48px;height:48px}}
                .nq-play-btn:hover{transform:scale(1.05)}
                .nq-audio-right{display:none;align-items:center;gap:12px;flex:1;justify-content:flex-end;min-width:0}
                @media(min-width:768px){.nq-audio-right{display:flex}}
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
                .nq-mode-tabs{display:flex;gap:4px;padding:0 16px;background:rgba(255,255,255,0.8);border-bottom:1px solid #e2e8f0;height:44px;align-items:center;flex-shrink:0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
                .nq-mode-tabs::-webkit-scrollbar{display:none}
                @media(min-width:640px){.nq-mode-tabs{padding:0 24px;height:48px}}
                    @media(min-width:1024px){.nq-mode-tabs{padding:0 32px}}
                    .dark .nq-mode-tabs{background:rgba(15,23,42,0.8);border-color:#1e293b}
                    .nq-mode-tab{padding:5px 12px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;background:transparent;color:#64748b;font-family:'Lexend',sans-serif;white-space:nowrap;flex-shrink:0}
                    @media(min-width:640px){.nq-mode-tab{padding:6px 16px;font-size:13px}}
                    .nq-mode-tab.active{background:#11d442;color:white}
                    .nq-header-title{margin:0;font-size:14px;font-weight:700;color:#0f172a;display:flex;align-items:baseline;gap:5px;white-space:nowrap;overflow:hidden;min-width:0}
                    @media(min-width:640px){.nq-header-title{font-size:17px;gap:7px}}
                    @media(min-width:1024px){.nq-header-title{font-size:20px;gap:8px}}
                    .nq-header-subtitle{font-size:11px;font-weight:400;color:#94a3b8;flex-shrink:0}
                    @media(min-width:480px){.nq-header-subtitle{font-size:13px}}
                    .dark .nq-header-title{color:#e2e8f0}
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
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a', lineHeight: 1 }}>Learn Quran</p>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#475569,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'white' }}>person</span>
                                </div>
                                <div className="nq-nav-label" style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Browsing Anonymously</p>
                                    <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>Guest User</p>
                                </div>
                            </div>
                            <Link href="/signup" className="nq-nav-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '7px 0', borderRadius: 8, textDecoration: 'none', background: 'linear-gradient(135deg,#11d442,#059669)', color: 'white', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star</span>
                                Subscribe Now
                            </Link>
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
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowSurahPicker(!showSurahPicker)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                                >
                                    <h2 className="nq-header-title">
                                        {chapter.name_simple}
                                        <span className="nq-header-subtitle">
                                            {chapter.translated_name.name} • {chapter.verses_count} Verses
                                        </span>
                                    </h2>
                                    <ChevronDown size={16} style={{ color: '#94a3b8', flexShrink: 0, marginTop: 1 }} />
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* Surah picker button */}
                            <button
                                ref={surahBtnRef}
                                onClick={() => setShowSurahPicker(!showSurahPicker)}
                                className="nq-hdr-btn"
                                style={{ gap: 6, display: 'flex', alignItems: 'center', padding: '6px 12px' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>menu_book</span>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Surah</span>
                                <ChevronDown size={14} />
                            </button>
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
                        {(['reading', 'translation', 'word-by-word'] as ReadingMode[]).map(m => (
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
                                    (() => {
                                        const versesToRender = displayVerses.filter(v => !(surahNumber === 1 && v.verse_number === 1));
                                        const pageGroups: { pageNumber: number; verses: typeof versesToRender }[] = [];
                                        for (const verse of versesToRender) {
                                            const pn = verse.page_number || 1;
                                            const last = pageGroups[pageGroups.length - 1];
                                            if (last && last.pageNumber === pn) {
                                                last.verses.push(verse);
                                            } else {
                                                pageGroups.push({ pageNumber: pn, verses: [verse] });
                                            }
                                        }

                                        const renderVerseWords = (verse: typeof versesToRender[0]) => {
                                            let words: { text: string; key: string | number; translation?: string; transliteration?: string }[] = [];
                                            // Use verse-level text_indopak (from QuranCDN via getVersesWithWords).
                                            // It has proper kasra/fatha/damma on all words (e.g. اِهدِنَا with kasra).
                                            // cleanIndopakText strips Quran-specific chars (ۡ U+06E1) but preserves
                                            // standard diacritics, giving exactly the voweled text we want.
                                            const verseText = verse.text_indopak || verse.text_uthmani || '';
                                            const hasWordData = verse.words && verse.words.length > 0;

                                            // Clean and split verse-level text into word tokens
                                            const cleanedVerse = cleanIndopakText(
                                                verse.verse_number === 1 && chapter.bismillah_pre
                                                    ? removeBismillah(verseText)
                                                    : verseText
                                            );
                                            const verseTokens = cleanedVerse.split(/\s+/).filter(Boolean);

                                            if (hasWordData) {
                                                let wordList = verse.words!.filter((w: any) => w.char_type_name !== 'end');
                                                if (verse.verse_number === 1 && chapter.bismillah_pre) {
                                                    let skip = 0;
                                                    for (const w of wordList) {
                                                        if (isBismillahWord(w.text_uthmani) && skip < 4) skip++;
                                                        else break;
                                                    }
                                                    wordList = wordList.slice(skip);
                                                }
                                                if (verseTokens.length > 0 && verseTokens.length === wordList.length) {
                                                    // Perfect match — use verse-level tokens (proper kasra/fatha from IndoPak)
                                                    words = wordList.map((w: any, i: number) => ({ 
                                                        text: verseTokens[i], 
                                                        key: w.id || w.position,
                                                        translation: w.translation?.text || '',
                                                        transliteration: w.transliteration?.text || ''
                                                    }));
                                                } else if (verseTokens.length > 0) {
                                                    // Token count mismatch — still use verse tokens (better diacritics than per-word fields)
                                                    words = verseTokens.map((tok, i) => ({ 
                                                        text: tok, 
                                                        key: i,
                                                        translation: wordList[i]?.translation?.text || '',
                                                        transliteration: wordList[i]?.transliteration?.text || ''
                                                    }));
                                                } else {
                                                    // No verse text — last resort: per-word imlaei
                                                    words = wordList.map((w: any) => ({ 
                                                        text: w.text_imlaei || w.text_uthmani, 
                                                        key: w.id || w.position,
                                                        translation: w.translation?.text || '',
                                                        transliteration: w.transliteration?.text || ''
                                                    }));
                                                }
                                            } else {
                                                // No word data at all — use the verse-level tokens directly
                                                words = verseTokens.map((w, idx) => ({ text: w, key: idx }));
                                            }
                                            return words;
                                        };

                                        const ayahSize = Math.max(28, Math.round(fontSize * 1.15));
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                                {pageGroups.map((group, groupIdx) => (
                                                    <div key={group.pageNumber}>
                                                        <div style={{
                                                            background: '#fff',
                                                            border: '1px solid #e2ddd3',
                                                            borderRadius: 2,
                                                            padding: 'clamp(20px, 4vw, 40px) clamp(24px, 5vw, 56px)',
                                                            position: 'relative',
                                                        }}>
                                                            {groupIdx === 0 && surahNumber === 1 && verses.length > 0 && (
                                                                <div
                                                                    onClick={() => playVerse(1)}
                                                                    style={{
                                                                        fontFamily: 'var(--rq-font-arabic)',
                                                                        fontSize: `${Math.round(fontSize * 1.05)}px`,
                                                                        lineHeight: 1.8,
                                                                        textAlign: 'center',
                                                                        direction: 'rtl',
                                                                        color: '#222',
                                                                        padding: '0 0 16px',
                                                                        marginBottom: 12,
                                                                        borderBottom: '1px solid #eae5db',
                                                                        cursor: 'pointer',
                                                                        fontFeatureSettings: '"liga" 1, "calt" 1',
                                                                        textRendering: 'optimizeLegibility',
                                                                    }}
                                                                >
                                                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                                                </div>
                                                            )}
                                                            <div style={{
                                                                fontFamily: 'var(--rq-font-arabic)',
                                                                fontSize: `${fontSize}px`,
                                                                lineHeight: 2.1,
                                                                textAlign: 'center',
                                                                direction: 'rtl',
                                                                color: '#222',
                                                                margin: 0,
                                                                fontFeatureSettings: '"liga" 1, "calt" 1',
                                                                textRendering: 'optimizeLegibility',
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                justifyContent: 'center',
                                                                gap: '0 6px',
                                                            }}>
                                                                {group.verses.map((verse) => {
                                                                    const words = renderVerseWords(verse);
                                                                    if (words.length === 0) return null;
                                                                    return (
                                                                        <span key={verse.id} style={{ display: 'contents' }}>
                                                                            {words.map((word) => (
                                                                                <span
                                                                                    key={word.key}
                                                                                    style={{
                                                                                        display: 'inline-block',
                                                                                        cursor: 'pointer',
                                                                                        padding: '2px 2px',
                                                                                        borderRadius: 4,
                                                                                        transition: 'background 0.15s',
                                                                                        background: currentVerse === verse.verse_number ? 'rgba(66,133,244,0.08)' : 'transparent',
                                                                                        position: 'relative'
                                                                                    }}
                                                                                    onClick={() => playVerse(verse.verse_number)}
                                                                                    onMouseEnter={(e) => {
                                                                                        (e.currentTarget as HTMLElement).style.background = 'rgba(66,133,244,0.1)';
                                                                                        if (word.translation) {
                                                                                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                                                            setTooltip({
                                                                                                meaning: word.translation,
                                                                                                x: rect.left + rect.width / 2,
                                                                                                y: rect.top - 8
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    onMouseLeave={(e) => {
                                                                                        (e.currentTarget as HTMLElement).style.background = currentVerse === verse.verse_number ? 'rgba(66,133,244,0.08)' : 'transparent';
                                                                                        setTooltip(null);
                                                                                    }}
                                                                                >
                                                                                    {word.text}
                                                                                </span>
                                                                            ))}
                                                                            <span style={{ alignSelf: 'center', cursor: 'pointer' }} onClick={() => playVerse(verse.verse_number)}>
                                                                                <AyahMarker number={verse.verse_number} size={ayahSize} />
                                                                            </span>
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            textAlign: 'center',
                                                            padding: '10px 0 0',
                                                            fontSize: 13,
                                                            color: '#a0a0a0',
                                                            fontFamily: "'Inter', sans-serif",
                                                            fontWeight: 400,
                                                            letterSpacing: '0.02em',
                                                        }}>
                                                            {group.pageNumber}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()

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
                                                                <span className="word-arabic">{cleanIndopakText(word.text_indopak ?? word.text_uthmani)}</span>
                                                                {word.transliteration?.text && <span className="word-transliteration">{word.transliteration.text}</span>}
                                                                {word.translation?.text && <span className="word-translation">{word.translation.text}</span>}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="reader-verse-arabic">{verse.verse_number === 1 && chapter.bismillah_pre ? cleanIndopakText(removeBismillah(verse.text_indopak ?? verse.text_uthmani)) : cleanIndopakText(verse.text_indopak ?? verse.text_uthmani)}</div>
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
                                        {/* Surah navigation */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                                            {surahNumber > 1 ? <Link href={`/read-quran/${surahNumber - 1}?mode=word-by-word`} className="reader-nav-btn"><ChevronLeft size={18} /><span>Previous Surah</span></Link> : <div />}
                                            {surahNumber < 114 && <Link href={`/read-quran/${surahNumber + 1}?mode=word-by-word`} className="reader-nav-btn primary"><span>Next Surah</span><ChevronRight size={18} /></Link>}
                                        </div>
                                    </div>
                                ) : (
                                    // Translation mode — new card design
                                    <div>
                                        {verses.map((verse) => (
                                            <div key={verse.id} id={`verse-${verse.verse_number}`} className={`nq-ayah-card ${currentVerse === verse.verse_number ? 'nq-playing' : ''}`}>
                                                {currentVerse === verse.verse_number && <div className="nq-active-accent" />}
                                                <div className="nq-arabic-row">
                                                    <span className="nq-arabic-text">
                                                        {verse.verse_number === 1 && chapter.bismillah_pre ? cleanIndopakText(removeBismillah(verse.text_indopak ?? verse.text_uthmani)) : cleanIndopakText(verse.text_indopak ?? verse.text_uthmani)}
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
                                <button className="nq-ctrl-btn hide-xs" title="Repeat"><span className="material-symbols-outlined" style={{ fontSize: 22 }}>repeat_one</span></button>
                                <button className="nq-ctrl-btn lg" onClick={playPrev} title="Previous (←)"><SkipBack size={26} /></button>
                                <button className="nq-play-btn" onClick={() => isPlaying ? stopAudio() : playVerse(currentVerse || 1)} title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                </button>
                                <button className="nq-ctrl-btn lg" onClick={playNext} title="Next (→)"><SkipForward size={26} /></button>
                                <button className="nq-ctrl-btn hide-xs" title="Shuffle"><span className="material-symbols-outlined" style={{ fontSize: 22 }}>shuffle</span></button>
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

            {/* Word Meaning Tooltip */}
            {tooltip && (
                <div
                    ref={tooltipRef}
                    style={{
                        position: 'fixed',
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.15s ease-out'
                    }}
                >
                    <div
                        style={{
                            background: '#1e293b',
                            color: '#f1f5f9',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                            fontFamily: "'Lexend', sans-serif",
                            letterSpacing: '0.3px'
                        }}
                    >
                        {tooltip.meaning}
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-4px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '5px solid #1e293b'
                        }}
                    />
                </div>
            )}

            {/* Close dropdowns on outside click */}
            {showVerseNav && <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setShowVerseNav(false)} />}

            {/* Surah Picker — rendered outside the header to escape backdrop-filter stacking context */}
            {showSurahPicker && (() => {
                const btnRect = surahBtnRef.current?.getBoundingClientRect();
                const dropdownWidth = 280;
                // Anchor right-edge of dropdown to right-edge of button so it doesn't overflow right
                const rightEdge = btnRect ? btnRect.right : 320;
                const leftPos = Math.max(8, rightEdge - dropdownWidth);
                const topPos = btnRect ? btnRect.bottom + 8 : 80;
                return (
                    <>
                        {/* Backdrop: dismisses picker on outside click */}
                        <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setShowSurahPicker(false)} />
                        {/* Dropdown: higher z-index, use Link for reliable navigation */}
                        <div style={{
                            position: 'fixed', top: topPos, left: leftPos, zIndex: 9999,
                            background: 'white', border: '1px solid #e2e8f0', borderRadius: 14,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)', width: dropdownWidth,
                            maxHeight: 420, overflowY: 'auto',
                        }}>
                            <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Lexend, sans-serif' }}>
                                Select Surah
                            </div>
                            {ALL_SURAHS.map(s => (
                                <Link
                                    key={s.number}
                                    href={`/read-quran/${s.number}`}
                                    onClick={() => setShowSurahPicker(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        width: '100%', padding: '10px 14px', textDecoration: 'none',
                                        background: s.number === surahNumber ? 'rgba(17,212,66,0.08)' : 'transparent',
                                        cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f8fafc',
                                        color: s.number === surahNumber ? '#11d442' : '#1e293b',
                                    }}
                                >
                                    <span style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: s.number === surahNumber ? 'rgba(17,212,66,0.15)' : '#f1f5f9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                                        color: s.number === surahNumber ? '#11d442' : '#64748b',
                                    }}>{s.number}</span>
                                    <span style={{ flex: 1, minWidth: 0 }}>
                                        <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                                        <span style={{ display: 'block', fontSize: 11, color: '#94a3b8' }}>{s.translation}</span>
                                    </span>
                                    <span style={{ fontSize: 15, fontFamily: 'var(--rq-font-arabic)', color: '#475569', direction: 'rtl' }}>{s.arabic}</span>
                                </Link>
                            ))}
                        </div>
                    </>
                );
            })()}
        </>
    );
}
