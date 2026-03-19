import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hadees Collection - Learn Quran',
  description: 'Browse authentic Prophetic narrations from Sahih Bukhari, Sahih Muslim, Nawawi\'s 40, Abu Dawud, Tirmidhi, and Ibn Majah with full English translations.',
  keywords: ['hadees', 'hadith', 'sahih bukhari', 'sahih muslim', 'nawawi', 'prophetic narrations', 'sunnah', 'islamic'],
  openGraph: {
    title: 'Hadees Collection - Learn Quran',
    description: 'Authentic Prophetic narrations from the most trusted hadith collections.',
    type: 'website',
  },
};

export default function HadeesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
