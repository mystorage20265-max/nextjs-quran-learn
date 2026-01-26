'use client';

import React, { useState } from 'react';
import { GlyphWord as GlyphWordType, getGlyphFontFamily } from '@/services/quranGlyphApi';
import './GlyphWord.css';

interface GlyphWordProps {
    word: GlyphWordType;
    onClick?: (word: GlyphWordType) => void;
    isPlaying?: boolean;
    showTooltip?: boolean;
}

export function GlyphWord({ word, onClick, isPlaying = false, showTooltip = true }: GlyphWordProps) {
    const [showPopover, setShowPopover] = useState(false);

    // Use code_v2 for the glyph character
    const glyphChar = word.code_v2 || word.code_v1 || word.text_uthmani;
    const fontFamily = getGlyphFontFamily(word.v2_page || word.v1_page || word.page_number);

    const handleClick = () => {
        if (onClick) {
            onClick(word);
        }
        if (showTooltip) {
            setShowPopover(!showPopover);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    // Don't render interactive elements for verse end markers
    if (word.char_type_name === 'end') {
        // Extract verse number from verse_key (e.g., "1:1" -> "1")
        const verseNumber = word.verse_key ? word.verse_key.split(':')[1] : word.position;

        return (
            <span
                className="glyph-word glyph-word-end"
                data-word-id={word.id}
                title={`Verse ${verseNumber}`}
            >
                {verseNumber}
            </span>
        );
    }

    return (
        <span className="glyph-word-container">
            <span
                className={`glyph-word ${isPlaying ? 'glyph-word-playing' : ''} ${showPopover ? 'glyph-word-active' : ''}`}
                style={{ fontFamily }}
                onClick={handleClick}
                onKeyPress={handleKeyPress}
                role="button"
                tabIndex={0}
                aria-label={`Word: ${word.text_uthmani}`}
                data-word-id={word.id}
                data-word-location={word.verse_key}
                data-position={word.position}
            >
                {glyphChar}
            </span>

            {showPopover && word.transliteration && (
                <span className="glyph-word-tooltip">
                    {word.transliteration.text}
                    {word.translation && (
                        <span className="glyph-word-translation">
                            {word.translation.text}
                        </span>
                    )}
                </span>
            )}
        </span>
    );
}

export default GlyphWord;
