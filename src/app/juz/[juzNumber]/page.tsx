import { Metadata } from 'next';

import JuzViewerClient from './JuzViewer.client';
import Navbar from '../../../components/Navbar/Navbar';

import { toNumber } from '../../../types/app';
import './JuzViewer.css';

type JuzParams = {
  juzNumber: string;
}

interface PageProps {
  params: JuzParams;
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const juzNumber = toNumber(params.juzNumber);

  try {
    return {
      title: `Juz ${juzNumber} - Quran`,
      description: `Read Juz ${juzNumber} of the Holy Quran with translations and audio recitation.`,
      keywords: `quran, juz ${juzNumber}, quran part ${juzNumber}, hizb, quran section, ayah, verse, audio recitation`,
    };
  } catch (error) {
    return {
      title: 'Juz - Quran',
      description: 'Read the Holy Quran with translations.',
    };
  }
}


type Ayah = {
  number: number;
  numberInSurah?: number;
  surah?: { number: number; englishName?: string; name?: string };
  text?: string;
  translation?: string;
};

// Strip ALL annotation/mark characters that render as boxes when font lacks support:
//   U+0610–U+061A: Arabic phonetic annotation marks (sallallaahu, alayhe, etc.)
//   U+06D6–U+06FF: Indopak waqf marks, end-of-ayah ۝, rub el hizb ۞, sajda mark ۩
//   U+FBB2–U+FBC2: Arabic Presentation Forms used in some Quran editions
// Core Arabic letters and standard tashkeel (U+0621–U+06D5) are preserved.
function cleanIndopakText(text: string): string {
  return text
    .replace(/[\u0610-\u061A]/g, '') // Arabic Quran-specific phonetic marks
    .replace(/[\u06D6-\u06FF]/g, '') // waqf marks, annotation glyphs, Indo-Pak marks
    .replace(/[\uFBB2-\uFBC2]/g, '') // Arabic Presentation Forms (Quran edition marks)
    .replace(/\s{2,}/g, ' ')         // collapse double spaces left behind
    .trim();
}


async function fetchJuzMerged(juzNum: number) {

  const translationEdition = "en.asad";

  // Fetch Indopak script from Quran Foundation + English translation from alquran.cloud in parallel
  const [indopakRes, translationRes] = await Promise.all([
    fetch(`https://api.qurancdn.com/api/v4/quran/verses/indopak?juz_number=${juzNum}&per_page=300`),
    fetch(`https://api.alquran.cloud/v1/juz/${juzNum}/${translationEdition}`),
  ]);
  const [indopakJson, translationJson] = await Promise.all([
    indopakRes.json(),
    translationRes.json(),
  ]);

  // Build a map: verse_key (e.g. "2:1") -> indopak text
  const indopakMap = new Map<string, string>();
  (indopakJson?.verses || []).forEach((v: any) => {
    indopakMap.set(v.verse_key, v.text_indopak);
  });

  // Use translation ayahs as the source of truth for metadata; augment with Indopak text
  const ayahs: Ayah[] = (translationJson?.data?.ayahs || []).map((a: any) => {
    const verseKey = `${a.surah?.number}:${a.numberInSurah}`;
    return {
      number: a.number,
      numberInSurah: a.numberInSurah,
      surah: a.surah,
      text: cleanIndopakText(indopakMap.get(verseKey) || ""),
      translation: a.text || a.translation || "",
    };
  });
  return ayahs;
}

export default async function JuzPage({ params }: PageProps) {
  const juzNumber = toNumber(params.juzNumber);
  const ayahs = await fetchJuzMerged(juzNumber);
  return (
    <div className="juz-page-container">
      <Navbar />
      <main>
        <JuzViewerClient ayahs={ayahs} juz={juzNumber} />
      </main>
    </div>
  );
}