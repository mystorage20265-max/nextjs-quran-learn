import React, { useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import classNames from 'classnames';
import GlyphWord from '../GlyphWord';
import WordStudyPanel from '../WordStudyPanel';
import { useIsFontLoaded } from '@/hooks/useIsFontLoaded';
import { GlyphWord as GlyphWordType } from '@/services/quranGlyphApi';
import { isPauseChar } from '@/types/Word';
import styles from './QuranWord.module.scss';
import { WaqfMark, WaqfDisplayStyle, WaqfColorScheme } from '@/components/Verse/WaqfMark';


export interface QuranWordProps {
    word: GlyphWordType;
    isHighlighted?: boolean;
    onWordClick?: (word: GlyphWordType) => void;
    showTooltip?: boolean;
}

/**
 * QuranWord Component
 * Interactive wrapper for GlyphWord with hover tooltips and click popovers
 * Based on Quran.com's word interaction pattern
 */
const QuranWord: React.FC<QuranWordProps> = ({
    word,
    isHighlighted = false,
    onWordClick,
    showTooltip = true,
}) => {
    const isFontLoaded = useIsFontLoaded(word.page_number);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const handleClick = () => {
        if (onWordClick) {
            onWordClick(word);
        }
        setPopoverOpen(true);
    };

    const hasTranslation = word.translation?.text;

    return (
        <Tooltip.Provider delayDuration={300}>
            <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Popover.Trigger asChild>
                            <div
                                role="button"
                                tabIndex={0}
                                data-word-location={`${word.verse_key}:${word.position}`}
                                className={classNames(styles.container, {
                                    [styles.highlightOnHover]: showTooltip,
                                    [styles.highlighted]: isHighlighted,
                                    [styles.additionalStopSignGap]: isPauseChar(word.char_type_name),
                                })}
                                onClick={handleClick}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleClick();
                                    }
                                }}
                            >
                                {/* Render WaqfMark for pause characters, GlyphWord for others */}
                                {isPauseChar(word.char_type_name) ? (
                                    <WaqfMark
                                        text={word.text_uthmani}
                                        font="uthmani"
                                        displayStyle={WaqfDisplayStyle.SUPERSCRIPT}
                                        colorScheme={WaqfColorScheme.DEFAULT}
                                        showTooltip={false}
                                        fontSize={0.7}
                                    />
                                ) : (
                                    <GlyphWord
                                        text_uthmani={word.text_uthmani}
                                        code_v1={word.code_v1}
                                        code_v2={word.code_v2}
                                        pageNumber={word.page_number}
                                        isFontLoaded={isFontLoaded}
                                    />
                                )}
                            </div>
                        </Popover.Trigger>
                    </Tooltip.Trigger>

                    {/* Tooltip - Shows on hover */}
                    {showTooltip && hasTranslation && (
                        <Tooltip.Portal>
                            <Tooltip.Content
                                className={styles.tooltipContent}
                                sideOffset={5}
                            >
                                {word.translation?.text}
                                <Tooltip.Arrow className={styles.tooltipArrow} />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    )}
                </Tooltip.Root>

                {/* Popover - Shows on click */}
                <Popover.Portal>
                    <Popover.Content
                        className={styles.popoverContent}
                        sideOffset={8}
                        align="center"
                    >
                        <WordStudyPanel
                            word={word}
                            onClose={() => setPopoverOpen(false)}
                        />
                        <Popover.Arrow className={styles.popoverArrow} />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </Tooltip.Provider>
    );
};

export default QuranWord;

