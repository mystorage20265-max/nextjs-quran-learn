'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';

interface TafsirSectionProps {
    verseKey: string;
    content: string;
}

// Common Islamic/Quranic topic keywords for extraction
const TOPIC_KEYWORDS: { [key: string]: string } = {
    'prayer': '🕌 Prayer',
    'salah': '🕌 Salah',
    'zakat': '💰 Zakat',
    'fasting': '🌙 Fasting',
    'hajj': '🕋 Hajj',
    'jihad': '⚔️ Jihad',
    'patience': '🙏 Patience',
    'sabr': '🙏 Sabr',
    'tawbah': '🤲 Repentance',
    'repentance': '🤲 Repentance',
    'mercy': '💚 Mercy',
    'paradise': '🌴 Paradise',
    'jannah': '🌴 Jannah',
    'hell': '🔥 Hell',
    'jahannam': '🔥 Jahannam',
    'prophet': '📿 Prophet',
    'muhammad': '📿 Muhammad ﷺ',
    'allah': '☪️ Allah',
    'angels': '👼 Angels',
    'quran': '📖 Quran',
    'revelation': '✨ Revelation',
    'faith': '💎 Faith',
    'iman': '💎 Iman',
    'guidance': '🌟 Guidance',
    'hidayah': '🌟 Hidayah',
    'sin': '⚠️ Sin',
    'forgiveness': '🤗 Forgiveness',
    'judgment': '⚖️ Judgment',
    'day of judgment': '⚖️ Day of Judgment',
    'heaven': '🌴 Heaven',
    'worship': '🤲 Worship',
    'ibadah': '🤲 Ibadah',
    'righteous': '✅ Righteousness',
    'disbelief': '❌ Disbelief',
    'kufr': '❌ Kufr',
    'charity': '💝 Charity',
    'sadaqah': '💝 Sadaqah',
    'believers': '👥 Believers',
    'hypocrites': '🎭 Hypocrites',
    'munafiq': '🎭 Munafiqeen',
    'creation': '🌍 Creation',
    'tawhid': '☝️ Tawhid',
    'shirk': '🚫 Shirk',
    'dua': '🤲 Dua',
    'supplication': '🤲 Supplication',
};

interface UserNote {
    id: string;
    text: string;
    timestamp: number;
    highlightedText?: string;
}

/**
 * Advanced Interactive Tafsir Section
 * Features: TTS, Topics, Notes, Search, Progress, Font Size, Dark Mode, Share
 */
