'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import './tafseer.css';

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

const FILTERS = [
  { id: 'All',     label: 'All Surahs',    icon: 'library_books',  desc: '114 surahs', color: '#f59e0b' },
  { id: 'Meccan',  label: 'Meccan',        icon: 'wb_sunny',       desc: 'Revealed in Makkah', color: '#d97706' },
  { id: 'Medinan', label: 'Medinan',       icon: 'location_city',  desc: 'Revealed in Madinah', color: '#b45309' },
  { id: 'Popular', label: 'Popular',       icon: 'star',           desc: 'Most read surahs', color: '#92400e' },
];

const ARABIC_FONT = "'Naskh IndoPak', serif";

export default function TafseerIndexPage() {
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [showAll, setShowAll] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return SURAHS.filter(s => {
            const matchQ = !q || s.name.toLowerCase().includes(q) || s.ar.includes(search) || s.meaning.toLowerCase().includes(q) || String(s.num) === search;
            const matchT = activeFilter === 'All'
              ? true
              : activeFilter === 'Popular'
              ? FEATURED.includes(s.num)
              : s.t === activeFilter;
            return matchQ && matchT;
        });
    }, [search, activeFilter]);

    const displayed = showAll || search ? filtered : filtered.slice(0, 24);
    const activeFilterData = FILTERS.find(f => f.id === activeFilter) ?? FILTERS[0];

    return (
      <div className="tafseer-page">

        {/* ── Hero Banner ── */}
        <div className="tafseer-hero">
          <div className="tafseer-hero-pattern" />
          <div className="tafseer-hero-glow" />
          <div className="tafseer-hero-content">
            <div className="tafseer-hero-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>menu_book</span>
              Ibn Kathir · Ma&apos;arif · Tazkirul Quran
            </div>
            <p className="tafseer-hero-arabic" style={{ fontFamily: ARABIC_FONT }}>
              وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
            </p>
            <p className="tafseer-hero-transliteration">
              Wa rattilil-Qur&apos;āna tartīlā
            </p>
            <p className="tafseer-hero-translation">
              &ldquo;And recite the Quran with measured recitation.&rdquo;
            </p>
            <div className="tafseer-hero-ref">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_stories</span>
              Al-Muzzammil 73:4
            </div>
            <div className="tafseer-hero-actions">
              <Link href="/tafseer/1" className="tafseer-hero-btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_circle</span>
                Start with Al-Fatihah
              </Link>
              <Link href="/tafseer/18" className="tafseer-hero-btn-secondary">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>star</span>
                Al-Kahf (Friday Surah)
              </Link>
            </div>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="tafseer-layout">

          {/* Mobile sidebar toggle */}
          <button className="tafseer-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
            Filter
          </button>

          {/* ── Sidebar ── */}
          <aside className={`tafseer-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="tafseer-sidebar-header">
              <h3 className="tafseer-sidebar-title">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>filter_list</span>
                Browse By
              </h3>
              <span className="tafseer-sidebar-count">114</span>
            </div>

            <div className="tafseer-sidebar-divider" />

            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`tafseer-filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => { setActiveFilter(f.id); setSidebarOpen(false); setShowAll(false); }}
              >
                <div className="tafseer-filter-icon" style={{ background: `${f.color}18`, color: f.color }}>
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <div className="tafseer-filter-info">
                  <span className="tafseer-filter-name">{f.label}</span>
                  <span className="tafseer-filter-meta">{f.desc}</span>
                </div>
                {activeFilter === f.id && <span className="tafseer-filter-active-dot" />}
              </button>
            ))}

            <div className="tafseer-sidebar-divider" />

            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--brand-primary)' }}>info</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Verse-by-verse explanations from classic scholars
              </span>
            </div>
          </aside>

          {/* ── Content ── */}
          <main className="tafseer-content">

            {/* Search */}
            <div className="tafseer-toolbar">
              <div className="tafseer-search-wrapper">
                <span className="material-symbols-outlined tafseer-search-icon">search</span>
                <input
                  type="text"
                  className="tafseer-search-input"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowAll(false); }}
                  placeholder="Search surah by name, number or meaning…"
                />
                {search && (
                  <button className="tafseer-search-clear" onClick={() => setSearch('')}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content Header */}
            <div className="tafseer-content-header">
              <div>
                <h2 className="tafseer-content-title">
                  {search ? 'Search Results' : activeFilterData.label}
                </h2>
                <p className="tafseer-content-subtitle">
                  {search
                    ? `${filtered.length} surah${filtered.length !== 1 ? 's' : ''} found for "${search}"`
                    : `${filtered.length} surah${filtered.length !== 1 ? 's' : ''} — ${activeFilterData.desc}`}
                </p>
              </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="tafseer-empty">
                <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--text-muted)', display: 'block', marginBottom: 16 }}>search_off</span>
                <h3>No surahs found</h3>
                <p>Try a different search term or select another filter</p>
                <button className="tafseer-empty-btn" onClick={() => { setSearch(''); setActiveFilter('All'); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restart_alt</span>
                  Clear Search
                </button>
              </div>
            )}

            {/* Surah Grid */}
            {filtered.length > 0 && (
              <div className="tafseer-grid">
                {displayed.map((s, idx) => (
                  <Link
                    key={s.num}
                    href={`/tafseer/${s.num}`}
                    className="tafseer-card"
                    style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                  >
                    <div className="tafseer-card-accent" />

                    <div className="tafseer-card-top">
                      <div className="tafseer-card-number">{s.num}</div>
                      <span className="tafseer-card-arabic" style={{ fontFamily: ARABIC_FONT }}>{s.ar}</span>
                    </div>

                    <div className="tafseer-card-body">
                      <h3 className="tafseer-card-name">{s.name}</h3>
                      <p className="tafseer-card-meaning">{s.meaning}</p>
                      {s.desc && <p className="tafseer-card-desc">{s.desc}</p>}
                    </div>

                    <div className="tafseer-card-footer">
                      <span className={`tafseer-card-type ${s.t === 'Meccan' ? 'meccan' : 'medinan'}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{s.t === 'Meccan' ? 'wb_sunny' : 'location_city'}</span>
                        {s.t}
                      </span>
                      <span className="tafseer-card-verses">{s.v} verses</span>
                      <span className="tafseer-card-cta">
                        Read
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Show More */}
            {!search && filtered.length > 24 && (
              <div className="tafseer-show-more">
                <button className="tafseer-show-more-btn" onClick={() => setShowAll(v => !v)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
                  {showAll ? 'Show Less' : `Show All ${filtered.length} Surahs`}
                </button>
              </div>
            )}

          </main>
        </div>
      </div>
    );
}
