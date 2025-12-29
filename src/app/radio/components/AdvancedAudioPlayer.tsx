'use client';

/**
 * Advanced Audio Player Component
 * Web Audio API integration with equalizer and visualizations
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { audioBufferManager } from '../lib/audio-buffer-manager';
import { streamValidator } from '../lib/stream-validator';

export interface AudioEffect {
    type: 'equalizer' | 'speed' | 'pitch';
    values: number[];
}

export interface PlaybackState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    speed: number;
    buffered: number;
    loading: boolean;
}

interface AdvancedAudioPlayerProps {
    src: string;
    autoPlay?: boolean;
    onStateChange?: (state: PlaybackState) => void;
    onEnded?: () => void;
    onError?: (error: Error) => void;
    effects?: AudioEffect[];
    crossfadeDuration?: number;
}

export default function AdvancedAudioPlayer({
    src,
    autoPlay = false,
    onStateChange,
    onEnded,
    onError,
    effects = [],
    crossfadeDuration = 0,
}: AdvancedAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const analyserNodeRef = useRef<AnalyserNode | null>(null);
    const eq ualizerNodesRef = useRef<BiquadFilterNode[]>([]);
    const gainNodeRef = useRef<GainNode | null>(null);

    const [state, setState] = useState<PlaybackState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        speed: 1,
        buffered: 0,
        loading: true,
    });

    /**
     * Initialize Web Audio API
     */
    const initializeAudioContext = useCallback(() => {
        if (audioContextRef.current) return;

        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();

        if (!audioRef.current) return;

        // Create audio node chain
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        const analyser = audioContextRef.current.createAnalyser();
        const gainNode = audioContextRef.current.createGain();

        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;

        // Create 10-band equalizer
        const frequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        const equalizerNodes = frequencies.map(freq => {
            const filter = audioContextRef.current!.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            return filter;
        });

        // Connect nodes
        source.connect(equalizerNodes[0]);
        for (let i = 0; i < equalizerNodes.length - 1; i++) {
            equalizerNodes[i].connect(equalizerNodes[i + 1]);
        }
        equalizerNodes[equalizerNodes.length - 1].connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        sourceNodeRef.current = source;
        analyserNodeRef.current = analyser;
        equalizerNodesRef.current = equalizerNodes;
        gainNodeRef.current = gainNode;

        // Initialize buffer manager
        audioBufferManager.initialize(audioRef.current);
    }, []);

    /**
     * Apply audio effects
     */
    useEffect(() => {
        effects.forEach(effect => {
            if (effect.type === 'equalizer' && equalizerNodesRef.current.length > 0) {
                effect.values.forEach((value, index) => {
                    if (equalizerNodesRef.current[index]) {
                        equalizerNodesRef.current[index].gain.value = value;
                    }
                });
            }

            if (effect.type === 'speed' && audioRef.current) {
                audioRef.current.playbackRate = effect.values[0] || 1;
            }
        });
    }, [effects]);

    /**
     * Handle source changes with crossfade
     */
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        if (crossfadeDuration > 0 && state.isPlaying) {
            // Crossfade logic
            const fadeOut = () => {
                if (!gainNodeRef.current) return;

                const currentGain = gainNodeRef.current.gain.value;
                const fadeSteps = 20;
                const fadeInterval = (crossfadeDuration * 1000) / fadeSteps;
                let step = 0;

                const interval = setInterval(() => {
                    if (!gainNodeRef.current) {
                        clearInterval(interval);
                        return;
                    }

                    step++;
                    gainNodeRef.current.gain.value = currentGain * (1 - step / fadeSteps);

                    if (step >= fadeSteps) {
                        clearInterval(interval);
                        audio.src = src;
                        audio.load();
                        if (autoPlay) {
                            audio.play();
                        }
                        // Fade back in
                        fadeIn();
                    }
                }, fadeInterval);
            };

            const fadeIn = () => {
                if (!gainNodeRef.current) return;

                const fadeSteps = 20;
                const fadeInterval = (crossfadeDuration * 1000) / fadeSteps;
                let step = 0;

                const interval = setInterval(() => {
                    if (!gainNodeRef.current) {
                        clearInterval(interval);
                        return;
                    }

                    step++;
                    gainNodeRef.current.gain.value = state.volume * (step / fadeSteps);

                    if (step >= fadeSteps) {
                        clearInterval(interval);
                    }
                }, fadeInterval);
            };

            fadeOut();
        } else {
            audio.src = src;
            audio.load();
            if (autoPlay) {
                audio.play();
            }
        }
    }, [src]);

    /**
     * Setup event listeners
     */
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            updateState({
                currentTime: audio.currentTime,
                duration: audio.duration || 0,
            });
        };

        const handlePlay = () => {
            initializeAudioContext();
            updateState({ isPlaying: true, loading: false });
            streamValidator.monitorStream(src, audio);
        };

        const handlePause = () => {
            updateState({ isPlaying: false });
        };

        const handleEnded = () => {
            updateState({ isPlaying: false });
            onEnded?.();
        };

        const handleError = (e: Event) => {
            updateState({ loading: false, isPlaying: false });
            onError?.(new Error('Audio playback error'));
        };

        const handleLoadStart = () => {
            updateState({ loading: true });
        };

        const handleCanPlay = () => {
            updateState({ loading: false });
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [src, onEnded, onError]);

    const updateState = (updates: Partial<PlaybackState>) => {
        setState(prev => {
            const newState = { ...prev, ...updates };
            onStateChange?.(newState);
            return newState;
        });
    };

    /**
     * Playback controls
     */
    const play = useCallback(async () => {
        if (!audioRef.current) return;

        try {
            await audioRef.current.play();
        } catch (error) {
            console.error('Play error:', error);
            onError?.(error as Error);
        }
    }, [onError]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    }, []);

    const setVolume = useCallback((volume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
            if (gainNodeRef.current) {
                gainNodeRef.current.gain.value = volume;
            }
            updateState({ volume });
        }
    }, []);

    const setSpeed = useCallback((speed: number) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
            updateState({ speed });
        }
    }, []);

    /**
     * Get analyser for visualizations
     */
    const getAnalyser = useCallback(() => {
        return analyserNodeRef.current;
    }, []);

    /**
     * Get equalizer nodes for adjustment
     */
    const getEqualizerNodes = useCallback(() => {
        return equalizerNodesRef.current;
    }, []);

    // Expose controls via ref
    React.useImperativeHandle(
        audioRef,
        () => ({
            play,
            pause,
            seek,
            setVolume,
            setSpeed,
            getAnalyser,
            getEqualizerNodes,
            get currentTime() {
                return audioRef.current?.currentTime || 0;
            },
            get duration() {
                return audioRef.current?.duration || 0;
            },
            get paused() {
                return audioRef.current?.paused ?? true;
            },
        }),
        [play, pause, seek, setVolume, setSpeed, getAnalyser, getEqualizerNodes]
    );

    return (
        <audio
            ref={audioRef}
            crossOrigin="anonymous"
            preload="auto"
            style={{ display: 'none' }}
        />
    );
}

// Export controls interface for TypeScript
export interface AudioPlayerControls {
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setSpeed: (speed: number) => void;
    getAnalyser: () => AnalyserNode | null;
    getEqualizerNodes: () => BiquadFilterNode[];
    currentTime: number;
    duration: number;
    paused: boolean;
}
