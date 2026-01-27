/**
 * Quran API Utilities - Migration to Quran.com API (v4)
 * Updated from api.alquran.cloud to api.quran.com
 * Documentation: https://api-docs.quran.com
 */

import {
  getChapters,
  getChapter,
  getVersesByChapter,
  getVersesByJuz,
  getVersesByPage,
  getVersesByHizb,
  getVerseByKey,
  getVerseAudioUrl,
  getVersesAudioUrls,
  getReciters,
  getTranslations,
  searchQuran,
  TRANSLATION_MAP,
  DEFAULT_TRANSLATION,
  type QuranComChapter,
  type QuranComVerse,
  type QuranComWord,
  type TranslationResource,
  type Reciter,
} from '@/services/quranComApi';

import { absoluteToVerseKey, verseKeyToAbsolute, getVerseRange } from '@/utils/verseConverter';
import { getManzilRange, getManzilVerseKeys } from '@/utils/manzilMapping';
import { getRukuRange, getRukuVerseKeys } from '@/utils/rukuMapping';

// ==================== EXPORTED TYPES ====================

export interface ReciterEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction?: string;
}

export interface ReciterWithMetadata extends ReciterEdition {
  averageDuration?: number;
  totalDuration?: number;
  languageNative?: string;
}

export interface AudioSource {
  url: string;
  type: string;
}

export interface Verse {
  number: number;
  text: string;
  numberInSurah: number;
  audio: string;
  audioSources?: AudioSource[];
}

export interface VerseWithTranslation extends Verse {
  translation: string;
}

// ==================== EDITIONS & CONSTANTS ====================

export const EDITIONS = {
  // Text editions (now translation IDs)
  ARABIC: 'text_uthmani',
  // Popular translations (Quran.com resource IDs)
  ENGLISH: 131,              // Sahih International
  ENGLISH_PICKTHALL: 19,     // Pickthall
  ENGLISH_YUSUFALI: 21,      // Yusuf Ali
  FRENCH: 136,               // French translation
  SPANISH: 141,              // Spanish
  GERMAN: 27,                // German  
  URDU: 151,                 // Urdu
  // Audio editions (reciter codes)
  AUDIO_ALAFASY: 'ar.alafasy',
  AUDIO_MINSHAWI: 'ar.minshawi',
  AUDIO_HUSARY: 'ar.husary',
  AUDIO_MUAIQLY: 'ar.abdulmuhsin',
  AUDIO_SUDAIS: 'ar.abdurrahmaansudais',
};

const LANGUAGE_NAMES: { [key: string]: string } = {
  ar: 'العربية',
  ur: 'اردو',
  en: 'English',
  fr: 'Français',
  ru: 'Русский',
  zh: '中文',
};

// ==================== RECITERS ====================

/**
 * Fetch all available reciters with metadata
 */
export async function fetchReciters(): Promise<ReciterWithMetadata[]> {
  try {
    console.log('Fetching reciters from Quran.com API...');
    const reciters = await getReciters('en');

    // Transform tolegacy format
    const transformedReciters: ReciterWithMetadata[] = reciters.map((reciter: Reciter) => {
      const style = reciter.style || '';
      return {
        identifier: `ar.${reciter.id}`,
        language: 'ar',
        name: reciter.name,
        englishName: reciter.translated_name.name,
        format: 'audio',
        type: 'versebyverse',
        languageNative: 'العربية',
        averageDuration: style.toLowerCase().includes('mujawwad') ? 45 : 25,
      };
    });

    console.log('Processed reciters:', transformedReciters.length);
    return transformedReciters;
  } catch (error) {
    console.error('Error fetching reciters:', error);
    throw error;
  }
}

// ==================== CHAPTERS/SURAHS ====================

/**
 * Fetch surahs list (114 surahs)
 */
