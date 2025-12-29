import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.quran.com/api/v4';

// The API returns relative URLs without a CDN base
// We'll construct full streaming URLs that work with Quran.com's infrastructure
const AUDIO_STREAM_BASE = '/api/radio/audio-stream';

// Enhanced reciter mapping with metadata
const RECITER_RECITATION_MAP: Record<number, { id: number; name: string; quality: string[] }> = {
  1: { id: 1, name: 'AbdulBaset AbdulSamad - Mujawwad', quality: ['128k', '192k', '320k'] },
  2: { id: 2, name: 'AbdulBaset AbdulSamad - Murattal', quality: ['128k', '192k', '320k'] },
  3: { id: 3, name: 'Abdur-Rahman as-Sudais', quality: ['128k', '192k'] },
  4: { id: 4, name: 'Abu Bakr al-Shatri', quality: ['128k', '192k'] },
  5: { id: 5, name: 'Hani ar-Rifai', quality: ['128k', '192k'] },
  6: { id: 6, name: 'Mahmoud Khalil Al-Husary', quality: ['128k', '192k'] },
  7: { id: 7, name: 'Mishari Rashid al-Afasy', quality: ['128k', '192k'] },
  8: { id: 8, name: 'Mohamed Siddiq al-Minshawi - Mujawwad', quality: ['128k', '192k'] },
  9: { id: 9, name: 'Mohamed Siddiq al-Minshawi - Murattal', quality: ['128k', '192k'] },
  10: { id: 10, name: "Sa'ud ash-Shuraym", quality: ['128k'] },
  11: { id: 11, name: 'Mohamed al-Tablawi', quality: ['128k'] },
  12: { id: 12, name: 'Mahmoud Khalil Al-Husary - Muallim', quality: ['128k'] },
  13: { id: 13, name: 'Saad al-Ghamdi', quality: ['128k'] },
  14: { id: 14, name: 'Yasser Ad Dossary', quality: ['128k'] },
};

/**
 * GET /api/radio/audio
 * 
 * Enhanced audio endpoint with streaming support
 * 
 * Query params:
 *   - reciterId: Reciter ID (required)
 *   - surahNumber: Surah number (required)
 *   - verseStart: Starting verse number (optional)
 *   - verseEnd: Ending verse number (optional)
 *   - quality: Audio quality (optional) - default '128k'
 *
 * Returns audio URLs via local streaming endpoint for Quranic audio
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reciterId = searchParams.get('reciterId');
    const surahNumber = searchParams.get('surahNumber');
    const verseStart = searchParams.get('verseStart');
    const verseEnd = searchParams.get('verseEnd');
    const quality = searchParams.get('quality') || '128k';

    console.log(
      `[audio] 📡 Request: reciter=${reciterId}, surah=${surahNumber}, verses=${verseStart}-${verseEnd}, quality=${quality}`
    );

    if (!reciterId || !surahNumber) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required parameters: reciterId and surahNumber',
        },
        { status: 400 }
      );
    }

    const reciterIdNum = parseInt(reciterId);
    const surahNum = parseInt(surahNumber);

    // Validate reciter with metadata
    const reciterInfo = RECITER_RECITATION_MAP[reciterIdNum];
    if (!reciterInfo) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Reciter ID ${reciterId} not found`,
        },
        { status: 404 }
      );
    }

    // Validate surah
    if (surahNum < 1 || surahNum > 114) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Invalid surah number: ${surahNum}`,
        },
        { status: 400 }
      );
    }

    console.log(`[audio] ✅ Validated - Reciter: ${reciterInfo.name}`);

    // Fetch surah metadata to get verse count and name
    console.log(`[audio] 📚 Fetching surah ${surahNum} metadata...`);
    const chapterResponse = await fetch(`${API_BASE_URL}/chapters/${surahNum}?language=en`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!chapterResponse.ok) {
      throw new Error('Failed to fetch surah data');
    }

    const chapterData = await chapterResponse.json();
    const chapter = chapterData.chapter;

    // Fetch audio files for this recitation and chapter
    console.log(`[audio] 🎵 Fetching audio files for recitation ${reciterInfo.id}...`);
    const audioResponse = await fetch(
      `${API_BASE_URL}/recitations/${reciterInfo.id}/by_chapter/${surahNum}?language=en`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio files: ${audioResponse.status}`);
    }

    const audioData = await audioResponse.json();
    let audioFiles = audioData.audio_files || [];

    // Filter by verse range if specified
    if (verseStart || verseEnd) {
      const start = verseStart ? parseInt(verseStart) : 1;
      const end = verseEnd ? parseInt(verseEnd) : chapter.verses_count;

      audioFiles = audioFiles.filter((file: any) => {
        const [, verseNum] = file.verse_key.split(':').map(Number);
        return verseNum >= start && verseNum <= end;
      });

      console.log(`[audio] ✂️  Filtered to verses ${start}-${end}`);
    }

    // Build streaming URLs
    const verses = audioFiles.map((file: any) => ({
      verseKey: file.verse_key,
      url: `${AUDIO_STREAM_BASE}?reciterId=${reciterIdNum}&verseKey=${file.verse_key}`,
      duration: file.duration || 0,
    }));

    const response = {
      status: 'success',
      surah: {
        number: chapter.number,
        name: chapter.name_simple,
        arabicName: chapter.name_arabic,
        versesCount: chapter.verses_count,
        revelationPlace: chapter.revelation_place,
        revelationOrder: chapter.revelation_order,
      },
      reciter: {
        id: reciterIdNum,
        name: reciterInfo.name,
        quality: quality,
        availableQualities: reciterInfo.quality,
      },
      audio: {
        totalVerses: audioFiles.length,
        format: 'mp3',
        verses: verses,
      },
      meta: {
        timestamp: new Date().toISOString(),
        cached: false,
      },
    };

    console.log(
      `[audio] ✅ Successfully prepared ${audioFiles.length} verses for ${chapter.name_simple}`
    );

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Total-Verses': audioFiles.length.toString(),
        'X-Surah-Number': surahNum.toString(),
        'X-Reciter-ID': reciterIdNum.toString(),
        'X-Reciter-Name': reciterInfo.name,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[audio] 💥 Error: ${err.message}`);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch audio data',
        details: err.message,
      },
      { status: 500 }
    );
  }
}
