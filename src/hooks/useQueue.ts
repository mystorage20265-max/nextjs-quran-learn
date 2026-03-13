import { useState, useCallback, useEffect } from "react";
import { Track } from "@/data/quran-player-data";

export function useQueue(initialTracks: Track[]) {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  // When tracks or shuffle state change, recalculate shuffle array
  useEffect(() => {
    if (isShuffled && tracks.length > 0) {
      // Fisher-Yates array shuffle
      const indices = tracks.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
    }
  }, [tracks, isShuffled]);

  const getNextTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return null;
    if (isShuffled && shuffledIndices.length === tracks.length) {
      const currentIndexInShuffle = shuffledIndices.findIndex(
        (i) => tracks[i].id === currentTrack.id
      );
      if (currentIndexInShuffle === -1) return tracks[shuffledIndices[0]];
      const nextIndex = (currentIndexInShuffle + 1) % shuffledIndices.length;
      return tracks[shuffledIndices[nextIndex]];
    } else {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      if (currentIndex === -1) return tracks[0];
      const nextIndex = (currentIndex + 1) % tracks.length;
      return tracks[nextIndex];
    }
  }, [currentTrack, tracks, isShuffled, shuffledIndices]);

  const getPrevTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return null;
    if (isShuffled && shuffledIndices.length === tracks.length) {
      const currentIndexInShuffle = shuffledIndices.findIndex(
        (i) => tracks[i].id === currentTrack.id
      );
      if (currentIndexInShuffle === -1) return tracks[shuffledIndices[0]];
      const prevIndex = (currentIndexInShuffle - 1 + shuffledIndices.length) % shuffledIndices.length;
      return tracks[shuffledIndices[prevIndex]];
    } else {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      if (currentIndex === -1) return tracks[0];
      const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
      return tracks[prevIndex];
    }
  }, [currentTrack, tracks, isShuffled, shuffledIndices]);
  
  const getQueueList = useCallback((limit: number = 20) => {
    if (!currentTrack || tracks.length === 0) return [];
    
    const upcoming: Track[] = [];
    if (isShuffled && shuffledIndices.length === tracks.length) {
      let currentIndexInShuffle = shuffledIndices.findIndex(
        (i) => tracks[i].id === currentTrack.id
      );
      if (currentIndexInShuffle === -1) currentIndexInShuffle = 0;
      
      for (let i = 1; i <= limit && i < shuffledIndices.length; i++) {
        const idx = (currentIndexInShuffle + i) % shuffledIndices.length;
        upcoming.push(tracks[shuffledIndices[idx]]);
      }
    } else {
      let currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      if (currentIndex === -1) currentIndex = 0;
      
      for (let i = 1; i <= limit && i < tracks.length; i++) {
        const idx = (currentIndex + i) % tracks.length;
        upcoming.push(tracks[idx]);
      }
    }
    return upcoming;
  }, [currentTrack, tracks, isShuffled, shuffledIndices]);

  return {
    tracks,
    setTracks,
    currentTrack,
    setCurrentTrack,
    isShuffled,
    setIsShuffled,
    isRepeating,
    setIsRepeating,
    getNextTrack,
    getPrevTrack,
    getQueueList
  };
}
