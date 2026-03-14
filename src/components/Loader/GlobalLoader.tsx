'use client';

import React from 'react';
import './GlobalLoader.css';

interface GlobalLoaderProps {
  loading?: boolean;
  inline?: boolean;
  className?: boolean;
}

/**
 * GlobalPremiumLoader - A standardized, premium loading component
 * Reuses the "QuranicLearn+" design from the Video Gallery.
 */
const GlobalLoader: React.FC<GlobalLoaderProps> = ({ 
  loading = true, 
  inline = false,
}) => {
  if (!loading && !inline) return null;

  const containerClass = inline 
    ? 'global-loader-inline' 
    : `global-loader-overlay ${!loading ? 'hidden' : ''}`;

  return (
    <div className={containerClass}>
      <div className="global-loader-logo">
        Quranic<span className="white">Learn</span>
        <span className="plus">+</span>
      </div>
      <div className="global-loader-bar">
        <div className="global-loader-bar-fill" />
      </div>
    </div>
  );
};

export default GlobalLoader;
