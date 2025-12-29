import { NextResponse, NextRequest } from 'next/server';

const API_BASE_URL = 'https://api.quran.com/api/v4';

interface ProxyOptions {
  reciterId: number;
  surahNumber: number;
  verseStart?: number;
  verseEnd?: number;
  format?: 'mp3' | 'wav';
}

// Reciter mapping with enhanced data
const RECITER_AUDIO_CONFIG: Record<number, { recitationId: number; quality: string[] }> = {
  1: { recitationId: 1, quality: ['128k', '192k', '320k'] },
  2: { recitationId: 2, quality: ['128k', '192k', '320k'] },
  3: { recitationId: 3, quality: ['128k', '192k'] },
  4: { recitationId: 4, quality: ['128k', '192k'] },
  5: { recitationId: 5, quality: ['128k', '192k'] },
  6: { recitationId: 6, quality: ['128k', '192k'] },
  7: { recitationId: 7, quality: ['128k', '192k'] },
  8: { recitationId: 8, quality: ['128k', '192k'] },
  9: { recitationId: 9, quality: ['128k', '192k'] },
  10: { recitationId: 10, quality: ['128k'] },
  11: { recitationId: 11, quality: ['128k'] },
  12: { recitationId: 12, quality: ['128k'] },
  13: { recitationId: 13, quality: ['128k'] },
  14: { recitationId: 14, quality: ['128k'] },
};

/**
 * GET /api/radio/audio-proxy
 * 
 * Advanced audio proxy endpoint for radio streaming
 * Supports:
 * - Surah playback (full surah)
 * - Verse range playback
 * - Quality selection
 * - Response streaming
 * 
 * Query parameters:
 * - reciterId: number (required)
 * - surahNumber: number (required)
 * - verseStart: number (optional) - start verse for range
 * - verseEnd: number (optional) - end verse for range
 * - quality: string (optional) - '128k', '192k', '320k'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reciterId = searchParams.get('reciterId');
    const surahNumber = searchParams.get('surahNumber');
    const verseStart = searchParams.get('verseStart');
    const verseEnd = searchParams.get('verseEnd');
    const quality = searchParams.get('quality') || '128k';
    const url = searchParams.get('url');

    // Handle legacy URL parameter
    if (url) {
      return handleLegacyProxyRequest(request, url);
    }

    console.log(
      `[audio-proxy] 📡 Request: reciter=${reciterId}, surah=${surahNumber}, verses=${verseStart}-${verseEnd}, quality=${quality}`
    );

    if (!reciterId || !surahNumber) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required parameters: reciterId, surahNumber',
        },
        { status: 400 }
      );
    }

    const reciterIdNum = parseInt(reciterId);
    const surahNum = parseInt(surahNumber);

    // Validate reciter
    const reciterConfig = RECITER_AUDIO_CONFIG[reciterIdNum];
    if (!reciterConfig) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Invalid reciter ID: ${reciterId}`,
        },
        { status: 400 }
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

    console.log(
      `[audio-proxy] ✅ Parameters validated - Recitation ID: ${reciterConfig.recitationId}`
    );

    // Fetch chapter/surah data
    console.log(`[audio-proxy] 📚 Fetching surah ${surahNum} metadata...`);
    const chapterResponse = await fetch(`${API_BASE_URL}/chapters/${surahNum}?language=en`, {
      next: { revalidate: 86400 },
    });

    if (!chapterResponse.ok) {
      throw new Error(`Failed to fetch surah metadata: ${chapterResponse.status}`);
    }

    const chapterData = await chapterResponse.json();
    const chapter = chapterData.chapter;

    // Fetch audio files
    console.log(
      `[audio-proxy] 🎵 Fetching audio files for recitation ${reciterConfig.recitationId}...`
    );
    const audioResponse = await fetch(
      `${API_BASE_URL}/recitations/${reciterConfig.recitationId}/by_chapter/${surahNum}?language=en`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio files: ${audioResponse.status}`);
    }

    const audioData = await audioResponse.json();
    const audioFiles = audioData.audio_files || [];

    // Filter by verse range if specified
    let filteredAudioFiles = audioFiles;
    if (verseStart || verseEnd) {
      const start = verseStart ? parseInt(verseStart) : 1;
      const end = verseEnd ? parseInt(verseEnd) : chapter.verses_count;

      filteredAudioFiles = audioFiles.filter((file: any) => {
        const [, verseNum] = file.verse_key.split(':').map(Number);
        return verseNum >= start && verseNum <= end;
      });

      console.log(
        `[audio-proxy] ✂️  Filtered to verses ${start}-${end} (${filteredAudioFiles.length} verses)`
      );
    }

    // Prepare response data
    const responseData = {
      status: 'success',
      surah: {
        number: chapter.number,
        name: chapter.name_simple,
        arabicName: chapter.name_arabic,
        versesCount: chapter.verses_count,
      },
      reciter: {
        id: reciterIdNum,
        recitationId: reciterConfig.recitationId,
        quality: quality,
        availableQualities: reciterConfig.quality,
      },
      audio: {
        count: filteredAudioFiles.length,
        format: 'mp3',
        baseUrl: '/api/radio/audio-stream',
        verses: filteredAudioFiles.map((file: any) => ({
          verseKey: file.verse_key,
          url: `/api/radio/audio-stream?reciterId=${reciterIdNum}&verseKey=${file.verse_key}`,
          duration: file.duration || 0,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        cacheControl: 'public, max-age=3600',
      },
    };

    console.log(
      `[audio-proxy] ✅ Successfully prepared ${filteredAudioFiles.length} verses for streaming`
    );

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Total-Verses': filteredAudioFiles.length.toString(),
        'X-Surah': chapter.name_simple,
        'X-Reciter-ID': reciterIdNum.toString(),
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[audio-proxy] 💥 Error: ${err.message}`);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to prepare audio proxy',
        details: err.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle legacy URL parameter requests
 */
async function handleLegacyProxyRequest(request: NextRequest, audioUrl: string) {
  try {
    // Decode the URL
    const decodedUrl = decodeURIComponent(audioUrl);

    // Validate it's a Quran CDN URL for security
    if (!isValidQuranCdnUrl(decodedUrl)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid audio URL',
        },
        { status: 400 }
      );
    }

    // Fetch the audio from the CDN
    const audioResponse = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!audioResponse.ok) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Failed to fetch audio: ${audioResponse.status}`,
        },
        { status: audioResponse.status }
      );
    }

    // Get the audio buffer
    const audioBuffer = await audioResponse.arrayBuffer();

    // Return with proper CORS headers and audio headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': audioResponse.headers.get('content-type') || 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=31536000',
        'X-Audio-Proxy': 'true',
      },
    });
  } catch (error) {
    console.error('Error proxying audio:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to proxy audio',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Validate that URL is from trusted Quran CDN
 */
function isValidQuranCdnUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validDomains = [
      'qurancdn.com',
      'static.qurancdn.com',
      'audio.qurancdn.com',
      'cdn.qurancdn.com',
      'everyayah.com',
      'cdn.everyayah.com',
      'quran.alafasy.com',
      'quran.com',
      'media.quran.com',
    ];

    return validDomains.some((domain) => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}
