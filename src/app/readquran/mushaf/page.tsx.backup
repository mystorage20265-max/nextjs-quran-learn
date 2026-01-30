'use client';

/**
 * Standalone Quran UI - Mushaf Reading View Demo
 * Traditional Quran page-by-page reading experience
 */

import React from 'react';
import { MushafReadingView } from '../components/MushafReadingView/MushafReadingView';
import type { ThemeMode } from '../types';
import '../styles/tokens.scss';

export default function MushafDemo() {
    const theme: ThemeMode = 'dark';
    const showTranslation = true;
    const showNavigation = true;
    const initialPage = 1;

    return (
        <div className={`theme-${theme}`} style={{
            minHeight: '100vh',
            background: theme === 'dark' ? '#1a1a1a' :
                theme === 'light' ? '#ffffff' : '#f4f1ea',
        }}>

            {/* Main Mushaf Reader */}
            <div style={{ padding: '1rem 0' }}>
                <MushafReadingView
                    key={initialPage} // Force re-render when initialPage changes
                    initialPage={initialPage}
                    theme={theme}
                    showTranslation={showTranslation}
                    showNavigation={showNavigation}
                />
            </div>
        </div>
    );
}
