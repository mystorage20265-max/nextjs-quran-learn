import { useState, useEffect, useCallback, RefObject } from "react";

export function useAudioPlayer(audioRef: RefObject<HTMLAudioElement | null>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onDurationChange = () => { setDuration(audio.duration); setIsLoading(false); };
    const onPlay = () => { setIsPlaying(true); setIsLoading(false); setAudioError(null); };
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      setIsLoading(false); 
      setIsPlaying(false);
      setAudioError("Failed to load audio. Please try another reciter or surah.");
    };
    const onCanPlay = () => { setIsLoading(false); setAudioError(null); };
    const onWaiting = () => setIsLoading(true);

    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("waiting", onWaiting);

    return () => {
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("waiting", onWaiting);
    };
  }, [audioRef]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted, audioRef]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, audioRef]);

  const playUrl = useCallback(async (url: string) => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve();
    
    setAudioError(null);
    setIsLoading(true);
    
    audio.pause();
    audio.currentTime = 0;
    audio.src = url;
    audio.load();
    
    return new Promise<void>((resolve, reject) => {
      const onCanPlayThrough = async () => {
        audio.removeEventListener("canplaythrough", onCanPlayThrough);
        audio.removeEventListener("error", onErrorOnce);
        try {
          await audio.play();
          setIsLoading(false);
          resolve();
        } catch (err) {
          console.error("Play error:", err);
          setIsLoading(false);
          reject(err);
        }
      };

      const onErrorOnce = (e: Event) => {
        audio.removeEventListener("error", onErrorOnce);
        audio.removeEventListener("canplaythrough", onCanPlayThrough);
        setIsLoading(false);
        setIsPlaying(false);
        setAudioError("Failed to load audio.");
        reject(e);
      };

      audio.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
      audio.addEventListener("error", onErrorOnce, { once: true });
    });
  }, [audioRef]);

  return {
    isPlaying,
    duration,
    volume,
    isMuted,
    isLoading,
    audioError,
    togglePlay,
    playUrl,
    setVolume,
    setIsMuted,
    setAudioError
  };
}
