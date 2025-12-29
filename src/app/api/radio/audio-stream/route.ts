import { NextResponse, NextRequest } from 'next/server';

const API_BASE_URL = 'https://api.quran.com/api/v4';

// Premium reciter mapping with proper Quran.com IDs
const RECITER_RECITATION_MAP: Record<number, number> = {
  1: 1,   // AbdulBaset AbdulSamad - Mujawwad
  2: 2,   // AbdulBaset AbdulSamad - Murattal
  3: 3,   // Abdur-Rahman as-Sudais
  4: 4,   // Abu Bakr al-Shatri
  5: 5,   // Hani ar-Rifai
  6: 6,   // Mahmoud Khalil Al-Husary
  7: 7,   // Mishari Rashid al-Afasy
  8: 8,   // Mohamed Siddiq al-Minshawi - Mujawwad
  9: 9,   // Mohamed Siddiq al-Minshawi - Murattal
  10: 10, // Sa'ud ash-Shuraym
  11: 11, // Mohamed al-Tablawi
  12: 12, // Mahmoud Khalil Al-Husary - Muallim
  13: 13, // Saad al-Ghamdi
  14: 14, // Yasser Ad Dossary
};

// Audio CDN sources prioritized for reliability
const AUDIO_CDN_SOURCES = [
  {
    name: 'Primary CDN',
    baseUrl: 'https://audio.qurancdn.com/quran',
    priority: 1,
  },
  {
    name: 'Backup CDN 1',
    baseUrl: 'https://cdnsb.qurancdn.com/quran',
    priority: 2,
  },
  {
    name: 'Backup CDN 2',
    baseUrl: 'https://quranaudiocdn.com/quran',
    priority: 3,
  },
  {
    name: 'Direct Source',
    baseUrl: 'https://media.quran.com/quran',
    priority: 4,
  },
];

// MP3Quran.net reciter codes mapping
const MP3QURAN_RECITER_MAP: Record<number, string> = {
  1: 'minshawi_murattal', // AbdulBaset AbdulSamad - Mujawwad
  2: 'afs', // AbdulBaset AbdulSamad - Murattal (Alafasy)
  3: 'sudais', // Abdur-Rahman as-Sudais
  4: 'shatri', // Abu Bakr al-Shatri
  5: 'rifai', // Hani ar-Rifai
  6: 'husary', // Mahmoud Khalil Al-Husary
  7: 'alafasy', // Mishari Rashid al-Afasy
  8: 'minshawi_mujawwad', // Mohamed Siddiq al-Minshawi - Mujawwad
  9: 'minshawi_murattal', // Mohamed Siddiq al-Minshawi - Murattal
  10: 'shuraym', // Sa'ud ash-Shuraym
  11: 'tablawi', // Mohamed al-Tablawi
  12: 'husary_muallim', // Mahmoud Khalil Al-Husary - Muallim
  13: 'ghamdi', // Saad al-Ghamdi
  14: 'dossary', // Yasser Ad Dossary
};

interface AudioStreamCacheEntry {
  buffer: ArrayBuffer;
  contentType: string;
  timestamp: number;
  ttl: number;
}

// In-memory cache for audio streams (5 minutes TTL)
const audioStreamCache = new Map<string, AudioStreamCacheEntry>();

function getCacheKey(reciterId: number, verseKey: string): string {
  return `audio:${reciterId}:${verseKey}`;
}

function getCachedAudio(key: string): ArrayBuffer | null {
  const entry = audioStreamCache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return entry.buffer;
  }
  audioStreamCache.delete(key);
  return null;
}

