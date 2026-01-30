'use client';

/**
 * Standalone Quran UI Demo Page
 * Showcases the component library with interactive examples
 */

import React, { useState } from 'react';
import {
    VerseCard,
    useVerseState,
    useAudioPlayer,
    type Verse,
    type Word,
} from './index';
import './styles/tokens.scss';

export default function StandaloneQuranUIDemo() {
    const verseState = useVerseState({
        theme: 'dark',
        showTranslation: true,
        showWordByWord: false,
    });

    const audioPlayer = useAudioPlayer();
    const [activeExample, setActiveExample] = useState<'basic' | 'wordByWord' | 'interactive'>('basic');

    // Sample verse data (Al-Fatiha, Verse 1)
    const sampleVerse: Verse = {
        id: 1,
        verseNumber: 1,
        verseKey: '1:1',
        chapterId: 1,
        pageNumber: 1,
        hizbNumber: 1,
        juzNumber: 1,
        words: [
            {
                id: 1,
                position: 1,
                text: 'بِسۡمِ',
                translation: 'In the name',
                transliteration: 'Bismi',
                verseKey: '1:1',
                location: '1:1:1',
                charType: 'word' as any,
            },
            {
                id: 2,
                position: 2,
                text: 'ٱللَّهِ',
                translation: 'of Allah',
                transliteration: 'Allahi',
                verseKey: '1:1',
                location: '1:1:2',
                charType: 'word' as any,
            },
            {
                id: 3,
                position: 3,
                text: 'ٱلرَّحۡمَـٰنِ',
                translation: 'the Most Gracious',
                transliteration: 'Ar-Rahmani',
                verseKey: '1:1',
                location: '1:1:3',
                charType: 'word' as any,
            },
            {
                id: 4,
                position: 4,
                text: 'ٱلرَّحِيمِ',
                translation: 'the Most Merciful',
                transliteration: 'Ar-Rahimi',
                verseKey: '1:1',
                location: '1:1:4',
                charType: 'word' as any,
            },
        ],
        translations: [
            {
                id: 1,
                text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
                languageId: 1,
                languageName: 'English',
                resourceName: 'Sahih International',
            },
        ],
    };

    const handleWordClick = (word: Word) => {
        console.log('Word clicked:', word);
        verseState.highlightWord(word.location);

        if (word.audioUrl) {
            audioPlayer.playWord(word);
        }
    };

    const handleBookmarkToggle = (verseKey: string) => {
        verseState.toggleBookmark(verseKey);
    };

    const handlePlayClick = (verseKey: string) => {
        audioPlayer.play(verseKey, sampleVerse.audioUrl);
    };

    const isBookmarked = verseState.bookmarkedVerses.has(sampleVerse.verseKey);
    const isHighlighted = audioPlayer.currentVerseKey === sampleVerse.verseKey;

    return (
        <div className={`theme-${verseState.preferences.theme}`} style={{
            minHeight: '100vh',
            padding: '2rem',
            background: verseState.preferences.theme === 'dark' ? '#1a1a1a' :
                verseState.preferences.theme === 'light' ? '#ffffff' : '#f4f1ea'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                {/* Header */}
                <header style={{
                    marginBottom: '3rem',
                    textAlign: 'center',
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: verseState.preferences.theme === 'dark' ? '#ffffff' : '#1a1a1a',
                    }}>
                        Standalone Quran UI Component Library
                    </h1>
                    <p style={{
                        fontSize: '1.125rem',
                        color: verseState.preferences.theme === 'dark' ? '#b0b0b0' : '#666',
                        maxWidth: '700px',
                        margin: '0 auto',
                    }}>
                        A self-contained, modular component library for building beautiful Quran reading interfaces
                        with Word-by-Word translation support.
                    </p>
                </header>

                {/* Theme Switcher */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                }}>
                    <button
                        onClick={() => verseState.updatePreferences({ theme: 'dark' })}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: verseState.preferences.theme === 'dark' ? '2px solid #4a90e2' : '2px solid #ccc',
                            background: verseState.preferences.theme === 'dark' ? '#4a90e2' : '#fff',
                            color: verseState.preferences.theme === 'dark' ? '#fff' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        🌙 Dark Theme
                    </button>
                    <button
                        onClick={() => verseState.updatePreferences({ theme: 'light' })}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: verseState.preferences.theme === 'light' ? '2px solid #4a90e2' : '2px solid #ccc',
                            background: verseState.preferences.theme === 'light' ? '#4a90e2' : '#fff',
                            color: verseState.preferences.theme === 'light' ? '#fff' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        ☀️ Light Theme
                    </button>
                    <button
                        onClick={() => verseState.updatePreferences({ theme: 'sepia' })}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: verseState.preferences.theme === 'sepia' ? '2px solid #8b6f47' : '2px solid #ccc',
                            background: verseState.preferences.theme === 'sepia' ? '#8b6f47' : '#fff',
                            color: verseState.preferences.theme === 'sepia' ? '#fff' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        📜 Sepia Theme
                    </button>
                </div>

                {/* Example Selector */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                }}>
                    <button
                        onClick={() => setActiveExample('basic')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: activeExample === 'basic' ? '2px solid #10b981' : '2px solid #ccc',
                            background: activeExample === 'basic' ? '#10b981' : verseState.preferences.theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                            color: activeExample === 'basic' ? '#fff' : verseState.preferences.theme === 'dark' ? '#fff' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Basic Display
                    </button>
                    <button
                        onClick={() => setActiveExample('wordByWord')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: activeExample === 'wordByWord' ? '2px solid #10b981' : '2px solid #ccc',
                            background: activeExample === 'wordByWord' ? '#10b981' : verseState.preferences.theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                            color: activeExample === 'wordByWord' ? '#fff' : verseState.preferences.theme === 'dark' ? '#fff' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Word-by-Word
                    </button>
                    <button
                        onClick={() => setActiveExample('interactive')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: activeExample === 'interactive' ? '2px solid #10b981' : '2px solid #ccc',
                            background: activeExample === 'interactive' ? '#10b981' : verseState.preferences.theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                            color: activeExample === 'interactive' ? '#fff' : verseState.preferences.theme === 'dark' ? '#fff' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Interactive
                    </button>
                </div>

                {/* Example Description */}
                <div style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: verseState.preferences.theme === 'dark' ? '#2a2a2a' :
                        verseState.preferences.theme === 'light' ? '#f5f5f5' : '#e8e4d9',
                    border: '1px solid',
                    borderColor: verseState.preferences.theme === 'dark' ? '#3a3a3a' : '#ddd',
                }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: verseState.preferences.theme === 'dark' ? '#fff' : '#1a1a1a',
                    }}>
                        {activeExample === 'basic' && '📖 Basic Verse Display'}
                        {activeExample === 'wordByWord' && '🔤 Word-by-Word Translation'}
                        {activeExample === 'interactive' && '⚡ Interactive with State Management'}
                    </h3>
                    <p style={{
                        color: verseState.preferences.theme === 'dark' ? '#b0b0b0' : '#666',
                    }}>
                        {activeExample === 'basic' && 'Simple verse display with translation. Perfect for basic Quran reading interfaces.'}
                        {activeExample === 'wordByWord' && 'Shows translation and transliteration below each Arabic word. Great for learning and understanding.'}
                        {activeExample === 'interactive' && 'Full-featured with word clicking, bookmarking, and audio playback support.'}
                    </p>
                </div>

                {/* Demo Card */}
                <div style={{
                    marginBottom: '3rem',
                }}>
                    {activeExample === 'basic' && (
                        <VerseCard
                            verse={sampleVerse}
                            theme={verseState.preferences.theme}
                            showTranslation={true}
                            showWordByWord={false}
                        />
                    )}

                    {activeExample === 'wordByWord' && (
                        <VerseCard
                            verse={sampleVerse}
                            theme={verseState.preferences.theme}
                            showTranslation={true}
                            showWordByWord={true}
                            showWordByWordTransliteration={true}
                        />
                    )}

                    {activeExample === 'interactive' && (
                        <VerseCard
                            verse={sampleVerse}
                            theme={verseState.preferences.theme}
                            showTranslation={verseState.showTranslation}
                            showWordByWord={verseState.showWordByWord}
                            showWordByWordTransliteration={verseState.showWordByWordTransliteration}
                            isHighlighted={isHighlighted}
                            isBookmarked={isBookmarked}
                            onWordClick={handleWordClick}
                            onBookmarkToggle={handleBookmarkToggle}
                            onPlayClick={handlePlayClick}
                        />
                    )}
                </div>

                {/* Features Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem',
                }}>
                    {[
                        { icon: '🎨', title: 'Beautiful Design', desc: 'Three built-in themes: Dark, Light, and Sepia' },
                        { icon: '📱', title: 'Fully Responsive', desc: 'Works perfectly on mobile, tablet, and desktop' },
                        { icon: '♿', title: 'Accessible', desc: 'ARIA labels, keyboard navigation, and screen reader support' },
                        { icon: '⚡', title: 'TypeScript', desc: 'Full type safety and IntelliSense support' },
                        { icon: '🔊', title: 'Audio Support', desc: 'Verse and word-level audio playback' },
                        { icon: '📦', title: 'Self-Contained', desc: 'No external dependencies, copy-paste ready' },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '12px',
                                background: verseState.preferences.theme === 'dark' ? '#2a2a2a' :
                                    verseState.preferences.theme === 'light' ? '#fff' : '#e8e4d9',
                                border: '1px solid',
                                borderColor: verseState.preferences.theme === 'dark' ? '#3a3a3a' : '#ddd',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
                            <h4 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: verseState.preferences.theme === 'dark' ? '#fff' : '#1a1a1a',
                            }}>
                                {feature.title}
                            </h4>
                            <p style={{
                                fontSize: '0.875rem',
                                color: verseState.preferences.theme === 'dark' ? '#b0b0b0' : '#666',
                            }}>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <footer style={{
                    textAlign: 'center',
                    padding: '2rem 0',
                    borderTop: '1px solid',
                    borderColor: verseState.preferences.theme === 'dark' ? '#3a3a3a' : '#ddd',
                    color: verseState.preferences.theme === 'dark' ? '#b0b0b0' : '#666',
                }}>
                    <p style={{ marginBottom: '0.5rem' }}>
                        Built with ❤️ for the Muslim developer community
                    </p>
                    <p style={{ fontSize: '0.875rem' }}>
                        See <code>README.md</code> for complete documentation and usage examples
                    </p>
                </footer>
            </div>
        </div>
    );
}
