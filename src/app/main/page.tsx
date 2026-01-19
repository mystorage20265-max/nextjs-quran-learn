'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';
import { fetchQuranStructure } from '../../utils/quranApi';
import HomeSurahCard from './components/HomeSurahCard';
import HomeJuzCard from './components/HomeJuzCard';
import HomeManzilCard from './components/HomeManzilCard';
import HomeHizbCard from './components/HomeHizbCard';
import HomePageCard from './components/HomePageCard';
import HomeRukuCard from './components/HomeRukuCard';
import HomeNavigations from './components/HomeNavigations';
import DirectNav from './components/DirectNav';
import NavigationTabs from './components/NavigationTabs';
import SearchBar from './components/SearchBar';

// Standard CSS imports for global components
import './components/HomeSurahCard.css';
import './components/HomeJuzCard.css';
import './components/HomeManzilCard.css';
import './components/HomeHizbCard.css';
import './components/HomePageCard.css';
import './components/HomeRukuCard.css';
import './components/HomePagination.css';

interface QuranDataType {
  totalSurahs: number;
  totalJuz: number;
  totalManzil: number;
  totalHizb: number;
  totalPages: number;
  totalRuku: number;
  surahs: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  }[];
}

const juzSurahMap = [
  { start: "Al-Fatihah", end: "Al-Baqarah" },
  { start: "Al-Baqarah", end: "Al-Baqarah" },
  { start: "Al-Baqarah", end: "Al-Imran" },
  { start: "Al-Imran", end: "An-Nisa" },
  { start: "An-Nisa", end: "An-Nisa" },
  { start: "An-Nisa", end: "Al-Ma'idah" },
  { start: "Al-Ma'idah", end: "Al-An'am" },
  { start: "Al-An'am", end: "Al-A'raf" },
  { start: "Al-A'raf", end: "Al-Anfal" },
  { start: "Al-Anfal", end: "At-Tawbah" },
  { start: "At-Tawbah", end: "Hud" },
  { start: "Hud", end: "Yusuf" },
  { start: "Yusuf", end: "Ibrahim" },
  { start: "Al-Hijr", end: "An-Nahl" },
  { start: "Al-Isra", end: "Al-Kahf" },
  { start: "Al-Kahf", end: "Ta-Ha" },
  { start: "Al-Anbya", end: "Al-Hajj" },
  { start: "Al-Mu'minun", end: "Al-Furqan" },
  { start: "Al-Furqan", end: "An-Naml" },
  { start: "An-Naml", end: "Al-Ankabut" },
  { start: "Al-Ankabut", end: "Al-Ahzab" },
  { start: "Al-Ahzab", end: "Ya-Sin" },
  { start: "Ya-Sin", end: "Az-Zumar" },
  { start: "Az-Zumar", end: "Fussilat" },
  { start: "Fussilat", end: "Al-Jathiyah" },
  { start: "Al-Ahqaf", end: "Adh-Dhariyat" },
  { start: "Adh-Dhariyat", end: "Al-Hadid" },
  { start: "Al-Mujadila", end: "At-Tahrim" },
  { start: "Al-Mulk", end: "Al-Mursalat" },
  { start: "An-Naba", end: "An-Nas" }
];

const getJuzInfo = (juzNumber: number) => {
  const index = juzNumber - 1;
  return index >= 0 && index < juzSurahMap.length ? juzSurahMap[index] : { start: "Unknown", end: "Unknown" };
};

