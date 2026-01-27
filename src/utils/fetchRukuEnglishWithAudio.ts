/**
 * Fetch Ruku data with English translation and audio
 * MIGRATED TO QURAN.COM API
 * 
 * Now uses rukuMapping.ts and quranComApi.ts for data fetching
 */

import { getRukuRange, getRukuVerseKeys } from './rukuMapping';
import { getVersesByChapter } from '@/services/quranComApi';
import { absoluteToVerseKey, verseKeyToAbsolute } from './verseConverter';
import { getVerseAudioUrl } from '@/services/quranComApi';

// Basic verse type
export type BasicVerse = {
  number: number;
  surah: number;
  ayah: number;
  arabicText: string;
  englishText: string;
  audioUrl: string | null;
};

/**
 * Fetch Ruku with Arabic, English, and audio
 * SIMPLIFIED: Uses Quran.com API
 */
export async function fetchRukuWithAudioBasic(
  rukuNumber: number,
  audioEdition: string = 'ar.alafasy'
): Promise<BasicVerse[]> {
  if (!rukuNumber || rukuNumber < 1 || rukuNumber > 556) {
    throw new Error('Invalid Ruku number');
  }

  // Get Ruku range from mapping
  const rukuRange = getRukuRange(rukuNumber);
  if (!rukuRange) {
    throw new Error(`Ruku ${rukuNumber} not yet mapped`);
  }

  // Fetch verses for this chapter with English translation
  const { verses } = await getVersesByChapter(rukuRange.chapter, {
    translations: 131, // Sahih International
    words: false,
  });

  // Filter to only verses in this ruku
  const rukuVerses = verses.filter(v =>
    v.verse_number >= rukuRange.startVerse &&
    v.verse_number <= rukuRange.endVerse
  );

  // Map to BasicVerse format with audio
  return rukuVerses.map(v => ({
    number: v.id,
    surah: rukuRange.chapter,
    ayah: v.verse_number,
    arabicText: v.text_uthmani,
    englishText: v.translations?.[0]?.text || '',
    audioUrl: getVerseAudioUrl(v.verse_key, audioEdition),
  }));
}

// Enhanced verse type with metadata
type AudioStatus = "ok" | "missing" | "failed";

export type AudioVerse = {
  id: number;
  surah: number;
  ayah: number;
  arabicText: string;
  englishText: string;
  audioUrl: string | null;
  meta: {
    ruku: number;
    surahName: string;
    surahArabicName: string;
    audioEdition: string;
    audioStatus: AudioStatus;
    retries: number;
  };
};

export type MergedVerse = {
  id: number;
  surah: number;
  ayah: number;
  arabicText: string;
  englishText: string;
  meta: {
    ruku: number;
    surahName: string;
    surahArabicName: string;
    fetchStatus: "ok" | "partial" | "failed";
  };
};

const audioCache: Record<string, { timestamp: number; data: AudioVerse[] }> = {};
const AUDIO_CACHE_TTL = 1000 * 60 * 60; // 1 hour

const mergedCache: Record<string, { timestamp: number; data: MergedVerse[] }> = {};
const MERGED_CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Fetch Ruku with Arabic and English
 */
export async function fetchRukuWithArabicAnd English(
  rukuNumber: number,
  options ?: {
    signal?: AbortSignal;
    cache?: boolean;
    debug?: boolean;
  }
): Promise < MergedVerse[] > {
  if(!rukuNumber || rukuNumber < 1 || rukuNumber > 556) {
  throw new Error("Invalid Ruku number");
}

const cacheKey = `ruku:${rukuNumber}:merged`;
const useCache = options?.cache !== false;

if (useCache && mergedCache[cacheKey] && Date.now() - mergedCache[cacheKey].timestamp < MERGED_CACHE_TTL) {
  if (options?.debug) console.log("[fetchRukuWithArabicAndEnglish] Cache hit", cacheKey);
  return mergedCache[cacheKey].data;
}

// Get Ruku range
const rukuRange = getRukuRange(rukuNumber);
if (!rukuRange) {
  throw new Error(`Ruku ${rukuNumber} not yet mapped`);
}

// Fetch verses with English translation from Quran.com
const { verses } = await getVersesByChapter(rukuRange.chapter, {
  translations: 131, // Sahih International (English)
  words: false,
});

// Filter to ruku range
const rukuVerses = verses.filter(v =>
  v.verse_number >= rukuRange.startVerse &&
  v.verse_number <= rukuRange.endVerse
);

// Map to MergedVerse format
const merged: MergedVerse[] = rukuVerses.map(v => ({
  id: v.id,
  surah: rukuRange.chapter,
  ayah: v.verse_number,
  arabicText: v.text_uthmani,
  englishText: v.translations?.[0]?.text || '',
  meta: {
    ruku: rukuNumber,
    surahName: `Surah ${rukuRange.chapter}`,
    surahArabicName: '',
    fetchStatus: 'ok',
  },
}));

if (useCache) mergedCache[cacheKey] = { timestamp: Date.now(), data: merged };
return merged;
}

/**
 * Resolve audio for Ruku verses
 */
async function resolveAudioForRuku(
  verses: MergedVerse[],
  options: {
    audioEdition: string;
    concurrencyLimit?: number;
    retries?: number;
    dryRun?: boolean;
    signal?: AbortSignal;
    onProgress?: (idx: number, total: number, status: AudioStatus) => void;
  }
): Promise<AudioVerse[]> {
  const { audioEdition, dryRun = false, onProgress } = options;

  if (dryRun) {
    return verses.map((v, idx) => {
      if (onProgress) onProgress(idx, verses.length, 'missing');
      return {
        ...v,
        audioUrl: null,
        meta: {
          ...v.meta,
          audioEdition,
          audioStatus: 'missing',
          retries: 0,
        },
      };
    });
  }

  // Generate audio URLs (no API call needed!)
  return verses.map((v, idx) => {
    const verseKey = `${v.surah}:${v.ayah}`;
    const audioUrl = getVerseAudioUrl(verseKey, audioEdition);
    const status: AudioStatus = audioUrl ? 'ok' : 'missing';

    if (onProgress) onProgress(idx, verses.length, status);

    return {
      ...v,
      audioUrl,
      meta: {
        ...v.meta,
        audioEdition,
        audioStatus: status,
        retries: 0,
      },
    };
  });
}

