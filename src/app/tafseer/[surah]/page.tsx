'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, Search, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SurahMeta {
    num: number; name: string; ar: string; meaning: string; v: number; t: string;
}
const ALL_SURAHS: SurahMeta[] = [
    { num: 1, ar: 'الفاتحة', name: 'Al-Fatihah', meaning: 'The Opening', v: 7, t: 'Meccan' },
    { num: 2, ar: 'البقرة', name: 'Al-Baqarah', meaning: 'The Cow', v: 286, t: 'Medinan' },
    { num: 3, ar: 'آل عمران', name: 'Al-Imran', meaning: 'Family of Imran', v: 200, t: 'Medinan' },
    { num: 4, ar: 'النساء', name: 'An-Nisa', meaning: 'The Women', v: 176, t: 'Medinan' },
    { num: 5, ar: 'المائدة', name: "Al-Ma'idah", meaning: 'The Table Spread', v: 120, t: 'Medinan' },
    { num: 6, ar: 'الأنعام', name: "Al-An'am", meaning: 'The Cattle', v: 165, t: 'Meccan' },
    { num: 7, ar: 'الأعراف', name: "Al-A'raf", meaning: 'The Heights', v: 206, t: 'Meccan' },
    { num: 8, ar: 'الأنفال', name: 'Al-Anfal', meaning: 'The Spoils of War', v: 75, t: 'Medinan' },
    { num: 9, ar: 'التوبة', name: 'At-Tawbah', meaning: 'The Repentance', v: 129, t: 'Medinan' },
    { num: 10, ar: 'يونس', name: 'Yunus', meaning: 'Jonah', v: 109, t: 'Meccan' },
    { num: 11, ar: 'هود', name: 'Hud', meaning: 'Hud', v: 123, t: 'Meccan' },
    { num: 12, ar: 'يوسف', name: 'Yusuf', meaning: 'Joseph', v: 111, t: 'Meccan' },
    { num: 13, ar: 'الرعد', name: "Ar-Ra'd", meaning: 'The Thunder', v: 43, t: 'Medinan' },
    { num: 14, ar: 'إبراهيم', name: 'Ibrahim', meaning: 'Abraham', v: 52, t: 'Meccan' },
    { num: 15, ar: 'الحجر', name: 'Al-Hijr', meaning: 'The Rocky Tract', v: 99, t: 'Meccan' },
    { num: 16, ar: 'النحل', name: 'An-Nahl', meaning: 'The Bee', v: 128, t: 'Meccan' },
    { num: 17, ar: 'الإسراء', name: "Al-Isra'", meaning: 'The Night Journey', v: 111, t: 'Meccan' },
    { num: 18, ar: 'الكهف', name: 'Al-Kahf', meaning: 'The Cave', v: 110, t: 'Meccan' },
    { num: 19, ar: 'مريم', name: 'Maryam', meaning: 'Mary', v: 98, t: 'Meccan' },
    { num: 20, ar: 'طه', name: 'Ta-Ha', meaning: 'Ta-Ha', v: 135, t: 'Meccan' },
    { num: 21, ar: 'الأنبياء', name: "Al-Anbiya'", meaning: 'The Prophets', v: 112, t: 'Meccan' },
    { num: 22, ar: 'الحج', name: 'Al-Hajj', meaning: 'The Pilgrimage', v: 78, t: 'Medinan' },
    { num: 23, ar: 'المؤمنون', name: "Al-Mu'minun", meaning: 'The Believers', v: 118, t: 'Meccan' },
    { num: 24, ar: 'النور', name: 'An-Nur', meaning: 'The Light', v: 64, t: 'Medinan' },
    { num: 25, ar: 'الفرقان', name: 'Al-Furqan', meaning: 'The Criterion', v: 77, t: 'Meccan' },
    { num: 26, ar: 'الشعراء', name: "Ash-Shu'ara'", meaning: 'The Poets', v: 227, t: 'Meccan' },
    { num: 27, ar: 'النمل', name: 'An-Naml', meaning: 'The Ant', v: 93, t: 'Meccan' },
    { num: 28, ar: 'القصص', name: 'Al-Qasas', meaning: 'The Stories', v: 88, t: 'Meccan' },
    { num: 29, ar: 'العنكبوت', name: 'Al-Ankabut', meaning: 'The Spider', v: 69, t: 'Meccan' },
    { num: 30, ar: 'الروم', name: 'Ar-Rum', meaning: 'The Romans', v: 60, t: 'Meccan' },
    { num: 31, ar: 'لقمان', name: 'Luqman', meaning: 'Luqman', v: 34, t: 'Meccan' },
    { num: 32, ar: 'السجدة', name: 'As-Sajdah', meaning: 'The Prostration', v: 30, t: 'Meccan' },
    { num: 33, ar: 'الأحزاب', name: 'Al-Ahzab', meaning: 'The Combined Forces', v: 73, t: 'Medinan' },
    { num: 34, ar: 'سبأ', name: 'Saba', meaning: 'Sheba', v: 54, t: 'Meccan' },
    { num: 35, ar: 'فاطر', name: 'Fatir', meaning: 'Originator', v: 45, t: 'Meccan' },
    { num: 36, ar: 'يس', name: 'Ya-Sin', meaning: 'Ya-Sin', v: 83, t: 'Meccan' },
    { num: 37, ar: 'الصافات', name: 'As-Saffat', meaning: 'Those Lined Up', v: 182, t: 'Meccan' },
    { num: 38, ar: 'ص', name: 'Sad', meaning: 'Sad', v: 88, t: 'Meccan' },
    { num: 39, ar: 'الزمر', name: 'Az-Zumar', meaning: 'The Groups', v: 75, t: 'Meccan' },
    { num: 40, ar: 'غافر', name: 'Ghafir', meaning: 'The Forgiver', v: 85, t: 'Meccan' },
    { num: 41, ar: 'فصلت', name: 'Fussilat', meaning: 'Explained in Detail', v: 54, t: 'Meccan' },
    { num: 42, ar: 'الشورى', name: 'Ash-Shuraa', meaning: 'The Consultation', v: 53, t: 'Meccan' },
    { num: 43, ar: 'الزخرف', name: 'Az-Zukhruf', meaning: 'The Gold Adornments', v: 89, t: 'Meccan' },
    { num: 44, ar: 'الدخان', name: 'Ad-Dukhan', meaning: 'The Smoke', v: 59, t: 'Meccan' },
    { num: 45, ar: 'الجاثية', name: 'Al-Jathiyah', meaning: 'The Crouching', v: 37, t: 'Meccan' },
    { num: 46, ar: 'الأحقاف', name: 'Al-Ahqaf', meaning: 'The Wind-Curved Dunes', v: 35, t: 'Meccan' },
    { num: 47, ar: 'محمد', name: 'Muhammad', meaning: 'Muhammad', v: 38, t: 'Medinan' },
    { num: 48, ar: 'الفتح', name: 'Al-Fath', meaning: 'The Victory', v: 29, t: 'Medinan' },
    { num: 49, ar: 'الحجرات', name: 'Al-Hujurat', meaning: 'The Rooms', v: 18, t: 'Medinan' },
    { num: 50, ar: 'ق', name: 'Qaf', meaning: 'Qaf', v: 45, t: 'Meccan' },
    { num: 51, ar: 'الذاريات', name: 'Adh-Dhariyat', meaning: 'The Scattering Winds', v: 60, t: 'Meccan' },
    { num: 52, ar: 'الطور', name: 'At-Tur', meaning: 'The Mount', v: 49, t: 'Meccan' },
    { num: 53, ar: 'النجم', name: 'An-Najm', meaning: 'The Star', v: 62, t: 'Meccan' },
    { num: 54, ar: 'القمر', name: 'Al-Qamar', meaning: 'The Moon', v: 55, t: 'Meccan' },
    { num: 55, ar: 'الرحمن', name: 'Ar-Rahman', meaning: 'The Beneficent', v: 78, t: 'Medinan' },
    { num: 56, ar: 'الواقعة', name: "Al-Waqi'ah", meaning: 'The Inevitable', v: 96, t: 'Meccan' },
    { num: 57, ar: 'الحديد', name: 'Al-Hadid', meaning: 'The Iron', v: 29, t: 'Medinan' },
    { num: 58, ar: 'المجادلة', name: 'Al-Mujadila', meaning: 'The Pleading Woman', v: 22, t: 'Medinan' },
    { num: 59, ar: 'الحشر', name: 'Al-Hashr', meaning: 'The Exile', v: 24, t: 'Medinan' },
    { num: 60, ar: 'الممتحنة', name: 'Al-Mumtahanah', meaning: 'She That Is Examined', v: 13, t: 'Medinan' },
    { num: 61, ar: 'الصف', name: 'As-Saf', meaning: 'The Ranks', v: 14, t: 'Medinan' },
    { num: 62, ar: 'الجمعة', name: "Al-Jumu'ah", meaning: 'The Friday', v: 11, t: 'Medinan' },
    { num: 63, ar: 'المنافقون', name: 'Al-Munafiqun', meaning: 'The Hypocrites', v: 11, t: 'Medinan' },
    { num: 64, ar: 'التغابن', name: 'At-Taghabun', meaning: 'The Mutual Disillusion', v: 18, t: 'Medinan' },
    { num: 65, ar: 'الطلاق', name: 'At-Talaq', meaning: 'The Divorce', v: 12, t: 'Medinan' },
    { num: 66, ar: 'التحريم', name: 'At-Tahrim', meaning: 'The Prohibition', v: 12, t: 'Medinan' },
    { num: 67, ar: 'الملك', name: 'Al-Mulk', meaning: 'The Sovereignty', v: 30, t: 'Meccan' },
    { num: 68, ar: 'القلم', name: 'Al-Qalam', meaning: 'The Pen', v: 52, t: 'Meccan' },
    { num: 69, ar: 'الحاقة', name: 'Al-Haqqah', meaning: 'The Reality', v: 52, t: 'Meccan' },
    { num: 70, ar: 'المعارج', name: "Al-Ma'arij", meaning: 'The Ascending Stairways', v: 44, t: 'Meccan' },
    { num: 71, ar: 'نوح', name: 'Nuh', meaning: 'Noah', v: 28, t: 'Meccan' },
    { num: 72, ar: 'الجن', name: 'Al-Jinn', meaning: 'The Jinn', v: 28, t: 'Meccan' },
    { num: 73, ar: 'المزمل', name: 'Al-Muzzammil', meaning: 'The Enshrouded One', v: 20, t: 'Meccan' },
    { num: 74, ar: 'المدثر', name: 'Al-Muddaththir', meaning: 'The Cloaked One', v: 56, t: 'Meccan' },
    { num: 75, ar: 'القيامة', name: 'Al-Qiyamah', meaning: 'The Resurrection', v: 40, t: 'Meccan' },
    { num: 76, ar: 'الإنسان', name: 'Al-Insan', meaning: 'The Man', v: 31, t: 'Medinan' },
    { num: 77, ar: 'المرسلات', name: 'Al-Mursalat', meaning: 'The Emissaries', v: 50, t: 'Meccan' },
    { num: 78, ar: 'النبأ', name: "An-Naba'", meaning: 'The Tidings', v: 40, t: 'Meccan' },
    { num: 79, ar: 'النازعات', name: "An-Nazi'at", meaning: 'Those Who Drag Forth', v: 46, t: 'Meccan' },
    { num: 80, ar: 'عبس', name: 'Abasa', meaning: 'He Frowned', v: 42, t: 'Meccan' },
    { num: 81, ar: 'التكوير', name: 'At-Takwir', meaning: 'The Overthrowing', v: 29, t: 'Meccan' },
    { num: 82, ar: 'الانفطار', name: 'Al-Infitar', meaning: 'The Cleaving', v: 19, t: 'Meccan' },
    { num: 83, ar: 'المطففين', name: 'Al-Mutaffifin', meaning: 'The Defrauding', v: 36, t: 'Meccan' },
    { num: 84, ar: 'الانشقاق', name: 'Al-Inshiqaq', meaning: 'The Sundering', v: 25, t: 'Meccan' },
    { num: 85, ar: 'البروج', name: 'Al-Buruj', meaning: 'The Mansions of Stars', v: 22, t: 'Meccan' },
    { num: 86, ar: 'الطارق', name: 'At-Tariq', meaning: 'The Morning Star', v: 17, t: 'Meccan' },
    { num: 87, ar: 'الأعلى', name: "Al-A'la", meaning: 'The Most High', v: 19, t: 'Meccan' },
    { num: 88, ar: 'الغاشية', name: 'Al-Ghashiyah', meaning: 'The Overwhelming', v: 26, t: 'Meccan' },
    { num: 89, ar: 'الفجر', name: 'Al-Fajr', meaning: 'The Dawn', v: 30, t: 'Meccan' },
    { num: 90, ar: 'البلد', name: 'Al-Balad', meaning: 'The City', v: 20, t: 'Meccan' },
    { num: 91, ar: 'الشمس', name: 'Ash-Shams', meaning: 'The Sun', v: 15, t: 'Meccan' },
    { num: 92, ar: 'الليل', name: 'Al-Layl', meaning: 'The Night', v: 21, t: 'Meccan' },
    { num: 93, ar: 'الضحى', name: 'Ad-Duhaa', meaning: 'The Morning Hours', v: 11, t: 'Meccan' },
    { num: 94, ar: 'الشرح', name: 'Ash-Sharh', meaning: 'The Relief', v: 8, t: 'Meccan' },
    { num: 95, ar: 'التين', name: 'At-Tin', meaning: 'The Fig', v: 8, t: 'Meccan' },
    { num: 96, ar: 'العلق', name: "Al-'Alaq", meaning: 'The Clot', v: 19, t: 'Meccan' },
    { num: 97, ar: 'القدر', name: 'Al-Qadr', meaning: 'The Power', v: 5, t: 'Meccan' },
    { num: 98, ar: 'البينة', name: 'Al-Bayyinah', meaning: 'The Clear Proof', v: 8, t: 'Medinan' },
    { num: 99, ar: 'الزلزلة', name: 'Az-Zalzalah', meaning: 'The Earthquake', v: 8, t: 'Medinan' },
    { num: 100, ar: 'العاديات', name: "Al-'Adiyat", meaning: 'The Courser', v: 11, t: 'Meccan' },
    { num: 101, ar: 'القارعة', name: "Al-Qari'ah", meaning: 'The Calamity', v: 11, t: 'Meccan' },
    { num: 102, ar: 'التكاثر', name: 'At-Takathur', meaning: 'The Rivalry in World', v: 8, t: 'Meccan' },
    { num: 103, ar: 'العصر', name: "Al-'Asr", meaning: 'The Declining Day', v: 3, t: 'Meccan' },
    { num: 104, ar: 'الهمزة', name: 'Al-Humazah', meaning: 'The Traducer', v: 9, t: 'Meccan' },
    { num: 105, ar: 'الفيل', name: 'Al-Fil', meaning: 'The Elephant', v: 5, t: 'Meccan' },
    { num: 106, ar: 'قريش', name: 'Quraysh', meaning: 'Quraysh', v: 4, t: 'Meccan' },
    { num: 107, ar: 'الماعون', name: "Al-Ma'un", meaning: 'The Small Kindnesses', v: 7, t: 'Meccan' },
    { num: 108, ar: 'الكوثر', name: 'Al-Kawthar', meaning: 'The Abundance', v: 3, t: 'Meccan' },
    { num: 109, ar: 'الكافرون', name: 'Al-Kafirun', meaning: 'The Disbelievers', v: 6, t: 'Meccan' },
    { num: 110, ar: 'النصر', name: 'An-Nasr', meaning: 'The Divine Support', v: 3, t: 'Medinan' },
    { num: 111, ar: 'المسد', name: 'Al-Masad', meaning: 'The Palm Fiber', v: 5, t: 'Meccan' },
    { num: 112, ar: 'الإخلاص', name: 'Al-Ikhlas', meaning: 'The Sincerity', v: 4, t: 'Meccan' },
    { num: 113, ar: 'الفلق', name: 'Al-Falaq', meaning: 'The Daybreak', v: 5, t: 'Meccan' },
    { num: 114, ar: 'الناس', name: 'An-Nas', meaning: 'The Mankind', v: 6, t: 'Meccan' },
];

