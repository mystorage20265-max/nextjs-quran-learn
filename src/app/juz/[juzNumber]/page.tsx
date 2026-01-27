import { Metadata } from 'next';
import Footer from '../../components/Footer';
import JuzViewerClient from './JuzViewer.client';
import Navbar from '../../../components/Navbar/Navbar';
import { getJuzData } from '../../../utils/quranSectionApi';
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

async function fetchJuzMerged(juzNum: number) {
  // Use the migrated quranSectionApi  
  const juzData = await getJuzData(juzNum, 131); // Sahih International translation (ID: 131)

  const ayahs: Ayah[] = juzData.ayahs.map((a: any) => ({
    number: a.number,
    numberInSurah: a.numberInSurah,
    surah: a.surah,
    text: a.text,
    translation: a.translation || '',
  }));

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