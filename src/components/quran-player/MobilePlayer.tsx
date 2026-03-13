import React, { RefObject, useState, useEffect } from "react";
import { Track } from "@/data/quran-player-data";
import { Icons } from "./PlayerIcons";
import { SurahArt } from "./SurahArt";
import { ProgressBar } from "./ProgressBar";
import { VolumeBar } from "./VolumeBar";

interface MobilePlayerProps {
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
  isLiked: (id: number) => boolean;
  toggleLike: (id: number) => void;
  showNowPlaying: boolean;
  setShowNowPlaying: (s: boolean) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
  duration: number;
}

function MiniProgressBar({ audioRef, duration }: { audioRef: RefObject<HTMLAudioElement | null>, duration: number }) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const updateTime = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
      animationFrameId = requestAnimationFrame(updateTime);
    };
    updateTime();
    return () => cancelAnimationFrame(animationFrameId);
  }, [audioRef]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  return <div className="sp-mobile-player-progress" style={{ width: `${progressPercent}%` }} />;
}

export function MobilePlayer({
  currentTrack, isPlaying, togglePlay, playNext, playPrev,
  isShuffled, setIsShuffled, isRepeating, setIsRepeating,
  volume, setVolume, isMuted, setIsMuted,
  isLiked, toggleLike, showNowPlaying, setShowNowPlaying,
  audioRef, duration
}: MobilePlayerProps) {
  
  return (
    <>
      {/* ═══ MOBILE MINI PLAYER ═══ */}
      <div className="sp-mobile-player" onClick={() => currentTrack && setShowNowPlaying(true)}>
        {currentTrack ? (
          <>
            <MiniProgressBar audioRef={audioRef} duration={duration} />
            <div className="sp-mobile-player-art">
              <SurahArt number={currentTrack.id} name={currentTrack.englishName} gradient={currentTrack.gradient} size="small" />
            </div>
            <div className="sp-mobile-player-info">
              <div className="sp-mobile-player-name">{currentTrack.name}</div>
              <div className="sp-mobile-player-artist">{currentTrack.reciter}</div>
            </div>
            <div className="sp-mobile-player-controls">
              <button
                className={`sp-mobile-player-btn${currentTrack && isLiked(currentTrack.id) ? ' liked' : ''}`}
                onClick={e => { e.stopPropagation(); currentTrack && toggleLike(currentTrack.id); }}
                aria-label="Like"
              >
                {currentTrack && isLiked(currentTrack.id) ? <Icons.HeartFilled /> : <Icons.Heart />}
              </button>
              <button className="sp-mobile-player-btn" onClick={e => { e.stopPropagation(); togglePlay(); }}>
                {isPlaying
                  ? <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>
                  : <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/></svg>
                }
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: "0 16px", opacity: 0.4, fontSize: 13 }}>Select a Surah to play</div>
        )}
      </div>

      {/* ═══ NOW PLAYING OVERLAY (Full-screen) ═══ */}
      <div className={`sp-now-playing-overlay${showNowPlaying ? " active" : ""}`}>
        <button className="sp-now-playing-close" onClick={() => setShowNowPlaying(false)} aria-label="Close now playing">
          <Icons.Close />
        </button>
        {currentTrack && (
          <>
            <div className="sp-now-playing-art">
              <SurahArt number={currentTrack.id} name={currentTrack.englishName} gradient={currentTrack.gradient} />
            </div>
            <div className="sp-now-playing-info">
              <div className="sp-now-playing-title">{currentTrack.name}</div>
              <div className="sp-now-playing-artist">{currentTrack.reciter}</div>
            </div>

            {/* Progress */}
            <ProgressBar audioRef={audioRef} duration={duration} />

            {/* Controls */}
            <div className="sp-player-controls" style={{ marginTop: 24, gap: 16 }}>
              <button
                className={`sp-control-btn${isShuffled ? " active" : ""}`}
                onClick={() => setIsShuffled(!isShuffled)}
                style={{ position: "relative" }}
              >
                <Icons.Shuffle />
              </button>
              <button className="sp-control-btn" onClick={playPrev} style={{ width: 48, height: 48 }}>
                <Icons.SkipPrev />
              </button>
              <button className="sp-play-btn" onClick={togglePlay} style={{ width: 56, height: 56 }}>
                {isPlaying ? <Icons.Pause /> : <span className="play-icon"><Icons.Play /></span>}
              </button>
              <button className="sp-control-btn" onClick={playNext} style={{ width: 48, height: 48 }}>
                <Icons.SkipNext />
              </button>
              <button
                className={`sp-control-btn${isRepeating ? " active" : ""}`}
                onClick={() => setIsRepeating(!isRepeating)}
                style={{ position: "relative" }}
              >
                <Icons.Repeat />
              </button>
            </div>
            
            {/* Added Volume Controls for Mobile */}
            <div className="sp-volume-group" style={{ marginTop: 32, width: '100%', maxWidth: 400, justifyContent: 'center' }}>
              <button className="sp-volume-btn" onClick={() => setIsMuted(!isMuted)}>
                {isMuted || volume === 0 ? <Icons.VolumeMute /> : <Icons.Volume2 />}
              </button>
              <VolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
