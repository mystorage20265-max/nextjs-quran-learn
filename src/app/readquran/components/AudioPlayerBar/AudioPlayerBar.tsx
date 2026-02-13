/**
 * AudioPlayerBar Component
 * Sticky bottom audio player with full playback controls
 */

'use client';

import React from 'react';
import { useEnhancedAudio, RepeatMode } from '../../hooks/useEnhancedAudio';
import { RECITERS } from '../../utils/audioService';
import './AudioPlayerBar.scss';

interface AudioPlayerBarProps {
    visible: boolean;
    verseInfo?: {
        surahName: string;
        verseNumber: number;
    };
    onClose?: () => void;
}

export function AudioPlayerBar({ visible, verseInfo, onClose }: AudioPlayerBarProps) {
    const audio = useEnhancedAudio();

    if (!visible || !audio.currentVerseKey) return null;

    const formatTime = (seconds: number) => {
        if (!isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.seek(percent * audio.duration);
    };

    const progressPercent = audio.duration > 0
        ? (audio.currentTime / audio.duration) * 100
        : 0;

    const getRepeatIcon = () => {
        switch (audio.repeatMode) {
            case 'one': return '🔂';
            case 'all': return '🔁';
            default: return '↻';
        }
    };

    const cycleRepeat = () => {
        const modes: RepeatMode[] = ['off', 'one', 'all'];
        const currentIndex = modes.indexOf(audio.repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        audio.setRepeatMode(nextMode);
    };

    return (
        <div className={`audio-player-bar ${audio.isPlaying ? 'playing' : ''}`}>
            {/* Background Visualizer */}
            <div className="audio-visualizer">
                {[...Array(20)].map((_, i) => (
                    <span key={i} style={{ animationDelay: `${i * 0.05}s` }} />
                ))}
            </div>

            {/* Progress Bar */}
            <div
                className="player-progress"
                onClick={handleProgressClick}
                title={`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`}
            >
                <div
                    className="player-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Main Controls */}
            <div className="player-content">
                {/* Verse Info & Art */}
                <div className="player-info-container">
                    <div className="player-art">
                        <span className="art-icon">🕌</span>
                    </div>
                    <div className="player-info">
                        <div className="player-verse">{audio.currentVerseKey}</div>
                        {verseInfo && (
                            <div className="player-surah">
                                {verseInfo.surahName} - Ayah {verseInfo.verseNumber}
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="player-controls">
                    {/* Previous */}
                    <button
                        className="player-btn secondary"
                        onClick={audio.playPrevious}
                        disabled={audio.playlist.length === 0}
                        title="Previous"
                    >
                        ⏮
                    </button>

                    {/* Play/Pause */}
                    <button
                        className="player-btn primary"
                        onClick={audio.toggle}
                        disabled={audio.isLoading}
                        title={audio.isPlaying ? 'Pause' : 'Play'}
                    >
                        {audio.isLoading ? '⏳' : audio.isPlaying ? '⏸' : '▶️'}
                    </button>

                    {/* Next */}
                    <button
                        className="player-btn secondary"
                        onClick={audio.playNext}
                        disabled={audio.playlist.length === 0}
                        title="Next"
                    >
                        ⏭
                    </button>

                    {/* Repeat */}
                    <button
                        className={`player-btn secondary ${audio.repeatMode !== 'off' ? 'active' : ''}`}
                        onClick={cycleRepeat}
                        title={`Repeat: ${audio.repeatMode}`}
                    >
                        {getRepeatIcon()}
                    </button>
                </div>

                {/* Extended Controls */}
                <div className="player-extended">
                    {/* Time */}
                    <div className="player-time">
                        {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
                    </div>

                    {/* Speed */}
                    <select
                        className="player-select"
                        value={audio.playbackSpeed}
                        onChange={(e) => audio.setPlaybackSpeed(Number(e.target.value))}
                        title="Playback Speed"
                    >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>

                    {/* Reciter */}
                    <select
                        className="player-select"
                        value={audio.currentReciter.id}
                        onChange={(e) => {
                            const reciter = RECITERS.find(r => r.id === Number(e.target.value));
                            if (reciter) audio.setReciter(reciter);
                        }}
                        title="Reciter"
                    >
                        {RECITERS.map(reciter => (
                            <option key={reciter.id} value={reciter.id}>
                                {reciter.name}
                            </option>
                        ))}
                    </select>

                    {/* Volume */}
                    <div className="player-volume">
                        <button
                            className="player-btn secondary small"
                            onClick={() => audio.setVolume(audio.volume === 0 ? 0.8 : 0)}
                            title={audio.volume === 0 ? 'Unmute' : 'Mute'}
                        >
                            {audio.volume === 0 ? '🔇' : audio.volume < 0.5 ? '🔉' : '🔊'}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={audio.volume}
                            onChange={(e) => audio.setVolume(Number(e.target.value))}
                            className="volume-slider"
                            title={`Volume: ${Math.round(audio.volume * 100)}%`}
                        />
                    </div>

                    {/* Close */}
                    {onClose && (
                        <button
                            className="player-btn secondary small"
                            onClick={onClose}
                            title="Close Player"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {audio.error && (
                <div className="player-error">
                    ⚠️ {audio.error}
                </div>
            )}
        </div>
    );
}
