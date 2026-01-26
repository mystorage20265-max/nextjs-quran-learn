import React from 'react';
import classNames from 'classnames';
import styles from './ChapterHeader.module.scss';

export interface ChapterHeaderProps {
    chapterId: number;
    chapterName: string;
    chapterNameArabic: string;
    translatedName: string;
    versesCount: number;
    revelationPlace: 'makkah' | 'madinah';
    isReadingMode?: boolean;
    onPlayAll?: () => void;
    isPlaying?: boolean;
    showBismillah?: boolean;
}

/**
 * ChapterHeader Component
 * Displays chapter information, play button, and bismillah
 */
const ChapterHeader: React.FC<ChapterHeaderProps> = ({
    chapterId,
    chapterName,
    chapterNameArabic,
    translatedName,
    versesCount,
    revelationPlace,
    isReadingMode = false,
    onPlayAll,
    isPlaying = false,
    showBismillah = true,
}) => {
    return (
        <div className={styles.container}>
            {/* Top Controls */}
            <div className={styles.topControls}>
                <div className={styles.leftControls}>
                    {onPlayAll && (
                        <button
                            className={styles.playButton}
                            onClick={onPlayAll}
                            aria-label={isPlaying ? 'Pause' : 'Play chapter audio'}
                        >
                            <span className={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</span>
                            <span>{isPlaying ? 'Pause' : 'Listen'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Chapter Title */}
            <div className={styles.titleSection}>
                <h1 className={styles.arabicName}>{chapterNameArabic}</h1>
                <h2 className={styles.englishName}>{chapterName}</h2>
                <p className={styles.metadata}>
                    {translatedName} • {versesCount} Verses • {revelationPlace === 'makkah' ? 'Makki' : 'Madani'}
                </p>
            </div>

            {/* Bismillah Section */}
            {showBismillah && chapterId !== 1 && chapterId !== 9 && (
                <div className={styles.bismillahSection}>
                    <p className={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                </div>
            )}
        </div>
    );
};

export default ChapterHeader;
