/**
 * Quran Section API Interface - MIGRATED TO QURAN.COM API
 * 
 * This file provides standardized functions for fetching different sections of the Quran
 * from the Quran.com API (api.quran.com/api/v4). Each function follows the same structure 
 * and error handling pattern.
 * 
 * Quran Organization:
 * - 114 Surahs (chapters)
 * - 30 Juz (parts)
 * - 7 Manzil (divisions) - Using custom mapping
 * - 60 Hizb (divisions, each with 4 quarters = 240 quarters total)
 * - 556 Ruku (sections) - Using custom mapping
 * - 604 Pages (in standard Uthmani script)
 */

import {
  getVersesByChapter,
  getVersesByJuz,
  getVersesByPage,
  getVersesByHizb,
  TRANSLATION_MAP,
  DEFAULT_TRANSLATION,
} from '@/services/quranComApi';

import { getManzilRange, getManzilVerseKeys } from '@/utils/manzilMapping';
import { getRukuRange, getRukuVerseKeys } from '@/utils/rukuMapping';
import { EDITIONS } from './quranApi';

// Re-export EDITIONS for backward compatibility
export { EDITIONS };

/**
 * Options for pagination
 */
interface PaginationOptions {
  offset?: number;
  limit?: number;
  perPage?: number;
}

/**
 * Map old edition format to new resource IDs
 */
function mapEditionToResourceId(edition: string | number): number {
  if (typeof edition === 'number') {
    return edition;
  }

  // If it's text_uthmani or similar, return undefined (Arabic only)
  if (edition === 'quran-uthmani' || edition === 'text_uthmani') {
    return 0; // No translation, Arabic only
  }

  return TRANSLATION_MAP[edition] || DEFAULT_TRANSLATION;
}

// ==================== SURAH/CHAPTER ====================

/**
 * Fetch a specific surah by number
 * @param surah - The surah number (1-114)
 * @param edition - The edition to use (default: quran-uthmani)
 * @param options - Optional pagination parameters (offset and limit)
 * @returns Surah data including ayahs
 */
export async function getSurahData(
  surah: number,
  edition: string | number = EDITIONS.ARABIC,
  options?: PaginationOptions
) {
  const translationId = mapEditionToResourceId(edition);

  const { verses } = await getVersesByChapter(surah, {
    translations: translationId > 0 ? translationId : undefined,
    words: false,
    perPage: options?.perPage || options?.limit || 300,
  });

  // Transform to legacy format
  return {
    number: surah,
    ayahs: verses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      juz: verse.juz_number,
      manzil: verse.manzil_number,
      page: verse.page_number,
      ruku: verse.ruku_number,
      hizbQuarter: verse.rub_el_hizb_number,
      surah: {
        number: surah,
      },
    })),
  };
}

// ==================== JUZ ====================

/**
 * Fetch a specific juz by number
 * @param juz - The juz number (1-30)
 * @param edition - The edition to use (default: quran-uthmani)
 * @param options - Optional pagination parameters (offset and limit)
 * @returns Juz data including ayahs
 */
export async function getJuzData(
  juz: number,
  edition: string | number = EDITIONS.ARABIC,
  options?: PaginationOptions
) {
  const translationId = mapEditionToResourceId(edition);

  const { verses } = await getVersesByJuz(juz, {
    translations: translationId > 0 ? translationId : undefined,
    words: false,
    perPage: options?.perPage || options?.limit || 1000,
  });

  // Transform to legacy format
  return {
    number: juz,
    ayahs: verses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      juz: verse.juz_number,
      manzil: verse.manzil_number,
      page: verse.page_number,
      ruku: verse.ruku_number,
      hizbQuarter: verse.rub_el_hizb_number,
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
    })),
  };
}

/**
 * Fetch a specific juz with multiple editions (Arabic + translations)
 * @param juz - The juz number (1-30)
 * @param editions - Array of edition codes to fetch
 * @param options - Optional pagination parameters
 * @returns Juz data with translations merged into each ayah
 */
