// Read Quran - Layout
import type { Metadata } from 'next';
import './styles/read-quran.css';

export const metadata: Metadata = {
    title: 'Read Quran | QuranicLearn - Noble Quran with Translations',
    description: 'Read the Holy Quran online with translations, audio recitations, and beautiful Arabic text. Explore all 114 Surahs with verse-by-verse translations.',
    keywords: 'read quran, quran online, quran translation, quran audio, surah, ayah, arabic quran',
    openGraph: {
        title: 'Read Quran | QuranicLearn',
        description: 'Read the Holy Quran online with translations and audio recitations.',
        type: 'website',
    },
};

export default function ReadQuranLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="read-quran-page">
            {children}
        </div>
    );
}
