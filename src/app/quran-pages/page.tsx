import type { Metadata } from 'next';
import QuranPageReader from './QuranPageReader';

export const metadata: Metadata = {
  title: 'Quran Page Reader | Learn Quran',
  description:
    'Read the Noble Quran page by page in a distraction-free, book-like interface. Swipe to turn pages with a realistic page-flip animation.',
  openGraph: {
    title: 'Quran Page Reader | Learn Quran',
    description: 'A beautiful, distraction-free Quran reading experience — page by page, just like a real Mushaf.',
  },
};

export default function QuranPagesPage() {
  return <QuranPageReader />;
}