export default function TafsirSection({ verseKey, content }: TafsirSectionProps) {
    // Core State
    const [isExpanded, setIsExpanded] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);

    // TTS State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Notes State
    const [notes, setNotes] = useState<UserNote[]>([]);
    const [showNotes, setShowNotes] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [selectedText, setSelectedText] = useState('');

    // Refs
    const contentRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    // Load notes from localStorage
    useEffect(() => {
        const savedNotes = localStorage.getItem(`tafsir-notes-${verseKey}`);
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
    }, [verseKey]);

    // Save notes to localStorage
    const saveNotes = useCallback((newNotes: UserNote[]) => {
        setNotes(newNotes);
        localStorage.setItem(`tafsir-notes-${verseKey}`, JSON.stringify(newNotes));
    }, [verseKey]);

    // Strip HTML for text processing
    const strippedContent = useMemo(() => {
        return content
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();
    }, [content]);

    // Extract preview text
    const preview = useMemo(() => {
        if (strippedContent.length <= 180) return strippedContent;
        const cutoff = strippedContent.substring(0, 180).lastIndexOf(' ');
        return strippedContent.substring(0, cutoff > 100 ? cutoff : 180) + '...';
    }, [strippedContent]);

    // Reading time
    const readingTime = useMemo(() => {
        const wordCount = strippedContent.split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));
        return `${minutes} min`;
    }, [strippedContent]);

    // Extract key topics
    const keyTopics = useMemo(() => {
        const lowerContent = strippedContent.toLowerCase();
        const foundTopics: string[] = [];

        Object.entries(TOPIC_KEYWORDS).forEach(([keyword, label]) => {
            if (lowerContent.includes(keyword) && !foundTopics.includes(label)) {
                foundTopics.push(label);
            }
        });

        return foundTopics.slice(0, 5); // Max 5 topics
    }, [strippedContent]);

    // Search highlighting
    const highlightedContent = useMemo(() => {
        if (!searchQuery.trim()) return content;

        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return content.replace(regex, '<mark class="tafsir-search-highlight">$1</mark>');
    }, [content, searchQuery]);

    // Search match count
    const searchMatchCount = useMemo(() => {
        if (!searchQuery.trim()) return 0;
        const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        return (strippedContent.match(regex) || []).length;
    }, [strippedContent, searchQuery]);

    // Reading progress tracking
    useEffect(() => {
        if (!isExpanded || !contentRef.current) return;

        const handleScroll = () => {
            const element = contentRef.current;
            if (!element) return;

            const scrollTop = element.scrollTop;
            const scrollHeight = element.scrollHeight - element.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 100;
            setReadingProgress(Math.min(100, Math.max(0, progress)));
        };

        const element = contentRef.current;
        element.addEventListener('scroll', handleScroll);
        return () => element.removeEventListener('scroll', handleScroll);
    }, [isExpanded]);

    // Text-to-Speech functions
    const startSpeech = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(strippedContent);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.lang = 'en-US';

            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            speechRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
            setIsPaused(false);
        }
    }, [strippedContent]);

    const pauseSpeech = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, []);

    const resumeSpeech = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, []);

    const stopSpeech = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    }, []);

    // Handle text selection for quotes/notes
    const handleTextSelection = useCallback(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            setSelectedText(selection.toString().trim());
        }
    }, []);

    // Share selected quote
    const shareQuote = useCallback(async () => {
        const textToShare = selectedText || preview;
        const shareData = {
            title: `Tafsir - Verse ${verseKey}`,
            text: `"${textToShare}"\n\n— Tafsir of Quran ${verseKey}`,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or error
            }
        } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(shareData.text);
            alert('Quote copied to clipboard!');
        }
        setSelectedText('');
    }, [selectedText, preview, verseKey]);

    // Add note
    const addNote = useCallback(() => {
        if (!newNote.trim()) return;

        const note: UserNote = {
            id: Date.now().toString(),
            text: newNote.trim(),
            timestamp: Date.now(),
            highlightedText: selectedText || undefined,
        };

        saveNotes([...notes, note]);
        setNewNote('');
        setSelectedText('');
    }, [newNote, selectedText, notes, saveNotes]);

    // Delete note
    const deleteNote = useCallback((id: string) => {
        saveNotes(notes.filter(n => n.id !== id));
    }, [notes, saveNotes]);

    const isShortContent = strippedContent.length <= 200;

    return (
        <div className={`tafsir-section-advanced ${isDarkMode ? 'dark-mode' : ''}`} style={{ fontSize: `${fontSize}px` }}>
            {/* Header Bar */}
            <div className="tafsir-header-advanced">
                <div className="tafsir-header-left">
                    <span className="tafsir-icon">📖</span>
                    <span className="tafsir-title">Tafsir</span>
                    <span className="tafsir-reading-time">⏱️ {readingTime}</span>
                </div>

                {/* Quick Actions */}
                <div className="tafsir-quick-actions">
                    {/* TTS Button */}
                    <button
                        className={`tafsir-action-btn ${isSpeaking ? 'active' : ''}`}
                        onClick={isSpeaking ? (isPaused ? resumeSpeech : pauseSpeech) : startSpeech}
                        title={isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Read Aloud'}
                    >
                        {isSpeaking ? (isPaused ? '▶️' : '⏸️') : '🔊'}
                    </button>

                    {isSpeaking && (
                        <button className="tafsir-action-btn" onClick={stopSpeech} title="Stop">
                            ⏹️
                        </button>
                    )}

                    {/* Search Toggle */}
                    <button
                        className={`tafsir-action-btn ${showSearch ? 'active' : ''}`}
                        onClick={() => setShowSearch(!showSearch)}
                        title="Search"
                    >
                        🔍
                    </button>

                    {/* Font Controls */}
                    <button
                        className="tafsir-action-btn"
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                        title="Decrease Font"
                    >
                        A-
                    </button>
                    <button
                        className="tafsir-action-btn"
                        onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                        title="Increase Font"
                    >
                        A+
                    </button>

                    {/* Dark Mode */}
                    <button
                        className="tafsir-action-btn"
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>

                    {/* Notes Toggle */}
                    <button
                        className={`tafsir-action-btn ${showNotes ? 'active' : ''}`}
                        onClick={() => setShowNotes(!showNotes)}
                        title="Notes"
                    >
                        📝 {notes.length > 0 && <span className="note-count">{notes.length}</span>}
                    </button>

                    {/* Share */}
                    <button
                        className="tafsir-action-btn"
                        onClick={shareQuote}
                        title="Share Quote"
                    >
                        📤
                    </button>

                    {/* Expand/Collapse */}
                    {!isShortContent && (
                        <button
                            className={`tafsir-expand-btn ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? '▲' : '▼'}
                        </button>
                    )}
                </div>
            </div>

            {/* Key Topics Pills */}
            {keyTopics.length > 0 && (
                <div className="tafsir-topics">
                    {keyTopics.map((topic, i) => (
                        <span key={i} className="tafsir-topic-pill">{topic}</span>
                    ))}
                </div>
            )}

            {/* Search Bar */}
            {showSearch && (
                <div className="tafsir-search-bar">
                    <input
                        type="text"
                        placeholder="Search in Tafsir..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="tafsir-search-input"
                    />
                    {searchQuery && (
                        <span className="tafsir-search-count">
                            {searchMatchCount} match{searchMatchCount !== 1 ? 'es' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* Reading Progress Bar */}
            {isExpanded && (
                <div className="tafsir-progress-container">
                    <div
                        className="tafsir-progress-bar"
                        style={{ width: `${readingProgress}%` }}
                    />
                </div>
            )}

            {/* Notes Panel */}
            {showNotes && (
                <div className="tafsir-notes-panel">
                    <div className="tafsir-note-input-container">
                        {selectedText && (
                            <div className="tafsir-selected-quote">
                                "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
                            </div>
                        )}
                        <textarea
                            placeholder="Add your note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="tafsir-note-input"
                        />
                        <button onClick={addNote} className="tafsir-add-note-btn">
                            ➕ Add Note
                        </button>
                    </div>

                    {notes.length > 0 && (
                        <div className="tafsir-notes-list">
                            {notes.map(note => (
                                <div key={note.id} className="tafsir-note-item">
                                    {note.highlightedText && (
                                        <div className="tafsir-note-quote">"{note.highlightedText}"</div>
                                    )}
                                    <p>{note.text}</p>
                                    <div className="tafsir-note-meta">
                                        <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                                        <button onClick={() => deleteNote(note.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Preview - Collapsed State */}
            {!isExpanded && !isShortContent && (
                <div className="tafsir-preview" onClick={() => setIsExpanded(true)}>
                    <p style={{ fontSize: `${fontSize}px` }}>{preview}</p>
                    <div className="tafsir-preview-fade" />
                    <button className="tafsir-read-more-btn">
                        Read Full Tafsir →
                    </button>
                </div>
            )}

            {/* Full Content */}
            {(isExpanded || isShortContent) && (
                <div
                    ref={contentRef}
                    className={`tafsir-content-advanced ${isExpanded ? 'expanded' : ''}`}
                >
                    <div
                        ref={textRef}
                        className="tafsir-text"
                        style={{ fontSize: `${fontSize}px` }}
                        dangerouslySetInnerHTML={{ __html: highlightedContent }}
                        onMouseUp={handleTextSelection}
                    />

                    {/* Selection Tooltip */}
                    {selectedText && (
                        <div className="tafsir-selection-tooltip">
                            <button onClick={shareQuote}>📤 Share</button>
                            <button onClick={() => setShowNotes(true)}>📝 Add Note</button>
                        </div>
                    )}

                    {!isShortContent && (
                        <button
                            className="tafsir-collapse-btn"
                            onClick={() => {
                                setIsExpanded(false);
                                stopSpeech();
                            }}
                        >
                            ▲ Collapse Tafsir
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
