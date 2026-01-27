import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './ReadingModeActions.module.scss';

export interface ReadingModeActionsProps {
    /** Current reading mode */
    mode?: 'arabic' | 'translation';
    /** Callback when mode changes */
    onModeChange?: (mode: 'arabic' | 'translation') => void;
    /** Current font size scale (1-6) */
    fontSize?: number;
    /** Callback when font size changes */
    onFontSizeChange?: (size: number) => void;
}

/**
 * ReadingModeActions Component
 * Toggle between Arabic-only and Translation modes with font size controls
 * Based on Quran.com's ReadingModeActions component
 */
const ReadingModeActions: React.FC<ReadingModeActionsProps> = ({
    mode = 'arabic',
    onModeChange,
    fontSize = 3,
    onFontSizeChange,
}) => {
    const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

    const handleModeClick = (newMode: 'arabic' | 'translation') => {
        if (onModeChange) {
            onModeChange(newMode);
        }
    };

    const handleFontSizeChange = (size: number) => {
        if (onFontSizeChange) {
            onFontSizeChange(size);
        }
        setShowFontSizeMenu(false);
    };

    return (
        <div className={styles.container}>
            {/* Reading Mode Toggle */}
            <div className={styles.modeToggle}>
                <button
                    className={classNames(styles.toggleButton, {
                        [styles.active]: mode === 'arabic',
                    })}
                    onClick={() => handleModeClick('arabic')}
                    aria-label="Arabic reading mode"
                >
                    Arabic
                </button>
                <button
                    className={classNames(styles.toggleButton, {
                        [styles.active]: mode === 'translation',
                    })}
                    onClick={() => handleModeClick('translation')}
                    aria-label="Translation reading mode"
                >
                    Translation
                </button>
            </div>

            {/* Font Size Control */}
            <div className={styles.fontSizeControl}>
                <button
                    className={styles.fontSizeButton}
                    onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
                    aria-label="Font size options"
                    title="Adjust font size"
                >
                    <span className={styles.fontSizeIcon}>A</span>
                    <span className={styles.fontSizeLabel}>Font</span>
                </button>

                {showFontSizeMenu && (
                    <div className={styles.fontSizeMenu}>
                        <div className={styles.menuHeader}>Font Size</div>
                        <div className={styles.sizeOptions}>
                            {[1, 2, 3, 4, 5, 6].map((size) => (
                                <button
                                    key={size}
                                    className={classNames(styles.sizeOption, {
                                        [styles.activeSize]: fontSize === size,
                                    })}
                                    onClick={() => handleFontSizeChange(size)}
                                >
                                    {size === 1 && 'Small'}
                                    {size === 2 && 'Medium'}
                                    {size === 3 && 'Normal'}
                                    {size === 4 && 'Large'}
                                    {size === 5 && 'XLarge'}
                                    {size === 6 && 'XXLarge'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadingModeActions;
