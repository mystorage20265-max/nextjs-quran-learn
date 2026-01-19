import { Surah } from '../../../types/quran';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HomeSurahCardProps {
  surah: Surah;
}

export default function HomeSurahCard({ surah }: HomeSurahCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      viewport={{ once: true }}
      className="surah-card-wrapper"
    >
      <Link href={`/surah/${surah.number}`} className="surah-card">
        <div className="left-content">
          <div className="surah-number">{surah.number}</div>
          <div className="name-container">
            <div className="surah-name-en">{surah.englishName}</div>
            <div className="surah-name-translation">{surah.englishNameTranslation}</div>
          </div>
        </div>
        <div className="right-content">
          <div className="surah-name-ar" dir="rtl">{surah.name}</div>
          <div className="ayah-count">{surah.numberOfAyahs} Ayahs</div>
        </div>
      </Link>
    </motion.div>
  );
}