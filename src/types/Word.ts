/**
 * Character Type Enum
 * Defines the different types of characters in Quranic text
 */
export enum CharType {
    Word = 'word',
    End = 'end',
    Pause = 'pause',
    Sajdah = 'sajdah',
    RubElHizb = 'rub-el-hizb',
}

/**
 * Helper to check if a char_type_name string is a pause character
 */
export const isPauseChar = (charType: string): boolean => {
    return charType === CharType.Pause || charType === 'pause';
};

/**
 * Helper to convert string to CharType enum
 */
export const toCharType = (charType: string): CharType | undefined => {
    const charTypeMap: Record<string, CharType> = {
        'word': CharType.Word,
        'end': CharType.End,
        'pause': CharType.Pause,
        'sajdah': CharType.Sajdah,
        'rub-el-hizb': CharType.RubElHizb,
    };
    return charTypeMap[charType];
};
