/**
 * Waqf Marks Type Definitions
 * Comprehensive type system for Quranic waqf (pause) marks
 */

/**
 * Enum representing all 13 IndoPak waqf (pause) characters
 */
export enum WaqfType {
    // Primary pause marks
    SMALL_HIGH_MEEM_PAUSE = '\u06D6',      // ۖ - Pause
    SMALL_HIGH_QAF = '\u06D7',             // ۗ - Superior pause
    SMALL_HIGH_NOON = '\u06D8',            // ۘ - Permissible pause
    SMALL_HIGH_MEEM_CONTINUE = '\u06D9',   // ۙ - Mandatory continuation
    SMALL_HIGH_LAM_ALEF = '\u06DA',        // ۚ - Pause preferred
    SMALL_HIGH_JEEM = '\u06DB',            // ۛ - Continue preferred
    SMALL_HIGH_SEEN = '\u06DC',            // ۜ - No pause

    // Additional marks
    SMALL_HIGH_MADDA = '\u06E2',           // ۢ - Stretch
    SMALL_HIGH_TAH = '\u0615',             // ؕ - Pause
    EMPTY_CENTRE_HIGH_STOP = '\u06EA',     // ۪ - Pause above
    EMPTY_CENTRE_LOW_STOP = '\u06EB',      // ۫ - Pause below
    INVERTED_DAMMA = '\u0617',             // ُ - Dammatan mark
    SMALL_WAW = '\u06E5',                  // ۥ - Waw marker
}

/**
 * Categories of waqf marks
 */
export enum WaqfCategory {
    MANDATORY_PAUSE = 'mandatory_pause',
    PERMISSIBLE_PAUSE = 'permissible_pause',
    FORBIDDEN_PAUSE = 'forbidden_pause',
    PREFERRED_PAUSE = 'preferred_pause',
    PREFERRED_CONTINUE = 'preferred_continue',
    STRETCH = 'stretch',
    OTHER = 'other',
}

/**
 * Severity levels for waqf rules
 */
export enum WaqfSeverity {
    MANDATORY = 'mandatory',       // Must follow
    RECOMMENDED = 'recommended',   // Should follow
    OPTIONAL = 'optional',         // May follow
    INFORMATIONAL = 'informational', // Informational only
}

/**
 * Interface describing the meaning and display properties of a waqf mark
 */
export interface WaqfMeaning {
    unicode: string;           // Unicode character (e.g., '\u06D8')
    symbol: string;            // Display symbol (e.g., 'ۘ')
    arabicName: string;        // Arabic name
    englishName: string;       // English name
    type: WaqfCategory;        // Category of pause
    meaning: string;           // Detailed explanation
    shouldPause: boolean;      // Whether pause is recommended
    severity: WaqfSeverity;    // How mandatory the rule is
    color?: string;            // Optional custom color for display
}

/**
 * Display style options for waqf marks
 */
export enum WaqfDisplayStyle {
    SUPERSCRIPT = 'superscript',   // Above the word
    INLINE = 'inline',             // In line with text
    TOOLTIP_ONLY = 'tooltip',      // Only show on hover
}

/**
 * Color scheme options
 */
export enum WaqfColorScheme {
    DEFAULT = 'default',           // Theme-based color
    SEMANTIC = 'semantic',         // Color by meaning (red=stop, green=continue)
    MONOCHROME = 'monochrome',     // Single color
    CUSTOM = 'custom',             // User-defined colors
}

/**
 * Positioning options
 */
export enum WaqfPosition {
    ABOVE_WORD = 'above',          // Positioned above last letter
    END_OF_WORD = 'end',           // After the word
    FLOATING = 'floating',         // Absolute positioned overlay
}

/**
 * User preferences for waqf mark display
 */
