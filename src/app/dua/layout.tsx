import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Duas & Supplications - Learn Quran',
  description: 'Collection of authentic duas and supplications from the Quran and Sunnah with translations and transliterations.',
  keywords: ['duas', 'supplications', 'islamic prayers', 'quran', 'sunnah', 'dhikr'],
  openGraph: {
    title: 'Duas & Supplications - Learn Quran',
    description: 'Collection of authentic duas and supplications from the Quran and Sunnah.',
    type: 'website',
  },
};

export default function DuaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Material Icons for this section */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}