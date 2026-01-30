/**
 * Standalone Quran UI - MushafLine Component
 * Renders a single line of Quran text in Mushaf layout
 */

import React from 'react';
import { CharType, type Word } from '../../types';
import './MushafLine.scss';

// ============================================================================
// TYPES
// ============================================================================

export interface MushafLineProps {
  words: Word[];
  lineKey: string;
  isHighlighted?: boolean;
  isCenterAligned?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MushafLine: React.FC<MushafLineProps> = ({
  words,
  lineKey,
  isHighlighted = false,
  isCenterAligned = false,
  className = '',
}) => {
  if (!words || words.length === 0) {
    return null;
  }

  // Get page/hizb data from first word for tracking
  const firstWord = words[0];
  const pageNumber = (firstWord as any).pageNumber || 1;
  const hizbNumber = (firstWord as any).hizbNumber;

  // Font Config for V2 - Use jsDelivr CDN with correct GitHub repo
  const paddedPageNumber = String(pageNumber).padStart(3, '0'); // Convert 1 to "001"
  const fontName = `QCF_P${paddedPageNumber}`;
  const fontUrl = `https://cdn.jsdelivr.net/gh/mustafa0x/qpc-fonts@master/mushaf-woff2/QCF_P${paddedPageNumber}.woff2`;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @font-face {
            font-family: '${fontName}';
            src: url('${fontUrl}') format('woff2');
            font-display: block;
          }
        `
      }} />
      <div
        id={lineKey}
        data-page={pageNumber}
        data-hizb={hizbNumber}
        className={`mushaf-line ${isHighlighted ? 'mushaf-line--highlighted' : ''} ${isCenterAligned ? 'mushaf-line--centered' : ''
          } ${className}`}
        dir="rtl"
      >
        <div className="mushaf-line__content">
          {words.map((word, idx) => {
            // 1. Handle Pause Marks
            if (word.charType === CharType.Pause) {
              return (
                <span
                  key={`${word.location}-${idx}`}
                  className="mushaf-line__word"
                  style={{ fontFamily: fontName }}
                >
                  {word.codeV1}
                </span>
              );
            }

            // 2. Handle Verse Ends
            if (word.charType === CharType.End) {
              return (
                <span
                  key={`${word.location}-${idx}`}
                  className="mushaf-line__verse-end"
                  data-location={word.location}
                >
                  {word.text}
                </span>
              );
            }

            // 3. Regular Words (Render V1 Glyph for QCF fonts)
            return (
              <React.Fragment key={`${word.location}-${idx}`}>
                <span
                  className="mushaf-line__word"
                  data-location={word.location}
                  style={{ fontFamily: fontName }}
                >
                  {word.codeV1}
                </span>
                {' '}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MushafLine;