export interface WaqfPreferences {
    showWaqfMarks: boolean;              // Toggle visibility
    displayStyle: WaqfDisplayStyle;      // How to display marks
    showTooltips: boolean;               // Show explanatory tooltips
    colorScheme: WaqfColorScheme;        // Color scheme
    fontSize: number;                    // Size multiplier (1.0 = default)
    position: WaqfPosition;              // Positioning strategy
}

/**
 * Complete mapping of all 13 waqf marks to their meanings
 */
export const WAQF_MEANINGS: Record<string, WaqfMeaning> = {
    '\u06D6': {
        unicode: '\u06D6',
        symbol: 'ۖ',
        arabicName: 'صلى',
        englishName: 'Small High Meem',
        type: WaqfCategory.PERMISSIBLE_PAUSE,
        meaning: 'Pause is permissible here',
        shouldPause: true,
        severity: WaqfSeverity.OPTIONAL,
    },
    '\u06D7': {
        unicode: '\u06D7',
        symbol: 'ۗ',
        arabicName: 'قلى',
        englishName: 'Small High Qaf',
        type: WaqfCategory.PREFERRED_PAUSE,
        meaning: 'Pause is better than continuing',
        shouldPause: true,
        severity: WaqfSeverity.RECOMMENDED,
    },
    '\u06D8': {
        unicode: '\u06D8',
        symbol: 'ۘ',
        arabicName: 'سكتة',
        englishName: 'Small High Noon',
        type: WaqfCategory.PERMISSIBLE_PAUSE,
        meaning: 'Brief pause without breath',
        shouldPause: true,
        severity: WaqfSeverity.OPTIONAL,
    },
    '\u06D9': {
        unicode: '\u06D9',
        symbol: 'ۙ',
        arabicName: 'لا',
        englishName: 'Small High Meem',
        type: WaqfCategory.FORBIDDEN_PAUSE,
        meaning: 'Do not pause here, must continue',
        shouldPause: false,
        severity: WaqfSeverity.MANDATORY,
    },
    '\u06DA': {
        unicode: '\u06DA',
        symbol: 'ۚ',
        arabicName: 'صلى',
        englishName: 'Small High Lam Alef',
        type: WaqfCategory.PREFERRED_PAUSE,
        meaning: 'Pause is preferred',
        shouldPause: true,
        severity: WaqfSeverity.RECOMMENDED,
    },
    '\u06DB': {
        unicode: '\u06DB',
        symbol: 'ۛ',
        arabicName: 'صلى',
        englishName: 'Small High Jeem',
        type: WaqfCategory.PREFERRED_CONTINUE,
        meaning: 'Continuing is preferred over pausing',
        shouldPause: false,
        severity: WaqfSeverity.RECOMMENDED,
    },
    '\u06DC': {
        unicode: '\u06DC',
        symbol: 'ۜ',
        arabicName: 'سين',
        englishName: 'Small High Seen',
        type: WaqfCategory.FORBIDDEN_PAUSE,
        meaning: 'Silence/no pause required',
        shouldPause: false,
        severity: WaqfSeverity.INFORMATIONAL,
    },
    '\u06E2': {
        unicode: '\u06E2',
        symbol: 'ۢ',
        arabicName: 'مد',
        englishName: 'Small High Madda',
        type: WaqfCategory.STRETCH,
        meaning: 'Elongate the sound',
        shouldPause: false,
        severity: WaqfSeverity.INFORMATIONAL,
    },
    '\u0615': {
        unicode: '\u0615',
        symbol: 'ؕ',
        arabicName: 'تاء صغيرة',
        englishName: 'Small High Tah',
        type: WaqfCategory.PERMISSIBLE_PAUSE,
        meaning: 'Permissible pause',
        shouldPause: true,
        severity: WaqfSeverity.OPTIONAL,
    },
    '\u06EA': {
        unicode: '\u06EA',
        symbol: '۪',
        arabicName: 'وقف مركز فارغ علوي',
        englishName: 'Empty Centre High Stop',
        type: WaqfCategory.PERMISSIBLE_PAUSE,
        meaning: 'Stop sign above',
        shouldPause: true,
        severity: WaqfSeverity.OPTIONAL,
    },
    '\u06EB': {
        unicode: '\u06EB',
        symbol: '۫',
        arabicName: 'وقف مركز فارغ سفلي',
        englishName: 'Empty Centre Low Stop',
        type: WaqfCategory.PERMISSIBLE_PAUSE,
        meaning: 'Stop sign below',
        shouldPause: true,
        severity: WaqfSeverity.OPTIONAL,
    },
    '\u0617': {
        unicode: '\u0617',
        symbol: 'ُ',
        arabicName: 'ضمة معكوسة',
        englishName: 'Inverted Damma',
        type: WaqfCategory.OTHER,
        meaning: 'Dammatan marker',
        shouldPause: false,
        severity: WaqfSeverity.INFORMATIONAL,
    },
    '\u06E5': {
        unicode: '\u06E5',
        symbol: 'ۥ',
        arabicName: 'واو صغيرة',
        englishName: 'Small Waw',
        type: WaqfCategory.OTHER,
        meaning: 'Waw marker for pronunciation',
        shouldPause: false,
        severity: WaqfSeverity.INFORMATIONAL,
    },
};

