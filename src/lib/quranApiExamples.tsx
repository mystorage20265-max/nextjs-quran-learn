// Example: How to use the Quran.com API in your Next.js app
// This is a demonstration file showing common usage patterns

import { QuranAPI, TRANSLATIONS, type Verse, type ChapterInfo } from '@/lib/quranApi';

/**
 * EXAMPLE 1: Server Component - Fetch and Display Surah
 * Use in any server component (app router)
 */
export async function ExampleSurahDisplay() {
    // Fetch Al-Fatiha with word-by-word and translation
    const { verses } = await QuranAPI.getVersesByChapter(1, {
        words: true,
        translations: [TRANSLATIONS.SAHIH_INTERNATIONAL],
    });

    return (
        <div className="container">
            <h1>Surah Al-Fatiha</h1>
            {verses.map((verse) => (
                <div key={verse.id} className="verse-card">
                    {/* Arabic Text */}
                    <p className="text-3xl text-right font-arabic">
                        {verse.text_uthmani}
                    </p>

                    {/* Translation */}
                    {verse.translations && (
                        <p className="text-gray-700 mt-4">
                            {verse.translations[0].text}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * EXAMPLE 2: Fetch Multiple Translations
 */
export async function ExampleMultipleTranslations() {
    const { verses } = await QuranAPI.getVersesByChapter(1, {
        words: false,
        translations: [
            TRANSLATIONS.SAHIH_INTERNATIONAL,
            TRANSLATIONS.DR_MUSTAFA_KHATTAB,
            TRANSLATIONS.YUSUF_ALI,
        ],
    });

    return (
        <div>
            {verses.map((verse) => (
                <div key={verse.id}>
                    <p className="arabic">{verse.text_uthmani}</p>

                    {/* Display all translations */}
                    {verse.translations?.map((trans) => (
                        <div key={trans.id} className="translation">
                            <p>{trans.text}</p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * EXAMPLE 3: Word-by-Word Interactive Component
 * This would be a client component ('use client')
 */
export function ExampleWordByWordUsage({ verse }: { verse: Verse }) {
    // In a real client component, you'd have state and handlers
    const handleWordClick = (wordId: number) => {
        const word = verse.words?.find(w => w.id === wordId);
        if (word) {
            // Play audio
            const audio = new Audio(word.audio.url);
            audio.play();

            // Show translation tooltip, etc.
            console.log(`${word.text_uthmani}: ${word.translation.text}`);
        }
    };

    return (
        <div className="word-by-word">
            {verse.words?.map((word) => (
                <button
                    key={word.id}
                    onClick={() => handleWordClick(word.id)}
                    className="text-2xl hover:bg-blue-100 px-2 py-1 rounded"
                    title={`${word.translation.text} (${word.transliteration.text})`}
                >
                    {word.text_uthmani}
                </button>
            ))}
        </div>
    );
}

/**
 * EXAMPLE 4: Fetch Chapter Information
 */
export async function ExampleChapterInfo() {
    const chapters = await QuranAPI.getAllChapters('en');

    return (
        <div className="grid grid-cols-3 gap-4">
            {chapters.map((chapter) => (
                <div key={chapter.id} className="card">
                    <h3>{chapter.name_arabic}</h3>
                    <p>{chapter.name_simple}</p>
                    <p className="text-sm text-gray-500">
                        {chapter.translated_name.name}
                    </p>
                    <span className="badge">
                        {chapter.verses_count} verses
                    </span>
                </div>
            ))}
        </div>
    );
}

/**
 * EXAMPLE 5: Fetch by Page (Mushaf Mode)
 */
export async function ExampleMushafPage({ pageNumber }: { pageNumber: number }) {
    const verses = await QuranAPI.getVersesByPage(pageNumber, {
        words: false,
        translations: [TRANSLATIONS.SAHIH_INTERNATIONAL],
    });

    return (
        <div className="mushaf-page">
            <h2>Page {pageNumber}</h2>
            {verses.map((verse) => (
                <div key={verse.id}>
                    <span className="verse-badge">{verse.verse_key}</span>
                    <p className="arabic">{verse.text_uthmani}</p>
                </div>
            ))}
        </div>
    );
}

/**
 * EXAMPLE 6: Error Handling Pattern
 */
export async function ExampleWithErrorHandling() {
    try {
        const { verses } = await QuranAPI.getVersesByChapter(1);

        return <div>Success! Loaded {verses.length} verses</div>;
    } catch (error) {
        console.error('Failed to load Quran data:', error);
        return (
            <div className="error">
                <p>Failed to load Quran data. Please try again.</p>
            </div>
        );
    }
}

/**
 * EXAMPLE 7: Client-Side Data Fetching with useEffect
 * For client components that need dynamic data
 */
/*
'use client';
import { useState, useEffect } from 'react';

export function ExampleClientSideFetch() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { verses } = await QuranAPI.getVersesByChapter(1);
        setVerses(verses);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {verses.map(verse => (
        <div key={verse.id}>{verse.text_uthmani}</div>
      ))}
    </div>
  );
}
*/
