import Link from 'next/link';
import { motion } from 'framer-motion';

interface HomeRukuCardProps {
  rukuNumber: number;
  surahStart: string;
  surahEnd: string;
  ayahRange: string;
}

const getRukuName = (num: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const arabicNumber = num.toString().split('').map(digit => arabicDigits[parseInt(digit)]).join('');
  return `ركوع ${arabicNumber}`;
};

export default function HomeRukuCard({
  rukuNumber,
  surahStart,
  surahEnd,
  ayahRange
}: HomeRukuCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      viewport={{ once: true }}
      className="ruku-card-wrapper"
    >
      <Link href={`/quran/ruku/${rukuNumber}`} className="ruku-card">
        <div className="left-content">
          <div className="ruku-number">{rukuNumber}</div>
          <div className="name-container">
            <div className="ruku-name-en">Ruku {rukuNumber}</div>
            <div className="ruku-range">
              {surahStart}
              {surahEnd !== surahStart && (
                <span> to {surahEnd}</span>
              )}
            </div>
          </div>
        </div>
        <div className="right-content">
          <div className="ruku-name-ar" dir="rtl">{getRukuName(rukuNumber)}</div>
          <div className="ruku-ayah-range" dir="rtl">{ayahRange}</div>
        </div>
      </Link>
    </motion.div>
  );
}