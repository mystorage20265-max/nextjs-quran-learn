/**
 * WaqfTooltip Component
 * Displays explanatory tooltips for waqf marks
 */

'use client';

import React, { useState } from 'react';
import styles from './WaqfTooltip.module.scss';
import { WaqfMeaning, WaqfSeverity } from './waqfTypes';

export interface WaqfTooltipProps {
    /** Waqf information to display */
    waqfInfo: WaqfMeaning;

    /** The waqf mark element to wrap */
    children: React.ReactNode;

    /** Show tooltip on mobile (tap to toggle) */
    mobileEnabled?: boolean;
}

export const WaqfTooltip: React.FC<WaqfTooltipProps> = ({
    waqfInfo,
    children,
    mobileEnabled = true,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    const handleClick = () => {
        if (mobileEnabled) {
            setIsVisible(!isVisible);
        }
    };

    // Severity icon
    const getSeverityIcon = (severity: WaqfSeverity): string => {
        switch (severity) {
            case WaqfSeverity.MANDATORY:
                return '⚠️';
            case WaqfSeverity.RECOMMENDED:
                return 'ℹ️';
            case WaqfSeverity.OPTIONAL:
                return '💡';
            case WaqfSeverity.INFORMATIONAL:
            default:
                return '📖';
        }
    };

    return (
        <span
            className={styles.tooltipContainer}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            role="tooltip"
            aria-describedby={`waqf-tooltip-${waqfInfo.unicode}`}
        >
            {children}
            {isVisible && (
                <span
                    id={`waqf-tooltip-${waqfInfo.unicode}`}
                    className={styles.tooltip}
                    role="status"
                    aria-live="polite"
                >
                    <span className={styles.tooltipHeader}>
                        <span className={styles.symbol}>{waqfInfo.symbol}</span>
                        <span className={styles.name}>
                            {waqfInfo.englishName}
                            <span className={styles.severityIcon}>
                                {getSeverityIcon(waqfInfo.severity)}
                            </span>
                        </span>
                    </span>
                    <span className={styles.tooltipBody}>
                        <span className={styles.meaning}>{waqfInfo.meaning}</span>
                        {waqfInfo.arabicName && (
                            <span className={styles.arabic}>{waqfInfo.arabicName}</span>
                        )}
                    </span>
                    <span className={styles.tooltipFooter}>
                        <span className={styles.pauseIndicator}>
                            {waqfInfo.shouldPause ? '⏸️ Pause' : '▶️ Continue'}
                        </span>
                        <span className={styles.severity}>
                            {waqfInfo.severity}
                        </span>
                    </span>
                </span>
            )}
        </span>
    );
};

export default WaqfTooltip;
