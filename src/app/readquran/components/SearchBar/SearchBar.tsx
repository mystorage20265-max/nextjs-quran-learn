/**
 * SearchBar Component
 * Quick verse search with keyboard shortcuts
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.scss';

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (verseKey: string) => void;
    chapters: Array<{ id: number; name: string; nameArabic: string; versesCount: number }>;
}

export function SearchBar({ isOpen, onClose, onSearch, chapters }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }

            if (isOpen && e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Generate suggestions
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        const suggestions: string[] = [];

        // Check if query matches verse format (e.g., "2:255" or "2 255")
        const verseMatch = query.match(/^(\d+)[:\s]+(\d+)$/);
        if (verseMatch) {
            const [, chapterStr, verseStr] = verseMatch;
            const chapterId = parseInt(chapterStr);
            const verseNum = parseInt(verseStr);

            const chapter = chapters.find(c => c.id === chapterId);
            if (chapter && verseNum <= chapter.versesCount) {
                suggestions.push(`${chapterId}:${verseNum}`);
            }
        }

        // Chapter name search
        const lowerQuery = query.toLowerCase();
        chapters.forEach(chapter => {
            if (
                chapter.name.toLowerCase().includes(lowerQuery) ||
                chapter.nameArabic.includes(query) ||
                chapter.id.toString() === query
            ) {
                suggestions.push(`${chapter.id}:1`);
            }
        });

        setSuggestions(suggestions.slice(0, 5));
        setSelectedIndex(0);
    }, [query, chapters]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (suggestions.length > 0) {
            onSearch(suggestions[selectedIndex]);
            onClose();
            setQuery('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        }
    };

    const getChapterInfo = (verseKey: string) => {
        const [chapterStr] = verseKey.split(':');
        const chapter = chapters.find(c => c.id === parseInt(chapterStr));
        return chapter;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="search-backdrop" onClick={onClose} />

            {/* Search Modal */}
            <div className="search-modal">
                <form onSubmit={handleSubmit}>
                    <div className="search-input-container">
                        <span className="search-icon">🔍</span>
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-input"
                            placeholder="Search by surah name or verse (e.g., 'Al-Baqarah', '2:255')"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <kbd className="search-kbd">Esc</kbd>
                    </div>
                </form>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="search-suggestions">
                        {suggestions.map((verseKey, index) => {
                            const chapter = getChapterInfo(verseKey);
                            const [chapterId, verseNum] = verseKey.split(':');

                            return (
                                <button
                                    key={verseKey}
                                    className={`search-suggestion ${index === selectedIndex ? 'active' : ''}`}
                                    onClick={() => {
                                        onSearch(verseKey);
                                        onClose();
                                        setQuery('');
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="suggestion-icon">📖</div>
                                    <div className="suggestion-content">
                                        <div className="suggestion-title">
                                            {chapter?.nameArabic} - {chapter?.name}
                                        </div>
                                        <div className="suggestion-meta">
                                            Surah {chapterId}, Ayah {verseNum}
                                        </div>
                                    </div>
                                    <div className="suggestion-arrow">→</div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Help Text */}
                {!query && (
                    <div className="search-help">
                        <div className="search-help-item">
                            <kbd>Ctrl</kbd> + <kbd>K</kbd> to open/close
                        </div>
                        <div className="search-help-item">
                            <kbd>↑</kbd> <kbd>↓</kbd> to navigate
                        </div>
                        <div className="search-help-item">
                            <kbd>Enter</kbd> to select
                        </div>
                    </div>
                )}

                {query && suggestions.length === 0 && (
                    <div className="search-empty">
                        No results found for "{query}"
                    </div>
                )}
            </div>
        </>
    );
}
