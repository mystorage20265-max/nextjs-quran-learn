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
    // Removed: fontSize, isDarkMode, searchQuery, showSearch
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

    // Improved Content Preprocessing for Audio
    // 1. Replace block-level tags with periods to ensure pauses
    // 2. Cleaning up weird spacing
    const audioContent = useMemo(() => {
        return content
            .replace(/<\/p>/g, '. ')      // End of paragraph -> Pause
            .replace(/<\/div>/g, '. ')    // End of div -> Pause
            .replace(/<br\s*\/?>/g, ', ') // Line break -> Comma pause
            .replace(/<[^>]*>/g, '')      // Strip remaining tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')         // Collapse multiple spaces
            .replace(/\.\./g, '.')        // Fix double periods
            .trim();
    }, [content]);

    // Strip HTML for display/preview (standard stripping)
    const strippedContent = useMemo(() => {
        return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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

    // Text-to-Speech functions - PRODUCTION OPTIMIZED
    // 1. Selects the best available voice (neural/natural voices preferred)
    // 2. Removes Arabic text to avoid mispronunciation
    // 3. Optimized rate and pitch for clarity
    const startSpeech = useCallback(() => {
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech is not supported in this browser.');
            return;
        }

        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        // Clean the content for TTS:
        // - Remove Arabic/Urdu text (causes mispronunciation)
        // - Keep only Latin characters and basic punctuation
        const cleanedForSpeech = audioContent
            .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, '') // Remove Arabic
            .replace(/[\u0980-\u09FF]+/g, '') // Remove Bengali
            .replace(/[\u0900-\u097F]+/g, '') // Remove Hindi/Devanagari
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\.[\s.]+/g, '. ') // Fix multiple periods
            .trim();

        if (!cleanedForSpeech || cleanedForSpeech.length < 10) {
            alert('No speakable English text found in this Tafsir.');
            return;
        }

        // Find the best available English voice
        const getBestVoice = (): SpeechSynthesisVoice | null => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return null;

            const englishVoices = voices.filter(v => v.lang.startsWith('en'));
            if (englishVoices.length === 0) return voices[0]; // Use any voice if no English

            // Priority keywords for high-quality voices
            const priorityKeywords = ['natural', 'neural', 'enhanced', 'premium', 'google', 'microsoft'];

            for (const keyword of priorityKeywords) {
                const match = englishVoices.find(v =>
                    v.name.toLowerCase().includes(keyword)
                );
                if (match) return match;
            }

            // Fallback: prefer US English, then any English
            return englishVoices.find(v => v.lang === 'en-US') ||
                englishVoices[0];
        };

        // Create and configure utterance
        const utterance = new SpeechSynthesisUtterance(cleanedForSpeech);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to set the best voice
        const bestVoice = getBestVoice();
        if (bestVoice) {
            utterance.voice = bestVoice;
        }

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = (event) => {
            // 'interrupted' and 'canceled' are expected when user stops - not real errors
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
                console.warn('Speech synthesis error:', event.error);
            }
            setIsSpeaking(false);
            setIsPaused(false);
        };

        speechRef.current = utterance;

        // Speak immediately - voices are usually loaded by now
        // Small delay to ensure cancel() has completed
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);
    }, [audioContent]);

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

    // Share selected quote or Full Tafsir
    const shareQuote = useCallback(async () => {
        // Use selected text if available, otherwise use the FULL plain text content
        const textToShare = selectedText || strippedContent;

        // Construct the share link (anchor to verse)
        // Assuming path is /read-quran/[surahNumber]
        // This component doesn't know surah number, but we can try to grab current URL or rely on user to be on the right page
        const shareUrl = window.location.href.split('#')[0] + `#verse-${verseKey.split(':')[1]}`; // approximate

        const shareData = {
            title: `Tafsir - Verse ${verseKey}`,
            text: `"${textToShare.substring(0, 4000)}..."\n\n— Tafsir of Quran ${verseKey}`, // 4000 char limit safety
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or error
            }
        } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
            alert('Tafsir copied to clipboard!');
        }
        setSelectedText('');
    }, [selectedText, strippedContent, verseKey]);

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
        <div className="tafsir-section-advanced">
            {/* Header Bar */}
            <div className="tafsir-header-advanced">
                <div className="tafsir-header-left">
                    <span className="tafsir-icon">📖</span>
                    <span className="tafsir-title">Tafsir</span>
                    <span className="tafsir-reading-time">⏱️ {readingTime}</span>
                </div>

                {/* Quick Actions - Simplified & Mobile Responsive */}
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
                        title="Share Tafsir"
                    >
                        📤
                    </button>

                    {/* Expand/Collapse */}
                    {!isShortContent && (
                        <button
                            className={`tafsir-expand-btn ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => setIsExpanded(!isExpanded)}
                            title="Expand/Collapse"
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
                    <p>{preview}</p>
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
                        dangerouslySetInnerHTML={{ __html: content }}
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
