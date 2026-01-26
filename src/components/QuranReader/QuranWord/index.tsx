import React from 'react';
import classNames from 'classnames';
import GlyphWord from '../GlyphWord';
import { useIsFontLoaded } from '@/hooks/useIsFontLoaded';
import { GlyphWord as GlyphWordType } from '@/services/quranGlyphApi';
import styles from './QuranWord.module.scss';

export interface QuranWordProps {
    word: GlyphWordType;
    isHighlighted?: boolean;
    onWordClick?: (word: GlyphWordType) => void;
    showTooltip?: boolean;
}

/**
 * QuranWord Component
 * Interactive wrapper for GlyphWord with hover effects and click handling
 */
const QuranWord: React.FC<QuranWordProps> = ({
    word,
    isHighlighted = false,
    onWordClick,
    showTooltip = true,
}) => {
    const isFontLoaded = useIsFontLoaded(word.page_number);

    const handleClick = () => {
        if (onWordClick) {
            onWordClick(word);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            data-word-location={`${word.verse_key}:${word.position}`}
            className={classNames(styles.container, {
                [styles.highlightOnHover]: showTooltip,
                [styles.highlighted]: isHighlighted,
            })}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            title={showTooltip ? word.translation?.text : undefined}
        >
            <GlyphWord
                text_uthmani={word.text_uthmani}
                code_v1={word.code_v1}
                code_v2={word.code_v2}
                pageNumber={word.page_number}
                isFontLoaded={isFontLoaded}
            />
        </div>
    );
};

export default QuranWord;