export async function fetchSurahs() {
  const chapters = await getChapters('en');

  // Transform to legacy format
  return chapters.map(chapter => ({
    number: chapter.id,
    name: chapter.name_arabic,
    englishName: chapter.name_simple,
    englishNameTranslation: chapter.translated_name.name,
    numberOfAyahs: chapter.verses_count,
    revelationType: chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
  }));
}

/**
 * Fetch a specific surah by number
 */
export async function fetchSurah(surahNumber: number) {
  const chapter = await getChapter(surahNumber, 'en');

  return {
    number: chapter.id,
    name: chapter.name_arabic,
    englishName: chapter.name_simple,
    englishNameTranslation: chapter.translated_name.name,
    numberOfAyahs: chapter.verses_count,
    revelationType: chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
  };
}

/**
 * Fetch a specific surah with translation
 */
export async function fetchSurahWithTranslation(
  surahNumber: number,
  translationEdition: number | string = EDITIONS.ENGLISH
) {
  const translationId = typeof translationEdition === 'string'
    ? (TRANSLATION_MAP[translationEdition] || EDITIONS.ENGLISH)
    : translationEdition;

  const { verses } = await getVersesByChapter(surahNumber, {
    translations: translationId,
    words: true,
  });

  // Get chapter info
  const chapter = await getChapter(surahNumber);

  // Transform to legacy format
  return {
    number: chapter.id,
    name: chapter.name_arabic,
    englishName: chapter.name_simple,
    englishNameTranslation: chapter.translated_name.name,
    numberOfAyahs: chapter.verses_count,
    revelationType: chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
    ayahs: verses.map(verse => ({
      number: verse.id,
      numberInSurah: verse.verse_number,
      text: verse.text_uthmani,
      audio: getVerseAudioUrl(verse.verse_key),
      translation: verse.translations?.[0]?.text || '',
    })),
  };
}

// ==================== VERSES ====================

/**
 * Fetch a specific verse with its translation
 */
export async function fetchVerseWithTranslation(
  surahNumber: number,
  verseNumber: number,
  reciterId: string = EDITIONS.AUDIO_ALAFASY
): Promise<VerseWithTranslation> {
  const verseKey = `${surahNumber}:${verseNumber}`;
  const verse = await getVerseByKey(verseKey, {
    translations: EDITIONS.ENGLISH,
    words: true,
  });

  return {
    number: verse.id,
    numberInSurah: verse.verse_number,
    text: verse.text_uthmani,
    audio: getVerseAudioUrl(verseKey, reciterId),
    translation: verse.translations?.[0]?.text || '',
  };
}

/**
 * Fetch all verses of a surah with translations
 */
export async function fetchSurahVersesWithTranslation(
  surahNumber: number,
  reciterId: string = EDITIONS.AUDIO_ALAFASY
): Promise<VerseWithTranslation[]> {
  const { verses } = await getVersesByChapter(surahNumber, {
    translations: EDITIONS.ENGLISH,
    words: true,
  });

  return verses.map(verse => ({
    number: verse.id,
    numberInSurah: verse.verse_number,
    text: verse.text_uthmani,
    audio: getVerseAudioUrl(verse.verse_key, reciterId),
    audioSources: [{
      url: getVerseAudioUrl(verse.verse_key, reciterId),
      type: 'audio/mpeg',
    }],
    translation: verse.translations?.[0]?.text || '',
  }));
}

// ==================== JUZ ====================

/**
 * Fetch all juz (30 juz)
 */
export async function fetchAllJuz() {
  const juzPromises = Array.from({ length: 30 }, (_, i) =>
    getVersesByJuz(i + 1, { translations: EDITIONS.ENGLISH })
  );

  return await Promise.all(juzPromises);
}

interface JuzFetchOptions {
  offset?: number;
  limit?: number;
}

/**
 * Fetch a specific juz by number
 */
