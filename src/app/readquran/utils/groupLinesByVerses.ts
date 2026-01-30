/**
 * Standalone Quran UI - Group Lines By Verses
 * Groups words by their line numbers for Mushaf-style rendering
 * Adapted from QuranReader/ReadingView/groupLinesByVerses.ts
 */

import type { Verse, Word } from '../types';

/**
 * Groups verses into lines to match the Quran Page (Madani Mushaf) layout
 * The returning value is an object containing the page and line number as a key,
 * and array of word for the value. E.g.
 * {
 *  Page1-Line2: [words],
 *  Page1-Line3: [words]
 *  ...
 * }
 *
 * @param verses - Array of verses with words
 * @returns {Record<string, Word[]>} Object mapping line keys to arrays of words
 */
export function groupLinesByVerses(verses: Verse[]): Record<string, Word[]> {
  let allWords: Word[] = [];

  // Flatten the verses into an array of words
  verses.forEach((verse) => {
    if (verse.words && verse.words.length > 0) {
      allWords = [...allWords, ...verse.words];
    }
  });

  // Group by words using native grouping (no lodash needed)
  const lines: Record<string, Word[]> = {};
  
  allWords.forEach((word) => {
    // Get lineNumber and pageNumber from word
    // These come from the API response
    const lineNumber = (word as any).lineNumber || 1;
    const pageNumber = (word as any).pageNumber || 1;
    
    const lineKey = `Page${pageNumber}-Line${lineNumber}`;
    
    if (!lines[lineKey]) {
      lines[lineKey] = [];
    }
    
    lines[lineKey].push(word);
  });

  return lines;
}

/**
 * Get the number of lines for a specific Mushaf type
 * 
 * @param mushafType - Type of Mushaf ('hafs', 'warsh', etc.)
 * @returns Number of lines per page
 */
export function getLinesPerPage(mushafType: string = 'hafs'): number {
  switch (mushafType) {
    case 'indopak':
      return 16;
    case 'hafs':
    default:
      return 15;
  }
}
