/**
 * TafsirPanel Component
 * Display verse commentary/explanation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { tafsirService, TAFSIR_SOURCES, TafsirText } from '../../utils/tafsirService';
import './TafsirPanel.scss';

interface TafsirPanelProps {
    isOpen: boolean;
    verseKey: string | null;
    onClose: () => void;
}

export function TafsirPanel({ isOpen, verseKey, onClose }: TafsirPanelProps) {
    const [tafsir, setTafsir] = useState<TafsirText | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && verseKey) {
            loadTafsir(verseKey);
        }
    }, [isOpen, verseKey]);

    const loadTafsir = async (key: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await tafsirService.fetchTafsir(key);
            setTafsir(data);
        } catch (err) {
            setError('Failed to load tafsir');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const changeSource = async (sourceId: number) => {
        const source = TAFSIR_SOURCES.find(s => s.id === sourceId);
        if (source && verseKey) {
            tafsirService.setSource(source);
            await loadTafsir(verseKey);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="tafsir-backdrop" onClick={onClose} />

            {/* Panel */}
            <div className="tafsir-panel">
                {/* Header */}
                <div className="tafsir-header">
                    <div className="tafsir-title">
                        <h2>📚 Tafsir</h2>
                        {verseKey && (
                            <span className="tafsir-verse">Verse {verseKey}</span>
                        )}
                    </div>
                    <button className="tafsir-close" onClick={onClose}>✕</button>
                </div>

                {/* Source Selector */}
                <div className="tafsir-source-selector">
                    <label>Select Tafsir Source:</label>
                    <select
                        value={tafsirService.getCurrentSource().id}
                        onChange={(e) => changeSource(Number(e.target.value))}
                        className="tafsir-select"
                        disabled={isLoading}
                    >
                        {TAFSIR_SOURCES.map(source => (
                            <option key={source.id} value={source.id}>
                                {source.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                <div className="tafsir-content">
                    {isLoading && (
                        <div className="tafsir-loading">
                            <div className="loading-spinner">⏳</div>
                            <p>Loading tafsir...</p>
                        </div>
                    )}

                    {error && (
                        <div className="tafsir-error">
                            <div className="error-icon">⚠️</div>
                            <p>{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && tafsir && (
                        <div className="tafsir-text">
                            <div
                                dangerouslySetInnerHTML={{ __html: tafsir.text }}
                                className="tafsir-html"
                            />
                            <div className="tafsir-meta">
                                Source: {tafsir.resourceName}
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && !tafsir && verseKey && (
                        <div className="tafsir-empty">
                            <p>No tafsir available for this verse</p>
                        </div>
                    )}

                    {!verseKey && (
                        <div className="tafsir-placeholder">
                            <div className="placeholder-icon">📖</div>
                            <p>Select a verse to view its tafsir</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
