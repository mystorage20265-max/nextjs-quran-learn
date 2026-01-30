'use client';

/**
 * Standalone Quran UI - Mushaf Reading View Demo
 * Traditional Quran page-by-page reading experience
 */

import React, { useState } from 'react';
import { Scheherazade_New, Amiri_Quran } from 'next/font/google';
import { MushafReadingView } from '../components/MushafReadingView/MushafReadingView';
import type { ThemeMode } from '../types';
import '../styles/tokens.scss';
import '../../read-quran/styles/read-quran.css'; // Import CSS variables

// Load Arabic fonts
const scheherazade = Scheherazade_New({
    weight: ['400', '700'],
    subsets: ['arabic'],
    display: 'swap',
});

const amiri = Amiri_Quran({
    weight: '400',
    subsets: ['arabic'],
    display: 'swap',
});

export default function MushafDemo() {
    const [theme, setTheme] = useState<ThemeMode>('dark');
    const [showTranslation, setShowTranslation] = useState(true);
    const [showNavigation, setShowNavigation] = useState(true);
    const [initialPage, setInitialPage] = useState(1);

    return (
        <div className={`${scheherazade.className} theme-${theme}`} style={{
            minHeight: '100vh',
            background: theme === 'dark' ? '#1a1a1a' :
                theme === 'light' ? '#ffffff' : '#f4f1ea',
        }}>
            {/* Controls Panel */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: theme === 'dark' ? 'rgba(26, 26, 26, 0.98)' :
                    theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(244, 241, 234, 0.98)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid',
                borderColor: theme === 'dark' ? '#3a3a3a' : '#ddd',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}>
                    {/* Title */}
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            margin: 0,
                            color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                        }}>
                            📖 Mushaf Reading View
                        </h1>
                        <p style={{
                            fontSize: '0.875rem',
                            color: theme === 'dark' ? '#b0b0b0' : '#666',
                            margin: '0.25rem 0 0 0',
                        }}>
                            Traditional page-by-page Quran reading experience (604 pages)
                        </p>
                    </div>

                    {/* Controls Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                    }}>
                        {/* Theme Controls */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                            }}>
                                🎨 Theme
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setTheme('dark')}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '2px solid #4a90e2' : '1px solid #ccc',
                                        background: theme === 'dark' ? '#4a90e2' : '#f5f5f5',
                                        color: theme === 'dark' ? '#fff' : '#333',
                                        cursor: 'pointer',
                                    }}
                                >
                                    🌙
                                </button>
                                <button
                                    onClick={() => setTheme('light')}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        borderRadius: '6px',
                                        border: theme === 'light' ? '2px solid #4a90e2' : '1px solid #ccc',
                                        background: theme === 'light' ? '#4a90e2' : '#f5f5f5',
                                        color: theme === 'light' ? '#fff' : '#333',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ☀️
                                </button>
                                <button
                                    onClick={() => setTheme('sepia')}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        borderRadius: '6px',
                                        border: theme === 'sepia' ? '2px solid #8b6f47' : '1px solid #ccc',
                                        background: theme === 'sepia' ? '#8b6f47' : '#f5f5f5',
                                        color: theme === 'sepia' ? '#fff' : '#333',
                                        cursor: 'pointer',
                                    }}
                                >
                                    📜
                                </button>
                            </div>
                        </div>

                        {/* Quick Page Jump */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                            }}>
                                📄 Quick Jump
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setInitialPage(1)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        borderRadius: '6px',
                                        border: '1px solid #ccc',
                                        background: theme === 'dark' ? '#2a2a2a' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#333',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Page 1
                                </button>
                                <button
                                    onClick={() => setInitialPage(302)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        borderRadius: '6px',
                                        border: '1px solid #ccc',
                                        background: theme === 'dark' ? '#2a2a2a' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#333',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Juz 16
                                </button>
                                <button
                                    onClick={() => setInitialPage(582)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        borderRadius: '6px',
                                        border: '1px solid #ccc',
                                        background: theme === 'dark' ? '#2a2a2a' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#333',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Juz 30
                                </button>
                            </div>
                        </div>

                        {/* Display Options */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                            }}>
                                ⚙️ Display
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: theme === 'dark' ? '#b0b0b0' : '#666',
                                    cursor: 'pointer',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={showTranslation}
                                        onChange={(e) => setShowTranslation(e.target.checked)}
                                    />
                                    Show Translation
                                </label>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: theme === 'dark' ? '#b0b0b0' : '#666',
                                    cursor: 'pointer',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={showNavigation}
                                        onChange={(e) => setShowNavigation(e.target.checked)}
                                    />
                                    Show Navigation
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: theme === 'dark' ? 'rgba(74, 144, 226, 0.1)' :
                            theme === 'light' ? 'rgba(74, 144, 226, 0.05)' : 'rgba(139, 111, 71, 0.1)',
                        border: '1px solid',
                        borderColor: theme === 'dark' ? 'rgba(74, 144, 226, 0.3)' :
                            theme === 'light' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(139, 111, 71, 0.3)',
                        color: theme === 'dark' ? '#b0b0b0' : '#666',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                    }}>
                        💡 Use the navigation buttons at the bottom or enter a page number (1-604) to jump directly
                    </div>
                </div>
            </div>

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

            {/* Footer Info */}
            <div style={{
                maxWidth: '1200px',
                margin: '2rem auto',
                padding: '2rem 1rem',
                borderTop: '1px solid',
                borderColor: theme === 'dark' ? '#3a3a3a' : '#ddd',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {[
                        {
                            icon: '📖',
                            title: 'Traditional Layout',
                            desc: 'Read the Quran page-by-page as it appears in the physical Mushaf',
                        },
                        {
                            icon: '🔢',
                            title: '604 Pages',
                            desc: 'Complete Quran divided into traditional Mushaf pages',
                        },
                        {
                            icon: '🎯',
                            title: 'Easy Navigation',
                            desc: 'Jump to any page, Juz, or Surah with intuitive controls',
                        },
                        {
                            icon: '📱',
                            title: 'Responsive',
                            desc: 'Optimized reading experience on all devices',
                        },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '12px',
                                background: theme === 'dark' ? '#2a2a2a' :
                                    theme === 'light' ? '#fff' : '#e8e4d9',
                                border: '1px solid',
                                borderColor: theme === 'dark' ? '#3a3a3a' : '#ddd',
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
                            <h4 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                            }}>
                                {feature.title}
                            </h4>
                            <p style={{
                                fontSize: '0.875rem',
                                color: theme === 'dark' ? '#b0b0b0' : '#666',
                                margin: 0,
                            }}>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
