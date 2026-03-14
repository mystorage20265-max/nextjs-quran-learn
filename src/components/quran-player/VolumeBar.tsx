import React, { useState, useEffect } from "react";

interface VolumeBarProps {
  volume: number;
  isMuted: boolean;
  setVolume: (v: number) => void;
  setIsMuted: (m: boolean) => void;
}

export function VolumeBar({ volume, isMuted, setVolume, setIsMuted }: VolumeBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragVol, setDragVol] = useState(volume);

  useEffect(() => {
    if (!isDragging) setDragVol(volume);
  }, [volume, isDragging]);

  const calcPercent = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const pct = calcPercent(e.clientX, e.currentTarget);
    const newVol = Math.round(pct * 100);
    setDragVol(newVol);
    setVolume(newVol);
    setIsMuted(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const pct = calcPercent(e.clientX, e.currentTarget);
    const newVol = Math.round(pct * 100);
    setDragVol(newVol);
    setVolume(newVol);
    setIsMuted(false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const currentVol = isMuted ? 0 : dragVol;

  return (
    <div 
      className={`sp-volume-bar-wrapper ${isDragging ? 'dragging' : ''}`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="sp-volume-bar">
        <div className="sp-volume-fill" style={{ width: `${currentVol}%` }}>
          <div className="sp-volume-knob" />
        </div>
      </div>
    </div>
  );
}
