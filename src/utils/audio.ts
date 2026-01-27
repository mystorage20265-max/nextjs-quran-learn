/**
 * Audio Utility - Updated for Quran.com API
 * Provides audio URLs with fallbacks using verse keys instead of absolute numbers
 */

import { absoluteToVerseKey } from './verseConverter';
import { getVerseAudioUrl } from '@/services/quranComApi';

/**
 * Get all possible audio URLs for a verse
 * @param absoluteAyahNumber - Absolute ayah number (1-6236) - LEGACY
 * @param surah - Surah number (1-114)
 * @param ayah - Ayah number in surah
 * @param reciter - Reciter code (default: ar.alafasy)
 */
export function getAudioUrls(
  absoluteAyahNumber: number,
  surah?: number,
  ayah?: number,
  reciter: string = 'ar.alafasy'
): string[] {
  const urls: string[] = [];

  // Determine verse key
  let verseKey: string;
  if (surah && ayah) {
    verseKey = `${surah}:${ayah}`;
  } else {
    // Convert absolute number to verse key
    try {
      verseKey = absoluteToVerseKey(absoluteAyahNumber);
    } catch {
      console.warn(`Could not convert absolute number ${absoluteAyahNumber} to verse key`);
      return urls;
    }
  }

  // Primary: Quran.com CDN (NEW - BEST QUALITY)
  urls.push(getVerseAudioUrl(verseKey, reciter));

  // Fallback 1: Islamic.network CDN (absolute ayah - LEGACY)
  urls.push(`https://cdn.islamic.network/quran/audio/128/${reciter}/${absoluteAyahNumber}.mp3`);

  // Fallback 2: Verse-based CDNs
  if (surah && ayah) {
    // mp3quran.net (multiple qualities)
    ['128', '64', '32'].forEach(quality => {
      urls.push(`https://verse.mp3quran.net/arabic/${reciter}/${quality}/${surah}/${ayah}.mp3`);
    });

    // Server-based fallbacks
    urls.push(`https://server8.mp3quran.net/afs/${surah}/${ayah}.mp3`);
    urls.push(`https://server7.mp3quran.net/shur/${surah}/${ayah}.mp3`);

    // EveryAyah CDN (padded format)
    const paddedSurah = surah.toString().padStart(3, '0');
    const paddedAyah = ayah.toString().padStart(3, '0');
    const reciterFolder = reciter.replace('ar.', '').replace('.', '-');
    urls.push(`https://everyayah.com/data/${reciterFolder}_64kbps/${paddedSurah}${paddedAyah}.mp3`);
    urls.push(`https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_64kbps/${paddedSurah}${paddedAyah}.mp3`);

    // QuranCentral
    urls.push(`https://audio1.qurancentral.com/mishary-rashid-alafasy/mishary-rashid-alafasy-${paddedSurah}-${paddedAyah}.mp3`);
  }

  return urls;
}

/**
 * Get audio URLs using verse key directly (NEW METHOD - PREFERRED)
 */
export function getAudioUrlsByVerseKey(
  verseKey: string,
  reciter: string = 'ar.alafasy'
): string[] {
  const [surahStr, ayahStr] = verseKey.split(':');
  const surah = parseInt(surahStr, 10);
  const ayah = parseInt(ayahStr, 10);

  // Calculate absolute number for legacy fallbacks
  const absoluteNumber = getAbsoluteVerseNumber(surah, ayah);

  return getAudioUrls(absoluteNumber, surah, ayah, reciter);
}

/**
 * Helper: Calculate absolute verse number from surah and ayah
 */
function getAbsoluteVerseNumber(surah: number, ayah: number): number {
  const VERSES_PER_CHAPTER = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
    123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
    34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
    60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
    28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
    15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
    5, 4, 5, 6
  ];

  let absolute = 0;
  for (let i = 0; i < surah - 1; i++) {
    absolute += VERSES_PER_CHAPTER[i];
  }
  absolute += ayah;

  return absolute;
}

/**
 * Validate audio URL
 */
export async function validateAudioUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && (response.headers.get('content-type')?.startsWith('audio/') ?? false);
  } catch {
    return false;
  }
}

/**
 * Get first working audio URL from the list
 */
export async function getWorkingAudioUrl(
  absoluteAyahNumber: number,
  surah?: number,
  ayah?: number,
  reciter: string = 'ar.alafasy'
): Promise<string | null> {
  const urls = getAudioUrls(absoluteAyahNumber, surah, ayah, reciter);
  let lastError = '';

  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok && response.headers.get('content-type')?.startsWith('audio/')) {
        // Log CORS header for debugging
        const corsHeader = response.headers.get('Access-Control-Allow-Origin') ||
          response.headers.get('access-control-allow-origin');
        if (typeof window !== 'undefined') {
          console.log(`[Audio Debug] URL OK: ${url}, CORS: ${corsHeader}`);
        }
        // Always return the first accessible audio URL, proxy will handle CORS
        return url;
      } else {
        lastError += `URL failed (${response.status}): ${url}\n`;
      }
    } catch (err) {
      lastError += `Fetch error: ${url} - ${err}\n`;
    }
  }

  if (typeof window !== 'undefined') {
    console.warn('All audio sources failed for ayah', { absoluteAyahNumber, surah, ayah, lastError });
  }

  return null;
}

/**
 * Get working audio URL using verse key (NEW METHOD - PREFERRED)
 */
export async function getWorkingAudioUrlByVerseKey(
  verseKey: string,
  reciter: string = 'ar.alafasy'
): Promise<string | null> {
  const [surahStr, ayahStr] = verseKey.split(':');
  const surah = parseInt(surahStr, 10);
  const ayah = parseInt(ayahStr, 10);

  const absoluteNumber = getAbsoluteVerseNumber(surah, ayah);
  return getWorkingAudioUrl(absoluteNumber, surah, ayah, reciter);
}

// Export for backward compatibility
export default {
  getAudioUrls,
  getAudioUrlsByVerseKey,
  validateAudioUrl,
  getWorkingAudioUrl,
  getWorkingAudioUrlByVerseKey,
};
