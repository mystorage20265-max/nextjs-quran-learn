'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
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
import TafseerModal from '../components/TafseerModal';
import '../styles/reader.css';
import '../styles/tafseer-modal.css';

// Clean Indo-Pak text — strips all annotation/mark characters that render as boxes.
// Three ranges are stripped:
//   U+0610–U+061A: Arabic phonetic annotation marks (sallallaahu, alayhe, etc.)
//   U+06D6–U+06FF: Indo-Pak waqf / pause / sajda annotation glyphs
//   U+FBB2–U+FBC2: Arabic Presentation Forms used in some Quran editions
// Core Arabic letters and standard tashkeel (U+0621–U+06D5) are preserved.
const cleanIndopakText = (text: string): string => {
    if (!text) return '';
    // First strip invisible characters globally
    let cleaned = text
        .replace(/[\u200B-\u200D\uFEFF\u061C\u180E\u00A0]/g, ' ')
        .replace(/[\n\r\t]+/g, ' ');

    return cleaned
        .replace(/[\u0610-\u061A]/g, '') // Arabic Quran-specific phonetic marks
        .replace(/\u06E1/g, '\u0652')     // IndoPak sukun (ۡ U+06E1) → standard sukun (ْ U+0652)
        .replace(/[\u06D6-\u06FF]/g, '') // waqf marks, annotation glyphs, Indo-Pak marks
        .replace(/[\uFBB2-\uFBC2]/g, '') // Arabic Presentation Forms
        // Strip everything that isn't a primary letter or vowel from the end of the string
        // Includes: ع, digits, Ayah markers (۝), Hizb markers (۞), Sajda (۩), and misc marks
        .replace(/[\u0639\u0660-\u0669\u06F0-\u06F9\u06DD\u06DE\u06E9\u06D6-\u06ED\s]+$/, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

// Remove zero-width/invisible characters that can slip through
// Only remove truly invisible Unicode - preserve spaces and word structure
const stripInvisibleChars = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/[\u200B-\u200D]/g, '')  // Zero-width space, joiner, non-joiner
        .replace(/[\uFEFF]/g, '')         // Zero-width no-break space
        .replace(/[\u061C]/g, '')         // Arabic letter mark
        .replace(/[\u180E]/g, '')         // Mongolian vowel separator
        .replace(/[\u00A0]/g, ' ')        // Non-breaking space → regular space
        .replace(/[\u2000-\u200A]/g, ' ') // Various Unicode spaces → regular space
        .replace(/[\u3000]/g, ' ')        // Ideographic space → regular space
        .trim();
};

// Ultra-strict: check if text has at least one visible/meaningful character



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
    // Increased base font sizes for the inner text
    const fs = numStr.length > 2 ? size * 0.45 : numStr.length > 1 ? size * 0.52 : size * 0.58;
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
            <text x="25" y="27" textAnchor="middle" dominantBaseline="central"
                fontFamily="'Scheherazade New', 'Amiri', 'Traditional Arabic', 'Arial', sans-serif"
                fontSize={fs * 1.5} fontWeight="700" fill={c}>{numStr}</text>
        </svg>
    );
};

/**
 * Returns true if `verse` is the last verse of its Ruku.
 */
