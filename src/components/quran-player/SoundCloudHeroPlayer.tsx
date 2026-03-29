import React, { useState, useEffect, RefObject } from 'react';
import { Track } from '@/data/quran-player-data';
import { Icons } from './PlayerIcons';
import './SoundCloudHeroPlayer.css';

interface Props {
  currentTrack: Track | null;
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  togglePlay: () => void;
}

export function SoundCloudHeroPlayer({
  currentTrack,
  audioRef,
  isPlaying,
  togglePlay
}: Props) {
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00");
  const [durationStr, setDurationStr] = useState("0:00");

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    let animationFrame: number;
    const update = () => {
      if (audioRef.current) {
        const audio = audioRef.current;
        if (audio.duration) {
          setProgress(audio.currentTime / audio.duration);
          setCurrentTimeStr(formatTime(audio.currentTime));
          setDurationStr(formatTime(audio.duration));
        }
      }
      animationFrame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animationFrame);
  }, [audioRef]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  };

  // Generate some static random heights for a pseudo waveform bar
  // We'll memoize 100 bars for the visual
  const [bars] = useState(() => {
    return Array.from({ length: 120 }, () => Math.max(0.1, Math.random()));
  });

  if (!currentTrack) return null;

  return (
    <div className="sc-hero-banner">
      {/* Background Gradient */}
      <div 
        className="sc-hero-bg" 
        style={{
          background: `transparent`
        }} 
      />

      <div className="sc-hero-content">
        <div className="sc-hero-left">
          {/* Header Info */}
          <div className="sc-hero-header">
            <button className="sc-hero-play-btn" onClick={togglePlay}>
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>
            <div className="sc-hero-titles">
              <div className="sc-title-pill">
                <span className="sc-title">{currentTrack.name}</span>
              </div>
              <div className="sc-artist-pill">
                <span className="sc-artist">{currentTrack.reciter}</span>
              </div>
              <div className="sc-album-pill">
                <span className="sc-album">In Surahs: {currentTrack.englishName}</span>
              </div>
            </div>
            
            <div className="sc-hero-meta">
              <span className="sc-meta-time">1 month ago</span>
              <span className="sc-meta-tag"># Quran</span>
            </div>
          </div>

          {/* Waveform Player */}
          <div className="sc-hero-waveform-container" onClick={handleSeek}>
            <div className="sc-time-current">{currentTimeStr}</div>
            <div className="sc-waveform">
              <div className="sc-waveform-base">
                {bars.map((h, i) => (
                  <div key={i} className="sc-bar" style={{ height: `${h * 100}%` }} />
                ))}
              </div>
              <div 
                className="sc-waveform-fill" 
                style={{ width: `${progress * 100}%` }}
              >
                {bars.map((h, i) => (
                  <div key={i} className="sc-bar fill" style={{ height: `${h * 100}%` }} />
                ))}
              </div>
            </div>
            <div className="sc-time-total">{durationStr}</div>
          </div>
        </div>

        {/* Huge Art Right */}
        <div className="sc-hero-right">
          <div className="sc-hero-art">
             <div className="sc-hero-art-gradient" style={{ background: currentTrack.gradient || 'var(--brand-primary)' }}>
                <span className="material-symbols-outlined sc-hero-art-icon" style={{ fontSize: 120, color: 'white', opacity: 0.9 }}>
                  auto_stories
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
