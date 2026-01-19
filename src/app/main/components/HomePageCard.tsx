import Link from 'next/link';
import { motion } from 'framer-motion';

interface HomePageCardProps {
  pageNumber: number;
  surahStart: string;
  surahEnd: string;
  ayahRange: string;
}

const getPageName = (num: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const arabicNumber = num.toString().split('').map(digit => arabicDigits[parseInt(digit)]).join('');
  return `صفحة ${arabicNumber}`;
};

export default function HomePageCard({
  pageNumber,
  surahStart,
  surahEnd,
  ayahRange
}: HomePageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      viewport={{ once: true }}
      className="page-card-wrapper"
    >
      <Link href={`/page/${pageNumber}`} className="page-card">
        <div className="left-content">
          <div className="page-number">{pageNumber}</div>
          <div className="name-container">
            <div className="page-name-en">Page {pageNumber}</div>
            <div className="page-description">
              {surahStart}
              {surahEnd !== surahStart && (
                <span> to {surahEnd}</span>
              )}
            </div>
          </div>
        </div>
        <div className="right-content">
          <div className="page-name-ar" dir="rtl">{getPageName(pageNumber)}</div>
          <div className="ayah-range" dir="rtl">{ayahRange}</div>
        </div>
      </Link>
    </motion.div>
  );
}