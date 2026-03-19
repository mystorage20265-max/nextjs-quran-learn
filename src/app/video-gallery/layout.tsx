import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Gallery | LearnQuran+ - Sacred Knowledge Pursued',
  description: 'Explore our vast library of Quran recitations, Islamic lectures, prophet stories, and live channels. Learn from world-renowned scholars in high quality.',
  keywords: ['Quran videos', 'Islamic lectures', 'Nouman Ali Khan', 'Zakir Naik', 'Mishary Rashid', 'Mecca Live', 'Madinah Live', 'Islamic TV'],
  openGraph: {
    title: 'LearnQuran+ Video Gallery',
    description: 'Sacred Islamic knowledge in premium video quality.',
    images: ['/images/video-posters/quran-recitation.png'],
  },
};

export default function VideoGalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
