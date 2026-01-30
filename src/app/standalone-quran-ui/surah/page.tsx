'use client';

/**
 * Standalone Quran UI - Full Surah Reader Demo
 * Complete surah reading experience with navigation
 */

import React, { useState } from 'react';
import { QuranReader } from '../components/QuranReader/QuranReader';
import type { ThemeMode } from '../types';
import '../styles/tokens.scss';

export default function SurahReaderDemo() {
    const [theme, setTheme] = useState<ThemeMode>('dark');
    const [showTranslation, setShowTranslation] = useState(true);
    const [showWordByWord, setShowWordByWord] = useState(false);
    const [showTransliteration, setShowTransliteration] = useState(false);
    const [chapterId, setChapterId] = useState(1);

    return (
        <div className={`theme-${theme}`} style={{
            minHeight: '100vh',
            background: theme === 'dark' ? '#1a1a1a' :
                theme === 'light' ? '#ffffff' : '#f4f1ea',
        }}>
            {/* Controls Panel */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: theme === 'dark' ? '#1a1a1a' :
                    theme === 'light' ? '#ffffff' : '#f4f1ea',
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
                            📖 Full Surah Reader
                        </h1>
                        <p style={{
                            fontSize: '0.875rem',
                            color: theme === 'dark' ? '#b0b0b0' : '#666',
                            margin: '0.25rem 0 0 0',
                        }}>
                            Complete Quran reading experience with chapter navigation
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

                        {/* Chapter Selector */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                            }}>
                                📚 Select Surah
                            </label>
                            <select
                                value={chapterId}
                                onChange={(e) => setChapterId(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    fontSize: '0.875rem',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    background: theme === 'dark' ? '#2a2a2a' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#333',
                                    cursor: 'pointer',
                                }}
                            >
                                {Array.from({ length: 114 }, (_, i) => i + 1).map((num) => (
                                    <option key={num} value={num}>
                                        {num}. {getSurahName(num)}
                                    </option>
                                ))}
                            </select>
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
                                    Translation
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
                                        checked={showWordByWord}
                                        onChange={(e) => setShowWordByWord(e.target.checked)}
                                    />
                                    Word-by-Word
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
                                        checked={showTransliteration}
                                        onChange={(e) => setShowTransliteration(e.target.checked)}
                                    />
                                    Transliteration
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Reader */}
            <QuranReader
                chapterId={chapterId}
                theme={theme}
                showTranslation={showTranslation}
                showWordByWord={showWordByWord}
                showWordByWordTransliteration={showTransliteration}
            />
        </div>
    );
}

// Helper function to get surah names
function getSurahName(num: number): string {
    const names: { [key: number]: string } = {
        1: 'Al-Fatiha',
        2: 'Al-Baqarah',
        3: 'Ali \'Imran',
        4: 'An-Nisa',
        5: 'Al-Ma\'idah',
        6: 'Al-An\'am',
        7: 'Al-A\'raf',
        8: 'Al-Anfal',
        9: 'At-Tawbah',
        10: 'Yunus',
        11: 'Hud',
        12: 'Yusuf',
        13: 'Ar-Ra\'d',
        14: 'Ibrahim',
        15: 'Al-Hijr',
        16: 'An-Nahl',
        17: 'Al-Isra',
        18: 'Al-Kahf',
        19: 'Maryam',
        20: 'Ta-Ha',
        21: 'Al-Anbya',
        22: 'Al-Hajj',
        23: 'Al-Mu\'minun',
        24: 'An-Nur',
        25: 'Al-Furqan',
        26: 'Ash-Shu\'ara',
        27: 'An-Naml',
        28: 'Al-Qasas',
        29: 'Al-\'Ankabut',
        30: 'Ar-Rum',
        31: 'Luqman',
        32: 'As-Sajdah',
        33: 'Al-Ahzab',
        34: 'Saba',
        35: 'Fatir',
        36: 'Ya-Sin',
        37: 'As-Saffat',
        38: 'Sad',
        39: 'Az-Zumar',
        40: 'Ghafir',
        41: 'Fussilat',
        42: 'Ash-Shuraa',
        43: 'Az-Zukhruf',
        44: 'Ad-Dukhan',
        45: 'Al-Jathiyah',
        46: 'Al-Ahqaf',
        47: 'Muhammad',
        48: 'Al-Fath',
        49: 'Al-Hujurat',
        50: 'Qaf',
        51: 'Adh-Dhariyat',
        52: 'At-Tur',
        53: 'An-Najm',
        54: 'Al-Qamar',
        55: 'Ar-Rahman',
        56: 'Al-Waqi\'ah',
        57: 'Al-Hadid',
        58: 'Al-Mujadila',
        59: 'Al-Hashr',
        60: 'Al-Mumtahanah',
        61: 'As-Saf',
        62: 'Al-Jumu\'ah',
        63: 'Al-Munafiqun',
        64: 'At-Taghabun',
        65: 'At-Talaq',
        66: 'At-Tahrim',
        67: 'Al-Mulk',
        68: 'Al-Qalam',
        69: 'Al-Haqqah',
        70: 'Al-Ma\'arij',
        71: 'Nuh',
        72: 'Al-Jinn',
        73: 'Al-Muzzammil',
        74: 'Al-Muddaththir',
        75: 'Al-Qiyamah',
        76: 'Al-Insan',
        77: 'Al-Mursalat',
        78: 'An-Naba',
        79: 'An-Nazi\'at',
        80: 'Abasa',
        81: 'At-Takwir',
        82: 'Al-Infitar',
        83: 'Al-Mutaffifin',
        84: 'Al-Inshiqaq',
        85: 'Al-Buruj',
        86: 'At-Tariq',
        87: 'Al-A\'la',
        88: 'Al-Ghashiyah',
        89: 'Al-Fajr',
        90: 'Al-Balad',
        91: 'Ash-Shams',
        92: 'Al-Layl',
        93: 'Ad-Duhaa',
        94: 'Ash-Sharh',
        95: 'At-Tin',
        96: 'Al-Alaq',
        97: 'Al-Qadr',
        98: 'Al-Bayyinah',
        99: 'Az-Zalzalah',
        100: 'Al-\'Adiyat',
        101: 'Al-Qari\'ah',
        102: 'At-Takathur',
        103: 'Al-\'Asr',
        104: 'Al-Humazah',
        105: 'Al-Fil',
        106: 'Quraysh',
        107: 'Al-Ma\'un',
        108: 'Al-Kawthar',
        109: 'Al-Kafirun',
        110: 'An-Nasr',
        111: 'Al-Masad',
        112: 'Al-Ikhlas',
        113: 'Al-Falaq',
        114: 'An-Nas',
    };

    return names[num] || `Surah ${num}`;
}