/**
 * Set of all IndoPak waqf characters for quick lookup
 */
export const INDO_PAK_STOP_SIGN_CHARS = new Set([
    '\u06D6', // ۖ - Arabic small high meem
    '\u06D7', // ۗ - Arabic small high qaf
    '\u06D8', // ۘ - Arabic small high noon (WAQF)
    '\u06D9', // ۙ - Arabic small high meem (WAQF)
    '\u06DA', // ۚ - Arabic small high lam alef (WAQF)
    '\u06DB', // ۛ - Arabic small high jeem (WAQF)
    '\u06DC', // ۜ - Arabic small high seen
    '\u06E2', // ۢ - Arabic small high madda
    '\u0615', // ؕ - Arabic small high tah
    '\u06EA', // ۪ - Arabic empty centre high stop
    '\u06EB', // ۫ - Arabic empty centre low stop
    '\u0617', // ُ - Arabic inverted damma
    '\u06E5', // ۥ - Arabic small waw
]);

/**
 * Helper function to get waqf meaning from Unicode character
 */
export const getWaqfMeaning = (unicode: string): WaqfMeaning | undefined => {
    return WAQF_MEANINGS[unicode];
};

/**
 * Check if a character is a waqf mark
 */
export const isWaqfMark = (char: string): boolean => {
    return char in WAQF_MEANINGS;
};

/**
 * Get semantic color for waqf mark based on category
 */
export const getSemanticColor = (category: WaqfCategory): string => {
    const colorMap: Record<WaqfCategory, string> = {
        [WaqfCategory.MANDATORY_PAUSE]: '#DC2626',      // Red
        [WaqfCategory.PREFERRED_PAUSE]: '#F59E0B',      // Amber
        [WaqfCategory.PERMISSIBLE_PAUSE]: '#10B981',    // Green
        [WaqfCategory.FORBIDDEN_PAUSE]: '#EF4444',      // Red
        [WaqfCategory.PREFERRED_CONTINUE]: '#3B82F6',   // Blue
        [WaqfCategory.STRETCH]: '#8B5CF6',              // Purple
        [WaqfCategory.OTHER]: '#6B7280',                // Gray
    };
    return colorMap[category];
};

/**
 * Default waqf preferences
 */
export const DEFAULT_WAQF_PREFERENCES: WaqfPreferences = {
    showWaqfMarks: true,
    displayStyle: WaqfDisplayStyle.SUPERSCRIPT,
    showTooltips: false,
    colorScheme: WaqfColorScheme.DEFAULT,
    fontSize: 0.7,
    position: WaqfPosition.ABOVE_WORD,
};
