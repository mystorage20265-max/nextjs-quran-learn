import React, { RefObject } from "react";
import { Track } from "@/data/quran-player-data";
import { Icons } from "./PlayerIcons";
import { SurahArt } from "./SurahArt";
import { ProgressBar } from "./ProgressBar";
import { VolumeBar } from "./VolumeBar";

interface BottomPlayerBarProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  currentTrack: Track | null;
  isPlaying: boolean;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  isShuffled: boolean;
  setIsShuffled: (s: boolean) => void;
  isRepeating: boolean;
  setIsRepeating: (r: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  showQueue: boolean;
  setShowQueue: (q: boolean | ((old: boolean) => boolean)) => void;
  isLiked: (id: number) => boolean;
  toggleLike: (id: number) => void;
  setShowNowPlaying: (s: boolean) => void;
  duration: number;
}

export function BottomPlayerBar({ 
  audioRef, currentTrack, isPlaying, togglePlay, playNext, playPrev,
  isShuffled, setIsShuffled, isRepeating, setIsRepeating,
  volume, setVolume, isMuted, setIsMuted,
  showQueue, setShowQueue, isLiked, toggleLike, setShowNowPlaying, duration
}: BottomPlayerBarProps) {
  
  return (
    <div className="sp-player-bar">
      {/* Left - Track Info */}
      <div className="sp-player-left">
        {currentTrack ? (
          <>
            <div className="sp-player-art" onClick={() => setShowNowPlaying(true)}>
              <SurahArt number={currentTrack.id} name={currentTrack.englishName} gradient={currentTrack.gradient} size="small" />
              <div className="sp-art-expand">
                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                  <path d="M6.53.47a.75.75 0 0 0-1.06 0L.97 5a.75.75 0 0 0 0 1.06l.02.02a.75.75 0 0 0 1.06 0L5 3.14V6.5a.75.75 0 0 0 1.5 0V1.25a.75.75 0 0 0-.22-.53L6.53.47zM9.47.47a.75.75 0 0 1 1.06 0L15.03 5a.75.75 0 0 1 0 1.06l-.02.02a.75.75 0 0 1-1.06 0L11 3.14V6.5a.75.75 0 0 1-1.5 0V1.25a.75.75 0 0 1 .22-.53L9.47.47z"/>
                </svg>
              </div>
            </div>
            <div className="sp-player-track-info">
              <div className="sp-player-track-name">{currentTrack.name}</div>
              <div className="sp-player-track-artist">{currentTrack.reciter}</div>
            </div>
            <button
              className={`sp-player-like-btn${currentTrack && isLiked(currentTrack.id) ? ' liked' : ''}`}
              onClick={() => currentTrack && toggleLike(currentTrack.id)}
              title="Save to liked"
              aria-label="Save to liked"
            >
              {currentTrack && isLiked(currentTrack.id) ? <Icons.HeartFilled /> : <Icons.Heart />}
            </button>
          </>
        ) : (
          <div style={{ opacity: 0.3, fontSize: 13, color: "var(--sp-text-secondary)" }}>
            Select a Surah to play
          </div>
        )}
      </div>

      {/* Center - Controls + Progress */}
      <div className="sp-player-center">
        <div className="sp-player-controls">
          <button
            className={`sp-control-btn${isShuffled ? ' active' : ''}`}
            onClick={() => setIsShuffled(!isShuffled)}
            title="Shuffle (S)" aria-label="Shuffle"
          >
            <Icons.Shuffle />
          </button>
          <button className="sp-control-btn" onClick={playPrev} title="Previous" aria-label="Previous">
            <Icons.SkipPrev />
          </button>
          <button className="sp-play-btn" onClick={togglePlay} title="Play/Pause (Space)" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Icons.Pause /> : <span className="play-icon"><Icons.Play /></span>}
          </button>
          <button className="sp-control-btn" onClick={playNext} title="Next (N)" aria-label="Next">
            <Icons.SkipNext />
          </button>
          <button
            className={`sp-control-btn${isRepeating ? ' active' : ''}`}
            onClick={() => setIsRepeating(!isRepeating)}
            title="Repeat" aria-label="Repeat"
          >
            <Icons.Repeat />
          </button>
        </div>
        
        {/* Pass the audioRef so ProgressBar can read currentTime independently */}
        <ProgressBar audioRef={audioRef} duration={duration} />
        
      </div>

      {/* Right - Volume + Extra */}
      <div className="sp-player-right">
        <button
          className={`sp-control-btn${showQueue ? ' active' : ''}`}
          onClick={() => setShowQueue(q => !q)}
          title="Queue" aria-label="Queue"
        >
          <Icons.Queue />
        </button>
        <div className="sp-volume-group">
          <button className="sp-volume-btn" onClick={() => setIsMuted(!isMuted)} title={isMuted ? 'Unmute (M)' : 'Mute (M)'} aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? <Icons.VolumeMute /> : <Icons.Volume2 />}
          </button>
          <VolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} />
        </div>
      </div>
    </div>
  );
}
