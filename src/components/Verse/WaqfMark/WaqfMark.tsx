/**
 * WaqfMark Component
 * Renders Quranic waqf (pause) marks with proper positioning and styling
 */

'use client';

import React from 'react';
import styles from './WaqfMark.module.scss';
import {
    getWaqfMeaning,
    getSemanticColor,
    WaqfDisplayStyle,
    WaqfColorScheme,
    WaqfPosition,
    WaqfPreferences,
    DEFAULT_WAQF_PREFERENCES,
} from './waqfTypes';

export interface WaqfMarkProps {
    /** The waqf Unicode character to display */
    text: string;

    /** Font family being used (for font-specific adjustments) */
    font?: 'indopak' | 'uthmani' | 'tajweed';

    /** Display style preference */
    displayStyle?: WaqfDisplayStyle;

    /** Color scheme */
    colorScheme?: WaqfColorScheme;

    /** Show explanatory tooltip on hover */
    showTooltip?: boolean;

    /** Font size multiplier */
    fontSize?: number;

    /** Positioning strategy */
    position?: WaqfPosition;

    /** Custom color override */
    customColor?: string;

    /** Full preferences object (overrides individual props) */
    preferences?: Partial<WaqfPreferences>;

    /** Additional CSS class */
    className?: string;
}

export const WaqfMark: React.FC<WaqfMarkProps> = ({
    text,
    font = 'uthmani',
    displayStyle,
    colorScheme,
    showTooltip,
    fontSize,
    position,
    customColor,
    preferences,
    className = '',
}) => {
    // Merge preferences with defaults
    const prefs = {
        ...DEFAULT_WAQF_PREFERENCES,
        ...preferences,
    };

    // Override with individual props if provided
    const finalDisplayStyle = displayStyle || prefs.displayStyle;
    const finalColorScheme = colorScheme || prefs.colorScheme;
    const finalShowTooltip = showTooltip !== undefined ? showTooltip : prefs.showTooltips;
    const finalFontSize = fontSize || prefs.fontSize;
    const finalPosition = position || prefs.position;

    // Get waqf meaning for tooltip and color
    const waqfInfo = getWaqfMeaning(text);

    // Don't render if waqf marks are disabled or no waqf info found
    if (!prefs.showWaqfMarks || !waqfInfo) {
        return null;
    }

    // Determine color based on color scheme
    let markColor = customColor;
    if (!markColor) {
        switch (finalColorScheme) {
            case WaqfColorScheme.SEMANTIC:
                markColor = getSemanticColor(waqfInfo.type);
                break;
            case WaqfColorScheme.MONOCHROME:
                markColor = '#ffffff';
                break;
            case WaqfColorScheme.CUSTOM:
                markColor = waqfInfo.color || '#ffffff';
                break;
            case WaqfColorScheme.DEFAULT:
            default:
                markColor = '#ffffff';
                break;
        }
    }

    // Build class names
    const classNames = [
        styles.waqfMark,
        styles[finalDisplayStyle],
        styles[finalPosition],
        styles[`font-${font}`],
        className,
    ].filter(Boolean).join(' ');

    // Tooltip content
    const tooltipContent = finalShowTooltip
        ? `${waqfInfo.englishName}\n${waqfInfo.meaning}`
        : undefined;

    return (
        <span
            className={classNames}
            style={{
                color: markColor,
                fontSize: `${finalFontSize}em`,
            }}
            title={tooltipContent}
            aria-label={waqfInfo.englishName}
            role="img"
        >
            {text}
        </span>
    );
};

export default WaqfMark;
