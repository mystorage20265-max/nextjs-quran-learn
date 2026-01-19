import Link from 'next/link';
import { motion } from 'framer-motion';

interface HomeHizbCardProps {
  hizbNumber: number;
  surahStart: string;
  surahEnd: string;
  ayahRange: string;
}

const getHizbName = (num: number): string => {
  const arabicNumerals = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠',
    '١١', '١٢', '١٣', '١٤', '١٥', '١٦', '١٧', '١٨', '١٩', '٢٠',
    '٢١', '٢٢', '٢٣', '٢٤', '٢٥', '٢٦', '٢٧', '٢٨', '٢٩', '٣٠',
    '٣١', '٣٢', '٣٣', '٣٤', '٣٥', '٣٦', '٣٧', '٣٨', '٣٩', '٤٠',
    '٤١', '٤٢', '٤٣', '٤٤', '٤٥', '٤٦', '٤٧', '٤٨', '٤٩', '٥٠',
    '٥١', '٥٢', '٥٣', '٥٤', '٥٥', '٥٦', '٥٧', '٥٨', '٥٩', '٦٠'];
  return `الحزب ${arabicNumerals[num - 1]}`;
};

export default function HomeHizbCard({
  hizbNumber,
  surahStart,
  surahEnd,
  ayahRange
}: HomeHizbCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      viewport={{ once: true }}
      className="hizb-card-wrapper"
    >
      <Link href={`/hizb/${hizbNumber}`} className="hizb-card">
        <div className="left-content">
          <div className="hizb-number">{hizbNumber}</div>
          <div className="name-container">
            <div className="hizb-name-en">Hizb {hizbNumber}</div>
            <div className="hizb-range">
              From {surahStart}
              {surahEnd !== surahStart && (
                <span> to {surahEnd}</span>
              )}
            </div>
          </div>
        </div>
        <div className="right-content">
          <div className="hizb-name-ar" dir="rtl">{getHizbName(hizbNumber)}</div>
        </div>
      </Link>
    </motion.div>
  );
}