'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, Search, ChevronDown, X } from 'lucide-react';
import TafseerModal from '@/app/read-quran/components/TafseerModal';
import '@/app/read-quran/styles/tafseer-modal.css';

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

interface PageProps { params: Promise<{ surah: string }> }

export default function TafseerSurahPage({ params }: PageProps) {
    const { surah: surahParam } = use(params);
    const surahNum = parseInt(surahParam);
    const meta = ALL_SURAHS.find(s => s.num === surahNum);

    const [verses, setVerses] = useState<{ num: number; arabic: string; translation: string; key: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVerseNum, setModalVerseNum] = useState<number | null>(null);
    const [showSurahPicker, setShowSurahPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Same text cleaner as read-quran — strips annotation marks unsupported by Naskh IndoPak font
    const cleanIndopakText = (text: string): string => {
        if (!text) return '';
        return text
            .replace(/[\n\r\t]+/g, ' ')
            .replace(/[\u0610-\u061A]/g, '')
            .replace(/\u06E1/g, '\u0652')
            .replace(/[\u06D6-\u06FF]/g, '')
            .replace(/[\uFBB2-\uFBC2]/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    // Strip the Bismillah prefix from verse 1 text for surahs that have it shown separately
    const stripBismillah = (text: string): string => {
        const bare = (s: string) => s.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06FF]/g, '');
        if (/^بسم\s+[اٱ]لله\s+[اٱ]لرحمن\s+[اٱ]لرحيم/.test(bare(text.trimStart()))) {
            return text.split(/\s+/).slice(4).join(' ').trim();
        }
        return text;
    };

    useEffect(() => {
        if (!surahNum || surahNum < 1 || surahNum > 114) return;
        setLoading(true);
        setVerses([]);
        setModalVerseNum(null);

        // Fetch IndoPak text from QuranCDN (same source as read-quran) + translation from alquran.cloud in parallel
        Promise.all([
            fetch(`https://api.qurancdn.com/api/v4/quran/verses/indopak?chapter_number=${surahNum}&per_page=300`).then(r => r.json()),
            fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.sahih`).then(r => r.json()),
        ])
            .then(([indopakJson, enJson]) => {
                if (enJson.code !== 200) throw new Error('API error');
                const arVerses: any[] = indopakJson?.verses || [];
                const enAyahs: any[] = enJson.data?.ayahs || [];
                const hasBismillah = surahNum !== 1 && surahNum !== 9;
                const enMap = new Map(enAyahs.map((a: any) => [a.numberInSurah, a.text]));
                setVerses(arVerses.map((a: any) => {
                    const rawText = a.text_indopak || '';
                    const verseNum: number = a.verse_number ?? a.numberInSurah ?? 0;
                    const cleaned = cleanIndopakText(
                        hasBismillah && verseNum === 1 ? stripBismillah(rawText) : rawText
                    );
                    return {
                        num: verseNum,
                        arabic: cleaned,
                        translation: enMap.get(verseNum) || '',
                        key: `${surahNum}:${verseNum}`,
                    };
                }));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [surahNum]);

    const prevSurah = surahNum > 1 ? ALL_SURAHS.find(s => s.num === surahNum - 1) : null;
    const nextSurah = surahNum < 114 ? ALL_SURAHS.find(s => s.num === surahNum + 1) : null;
    const surahPickerFiltered = searchQuery
        ? ALL_SURAHS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.ar.includes(searchQuery) || String(s.num) === searchQuery)
        : ALL_SURAHS;

    if (!meta) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend',sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#ef4444', marginBottom: 16 }}>Invalid Surah number.</p>
                <Link href="/tafseer" style={{ color: '#f59e0b' }}>← Back to Tafseer</Link>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .ts-shell{min-height:100vh;background:var(--bg-base);font-family:'Lexend','Figtree',sans-serif;color:var(--text-primary)}

        /* ── HEADER ── */
        .ts-header{position:sticky;top:0;z-index:100;background:var(--glass-bg-strong);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border-bottom:1px solid var(--border-default);padding:0;box-shadow:var(--shadow-sm)}
        .ts-header-inner{max-width:820px;margin:0 auto;padding:0 20px;height:62px;display:flex;align-items:center;gap:12px}
        .ts-back-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:var(--brand-primary-soft);color:var(--brand-primary);text-decoration:none;transition:all 0.18s;flex-shrink:0;border:1px solid var(--border-subtle)}
        .ts-back-btn:hover{background:var(--interactive-hover);transform:translateX(-2px)}
        .ts-header-surah-btn{display:flex;align-items:center;gap:10px;background:none;border:none;cursor:pointer;padding:0;flex:1;min-width:0;text-align:left}
        .ts-header-name{font-size:16px;font-weight:700;color:var(--text-primary);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ts-header-sub{font-size:11px;color:var(--text-muted);margin-top:1px}
        .ts-tafsir-select{padding:7px 10px;border-radius:10px;border:1px solid var(--border-default);background:var(--bg-card);font-size:11.5px;font-family:'Lexend',sans-serif;color:var(--text-secondary);cursor:pointer;outline:none;transition:border-color 0.15s;flex-shrink:0;max-width:160px}
        .ts-tafsir-select:hover,.ts-tafsir-select:focus{border-color:var(--brand-primary)}

        /* ── BODY ── */
        .ts-body{max-width:820px;margin:0 auto;padding:28px 20px 100px}

        /* ── BREADCRUMB ── */
        .ts-breadcrumb{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text-muted);margin-bottom:22px;flex-wrap:wrap}
        .ts-breadcrumb a{color:var(--text-secondary);text-decoration:none;transition:color 0.15s}
        .ts-breadcrumb a:hover{color:var(--brand-primary)}
        .ts-breadcrumb-sep{color:var(--border-strong)}

        /* ── HERO ── */
        .ts-hero{background:linear-gradient(135deg,var(--brand-primary) 0%,var(--brand-primary-hover) 55%,var(--brand-primary-active) 100%);border-radius:20px;padding:28px 28px 24px;margin-bottom:28px;position:relative;overflow:hidden;box-shadow:0 8px 32px var(--brand-primary-glow)}
        .ts-hero::before{content:'';position:absolute;top:-50px;right:-50px;width:220px;height:220px;background:rgba(255,255,255,0.07);border-radius:50%;pointer-events:none}
        .ts-hero::after{content:'';position:absolute;bottom:-40px;left:10px;width:140px;height:140px;background:rgba(255,255,255,0.04);border-radius:50%;pointer-events:none}
        .ts-hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.14);border-radius:20px;padding:4px 12px;font-size:10.5px;font-weight:700;color:rgba(255,255,255,0.95);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px}
        .ts-hero-title{font-size:clamp(22px,5vw,34px);font-weight: 800;color:white;line-height:1.15;margin-bottom:4px}
        .ts-hero-meaning{font-size:14px;color:rgba(255,255,255,0.8);margin-bottom:16px}
        .ts-hero-arabic{font-family:'Naskh IndoPak','Scheherazade New',serif!important;font-size:clamp(24px,4vw,36px);color:white;direction:rtl;margin-bottom:18px;line-height:1.6;text-shadow:0 1px 3px rgba(0,0,0,0.15)}
        .ts-hero-chips{display:flex;gap:8px;flex-wrap:wrap}
        .ts-hero-chip{background:rgba(255,255,255,0.13);border:1px solid rgba(255,255,255,0.18);border-radius:8px;padding:5px 12px;font-size:12px;color:white;font-weight:500}

        /* ── BISMILLAH ── */
        .ts-bismillah{text-align:center;padding:22px 16px 26px;font-family:'Naskh IndoPak','Scheherazade New',serif!important;font-size:28px;color:var(--text-primary);border-bottom:1px solid var(--border-subtle);margin-bottom:20px;line-height:1.7}

        /* ── VERSE CARD ── */
        .ts-verse-card{background:var(--bg-card);border:1px solid var(--border-default);border-radius:18px;margin-bottom:14px;overflow:hidden;transition:border-color 0.22s,box-shadow 0.22s,transform 0.15s}
        .ts-verse-card:hover{border-color:var(--brand-primary);box-shadow:var(--shadow-md);transform:translateY(-1px)}
        .ts-verse-card.ts-expanded{border-color:var(--brand-primary);box-shadow:var(--shadow-lg);transform:translateY(-1px)}

        /* ── VERSE TOP (Number + Arabic) ── */
        .ts-verse-top{padding:20px 20px 0 20px;display:flex;align-items:flex-start;gap:14px}
        .ts-verse-num{width:38px;height:38px;border-radius:50%;border:1.5px solid var(--brand-primary);background:var(--brand-primary-soft);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--brand-primary);flex-shrink:0;margin-top:6px;font-family:'Lexend',sans-serif}
        .ts-arabic-block{flex:1;direction:rtl;text-align:right}
        .ts-arabic{font-family:'Naskh IndoPak','Scheherazade New','Traditional Arabic',serif!important;font-size:26px;line-height:2;color:var(--text-arabic)}
        @media(max-width:640px){.ts-arabic{font-size:21px}}

        /* ── TRANSLATION ── */
        .ts-translation-block{padding:2px 20px 16px 72px;direction:ltr}
        .ts-translation-label{font-size:10.5px;font-weight:700;color:var(--brand-primary);text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:5px}
        .ts-translation-text{font-size:14.5px;line-height:1.85;color:var(--text-secondary);font-style:italic}

        /* ── DIVIDER ── */
        .ts-divider{height:1px;background:linear-gradient(90deg,transparent,var(--border-strong),transparent);margin:0 20px}

        /* ── ACTIONS ROW (Tafseer button below arabic+translation) ── */
        .ts-actions-row{padding:12px 20px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .ts-tafseer-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;border:1.5px solid var(--brand-primary);background:var(--brand-primary-soft);cursor:pointer;font-size:13px;font-weight:600;color:var(--brand-primary);transition:all 0.18s;font-family:'Lexend',sans-serif;letter-spacing:0.01em}
        .ts-tafseer-btn:hover{background:var(--interactive-hover);border-color:var(--brand-primary-hover);box-shadow:var(--shadow-sm)}
        .ts-tafseer-btn.ts-active{background:var(--brand-primary-soft);border-color:var(--brand-primary-hover);color:var(--brand-primary)}
        .ts-verse-key-badge{font-size:11px;color:var(--text-muted);font-weight:500;font-family:'Lexend',sans-serif}

        /* ── TAFSIR PANEL ── */
        .ts-tafsir-panel{background:var(--bg-surface);border-top:1.5px solid var(--border-default);padding:22px 22px 22px;animation:tsIn 0.22s ease-out}
        @keyframes tsIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .ts-tafsir-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border-subtle)}
        .ts-tafsir-icon{width:30px;height:30px;border-radius:8px;background:var(--brand-primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ts-tafsir-meta{flex:1;min-width:0}
        .ts-tafsir-title{font-size:12px;font-weight:700;color:var(--brand-primary);text-transform:uppercase;letter-spacing:0.08em;display:block}
        .ts-tafsir-subtitle{font-size:11px;color:var(--text-muted);margin-top:1px}
        .ts-tafsir-text{font-size:14px;line-height:1.95;color:var(--text-secondary);white-space:pre-line;font-family:'Inter','Lexend',sans-serif}
        .ts-tafsir-text::-webkit-scrollbar{width:4px}
        .ts-tafsir-text::-webkit-scrollbar-thumb{background:var(--brand-primary-soft);border-radius:2px}

        /* ── SPINNER ── */
        .ts-spinner{width:20px;height:20px;border:2px solid var(--brand-primary-soft);border-top-color:var(--brand-primary);border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0}
        .ts-loading-row{display:flex;align-items:center;gap:12px;padding:8px 0;font-size:13px;color:var(--text-muted);font-family:'Lexend',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── NAVIGATION ── */
        .ts-nav{display:flex;justify-content:space-between;align-items:center;margin-top:44px;gap:12px;flex-wrap:wrap}
        .ts-nav-btn{display:flex;align-items:center;gap:8px;padding:13px 20px;border-radius:14px;text-decoration:none;font-size:13px;font-weight:600;color:var(--text-secondary);background:var(--bg-card);border:1px solid var(--border-default);transition:all 0.2s;font-family:'Lexend',sans-serif;box-shadow:var(--shadow-sm)}
        .ts-nav-btn:hover{border-color:var(--brand-primary);color:var(--brand-primary);box-shadow:var(--shadow-md);transform:translateY(-1px)}
        .ts-nav-btn-center{background:var(--brand-primary-soft);border-color:var(--brand-primary);color:var(--brand-primary)}
        .ts-nav-btn-center:hover{background:var(--interactive-hover)!important;border-color:var(--brand-primary-hover)!important;color:var(--brand-primary)!important}

        /* ── SURAH PICKER ── */
        .ts-picker{position:fixed;inset:0;z-index:200;display:flex;align-items:flex-start;justify-content:center;padding-top:72px;background:var(--bg-overlay);backdrop-filter:var(--glass-blur)}
        .ts-picker-box{background:var(--bg-card);border-radius:22px;width:min(420px,calc(100vw - 32px));max-height:72vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--shadow-xl);animation:pkIn 0.2s ease-out}
        @keyframes pkIn{from{opacity:0;transform:translateY(-12px)scale(0.97)}to{opacity:1;transform:translateY(0)scale(1)}}
        .ts-picker-header{padding:18px 18px 14px;border-bottom:1px solid var(--border-subtle);flex-shrink:0}
        .ts-picker-search{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg-surface);border-radius:12px;border:1px solid var(--border-default);margin-top:12px}
        .ts-picker-search input{flex:1;background:transparent;border:none;outline:none;font-size:13px;color:var(--text-primary);font-family:'Lexend',sans-serif}
        .ts-picker-list{overflow-y:auto;flex:1}
        .ts-picker-list::-webkit-scrollbar{width:4px}
        .ts-picker-list::-webkit-scrollbar-thumb{background:var(--brand-primary-soft);border-radius:2px}
        .ts-picker-item{display:flex;align-items:center;gap:12px;padding:11px 18px;cursor:pointer;text-decoration:none;border-bottom:1px solid var(--border-subtle);transition:background 0.12s}
        .ts-picker-item:hover{background:var(--interactive-hover)}
        .ts-picker-item.ts-active-surah{background:var(--brand-primary-soft)}

        /* ── SKELETON ── */
        .ts-skeleton{border-radius:18px;overflow:hidden;margin-bottom:14px;background:white;border:1px solid #e8eef2}
        .dark .ts-skeleton{background:#101c16;border-color:#1e3a2a}
        .ts-skel-line{height:14px;border-radius:7px;background:linear-gradient(90deg,#f1f5f9 25%,#e8eef2 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
        .dark .ts-skel-line{background:linear-gradient(90deg,#1e3a2a 25%,#243d2e 50%,#1e3a2a 75%);background-size:200% 100%}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

            <div className="ts-shell">
                {/* ── HEADER ── */}
                <header className="ts-header" role="banner">
                    <div className="ts-header-inner">
                        <Link href="/" className="ts-back-btn" aria-label="Go home">
                            <ChevronLeft size={18} />
                        </Link>
                        <button className="ts-header-surah-btn" onClick={() => setShowSurahPicker(true)} aria-label="Change surah">
                            <div style={{ minWidth: 0 }}>
                                <div className="ts-header-name">{meta.name}</div>
                                <div className="ts-header-sub">Tafseer · {meta.v} Verses · {meta.t}</div>
                            </div>
                            <ChevronDown size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        </button>
                    </div>
                </header>

                {/* ── BODY ── */}
                <main className="ts-body">
                    {/* Breadcrumb */}
                    <nav className="ts-breadcrumb" aria-label="Breadcrumb">
                        <Link href="/">Home</Link>
                        <span className="ts-breadcrumb-sep">›</span>
                        <Link href="/tafseer">Tafseer</Link>
                        <span className="ts-breadcrumb-sep">›</span>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>{meta.name}</span>
                    </nav>

                    {/* Hero */}
                    <div className="ts-hero" role="region" aria-label={`${meta.name} overview`}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div className="ts-hero-badge">
                                <span>📖</span>
                                {meta.t} · Surah {meta.num}
                            </div>
                            <h1 className="ts-hero-title">{meta.name}</h1>
                            <p className="ts-hero-meaning">{meta.meaning}</p>
                            <div className="ts-hero-arabic">{meta.ar}</div>
                            <div className="ts-hero-chips">
                                <div className="ts-hero-chip">📜 {meta.v} Verses</div>
                                <div className="ts-hero-chip">📚 Ibn Kathir · Ma'arif · Tazkirul</div>
                            </div>
                        </div>
                    </div>

                    {/* Loading skeletons */}
                    {loading && (
                        <div>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="ts-skeleton" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                                        <div className="ts-skel-line" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                            <div className="ts-skel-line" style={{ width: '85%', height: 18 }} />
                                            <div className="ts-skel-line" style={{ width: '65%', height: 18 }} />
                                        </div>
                                    </div>
                                    <div className="ts-skel-line" style={{ width: '70%', marginBottom: 8 }} />
                                    <div className="ts-skel-line" style={{ width: '50%' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Verse list */}
                    {!loading && (
                        <>
                            {/* Bismillah */}
                            {meta.num !== 1 && meta.num !== 9 && (
                                <div className="ts-bismillah">
                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </div>
                            )}

                            {verses.map(verse => {
                                return (
                                    <article
                                        key={verse.num}
                                        id={`verse-${verse.num}`}
                                        className="ts-verse-card"
                                    >
                                        {/* Arabic text + verse number */}
                                        <div className="ts-verse-top">
                                            <div className="ts-verse-num" aria-label={`Verse ${verse.num}`}>{verse.num}</div>
                                            <div className="ts-arabic-block">
                                                <p className="ts-arabic">{verse.arabic}</p>
                                            </div>
                                        </div>

                                        {/* Translation */}
                                        <div className="ts-translation-block">
                                            <span className="ts-translation-label">Sahih International</span>
                                            <p className="ts-translation-text">{verse.translation}</p>
                                        </div>

                                        {/* Divider */}
                                        <div className="ts-divider" />

                                        {/* Actions row */}
                                        <div className="ts-actions-row">
                                            <button
                                                className="ts-tafseer-btn"
                                                onClick={() => setModalVerseNum(verse.num)}
                                                aria-label={`Open Tafseer for verse ${verse.num}`}
                                            >
                                                <BookOpen size={14} />
                                                Show Tafseer
                                                <ChevronDown size={13} />
                                            </button>
                                            <span className="ts-verse-key-badge">{verse.key}</span>
                                        </div>
                                    </article>
                                );
                            })}

                            {/* Navigation */}
                            <nav className="ts-nav" aria-label="Surah navigation">
                                {prevSurah ? (
                                    <Link href={`/tafseer/${prevSurah.num}`} className="ts-nav-btn">
                                        <ChevronLeft size={16} />
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Previous</div>
                                            <div>{prevSurah.name}</div>
                                        </div>
                                    </Link>
                                ) : <div />}
                                <Link href="/tafseer" className="ts-nav-btn ts-nav-btn-center" style={{ flexShrink: 0 }}>
                                    <BookOpen size={15} />
                                    All Surahs
                                </Link>
                                {nextSurah ? (
                                    <Link href={`/tafseer/${nextSurah.num}`} className="ts-nav-btn">
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Next</div>
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
                <div className="ts-picker" role="dialog" aria-modal="true" aria-label="Select Surah" onClick={() => setShowSurahPicker(false)}>
                    <div className="ts-picker-box" onClick={e => e.stopPropagation()}>
                        <div className="ts-picker-header">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: "'Lexend',sans-serif" }}>Select Surah</h2>
                                <button
                                    onClick={() => setShowSurahPicker(false)}
                                    style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                                    aria-label="Close picker"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="ts-picker-search">
                                <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                <input
                                    type="text"
                                    placeholder="Search by name or number…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    autoFocus
                                    aria-label="Search surahs"
                                />
                            </div>
                        </div>
                        <div className="ts-picker-list">
                            {surahPickerFiltered.map(s => (
                                <Link
                                    key={s.num}
                                    href={`/tafseer/${s.num}`}
                                    className={`ts-picker-item${s.num === surahNum ? ' ts-active-surah' : ''}`}
                                    onClick={() => { setShowSurahPicker(false); setSearchQuery(''); }}
                                >
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 9,
                                        background: s.num === surahNum ? 'rgba(245,158,11,0.12)' : '#f1f5f9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 700,
                                        color: s.num === surahNum ? '#f59e0b' : '#94a3b8',
                                        flexShrink: 0,
                                    }}>
                                        {s.num}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: s.num === surahNum ? '#f59e0b' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{s.meaning} · {s.v} verses</p>
                                    </div>
                                    <span style={{ fontFamily: "'Naskh IndoPak',serif", fontSize: 16, color: '#475569', direction: 'rtl', flexShrink: 0 }}>{s.ar}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAFSEER MODAL ── */}
            {(() => {
                const modalVerse = modalVerseNum !== null ? verses.find(v => v.num === modalVerseNum) : null;
                const modalVerseObj = modalVerse ? {
                    id: modalVerse.num,
                    verse_number: modalVerse.num,
                    verse_key: modalVerse.key,
                    text_uthmani: modalVerse.arabic,
                    translations: [{ text: modalVerse.translation }],
                } : null;
                const allVerseObjs = verses.map(v => ({
                    id: v.num,
                    verse_number: v.num,
                    verse_key: v.key,
                    text_uthmani: v.arabic,
                    translations: [{ text: v.translation }],
                }));
                const chapterObj = meta ? {
                    id: surahNum,
                    name_arabic: meta.ar,
                    name_simple: meta.name,
                    translated_name: { name: meta.meaning },
                    verses_count: meta.v,
                    revelation_place: meta.t,
                } : null;
                return (
                    <TafseerModal
                        isOpen={modalVerseNum !== null}
                        onClose={() => setModalVerseNum(null)}
                        verse={modalVerseObj}
                        chapter={chapterObj}
                        allVerses={allVerseObjs}
                        onNavigate={(num) => setModalVerseNum(num)}
                        surahNumber={surahNum}
                        cleanArabicText={(t) => t}
                    />
                );
            })()}
        </>
    );
}