function cacheAudio(key: string, buffer: ArrayBuffer, ttl: number = 300000): void {
  audioStreamCache.set(key, {
    buffer,
    contentType: 'audio/mpeg',
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Enhanced Audio Stream Endpoint
 * Serves Quran audio verses with intelligent CDN fallback
 * Includes response caching for improved performance
 * 
 * Usage: GET /api/radio/audio-stream?reciterId=2&verseKey=1:1
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reciterId = searchParams.get('reciterId');
    const verseKey = searchParams.get('verseKey');

    console.log(`[audio-stream] ⏱️  Processing: reciterId=${reciterId}, verseKey=${verseKey}`);

    if (!reciterId || !verseKey) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing parameters: reciterId and verseKey',
        },
        { status: 400 }
      );
    }

    const reciterIdNum = parseInt(reciterId);
    const recitationId = RECITER_RECITATION_MAP[reciterIdNum];

    if (recitationId === undefined) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Reciter ID ${reciterId} not found`,
        },
        { status: 404 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(reciterIdNum, verseKey);
    const cachedBuffer = getCachedAudio(cacheKey);
    if (cachedBuffer) {
      console.log(`[audio-stream] ✅ Cache HIT for ${verseKey}`);
      return new NextResponse(cachedBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cachedBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'HIT',
        },
      });
    }

    // Parse verse key (e.g., "1:1" -> surah 1, verse 1)
    const [surahStr, verseStr] = verseKey.split(':');
    const surahNum = parseInt(surahStr);
    const verseNum = parseInt(verseStr);

    if (isNaN(surahNum) || isNaN(verseNum)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid verse key format. Expected: surah:verse',
        },
        { status: 400 }
      );
    }

    console.log(
      `[audio-stream] 🔍 Fetching: recitation ${recitationId}, surah ${surahNum}, verse ${verseNum}`
    );

    // Fetch the audio file data from Quran.com API
    const audioResponse = await fetch(
      `${API_BASE_URL}/recitations/${recitationId}/by_chapter/${surahNum}?language=en`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!audioResponse.ok) {
      console.error(
        `[audio-stream] ❌ Quran.com API error: ${audioResponse.status}`
      );
      throw new Error(`Failed to fetch audio metadata: ${audioResponse.status}`);
    }

    const audioData = await audioResponse.json();

    // Find the audio file for this specific verse
    let audioUrl: string | null = null;
    if (audioData.audio_files) {
      const audioFile = audioData.audio_files.find(
        (f: any) => f.verse_key === verseKey
      );
      if (audioFile && audioFile.url) {
        audioUrl = audioFile.url;
        console.log(`[audio-stream] 📍 Audio URL found: ${audioUrl}`);
      }
    }

    if (!audioUrl) {
      console.warn(`[audio-stream] ⚠️  No audio found for verse ${verseKey}`);
      return NextResponse.json(
        {
          status: 'error',
          message: `Audio not found for verse ${verseKey}`,
        },
        { status: 404 }
      );
    }

    let audioBuffer: ArrayBuffer | null = null;
    let contentType = 'audio/mpeg';
    let successSource = '';

    // Try each CDN source with retry logic
    for (const source of AUDIO_CDN_SOURCES) {
      try {
        const fullUrl = `${source.baseUrl}/${audioUrl}`;
        console.log(`[audio-stream] 🌐 Trying ${source.name}: ${fullUrl}`);

        const cdnResponse = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://quran.com/',
            'Accept': 'audio/mpeg, audio/*, */*',
            'Accept-Encoding': 'gzip, deflate',
          },
          signal: AbortSignal.timeout(15000), // Increased timeout to 15 seconds
        });

        if (cdnResponse.ok && cdnResponse.body) {
          audioBuffer = await cdnResponse.arrayBuffer();
          contentType = cdnResponse.headers.get('content-type') || 'audio/mpeg';
          successSource = source.name;
          console.log(
            `[audio-stream] ✅ Success from ${source.name} (${(audioBuffer.byteLength / 1024).toFixed(2)} KB)`
          );
          break;
        } else {
          console.warn(
            `[audio-stream] ⚠️  ${source.name} returned: ${cdnResponse.status}`
          );
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `[audio-stream] ❌ Failed to fetch from ${source.name}: ${err.message}`
        );
      }
    }

    // Fallback to MP3Quran.net if Quran.com CDNs fail
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      const mp3quranReciterCode = MP3QURAN_RECITER_MAP[reciterIdNum];
      if (mp3quranReciterCode) {
        const [surahStr, verseStr] = verseKey.split(':');
        const surahNum = parseInt(surahStr);
        const verseNum = parseInt(verseStr);
        const paddedSurah = surahNum.toString().padStart(3, '0');
        const paddedVerse = verseNum.toString().padStart(3, '0');
        // MP3Quran.net uses format: server8.mp3quran.net/[reciter]/[surah][verse].mp3
        const mp3quranUrl = `https://server8.mp3quran.net/${mp3quranReciterCode}/${paddedSurah}${paddedVerse}.mp3`;
        
        try {
          console.log(`[audio-stream] 🔄 Fallback: Trying MP3Quran.net: ${mp3quranUrl}`);
          const mp3quranResponse = await fetch(mp3quranUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://quran.com/',
            },
            signal: AbortSignal.timeout(15000), // Increased timeout to 15 seconds
          });

          if (mp3quranResponse.ok && mp3quranResponse.body) {
            audioBuffer = await mp3quranResponse.arrayBuffer();
            contentType = mp3quranResponse.headers.get('content-type') || 'audio/mpeg';
            successSource = 'MP3Quran.net Fallback';
            console.log(
              `[audio-stream] ✅ MP3Quran.net fallback success (${(audioBuffer.byteLength / 1024).toFixed(2)} KB)`
            );
          } else {
            console.warn(
              `[audio-stream] ⚠️  MP3Quran.net returned: ${mp3quranResponse.status} ${mp3quranResponse.statusText}`
            );
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.warn(`[audio-stream] ❌ MP3Quran.net fallback failed: ${err.message}`);
        }
      }
    }

    // Final fallback to EveryAyah if all else fails (Alafasy only)
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      const [surahStr, verseStr] = verseKey.split(':');
      const surahNum = parseInt(surahStr);
      const verseNum = parseInt(verseStr);
      const paddedSurah = surahNum.toString().padStart(3, '0');
      const paddedVerse = verseNum.toString().padStart(3, '0');
      const everyayahUrl = `https://www.everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedVerse}.mp3`;
      
      try {
        console.log(`[audio-stream] 🔄 Final fallback: Trying EveryAyah: ${everyayahUrl}`);
        const everyayahResponse = await fetch(everyayahUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://quran.com/',
          },
          signal: AbortSignal.timeout(15000), // Increased timeout to 15 seconds
        });

        if (everyayahResponse.ok && everyayahResponse.body) {
          audioBuffer = await everyayahResponse.arrayBuffer();
          contentType = everyayahResponse.headers.get('content-type') || 'audio/mpeg';
          successSource = 'EveryAyah Final Fallback (Alafasy)';
          console.log(
            `[audio-stream] ✅ EveryAyah fallback success (${(audioBuffer.byteLength / 1024).toFixed(2)} KB)`
          );
        } else {
          console.warn(
            `[audio-stream] ⚠️  EveryAyah returned: ${everyayahResponse.status} ${everyayahResponse.statusText}`
          );
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.warn(`[audio-stream] ❌ EveryAyah fallback failed: ${err.message}`);
      }
    }

    // If successful, cache and return
    if (audioBuffer && audioBuffer.byteLength > 0) {
      cacheAudio(cacheKey, audioBuffer);
      
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=86400',
          'X-Source': successSource,
          'X-Cache': 'MISS',
        },
      });
    }

    // If all CDN sources fail, return error
    console.error(
      `[audio-stream] ❌ Failed to fetch audio from all sources for ${verseKey}`
    );
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch audio from all sources',
        verse: verseKey,
        reciterId: reciterIdNum,
      },
      { status: 503 }
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[audio-stream] 💥 Fatal error: ${err.message}`);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        details: err.message,
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
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    },
  });
}