export async function fetchJuz(
  juzNumber: number,
  edition: string | number = EDITIONS.ARABIC,
  options: JuzFetchOptions = {}
) {
  const translationId = typeof edition === 'string' && edition !== EDITIONS.ARABIC
    ? (TRANSLATION_MAP[edition] || undefined)
    : undefined;

  const { verses } = await getVersesByJuz(juzNumber, {
    translations: translationId,
    words: true,
    perPage: options.limit || 1000,
  });

  // Transform to legacy format
  return {
    juz: juzNumber,
    ayahs: verses.map(verse => ({
      number: verse.id,
      numberInSurah: verse.verse_number,
      text: verse.text_uthmani,
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
    })),
  };
}

/**
 * Fetch a specific juz with translation
 */
export async function fetchJuzWithTranslation(
  juzNumber: number,
  translationEdition: number | string = EDITIONS.ENGLISH,
  options: JuzFetchOptions = {}
) {
  const translationId = typeof translationEdition === 'string'
    ? (TRANSLATION_MAP[translationEdition] || EDITIONS.ENGLISH)
    : translationEdition;

  const { verses } = await getVersesByJuz(juzNumber, {
    translations: translationId,
    words: true,
    perPage: options.limit || 1000,
  });

  return {
    juz: juzNumber,
    ayahs: verses.map(verse => ({
      number: verse.id,
      numberInSurah: verse.verse_number,
      text: verse.text_uthmani,
      translation: verse.translations?.[0]?.text || '',
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
    })),
  };
}

// ==================== PAGES ====================

/**
 * Fetch a specific page by number (1-604)
 */
export async function fetchPage(pageNumber: number) {
  const { verses } = await getVersesByPage(pageNumber, {
    words: true,
    perPage: 50,
  });

  return {
    page: pageNumber,
    ayahs: verses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
    })),
  };
}

// ==================== MANZIL ====================

/**
 * Fetch a specific manzil by number (1-7)
 * WORKAROUND: Uses verse range mapping since Quran.com doesn't have Manzil endpoint
 */
export async function fetchManzil(manzilNumber: number) {
  const manzilRange = getManzilRange(manzilNumber);
  const verseKeys = getVerseRange(manzilRange.startVerse, manzilRange.endVerse);

  // Fetch verses in batches
  const batchSize = 100;
  const allVerses: QuranComVerse[] = [];

  for (let i = 0; i < verseKeys.length; i += batchSize) {
    const batch = verseKeys.slice(i, i + batchSize);
    const promises = batch.map(key => getVerseByKey(key, { words: true }));
    const verses = await Promise.all(promises);
    allVerses.push(...verses);
  }

  return {
    manzil: manzilNumber,
    ayahs: allVerses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
    })),
  };
}

/**
 * Fetch all manzil data (7 manzil)
 */
export async function fetchAllManzil() {
  const manzilPromises = Array.from({ length: 7 }, (_, i) => fetchManzil(i + 1));
  return await Promise.all(manzilPromises);
}

// ==================== HIZB ====================

/**
 * Fetch a specific hizb quarter by number
 */
export async function fetchHizbQuarter(hizbNumber: number) {
  const { verses } = await getVersesByHizb(hizbNumber, {
    words: true,
  });

  return {
    hizbQuarter: hizbNumber,
    ayahs: verses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
    })),
  };
}

/**
 * Fetch all hizb data (60 hizb)
 */
export async function fetchAllHizb() {
  const hizbPromises = Array.from({ length: 60 }, (_, i) => {
    const hizbNumber = (i * 4) + 1;
    return fetchHizbQuarter(hizbNumber);
  });

  return await Promise.all(hizbPromises);
}

// ==================== RUKU ====================

/**
 * Get Ruku info
 */
export function getRukuInfo() {
  return {
    totalRuku: 556,
  };
}

/**
 * Fetch data for a specific ruku
 * WORKAROUND: Uses verse range mapping since Quran.com doesn't have Ruku endpoint
 */
