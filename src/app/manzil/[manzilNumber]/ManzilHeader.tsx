import Link from 'next/link';
import './manzil-header.css';

interface ManzilHeaderProps {
  manzilNumber: number;
  totalVerses: number;
  totalPages: number;
  autoplay: boolean;
  setAutoplay: (value: boolean) => void;
}

export default function ManzilHeader({ 
  manzilNumber, 
  totalVerses, 
  totalPages,
  autoplay,
  setAutoplay
}: ManzilHeaderProps) {
  // Information about each manzil
  const manzilInfo = [
    {
      number: 1,
      description: "From Surah Al-Fatihah (1) to Surah Al-Nisa (4:176)",
      englishDescription: "The Opening to Women",
      arabicTitle: "المنزل ١"
    },
    {
      number: 2,
      description: "From Surah Al-Ma'idah (5) to Surah Al-Tawbah (9:129)",
      englishDescription: "The Table Spread to Repentance",
      arabicTitle: "المنزل ٢"
    },
    {
      number: 3,
      description: "From Surah Yunus (10) to Surah Al-Nahl (16:128)",
      englishDescription: "Jonah to The Bee",
      arabicTitle: "المنزل ٣"
    },
    {
      number: 4,
      description: "From Surah Al-Isra (17) to Surah Al-Furqan (25:77)",
      englishDescription: "The Night Journey to The Criterion",
      arabicTitle: "المنزل ٤"
    },
    {
      number: 5,
      description: "From Surah Al-Shu'ara (26) to Surah Ya-Sin (36:83)",
      englishDescription: "The Poets to Ya Sin",
      arabicTitle: "المنزل ٥"
    },
    {
      number: 6,
      description: "From Surah Al-Saffat (37) to Surah Al-Hujurat (49:18)",
      englishDescription: "Those Who Set The Ranks to The Rooms",
      arabicTitle: "المنزل ٦"
    },
    {
      number: 7,
      description: "From Surah Qaf (50) to Surah Al-Nas (114:6)",
      englishDescription: "Qaf to Mankind",
      arabicTitle: "المنزل ٧"
    }
  ];
  
  // Get the current manzil information
  const currentManzil = manzilInfo.find(m => m.number === manzilNumber) || {
    number: manzilNumber,
    description: `Manzil ${manzilNumber}`,
    englishDescription: `Manzil ${manzilNumber}`,
    arabicTitle: `المنزل ${manzilNumber}`
  };

  return (
    <div className="manzil-header">
      {/* Title block */}
      <div className="manzil-title-container">
        <h1 className="manzil-arabic-title">{currentManzil.arabicTitle}</h1>
        <h2 className="manzil-english-title">Manzil {manzilNumber}</h2>
        <p className="manzil-subtitle">Section {manzilNumber} of 7 · Holy Quran</p>
      </div>

      {/* 7-dot progress indicator */}
      <div className="manzil-progress">
        {[1, 2, 3, 4, 5, 6, 7].map((n, i) => (
          <>
            {i > 0 && <span key={`c-${n}`} className="manzil-dot-connector" />}
            <Link
              key={n}
              href={`/manzil/${n}`}
              className={`manzil-dot${n === manzilNumber ? ' active' : ''}`}
              title={`Manzil ${n}`}
            >
              {n}
            </Link>
          </>
        ))}
      </div>

      <div className="manzil-stats">
        <div className="stat-item">
          <div className="stat-label">Verses</div>
          <div className="stat-value">{totalVerses}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Section</div>
          <div className="stat-value">{manzilNumber}/7</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Pages</div>
          <div className="stat-value">{totalPages}</div>
        </div>
      </div>
      
      <div className="manzil-actions">
        <button
          className={`auto-play-button ${autoplay ? 'playing' : ''}`}
          onClick={() => setAutoplay(!autoplay)}
        >
          {autoplay ? '⏹ Stop' : '▶ Auto-Play'}
        </button>
        <Link href="/quran" className="back-to-quran-button">
          ← Quran Index
        </Link>
      </div>
      
      <div className="manzil-info">
        <p className="manzil-description">{currentManzil.description}</p>
        <p className="manzil-english-description">{currentManzil.englishDescription}</p>
      </div>
    </div>
  );
}