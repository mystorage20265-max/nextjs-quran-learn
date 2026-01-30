/**
 * Enhanced Audio Player Hook
 * Advanced audio playback with playlist management, continuous play, and more
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { audioService, Reciter, RECITERS } from '../utils/audioService';

export type RepeatMode = 'off' | 'one' | 'all';

interface UseEnhancedAudioReturn {
    // State
    isPlaying: boolean;
    currentVerseKey: string | null;
    currentTime: number;
    duration: number;
    volume: number;
    playbackSpeed: number;
    repeatMode: RepeatMode;
    currentReciter: Reciter;
    isLoading: boolean;
    error: string | null;
    playlist: string[];
    currentIndex: number;

    // Controls
    play: (verseKey: string, audioUrl?: string) => void;
    pause: () => void;
    toggle: () => void;
    stop: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setPlaybackSpeed: (speed: number) => void;
    setRepeatMode: (mode: RepeatMode) => void;
    setReciter: (reciter: Reciter) => void;

    // Playlist
    setPlaylist: (verseKeys: string[]) => void;
    playNext: () => void;
    playPrevious: () => void;
    playAtIndex: (index: number) => void;

    // Word audio
    playWord: (audioUrl: string) => void;
}

export function useEnhancedAudio(): UseEnhancedAudioReturn {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const wordAudioRef = useRef<HTMLAudioElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.8);
    const [playbackSpeed, setPlaybackSpeedState] = useState(1);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [currentReciter, setCurrentReciterState] = useState<Reciter>(RECITERS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playlist, setPlaylistState] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        wordAudioRef.current = new Audio();

        // Configure audio elements for cross-origin requests
        if (audioRef.current) {
            audioRef.current.crossOrigin = 'anonymous';
            audioRef.current.preload = 'auto';
        }
        if (wordAudioRef.current) {
            wordAudioRef.current.crossOrigin = 'anonymous';
        }

        // Initialize audioService with default reciter
        audioService.setReciter(RECITERS[0]);
        console.log('Audio service initialized with reciter:', RECITERS[0].name);

        const audio = audioRef.current;

        // Event listeners
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => handleAudioEnded();
        const handleCanPlay = () => setIsLoading(false);
        const handleLoadStart = () => setIsLoading(true);
        const handleError = (e: Event) => {
            const audioElement = e.target as HTMLAudioElement;
            const errorDetails = audioElement.error;
            let errorMessage = 'Failed to load audio';

            if (errorDetails) {
                switch (errorDetails.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                        errorMessage = 'Audio loading aborted';
                        break;
                    case MediaError.MEDIA_ERR_NETWORK:
                        errorMessage = 'Network error while loading audio';
                        break;
                    case MediaError.MEDIA_ERR_DECODE:
                        errorMessage = 'Audio decoding error';
                        break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMessage = 'Audio format not supported';
                        break;
                }
                if (errorDetails.message) {
                    errorMessage += `: ${errorDetails.message}`;
                }
            }

            console.error('Audio error:', errorMessage, 'URL:', audioElement.src);
            setError(errorMessage);
            setIsLoading(false);
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('error', handleError);
            audio.pause();
            wordAudioRef.current?.pause();
        };
    }, []);

    // Handle audio end - needs to be defined after playNext
    const handleAudioEnded = useCallback(() => {
        if (repeatMode === 'one') {
            audioRef.current?.play();
        } else if (repeatMode === 'all' && playlist.length > 0) {
            // Play next verse in playlist
            const nextIndex = (currentIndex + 1) % playlist.length;
            setCurrentIndex(nextIndex);
            const [chapterStr, verseStr] = playlist[nextIndex].split(':');
            const chapterId = parseInt(chapterStr);
            const verseNumber = parseInt(verseStr);
            const url = audioService.getVerseAudioUrl(chapterId, verseNumber);

            const audio = audioRef.current;
            if (audio) {
                audio.src = url;
                audio.load();
                audio.play().catch(err => console.error('Auto-play error:', err));
            }
        } else {
            setIsPlaying(false);
        }
    }, [repeatMode, playlist, currentIndex]);

    // Play audio
    const play = useCallback((verseKey: string, audioUrl?: string) => {
        const audio = audioRef.current;
        if (!audio) {
            console.error('Audio element not initialized');
            return;
        }

        setError(null);
        setCurrentVerseKey(verseKey);

        // Parse verse key to get chapter and verse numbers
        const [chapterStr, verseStr] = verseKey.split(':');
        const chapterId = parseInt(chapterStr);
        const verseNumber = parseInt(verseStr);

        // Generate audio URL
        const url = audioUrl || audioService.getVerseAudioUrl(chapterId, verseNumber);

        console.log('Playing audio:', {
            verseKey,
            chapterId,
            verseNumber,
            url,
            reciter: audioService.getCurrentReciter().name
        });

        if (audio.src !== url) {
            audio.src = url;
            audio.load();
        }

        audio.play()
            .then(() => {
                console.log('Audio playback started successfully');
                setIsPlaying(true);
            })
            .catch(err => {
                console.error('Playback error:', err);
                setError('Failed to play audio');
                setIsPlaying(false);
            });
    }, []);

    // Pause audio
    const pause = useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    // Toggle play/pause
    const toggle = useCallback(() => {
        if (isPlaying) {
            pause();
        } else if (currentVerseKey) {
            audioRef.current?.play();
            setIsPlaying(true);
        }
    }, [isPlaying, currentVerseKey, pause]);

    // Stop audio
    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setCurrentVerseKey(null);
    }, []);

    // Seek to time
    const seek = useCallback((time: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = Math.max(0, Math.min(time, audio.duration));
    }, []);

    // Set volume
    const setVolume = useCallback((vol: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        const clampedVolume = Math.max(0, Math.min(1, vol));
        audio.volume = clampedVolume;
        setVolumeState(clampedVolume);
    }, []);

    // Set playback speed
    const setPlaybackSpeed = useCallback((speed: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        const clampedSpeed = Math.max(0.5, Math.min(2, speed));
        audio.playbackRate = clampedSpeed;
        setPlaybackSpeedState(clampedSpeed);
    }, []);

    // Set reciter
    const setReciter = useCallback((reciter: Reciter) => {
        audioService.setReciter(reciter);
        setCurrentReciterState(reciter);

        // If currently playing, reload with new reciter
        if (currentVerseKey && isPlaying) {
            const wasPlaying = isPlaying;
            pause();
            if (wasPlaying) {
                setTimeout(() => play(currentVerseKey), 100);
            }
        }
    }, [currentVerseKey, isPlaying, pause, play]);

    // Set playlist
    const setPlaylist = useCallback((verseKeys: string[]) => {
        setPlaylistState(verseKeys);
        setCurrentIndex(0);
    }, []);

    // Play next in playlist
    const playNext = useCallback(() => {
        if (playlist.length === 0) return;

        const nextIndex = (currentIndex + 1) % playlist.length;
        setCurrentIndex(nextIndex);
        play(playlist[nextIndex]);
    }, [playlist, currentIndex, play]);

    // Play previous in playlist
    const playPrevious = useCallback(() => {
        if (playlist.length === 0) return;

        const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
        setCurrentIndex(prevIndex);
        play(playlist[prevIndex]);
    }, [playlist, currentIndex, play]);

    // Play at specific index
    const playAtIndex = useCallback((index: number) => {
        if (index < 0 || index >= playlist.length) return;

        setCurrentIndex(index);
        play(playlist[index]);
    }, [playlist, play]);

    // Play word audio
    const playWord = useCallback((audioUrl: string) => {
        const wordAudio = wordAudioRef.current;
        if (!wordAudio) return;

        wordAudio.src = audioUrl;
        wordAudio.play().catch(err => console.error('Word audio error:', err));
    }, []);

    // Update volume and speed when they change
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [volume, playbackSpeed]);

    return {
        isPlaying,
        currentVerseKey,
        currentTime,
        duration,
        volume,
        playbackSpeed,
        repeatMode,
        currentReciter,
        isLoading,
        error,
        playlist,
        currentIndex,
        play,
        pause,
        toggle,
        stop,
        seek,
        setVolume,
        setPlaybackSpeed,
        setRepeatMode,
        setReciter,
        setPlaylist,
        playNext,
        playPrevious,
        playAtIndex,
        playWord,
    };
}
