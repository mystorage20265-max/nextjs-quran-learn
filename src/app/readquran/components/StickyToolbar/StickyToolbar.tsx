/**
 * StickyToolbar Component
 * Quick access toolbar for common actions
 */

'use client';

import React from 'react';
import './StickyToolbar.scss';

interface StickyToolbarProps {
    onSearchClick: () => void;
    onSettingsClick: () => void;
    onBookmarksClick: () => void;
    theme: 'dark' | 'light' | 'sepia';
    onThemeChange: (theme: 'dark' | 'light' | 'sepia') => void;
}

export function StickyToolbar({
    onSearchClick,
    onSettingsClick,
    onBookmarksClick,
    theme,
    onThemeChange,
}: StickyToolbarProps) {
    return (
        <div className="sticky-toolbar">
            {/* Search */}
            <button
                className="toolbar-btn"
                onClick={onSearchClick}
                title="Search (Ctrl+K)"
            >
                🔍
            </button>

            {/* Bookmarks */}
            <button
                className="toolbar-btn"
                onClick={onBookmarksClick}
                title="Bookmarks"
            >
                🔖
            </button>

            {/* Theme Toggle */}
            <div className="theme-toggle">
                <button
                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => onThemeChange('dark')}
                    title="Dark Theme"
                >
                    🌙
                </button>
                <button
                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => onThemeChange('light')}
                    title="Light Theme"
                >
                    ☀️
                </button>
                <button
                    className={`theme-btn ${theme === 'sepia' ? 'active' : ''}`}
                    onClick={() => onThemeChange('sepia')}
                    title="Sepia Theme"
                >
                    📜
                </button>
            </div>

            {/* Settings */}
            <button
                className="toolbar-btn"
                onClick={onSettingsClick}
                title="Settings"
            >
                ⚙️
            </button>
        </div>
    );
}
