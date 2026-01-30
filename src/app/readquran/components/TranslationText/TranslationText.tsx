/**
 * Standalone Quran UI - TranslationText Component
 * Self-contained translation display component
 */

import React from 'react';
import { classNames } from '../../utils';
import type { TranslationTextProps } from '../../types';
import './TranslationText.scss';

export const TranslationText: React.FC<TranslationTextProps> = ({
  translation,
  fontSize = 16,
  showResourceName = true,
  className,
}) => {
  return (
    <div className={classNames('translation-text', className)}>
      <div
        className="translation-text__content"
        style={{ fontSize: `${fontSize}px` }}
        lang={translation.languageName?.toLowerCase()}
      >
        {translation.text}
      </div>
      
      {showResourceName && translation.resourceName && (
        <div className="translation-text__source">
          — {translation.resourceName}
        </div>
      )}
    </div>
  );
};

export default TranslationText;
