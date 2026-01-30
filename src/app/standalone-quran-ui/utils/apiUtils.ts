/**
 * Standalone Quran UI - API Utilities
 * Self-contained functions for fetching Quran data from Quran.com API
 */

const QURAN_API_BASE = 'https://api.quran.com/api/v4';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ApiVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  chapter_id: number;
  page_number: number;
  hizb_number: number;
  juz_number: number;
  text_uthmani: string;
  words: ApiWord[];
  translations?: ApiTranslation[];
}

export interface ApiWord {
  id: number;
  position: number;
  text_uthmani: string;
  translation?: { text: string };
  transliteration?: { text: string };
  verse_key: string;
  location: string;
  char_type_name: string;
  line_number?: number;
  page_number?: number;
  hizb_number?: number;
  code_v1?: string;
  code_v2?: string;
  qpc_uthmani_hafs?: string;
}

export interface ApiTranslation {
  id: number;
  text: string;
  resource_id: number;
  resource_name: string;
  language_name: string;
  language_id: number;
}

export interface ApiVersesResponse {
  verses: ApiVerse[];
  pagination?: {
    current_page: number;
    total_pages: number;
    per_page: number;
    total_records: number;
  };
  meta?: {
    from?: string;
    to?: string;
  };
}

export interface ApiChapterInfo {
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

export interface FetchVersesOptions {
  translations?: number[];
  wordFields?: string[];
  reciter?: number;
  perPage?: number | 'all';
  page?: number;
  wordTranslationLanguage?: string;
  wordTransliteration?: boolean;
}

// ============================================================================
// API UTILITY FUNCTIONS
// ============================================================================

/**
 * Fetch verses by chapter
 */
export async function fetchVersesByChapter(
  chapterId: number,
  options: FetchVersesOptions = {}
): Promise<ApiVersesResponse> {
  const params = new URLSearchParams();
  
  // Default settings
  params.append('language', 'en');
  params.append('words', 'true');
  params.append('word_fields', 'text_uthmani,verse_key,location,char_type_name,line_number,page_number,code_v1,code_v2,qpc_uthmani_hafs');
  
  // Add word translation if specified
  if (options.wordTranslationLanguage) {
    params.append('word_translation_language', options.wordTranslationLanguage);
    params.append('word_fields', params.get('word_fields') + ',translation');
  }
  
  // Add word transliteration if specified
  if (options.wordTransliteration) {
    params.append('word_fields', params.get('word_fields') + ',transliteration');
  }
  
  // Add translations
  if (options.translations && options.translations.length > 0) {
    params.append('translations', options.translations.join(','));
  }
  
  // Add reciter for audio
  if (options.reciter) {
    params.append('reciter', String(options.reciter));
  }
  
  // Pagination
  if (options.perPage) {
    params.append('per_page', String(options.perPage));
  }
  if (options.page) {
    params.append('page', String(options.page));
  }
  
  const url = `${QURAN_API_BASE}/verses/by_chapter/${chapterId}?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch verses: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch verses by page (Mushaf page)
 */
export async function fetchVersesByPage(
  pageNumber: number,
  options: FetchVersesOptions = {}
): Promise<ApiVersesResponse> {
  const params = new URLSearchParams();
  
  params.append('language', 'en');
  params.append('words', 'true');
  params.append('word_fields', 'text_uthmani,verse_key,location,char_type_name,line_number,page_number,hizb_number,code_v1,code_v2,qpc_uthmani_hafs');
  params.append('per_page', 'all');
  
  if (options.wordTranslationLanguage) {
    params.append('word_translation_language', options.wordTranslationLanguage);
    params.append('word_fields', params.get('word_fields') + ',translation');
  }
  
  if (options.wordTransliteration) {
    params.append('word_fields', params.get('word_fields') + ',transliteration');
  }
  
  if (options.translations && options.translations.length > 0) {
    params.append('translations', options.translations.join(','));
  }
  
  const url = `${QURAN_API_BASE}/verses/by_page/${pageNumber}?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch verses by page: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch verses by Juz
 */
export async function fetchVersesByJuz(
  juzNumber: number,
  options: FetchVersesOptions = {}
): Promise<ApiVersesResponse> {
  const params = new URLSearchParams();
  
  params.append('language', 'en');
  params.append('words', 'true');
  params.append('word_fields', 'text_uthmani,verse_key,location,char_type_name,line_number,page_number,hizb_number');
  
  if (options.wordTranslationLanguage) {
    params.append('word_translation_language', options.wordTranslationLanguage);
    params.append('word_fields', params.get('word_fields') + ',translation');
  }
  
  if (options.translations && options.translations.length > 0) {
    params.append('translations', options.translations.join(','));
  }
  
  if (options.perPage) {
    params.append('per_page', String(options.perPage));
  }
  if (options.page) {
    params.append('page', String(options.page));
  }
  
  const url = `${QURAN_API_BASE}/verses/by_juz/${juzNumber}?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch verses by juz: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch a single verse
 */
export async function fetchVerse(
  verseKey: string,
  options: FetchVersesOptions = {}
): Promise<ApiVerse> {
  const params = new URLSearchParams();
  
  params.append('language', 'en');
  params.append('words', 'true');
  params.append('word_fields', 'text_uthmani,verse_key,location,char_type_name');
  
  if (options.wordTranslationLanguage) {
    params.append('word_translation_language', options.wordTranslationLanguage);
    params.append('word_fields', params.get('word_fields') + ',translation');
  }
  
  if (options.wordTransliteration) {
    params.append('word_fields', params.get('word_fields') + ',transliteration');
  }
  
  if (options.translations && options.translations.length > 0) {
    params.append('translations', options.translations.join(','));
  }
  
  const url = `${QURAN_API_BASE}/verses/by_key/${verseKey}?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch verse: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.verse;
}

/**
 * Fetch chapter information
 */
export async function fetchChapterInfo(chapterId: number): Promise<ApiChapterInfo> {
  const url = `${QURAN_API_BASE}/chapters/${chapterId}?language=en`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch chapter info: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.chapter;
}

/**
 * Fetch all chapters
 */
export async function fetchAllChapters(): Promise<ApiChapterInfo[]> {
  const url = `${QURAN_API_BASE}/chapters?language=en`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch chapters: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.chapters;
}

/**
 * Fetch available translations
 */
export async function fetchAvailableTranslations(): Promise<any[]> {
  const url = `${QURAN_API_BASE}/resources/translations?language=en`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch translations: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.translations;
}

/**
 * Fetch available reciters
 */
export async function fetchAvailableReciters(): Promise<any[]> {
  const url = `${QURAN_API_BASE}/resources/recitations`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch reciters: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.recitations;
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform API verse to internal Verse type
 */
export function transformApiVerse(apiVerse: ApiVerse): any {
  return {
    id: apiVerse.id,
    verseNumber: apiVerse.verse_number,
    verseKey: apiVerse.verse_key,
    chapterId: apiVerse.chapter_id,
    pageNumber: apiVerse.page_number,
    hizbNumber: apiVerse.hizb_number,
    juzNumber: apiVerse.juz_number,
    words: apiVerse.words.map(transformApiWord),
    translations: apiVerse.translations?.map(transformApiTranslation) || [],
  };
}

/**
 * Transform API word to internal Word type
 */
export function transformApiWord(apiWord: ApiWord): any {
  return {
    id: apiWord.id,
    position: apiWord.position,
    text: apiWord.text_uthmani,
    translation: apiWord.translation?.text || null,
    transliteration: apiWord.transliteration?.text || null,
    verseKey: apiWord.verse_key,
    location: apiWord.location,
    charType: apiWord.char_type_name as any,
    lineNumber: apiWord.line_number,
    pageNumber: apiWord.page_number,
    hizbNumber: apiWord.hizb_number,
    codeV1: apiWord.code_v1,
    codeV2: apiWord.code_v2,
    qpcUthmaniHafs: apiWord.qpc_uthmani_hafs,
  };
}

/**
 * Transform API translation to internal Translation type
 */
export function transformApiTranslation(apiTranslation: ApiTranslation): any {
  return {
    id: apiTranslation.id,
    text: apiTranslation.text,
    languageId: apiTranslation.language_id,
    languageName: apiTranslation.language_name,
    resourceName: apiTranslation.resource_name,
  };
}

/**
 * Get audio URL for a verse
 */
export function getVerseAudioUrl(verseKey: string, reciterId: number = 7): string {
  // Default reciter: 7 (Mishari Rashid al-`Afasy)
  const [chapter, verse] = verseKey.split(':');
  const paddedChapter = chapter.padStart(3, '0');
  const paddedVerse = verse.padStart(3, '0');
  
  return `https://verses.quran.com/${reciterId}/${paddedChapter}${paddedVerse}.mp3`;
}

/**
 * Build cache key for verses request
 */
export function buildCacheKey(type: string, id: number | string, options: FetchVersesOptions): string {
  const parts = [
    type,
    String(id),
    `trans:${(options.translations || []).join(',')}`,
    `page:${options.page || 1}`,
    `per:${options.perPage || 'default'}`,
  ];
  
  return parts.join('|');
}
