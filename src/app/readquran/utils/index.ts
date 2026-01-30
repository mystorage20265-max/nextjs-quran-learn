/**
 * Standalone Quran UI - Utility Functions
 * Self-contained helper functions
 */

import { WaqfType } from '../types';

// ============================================================================
// VERSE KEY UTILITIES
// ============================================================================

/**
 * Create a verse key from chapter and verse numbers
 */
export function makeVerseKey(chapterId: number, verseNumber: number): string {
  return `${chapterId}:${verseNumber}`;
}

/**
 * Parse a verse key into chapter and verse numbers
 */
export function parseVerseKey(verseKey: string): { chapterId: number; verseNumber: number } | null {
  const parts = verseKey.split(':');
  if (parts.length !== 2) return null;

  const chapterId = parseInt(parts[0], 10);
  const verseNumber = parseInt(parts[1], 10);

  if (isNaN(chapterId) || isNaN(verseNumber)) return null;

  return { chapterId, verseNumber };
}

/**
 * Create a word location string
 */
export function makeWordLocation(verseKey: string, position: number): string {
  return `${verseKey}:${position}`;
}

/**
 * Parse a word location into components
 */
export function parseWordLocation(
  location: string
): { chapterId: number; verseNumber: number; position: number } | null {
  const parts = location.split(':');
  if (parts.length !== 3) return null;

  const chapterId = parseInt(parts[0], 10);
  const verseNumber = parseInt(parts[1], 10);
  const position = parseInt(parts[2], 10);

  if (isNaN(chapterId) || isNaN(verseNumber) || isNaN(position)) return null;

  return { chapterId, verseNumber, position };
}

/**
 * Convert number to Arabic-Indic numerals (٠-٩)
 */
export function toArabicNumber(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num)
    .split('')
    .map((digit) => arabicNumerals[parseInt(digit, 10)] || digit)
    .join('');
}

// ============================================================================
// WAQF (PAUSE MARK) UTILITIES
// ============================================================================

/**
 * Detect waqf type from Arabic text
 */
export function detectWaqfType(text: string): WaqfType {
  // Waqf characters and their types
  const waqfMap: Record<string, WaqfType> = {
    'ۘ': WaqfType.MustPause,        // Meem - Waqf Lazim
    'ۖ': WaqfType.BetterToPause,    // Sad Lam - Waqf Mujawwaz  
    'ۚ': WaqfType.Permissible,      // Jeem - Waqf Ja'iz
    'ۗ': WaqfType.MustContinue,     // Qala - Wasl Lazim
    'ۙ': WaqfType.ProhibitedPause,  // La - Do not pause
  };

  for (const char of text) {
    if (char in waqfMap) {
      return waqfMap[char];
    }
  }

  return WaqfType.NonPause;
}

/**
 * Get waqf mark color based on type
 */
export function getWaqfColor(type: WaqfType): string {
  switch (type) {
    case WaqfType.MustPause:
      return 'var(--quran-color-error)';
    case WaqfType.BetterToPause:
      return 'var(--quran-color-warning)';
    case WaqfType.Permissible:
      return 'var(--quran-color-success)';
    case WaqfType.BetterToContinue:
      return 'var(--quran-color-accent)';
    case WaqfType.MustContinue:
      return 'var(--quran-color-success)';
    case WaqfType.ProhibitedPause:
      return 'var(--quran-color-error)';
    case WaqfType.SilentPause:
      return 'var(--quran-color-text-faded)';
    default:
      return 'var(--quran-color-text-default)';
  }
}

/**
 * Get waqf mark description
 */
export function getWaqfDescription(type: WaqfType): string {
  switch (type) {
    case WaqfType.MustPause:
      return 'Must pause here (Waqf Lazim)';
    case WaqfType.BetterToPause:
      return 'Better to pause (Waqf Mujawwaz)';
    case WaqfType.Permissible:
      return 'Permissible to pause (Waqf Ja\'iz)';
    case WaqfType.BetterToContinue:
      return 'Better to continue (Wasl Awla)';
    case WaqfType.MustContinue:
      return 'Must continue (Wasl Lazim)';
    case WaqfType.ProhibitedPause:
      return 'Do not pause here (La)';
    case WaqfType.SilentPause:
      return 'Silent pause (Saktah)';
    default:
      return '';
  }
}

// ============================================================================
// TEXT FORMATTING UTILITIES
// ============================================================================

/**
 * Remove diacritics from Arabic text
 */
export function removeDiacritics(text: string): string {
  // Arabic diacritical marks (tashkeel)
  const diacritics = /[\u064B-\u0652\u0670\u0640]/g;
  return text.replace(diacritics, '');
}

/**
 * Clean Arabic text (remove extra spaces, normalize)
 */
export function cleanArabicText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\u200B/g, '') // Remove zero-width spaces
    .normalize('NFC');      // Normalize Unicode
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ============================================================================
// NUMBER FORMATTING UTILITIES
// ============================================================================

/**
 * Format verse number in Arabic-Indic numerals
 */
export function toArabicNumerals(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((digit) => arabicNumerals[parseInt(digit, 10)] || digit)
    .join('');
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// CLASSNAME UTILITIES
// ============================================================================

/**
 * Conditionally join classNames
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Create BEM-style className
 */
export function bem(block: string, element?: string, modifiers?: Record<string, boolean>): string {
  let className = block;

  if (element) {
    className += `__${element}`;
  }

  if (modifiers) {
    Object.entries(modifiers).forEach(([modifier, condition]) => {
      if (condition) {
        className += ` ${block}${element ? `__${element}` : ''}--${modifier}`;
      }
    });
  }

  return className;
}

// ============================================================================
// DEBOUNCE/THROTTLE UTILITIES
// ============================================================================

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

/**
 * Generate unique ID for accessibility
 */
let idCounter = 0;
export function generateId(prefix: string = 'quran'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  return (
    focusableTags.includes(element.tagName) ||
    element.hasAttribute('tabindex') ||
    element.hasAttribute('contenteditable')
  );
}

// ============================================================================
// COPY TO CLIPBOARD UTILITY
// ============================================================================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
