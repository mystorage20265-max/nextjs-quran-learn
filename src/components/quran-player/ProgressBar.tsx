import React, { useEffect, useState, RefObject } from "react";
import { formatTime } from "@/data/quran-player-data";

interface ProgressBarProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  duration: number;
}

export function ProgressBar({ audioRef, duration }: ProgressBarProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const updateTime = () => {
      // Because we update 60fps, we don't want to re-render if it's identical
      // But actually, just calling setCurrentTime with the same value is fine in React.
      if (audioRef.current && !isDragging) {
        setCurrentTime(audioRef.current.currentTime);
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };

    updateTime();

    return () => cancelAnimationFrame(animationFrameId);
  }, [audioRef, isDragging]);

  const calcPercent = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const pct = calcPercent(e.clientX, e.currentTarget);
    setDragTime(pct * duration);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const pct = calcPercent(e.clientX, e.currentTarget);
    setDragTime(pct * duration);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (audioRef.current && duration > 0) {
      const pct = calcPercent(e.clientX, e.currentTarget);
      const newTime = pct * duration;
      setCurrentTime(newTime);
      audioRef.current.currentTime = newTime;
    }
  };

  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div className="sp-progress-container" style={{ width: '100%', maxWidth: '100%' }}>
      <span className="sp-progress-time left">{formatTime(displayTime)}</span>
      <div 
        className="sp-progress-bar-wrapper" 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="sp-progress-bar">
          <div className="sp-progress-fill" style={{ width: `${progressPercent}%` }}>
            <div className="sp-progress-knob" />
          </div>
        </div>
      </div>
      <span className="sp-progress-time right">{formatTime(duration || 0)}</span>
    </div>
  );
}
