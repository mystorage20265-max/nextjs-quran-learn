import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Duas & Supplications - Nur Quran Learning Hub',
  description: 'Collection of authentic duas and supplications from the Quran and Sunnah with Arabic text, transliteration, and translations. Rabbana Duas, Morning & Evening Adhkar, Daily Duas, Protection Duas, and more.',
  keywords: ['duas', 'supplications', 'islamic prayers', 'quran', 'sunnah', 'dhikr', 'rabbana duas', 'morning adhkar', 'evening adhkar', 'ramadan duas'],
  openGraph: {
    title: 'Duas & Supplications - Nur Quran Learning Hub',
    description: 'Authentic Islamic supplications from Quran and Sunnah with Arabic, transliteration & translation.',
    type: 'website',
  },
};

export default function DuaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}