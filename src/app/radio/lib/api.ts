import { fetchQuranReciters, fetchQuranStations, fetchQuranChapters, getAudioUrl, mapReciterToStation } from './quran-api';
import { Reciter, Station, Chapter, AudioData } from './types';

// Re-export mapReciterToStation
export { mapReciterToStation };

// Re-export types
export * from './types';

// === CACHING LAYER ===
// Module-level cache for frequently accessed data
let cachedReciters: Reciter[] | null = null;
let cachedChapters: Chapter[] | null = null;
let lastReciterFetch = 0;
let lastChapterFetch = 0;

const RECITER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const CHAPTER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached reciters or fetch fresh
 */
async function getCachedReciters(): Promise<Reciter[]> {
  const now = Date.now();
  if (cachedReciters && (now - lastReciterFetch) < RECITER_CACHE_TTL) {
    return cachedReciters;
  }
  cachedReciters = await fetchQuranReciters();
  lastReciterFetch = now;
  return cachedReciters;
}

/**
 * Get cached chapters or fetch fresh
 */
async function getCachedChapters(): Promise<Chapter[]> {
  const now = Date.now();
  if (cachedChapters && (now - lastChapterFetch) < CHAPTER_CACHE_TTL) {
    return cachedChapters;
  }
  const chapters = await fetchQuranChapters();
  cachedChapters = chapters as Chapter[];
  lastChapterFetch = now;
  return cachedChapters;
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearApiCache(): void {
  cachedReciters = null;
  cachedChapters = null;
  lastReciterFetch = 0;
  lastChapterFetch = 0;
}

/**
 * Fetch all reciters using Quran.com API (cached)
 */
export async function fetchReciters(): Promise<Reciter[]> {
  return getCachedReciters();
}

/**
 * Fetch all chapters/surahs (cached)
 */
export async function fetchChapters(): Promise<Chapter[]> {
  return getCachedChapters();
}

/**
 * Fetch radio stations
 * Adapts the quran-api response to the expected structure in page.tsx
 */
export async function fetchStations(): Promise<{ curatedStations: Station[]; allStations: Station[] }> {
  const stations = await fetchQuranStations();
  return {
    curatedStations: stations,
    allStations: stations,
  };
}

/**
 * Fetch audio URLs for a specific reciter and surah
 * Uses cached reciters and chapters for efficiency
 */
export async function fetchAudio(
  reciterId: number,
  surahNumber: number,
  _verseStart?: number,
  _verseEnd?: number
): Promise<AudioData> {
  try {
    // Use cached data instead of refetching
    const [reciters, chapters] = await Promise.all([
      getCachedReciters(),
      getCachedChapters(),
    ]);

    const reciter = reciters.find(r => r.id === reciterId || r.originalReciterId === reciterId);

    if (!reciter) {
      throw new Error(`Reciter with ID ${reciterId} not found`);
    }

    const audioUrl = await getAudioUrl(reciter.originalReciterId || reciterId, surahNumber);
    const surah = chapters.find(c => c.id === surahNumber);

    return {
      audioUrls: [audioUrl],
      surahName: surah?.name_simple || `Surah ${surahNumber}`,
      surahNumber: surahNumber,
      reciterName: reciter.name,
      totalVerses: surah?.verses_count || 0,
      verses: []
    };
  } catch (error) {
    console.error('Error fetching audio:', error);
    throw error;
  }
}

/**
 * Search radio stations
 */
export async function searchRadio(query: string, type: 'all' | 'surah' | 'reciter' = 'all'): Promise<Station[]> {
  if (!query.trim()) return [];

  const reciters = await getCachedReciters();
  const lowerQuery = query.toLowerCase();

  return reciters
    .filter(r => r.name.toLowerCase().includes(lowerQuery))
    .map(mapReciterToStation);
}