export async function getJuzWithTranslations(
  juz: number,
  editions: Array<string | number> = [EDITIONS.ARABIC, EDITIONS.ENGLISH],
  options?: PaginationOptions
) {
  // Map editions to resource IDs and filter out Arabic (which is base)
  const translationIds = editions
    .map(mapEditionToResourceId)
    .filter(id => id > 0);

  const { verses } = await getVersesByJuz(juz, {
    translations: translationIds.length > 0 ? translationIds : undefined,
    words: false,
    perPage: options?.perPage || options?.limit || 1000,
  });

  // Transform to legacy format with translations
  return {
    number: juz,
    ayahs: verses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      juz: verse.juz_number,
      manzil: verse.manzil_number,
      page: verse.page_number,
      ruku: verse.ruku_number,
      hizbQuarter: verse.rub_el_hizb_number,
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
      translations: verse.translations?.map((t, idx) => ({
        edition: editions[idx + 1] || `translation-${t.resource_id}`,
        text: t.text,
      })) || [],
    })),
  };
}

/**
 * Fetch all 30 Juz from the Quran
 * @param edition - The edition to use (default: quran-uthmani)
 * @param options - Optional pagination parameters
 * @returns Array of all 30 Juz data
 */
export async function getAllJuzData(
  edition: string | number = EDITIONS.ARABIC,
  options?: PaginationOptions
) {
  try {
    const juzPromises = Array.from({ length: 30 }, (_, index) => {
      const juzNumber = index + 1;
      return getJuzData(juzNumber, edition, options);
    });

    const allJuzData = await Promise.all(juzPromises);
    console.log(`Successfully fetched all 30 Juz`);
    return allJuzData;
  } catch (error) {
    console.error('Error fetching all Juz data:', error);
    throw error;
  }
}

// ==================== MANZIL ====================

/**
 * Fetch a specific manzil by number
 * WORKAROUND: Uses verse range mapping since Quran.com doesn't have Manzil endpoint
 * @param manzil - The manzil number (1-7)
 * @param edition - The edition to use (default: quran-uthmani)
 * @param options - Optional pagination parameters
 * @returns Manzil data including ayahs
 */
export async function getManzilData(
  manzil: number,
  edition: string | number = EDITIONS.ARABIC,
  options?: PaginationOptions
) {
  const manzilRange = getManzilRange(manzil);
  const translationId = mapEditionToResourceId(edition);

  // Parse the verse range
  const [startChapter, startVerse] = manzilRange.startVerse.split(':').map(Number);
  const [endChapter, endVerse] = manzilRange.endVerse.split(':').map(Number);

  // Fetch all verses in the range (fetch by chapter to minimize requests)
  const allVerses: any[] = [];
  for (let chapter = startChapter; chapter <= endChapter; chapter++) {
    const { verses } = await getVersesByChapter(chapter, {
      translations: translationId > 0 ? translationId : undefined,
      words: false,
    });

    // Filter to only verses in our manzil range
    const filteredVerses = verses.filter(v => {
      if (chapter === startChapter && v.verse_number < startVerse) return false;
      if (chapter === endChapter && v.verse_number > endVerse) return false;
      return true;
    });

    allVerses.push(...filteredVerses);
  }

  // Transform to legacy format
  return {
    number: manzil,
    ayahs: allVerses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      juz: verse.juz_number,
      manzil: verse.manzil_number,
      page: verse.page_number,
      ruku: verse.ruku_number,
      hizbQuarter: verse.rub_el_hizb_number,
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
    })),
  };
}

/**
 * Fetch a specific manzil with multiple editions (Arabic + translations)
 * @param manzil - The manzil number (1-7)
 * @param editions - Array of edition codes to fetch
 * @param options - Optional pagination parameters
 * @returns Manzil data with translations merged into each ayah
 */
export async function getManzilWithTranslations(
  manzil: number,
  editions: Array<string | number> = [EDITIONS.ARABIC, EDITIONS.ENGLISH],
  options?: PaginationOptions
) {
  const manzilRange = getManzilRange(manzil);

  // Map editions to resource IDs
  const translationIds = editions
    .map(mapEditionToResourceId)
    .filter(id => id > 0);

  // Parse the verse range
  const [startChapter, startVerse] = manzilRange.startVerse.split(':').map(Number);
  const [endChapter, endVerse] = manzilRange.endVerse.split(':').map(Number);

  // Fetch all verses in the range
  const allVerses: any[] = [];
  for (let chapter = startChapter; chapter <= endChapter; chapter++) {
    const { verses } = await getVersesByChapter(chapter, {
      translations: translationIds.length > 0 ? translationIds : undefined,
      words: false,
    });

    // Filter to only verses in our manzil range
    const filteredVerses = verses.filter(v => {
      if (chapter === startChapter && v.verse_number < startVerse) return false;
      if (chapter === endChapter && v.verse_number > endVerse) return false;
      return true;
    });

    allVerses.push(...filteredVerses);
  }

  // Transform to legacy format with translations
  return {
    number: manzil,
    ayahs: allVerses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      juz: verse.juz_number,
      manzil: verse.manzil_number,
      page: verse.page_number,
      ruku: verse.ruku_number,
      hizbQuarter: verse.rub_el_hizb_number,
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
      translations: verse.translations?.map((t, idx) => ({
        edition: editions[idx + 1] || `translation-${t.resource_id}`,
        text: t.text,
      })) || [],
    })),
  };
}