/**
 * Fetch Ruku with audio (main function)
 */
export async function fetchRukuWithAudio(
  rukuNumber: number,
  options: {
    audioEdition: string;
    concurrencyLimit?: number;
    retries?: number;
    dryRun?: boolean;
    cache?: boolean;
    signal?: AbortSignal;
    onProgress?: (idx: number, total: number, status: AudioStatus) => void;
  }
): Promise<AudioVerse[]> {
  const {
    audioEdition,
    dryRun = false,
    cache = true,
    signal,
    onProgress,
  } = options;

  if (!rukuNumber || rukuNumber < 1 || rukuNumber > 556) {
    throw new Error("Invalid Ruku number");
  }
  if (!audioEdition || typeof audioEdition !== 'string') {
    throw new Error("audioEdition required");
  }

  const cacheKey = `ruku:${rukuNumber}:audio:${audioEdition}`;
  if (cache && audioCache[cacheKey] && Date.now() - audioCache[cacheKey].timestamp < AUDIO_CACHE_TTL) {
    const cached = audioCache[cacheKey].data;
    if (onProgress) cached.forEach((v, idx) => onProgress(idx, cached.length, v.meta.audioStatus));
    return cached;
  }

  // Get merged Arabic+English first
  const merged = await fetchRukuWithArabicAndEnglish(rukuNumber, { cache: true });

  // Resolve audio for each verse
  const withAudio = await resolveAudioForRuku(merged, {
    audioEdition,
    dryRun,
    signal,
    onProgress,
  });

  if (cache) audioCache[cacheKey] = { timestamp: Date.now(), data: withAudio };
  return withAudio;
}

// Simplified Ruku fetch (English with audio)
export type Verse = {
  id: number;
  surah: number;
  ayah: number;
  englishText: string;
  audioUrl: string | null;
  meta: {
    audioEdition: string;
    fetchStatus: "ok" | "failed" | "missing";
    retries: number;
  };
};

type Options = {
  audioEdition: string;
  concurrencyLimit?: number;
  signal?: AbortSignal;
  dryRun?: boolean;
  verbose?: boolean;
  cache?: boolean;
  cacheSessionStorage?: boolean;
  onProgress?: (ayahIndex: number, total: number, status: "ok" | "failed" | "missing") => void;
  onError?: (err: any) => void;
};

const DEFAULT_CONCURRENCY = 6;
const DEFAULT_CACHE_TTL = 1000 * 60 * 60;
const memoryCache: Record<string, { timestamp: number; data: Verse[] }> = {};

function getCacheKey(rukuNumber: number, audioEdition: string) {
  return `ruku:${rukuNumber}:audio:${audioEdition}`;
}

function setCache(key: string, data: Verse[], useSession: boolean) {
  memoryCache[key] = { timestamp: Date.now(), data };
  if (useSession && typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
    } catch { }
  }
}

function getCache(key: string, useSession: boolean): Verse[] | null {
  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < DEFAULT_CACHE_TTL) {
    return memoryCache[key].data;
  }
  if (useSession && typeof sessionStorage !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const { timestamp, data } = JSON.parse(raw);
        if (Date.now() - timestamp < DEFAULT_CACHE_TTL) return data;
      }
    } catch { }
  }
  return null;
}

/**
 * Fetch Ruku English with Audio
 * SIMPLIFIED VERSION: Uses Quran.com API
 */
export async function fetchRukuEnglishWithAudio(
  rukuNumber: number,
  options: Options
): Promise<Verse[]> {
  const {
    audioEdition,
    cache = true,
    cacheSessionStorage = false,
    verbose = false,
    onError,
  } = options;

  const cacheKey = getCacheKey(rukuNumber, audioEdition);
  if (cache) {
    const cached = getCache(cacheKey, cacheSessionStorage);
    if (cached) {
      if (verbose) console.log("[fetchRukuEnglishWithAudio] Cache hit", cacheKey);
      return cached;
    }
  }

  try {
    // Get Ruku range
    const rukuRange = getRukuRange(rukuNumber);
    if (!rukuRange) {
      throw new Error(`Ruku ${rukuNumber} not yet mapped`);
    }

    // Fetch verses with English from Quran.com
    const { verses } = await getVersesByChapter(rukuRange.chapter, {
      translations: 131, // Sahih International
      words: false,
    });

    // Filter to ruku range
    const rukuVerses = verses.filter(v =>
      v.verse_number >= rukuRange.startVerse &&
      v.verse_number <= rukuRange.endVerse
    );

    // Map to Verse format with audio URLs
    const result: Verse[] = rukuVerses.map(v => {
      const verseKey = `${rukuRange.chapter}:${v.verse_number}`;
      const audioUrl = getVerseAudioUrl(verseKey, audioEdition);

      return {
        id: v.id,
        surah: rukuRange.chapter,
        ayah: v.verse_number,
        englishText: v.translations?.[0]?.text || '',
        audioUrl,
        meta: {
          audioEdition,
          fetchStatus: audioUrl ? 'ok' : 'missing',
          retries: 0,
        },
      };
    });

    if (cache) setCache(cacheKey, result, cacheSessionStorage);
    return result;
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
}
