import Link from 'next/link';
import { motion } from 'framer-motion';

interface HomeManzilCardProps {
  manzilNumber: number;
  surahStart: string;
  surahEnd: string;
  description: string;
  ayahRange: string;
}

const getManzilName = (num: number): string => {
  const arabicNumerals = ['١', '٢', '٣', '٤', '٥', '٦', '٧'];
  return `المنزل ${arabicNumerals[num - 1]}`;
};

export default function HomeManzilCard({
  manzilNumber,
  surahStart,
  surahEnd,
  description,
  ayahRange
}: HomeManzilCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      viewport={{ once: true }}
      className="manzil-card-wrapper"
    >
      <Link href={`/manzil/${manzilNumber}`} className="manzil-card">
        <div className="left-content">
          <div className="manzil-number">{manzilNumber}</div>
          <div className="name-container">
            <div className="manzil-name-en">Manzil {manzilNumber}</div>
            <div className="manzil-description">{description}</div>
          </div>
        </div>
        <div className="right-content">
          <div className="manzil-name-ar" dir="rtl">{getManzilName(manzilNumber)}</div>
          <div className="manzil-range">
            {surahStart}
            {surahEnd !== surahStart && (
              <span> to {surahEnd}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}