export async function getRukuData(rukuNumber: number) {
  if (rukuNumber < 1 || rukuNumber > 556) {
    throw new Error('Invalid Ruku number');
  }

  const rukuRange = getRukuRange(rukuNumber);

  if (!rukuRange) {
    throw new Error(`Ruku ${rukuNumber} not yet mapped. Please extend Ruku mapping.`);
  }

  const verseKeys = getRukuVerseKeys(rukuNumber);

  // Fetch verses
  const promises = verseKeys.map(key =>
    getVerseByKey(key, { translations: EDITIONS.ENGLISH, words: true })
  );
  const verses = await Promise.all(promises);

  return {
    rukuNumber,
    surahNumber: rukuRange.chapter,
    startVerse: rukuRange.startVerse,
    endVerse: rukuRange.endVerse,
    verses: verses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      translation: verse.translations?.[0]?.text || '',
      audio: getVerseAudioUrl(verse.verse_key),
    })),
  };
}

// ==================== STRUCTURE & COMPLETE QURAN ====================

/**
 * Fetch the complete Quran structure data
 */
export async function fetchQuranStructure() {
  const surahs = await fetchSurahs();

  return {
    surahs,
    totalSurahs: 114,
    totalJuz: 30,
    totalManzil: 7,
    totalHizb: 60,
    totalPages: 604,
    totalRuku: 556,
    apiBaseUrl: 'https://api.quran.com/api/v4',
  };
}

/**
 * Fetch the complete Quran text
 */
export async function fetchCompleteQuran(edition: string | number = EDITIONS.ARABIC) {
  // Fetch all chapters
  const chapters = await Promise.all(
    Array.from({ length: 114 }, (_, i) => fetchSurah(i + 1))
  );

  return {
    surahs: chapters,
  };
}

// ==================== AUDIO ====================

/**
 * Get audio URL for a specific verse with format fallbacks
 */
export async function getAyahAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  audioEdition: string = EDITIONS.AUDIO_ALAFASY
): Promise<AudioSource[]> {
  const verseKey = `${surahNumber}:${ayahNumber}`;
  const primaryUrl = getVerseAudioUrl(verseKey, audioEdition);

  return [{
    url: primaryUrl,
    type: 'audio/mpeg',
  }];
}

/**
 * Get audio URL for an entire surah
 */
export async function getSurahAudioUrl(
  surahNumber: number,
  audioEdition: string = EDITIONS.AUDIO_ALAFASY
): Promise<string> {
  const reciterCode = audioEdition.split('.')[1] || 'alafasy';
  return `https://cdn.islamic.network/quran/audio-surah/128/${reciterCode}/${surahNumber}.mp3`;
}

/**
 * Fetch audio data for a specific surah
 */
export async function fetchSurahAudio(
  surahNumber: number,
  audioEdition: string = EDITIONS.AUDIO_ALAFASY
) {
  const { verses } = await getVersesByChapter(surahNumber, { words: true });

  return {
    number: surahNumber,
    ayahs: verses.map(verse => ({
      number: verse.id,
      audio: getVerseAudioUrl(verse.verse_key, audioEdition),
    })),
  };
}

/**
 * Get estimated duration for a surah by reciter
 */
export async function getReciterSurahDuration(
  surahNumber: number,
  reciterId: string
): Promise<number> {
  const chapter = await getChapter(surahNumber);
  const numberOfVerses = chapter.verses_count;

  const isMujawwad = reciterId.toLowerCase().includes('mujawwad');
  const isMinshawi = reciterId.toLowerCase().includes('minshawi');

  let averageVerseTime = 25;
  if (isMujawwad) {
    averageVerseTime = 45;
  } else if (isMinshawi) {
    averageVerseTime = 35;
  }

  return numberOfVerses * averageVerseTime;
}

// ==================== EXPORTS ====================

export {
  getChapters,
  getChapter,
  getVersesByChapter,
  getVersesByJuz,
  getVersesByPage,
  getVersesByHizb,
  getVerseByKey,
  getVerseAudioUrl,
  getVersesAudioUrls,
  getReciters,
  getTranslations,
  searchQuran,
  absoluteToVerseKey,
  verseKeyToAbsolute,
  getManzilRange,
  getRukuRange,
};
