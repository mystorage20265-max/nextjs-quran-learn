
// --- SERVER COMPONENT ---
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../components/Footer';
import * as quranComApi from '../../../services/quranComApi';

const TRANSLATION_EDITION = 17; // Muhammad Asad translation ID in Quran.com API
const AUDIO_RECITER = 7; // Mishary Alafasy reciter ID

export async function generateStaticParams() {
  return Array.from({ length: 60 }, (_, i) => ({ hizbNumber: String(i + 1) }));
}

async function fetchHizb(hizbNumber: number) {
  // Quran.com API uses hizb_number (1-60), not hizbQuarter (1-240)
  // Each hizb contains 4 quarters
  const { verses } = await quranComApi.getVersesByHizb(hizbNumber, {
    translations: TRANSLATION_EDITION,
    words: false
  });

  return verses.map((verse: any) => ({
    number: verse.id,
    numberInSurah: verse.verse_number,
    surah: {
      number: verse.chapter_id,
      name: verse.chapter?.name_arabic || '',
      englishName: verse.chapter?.name_simple || ''
    },
    text: verse.text_uthmani,
    translation: verse.translations?.[0]?.text || '',
    audio: `https://verses.quran.com/${AUDIO_RECITER}/${verse.verse_key.replace(':', '_')}.mp3`
  }));
}

export default async function HizbPage({ params }) {
  const hizbId = Number(params.hizbNumber);

  // Ayah type for type safety
  type Ayah = {
    number: number;
    numberInSurah: number;
    surah: any;
    text: string;
    translation?: string | null;
    audio?: string | null;
  };

  let merged: Ayah[] = [];
  let error: string | null = null;

  try {
    merged = await fetchHizb(hizbId);
  } catch (e: any) {
    error = e.message || "Failed to load Hizb data.";
  }

  // Pass data to client component
  const HizbViewerClient = (await import("./HizbViewerClient")).default;
  return <HizbViewerClient hizb={hizbId} ayahs={merged} error={error} />;
}