// ==================== HIZB ====================

/**
 * Fetch a specific hizb quarter by number
 * @param hizb - The hizb quarter number (1-240)
 * @param edition - The edition to use (default: quran-uthmani)
 * @param options - Optional pagination parameters
 * @returns Hizb quarter data including ayahs
 */
export async function getHizbData(
  hizb: number,
  edition: string | number = EDITIONS.ARABIC,
  options?: PaginationOptions
) {
  const translationId = mapEditionToResourceId(edition);

  const { verses } = await getVersesByHizb(hizb, {
    translations: translationId > 0 ? translationId : undefined,
    words: false,
  });

  // Transform to legacy format
  return {
    number: hizb,
    ayahs: verses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      juz: verse.juz_number,
      manzil: verse.manzil_number,
      page: verse.page_number,
      ruku: verse.ruku_number,
      hizbQuarter: verse.rub_el_hizb_number,
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
    })),
  };
}

// ==================== RUKU ====================

/**
 * Fetch a specific ruku by number
 * WORKAROUND: Uses verse range mapping since Quran.com doesn't have Ruku endpoint
 * @param ruku - The ruku number (1-556)
 * @param edition - The edition to use (default: quran-uthmani)
 * @param options - Optional pagination parameters
 * @returns Ruku data including ayahs
 */
export async function getRukuData(
  ruku: number,
  edition: string | number = EDITIONS.ARABIC,
  options?: PaginationOptions
) {
  const rukuRange = getRukuRange(ruku);

  if (!rukuRange) {
    throw new Error(`Ruku ${ruku} not yet mapped. Please extend Ruku mapping.`);
  }

  const translationId = mapEditionToResourceId(edition);

  const { verses } = await getVersesByChapter(rukuRange.chapter, {
    translations: translationId > 0 ? translationId : undefined,
    words: false,
  });

  // Filter to only verses in this ruku
  const rukuVerses = verses.filter(v =>
    v.verse_number >= rukuRange.startVerse &&
    v.verse_number <= rukuRange.endVerse
  );

  // Transform to legacy format
  return {
    number: ruku,
    ayahs: rukuVerses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      juz: verse.juz_number,
      manzil: verse.manzil_number,
      page: verse.page_number,
      ruku: verse.ruku_number || ruku,
      hizbQuarter: verse.rub_el_hizb_number,
      surah: {
        number: rukuRange.chapter,
      },
    })),
  };
}

// ==================== PAGE ====================

/**
 * Fetch a specific page by number
 * @param page - The page number (1-604)
 * @param edition - The edition to use (default: quran-uthmani)
 * @param options - Optional pagination parameters
 * @returns Page data including ayahs
 */
export async function getPageData(
  page: number,
  edition: string | number = EDITIONS.ARABIC,
  options?: PaginationOptions
) {
  const translationId = mapEditionToResourceId(edition);

  const { verses } = await getVersesByPage(page, {
    translations: translationId > 0 ? translationId : undefined,
    words: false,
    perPage: 50,
  });

  // Transform to legacy format
  return {
    number: page,
    ayahs: verses.map(verse => ({
      number: verse.id,
      text: verse.text_uthmani,
      numberInSurah: verse.verse_number,
      juz: verse.juz_number,
      manzil: verse.manzil_number,
      page: verse.page_number,
      ruku: verse.ruku_number,
      hizbQuarter: verse.rub_el_hizb_number,
      surah: {
        number: parseInt(verse.verse_key.split(':')[0], 10),
      },
    })),
  };
}