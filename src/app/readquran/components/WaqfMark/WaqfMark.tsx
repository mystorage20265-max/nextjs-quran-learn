/**
 * Standalone Quran UI - WaqfMark Component
 * Self-contained pause mark component with styling
 */

import React from 'react';
import { detectWaqfType, getWaqfColor, getWaqfDescription, classNames } from '../../utils';
import type { WaqfMarkProps } from '../../types';
import './WaqfMark.scss';

export const WaqfMark: React.FC<WaqfMarkProps> = ({
  text,
  type: providedType,
  className,
}) => {
  // Auto-detect type if not provided
  const waqfType = providedType ?? detectWaqfType(text);
  
  // Get color and description based on type
  const color = getWaqfColor(waqfType);
  const description = getWaqfDescription(waqfType);
  
  // Don't render if no pause mark detected
  if (!waqfType) return null;
  
  return (
    <span
      className={classNames(
        'waqf-mark',
        `waqf-mark--${waqfType}`,
        className
      )}
      style={{ color }}
      title={description}
      aria-label={description}
    >
      {text}
    </span>
  );
};

export default WaqfMark;
