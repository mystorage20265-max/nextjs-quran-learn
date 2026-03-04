'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, MapPin } from 'lucide-react';

const SURAHS = [
    { num: 1, ar: 'الفاتحة', name: 'Al-Fatihah', meaning: 'The Opening', v: 7, t: 'Meccan', desc: 'The opening chapter — a prayer for guidance repeated in every salaah.' },
    { num: 2, ar: 'البقرة', name: 'Al-Baqarah', meaning: 'The Cow', v: 286, t: 'Medinan', desc: 'The longest surah covering law, faith, and the story of the cow.' },
    { num: 3, ar: 'آل عمران', name: 'Al-Imran', meaning: 'Family of Imran', v: 200, t: 'Medinan', desc: "Covers the family of Imran, Jesus' birth, and the Battle of Uhud." },
    { num: 4, ar: 'النساء', name: 'An-Nisa', meaning: 'The Women', v: 176, t: 'Medinan', desc: 'Focuses on rights, inheritance, and justice — especially for women.' },
    { num: 5, ar: 'المائدة', name: "Al-Ma'idah", meaning: 'The Table Spread', v: 120, t: 'Medinan', desc: 'The supplication for food from heaven and completion of the deen.' },
    { num: 6, ar: 'الأنعام', name: "Al-An'am", meaning: 'The Cattle', v: 165, t: 'Meccan', desc: 'Discusses tawheed, prophethood, and the rejection of polytheism.' },
    { num: 7, ar: 'الأعراف', name: "Al-A'raf", meaning: 'The Heights', v: 206, t: 'Meccan', desc: 'Stories of past nations and the realm between paradise and hellfire.' },
    { num: 18, ar: 'الكهف', name: 'Al-Kahf', meaning: 'The Cave', v: 110, t: 'Meccan', desc: 'Four parables: the Companions of the Cave, two men, Musa & Khidr, Dhul-Qarnayn.' },
    { num: 36, ar: 'يس', name: 'Ya-Sin', meaning: 'Ya-Sin', v: 83, t: 'Meccan', desc: "Called the 'heart of the Quran', focuses on resurrection and God's power." },
    { num: 55, ar: 'الرحمن', name: 'Ar-Rahman', meaning: 'The Beneficent', v: 78, t: 'Medinan', desc: "Celebrates Allah's infinite blessings with the refrain 'Which of your Lord's favors will you deny?'" },
    { num: 67, ar: 'الملك', name: 'Al-Mulk', meaning: 'The Sovereignty', v: 30, t: 'Meccan', desc: 'On the sovereignty of Allah and its intercession for the reciter on the Day of Judgement.' },
    { num: 112, ar: 'الإخلاص', name: 'Al-Ikhlas', meaning: 'The Sincerity', v: 4, t: 'Meccan', desc: 'Pure monotheism — worth a third of the Quran in blessings.' },
    { num: 113, ar: 'الفلق', name: 'Al-Falaq', meaning: 'The Daybreak', v: 5, t: 'Meccan', desc: 'Seeking refuge from the harms of creation, night, and witchcraft.' },
    { num: 114, ar: 'الناس', name: 'An-Nas', meaning: 'The Mankind', v: 6, t: 'Meccan', desc: 'Seeking refuge in Allah from the whisperings of Shaytan and mankind.' },
].concat(
    [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
        33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 56, 57,
        58, 59, 60, 61, 62, 63, 64, 65, 66, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81,
        82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103,
        104, 105, 106, 107, 108, 109, 110, 111].map(n => {
            const BASE: Record<number, { ar: string; name: string; meaning: string; v: number; t: string }> = {
                8: { ar: 'الأنفال', name: 'Al-Anfal', meaning: 'The Spoils of War', v: 75, t: 'Medinan' },
                9: { ar: 'التوبة', name: 'At-Tawbah', meaning: 'The Repentance', v: 129, t: 'Medinan' },
                10: { ar: 'يونس', name: 'Yunus', meaning: 'Jonah', v: 109, t: 'Meccan' },
                11: { ar: 'هود', name: 'Hud', meaning: 'Hud', v: 123, t: 'Meccan' },
                12: { ar: 'يوسف', name: 'Yusuf', meaning: 'Joseph', v: 111, t: 'Meccan' },
                13: { ar: 'الرعد', name: "Ar-Ra'd", meaning: 'The Thunder', v: 43, t: 'Medinan' },
                14: { ar: 'إبراهيم', name: 'Ibrahim', meaning: 'Abraham', v: 52, t: 'Meccan' },
                15: { ar: 'الحجر', name: 'Al-Hijr', meaning: 'The Rocky Tract', v: 99, t: 'Meccan' },
                16: { ar: 'النحل', name: 'An-Nahl', meaning: 'The Bee', v: 128, t: 'Meccan' },
                17: { ar: 'الإسراء', name: "Al-Isra'", meaning: 'The Night Journey', v: 111, t: 'Meccan' },
                19: { ar: 'مريم', name: 'Maryam', meaning: 'Mary', v: 98, t: 'Meccan' },
                20: { ar: 'طه', name: 'Ta-Ha', meaning: 'Ta-Ha', v: 135, t: 'Meccan' },
                21: { ar: 'الأنبياء', name: "Al-Anbiya'", meaning: 'The Prophets', v: 112, t: 'Meccan' },
                22: { ar: 'الحج', name: 'Al-Hajj', meaning: 'The Pilgrimage', v: 78, t: 'Medinan' },
                23: { ar: 'المؤمنون', name: "Al-Mu'minun", meaning: 'The Believers', v: 118, t: 'Meccan' },
                24: { ar: 'النور', name: 'An-Nur', meaning: 'The Light', v: 64, t: 'Medinan' },
                25: { ar: 'الفرقان', name: 'Al-Furqan', meaning: 'The Criterion', v: 77, t: 'Meccan' },
                26: { ar: 'الشعراء', name: "Ash-Shu'ara'", meaning: 'The Poets', v: 227, t: 'Meccan' },
                27: { ar: 'النمل', name: 'An-Naml', meaning: 'The Ant', v: 93, t: 'Meccan' },
                28: { ar: 'القصص', name: 'Al-Qasas', meaning: 'The Stories', v: 88, t: 'Meccan' },
                29: { ar: 'العنكبوت', name: 'Al-Ankabut', meaning: 'The Spider', v: 69, t: 'Meccan' },
                30: { ar: 'الروم', name: 'Ar-Rum', meaning: 'The Romans', v: 60, t: 'Meccan' },
                31: { ar: 'لقمان', name: 'Luqman', meaning: 'Luqman', v: 34, t: 'Meccan' },
                32: { ar: 'السجدة', name: 'As-Sajdah', meaning: 'The Prostration', v: 30, t: 'Meccan' },
                33: { ar: 'الأحزاب', name: 'Al-Ahzab', meaning: 'The Combined Forces', v: 73, t: 'Medinan' },
                34: { ar: 'سبأ', name: 'Saba', meaning: 'Sheba', v: 54, t: 'Meccan' },
                35: { ar: 'فاطر', name: 'Fatir', meaning: 'Originator', v: 45, t: 'Meccan' },
                37: { ar: 'الصافات', name: 'As-Saffat', meaning: 'Those Lined Up', v: 182, t: 'Meccan' },
                38: { ar: 'ص', name: 'Sad', meaning: 'Sad', v: 88, t: 'Meccan' },
                39: { ar: 'الزمر', name: 'Az-Zumar', meaning: 'The Groups', v: 75, t: 'Meccan' },
                40: { ar: 'غافر', name: 'Ghafir', meaning: 'The Forgiver', v: 85, t: 'Meccan' },
                41: { ar: 'فصلت', name: 'Fussilat', meaning: 'Explained in Detail', v: 54, t: 'Meccan' },
                42: { ar: 'الشورى', name: 'Ash-Shuraa', meaning: 'The Consultation', v: 53, t: 'Meccan' },
                43: { ar: 'الزخرف', name: 'Az-Zukhruf', meaning: 'The Gold Adornments', v: 89, t: 'Meccan' },
                44: { ar: 'الدخان', name: 'Ad-Dukhan', meaning: 'The Smoke', v: 59, t: 'Meccan' },
                45: { ar: 'الجاثية', name: 'Al-Jathiyah', meaning: 'The Crouching', v: 37, t: 'Meccan' },
                46: { ar: 'الأحقاف', name: 'Al-Ahqaf', meaning: 'The Wind-Curved Dunes', v: 35, t: 'Meccan' },
                47: { ar: 'محمد', name: 'Muhammad', meaning: 'Muhammad', v: 38, t: 'Medinan' },
                48: { ar: 'الفتح', name: 'Al-Fath', meaning: 'The Victory', v: 29, t: 'Medinan' },
                49: { ar: 'الحجرات', name: 'Al-Hujurat', meaning: 'The Rooms', v: 18, t: 'Medinan' },
                50: { ar: 'ق', name: 'Qaf', meaning: 'Qaf', v: 45, t: 'Meccan' },
                51: { ar: 'الذاريات', name: 'Adh-Dhariyat', meaning: 'The Scattering Winds', v: 60, t: 'Meccan' },
                52: { ar: 'الطور', name: 'At-Tur', meaning: 'The Mount', v: 49, t: 'Meccan' },
                53: { ar: 'النجم', name: 'An-Najm', meaning: 'The Star', v: 62, t: 'Meccan' },
                54: { ar: 'القمر', name: 'Al-Qamar', meaning: 'The Moon', v: 55, t: 'Meccan' },
                56: { ar: 'الواقعة', name: "Al-Waqi'ah", meaning: 'The Inevitable', v: 96, t: 'Meccan' },
                57: { ar: 'الحديد', name: 'Al-Hadid', meaning: 'The Iron', v: 29, t: 'Medinan' },
                58: { ar: 'المجادلة', name: 'Al-Mujadila', meaning: 'The Pleading Woman', v: 22, t: 'Medinan' },
                59: { ar: 'الحشر', name: 'Al-Hashr', meaning: 'The Exile', v: 24, t: 'Medinan' },
                60: { ar: 'الممتحنة', name: 'Al-Mumtahanah', meaning: 'She That Is Examined', v: 13, t: 'Medinan' },
                61: { ar: 'الصف', name: 'As-Saf', meaning: 'The Ranks', v: 14, t: 'Medinan' },
                62: { ar: 'الجمعة', name: "Al-Jumu'ah", meaning: 'The Friday', v: 11, t: 'Medinan' },
                63: { ar: 'المنافقون', name: 'Al-Munafiqun', meaning: 'The Hypocrites', v: 11, t: 'Medinan' },
                64: { ar: 'التغابن', name: 'At-Taghabun', meaning: 'The Mutual Disillusion', v: 18, t: 'Medinan' },
                65: { ar: 'الطلاق', name: 'At-Talaq', meaning: 'The Divorce', v: 12, t: 'Medinan' },
                66: { ar: 'التحريم', name: 'At-Tahrim', meaning: 'The Prohibition', v: 12, t: 'Medinan' },
                68: { ar: 'القلم', name: 'Al-Qalam', meaning: 'The Pen', v: 52, t: 'Meccan' },
                69: { ar: 'الحاقة', name: 'Al-Haqqah', meaning: 'The Reality', v: 52, t: 'Meccan' },
                70: { ar: 'المعارج', name: "Al-Ma'arij", meaning: 'The Ascending Stairways', v: 44, t: 'Meccan' },
                71: { ar: 'نوح', name: 'Nuh', meaning: 'Noah', v: 28, t: 'Meccan' },
                72: { ar: 'الجن', name: 'Al-Jinn', meaning: 'The Jinn', v: 28, t: 'Meccan' },
                73: { ar: 'المزمل', name: 'Al-Muzzammil', meaning: 'The Enshrouded One', v: 20, t: 'Meccan' },
                74: { ar: 'المدثر', name: 'Al-Muddaththir', meaning: 'The Cloaked One', v: 56, t: 'Meccan' },
                75: { ar: 'القيامة', name: 'Al-Qiyamah', meaning: 'The Resurrection', v: 40, t: 'Meccan' },
                76: { ar: 'الإنسان', name: 'Al-Insan', meaning: 'The Man', v: 31, t: 'Medinan' },
                77: { ar: 'المرسلات', name: 'Al-Mursalat', meaning: 'The Emissaries', v: 50, t: 'Meccan' },
                78: { ar: 'النبأ', name: "An-Naba'", meaning: 'The Tidings', v: 40, t: 'Meccan' },
                79: { ar: 'النازعات', name: "An-Nazi'at", meaning: 'Those Who Drag Forth', v: 46, t: 'Meccan' },
                80: { ar: 'عبس', name: 'Abasa', meaning: 'He Frowned', v: 42, t: 'Meccan' },
                81: { ar: 'التكوير', name: 'At-Takwir', meaning: 'The Overthrowing', v: 29, t: 'Meccan' },
                82: { ar: 'الانفطار', name: 'Al-Infitar', meaning: 'The Cleaving', v: 19, t: 'Meccan' },
                83: { ar: 'المطففين', name: 'Al-Mutaffifin', meaning: 'The Defrauding', v: 36, t: 'Meccan' },
                84: { ar: 'الانشقاق', name: 'Al-Inshiqaq', meaning: 'The Sundering', v: 25, t: 'Meccan' },
                85: { ar: 'البروج', name: 'Al-Buruj', meaning: 'The Mansions of Stars', v: 22, t: 'Meccan' },
                86: { ar: 'الطارق', name: 'At-Tariq', meaning: 'The Morning Star', v: 17, t: 'Meccan' },
                87: { ar: 'الأعلى', name: "Al-A'la", meaning: 'The Most High', v: 19, t: 'Meccan' },
                88: { ar: 'الغاشية', name: 'Al-Ghashiyah', meaning: 'The Overwhelming', v: 26, t: 'Meccan' },
                89: { ar: 'الفجر', name: 'Al-Fajr', meaning: 'The Dawn', v: 30, t: 'Meccan' },
                90: { ar: 'البلد', name: 'Al-Balad', meaning: 'The City', v: 20, t: 'Meccan' },
                91: { ar: 'الشمس', name: 'Ash-Shams', meaning: 'The Sun', v: 15, t: 'Meccan' },
                92: { ar: 'الليل', name: 'Al-Layl', meaning: 'The Night', v: 21, t: 'Meccan' },
                93: { ar: 'الضحى', name: 'Ad-Duhaa', meaning: 'The Morning Hours', v: 11, t: 'Meccan' },
                94: { ar: 'الشرح', name: 'Ash-Sharh', meaning: 'The Relief', v: 8, t: 'Meccan' },
                95: { ar: 'التين', name: 'At-Tin', meaning: 'The Fig', v: 8, t: 'Meccan' },
                96: { ar: 'العلق', name: "Al-'Alaq", meaning: 'The Clot', v: 19, t: 'Meccan' },
                97: { ar: 'القدر', name: 'Al-Qadr', meaning: 'The Power', v: 5, t: 'Meccan' },
                98: { ar: 'البينة', name: 'Al-Bayyinah', meaning: 'The Clear Proof', v: 8, t: 'Medinan' },
                99: { ar: 'الزلزلة', name: 'Az-Zalzalah', meaning: 'The Earthquake', v: 8, t: 'Medinan' },
                100: { ar: 'العاديات', name: "Al-'Adiyat", meaning: 'The Courser', v: 11, t: 'Meccan' },
                101: { ar: 'القارعة', name: "Al-Qari'ah", meaning: 'The Calamity', v: 11, t: 'Meccan' },
                102: { ar: 'التكاثر', name: 'At-Takathur', meaning: 'The Rivalry in World', v: 8, t: 'Meccan' },
                103: { ar: 'العصر', name: "Al-'Asr", meaning: 'The Declining Day', v: 3, t: 'Meccan' },
                104: { ar: 'الهمزة', name: 'Al-Humazah', meaning: 'The Traducer', v: 9, t: 'Meccan' },
                105: { ar: 'الفيل', name: 'Al-Fil', meaning: 'The Elephant', v: 5, t: 'Meccan' },
                106: { ar: 'قريش', name: 'Quraysh', meaning: 'Quraysh', v: 4, t: 'Meccan' },
                107: { ar: 'الماعون', name: "Al-Ma'un", meaning: 'The Small Kindnesses', v: 7, t: 'Meccan' },
                108: { ar: 'الكوثر', name: 'Al-Kawthar', meaning: 'The Abundance', v: 3, t: 'Meccan' },
                109: { ar: 'الكافرون', name: 'Al-Kafirun', meaning: 'The Disbelievers', v: 6, t: 'Meccan' },
                110: { ar: 'النصر', name: 'An-Nasr', meaning: 'The Divine Support', v: 3, t: 'Medinan' },
                111: { ar: 'المسد', name: 'Al-Masad', meaning: 'The Palm Fiber', v: 5, t: 'Meccan' },
            };
            const d = BASE[n];
            if (!d) return null;
            return { num: n, ...d, desc: `${d.meaning} — ${d.v} verses from ${d.t} period.` };
        }).filter(Boolean) as any[]
).sort((a, b) => a.num - b.num);

