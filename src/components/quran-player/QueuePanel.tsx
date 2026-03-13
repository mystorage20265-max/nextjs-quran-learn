import React from "react";
import { Track } from "@/data/quran-player-data";
import { Icons } from "./PlayerIcons";
import { SurahArt } from "./SurahArt";

interface QueuePanelProps {
  showQueue: boolean;
  setShowQueue: (s: boolean) => void;
  currentTrack: Track | null;
  queueList: Track[];
  playTrack: (t: Track) => void;
}

export function QueuePanel({ showQueue, setShowQueue, currentTrack, queueList, playTrack }: QueuePanelProps) {
  if (!showQueue) return null;
  
  return (
    <div className="sp-queue-panel">
      <div className="sp-queue-header">
        <h3>Queue</h3>
        <button className="sp-queue-close" onClick={() => setShowQueue(false)} aria-label="Close queue"><Icons.Close /></button>
      </div>
      {currentTrack && (
        <div className="sp-queue-now">
          <div className="sp-queue-section-label">Now playing</div>
          <div className="sp-queue-item active">
            <div className="sp-queue-item-art">
              <SurahArt number={currentTrack.id} name={currentTrack.englishName} gradient={currentTrack.gradient} size="small" />
            </div>
            <div className="sp-queue-item-info">
              <div className="sp-queue-item-name">{currentTrack.name}</div>
              <div className="sp-queue-item-artist">{currentTrack.reciter}</div>
            </div>
            <span className="sp-queue-item-dur">{currentTrack.duration}</span>
          </div>
        </div>
      )}
      <div className="sp-queue-next">
        <div className="sp-queue-section-label">Next in queue</div>
        {queueList.map((track, idx) => (
          <div key={`${track.id}-${idx}`} className="sp-queue-item" onClick={() => { playTrack(track); setShowQueue(false); }}>
            <div className="sp-queue-item-art">
              <SurahArt number={track.id} name={track.englishName} gradient={track.gradient} size="small" />
            </div>
            <div className="sp-queue-item-info">
              <div className="sp-queue-item-name">{track.name}</div>
              <div className="sp-queue-item-artist">{track.reciter}</div>
            </div>
            <span className="sp-queue-item-dur">{track.duration}</span>
          </div>
        ))}
        {queueList.length === 0 && (
          <div style={{ padding: "16px", color: "var(--sp-text-secondary)", fontSize: "0.875rem" }}>
            Queue is empty
          </div>
        )}
      </div>
    </div>
  );
}
