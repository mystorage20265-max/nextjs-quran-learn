import React from 'react';
import { GlyphWord } from '@/services/quranGlyphApi';
import styles from './WordStudyPanel.module.scss';

export interface WordStudyPanelProps {
    /** Word data to display */
    word: GlyphWord;
    /** Callback when panel is closed */
    onClose?: () => void;
}

/**
 * WordStudyPanel Component
 * Detailed word study panel shown on word click
 * Displays translation, transliteration, root word, and audio
 * Based on Quran.com's word popover functionality
 */
const WordStudyPanel: React.FC<WordStudyPanelProps> = ({ word, onClose }) => {
    const hasTranslation = word.translation?.text;
    const hasTransliteration = (word as any).transliteration?.text;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h3 className={styles.title}>Word Study</h3>
                {onClose && (
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close word study"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Arabic Word */}
            <div className={styles.arabicSection}>
                <div className={styles.arabicWord}>{word.text_uthmani}</div>
            </div>

            {/* Transliteration */}
            {hasTransliteration && (
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Transliteration</div>
                    <div className={styles.sectionContent}>
                        {(word as any).transliteration.text}
                    </div>
                </div>
            )}

            {/* Translation */}
            {hasTranslation && (
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Translation</div>
                    <div className={styles.sectionContent}>{word.translation?.text}</div>
                </div>
            )}

            {/* Root Word (if available) */}
            {(word as any).root && (
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Root</div>
                    <div className={styles.sectionContent}>
                        <span className={styles.rootWord}>{(word as any).root}</span>
                    </div>
                </div>
            )}

            {/* Word Position Info */}
            <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Verse:</span>
                    <span className={styles.metaValue}>{word.verse_key}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Position:</span>
                    <span className={styles.metaValue}>{word.position}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Page:</span>
                    <span className={styles.metaValue}>{word.page_number}</span>
                </div>
            </div>

            {/* Audio Pronunciation (future enhancement) */}
            {/* <div className={styles.audioSection}>
                <button className={styles.audioButton}>
                    🔊 Listen
                </button>
            </div> */}
        </div>
    );
};

export default WordStudyPanel;
