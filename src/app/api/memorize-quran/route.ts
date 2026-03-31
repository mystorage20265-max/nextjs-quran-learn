// API Route for Memorize Quran feature
// Uses Quran.com API v4 - completely separate from existing integrations

import { NextRequest, NextResponse } from 'next/server';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';
const AUDIO_CDN = 'https://verses.quran.com';

// Popular reciters with their IDs from Quran.com API
const RECITERS = [
    { id: 7, name: 'Mishary Rashid Alafasy', style: 'Murattal' },
    { id: 1, name: 'Abdul Basit Abdul Samad', style: 'Mujawwad' },
    { id: 2, name: 'Abdul Rahman Al-Sudais', style: 'Murattal' },
    { id: 3, name: 'Abu Bakr Al-Shatri', style: 'Murattal' },
    { id: 4, name: 'Hani Ar-Rifai', style: 'Murattal' },
    { id: 5, name: 'Mahmoud Khalil Al-Hussary', style: 'Murattal' },
    { id: 6, name: 'Saad Al-Ghamdi', style: 'Murattal' },
    { id: 9, name: 'Mohamed Siddiq El-Minshawi', style: 'Mujawwad' },
    { id: 10, name: 'Sa\'ud Ash-Shuraym', style: 'Murattal' },
    { id: 12, name: 'Maher Al-Muaiqly', style: 'Murattal' },
];

interface ChapterInfo {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

interface Verse {
    id: number;
    verse_key: string;
    verse_number: number;
    text_uthmani: string;
    text_indopak?: string;
    text_imlaei?: string;
    words?: {
        text_uthmani: string;
        translation: {
            text: string;
        };
    }[];
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        switch (action) {
            case 'chapters':
                return await getChapters();
            case 'verses':
                return await getVerses(searchParams);
            case 'audio':
                return await getAudioUrl(searchParams);
            case 'reciters':
                return getReciters();
            default:
                return NextResponse.json({
                    error: 'Invalid action',
                    validActions: ['chapters', 'verses', 'audio', 'reciters']
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Memorize Quran API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Get list of all 114 chapters
async function getChapters(): Promise<NextResponse> {
    const response = await fetch(`${QURAN_API_BASE}/chapters?language=en`, {
        next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
        throw new Error('Failed to fetch chapters');
    }

    const data = await response.json();
    const chapters = data.chapters.map((ch: ChapterInfo) => ({
        id: ch.id,
        name: ch.name_simple,
        nameArabic: ch.name_arabic,
        nameTranslation: ch.translated_name.name,
        versesCount: ch.verses_count,
        revelationPlace: ch.revelation_place,
        revelationOrder: ch.revelation_order
    }));

    return NextResponse.json({ chapters });
}

// Get verses for a chapter with Uthmanic text
async function getVerses(params: URLSearchParams): Promise<NextResponse> {
    const chapterId = params.get('chapter');
    const fromVerse = params.get('from') || '1';
    const toVerse = params.get('to');
    const translationId = params.get('translation') || '131'; // Sahih International

    if (!chapterId) {
        return NextResponse.json({ error: 'Chapter ID required' }, { status: 400 });
    }

    // Build the API URL with Uthmanic script
    let apiUrl = `${QURAN_API_BASE}/verses/by_chapter/${chapterId}?language=en&words=true&translations=${translationId}&fields=text_uthmani,text_indopak&word_fields=text_uthmani,translation`;

    // Pagination for verse range
    if (toVerse) {
        const perPage = parseInt(toVerse) - parseInt(fromVerse) + 1;
        apiUrl += `&page=1&per_page=${Math.min(perPage, 50)}`;
    }

    const response = await fetch(apiUrl, {
        next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error('Failed to fetch verses');
    }

    const data = await response.json();

    // Helper to clean Indo-Pak text — strips all annotation/mark characters that render as boxes.
    // Matching the same cleaning logic from /read-quran to ensure consistent rendering
    // Three ranges are stripped:
    //   U+0610–U+061A: Arabic phonetic annotation marks (sallallaahu, alayhe, etc.)
    //   U+06D6–U+06FF: Indo-Pak waqf / pause / sajda annotation glyphs
    //   U+FBB2–U+FBC2: Arabic Presentation Forms used in some Quran editions
    // Core Arabic letters and standard tashkeel (U+0621–U+06D5) are preserved.
    const cleanIndopakText = (text: string): string => {
        if (!text) return '';
        return text
            .replace(/\u06E1/g, '\u0652')     // IndoPak sukun (ۡ U+06E1) → standard sukun (ْ U+0652)
            .replace(/[\uFBB2-\uFBC2]/g, '') // Arabic Presentation Forms (Quran edition marks)
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    // Process verses with Uthmani text as primary (matching /read-quran)
    const verses = data.verses.map((v: Verse & { translations?: { text: string }[] }) => ({
        id: v.id,
        verseKey: v.verse_key,
        verseNumber: v.verse_number,
        textUthmani: cleanIndopakText(v.text_uthmani),                     // Uthmani as primary display text
        textIndopak: cleanIndopakText(v.text_indopak || v.text_uthmani),  // Indo-Pak kept for reference
        arabicText: cleanIndopakText(v.text_uthmani),                      // convenient alias - Uthmani
        translation: v.translations?.[0]?.text || '',
        words: v.words?.map(w => ({
            arabic: cleanIndopakText(w.text_uthmani),
            translation: w.translation?.text || ''
        }))
    }));

    // Filter by verse range if specified
    const from = parseInt(fromVerse);
    const to = toVerse ? parseInt(toVerse) : verses.length;
    const filteredVerses = verses.filter((v: { verseNumber: number }) =>
        v.verseNumber >= from && v.verseNumber <= to
    );

    return NextResponse.json({
        verses: filteredVerses,
        pagination: data.pagination
    });
}

// Get audio URL for a specific verse
async function getAudioUrl(params: URLSearchParams): Promise<NextResponse> {
    const reciterId = params.get('reciter') || '7'; // Default: Mishary Alafasy
    const verseKey = params.get('verseKey'); // Format: "1:1" (surah:ayah)

    if (!verseKey) {
        return NextResponse.json({ error: 'Verse key required (format: surah:ayah)' }, { status: 400 });
    }

    // Fetch audio file info from Quran.com API
    const response = await fetch(
        `${QURAN_API_BASE}/recitations/${reciterId}/by_ayah/${verseKey}`,
        { next: { revalidate: 86400 } }
    );

    if (!response.ok) {
        // Fallback: construct audio URL directly
        const [surah, ayah] = verseKey.split(':');
        const paddedSurah = surah.padStart(3, '0');
        const paddedAyah = ayah.padStart(3, '0');

        return NextResponse.json({
            audioUrl: `${AUDIO_CDN}/${reciterId}/${paddedSurah}${paddedAyah}.mp3`,
            verseKey,
            reciterId: parseInt(reciterId)
        });
    }

    const data = await response.json();
    const audioFile = data.audio_files?.[0];

    return NextResponse.json({
        audioUrl: audioFile?.url ? `${AUDIO_CDN}/${audioFile.url}` : null,
        verseKey,
        reciterId: parseInt(reciterId)
    });
}

// Get list of available reciters
function getReciters(): NextResponse {
    return NextResponse.json({ reciters: RECITERS });
}
