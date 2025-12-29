'use client';

import React, { useState, useCallback } from 'react';

export type PlaylistTrack = {
  url: string;
  surahId: number;
  reciterId: number;
};

export type PlayerState = {
  isPlaying: boolean;
  currentStationId: string | null;
  currentTrackIndex: number;
  currentTime: number;
  playlist: PlaylistTrack[];
  loop: boolean;
  shuffle: boolean;
  quality: "high" | "low";
};

export type PlayerActions = {
  setStation: (stationId: string) => void;
  play: () => void;
  pause: () => void;
  setTrackIndex: (index: number) => void;
  setCurrentTime: (time: number) => void;
  setPlaylist: (tracks: PlaylistTrack[]) => void;
  setIsPlaying: (value: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setQuality: (q: "high" | "low") => void;
};

type PlayerContextValue = {
  state: PlayerState;
  actions: PlayerActions;
};

export const PlayerContext = React.createContext<PlayerContextValue | null>(null);

interface PlayerProviderProps {
  children: React.ReactNode;
}

// Helper to check if a next track exists
export function hasNextTrack(state: PlayerState): boolean {
  return state.currentTrackIndex + 1 < state.playlist.length;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentStationId: null,
    currentTrackIndex: 0,
    currentTime: 0,
    playlist: [],
    loop: false,
    shuffle: false,
    quality: "high",
  });

  const actions: PlayerActions = {
    /**
     * Set the current station and reset playback position
     */
    setStation: useCallback((stationId: string) => {
      setState((prev) => ({
        ...prev,
        currentStationId: stationId,
        currentTrackIndex: 0,
        currentTime: 0,
      }));
    }, []),

    /**
     * Set playing state to true (actual audio control handled by audio element)
     */
    play: useCallback(() => {
      setState((prev) => ({
        ...prev,
        isPlaying: true,
      }));
    }, []),

    /**
     * Set playing state to false (does not clear current station)
     */
    pause: useCallback(() => {
      setState((prev) => ({
        ...prev,
        isPlaying: false,
      }));
    }, []),

    /**
     * Jump to a specific track in the playlist
     */
    setTrackIndex: useCallback((index: number) => {
      setState((prev) => ({
        ...prev,
        currentTrackIndex: index,
        currentTime: 0,
      }));
    }, []),


    setCurrentTime: useCallback((time: number) => {
      // TODO: implement time update logic
      setState((prev) => ({
        ...prev,
        currentTime: time,
      }));
    }, []),

    setPlaylist: useCallback((tracks: PlaylistTrack[]) => {
      setState((prev) => ({
        ...prev,
        playlist: tracks,
        currentTrackIndex: 0,
      }));
    }, []),

    setIsPlaying: useCallback((value: boolean) => {
      setState((prev) => ({
        ...prev,
        isPlaying: value,
      }));
    }, []),

    nextTrack: useCallback(() => {
      setState((prev) => {
        const nextIndex = prev.currentTrackIndex + 1;
        if (!prev.playlist[nextIndex]) return prev; // no next track
        return { ...prev, currentTrackIndex: nextIndex };
      });
    }, []),

    prevTrack: useCallback(() => {
      setState((prev) => {
        const prevIndex = prev.currentTrackIndex - 1;
        if (prevIndex < 0) return prev; // first track already
        return { ...prev, currentTrackIndex: prevIndex };
      });
    }, []),

    toggleLoop: useCallback(() => {
      setState((prev) => ({ ...prev, loop: !prev.loop }));
    }, []),

    toggleShuffle: useCallback(() => {
      setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
    }, []),

    setQuality: useCallback((q: "high" | "low") => {
      setState((prev) => ({ ...prev, quality: q }));
    }, []),
  };

  const value: PlayerContextValue = {
    state,
    actions,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
