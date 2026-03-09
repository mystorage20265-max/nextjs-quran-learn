'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const SURAHS = [
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
  { num: 80, ar: 'عبس', name: "Abasa", meaning: 'He Frowned', v: 42, t: 'Meccan' },
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

const FEATURES = [
  { icon: 'menu_book', label: 'Read Quran', sub: '114 Surahs', href: '/read-quran/1', color: '#f59e0b' },
  { icon: 'auto_stories', label: 'Turn the pages of Quran', sub: '28 Pages', href: '/quran-pages', color: '#10b981' },
  { icon: 'explore', label: 'Navigate', sub: 'Surah · Juz · Page', href: '#navigate', color: '#0ea5e9' },
  { icon: 'ads_click', label: 'Memorize', sub: 'Hifz Program', href: '/memorize-quran', color: '#a855f7' },
  { icon: 'music_note', label: 'Audio Quran', sub: 'Listen & Learn', href: '/audio-quran', color: '#f59e0b' },
  { icon: 'radio', label: 'Quran Radio', sub: '24/7 Recitation', href: '/radio', color: '#ef4444' },
  { icon: 'translate', label: 'Word by Word', sub: 'Arabic Learning', href: '/read-quran/1?mode=word-by-word', color: '#06b6d4' },
  { icon: 'book_2', label: 'Tafseer', sub: 'Verse Explanations', href: '/tafseer', color: '#8b5cf6' },
  { icon: 'format_quote', label: 'Hadees', sub: "Prophet's Sayings", href: '/hadees', color: '#f59e0b' },
  { icon: 'volunteer_activism', label: 'Dua', sub: 'Supplications', href: '/dua', color: '#10b981' },
];