const TAFSIR_OPTIONS = [
    { id: 169, name: 'Ibn Kathir (Abridged)', lang: 'English' },
    { id: 168, name: "Ma'arif al-Qur'an", lang: 'English' },
    { id: 817, name: 'Tazkirul Quran', lang: 'English' },
    { id: 160, name: 'Tafsir Ibn Kathir', lang: 'Urdu' },
    { id: 157, name: 'Fi Zilal al-Quran', lang: 'Urdu' },
];

// Strip HTML from tafsir text
function stripHtml(html: string): string {
    if (!html) return '';
    return html
        .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
        .trim();
}

interface PageProps { params: Promise<{ surah: string }> }

export default function TafseerSurahPage({ params }: PageProps) {
    const { surah: surahParam } = use(params);
    const surahNum = parseInt(surahParam);
    const meta = ALL_SURAHS.find(s => s.num === surahNum);

    const [verses, setVerses] = useState<{ num: number; arabic: string; translation: string; key: string }[]>([]);
    const [tafsirData, setTafsirData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [tafsirLoading, setTafsirLoading] = useState(false);
    const [selectedTafsir, setSelectedTafsir] = useState(169);
    const [expandedVerse, setExpandedVerse] = useState<number | null>(null);
    const [showSurahPicker, setShowSurahPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch verses (Arabic + translation)
    useEffect(() => {
        if (!surahNum || surahNum < 1 || surahNum > 114) return;
        setLoading(true);
        setVerses([]);
        setTafsirData({});
        setExpandedVerse(null);

        fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-simple-enhanced,en.sahih`)
            .then(r => r.json())
            .then(json => {
                if (json.code !== 200) throw new Error('API error');
                const ar = json.data[0].ayahs;
                const en = json.data[1].ayahs;
                setVerses(ar.map((a: any, i: number) => ({
                    num: a.numberInSurah,
                    arabic: a.text,
                    translation: en[i]?.text || '',
                    key: `${surahNum}:${a.numberInSurah}`,
                })));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [surahNum]);

    // Fetch tafsir for selected scholar
    const loadTafsir = (tafsirId: number) => {
        setTafsirLoading(true);
        fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_chapter/${surahNum}?language=en`)
            .then(r => r.json())
            .then(json => {
                const map: Record<string, string> = {};
                (json.tafsirs || []).forEach((t: any) => { map[t.verse_key] = t.text; });
                setTafsirData(map);
            })
            .catch(console.error)
            .finally(() => setTafsirLoading(false));
    };

    // Load tafsir when verse is first expanded
    const toggleVerse = (num: number) => {
        if (expandedVerse === num) { setExpandedVerse(null); return; }
        setExpandedVerse(num);
        if (Object.keys(tafsirData).length === 0) loadTafsir(selectedTafsir);
    };

    const changeTafsir = (id: number) => {
        setSelectedTafsir(id);
        setTafsirData({});
        if (expandedVerse !== null) loadTafsir(id);
    };

    const prevSurah = surahNum > 1 ? ALL_SURAHS.find(s => s.num === surahNum - 1) : null;
    const nextSurah = surahNum < 114 ? ALL_SURAHS.find(s => s.num === surahNum + 1) : null;
    const surahPickerFiltered = searchQuery
        ? ALL_SURAHS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.ar.includes(searchQuery) || String(s.num) === searchQuery)
        : ALL_SURAHS;

    if (!meta) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend',sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#ef4444', marginBottom: 16 }}>Invalid Surah number.</p>
                <Link href="/tafseer" style={{ color: '#11d442' }}>← Back to Tafseer</Link>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
        *{box-sizing:border-box}
        .ts-shell{min-height:100vh;background:#f6f8f6;font-family:'Lexend','Figtree',sans-serif}
        .dark .ts-shell{background:#0d1b12}
        .ts-header{position:sticky;top:0;z-index:100;background:rgba(246,248,246,0.95);backdrop-filter:blur(12px);border-bottom:1px solid #e2e8f0;padding:0}
        .dark .ts-header{background:rgba(13,27,18,0.97);border-color:#1e3a2a}
        .ts-header-inner{max-width:800px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;gap:12px}
        .ts-body{max-width:800px;margin:0 auto;padding:24px 20px 80px}
        .ts-hero{background:linear-gradient(135deg,#11d442 0%,#059669 100%);border-radius:20px;padding:32px;margin-bottom:32px;position:relative;overflow:hidden}
        .ts-hero::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:rgba(255,255,255,0.06);border-radius:50%}
        .ts-hero::after{content:'';position:absolute;bottom:-30px;left:20px;width:120px;height:120px;background:rgba(255,255,255,0.04);border-radius:50%}
        .ts-verse-card{background:white;border:1px solid #e2e8f0;border-radius:16px;margin-bottom:16px;overflow:hidden;transition:border-color 0.2s,box-shadow 0.2s}
        .dark .ts-verse-card{background:#111f16;border-color:#1e3a2a}
        .ts-verse-card:hover{border-color:rgba(17,212,66,0.3);box-shadow:0 4px 20px rgba(17,212,66,0.08)}
        .ts-verse-card.expanded{border-color:rgba(17,212,66,0.4);box-shadow:0 4px 24px rgba(17,212,66,0.12)}
        .ts-verse-header{padding:16px 20px;cursor:pointer;display:flex;align-items:flex-start;gap:14px}
        .ts-verse-num{width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(17,212,66,0.4);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#11d442;flex-shrink:0;margin-top:2px}
        .ts-arabic{font-family:'Naskh IndoPak','Scheherazade New','Traditional Arabic',serif;font-size:24px;line-height:2;direction:rtl;text-align:right;color:#1e293b;flex:1}
        .dark .ts-arabic{color:#e2e8f0}
        @media(max-width:640px){.ts-arabic{font-size:20px}}
        .ts-translation{padding:0 20px 16px 70px;font-size:15px;line-height:1.8;color:#475569;font-style:italic;border-top:1px solid #f1f5f9}
        .dark .ts-translation{color:#94a3b8;border-color:#1e3a2a}
        .ts-tafsir-panel{background:rgba(17,212,66,0.03);border-top:1px solid rgba(17,212,66,0.15);padding:20px;animation:tsIn 0.22s ease}
        .dark .ts-tafsir-panel{background:rgba(17,212,66,0.04)}
        @keyframes tsIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .ts-tafsir-label{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#11d442;margin-bottom:12px}
        .ts-tafsir-text{font-size:14px;line-height:1.9;color:#334155;white-space:pre-line}
        .dark .ts-tafsir-text{color:#94a3b8}
        .ts-expand-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border:1px solid rgba(17,212,66,0.3);border-radius:8px;background:transparent;cursor:pointer;font-size:12px;font-weight:600;color:#11d442;transition:all 0.15s;font-family:'Lexend',sans-serif;white-space:nowrap}
        .ts-expand-btn:hover{background:rgba(17,212,66,0.08)}
        .ts-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:#94a3b8;margin-bottom:24px;flex-wrap:wrap}
        .ts-breadcrumb a{color:#64748b;text-decoration:none;transition:color 0.15s}
        .ts-breadcrumb a:hover{color:#11d442}
        .ts-nav{display:flex;justify-content:space-between;align-items:center;margin-top:40px;gap:12px;flex-wrap:wrap}
        .ts-nav-btn{display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;text-decoration:none;font-size:13px;font-weight:600;color:#64748b;background:white;border:1px solid #e2e8f0;transition:all 0.2s;font-family:'Lexend',sans-serif}
        .dark .ts-nav-btn{background:#111f16;border-color:#1e3a2a;color:#94a3b8}
        .ts-nav-btn:hover{border-color:#11d442;color:#11d442}
        .ts-select{padding:8px 12px;border-radius:10px;border:1px solid #e2e8f0;background:white;font-size:12px;font-family:'Lexend',sans-serif;color:#334155;cursor:pointer;outline:none}
        .dark .ts-select{background:#111f16;border-color:#1e3a2a;color:#e2e8f0}
        .ts-scroll::-webkit-scrollbar{width:5px}
        .ts-scroll::-webkit-scrollbar-thumb{background:rgba(17,212,66,0.3);border-radius:3px}
        .ts-picker{position:fixed;inset:0;z-index:200;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px)}
        .ts-picker-box{background:white;border-radius:18px;width:min(400px,calc(100vw - 32px));max-height:70vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.2)}
        .dark .ts-picker-box{background:#111f16}
        .ts-loading-row{display:flex;align-items:center;gap:10px;padding:16px 20px;font-size:13px;color:#64748b}
        .ts-spinner{width:18px;height:18px;border:2px solid rgba(17,212,66,0.2);border-top-color:#11d442;border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

            <div className="ts-shell">
                {/* ── HEADER ── */}
                <header className="ts-header">
                    <div className="ts-header-inner">
                        <Link href="/" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#11d442'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
                        >
                            <ChevronLeft size={20} />
                        </Link>
                        <button
                            onClick={() => setShowSurahPicker(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1 }}
                        >
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{meta.name}</p>
                                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Tafseer · {meta.v} Verses</p>
                            </div>
                            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
                        </button>
                        <select
                            className="ts-select"
                            value={selectedTafsir}
                            onChange={e => changeTafsir(parseInt(e.target.value))}
                            title="Select Tafsir Scholar"
                        >
                            {TAFSIR_OPTIONS.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </header>

                {/* ── BODY ── */}
                <main className="ts-body">
                    {/* Breadcrumb */}
                    <nav className="ts-breadcrumb" aria-label="Breadcrumb">
                        <Link href="/">Home</Link>
                        <span>›</span>
                        <Link href="/tafseer">Tafseer</Link>
                        <span>›</span>
                        <span style={{ color: '#11d442', fontWeight: 600 }}>{meta.name}</span>
                    </nav>

                    {/* Hero */}
                    <div className="ts-hero">
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {meta.t} · Surah {meta.num}
                                </div>
                            </div>
                            <h1 style={{ margin: '0 0 4px', fontSize: 'clamp(22px,5vw,32px)', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                                {meta.name}
                            </h1>
                            <p style={{ margin: '0 0 12px', fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>{meta.meaning}</p>
                            <div style={{ fontFamily: "'Naskh IndoPak','Scheherazade New',serif", fontSize: 'clamp(22px,4vw,32px)', color: 'white', direction: 'rtl', marginBottom: 16 }}>
                                {meta.ar}
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'white' }}>
                                    📖 {meta.v} Verses
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'white' }}>
                                    📚 {TAFSIR_OPTIONS.find(t => t.id === selectedTafsir)?.name}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 20px', color: '#64748b' }}>
                            <div className="ts-spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
                            <p style={{ margin: 0, fontSize: 14 }}>Loading Surah {meta.name}…</p>
                        </div>
                    )}

                    {/* Verse list */}
                    {!loading && (
                        <>
                            {/* Bismillah */}
                            {meta.num !== 1 && meta.num !== 9 && (
                                <div style={{ textAlign: 'center', padding: '20px 0 28px', fontFamily: "'Naskh IndoPak','Scheherazade New',serif", fontSize: 26, color: '#1e293b', borderBottom: '1px solid #f1f5f9', marginBottom: 24 }}>
                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </div>
                            )}

                            {verses.map(verse => {
                                const isExpanded = expandedVerse === verse.num;
                                const tafsirText = stripHtml(tafsirData[verse.key] || '');
                                return (
                                    <article key={verse.num} id={`verse-${verse.num}`} className={`ts-verse-card${isExpanded ? ' expanded' : ''}`}>
                                        {/* Arabic + expand trigger */}
                                        <div className="ts-verse-header" onClick={() => toggleVerse(verse.num)}>
                                            <div className="ts-verse-num">{verse.num}</div>
                                            <div style={{ flex: 1 }}>
                                                <p className="ts-arabic">{verse.arabic}</p>
                                            </div>
                                            <button
                                                className="ts-expand-btn"
                                                style={{ marginTop: 6 }}
                                                onClick={e => { e.stopPropagation(); toggleVerse(verse.num); }}
                                                aria-expanded={isExpanded}
                                                aria-label={isExpanded ? 'Hide Tafseer' : 'Show Tafseer'}
                                            >
                                                <BookOpen size={13} />
                                                {isExpanded ? 'Hide' : 'Tafseer'}
                                                <ChevronDown size={13} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                            </button>
                                        </div>

                                        {/* Translation */}
                                        <div className="ts-translation">
                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#11d442', textTransform: 'uppercase', letterSpacing: '0.08em', fontStyle: 'normal', display: 'block', marginBottom: 4 }}>
                                                Sahih International
                                            </span>
                                            {verse.translation}
                                        </div>

                                        {/* Tafseer panel */}
                                        {isExpanded && (
                                            <div className="ts-tafsir-panel">
                                                <div className="ts-tafsir-label">
                                                    <BookOpen size={14} />
                                                    {TAFSIR_OPTIONS.find(t => t.id === selectedTafsir)?.name} — {verse.key}
                                                </div>
                                                {tafsirLoading && Object.keys(tafsirData).length === 0 ? (
                                                    <div className="ts-loading-row">
                                                        <div className="ts-spinner" />
                                                        Loading Tafseer…
                                                    </div>
                                                ) : tafsirText ? (
                                                    <p className="ts-tafsir-text">{tafsirText}</p>
                                                ) : (
                                                    <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Tafseer not available for this verse.</p>
                                                )}
                                            </div>
                                        )}
                                    </article>
                                );
                            })}

                            {/* Navigation */}
                            <nav className="ts-nav" aria-label="Surah navigation">
                                {prevSurah ? (
                                    <Link href={`/tafseer/${prevSurah.num}`} className="ts-nav-btn">
                                        <ChevronLeft size={16} />
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Previous Surah</div>
                                            <div>{prevSurah.name}</div>
                                        </div>
                                    </Link>
                                ) : <div />}
                                <Link href="/tafseer" className="ts-nav-btn" style={{ flexShrink: 0 }}>
                                    <BookOpen size={16} />All Surahs
                                </Link>
                                {nextSurah ? (
                                    <Link href={`/tafseer/${nextSurah.num}`} className="ts-nav-btn">
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Next Surah</div>
                                            <div>{nextSurah.name}</div>
                                        </div>
                                        <ChevronRight size={16} />
                                    </Link>
                                ) : <div />}
                            </nav>
                        </>
                    )}
                </main>
            </div>

            {/* ── SURAH PICKER OVERLAY ── */}
            {showSurahPicker && (
                <div className="ts-picker" onClick={() => setShowSurahPicker(false)}>
                    <div className="ts-picker-box" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Select Surah</h2>
                                <button onClick={() => setShowSurahPicker(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>✕</button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                <input type="text" placeholder="Search surah…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#334155' }} autoFocus />
                            </div>
                        </div>
                        <div className="ts-scroll" style={{ overflowY: 'auto', flex: 1 }}>
                            {surahPickerFiltered.map(s => (
                                <Link key={s.num} href={`/tafseer/${s.num}`} onClick={() => { setShowSurahPicker(false); setSearchQuery(''); }}
                                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: s.num === surahNum ? 'rgba(17,212,66,0.06)' : 'transparent' }}
                                    onMouseEnter={e => { if (s.num !== surahNum) e.currentTarget.style.background = '#f8fffe'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = s.num === surahNum ? 'rgba(17,212,66,0.06)' : 'transparent'; }}
                                >
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: s.num === surahNum ? 'rgba(17,212,66,0.15)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: s.num === surahNum ? '#11d442' : '#94a3b8', flexShrink: 0 }}>{s.num}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: s.num === surahNum ? '#11d442' : '#1e293b' }}>{s.name}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{s.meaning} · {s.v} verses</p>
                                    </div>
                                    <span style={{ fontFamily: "'Naskh IndoPak',serif", fontSize: 16, color: '#475569', direction: 'rtl' }}>{s.ar}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
