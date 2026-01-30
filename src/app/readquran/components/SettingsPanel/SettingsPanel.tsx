/**
 * SettingsPanel Component
 * Comprehensive settings for customizing the reading experience
 */

'use client';

import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import './SettingsPanel.scss';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const { preferences, updatePreferences } = useSettings();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="settings-backdrop" onClick={onClose} />

            {/* Panel */}
            <div className="settings-panel">
                {/* Header */}
                <div className="settings-header">
                    <h2>⚙️ Settings</h2>
                    <button className="settings-close" onClick={onClose}>✕</button>
                </div>

                {/* Content */}
                <div className="settings-content">
                    {/* Theme Section */}
                    <section className="settings-section">
                        <h3>🎨 Theme</h3>
                        <div className="settings-buttons">
                            <button
                                className={`settings-btn ${preferences.theme === 'dark' ? 'active' : ''}`}
                                onClick={() => updatePreferences({ theme: 'dark' })}
                            >
                                🌙 Dark
                            </button>
                            <button
                                className={`settings-btn ${preferences.theme === 'light' ? 'active' : ''}`}
                                onClick={() => updatePreferences({ theme: 'light' })}
                            >
                                ☀️ Light
                            </button>
                            <button
                                className={`settings-btn ${preferences.theme === 'sepia' ? 'active' : ''}`}
                                onClick={() => updatePreferences({ theme: 'sepia' })}
                            >
                                📜 Sepia
                            </button>
                        </div>
                    </section>

                    {/* Font Settings */}
                    <section className="settings-section">
                        <h3>🔤 Fonts</h3>

                        <div className="settings-item">
                            <label>Arabic Font</label>
                            <select
                                value={preferences.arabicFont}
                                onChange={(e) => updatePreferences({ arabicFont: e.target.value as any })}
                                className="settings-select"
                            >
                                <option value="scheherazade">Scheherazade New</option>
                                <option value="amiri">Amiri Quran</option>
                            </select>
                        </div>

                        <div className="settings-item">
                            <label>
                                Arabic Font Size: <strong>{preferences.arabicFontSize}px</strong>
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="48"
                                value={preferences.arabicFontSize}
                                onChange={(e) => updatePreferences({ arabicFontSize: Number(e.target.value) })}
                                className="settings-slider"
                            />
                        </div>

                        <div className="settings-item">
                            <label>
                                Translation Font Size: <strong>{preferences.translationFontSize}px</strong>
                            </label>
                            <input
                                type="range"
                                min="12"
                                max="24"
                                value={preferences.translationFontSize}
                                onChange={(e) => updatePreferences({ translationFontSize: Number(e.target.value) })}
                                className="settings-slider"
                            />
                        </div>
                    </section>

                    {/* Display Options */}
                    <section className="settings-section">
                        <h3>👁️ Display</h3>

                        <label className="settings-checkbox">
                            <input
                                type="checkbox"
                                checked={preferences.showTranslation}
                                onChange={(e) => updatePreferences({ showTranslation: e.target.checked })}
                            />
                            <span>Show Translation</span>
                        </label>

                        <label className="settings-checkbox">
                            <input
                                type="checkbox"
                                checked={preferences.showWordByWord}
                                onChange={(e) => updatePreferences({ showWordByWord: e.target.checked })}
                            />
                            <span>Show Word-by-Word</span>
                        </label>

                        <label className="settings-checkbox">
                            <input
                                type="checkbox"
                                checked={preferences.showTransliteration}
                                onChange={(e) => updatePreferences({ showTransliteration: e.target.checked })}
                            />
                            <span>Show Transliteration</span>
                        </label>

                        <label className="settings-checkbox">
                            <input
                                type="checkbox"
                                checked={preferences.autoScroll}
                                onChange={(e) => updatePreferences({ autoScroll: e.target.checked })}
                            />
                            <span>Auto-scroll during playback</span>
                        </label>
                    </section>

                    {/* Audio Settings */}
                    <section className="settings-section">
                        <h3>🔊 Audio</h3>

                        <div className="settings-item">
                            <label>
                                Playback Speed: <strong>{preferences.playbackSpeed}x</strong>
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.25"
                                value={preferences.playbackSpeed}
                                onChange={(e) => updatePreferences({ playbackSpeed: Number(e.target.value) })}
                                className="settings-slider"
                            />
                        </div>

                        <div className="settings-item">
                            <label>
                                Volume: <strong>{Math.round(preferences.volume * 100)}%</strong>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={preferences.volume}
                                onChange={(e) => updatePreferences({ volume: Number(e.target.value) })}
                                className="settings-slider"
                            />
                        </div>
                    </section>

                    {/* Translation Selection */}
                    <section className="settings-section">
                        <h3>📖 Translations</h3>
                        <p className="settings-note">
                            Currently using: Sahih International (131)
                        </p>
                        <p className="settings-note-small">
                            Multiple translation support coming soon!
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}