const AYAHS_OF_DAY = [
  { ar: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ', en: '"So remember Me; I will remember you…"', ref: 'Al-Baqarah 2:152', href: '/read-quran/2' },
  { ar: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', en: '"Verily, with hardship comes ease."', ref: 'Ash-Sharh 94:6', href: '/read-quran/94' },
  { ar: 'وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا', en: '"Trust in Allah — sufficient is Allah as a Trustee."', ref: 'An-Nisa 4:81', href: '/read-quran/4' },
  { ar: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', en: '"Indeed, Allah is with the patient."', ref: 'Al-Baqarah 2:153', href: '/read-quran/2' },
  { ar: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', en: '"Whoever relies upon Allah — He is sufficient for him."', ref: 'At-Talaq 65:3', href: '/read-quran/65' },
  { ar: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', en: '"Do not despair of the mercy of Allah."', ref: 'Yusuf 12:87', href: '/read-quran/12' },
  { ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', en: '"Our Lord, give us good in this world and good in the Hereafter."', ref: 'Al-Baqarah 2:201', href: '/read-quran/2' },
];

const STATS = [
  { num: '114', label: 'Surahs', icon: 'menu_book' },
  { num: '6,236', label: 'Ayahs', icon: 'format_quote' },
  { num: '30', label: 'Juz', icon: 'auto_stories' },
  { num: '77,797', label: 'Words', icon: 'abc' },
];

const JUZ_DATA = [
  { juz: 1, start: '1:1', surah: 'Al-Fatihah', page: 1 },
  { juz: 2, start: '2:142', surah: 'Al-Baqarah', page: 22 },
  { juz: 3, start: '2:253', surah: 'Al-Baqarah', page: 42 },
  { juz: 4, start: '3:93', surah: "Ali 'Imran", page: 62 },
  { juz: 5, start: '4:24', surah: 'An-Nisa', page: 82 },
  { juz: 6, start: '4:148', surah: 'An-Nisa', page: 102 },
  { juz: 7, start: '5:83', surah: "Al-Ma'idah", page: 121 },
  { juz: 8, start: '6:111', surah: "Al-An'am", page: 142 },
  { juz: 9, start: '7:88', surah: "Al-A'raf", page: 162 },
  { juz: 10, start: '8:41', surah: 'Al-Anfal', page: 182 },
  { juz: 11, start: '9:93', surah: 'At-Tawbah', page: 201 },
  { juz: 12, start: '11:6', surah: 'Hud', page: 222 },
  { juz: 13, start: '12:53', surah: 'Yusuf', page: 242 },
  { juz: 14, start: '15:1', surah: 'Al-Hijr', page: 262 },
  { juz: 15, start: '17:1', surah: "Al-Isra'", page: 282 },
  { juz: 16, start: '18:75', surah: 'Al-Kahf', page: 302 },
  { juz: 17, start: '21:1', surah: "Al-Anbiya'", page: 322 },
  { juz: 18, start: '23:1', surah: "Al-Mu'minun", page: 342 },
  { juz: 19, start: '25:21', surah: 'Al-Furqan', page: 362 },
  { juz: 20, start: '27:56', surah: 'An-Naml', page: 382 },
  { juz: 21, start: '29:46', surah: 'Al-Ankabut', page: 402 },
  { juz: 22, start: '33:31', surah: 'Al-Ahzab', page: 422 },
  { juz: 23, start: '36:28', surah: 'Ya-Sin', page: 442 },
  { juz: 24, start: '39:32', surah: 'Az-Zumar', page: 462 },
  { juz: 25, start: '41:47', surah: 'Fussilat', page: 482 },
  { juz: 26, start: '46:1', surah: 'Al-Ahqaf', page: 502 },
  { juz: 27, start: '51:31', surah: 'Adh-Dhariyat', page: 522 },
  { juz: 28, start: '58:1', surah: 'Al-Mujadila', page: 542 },
  { juz: 29, start: '67:1', surah: 'Al-Mulk', page: 564 },
  { juz: 30, start: '78:1', surah: "An-Naba'", page: 582 },
];

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Meccan' | 'Medinan'>('All');
  const [showAll, setShowAll] = useState(false);
  const [recent, setRecent] = useState<typeof SURAHS>([]);
  const { resolvedTheme, toggleTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const [sessionTime, setSessionTime] = useState(0); // seconds this session
  const [totalTime, setTotalTime] = useState(0);     // cumulative seconds all sessions

  // ── Prefetch Dua data after 3 s so the /dua page loads instantly ──
  useEffect(() => {
    const t = setTimeout(() => {
      const slugs = ['categories', 'rabbana', 'morning-evening', 'daily', 'salah', 'protection', 'forgiveness', 'family', 'travel', 'health', 'success', 'anxiety', 'ramadan', 'quran'];
      slugs.forEach(s => fetch(`/data/duas/${s}.json`, { priority: 'low' } as RequestInit).catch(() => { }));
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // ── Verse Search ──
  const [verseQuery, setVerseQuery] = useState('');
  const [verseResults, setVerseResults] = useState<{ number: number; text: string; surah: { number: number; name: string; englishName: string }; numberInSurah: number }[]>([]);
  const [verseCount, setVerseCount] = useState<number | null>(null);
  const [verseLoading, setVerseLoading] = useState(false);
  const verseSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Navigate Quran panel ──
  const [showNav, setShowNav] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [navTab, setNavTab] = useState<'surah' | 'juz' | 'page'>('surah');
  const [navSearch, setNavSearch] = useState('');
  const navRef = useRef<HTMLDivElement>(null);
  const openNav = () => { setShowNav(true); setNavLoading(true); setTimeout(() => setNavLoading(false), 600); };

  // ── Tasbeeh counter ──
  const TASBEEH_PRESETS = [
    { label: 'SubhanAllah', ar: 'سُبْحَانَ ٱللَّٰهِ', color: '#f59e0b' },
    { label: 'Alhamdulillah', ar: 'ٱلْحَمْدُ لِلَّٰهِ', color: '#a855f7' },
    { label: 'Allahu Akbar', ar: 'ٱللَّٰهُ أَكْبَرُ', color: '#f59e0b' },
  ];
  const TARGET = 33;
  const [tasbeehIdx, setTasbeehIdx] = useState(0);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [tasbeehTotal, setTasbeehTotal] = useState(0);
  const [tasbeehFlash, setTasbeehFlash] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('recentSurahs');
    if (saved) setRecent(JSON.parse(saved));
    // Load cumulative time
    const savedTotal = parseInt(localStorage.getItem('quranTotalTime') || '0', 10);
    setTotalTime(savedTotal);
    // Load tasbeeh total
    const savedTasbeehTotal = parseInt(localStorage.getItem('tasbeehTotal') || '0', 10);
    setTasbeehTotal(savedTasbeehTotal);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close nav on Escape
  useEffect(() => {
    if (!showNav) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowNav(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showNav]);

  const dropdownResults = query.trim()
    ? SURAHS.filter(s => {
      const q = query.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.ar.includes(q) || s.meaning.toLowerCase().includes(q) || String(s.num) === q;
    }).slice(0, 6)
    : [];

  // Session timer — ticks every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(s => s + 1);
      setTotalTime(t => {
        const next = t + 1;
        localStorage.setItem('quranTotalTime', String(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Debounced verse search
  useEffect(() => {
    if (verseSearchTimer.current) clearTimeout(verseSearchTimer.current);
    if (verseQuery.trim().length < 3) {
      setVerseResults([]);
      setVerseCount(null);
      return;
    }
    verseSearchTimer.current = setTimeout(async () => {
      setVerseLoading(true);
      try {
        const res = await fetch(`/api/quran-search?q=${encodeURIComponent(verseQuery.trim())}`);
        const json = await res.json();
        if (json?.data?.matches) {
          setVerseResults(json.data.matches.slice(0, 30));
          setVerseCount(json.data.count);
        } else {
          setVerseResults([]);
          setVerseCount(0);
        }
      } catch {
        setVerseResults([]);
        setVerseCount(null);
      } finally {
        setVerseLoading(false);
      }
    }, 500);
    return () => { if (verseSearchTimer.current) clearTimeout(verseSearchTimer.current); };
  }, [verseQuery]);

  const fmtTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `${s}s`;
  };


  const trackVisit = (s: typeof SURAHS[0]) => {
    const updated = [s, ...recent.filter(r => r.num !== s.num)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem('recentSurahs', JSON.stringify(updated));
  };

  const filtered = SURAHS.filter(s => {
    const q = query.toLowerCase();
    const matchQ = s.name.toLowerCase().includes(q) || s.ar.includes(q) || s.meaning.toLowerCase().includes(q) || String(s.num) === q;
    const matchT = typeFilter === 'All' || s.t === typeFilter;
    return matchQ && matchT;
  });
  const displayed = showAll ? filtered : filtered.slice(0, 12);
  const todayAyah = AYAHS_OF_DAY[new Date().getDate() % AYAHS_OF_DAY.length];

  const S = {
    shell: { display: 'flex', flexDirection: 'column' as const, flex: 1, background: dark ? 'var(--bg-base)' : '#ffffff', fontFamily: "'Figtree','Lexend',sans-serif" },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    text: { color: 'var(--text-primary)' },
    muted: { color: 'var(--text-muted)' },
    tag: (t: string) => ({ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: t === 'Meccan' ? '#f59e0b' : 'var(--text-muted)' }),
  };

  return (
    <>
      {/* ── NAVIGATE QURAN OVERLAY ── */}
      {showNav && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowNav(false)} />
          {/* Panel */}
          <div ref={navRef} style={{
            position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
            background: 'var(--bg-base)', borderRight: '1px solid var(--border-default)',
            display: 'flex', flexDirection: 'column', animation: 'navSlideIn 0.25s ease',
            boxShadow: '8px 0 40px rgba(0,0,0,0.15)',
          }}>
            {/* Panel Header */}
            <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${'var(--bg-elevated)'}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, ...S.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#f59e0b' }}>menu_book</span>
                  Navigate Quran
                </h2>
                <button onClick={() => setShowNav(false)} style={{ background: 'var(--bg-elevated)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              </div>
              {/* Tabs */}
              <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: 10, padding: 3, gap: 2 }}>
                {(['surah', 'juz', 'page'] as const).map(tab => (
                  <button key={tab} onClick={() => { setNavTab(tab); setNavSearch(''); }} style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                    background: navTab === tab ? '#f59e0b' : 'transparent',
                    color: navTab === tab ? 'white' : '#94a3b8',
                  }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
                ))}
              </div>
              {/* Search within panel */}
              {navTab === 'surah' && (
                <div style={{ position: 'relative', marginTop: 12 }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#94a3b8', pointerEvents: 'none' }}>search</span>
                  <input
                    type="text" value={navSearch} onChange={e => setNavSearch(e.target.value)}
                    placeholder="Search Surah…"
                    style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', fontSize: 13, color: 'var(--text-secondary)', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(245,158,11,0.3)'}
                    onBlur={e => e.target.style.boxShadow = 'none'}
                    autoFocus
                  />
                </div>
              )}
            </div>
            {/* Panel Body */}
            <div className="hp-scroll" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
              {navLoading ? (
                <div style={{ padding: '8px 0' }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', flexShrink: 0, animation: 'navSkel 1.2s ease-in-out infinite', animationDelay: `${i * 0.07}s` }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 8, width: `${55 + (i % 4) * 10}%`, animation: 'navSkel 1.2s ease-in-out infinite', animationDelay: `${i * 0.07 + 0.1}s` }} />
                        <div style={{ height: 10, borderRadius: 5, background: 'var(--bg-elevated)', width: `${35 + (i % 3) * 8}%`, animation: 'navSkel 1.2s ease-in-out infinite', animationDelay: `${i * 0.07 + 0.2}s` }} />
                      </div>
                      <div style={{ width: 32, textAlign: 'right' }}>
                        <div style={{ height: 18, width: 32, borderRadius: 5, background: 'var(--bg-elevated)', marginBottom: 5, animation: 'navSkel 1.2s ease-in-out infinite', animationDelay: `${i * 0.07 + 0.15}s` }} />
                        <div style={{ height: 8, width: 28, borderRadius: 4, background: 'var(--bg-elevated)', marginLeft: 'auto', animation: 'navSkel 1.2s ease-in-out infinite', animationDelay: `${i * 0.07 + 0.25}s` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : navTab === 'surah' ? (() => {
                const q = navSearch.toLowerCase();
                const list = q ? SURAHS.filter(s => s.name.toLowerCase().includes(q) || s.ar.includes(q) || s.meaning.toLowerCase().includes(q) || String(s.num) === q) : SURAHS;
                return list.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', ...S.muted, fontSize: 13 }}>No surahs found</div>
                ) : <>{list.map((s) => (
                  <Link key={s.num} href={`/read-quran/${s.num}?mode=reading`} onClick={() => { trackVisit(s); setShowNav(false); }} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.12s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#f59e0b', flexShrink: 0 }}>
                        {s.num}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, ...S.text }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: 11, ...S.muted }}>{s.meaning} · {s.v} verses</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className="font-arabic" style={{ fontSize: 18, fontWeight: 700, ...S.text, display: 'block' }}>{s.ar}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: s.t === 'Meccan' ? '#f59e0b' : '#94a3b8' }}>{s.t}</span>
                      </div>
                    </div>
                  </Link>
                ))}</>;
              })() : navTab === 'juz' ? (
                <div style={{ padding: '8px 12px' }}>
                  {JUZ_DATA.map(j => {
                    const surahNum = parseInt(j.start.split(':')[0]);
                    return (
                      <Link key={j.juz} href={`/read-quran/${surahNum}?mode=reading`} onClick={() => setShowNav(false)} style={{ textDecoration: 'none', display: 'block' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px',
                          borderRadius: 10, marginBottom: 4, transition: 'background 0.12s', cursor: 'pointer',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#f59e0b', flexShrink: 0 }}>
                            {j.juz}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, ...S.text }}>Juz {j.juz}</p>
                            <p style={{ margin: 0, fontSize: 11.5, ...S.muted }}>Starts at {j.surah} ({j.start})</p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontSize: 11, ...S.muted }}>Page {j.page}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '16px 16px' }}>
                  <p style={{ margin: '0 0 12px', fontSize: 12, ...S.muted }}>Go to a specific page (1–604)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                    {Array.from({ length: 604 }, (_, i) => i + 1).map(p => (
                      <Link key={p} href={`/page/${p}`} onClick={() => setShowNav(false)} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '9px 4px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          color: '#64748b', cursor: 'pointer', transition: 'all 0.12s',
                          background: 'var(--bg-surface)',
                          border: `1px solid ${'var(--bg-elevated)'}`,
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#f59e0b'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'var(--bg-elevated)'; }}
                        >
                          {p}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Panel Footer */}
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${'var(--bg-elevated)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, ...S.muted }}>
                {navTab === 'surah' ? '114 Surahs' : navTab === 'juz' ? '30 Juz' : '604 Pages'}
              </span>
              <span style={{ fontSize: 11, ...S.muted }}>ESC to close</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        html{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar{display:none}
        body{scrollbar-width:none;-ms-overflow-style:none}body::-webkit-scrollbar{display:none}
        .hp-scroll::-webkit-scrollbar{width:0;display:none}.hp-scroll{scrollbar-width:none;-ms-overflow-style:none}
        .surah-card{transition:transform 0.18s ease,box-shadow 0.18s ease}.surah-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(245,158,11,0.12)}
        .feat-card{transition:transform 0.18s ease,box-shadow 0.18s ease}.feat-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.10)}
        .hp-dot{background-image:radial-gradient(circle at 2px 2px,rgba(245,158,11,0.06) 1px,transparent 0);background-size:24px 24px}
        .font-arabic{font-family:'Naskh IndoPak',serif}
        .filter-btn{padding:6px 14px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.15s}
        .tc-btn{cursor:pointer;border:none;outline:none;background:none;-webkit-tap-highlight-color:transparent;transition:transform 0.08s ease;user-select:none}
        .tc-btn:active{transform:scale(0.93)}
        .tc-flash{animation:tc-pop 0.22s ease}
        @keyframes tc-pop{0%{transform:scale(1)}50%{transform:scale(1.13)}100%{transform:scale(1)}}
        @keyframes navSlideIn{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes navSkel{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes spin{to{transform:translateY(-50%) rotate(360deg)}}
        /* ── Responsive ── */
        .hp-header-inner{padding:10px 16px !important}
        .hp-content{padding:16px 16px 16px !important}
        .hp-stats{grid-template-columns:repeat(2,1fr) !important}
        .hp-quick{grid-template-columns:1fr !important}
        .hp-features{grid-template-columns:repeat(3,1fr) !important}
        .hp-surah-grid{grid-template-columns:repeat(2,1fr) !important}
        .hp-qs-hide{display:none !important}
        .hp-dark-hide{display:none !important}
        .hp-sr-meta{display:none !important}
        @media(min-width:540px){.hp-sr-meta{display:flex !important}}
        @media(min-width:640px){
          .hp-header-inner{padding:12px 24px !important}
          .hp-content{padding:20px 24px 16px !important}
          .hp-quick{grid-template-columns:repeat(2,1fr) !important}
          .hp-surah-grid{grid-template-columns:repeat(2,1fr) !important}
          .hp-qs-hide{display:flex !important}
          .hp-dark-hide{display:flex !important}
        }
        @media(min-width:860px){
          .hp-header-inner{padding:12px 28px !important}
          .hp-content{padding:24px 28px 16px !important}
          .hp-stats{grid-template-columns:repeat(4,1fr) !important}
          .hp-quick{grid-template-columns:repeat(3,1fr) !important}
          .hp-features{grid-template-columns:repeat(auto-fill,minmax(130px,1fr)) !important}
          .hp-surah-grid{grid-template-columns:repeat(3,1fr) !important}
          .hp-getstarted-inner{grid-template-columns:1fr 1.4fr !important}
          .hp-getstarted-right{border-left:1px solid rgba(245,158,11,0.12)}
        }
        .hp-getstarted-inner{grid-template-columns:1fr}
        .hp-getstarted-right{border-top:1px solid rgba(245,158,11,0.12)}
      `}</style>

      <div style={S.shell}>
        {/* Header — outside scroll container so dropdown isn't clipped */}
        <header style={{ position: 'relative', zIndex: 200, background: 'var(--glass-bg-strong)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-strong)', flexShrink: 0 }}>
          <div className="hp-header-inner" style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div ref={searchRef} style={{ flex: 1, position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 20, pointerEvents: 'none', zIndex: 1 }}>search</span>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowAll(true); setShowDropdown(true); }}
                onFocus={e => { if (query.trim()) setShowDropdown(true); e.target.style.boxShadow = '0 0 0 2px rgba(245,158,11,0.4)'; }}
                onKeyDown={e => { if (e.key === 'Escape') { setShowDropdown(false); } }}
                placeholder="Search Surah name, number, or meaning…"
                style={{ width: '100%', background: 'var(--bg-surface)', border: 'none', borderRadius: 12, padding: '10px 14px 10px 40px', fontSize: 13.5, color: 'var(--text-secondary)', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', outline: 'none' }}
                onBlur={e => (e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)')}
              />
              {/* Search Dropdown */}
              {showDropdown && dropdownResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  zIndex: 999, overflow: 'hidden',
                }}>
                  {dropdownResults.map((s, i) => (
                    <Link
                      key={s.num}
                      href={`/read-quran/${s.num}`}
                      onClick={() => { trackVisit(s); setShowDropdown(false); setQuery(''); }}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 16px',
                        borderTop: i > 0 ? `1px solid ${'var(--bg-elevated)'}` : 'none',
                        cursor: 'pointer', transition: 'background 0.12s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#f59e0b', fontSize: 12, flexShrink: 0 }}>
                          {s.num}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{s.meaning} · {s.v} verses</p>
                        </div>
                        <div className="hp-sr-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.t === 'Meccan' ? '#f59e0b' : '#94a3b8' }}>{s.t}</span>
                          <span style={{ fontFamily: "'Naskh IndoPak',serif", fontSize: 17, color: 'var(--text-primary)' }}>{s.ar}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {/* Footer hint */}
                  <div style={{ padding: '8px 16px', borderTop: `1px solid ${'var(--bg-elevated)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{SURAHS.filter(s => { const q = query.toLowerCase(); return s.name.toLowerCase().includes(q) || s.ar.includes(q) || s.meaning.toLowerCase().includes(q) || String(s.num) === q; }).length} results · scroll down for all</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>ESC to close</span>
                  </div>
                </div>
              )}
            </div>
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hp-dark-hide"
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'var(--bg-elevated)',
                color: dark ? '#f59e0b' : '#64748b',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.18s, color 0.18s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {dark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link href="/read-quran/1" style={{ background: '#f59e0b', color: 'white', borderRadius: 12, padding: '9px 14px', fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(245,158,11,0.3)', textDecoration: 'none', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_circle</span>
              <span className="hp-qs-hide">Quick Start</span>
            </Link>
            <button
              onClick={() => openNav()}
              style={{
                background: 'var(--bg-elevated)', color: 'var(--brand-primary)',
                borderRadius: 12, padding: '9px 14px', fontWeight: 600, fontSize: 13.5,
                display: 'flex', alignItems: 'center', gap: 6,
                border: '1px solid var(--border-default)',
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.18s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>menu_book</span>
              <span className="hp-qs-hide">Navigate</span>
            </button>
          </div>
        </header>
        {/* MAIN — scrollable content only */}
        <main className="hp-scroll hp-dot" style={{ background: dark ? 'var(--bg-base)' : '#ffffff' }}>
          <div className="hp-content" style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* ── STATS BAR ── */}
            <div className="hp-stats" style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              {STATS.map(s => (
                <div key={s.label} style={{ ...S.card, padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f59e0b', opacity: 0.8 }}>{s.icon}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{s.num}</span>
                  <span style={{ fontSize: 10, ...S.muted, fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* ── QUICK ACCESS CARDS ── */}
            <section className="hp-quick" style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              {/* Continue Reading */}
              <div style={{ ...S.card, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 140 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Continue Reading</span>
                    <span className="material-symbols-outlined" style={{ color: '#cbd5e1', fontSize: 18 }}>bookmark</span>
                  </div>
                  <h3 style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 15, ...S.text }}>{recent[0]?.name ?? 'Al-Fatihah'}</h3>
                  <p style={{ margin: '0 0 14px', fontSize: 12, ...S.muted }}>{recent[0] ? `Surah ${recent[0].num} · ${recent[0].v} verses` : 'Begin your journey'}</p>
                </div>
                <Link href={`/read-quran/${recent[0]?.num ?? 1}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--bg-elevated)', borderRadius: 8, padding: '7px 10px', fontWeight: 600, fontSize: 12, color: 'var(--brand-primary)', textDecoration: 'none' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>resume</span>{recent[0] ? 'Resume' : 'Start'}
                </Link>
              </div>
              {/* Session Timer Card */}
              <div style={{ ...S.card, padding: 18, minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Session Timer</span>
                    <span className="material-symbols-outlined" style={{ color: '#cbd5e1', fontSize: 18 }}>timer</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 30, fontWeight: 700, color: '#f59e0b', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(sessionTime)}</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 11, ...S.muted }}>This session on the app</p>
                  <div style={{ width: '100%', height: 4, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${Math.min((sessionTime % 3600) / 36, 100)}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: 999, transition: 'width 1s linear' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, ...S.muted }}>All time: <strong style={{ color: '#f59e0b' }}>{fmtTime(totalTime)}</strong></span>
                  <button
                    title="Reset session &amp; all-time counter"
                    onClick={() => { setSessionTime(0); setTotalTime(0); localStorage.setItem('quranTotalTime', '0'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: '#94a3b8' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>restart_alt</span>
                  </button>
                </div>
              </div>
              {/* Ayah of the Day */}
              <Link href={todayAyah.href} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 16, padding: 18, boxShadow: '0 8px 24px rgba(245,158,11,0.25)', position: 'relative', overflow: 'hidden', minHeight: 140, cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(245,158,11,0.35)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(245,158,11,0.25)'; }}
                >
                  <span className="material-symbols-outlined" style={{ position: 'absolute', top: -8, right: -14, fontSize: 90, color: 'white', opacity: 0.08, lineHeight: 1 }}>star_half</span>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.8)' }}>Ayah of the Day</span>
                    <p className="font-arabic" dir="rtl" style={{ margin: '8px 0 6px', fontSize: 16, lineHeight: 1.9, textAlign: 'right', color: 'white', fontWeight: 700 }}>{todayAyah.ar}</p>
                    <p style={{ margin: '0 0 4px', fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.88)', lineHeight: 1.5 }}>{todayAyah.en}</p>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'white' }}>{todayAyah.ref} →</p>
                  </div>
                </div>
              </Link>
            </section>

            {/* ── FEATURE SHORTCUTS ── */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 17, ...S.text }}>Quick Access</h2>
              <div className="hp-features" style={{ display: 'grid', gap: 10 }}>
                {FEATURES.map(f => {
                  const isNav = f.href === '#navigate';
                  const inner = (
                    <div className="feat-card" style={{ ...S.card, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 22, color: f.color }}>{f.icon}</span>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 1px', fontWeight: 600, fontSize: 11.5, ...S.text }}>{f.label}</p>
                        <p style={{ margin: 0, fontSize: 10, ...S.muted }}>{f.sub}</p>
                      </div>
                    </div>
                  );
                  if (isNav) return <div key={f.label} onClick={() => openNav()} style={{ textDecoration: 'none', cursor: 'pointer' }}>{inner}</div>;
                  return <Link key={f.label} href={f.href} style={{ textDecoration: 'none' }}>{inner}</Link>;
                })}
              </div>
            </section>

            {/* ── SEARCH QURAN ── */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#f59e0b' }}>search</span>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: 19, ...S.text }}>Search Quran</h2>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 13, ...S.muted }}>Search through English translations · type at least 3 characters</p>
              {/* Input */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#94a3b8', pointerEvents: 'none' }}>search</span>
                <input
                  type="text"
                  value={verseQuery}
                  onChange={e => setVerseQuery(e.target.value)}
                  placeholder="e.g. patience, mercy, truth…"
                  style={{
                    width: '100%', padding: '13px 16px 13px 44px', borderRadius: 14,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)',
                    fontSize: 14, color: 'var(--text-secondary)',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'box-shadow 0.15s',
                  }}
                  onFocus={e => (e.target.style.boxShadow = '0 0 0 2px rgba(245,158,11,0.35)')}
                  onBlur={e => (e.target.style.boxShadow = 'none')}
                />
                {verseLoading && (
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#f59e0b', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                )}
              </div>

              {/* Result count */}
              {verseCount !== null && verseQuery.trim().length >= 3 && (
                <p style={{ margin: '0 0 14px', fontSize: 13, ...S.muted }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{verseCount.toLocaleString()}</strong> results for &ldquo;<span style={{ color: '#f59e0b' }}>{verseQuery}</span>&rdquo;
                </p>
              )}

              {/* Results */}
              {verseResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {verseResults.map(v => {
                    // Highlight the search term in the text
                    const re = new RegExp(`(${verseQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    const parts = v.text.split(re);
                    return (
                      <Link
                        key={`${v.surah.number}:${v.numberInSurah}`}
                        href={`/read-quran/${v.surah.number}`}
                        style={{ textDecoration: 'none', display: 'block' }}
                      >
                        <div
                          style={{ ...S.card, padding: '18px 20px', cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s' }}
                          className="surah-card"
                        >
                          {/* Badges row */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                                fontSize: 11.5, fontWeight: 700, borderRadius: 20,
                                padding: '3px 10px', border: '1px solid rgba(245,158,11,0.2)',
                              }}>{v.surah.englishName}</span>
                              <span style={{ fontSize: 12, ...S.muted }}>Ayah {v.numberInSurah}</span>
                            </div>
                            <span className="font-arabic" dir="rtl" style={{ fontSize: 16, fontWeight: 700, ...S.text, opacity: 0.7 }}>{v.surah.name}</span>
                          </div>
                          {/* Verse text with highlight */}
                          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.85, ...S.text }}>
                            {parts.map((part, i) =>
                              re.test(part)
                                ? <mark key={i} style={{ background: 'rgba(245,158,11,0.22)', color: '#d97706', borderRadius: 3, padding: '0 2px', fontWeight: 600 }}>{part}</mark>
                                : part
                            )}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                  {verseCount !== null && verseCount > 30 && (
                    <p style={{ textAlign: 'center', fontSize: 12, ...S.muted, marginTop: 4 }}>Showing first 30 of {verseCount.toLocaleString()} results</p>
                  )}
                </div>
              )}

              {verseQuery.trim().length >= 3 && !verseLoading && verseResults.length === 0 && verseCount === 0 && (
                <p style={{ ...S.muted, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No verses found for &ldquo;{verseQuery}&rdquo;</p>
              )}
            </section>

            {/* ── HADEES OF THE DAY ── */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: 17, ...S.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#f59e0b' }}>format_quote</span>
                  Hadees of the Day
                </h2>
                <Link href="/hadees" style={{ fontSize: 12.5, fontWeight: 600, color: '#f59e0b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Browse All
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                </Link>
              </div>
              <Link href="/hadees" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  ...S.card,
                  padding: '22px 24px',
                  borderLeft: '4px solid #f59e0b',
                  cursor: 'pointer',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(245,158,11,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
                >
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, top: 8, fontSize: 72, color: 'rgba(245,158,11,0.07)', lineHeight: 1, pointerEvents: 'none' }}>format_quote</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,158,11,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#f59e0b' }}>format_quote</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: '#f59e0b' }}>Nawawi's 40 · Daily Hadith</span>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: 13.5, lineHeight: 1.85, ...S.text, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                    "On the authority of Umar ibn al-Khattab — Actions are but by intentions, and every person shall have only that which he intended. So whoever's emigration was for Allah and His Messenger, his emigration is for Allah and His Messenger."
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: 11, ...S.muted }}>— Sahih al-Bukhari &amp; Muslim</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#f59e0b', fontWeight: 600 }}>
                      View Collection
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                    </div>
                  </div>
                </div>
              </Link>
            </section>

            {/* ── TASBEEH COUNTER ── */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 17, ...S.text }}>Tasbeeh Counter</h2>
              <div style={{ ...S.card, padding: 20 }}>
                {/* Preset tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                  {TASBEEH_PRESETS.map((p, i) => (
                    <button
                      key={p.label}
                      onClick={() => { setTasbeehIdx(i); setTasbeehCount(0); }}
                      style={{
                        padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600,
                        background: tasbeehIdx === i ? p.color : 'var(--bg-elevated)',
                        color: tasbeehIdx === i ? 'white' : '#64748b',
                        transition: 'all 0.15s',
                      }}
                    >{p.label}</button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                  {/* Ring + tap button */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {/* Circular shadow layer */}
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10), inset 0 -4px 10px rgba(0,0,0,0.07)',
                    }} />
                    <svg width={140} height={140} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
                      {/* Track */}
                      <circle cx={70} cy={70} r={58} fill="none" stroke={'var(--bg-elevated)'} strokeWidth={10} />
                      {/* Progress */}
                      <circle
                        cx={70} cy={70} r={58} fill="none"
                        stroke={TASBEEH_PRESETS[tasbeehIdx].color}
                        strokeWidth={10}
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 58}`}
                        strokeDashoffset={`${2 * Math.PI * 58 * (1 - Math.min(tasbeehCount, TARGET) / TARGET)}`}
                        style={{ transition: 'stroke-dashoffset 0.25s ease' }}
                      />
                    </svg>
                    {/* Count display + tap area */}
                    <button
                      className={`tc-btn${tasbeehFlash ? ' tc-flash' : ''}`}
                      style={{ position: 'absolute', inset: 0, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, zIndex: 2 }}
                      onClick={() => {
                        const next = tasbeehCount + 1;
                        setTasbeehCount(next);
                        setTasbeehFlash(true);
                        setTimeout(() => setTasbeehFlash(false), 220);
                        const newTotal = tasbeehTotal + 1;
                        setTasbeehTotal(newTotal);
                        localStorage.setItem('tasbeehTotal', String(newTotal));
                        if (navigator.vibrate) navigator.vibrate(18);
                        if (next === TARGET) setTimeout(() => setTasbeehCount(0), 600);
                      }}
                      aria-label={`Count ${TASBEEH_PRESETS[tasbeehIdx].label}`}
                    >
                      <span style={{ fontSize: 36, fontWeight: 800, color: TASBEEH_PRESETS[tasbeehIdx].color, lineHeight: 1 }}>
                        {tasbeehCount}
                      </span>
                      <span style={{ fontSize: 10, ...S.muted }}>/ {TARGET}</span>
                      <span style={{ fontSize: 9, color: TASBEEH_PRESETS[tasbeehIdx].color, fontWeight: 600, marginTop: 2 }}>TAP</span>
                    </button>
                  </div>

                  {/* Info panel */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p className="font-arabic" dir="rtl" style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: TASBEEH_PRESETS[tasbeehIdx].color, textAlign: 'right' }}>
                      {TASBEEH_PRESETS[tasbeehIdx].ar}
                    </p>
                    <p style={{ margin: '0 0 16px', fontSize: 13, fontStyle: 'italic', ...S.muted }}>
                      &ldquo;{TASBEEH_PRESETS[tasbeehIdx].label}&rdquo;
                    </p>
                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                      <div style={{ ...S.card, padding: '10px 16px', textAlign: 'center', borderRadius: 12 }}>
                        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TASBEEH_PRESETS[tasbeehIdx].color }}>
                          {Math.floor(tasbeehTotal / TARGET)}
                        </p>
                        <p style={{ margin: 0, fontSize: 10, ...S.muted }}>Rounds done</p>
                      </div>
                      <div style={{ ...S.card, padding: '10px 16px', textAlign: 'center', borderRadius: 12 }}>
                        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, ...S.text }}>{tasbeehTotal}</p>
                        <p style={{ margin: 0, fontSize: 10, ...S.muted }}>Total count</p>
                      </div>
                    </div>
                    {/* Reset */}
                    <button
                      onClick={() => { setTasbeehCount(0); setTasbeehTotal(0); localStorage.setItem('tasbeehTotal', '0'); }}
                      style={{ background: 'none', border: '1px solid var(--border-default)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>restart_alt</span>
                      Reset all
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ── RECENTLY VISITED ── */}
            {recent.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <h2 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 17, ...S.text }}>Recently Visited</h2>
                <div className="hp-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                  {recent.map(s => (
                    <Link key={s.num} href={`/read-quran/${s.num}`} onClick={() => trackVisit(s)} style={{ textDecoration: 'none', flexShrink: 0 }}>
                      <div className="surah-card" style={{ ...S.card, padding: '12px 14px', width: 130, cursor: 'pointer', borderTop: '3px solid #f59e0b' }}>
                        <span className="font-arabic" style={{ fontSize: 18, fontWeight: 700, ...S.text, display: 'block', marginBottom: 6 }}>{s.ar}</span>
                        <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 12, ...S.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: 10, ...S.muted }}>{s.v} verses</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── EXPLORE SURAHS ── */}

            <section>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 19, ...S.text }}>Explore Surahs</h2>
                  <p style={{ margin: 0, fontSize: 13, ...S.muted }}>{filtered.length} of 114 surahs</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Type filter */}
                  <div style={{ display: 'flex', background: 'var(--bg-surface)', border: `1px solid ${'var(--bg-elevated)'}`, borderRadius: 10, padding: 3, gap: 2 }}>
                    {(['All', 'Meccan', 'Medinan'] as const).map(t => (
                      <button key={t} className="filter-btn" onClick={() => setTypeFilter(t)} style={{ background: typeFilter === t ? '#f59e0b' : 'transparent', color: typeFilter === t ? 'white' : '#94a3b8' }}>{t}</button>
                    ))}
                  </div>
                  {/* View toggle */}
                  <div style={{ display: 'flex', background: 'var(--bg-surface)', border: `1px solid ${'var(--bg-elevated)'}`, borderRadius: 10, padding: 3, gap: 2 }}>
                    {(['grid', 'list'] as const).map(m => (
                      <button key={m} className="filter-btn" onClick={() => setViewMode(m)} style={{ background: viewMode === m ? '#f59e0b' : 'transparent', color: viewMode === m ? 'white' : '#94a3b8' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{m === 'grid' ? 'grid_view' : 'view_list'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid */}
              {viewMode === 'grid' ? (
                <div className="hp-surah-grid" style={{ display: 'grid', gap: 14 }}>
                  {displayed.map(s => (
                    <Link key={s.num} href={`/read-quran/${s.num}`} onClick={() => trackVisit(s)} style={{ textDecoration: 'none' }}>
                      <div className="surah-card" style={{ ...S.card, padding: 18, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div style={{ width: 36, height: 36, background: 'rgba(245,158,11,0.10)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#f59e0b', fontSize: 13 }}>{s.num}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className="font-arabic" style={{ fontSize: 20, fontWeight: 700, ...S.text }}>{s.ar}</span>
                            <span style={{ ...S.tag(s.t), marginTop: 2 }}>{s.t}</span>
                          </div>
                        </div>
                        <h3 style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, ...S.text }}>{s.name}</h3>
                        <p style={{ margin: 0, fontSize: 12, ...S.muted }}>{s.meaning} · {s.v} Verses</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {displayed.map(s => (
                    <Link key={s.num} href={`/read-quran/${s.num}`} onClick={() => trackVisit(s)} style={{ textDecoration: 'none' }}>
                      <div className="surah-card" style={{ ...S.card, padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 36, height: 36, background: 'rgba(245,158,11,0.10)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#f59e0b', fontSize: 13, flexShrink: 0 }}>{s.num}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13.5, ...S.text }}>{s.name}</h3>
                          <p style={{ margin: 0, fontSize: 11.5, ...S.muted }}>{s.meaning} · {s.v} Verses</p>
                        </div>
                        <span style={{ ...S.tag(s.t), flexShrink: 0 }}>{s.t}</span>
                        <span className="font-arabic" style={{ fontSize: 18, fontWeight: 700, ...S.text, flexShrink: 0 }}>{s.ar}</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#cbd5e1', flexShrink: 0 }}>chevron_right</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Show more / less */}
              <div style={{ marginTop: 24, marginBottom: 48, textAlign: 'center' }}>
                <button onClick={() => setShowAll(v => !v)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '10px 28px', borderRadius: 12, fontWeight: 600, fontSize: 13.5, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                  {showAll ? `Show Top 12` : `Show All ${filtered.length} Surahs`}
                  <span className="material-symbols-outlined" style={{ fontSize: 18, transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
                </button>
              </div>
            </section>

            {/* ── GET STARTED SECTION ── */}
            <section style={{
              marginBottom: 0,
              borderRadius: 20,
              background: dark
                ? 'linear-gradient(135deg,#1a1612 0%,#0f0d0a 60%,#1a1612 100%)'
                : 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 60%,#fffbeb 100%)',
              border: `1px solid ${dark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.2)'}`,
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Background dot pattern */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px,rgba(245,158,11,0.06) 1px,transparent 0)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
              {/* Decorative orbs */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(217,119,6,0.07)', pointerEvents: 'none' }} />

              <div className="hp-getstarted-inner" style={{ position: 'relative', zIndex: 1, display: 'grid', gap: 0 }}>
                {/* Left — headline */}
                <div className="hp-getstarted-left" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(245,158,11,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#f59e0b' }}>auto_stories</span>
                  </div>
                  <h2 style={{ margin: '0 0 12px', fontWeight: 800, fontSize: 'clamp(22px,4vw,30px)', lineHeight: 1.2, color: 'var(--text-primary)' }}>
                    Let&apos;s get{' '}
                    <span style={{ color: '#f59e0b' }}>to learning</span>
                  </h2>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: dark ? '#94a3b8' : '#475569', maxWidth: 280 }}>
                    Explore all the ways QuranicLearn can support your spiritual journey — from reading to memorisation.
                  </p>
                </div>

                {/* Right — action list */}
                <div className="hp-getstarted-right" style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { icon: 'support_agent', label: 'Contact us', sub: 'Talk to an expert and see how our platform can meet your goals.', href: '/community', color: '#8b5cf6' },
                    { icon: 'group', label: 'Join the community', sub: 'Learn, share, and connect with people doing work that matters.', href: '/community', color: '#f59e0b' },
                    { icon: 'school', label: 'Find a teacher', sub: 'Realize even more value with a certified Quran tutor.', href: '/learn-quran', color: '#f59e0b' },
                    { icon: 'view_module', label: 'Explore modules', sub: 'Get hands-on with the QuranicLearn platform.', href: '/courses', color: '#0ea5e9' },
                  ].map((item, i, arr) => (
                    <Link key={item.label} href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          padding: '18px 24px',
                          borderTop: i > 0 ? `1px solid ${dark ? 'rgba(36,31,26,0.6)' : 'rgba(245,158,11,0.1)'}` : 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = dark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.05)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 22, color: item.color }}>{item.icon}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{item.label}</p>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.sub}</p>
                        </div>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: dark ? '#334155' : '#cbd5e1', flexShrink: 0 }}>chevron_right</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </>
  );
}