const FEATURED = [1, 2, 18, 36, 55, 67, 112, 113, 114];

export default function TafseerIndexPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'All' | 'Meccan' | 'Medinan'>('All');
    const [showAll, setShowAll] = useState(false);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return SURAHS.filter(s => {
            const matchQ = !q || s.name.toLowerCase().includes(q) || s.ar.includes(search) || s.meaning.toLowerCase().includes(q) || String(s.num) === search;
            const matchT = filter === 'All' || s.t === filter;
            return matchQ && matchT;
        });
    }, [search, filter]);

    const displayed = showAll || search ? filtered : filtered.slice(0, 24);
    const featuredSurahs = SURAHS.filter(s => FEATURED.includes(s.num));

    return (
        <>
            <style>{`
        *{box-sizing:border-box}
        .ti-shell{min-height:100vh;background:#f6f8f6;font-family:'Lexend','Figtree',sans-serif}
        .dark .ti-shell{background:#0d1b12}
        .ti-header{background:rgba(246,248,246,0.97);backdrop-filter:blur(12px);border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:50}
        .dark .ti-header{background:rgba(13,27,18,0.97);border-color:#1e3a2a}
        .ti-header-inner{max-width:900px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;gap:12px}
        .ti-body{max-width:900px;margin:0 auto;padding:32px 20px 80px}
        .ti-hero{background:linear-gradient(135deg,#09722a 0%,#11d442 60%,#059669 100%);padding:48px 32px;text-align:center;position:relative;overflow:hidden}
        .ti-hero::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle at 2px 2px,rgba(255,255,255,0.06) 1px,transparent 0);background-size:28px 28px}
        .ti-card{background:white;border:1px solid #e2e8f0;border-radius:14px;padding:18px;transition:all 0.2s;cursor:pointer;display:flex;flex-direction:column;gap:12px}
        .dark .ti-card{background:#111f16;border-color:#1e3a2a}
        .ti-card:hover{transform:translateY(-3px);border-color:rgba(17,212,66,0.35);box-shadow:0 8px 32px rgba(17,212,66,0.12)}
        .ti-featured-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:40px}
        .ti-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
        .ti-filter-btn{padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.15s;font-family:'Lexend',sans-serif}
        .ti-search{display:flex;align-items:center;gap:10px;padding:12px 16px;background:white;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
        .dark .ti-search{background:#111f16;border-color:#1e3a2a}
        .ti-scroll::-webkit-scrollbar{width:4px}
        .ti-scroll::-webkit-scrollbar-thumb{background:rgba(17,212,66,0.3);border-radius:2px}
      `}</style>

            <div className="ti-shell">
                {/* Header */}
                <header className="ti-header">
                    <div className="ti-header-inner">
                        <Link href="/" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none', transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#11d442'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
                        >
                            <span style={{ fontSize: 20 }}>←</span>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                            <div style={{ background: 'rgba(17,212,66,0.12)', borderRadius: 10, padding: 8 }}>
                                <BookOpen size={20} style={{ color: '#11d442' }} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Tafseer</h1>
                                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Quran Explanation • 114 Surahs</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero banner */}
                <div className="ti-hero">
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 16 }}>
                            <BookOpen size={14} style={{ color: 'white' }} />
                            <span style={{ color: 'white', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ibn Kathir · Ma'arif · Tazkirul</span>
                        </div>
                        <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(24px,5vw,40px)', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                            Understand the Quran
                        </h2>
                        <p style={{ margin: '0 auto', fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 500, lineHeight: 1.6 }}>
                            Verse-by-verse explanations from world-renowned scholars. Deepen your connection with the words of Allah.
                        </p>
                        <div style={{ fontFamily: "'Naskh IndoPak','Scheherazade New',serif", fontSize: 24, color: 'rgba(255,255,255,0.7)', marginTop: 20 }}>
                            وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>"And recite the Quran with measured recitation." — Al-Muzzammil 73:4</p>
                    </div>
                </div>

                <main className="ti-body">
                    {/* Breadcrumb */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 28, flexWrap: 'wrap' }}>
                        <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
                        <span>›</span>
                        <span style={{ color: '#11d442', fontWeight: 600 }}>Tafseer</span>
                    </nav>

                    {/* Featured Surahs */}
                    <section style={{ marginBottom: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 4, height: 20, background: '#11d442', borderRadius: 2 }} />
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Popular Surahs</h2>
                        </div>
                        <div className="ti-featured-grid">
                            {featuredSurahs.map(s => (
                                <Link key={s.num} href={`/tafseer/${s.num}`} style={{ textDecoration: 'none' }}>
                                    <div className="ti-card">
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(17,212,66,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#11d442', fontSize: 14 }}>{s.num}</div>
                                            <span style={{ fontFamily: "'Naskh IndoPak',serif", fontSize: 22, color: '#1e293b', direction: 'rtl' }}>{s.ar}</span>
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{s.name}</h3>
                                            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#94a3b8' }}>{s.meaning} · {s.v} verses</p>
                                            {s.desc && <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.t === 'Meccan' ? '#11d442' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <MapPin size={10} /> {s.t}
                                            </span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#11d442', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                Read Tafseer →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* All Surahs section */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 4, height: 20, background: '#11d442', borderRadius: 2 }} />
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>All Surahs</h2>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>({filtered.length})</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {(['All', 'Meccan', 'Medinan'] as const).map(f => (
                                    <button key={f} className="ti-filter-btn" onClick={() => setFilter(f)}
                                        style={{ background: filter === f ? '#11d442' : 'white', color: filter === f ? 'white' : '#64748b', border: filter === f ? 'none' : '1px solid #e2e8f0' }}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="ti-search" style={{ marginBottom: 20 }}>
                            <Search size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            <input type="text" placeholder="Search surah by name, number or meaning…" value={search} onChange={e => setSearch(e.target.value)}
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#334155' }} />
                        </div>

                        <div className="ti-grid">
                            {displayed.map(s => (
                                <Link key={s.num} href={`/tafseer/${s.num}`} style={{ textDecoration: 'none' }}>
                                    <div className="ti-card" style={{ gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(17,212,66,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#11d442', fontSize: 12, flexShrink: 0 }}>{s.num}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                                                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{s.meaning}</p>
                                            </div>
                                            <span style={{ fontFamily: "'Naskh IndoPak',serif", fontSize: 18, color: '#475569', flexShrink: 0 }}>{s.ar}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 10, color: s.t === 'Meccan' ? '#11d442' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.t} · {s.v}v</span>
                                            <span style={{ fontSize: 11, color: '#11d442', fontWeight: 600 }}>Read →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {!search && filtered.length > 24 && (
                            <div style={{ textAlign: 'center', marginTop: 24 }}>
                                <button onClick={() => setShowAll(v => !v)}
                                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 28px', borderRadius: 12, fontWeight: 600, fontSize: 13.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#334155', fontFamily: "'Lexend',sans-serif" }}>
                                    {showAll ? 'Show Less' : `Show All ${filtered.length} Surahs`}
                                    <span style={{ display: 'inline-block', transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                                </button>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}
