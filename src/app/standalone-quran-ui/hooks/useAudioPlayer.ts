/**
 * Standalone Quran UI - Audio Player Hook
 * Self-contained audio playback state management
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AudioState, AudioControls, Word } from '../types';

export interface UseAudioPlayerReturn extends AudioState, AudioControls {
  audioElement: HTMLAudioElement | null;
  isLoading: boolean;
  currentTime: number;
  duration: number;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);
  const [currentWordLocation, setCurrentWordLocation] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [volume, setVolumeState] = useState(1);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    // Event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentVerseKey(null);
      setCurrentWordLocation(null);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleError = (e) => {
      console.error('Audio playback error:', e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Play verse audio
  const play = useCallback((verseKey: string, url?: string | null) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    // If URL is provided and different from current, load new audio
    if (url && url !== audioUrl) {
      audio.src = url;
      setAudioUrl(url);
    }

    setCurrentVerseKey(verseKey);
    setCurrentWordLocation(null);

    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });
  }, [audioUrl]);

  // Pause audio
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  }, []);

  // Play word audio
  const playWord = useCallback((word: Word) => {
    if (!word.audioUrl) {
      console.warn('No audio URL for word:', word);
      return;
    }

    if (!audioRef.current) return;

    const audio = audioRef.current;

    // Load word audio
    if (word.audioUrl !== audioUrl) {
      audio.src = word.audioUrl;
      setAudioUrl(word.audioUrl);
    }

    setCurrentVerseKey(word.verseKey);
    setCurrentWordLocation(word.location);

    audio.play().catch((error) => {
      console.error('Failed to play word audio:', error);
    });
  }, [audioUrl]);

  // Seek to specific timestamp
  const seekTo = useCallback((timestamp: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = timestamp;
  }, []);

  // Set playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    if (!audioRef.current) return;
    const clampedRate = Math.max(0.5, Math.min(2, rate));
    audioRef.current.playbackRate = clampedRate;
    setPlaybackRateState(clampedRate);
  }, []);

  // Set volume
  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, vol));
    audioRef.current.volume = clampedVolume;
    setVolumeState(clampedVolume);
  }, []);

  return {
    // State
    isPlaying,
    isLoading,
    currentVerseKey,
    currentWordLocation,
    audioUrl,
    currentTime,
    duration,
    playbackRate,
    volume,
    audioElement: audioRef.current,

    // Controls
    play,
    pause,
    playWord,
    seekTo,
    setPlaybackRate,
    setVolume,
  };
}

/**
 * Hook for audio auto-scroll functionality
 */
export function useAudioAutoScroll(
  audioState: AudioState,
  enabled: boolean = true
) {
  const scrollElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !audioState.currentVerseKey) return;

    // Find the verse element to scroll to
    const verseElement = document.querySelector(
      `[data-verse-key="${audioState.currentVerseKey}"]`
    );

    if (!verseElement) return;

    // Scroll into view with smooth behavior
    verseElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    scrollElementRef.current = verseElement as HTMLElement;
  }, [audioState.currentVerseKey, enabled]);

  return scrollElementRef;
}