export default function Home() {
  const [quranData, setQuranData] = useState<QuranDataType | null>(null);
  const [lastRead, setLastRead] = useState<{ surah: number; ayah: number } | null>(null);
  const [navigationMode, setNavigationMode] = useState<'surah' | 'juz' | 'manzil' | 'hizb' | 'page' | 'ruku'>('surah');
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchQuranStructure();
        setQuranData(data);
      } catch (error) {
        console.error('Error fetching quran data:', error);
      }
    };

    const stored = localStorage.getItem('lastRead');
    if (stored) setLastRead(JSON.parse(stored));

    fetchData();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearch = (query: string) => setSearchQuery(query.toLowerCase());

  const filterByNumber = (searchTerm: string, itemNumber: number, prefix: string) => {
    if (!searchTerm) return true;
    const normalizedSearch = searchTerm.toLowerCase().replace(prefix.toLowerCase(), '').trim();
    return itemNumber.toString() === normalizedSearch;
  };

  return (
    <div className={styles.container}>
      {/* Background Orbs */}
      <motion.div
        animate={{
          x: mousePos.x * 50,
          y: mousePos.y * 50,
        }}
        className={`${styles.heroOrb} ${styles.orb1}`}
      />
      <motion.div
        animate={{
          x: mousePos.x * -40,
          y: mousePos.y * -40,
        }}
        className={`${styles.heroOrb} ${styles.orb2}`}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className={styles.heroContent}
        >
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={styles.bismillah}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </motion.h1>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.mainTitle}
          >
            Advanced Quranic Education
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.subtitle}
          >
            Your comprehensive digital guide to reading, understanding, and memorizing the Holy Quran.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <DirectNav />
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content Area */}
      <section className={styles.quranSection}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <HomeNavigations />
        </motion.div>

        {/* Last Read Section */}
        {lastRead && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className={styles.lastReadCard}
          >
            <div className={styles.lastReadInfo}>
              <h3>Resume Reading</h3>
              <p>Surah {lastRead.surah}, Verse {lastRead.ayah}</p>
            </div>
            <Link
              href={`/quran/surah/${lastRead.surah}#${lastRead.ayah}`}
              className={styles.continueButton}
            >
              Continue
            </Link>
          </motion.div>
        )}

        {/* Filters */}
        <div className={styles.controlsSection}>
          <div className={styles.tabsWrapper}>
            <NavigationTabs
              navigationMode={navigationMode}
              setNavigationMode={setNavigationMode}
            />
          </div>
          <SearchBar
            onSearch={handleSearch}
            navigationMode={navigationMode}
          />
        </div>

        {/* Grid Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={navigationMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="section-container"
          >
            {quranData && navigationMode === 'surah' && (
              <div className="surahs-grid">
                {quranData.surahs
                  .filter(surah => !searchQuery ||
                    surah.name.toLowerCase().includes(searchQuery) ||
                    surah.englishName.toLowerCase().includes(searchQuery) ||
                    surah.number.toString().includes(searchQuery)
                  )
                  .map((surah) => (
                    <HomeSurahCard key={surah.number} surah={surah} />
                  ))}
              </div>
            )}

            {navigationMode === 'juz' && (
              <div className="juz-grid">
                {Array.from({ length: 30 }, (_, i) => i + 1)
                  .filter(j => filterByNumber(searchQuery, j, 'juz'))
                  .map((j) => {
                    const info = getJuzInfo(j);
                    return <HomeJuzCard key={j} juzNumber={j} surahStart={info.start} surahEnd={info.end} />;
                  })}
              </div>
            )}

            {navigationMode === 'manzil' && (
              <div className="manzil-grid">
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <HomeManzilCard key={n} manzilNumber={n} surahStart="" surahEnd="" description="" ayahRange="" />
                ))}
              </div>
            )}

            {navigationMode === 'hizb' && (
              <div className="hizb-grid">
                {Array.from({ length: 60 }, (_, i) => i + 1)
                  .filter(h => filterByNumber(searchQuery, h, 'hizb'))
                  .map(h => {
                    const info = getJuzInfo(Math.ceil(h / 2));
                    return <HomeHizbCard key={h} hizbNumber={h} surahStart={info.start} surahEnd={info.end} ayahRange="" />;
                  })}
              </div>
            )}

            {navigationMode === 'page' && (
              <div className="page-grid">
                {Array.from({ length: 604 }, (_, i) => i + 1)
                  .filter(p => filterByNumber(searchQuery, p, 'page'))
                  .map(p => {
                    const info = getJuzInfo(Math.ceil(p / 20));
                    return <HomePageCard key={p} pageNumber={p} surahStart={info.start} surahEnd={info.end} ayahRange="" />;
                  })}
              </div>
            )}

            {navigationMode === 'ruku' && (
              <div className="ruku-grid">
                {Array.from({ length: 556 }, (_, i) => i + 1)
                  .filter(r => filterByNumber(searchQuery, r, 'ruku'))
                  .map(r => {
                    const info = getJuzInfo(Math.ceil(r / 18.5));
                    return <HomeRukuCard key={r} rukuNumber={r} surahStart={info.start} surahEnd={info.end} ayahRange="" />;
                  })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}