const isRukuEnd = (verse: { verse_number: number; ruku_number: number }, verses: Array<{ verse_number: number; ruku_number: number }>): boolean => {
    const idx = verses.findIndex(v => v.verse_number === verse.verse_number);
    if (idx === -1) return false;
    return idx === verses.length - 1 || verses[idx + 1].ruku_number !== verse.ruku_number;
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
    const [audioEnabled, setAudioEnabled] = useState(true);

    // Mobile viewport detection for responsive inline styles
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerse, setCurrentVerse] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playbackIdRef = useRef(0);
    const isMountedRef = useRef(true);
    const surahBtnRef = useRef<HTMLButtonElement | null>(null);
    const verseBtnRef = useRef<HTMLButtonElement | null>(null);

    const [showVerseNav, setShowVerseNav] = useState(false);
    const [showSurahPicker, setShowSurahPicker] = useState(false);
    const [showVersePicker, setShowVersePicker] = useState(false);
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    // Tafseer modal state (replaces inline expand panels)
    const [tafseerModalVerse, setTafseerModalVerse] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

    // Tooltip state for word meanings
    const [tooltip] = useState<{ meaning: string; x: number; y: number } | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const verseToPageIndexRef = useRef<Map<number, number>>(new Map());

    // ── Word Detail Modal state ──
    interface SelectedWordInfo {
        text_uthmani: string;
        text_indopak?: string;
        translation: string;
        transliteration: string;
        location: string; // e.g. "1:2:1"
        audio_url?: string | null;
        char_type_name?: string;
        position: number;
        verseKey: string;
        verseText?: string;
    }
    const [selectedWord, setSelectedWord] = useState<SelectedWordInfo | null>(null);
    const wordAudioRef = useRef<HTMLAudioElement | null>(null);
    const [wordAudioPlaying, setWordAudioPlaying] = useState(false);

    const playWordAudio = useCallback((audioUrl?: string | null) => {
        if (!audioUrl) return;
        if (wordAudioRef.current) {
            wordAudioRef.current.pause();
            wordAudioRef.current = null;
        }
        const fullUrl = audioUrl.startsWith('http') ? audioUrl : `https://audio.qurancdn.com/${audioUrl}`;
        const audio = new Audio(fullUrl);
        wordAudioRef.current = audio;
        setWordAudioPlaying(true);
        audio.play().catch(() => setWordAudioPlaying(false));
        audio.onended = () => setWordAudioPlaying(false);
        audio.onerror = () => setWordAudioPlaying(false);
    }, []);

    const openWordDetail = useCallback((word: any, verseKey: string, verseWords?: any[]) => {
        // Build context: the full verse text from all words
        const verseText = verseWords
            ? verseWords.filter((w: any) => w.char_type_name !== 'end').map((w: any) => w.text_uthmani).join(' ')
            : '';
        setSelectedWord({
            text_uthmani: word.text_uthmani,
            text_indopak: word.text_indopak,
            translation: word.translation?.text || '',
            transliteration: word.transliteration?.text || '',
            location: word.location || `${verseKey}:${word.position}`,
            audio_url: word.audio_url,
            char_type_name: word.char_type_name,
            position: word.position,
            verseKey,
            verseText,
        });
    }, []);

    // ESC to close word detail modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedWord) {
                setSelectedWord(null);
                if (wordAudioRef.current) { wordAudioRef.current.pause(); wordAudioRef.current = null; setWordAudioPlaying(false); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedWord]);

    const [audioVolume, setAudioVolume] = useState(100);  // 0-100
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [isRepeating, setIsRepeating] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);    // 0-100%
    const [audioDuration, setAudioDuration] = useState(0);    // seconds
    const [audioCurrentTime, setAudioCurrentTime] = useState(0); // seconds
    const audioProgressRef = useRef<HTMLDivElement | null>(null);
    const audioVolumeRef = useRef<HTMLDivElement | null>(null);


    // Mushaf page pagination for reading mode
    const [mushafPageIndex, setMushafPageIndex] = useState(0);

    // Load chapter data
    useEffect(() => {
        let isCancelled = false;
        setMushafPageIndex(0); // Reset page when surah changes
        setTafseerModalVerse(null);
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
            v: chapter.verses_count,
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
                case 'Space': e.preventDefault(); if (isPlaying) stopAudio(); else if (audioEnabled) playVerse(currentVerse || 1, true); break;
                case 'ArrowRight': if (audioEnabled && currentVerse && currentVerse < verses.length) playVerse(currentVerse + 1); break;
                case 'ArrowLeft': if (audioEnabled && currentVerse && currentVerse > 1) playVerse(currentVerse - 1); break;
                case 'Escape': stopAudio(); setShowSettings(false); setShowVerseNav(false); setShowVersePicker(false); setShowSurahPicker(false); break;
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

    // Open tafseer modal for a specific verse
    const openTafseer = useCallback((verseNumber: number) => {
        setTafseerModalVerse(verseNumber);
    }, []);

    const closeTafseer = useCallback(() => {
        setTafseerModalVerse(null);
    }, []);

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

    const playVerse = useCallback((verseNumber: number, forcePlay = false) => {
        if (!audioEnabled && !forcePlay) return;
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
        // Reset progress display for new verse
        setAudioProgress(0);
        setAudioCurrentTime(0);
        setAudioDuration(0);
        audio.onplay = () => { if (isMountedRef.current && myPlaybackId === playbackIdRef.current) { setIsPlaying(true); setCurrentVerse(verseNumber); } };
        audio.onloadedmetadata = () => { if (isMountedRef.current && myPlaybackId === playbackIdRef.current) setAudioDuration(audio.duration || 0); };
        audio.ontimeupdate = () => {
            if (isMountedRef.current && myPlaybackId === playbackIdRef.current && audio.duration) {
                setAudioCurrentTime(audio.currentTime);
                setAudioProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        audio.onended = () => {
            if (!isMountedRef.current || myPlaybackId !== playbackIdRef.current) return;
            if (verseNumber < verses.length) playVerse(verseNumber + 1);
            else { setIsPlaying(false); setCurrentVerse(null); }
        };
        audio.onerror = () => { if (isMountedRef.current && myPlaybackId === playbackIdRef.current) { setIsPlaying(false); showToast('Audio failed to load', 'warning'); } };
        audio.play().catch(() => showToast('Could not play audio', 'warning'));
    }, [surahNumber, verses, selectedReciter, audioEnabled]);

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
        // In reading mode, switch to the page containing this verse first
        const pageIdx = verseToPageIndexRef.current.get(verseNumber);
        if (pageIdx !== undefined) {
            setMushafPageIndex(pageIdx);
            // Scroll after page renders
            setTimeout(() => {
                const el = document.getElementById(`verse-${verseNumber}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 80);
        } else {
            const el = document.getElementById(`verse-${verseNumber}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
                    <Link href="/" style={{ color: '#f59e0b' }}>← Go Home</Link>
                </div>
            </div>
        );
    }

    const displayVerses = (readingMode === 'word-by-word' || readingMode === 'reading') && versesWithWords.length > 0 ? versesWithWords : verses;

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
                .nq-scroll{flex:1;overflow-y:auto;padding:16px 16px 32px}
                @media(min-width:640px){.nq-scroll{padding:24px 24px 32px}}
                @media(min-width:1024px){.nq-scroll{padding:32px 48px 32px}}
                .nq-scroll.audio-on{padding-bottom:80px!important}
                @media(min-width:640px){.nq-scroll.audio-on{padding-bottom:80px!important}}
                @media(min-width:1024px){.nq-scroll.audio-on{padding-bottom:80px!important}}
                .nq-right{flex-shrink:0;border-left:1px solid #e2e8f0;background:white;display:none;flex-direction:column;overflow:hidden}
                @media(min-width:1280px){.nq-right{display:flex;width:256px}}
                .dark .nq-right{background:#0f172a;border-color:#1e293b}
                .nq-islamic{background-image:radial-gradient(circle at 2px 2px,rgba(245,158,11,0.05) 1px,transparent 0);background-size:24px 24px}
                /* Bismillah */
                .nq-bismillah{display:flex;flex-direction:column;align-items:center;margin-bottom:48px}
                .nq-bismillah-text{font-family:var(--rq-font-arabic);font-size:36px;color:#1e293b;padding:32px 0;opacity:0.9}
                .dark .nq-bismillah-text{color:#e2e8f0}
                .nq-bismillah-hr{width:128px;height:4px;background:linear-gradient(90deg,transparent,rgba(245,158,11,0.3),transparent);border:none;margin:0}
                /* Verse cards */
                .nq-ayah-card{position:relative;padding:16px;border-radius:16px;border:1px solid transparent;transition:all 0.3s;margin-bottom:32px}
                @media(min-width:640px){.nq-ayah-card{padding:24px;margin-bottom:48px}}
                .nq-ayah-card:hover{background:rgba(245,158,11,0.05);border-color:rgba(245,158,11,0.1)}
                .nq-ayah-card.nq-playing{background:rgba(245,158,11,0.05);border-color:rgba(245,158,11,0.25);box-shadow:0 2px 12px rgba(245,158,11,0.08)}
                .nq-active-accent{position:absolute;left:-3px;top:32px;width:6px;height:48px;background:#f59e0b;border-radius:3px}
                .nq-arabic-row{display:flex;flex-direction:row-reverse;align-items:flex-start;gap:12px;margin-bottom:0}
                @media(min-width:640px){.nq-arabic-row{gap:24px}}
                .nq-arabic-text{font-family:var(--rq-font-arabic);font-size:var(--nq-fs,26px);line-height:2;text-align:right;flex:1;color:#1e293b;direction:rtl}
                @media(min-width:640px){.nq-arabic-text{font-size:var(--nq-fs,36px)}}
                .dark .nq-arabic-text{color:#e2e8f0}
                .nq-shell .word-arabic,.nq-shell .reader-verse-arabic,.nq-shell .reader-bismillah-text,.nq-shell .nq-bismillah-text,.nq-shell .nq-arabic-text{font-family:'Naskh IndoPak',serif!important}
                .nq-verse-badge{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;border:1px solid rgba(245,158,11,0.4);font-size:12px;font-weight:700;color:#f59e0b;margin-right:6px;font-family:'Lexend',sans-serif;cursor:pointer;vertical-align:middle;transition:background 0.15s}
                @media(min-width:640px){.nq-verse-badge{width:40px;height:40px;font-size:14px;margin-right:8px}}
                .nq-verse-badge:hover{background:rgba(245,158,11,0.1)}
                .nq-playing .nq-verse-badge{border-color:#f59e0b;background:rgba(245,158,11,0.12)}
                .nq-translation-row{margin-top:14px;padding-left:12px;border-left:2px solid #e2e8f0;transition:border-color 0.2s}
                @media(min-width:640px){.nq-translation-row{margin-top:24px;padding-left:16px}}
                .nq-ayah-card:hover .nq-translation-row{border-color:rgba(245,158,11,0.3)}
                .nq-ayah-card.nq-playing .nq-translation-row{border-color:rgba(245,158,11,0.5)}
                .nq-translation-text{color:#475569;font-size:15px;line-height:1.8}
                @media(min-width:640px){.nq-translation-text{font-size:18px}}
                @media(max-width:639px){.nq-translation-row{padding-left:0;border-left:none;padding-top:12px;border-top:1px solid #e2e8f0;margin-top:12px}.nq-translation-text{text-align:center}}
                .dark .nq-translation-text{color:#94a3b8}
                .nq-ayah-card.nq-playing .nq-translation-text{color:#1e293b;font-weight:500}
                .dark .nq-ayah-card.nq-playing .nq-translation-text{color:#e2e8f0}
                /* Hover actions */
                .nq-actions{position:absolute;top:10px;right:10px;display:flex;gap:6px;opacity:0;transition:opacity 0.2s}
                @media(min-width:640px){.nq-actions{top:16px;right:16px;gap:8px}}
                .nq-ayah-card:hover .nq-actions{opacity:1}
                .nq-action-btn{padding:8px;background:white;border:none;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.08);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color 0.15s}
                .dark .nq-action-btn{background:#1e293b}
                .nq-action-btn:hover{color:#f59e0b}
                .nq-bookmarked{color:#f59e0b!important}
                .nq-active-btn{color:#f59e0b!important}
                /* Sidebar nav */
                .nq-nav-link{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;text-decoration:none;font-weight:500;font-size:14px;color:#64748b;transition:background 0.15s;white-space:nowrap}
                .nq-nav-link:hover{background:#f8fafc}
                .dark .nq-nav-link:hover{background:#1e293b}
                .nq-nav-link.active{background:rgba(245,158,11,0.1);color:#f59e0b;font-weight:600}
                @media(max-width:1023px){.nq-nav-label{display:none}}
                /* Header buttons */
                .nq-hdr-btn{padding:6px 8px;border:none;border-radius:8px;background:#f1f5f9;color:#64748b;cursor:pointer;display:flex;align-items:center;transition:all 0.15s;font-size:12px}
                @media(min-width:640px){.nq-hdr-btn{padding:8px 12px;font-size:13px}}
                .dark .nq-hdr-btn{background:#1e293b;color:#94a3b8}
                .nq-hdr-btn:hover{color:#f59e0b}
                .nq-hdr-toggle-group{display:none;align-items:center;background:#f1f5f9;border-radius:8px;padding:4px;gap:2px}
                @media(min-width:600px){.nq-hdr-toggle-group{display:flex}}
                .dark .nq-hdr-toggle-group{background:#1e293b}
                .nq-hdr-toggle{padding:4px 10px;border-radius:6px;border:none;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;background:transparent;color:#64748b}
                @media(min-width:768px){.nq-hdr-toggle{padding:4px 12px;font-size:12px}}
                .nq-hdr-toggle.active{background:white;color:#0f172a;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
                .dark .nq-hdr-toggle.active{background:#0f172a;color:white}
                .nq-bkmk-btn{width:34px;height:34px;background:#f59e0b;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;cursor:pointer;box-shadow:0 4px 14px rgba(245,158,11,0.3);flex-shrink:0}
                @media(min-width:640px){.nq-bkmk-btn{width:40px;height:40px}}
                /* Audio bar - Spotify-style dark 3-column bar */
                .nq-audio-bar{
                  position:fixed;bottom:0;left:0;right:0;
                  height:72px;
                  background:#121212;
                  border-top:1px solid rgba(255,255,255,0.08);
                  z-index:9990;
                  display:grid;
                  grid-template-columns:1fr 2fr 1fr;
                  align-items:center;
                  padding:0 16px;
                  gap:8px;
                  animation:audioBarIn 0.25s ease-out;
                  font-family:'Figtree','Inter',sans-serif;
                }
                @keyframes audioBarIn{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
                @media(max-width:520px){
                  .nq-audio-bar{grid-template-columns:auto 1fr auto;height:64px;padding:0 10px}
                }

                /* Left column */
                .nq-ab-left{display:flex;align-items:center;gap:12px;min-width:0;overflow:hidden}
                .nq-ab-art{
                  width:48px;height:48px;flex-shrink:0;border-radius:6px;
                  background:linear-gradient(135deg,#f59e0b,#d97706);
                  display:flex;align-items:center;justify-content:center;
                  box-shadow:0 4px 12px rgba(245,158,11,0.25);
                  font-family:'Naskh IndoPak',serif;font-size:20px;color:white;font-weight:700;
                }
                .nq-ab-art-num{font-family:'Figtree','Inter',sans-serif;font-size:14px;font-weight:700;color:rgba(255,255,255,0.9)}
                .nq-ab-track{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
                .nq-ab-track-name{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .nq-ab-track-artist{font-size:11px;color:#b3b3b3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .nq-ab-like-btn{
                  width:28px;height:28px;background:none;border:none;cursor:pointer;
                  color:#b3b3b3;display:flex;align-items:center;justify-content:center;flex-shrink:0;
                  transition:color 0.15s;
                }
                .nq-ab-like-btn.liked{color:#f59e0b}
                .nq-ab-like-btn:hover{color:#fff}

                /* Center column */
                .nq-ab-center{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0}
                .nq-ab-controls{display:flex;align-items:center;gap:8px}
                .nq-ab-ctrl{
                  background:none;border:none;cursor:pointer;
                  color:#b3b3b3;display:flex;align-items:center;justify-content:center;
                  width:28px;height:28px;border-radius:50%;
                  transition:color 0.15s;position:relative;
                }
                .nq-ab-ctrl:hover{color:#fff}
                .nq-ab-ctrl.active{color:#f59e0b}
                .nq-ab-ctrl.active::after{content:'';position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:#f59e0b}
                .nq-ab-play{
                  width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;
                  background:#ffffff;
                  display:flex;align-items:center;justify-content:center;
                  transition:transform 0.1s,background 0.15s;
                  flex-shrink:0;
                }
                .nq-ab-play svg{fill:#000;width:16px;height:16px}
                .nq-ab-play:hover{transform:scale(1.06);background:#e0e0e0}
                .nq-ab-play:active{transform:scale(0.95)}
                /* Progress bar row */
                .nq-ab-progress{display:flex;align-items:center;gap:6px;width:100%}
                .nq-ab-time{font-size:10px;color:#6a6a6a;min-width:36px;font-variant-numeric:tabular-nums;white-space:nowrap}
                .nq-ab-time:first-child{text-align:right}
                .nq-ab-bar-wrap{flex:1;height:12px;display:flex;align-items:center;cursor:pointer;position:relative}
                .nq-ab-bar{width:100%;height:4px;background:rgba(255,255,255,0.12);border-radius:2px;position:relative;overflow:visible}
                .nq-ab-bar-wrap:hover .nq-ab-bar{height:5px}
                .nq-ab-fill{height:100%;background:#fff;border-radius:2px;position:relative;transition:width 100ms linear}
                .nq-ab-bar-wrap:hover .nq-ab-fill{background:#f59e0b}
                .nq-ab-knob{width:12px;height:12px;border-radius:50%;background:#fff;position:absolute;right:-6px;top:50%;transform:translateY(-50%);opacity:0;box-shadow:0 2px 4px rgba(0,0,0,0.5);transition:opacity 0.1s}
                .nq-ab-bar-wrap:hover .nq-ab-knob{opacity:1}

                /* Right column */
                .nq-ab-right{display:flex;align-items:center;gap:4px;justify-content:flex-end}
                .nq-ab-vol-wrap{width:80px;height:12px;display:flex;align-items:center;cursor:pointer;position:relative}
                .nq-ab-vol-bar{width:100%;height:4px;background:rgba(255,255,255,0.12);border-radius:2px;position:relative;overflow:visible}
                .nq-ab-vol-fill{height:100%;background:#fff;border-radius:2px;position:relative;transition:width 100ms ease}
                .nq-ab-vol-wrap:hover .nq-ab-vol-fill{background:#f59e0b}
                .nq-ab-vol-knob{width:12px;height:12px;border-radius:50%;background:#fff;position:absolute;right:-6px;top:50%;transform:translateY(-50%);opacity:0;box-shadow:0 2px 4px rgba(0,0,0,0.5)}
                .nq-ab-vol-wrap:hover .nq-ab-vol-knob{opacity:1}
                .nq-ab-close{width:26px;height:26px;background:rgba(255,255,255,0.08);border:none;border-radius:50%;cursor:pointer;color:#b3b3b3;display:flex;align-items:center;justify-content:center;transition:background 0.15s,color 0.15s;flex-shrink:0}
                .nq-ab-close:hover{background:rgba(239,68,68,0.2);color:#ef4444}

                /* Use larger padding to clear the bar */
                .nq-scroll.audio-on{padding-bottom:90px!important}
                .nq-scroll.audio-off{padding-bottom:32px}
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
                /* scrollbar — hidden everywhere */
                .nq-shell,.nq-shell *{scrollbar-width:none;-ms-overflow-style:none}
                .nq-shell::-webkit-scrollbar,.nq-shell *::-webkit-scrollbar{display:none}
                .wdm-sheet{scrollbar-width:none;-ms-overflow-style:none}
                .wdm-sheet::-webkit-scrollbar{display:none}
                /* Mode tabs row */
                .nq-tabs-row{display:flex;align-items:center;background:rgba(255,255,255,0.8);border-bottom:1px solid #e2e8f0;height:44px;flex-shrink:0;min-width:0}
                @media(min-width:640px){.nq-tabs-row{height:48px}}
                .dark .nq-tabs-row{background:rgba(15,23,42,0.8);border-color:#1e293b}
                .nq-mode-tabs{display:flex;gap:4px;padding:0 8px 0 16px;flex:1;min-width:0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;align-items:center;height:100%}
                .nq-mode-tabs::-webkit-scrollbar{display:none}
                @media(min-width:640px){.nq-mode-tabs{padding:0 8px 0 24px}}
                @media(min-width:1024px){.nq-mode-tabs{padding:0 8px 0 32px}}
                .nq-mode-tab{padding:5px 12px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;background:transparent;color:#64748b;font-family:'Lexend',sans-serif;white-space:nowrap;flex-shrink:0}
                @media(min-width:640px){.nq-mode-tab{padding:6px 16px;font-size:13px}}
                .nq-mode-tab.active{background:#f59e0b;color:white}
                    .nq-header-title{margin:0;font-size:14px;font-weight:700;color:#0f172a;display:flex;align-items:baseline;gap:5px;white-space:nowrap;overflow:hidden;min-width:0}
                    @media(min-width:640px){.nq-header-title{font-size:17px;gap:7px}}
                    @media(min-width:1024px){.nq-header-title{font-size:20px;gap:8px}}
                    .nq-header-subtitle{font-size:11px;font-weight:400;color:#94a3b8;flex-shrink:0}
                    @media(min-width:480px){.nq-header-subtitle{font-size:13px}}
                    .dark .nq-header-title{color:#e2e8f0}
                    /* Audio toggle (legacy - kept for settings panel compat) */
                    .nq-audio-toggle{display:flex;align-items:center;gap:8px;flex-shrink:0}
                    .nq-audio-toggle-label{font-size:11px;font-weight:600;color:#94a3b8;white-space:nowrap;font-family:'Lexend',sans-serif;text-transform:uppercase;letter-spacing:0.06em}
                    .nq-audio-toggle-pill{position:relative;width:38px;height:22px;border-radius:11px;cursor:pointer;transition:background 0.22s;flex-shrink:0;border:none;padding:0}
                    .nq-audio-toggle-pill.on{background:#f59e0b}
                    .nq-audio-toggle-pill.off{background:#94a3b8}
                    .nq-audio-toggle-pill-thumb{position:absolute;top:3px;width:16px;height:16px;border-radius:50%;background:white;transition:left 0.22s;box-shadow:0 1px 3px rgba(0,0,0,0.2)}
                    .nq-audio-toggle-pill.on .nq-audio-toggle-pill-thumb{left:19px}
                    .nq-audio-toggle-pill.off .nq-audio-toggle-pill-thumb{left:3px}
                    /* Tafsir panel */
                    .nq-tafsir-panel{margin-top:16px;border-radius:12px;border:1px solid rgba(245,158,11,0.2);background:rgba(245,158,11,0.03);overflow:hidden;animation:fadeIn 0.2s ease-out}
                    @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
                    .nq-tafsir-header{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(245,158,11,0.08);border-bottom:1px solid rgba(245,158,11,0.15);font-size:12px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.06em;font-family:'Lexend',sans-serif}
                    .nq-tafsir-text{margin:0;padding:14px 16px;font-size:14px;line-height:1.85;color:#334155;max-height:320px;overflow-y:auto;font-family:'Inter','Lexend',sans-serif}
                    .dark .nq-tafsir-text{color:#94a3b8}
                    .nq-tafsir-loading{display:flex;align-items:center;gap:10px;padding:16px;font-size:13px;color:#64748b;font-family:'Lexend',sans-serif}
                    .nq-tafsir-text::-webkit-scrollbar{width:4px}
                    .nq-tafsir-text::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.3);border-radius:2px}
                    /* === IMPROVED TRANSLATION MODE === */
                    .nq-ayah-card{margin-bottom:0!important}
                    .nq-verse-meta-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
                    .nq-verse-ref-tag{font-size:11px;font-weight:700;color:#94a3b8;font-family:'Lexend','Inter',sans-serif;letter-spacing:0.05em;padding:3px 10px;background:#f1f5f9;border-radius:99px;border:1px solid #e2e8f0}
                    .dark .nq-verse-ref-tag{background:#1e293b;border-color:#334155;color:#64748b}
                    .nq-inline-play-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 13px;background:rgba(245,158,11,0.08);border:1.5px solid rgba(245,158,11,0.25);border-radius:99px;color:#f59e0b;cursor:pointer;font-size:11px;font-weight:700;font-family:'Lexend',sans-serif;transition:all 0.2s;letter-spacing:0.02em}
                    .nq-inline-play-btn:hover{background:rgba(245,158,11,0.15);border-color:rgba(245,158,11,0.5);box-shadow:0 2px 8px rgba(245,158,11,0.15)}
                    .nq-ayah-card.nq-playing .nq-inline-play-btn{background:rgba(245,158,11,0.15);border-color:#f59e0b}
                    .nq-ayah-end-marker{cursor:pointer;display:inline-block;vertical-align:middle;margin:0 2px;transition:opacity 0.15s}
                    .nq-ayah-end-marker:hover{opacity:0.7}
                    .nq-translation-row{margin-top:20px;padding:14px 18px;background:#f8fafc;border:1px solid #f1f5f9;border-left:3px solid rgba(245,158,11,0.5);border-radius:0 10px 10px 0;transition:border-left-color 0.2s,background 0.2s}
                    @media(min-width:640px){.nq-translation-row{margin-top:24px;padding:16px 20px}}
                    .dark .nq-translation-row{background:rgba(30,41,59,0.5);border-color:#1e293b;border-left-color:rgba(245,158,11,0.4)}
                    .nq-ayah-card:hover .nq-translation-row{border-left-color:rgba(245,158,11,0.6);background:rgba(245,158,11,0.02)}
                    .nq-ayah-card.nq-playing .nq-translation-row{border-left-color:#f59e0b;background:rgba(245,158,11,0.05)}
                    .nq-translation-text{color:#334155;font-size:15px;line-height:1.9;margin:0}
                    @media(min-width:640px){.nq-translation-text{font-size:17px;line-height:2.0}}
                    @media(max-width:639px){.nq-translation-row{padding:10px 0;border-left:none;border-top:1px solid rgba(245,158,11,0.2);border-radius:0;background:transparent}.nq-translation-text{text-align:center}}
                    .dark .nq-translation-text{color:#94a3b8}
                    .nq-actions-bar{display:flex;align-items:center;gap:6px;margin-top:16px;padding-top:12px;border-top:1px solid #f1f5f9;flex-wrap:wrap}
                    @media(min-width:640px){.nq-actions-bar{gap:8px;margin-top:20px;padding-top:14px}}
                    .dark .nq-actions-bar{border-top-color:#1e293b}
                    .nq-bar-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;color:#64748b;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:'Lexend',sans-serif;white-space:nowrap}
                    @media(min-width:640px){.nq-bar-btn{padding:8px 14px}}
                    .dark .nq-bar-btn{background:#1e293b;border-color:#334155;color:#94a3b8}
                    .nq-bar-btn:hover{background:rgba(245,158,11,0.08);border-color:rgba(245,158,11,0.3);color:#f59e0b}
                                        .nq-bar-btn.nq-bar-active{color:#f59e0b;background:rgba(245,158,11,0.08);border-color:rgba(245,158,11,0.3)}
                    
                    /* Premium Audio Entry Button */
                    .nq-audio-entry-btn {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 12px;
                        background: rgba(245,158,11,0.08);
                        border: 1.5px solid rgba(245,158,11,0.2);
                        border-radius: 99px;
                        cursor: pointer;
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                    }
                    .nq-audio-entry-btn:hover {
                        background: rgba(245,158,11,0.15);
                        border-color: rgba(245,158,11,0.4);
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(245,158,11,0.12);
                    }
                    .nq-audio-entry-btn.active {
                        background: #f59e0b;
                        border-color: #f59e0b;
                        box-shadow: 0 4px 15px rgba(245,158,11,0.3);
                    }
                    .nq-audio-entry-btn .nq-btn-icon {
                        font-size: 20px;
                        transition: transform 0.3s ease;
                    }
                    .nq-audio-entry-btn.active .nq-btn-icon {
                        color: white !important;
                        transform: scale(1.1);
                    }
                    .nq-audio-entry-btn .nq-btn-text {
                        font-size: 13px;
                        font-weight: 700;
                        font-family: 'Lexend', sans-serif;
                        color: #92400e;
                        transition: color 0.25s;
                    }
                    .nq-audio-entry-btn.active .nq-btn-text {
                        color: white;
                    }
                    .nq-audio-entry-btn:active {
                        transform: scale(0.96);
                    }
                    .nq-ayah-sep{display:flex;align-items:center;gap:16px;padding:6px 0}
                    .nq-sep-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(100,116,139,0.15) 20%,rgba(100,116,139,0.2) 50%,rgba(100,116,139,0.15) 80%,transparent)}
                    .nq-sep-icon{font-size:14px;color:rgba(245,158,11,0.45);flex-shrink:0;line-height:1;font-family:'Traditional Arabic','Scheherazade New','Amiri',serif;user-select:none}
                    .nq-surah-header{text-align:center;margin-bottom:32px;padding:24px 16px 20px;border-bottom:1px solid rgba(245,158,11,0.1)}
                    .nq-surah-header-arabic{font-family:var(--rq-font-arabic);color:#1e293b;font-weight:700;line-height:1.6;display:block}
                    .dark .nq-surah-header-arabic{color:#e2e8f0}
                    .nq-surah-header-sub{font-size:13px;color:#64748b;margin-top:6px;font-weight:500;font-family:'Lexend',sans-serif}
                    .nq-bismillah-header{text-align:center;margin-bottom:32px;font-family:var(--rq-font-arabic);color:#1e293b;line-height:2;opacity:0.9}
                    .dark .nq-bismillah-header{color:#e2e8f0}
                    @media(max-width:479px){.nq-bar-btn span{display:none}.nq-inline-play-btn span{display:none}}
                `}</style>

            <div className="nq-shell">
                {/* SIDEBAR */}
                <aside className="nq-sidebar">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 12px' }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
                            <div style={{ background: 'rgba(245,158,11,0.15)', borderRadius: 10, padding: 8, flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: 26 }}>auto_stories</span>
                            </div>
                            <div className="nq-nav-label">
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a', lineHeight: 1 }}>Learn Quran</p>
                                <p style={{ margin: 0, color: '#f59e0b', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Learning Hub</p>
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
                            <Link href="/signup" className="nq-nav-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '7px 0', borderRadius: 8, textDecoration: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em' }}>
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
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f59e0b'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}>
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <div style={{ position: 'relative' }}>
                                    <h2 className="nq-header-title">
                                        {chapter.name_simple}
                                        <span className="nq-header-subtitle">
                                            {chapter.translated_name.name} • {chapter.verses_count} Verses
                                        </span>
                                    </h2>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Surah picker button */}
                            <button
                                ref={surahBtnRef}
                                onClick={() => { setShowSurahPicker(!showSurahPicker); setShowVersePicker(false); }}
                                className="nq-hdr-btn"
                                style={{ gap: 6, display: 'flex', alignItems: 'center', padding: '6px 12px' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>menu_book</span>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Surah</span>
                                <ChevronDown size={14} />
                            </button>
                            {/* Verse picker button */}
                            <button
                                ref={verseBtnRef}
                                onClick={() => { setShowVersePicker(!showVersePicker); setShowSurahPicker(false); }}
                                className="nq-hdr-btn"
                                style={{ gap: 6, display: 'flex', alignItems: 'center', padding: '6px 12px' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>format_list_numbered</span>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Verse</span>
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

                    {/* Mode tabs + Sound Toggle */}
                    <div className="nq-tabs-row">
                        <div className="nq-mode-tabs">
                            {(['reading', 'translation', 'word-by-word'] as ReadingMode[]).map(m => (
                                <button key={m} className={`nq-mode-tab ${readingMode === m ? 'active' : ''}`} onClick={() => setReadingMode(m)}>
                                    {m === 'word-by-word' ? 'Word by Word' : m.charAt(0).toUpperCase() + m.slice(1)}
                                </button>
                            ))}
                        </div>
                        {/* Sound Toggle — hidden in word-by-word mode */}
                        {readingMode !== 'word-by-word' && (
                        <div className="nq-sound-toggle-wrap">
                            <button 
                                className={`nq-audio-entry-btn ${audioEnabled ? 'active' : ''}`}
                                onClick={() => {
                                    if (audioEnabled) stopAudio();
                                    setAudioEnabled(!audioEnabled);
                                }}
                                title={audioEnabled ? "Close Audio Player" : "Open Audio Player"}
                            >
                                <span className="material-symbols-outlined nq-btn-icon" style={{ color: audioEnabled ? 'white' : '#f59e0b' }}>
                                    {audioEnabled ? 'volume_up' : 'headphones'}
                                </span>
                                <span className="nq-btn-text">{audioEnabled ? 'Playing' : 'Audio'}</span>
                            </button>
                        </div>
                        )}
                    </div>

                    {/* Content area */}
                    <div className="nq-content">
                        {/* Scrollable verse area */}
                        <div className={`nq-scroll nq-islamic ${audioEnabled ? 'audio-on' : 'audio-off'}`} style={{ '--nq-fs': `${fontSize}px` } as React.CSSProperties}>

                            {/* Verses */}
                            <div style={{ maxWidth: 896, margin: '0 auto' }}>
                                {readingMode === 'reading' ? (
                                    (() => {
                                        // Keep all verses – the Bismillah prefix is already shown
                                        // separately and renderVerseWords() strips it from verse 1 text.
                                        const versesToRender = displayVerses;
                                        const pageGroups: { pageNumber: number; juzNumber: number; verses: typeof versesToRender }[] = [];
                                        for (const verse of versesToRender) {
                                            const pn = verse.page_number || 1;
                                            const last = pageGroups[pageGroups.length - 1];
                                            if (last && last.pageNumber === pn) {
                                                last.verses.push(verse);
                                            } else {
                                                pageGroups.push({ pageNumber: pn, juzNumber: verse.juz_number || 1, verses: [verse] });
                                            }
                                        }



                                        const ayahSize = isMobile ? Math.max(20, Math.round(fontSize * 0.72)) : Math.max(26, Math.round(fontSize * 0.95));
                                        const surahInfo = ALL_SURAHS.find(s => s.number === surahNumber);

                                        // Clamp page index
                                        const totalPages = pageGroups.length;
                                        const safePageIndex = Math.max(0, Math.min(mushafPageIndex, totalPages - 1));
                                        const group = pageGroups[safePageIndex];
                                        const groupIdx = safePageIndex;

                                        // Build verse→page map for jumpToVerse
                                        const newMap = new Map<number, number>();
                                        pageGroups.forEach((g, idx) => g.verses.forEach(v => newMap.set(v.verse_number, idx)));
                                        verseToPageIndexRef.current = newMap;

                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
                                                {/* Page indicator */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 12,
                                                    padding: '8px 0',
                                                }}>
                                                    <span style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: '#64748b',
                                                        fontFamily: "'Inter', 'Lexend', sans-serif",
                                                    }}>
                                                        Page {safePageIndex + 1} of {totalPages}
                                                    </span>
                                                </div>

                                                {group && (
                                                    <div key={group.pageNumber}>
                                                        {/* ===== MUSHAF PAGE FRAME ===== */}
                                                        <div style={{
                                                            background: '#f6f8f6',
                                                            border: '1.5px solid rgba(245,158,11,0.18)',
                                                            borderRadius: 8,
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                        }}>
                                                            {/* Juz Header */}
                                                            {groupIdx === 0 && (
                                                                <div style={{
                                                                    textAlign: 'center',
                                                                    padding: isMobile ? '10px 8px' : '14px 16px',
                                                                    borderBottom: '1.5px solid rgba(245,158,11,0.15)',
                                                                    background: 'rgba(245,158,11,0.06)',
                                                                }}>
                                                                    <span style={{
                                                                        fontFamily: "'Naskh IndoPak', 'KFGQPC Uthmanic Script HAFS Regular', 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif",
                                                                        fontSize: isMobile ? 20 : 28,
                                                                        color: '#1e293b',
                                                                        fontWeight: 700,
                                                                        fontFeatureSettings: '"liga" 1, "calt" 1',
                                                                    }}>
                                                                        جُزْءٌ - {toArabicNumeral(group.juzNumber)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Surah Title Header */}
                                                            {groupIdx === 0 && (
                                                                <div style={{
                                                                    textAlign: 'center',
                                                                    padding: isMobile ? '14px 8px' : '18px 16px',
                                                                    borderBottom: '1px solid rgba(245,158,11,0.12)',
                                                                    background: 'rgba(245,158,11,0.03)',
                                                                }}>
                                                                    <div style={{
                                                                        fontFamily: "'Naskh IndoPak', 'KFGQPC Uthmanic Script HAFS Regular', 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif",
                                                                        fontSize: isMobile ? 24 : 36,
                                                                        fontWeight: 700,
                                                                        color: '#1e293b',
                                                                        lineHeight: 1.5,
                                                                        fontFeatureSettings: '"liga" 1, "calt" 1',
                                                                    }}>
                                                                        سُورَةُ {chapter.name_arabic}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Bismillah - for surahs with bismillah_pre (except Surah 9) */}
                                                            {groupIdx === 0 && chapter.bismillah_pre && surahNumber !== 1 && (
                                                                <div style={{
                                                                    textAlign: 'center',
                                                                    padding: isMobile ? '14px 12px' : '20px 24px',
                                                                    borderBottom: '1px solid rgba(245,158,11,0.12)',
                                                                }}>
                                                                    <span style={{
                                                                        fontFamily: "'Naskh IndoPak', 'KFGQPC Uthmanic Script HAFS Regular', 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif",
                                                                        fontSize: isMobile ? Math.round(fontSize * 0.82) : Math.round(fontSize * 1.05),
                                                                        color: '#1e293b',
                                                                        lineHeight: 1.8,
                                                                        fontFeatureSettings: '"liga" 1, "calt" 1',
                                                                        textRendering: 'optimizeLegibility',
                                                                    }}>
                                                                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* ===== VERSE CONTENT AREA ===== */}
                                                            <div style={{
                                                                padding: isMobile ? '16px 10px' : '28px 32px',
                                                            }}>
                                                                <div style={{
                                                                    fontFamily: "'Naskh IndoPak', 'KFGQPC Uthmanic Script HAFS Regular', 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif",
                                                                    fontSize: isMobile ? `${Math.round(fontSize * 0.78)}px` : `${fontSize}px`,
                                                                    lineHeight: isMobile ? 2.0 : 2.4,
                                                                    textAlign: 'center',
                                                                    direction: 'rtl' as const,
                                                                    color: '#1e293b',
                                                                    margin: 0,
                                                                    fontFeatureSettings: '"liga" 1, "calt" 1',
                                                                    textRendering: 'optimizeLegibility',
                                                                    wordSpacing: 'normal',
                                                                    letterSpacing: '-0.01em',
                                                                    WebkitFontSmoothing: 'antialiased',
                                                                }}>
                                                                    {group.verses.map((verse) => {
                                                                        const rawText = verse.text_indopak || verse.text_uthmani || '';
                                                                        const displayText = cleanIndopakText(
                                                                            verse.verse_number === 1 && chapter.bismillah_pre && surahNumber !== 1
                                                                                ? removeBismillah(rawText)
                                                                                : rawText
                                                                        );
                                                                        if (!displayText.trim()) return null;
                                                                        const isActive = currentVerse === verse.verse_number;
                                                                        const showRuku = isRukuEnd(verse, displayVerses);

                                                                        return (
                                                                            <span key={verse.id}>
                                                                                <span
                                                                                    style={{
                                                                                        cursor: 'pointer',
                                                                                        borderRadius: 3,
                                                                                        transition: 'background 0.15s',
                                                                                        background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                                                                                    }}
                                                                                    onClick={() => playVerse(verse.verse_number)}
                                                                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = isActive ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.06)'; }}
                                                                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isActive ? 'rgba(245,158,11,0.12)' : 'transparent'; }}
                                                                                >
                                                                                    {displayText}
                                                                                </span>
                                                                                {' '}
                                                                                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', gap: 0 }}>
                                                                                    {showRuku && (
                                                                                        <span style={{ fontSize: Math.round(ayahSize * 0.55), fontFamily: "'Naskh IndoPak', 'Scheherazade New', 'Amiri', serif", color: '#1e293b', fontWeight: 700, lineHeight: 1, userSelect: 'none' }} aria-label={`End of Ruku ${verse.ruku_number}`}>ع</span>
                                                                                    )}
                                                                                    <span style={{ cursor: 'pointer', lineHeight: 1 }} onClick={() => playVerse(verse.verse_number)}>
                                                                                        <AyahMarker number={verse.verse_number} size={ayahSize} />
                                                                                    </span>
                                                                                </span>
                                                                                {' '}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* ===== PAGE FOOTER ===== */}
                                                            <div style={{
                                                                textAlign: 'center',
                                                                padding: isMobile ? '10px 8px' : '14px 16px',
                                                                borderTop: '1.5px solid rgba(245,158,11,0.15)',
                                                                background: 'rgba(245,158,11,0.06)',
                                                                fontFamily: "'Inter', 'Lexend', sans-serif",
                                                                fontSize: isMobile ? 11 : 13,
                                                                color: '#475569',
                                                                fontWeight: 500,
                                                                letterSpacing: '0.02em',
                                                            }}>
                                                                Surah {surahNumber}. {surahInfo?.name || chapter.name_simple} ({surahInfo?.translation || chapter.translated_name.name}) - Page {group.pageNumber} - Juz {group.juzNumber}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Prev / Next Page Buttons */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 12,
                                                    marginTop: 8,
                                                }}>
                                                    {safePageIndex > 0 ? (
                                                        <button
                                                            onClick={() => { setMushafPageIndex(safePageIndex - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 8,
                                                                padding: isMobile ? '12px 18px' : '14px 24px',
                                                                background: 'white', border: '1.5px solid rgba(245,158,11,0.2)',
                                                                borderRadius: 10, color: '#1e293b', fontSize: 14, fontWeight: 600,
                                                                fontFamily: "'Inter', 'Lexend', sans-serif", cursor: 'pointer',
                                                                transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}
                                                        >
                                                            <ChevronLeft size={18} />
                                                            <span>Previous Page</span>
                                                        </button>
                                                    ) : <div />}

                                                    {safePageIndex < totalPages - 1 ? (
                                                        <button
                                                            onClick={() => { setMushafPageIndex(safePageIndex + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 8,
                                                                padding: isMobile ? '12px 18px' : '14px 24px',
                                                                background: 'linear-gradient(135deg, #f59e0b, #f59e0b)', border: 'none',
                                                                borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600,
                                                                fontFamily: "'Inter', 'Lexend', sans-serif", cursor: 'pointer',
                                                                transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
                                                        >
                                                            <span>Next Page</span>
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    ) : (
                                                        // Last page — show next surah link
                                                        surahNumber < 114 ? (
                                                            <Link href={`/read-quran/${surahNumber + 1}?mode=reading`} style={{
                                                                display: 'flex', alignItems: 'center', gap: 8,
                                                                padding: isMobile ? '12px 18px' : '14px 24px',
                                                                background: 'linear-gradient(135deg, #f59e0b, #f59e0b)', border: 'none',
                                                                borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600,
                                                                fontFamily: "'Inter', 'Lexend', sans-serif", textDecoration: 'none',
                                                                transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
                                                            }}>
                                                                <span>Next Surah</span>
                                                                <ChevronRight size={18} />
                                                            </Link>
                                                        ) : <div />
                                                    )}
                                                </div>

                                                {/* Previous Surah link at start */}
                                                {safePageIndex === 0 && surahNumber > 1 && (
                                                    <div style={{ textAlign: 'center', paddingBottom: 8 }}>
                                                        <Link href={`/read-quran/${surahNumber - 1}?mode=reading`} style={{
                                                            fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500,
                                                            fontFamily: "'Inter', 'Lexend', sans-serif",
                                                        }}>
                                                            ← Previous Surah
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()

                                ) : readingMode === 'word-by-word' ? (
                                    <div className="wbw-clean">
                                        {wordDataLoading ? (
                                            <div className="reader-loading"><div className="reader-spinner" /><p className="reader-loading-text">Loading word data…</p></div>
                                        ) : displayVerses.map((verse) => (
                                            <div key={verse.id} id={`verse-${verse.verse_number}`} className="wbw-verse">
                                                {/* Tiny verse number */}
                                                <span className="wbw-vnum">{verse.verse_number}</span>
                                                {/* Words */}
                                                <div className="reader-verse-words">
                                                    {verse.words && verse.words.length > 0 ? (
                                                        verse.words.filter((w: any) => w.char_type_name !== 'end').map((word: any, idx: number) => (
                                                            <div
                                                                key={word.id || idx}
                                                                className={`word-item ${selectedWord?.location === (word.location || `${verse.verse_key}:${word.position}`) ? 'word-selected' : ''}`}
                                                                onClick={() => openWordDetail(word, verse.verse_key, verse.words)}
                                                            >
                                                                <span className="word-arabic">{cleanIndopakText(word.text_indopak ?? word.text_uthmani)}</span>
                                                                {word.translation?.text && <span className="word-translation">{word.translation.text}</span>}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="reader-verse-arabic">{verse.verse_number === 1 && chapter.bismillah_pre ? cleanIndopakText(removeBismillah(verse.text_indopak ?? verse.text_uthmani)) : cleanIndopakText(verse.text_indopak ?? verse.text_uthmani)}</div>
                                                    )}
                                                </div>
                                                {/* Translation */}
                                                {showTranslation && <p className="wbw-translation">{parseTranslationWithFootnotes(verse.translations?.[0]?.text || '')}</p>}
                                            </div>
                                        ))}
                                        {/* Surah navigation */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                                            {surahNumber > 1 ? <Link href={`/read-quran/${surahNumber - 1}?mode=word-by-word`} className="reader-nav-btn"><ChevronLeft size={18} /><span>Previous Surah</span></Link> : <div />}
                                            {surahNumber < 114 && <Link href={`/read-quran/${surahNumber + 1}?mode=word-by-word`} className="reader-nav-btn primary"><span>Next Surah</span><ChevronRight size={18} /></Link>}
                                        </div>
                                    </div>
                                ) : (
                                    // Translation mode — improved card design
                                    <div>
                                        {/* Surah title header */}
                                        <div className="nq-surah-header">
                                            <span className="nq-surah-header-arabic" style={{ fontSize: isMobile ? 28 : 42 }}>{chapter.name_arabic}</span>
                                            <p className="nq-surah-header-sub">{chapter.translated_name.name} &bull; {chapter.verses_count} Verses</p>
                                        </div>
                                        {/* Bismillah */}
                                        {chapter.bismillah_pre && surahNumber !== 9 && (
                                            <div className="nq-bismillah-header" style={{ fontSize: isMobile ? 22 : 32, marginBottom: 36 }}>
                                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                            </div>
                                        )}
                                        {verses.map((verse, idx) => (
                                            <div key={verse.id}>
                                                <div id={`verse-${verse.verse_number}`} className={`nq-ayah-card ${currentVerse === verse.verse_number ? 'nq-playing' : ''}`}>
                                                    {currentVerse === verse.verse_number && <div className="nq-active-accent" />}
                                                    {/* Verse meta row: reference pill + play button */}
                                                    <div className="nq-verse-meta-row">
                                                        <span className="nq-verse-ref-tag">{verse.verse_key}</span>
                                                        <button className="nq-inline-play-btn" onClick={() => playVerse(verse.verse_number)} title={`Play verse ${verse.verse_number}`}>
                                                            <Volume2 size={13} />
                                                            <span>Play</span>
                                                        </button>
                                                    </div>
                                                    {/* Arabic text with ayah marker at end */}
                                                    <div className="nq-arabic-row">
                                                        <span className="nq-arabic-text">
                                                            {verse.verse_number === 1 && chapter.bismillah_pre ? cleanIndopakText(removeBismillah(verse.text_indopak ?? verse.text_uthmani)) : cleanIndopakText(verse.text_indopak ?? verse.text_uthmani)}
                                                            {' '}
                                                            <span className="nq-ayah-end-marker-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                                                                <span className="nq-ayah-end-marker" onClick={() => playVerse(verse.verse_number)}>
                                                                    <AyahMarker number={verse.verse_number} size={isMobile ? 26 : 32} />
                                                                </span>
                                                                {isRukuEnd(verse, verses) && (
                                                                    <RukuEndMarker ruküNumber={verse.ruku_number} />
                                                                )}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    {/* Translation */}
                                                    {showTranslation && (
                                                        <div className="nq-translation-row">
                                                            <p className="nq-translation-text">{parseTranslationWithFootnotes(verse.translations?.[0]?.text || 'Translation not available')}</p>
                                                        </div>
                                                    )}
                                                    {/* Bottom action bar — share is here below */}
                                                    <div className="nq-actions-bar">
                                                        <button className="nq-bar-btn" onClick={() => copyVerse(verse)} title="Copy"><Copy size={13} /><span>Copy</span></button>
                                                        <button className={`nq-bar-btn ${bookmarks.includes(verse.verse_key) ? 'nq-bar-active' : ''}`} onClick={() => toggleBookmark(verse.verse_key)} title="Bookmark"><Bookmark size={13} /><span>{bookmarks.includes(verse.verse_key) ? 'Saved' : 'Save'}</span></button>
                                                        <button className="nq-bar-btn" onClick={() => shareVerse(verse)} title="Share"><Share2 size={13} /><span>Share</span></button>
                                                        <button className={`nq-bar-btn ${tafseerModalVerse === verse.verse_number ? 'nq-bar-active' : ''}`} onClick={() => openTafseer(verse.verse_number)} title="Tafsir"><BookOpen size={13} /><span>Tafsir</span></button>
                                                    </div>
                                                </div>
                                                {/* After the card: simple decorative separator */}
                                                {idx < verses.length - 1 && (
                                                    <div className="nq-ayah-sep">
                                                        <div className="nq-sep-line" />
                                                        <span className="nq-sep-icon">۞</span>
                                                        <div className="nq-sep-line" />
                                                    </div>
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

                    {/* COMPACT AUDIO BAR — Simple & Sober premium design */}
                    {audioEnabled && readingMode !== 'word-by-word' && (
                        <div className="nq-audio-bar nq-audio-bar--compact">
                            {/* Left Side: Thumbnail & Info */}
                            <div className="nq-ab-left">
                                <div className="nq-ab-art nq-ab-art--green">
                                    <span className="nq-ab-art-text">Al-<br/>Fatihah</span>
                                </div>
                                <div className="nq-ab-track">
                                    <span className="nq-ab-track-title">Surah {chapter.name_simple}</span>
                                    <span className="nq-ab-track-artist">
                                        {POPULAR_RECITERS.find(r => r.id === selectedReciter)?.name ?? 'Reciter'}
                                        {currentVerse ? ` · Verse ${currentVerse}` : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Right Side: Actions (Like & Play/Pause) */}
                            <div className="nq-ab-right">
                                {currentVerse && (
                                    <button
                                        className={`nq-ab-action-btn${verses[currentVerse - 1] && bookmarks.includes(verses[currentVerse - 1]?.verse_key ?? '') ? ' liked' : ''}`}
                                        onClick={() => currentVerse && verses[currentVerse - 1] && toggleBookmark(verses[currentVerse - 1].verse_key)}
                                        title="Save verse"
                                    >
                                        <svg viewBox="0 0 24 24" fill={currentVerse && bookmarks.includes(verses[currentVerse - 1]?.verse_key ?? '') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                        </svg>
                                    </button>
                                )}
                                
                                <button
                                    className="nq-ab-play-btn"
                                    onClick={() => { isPlaying ? stopAudio() : playVerse(currentVerse || 1, true); }}
                                    title={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isPlaying
                                        ? <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                        : <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" style={{marginLeft:2}}><path d="M8 5v14l11-7z"/></svg>
                                    }
                                </button>
                                <button className="nq-ab-action-btn" onClick={() => setAudioEnabled(false)} title="Close Player" style={{ marginLeft: 4 }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        </div>
                    )}
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

            {/* ── WORD DETAIL MODAL ── */}
            {selectedWord && (
                <>
                    <div className="wdm-backdrop" onClick={() => { setSelectedWord(null); if (wordAudioRef.current) { wordAudioRef.current.pause(); wordAudioRef.current = null; setWordAudioPlaying(false); } }} />
                    <div className="wdm-sheet">
                        {/* Drag handle */}
                        <div className="wdm-handle"><div className="wdm-handle-bar" /></div>
                        {/* Header */}
                        <div className="wdm-header">
                            <span className="wdm-ref">{selectedWord.location.replace(/:/g, ':')}</span>
                            <button className="wdm-close" onClick={() => { setSelectedWord(null); if (wordAudioRef.current) { wordAudioRef.current.pause(); wordAudioRef.current = null; setWordAudioPlaying(false); } }}>
                                <X size={18} />
                            </button>
                        </div>
                        {/* Word display */}
                        <div className="wdm-word-display">
                            <span className="wdm-arabic">{cleanIndopakText(selectedWord.text_indopak ?? selectedWord.text_uthmani)}</span>
                            <span className="wdm-meaning">{selectedWord.translation}</span>
                        </div>
                        {/* Transliteration + Location */}
                        <div className="wdm-meta-row">
                            <div className="wdm-meta-item">
                                <span className="wdm-meta-label">Transliteration</span>
                                <span className="wdm-meta-value">{selectedWord.transliteration || '—'}</span>
                            </div>
                            <div className="wdm-meta-item">
                                <span className="wdm-meta-label">Position</span>
                                <span className="wdm-meta-value">Word {selectedWord.position}</span>
                            </div>
                        </div>
                        {/* Verse context */}
                        {selectedWord.verseText && (
                            <div className="wdm-context">
                                <span className="wdm-context-label">Verse Context</span>
                                <p className="wdm-context-text" dir="rtl">{selectedWord.verseText}</p>
                            </div>
                        )}
                        {/* Actions */}
                        <div className="wdm-actions">
                            {selectedWord.audio_url && (
                                <button className={`wdm-action-btn wdm-audio-btn ${wordAudioPlaying ? 'playing' : ''}`} onClick={() => playWordAudio(selectedWord.audio_url)}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{wordAudioPlaying ? 'pause_circle' : 'play_circle'}</span>
                                    <span>{wordAudioPlaying ? 'Playing...' : 'Play Audio'}</span>
                                </button>
                            )}
                            <button className="wdm-action-btn" onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ text: `${selectedWord.text_uthmani} - ${selectedWord.translation} (${selectedWord.location})` }).catch(() => {});
                                } else {
                                    navigator.clipboard.writeText(`${selectedWord.text_uthmani} - ${selectedWord.translation}`);
                                    setToast({ message: 'Word copied!', type: 'success' });
                                    setTimeout(() => setToast(null), 2000);
                                }
                            }}>
                                <Share2 size={16} />
                                <span>Share</span>
                            </button>
                            <button className="wdm-action-btn" onClick={() => {
                                navigator.clipboard.writeText(`${selectedWord.text_uthmani} - ${selectedWord.translation} (${selectedWord.transliteration})`);
                                setToast({ message: 'Word copied to clipboard!', type: 'success' });
                                setTimeout(() => setToast(null), 2000);
                            }}>
                                <Copy size={16} />
                                <span>Copy</span>
                            </button>
                        </div>
                        {/* Close hint */}
                        <p className="wdm-hint">Tap outside or press ESC to close</p>
                    </div>
                </>
            )}

            {/* Word Meaning Tooltip */}
            {tooltip && (
                <div
                    ref={tooltipRef}
                    style={{
                        position: 'fixed',
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: 'translateX(-50%)',
                        zIndex: 10000,
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
                            maxWidth: '250px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                            fontFamily: "'Lexend', sans-serif",
                            letterSpacing: '0.3px',
                            border: '1px solid rgba(255,255,255,0.1)'
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

            {/* Verse Picker — bottom sheet on mobile, dropdown on desktop */}
            {showVersePicker && (() => {
                if (isMobile) {
                    return (
                        <>
                            <div onClick={() => setShowVersePicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 10100, background: 'rgba(2,8,20,0.55)', backdropFilter: 'blur(4px)' }} />
                            <div style={{
                                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10101,
                                background: 'white', borderRadius: '20px 20px 0 0',
                                boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
                                display: 'flex', flexDirection: 'column', maxHeight: '78vh',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
                                    <div style={{ width: 36, height: 4, borderRadius: 99, background: '#e2e8f0' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Lexend, sans-serif' }}>Go to Verse</span>
                                        <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8', fontFamily: 'Lexend, sans-serif' }}>{chapter.verses_count} verses</span>
                                    </div>
                                    <button onClick={() => setShowVersePicker(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: 16 }}>✕</button>
                                </div>
                                <div style={{ overflowY: 'auto', flex: 1, padding: '8px 14px 16px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                                    {verses.map(v => {
                                        const isCurrent = v.verse_number === currentVerse;
                                        const isBookmarked = bookmarks.includes(v.verse_key);
                                        return (
                                            <button
                                                key={v.verse_number}
                                                onClick={() => { setShowVersePicker(false); jumpToVerse(v.verse_number); }}
                                                style={{
                                                    width: '100%', aspectRatio: '1', borderRadius: 10,
                                                    border: isCurrent ? '2px solid #f59e0b' : isBookmarked ? '2px solid #f59e0b' : '1.5px solid #e2e8f0',
                                                    background: isCurrent ? 'rgba(245,158,11,0.1)' : isBookmarked ? 'rgba(245,158,11,0.06)' : '#f8fafc',
                                                    color: isCurrent ? '#f59e0b' : isBookmarked ? '#d97706' : '#475569',
                                                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontFamily: 'Lexend, sans-serif',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {v.verse_number}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    );
                }
                // ── DESKTOP: anchored dropdown ──
                const btnRect = verseBtnRef.current?.getBoundingClientRect();
                const dropW = 260;
                const rightEdge = btnRect ? btnRect.right : 400;
                const leftPos = Math.max(8, rightEdge - dropW);
                const topPos = btnRect ? btnRect.bottom + 8 : 80;
                return (
                    <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setShowVersePicker(false)} />
                        <div style={{
                            position: 'fixed', top: topPos, left: leftPos, zIndex: 9999,
                            background: 'white', border: '1px solid #e2e8f0', borderRadius: 14,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)', width: dropW,
                            maxHeight: 380, overflowY: 'auto', padding: '10px 12px 12px',
                        }}>
                            <div style={{ fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Lexend, sans-serif', marginBottom: 10 }}>
                                Go to Verse · {chapter.verses_count} total
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                                {verses.map(v => {
                                    const isCurrent = v.verse_number === currentVerse;
                                    const isBookmarked = bookmarks.includes(v.verse_key);
                                    return (
                                        <button
                                            key={v.verse_number}
                                            onClick={() => { setShowVersePicker(false); jumpToVerse(v.verse_number); }}
                                            style={{
                                                width: '100%', aspectRatio: '1', borderRadius: 8,
                                                border: isCurrent ? '2px solid #f59e0b' : isBookmarked ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                                                background: isCurrent ? 'rgba(245,158,11,0.1)' : isBookmarked ? 'rgba(245,158,11,0.06)' : '#f8fafc',
                                                color: isCurrent ? '#f59e0b' : isBookmarked ? '#d97706' : '#475569',
                                                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontFamily: 'Lexend, sans-serif', transition: 'all 0.15s',
                                            }}
                                        >
                                            {v.verse_number}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                );
            })()}

            {/* Surah Picker */}
            {showSurahPicker && (() => {
                if (isMobile) {
                    // ── MOBILE: full bottom sheet ──
                    return (
                        <>
                            {/* Dim backdrop */}
                            <div
                                onClick={() => setShowSurahPicker(false)}
                                style={{ position: 'fixed', inset: 0, zIndex: 10100, background: 'rgba(2,8,20,0.55)', backdropFilter: 'blur(4px)' }}
                            />
                            {/* Sheet */}
                            <div style={{
                                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10101,
                                background: 'white', borderRadius: '20px 20px 0 0',
                                boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
                                display: 'flex', flexDirection: 'column',
                                maxHeight: '82vh',
                            }}>
                                {/* Drag handle */}
                                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
                                    <div style={{ width: 36, height: 4, borderRadius: 99, background: '#e2e8f0' }} />
                                </div>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 10px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Lexend, sans-serif' }}>Select Surah</span>
                                    <button onClick={() => setShowSurahPicker(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: 16 }}>✕</button>
                                </div>
                                {/* List */}
                                <div style={{ overflowY: 'auto', flex: 1 }}>
                                    {ALL_SURAHS.map(s => (
                                        <Link
                                            key={s.number}
                                            href={`/read-quran/${s.number}?mode=${readingMode}`}
                                            onClick={() => setShowSurahPicker(false)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '11px 18px', textDecoration: 'none',
                                                background: s.number === surahNumber ? 'rgba(245,158,11,0.08)' : 'transparent',
                                                borderBottom: '1px solid #f8fafc',
                                                color: s.number === surahNumber ? '#f59e0b' : '#1e293b',
                                            }}
                                        >
                                            <span style={{
                                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                                background: s.number === surahNumber ? 'rgba(245,158,11,0.15)' : '#f1f5f9',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 12, fontWeight: 700,
                                                color: s.number === surahNumber ? '#f59e0b' : '#64748b',
                                            }}>{s.number}</span>
                                            <span style={{ flex: 1, minWidth: 0 }}>
                                                <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                                                <span style={{ display: 'block', fontSize: 11.5, color: '#94a3b8' }}>{s.translation}</span>
                                            </span>
                                            <span style={{ fontSize: 16, fontFamily: 'var(--rq-font-arabic)', color: '#475569', direction: 'rtl' }}>{s.arabic}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    );
                }

                // ── DESKTOP: anchored dropdown ──
                const btnRect = surahBtnRef.current?.getBoundingClientRect();
                const dropdownWidth = 280;
                const rightEdge = btnRect ? btnRect.right : 320;
                const leftPos = Math.max(8, rightEdge - dropdownWidth);
                const topPos = btnRect ? btnRect.bottom + 8 : 80;
                return (
                    <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setShowSurahPicker(false)} />
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
                                    href={`/read-quran/${s.number}?mode=${readingMode}`}
                                    onClick={() => setShowSurahPicker(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        width: '100%', padding: '10px 14px', textDecoration: 'none',
                                        background: s.number === surahNumber ? 'rgba(245,158,11,0.08)' : 'transparent',
                                        cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f8fafc',
                                        color: s.number === surahNumber ? '#f59e0b' : '#1e293b',
                                    }}
                                >
                                    <span style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: s.number === surahNumber ? 'rgba(245,158,11,0.15)' : '#f1f5f9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                                        color: s.number === surahNumber ? '#f59e0b' : '#64748b',
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

            {/* Tafseer Modal — premium side drawer */}
            <TafseerModal
                isOpen={tafseerModalVerse !== null}
                onClose={closeTafseer}
                verse={verses.find(v => v.verse_number === tafseerModalVerse) ?? null}
                chapter={chapter}
                allVerses={verses}
                onNavigate={(verseNumber) => setTafseerModalVerse(verseNumber)}
                surahNumber={surahNumber}
                cleanArabicText={cleanIndopakText}
                removeBismillah={removeBismillah}
            />
        </>
    );
}
