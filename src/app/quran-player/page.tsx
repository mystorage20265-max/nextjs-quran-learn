"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import "./spotify-player.css";

/* ─── Types ─── */
interface Track {
  id: number;
  name: string;
  englishName: string;
  translation: string;
  ayahs: number;
  reciter: string;
  reciterId: number;
  audioUrl: string;
  duration: string;
  durationSeconds: number;
  gradient: string;
}

interface Reciter {
  id: number;
  name: string;
  arabicName: string;
  identifier: string;
}

/* ─── Constants ─── */
const RECITERS: Reciter[] = [
  { id: 1, name: "Mishary Rashid Alafasy", arabicName: "مشاري العفاسي", identifier: "ar.alafasy" },
  { id: 2, name: "Abdul Basit", arabicName: "عبد الباسط", identifier: "ar.abdulbasitmurattal" },
  { id: 3, name: "AbdulRahman Al-Sudais", arabicName: "عبد الرحمن السديس", identifier: "ar.abdurrahmaansudais" },
  { id: 5, name: "Maher Al-Muaiqly", arabicName: "ماهر المعيقلي", identifier: "ar.maaboralmueaqly" },
  { id: 6, name: "Saad Al-Ghamdi", arabicName: "سعد الغامدي", identifier: "ar.saaboralghamdi" },
  { id: 7, name: "Ahmad Al-Ajmi", arabicName: "أحمد العجمي", identifier: "ar.ahmedajamy" },
];

const GRADIENTS = [
  "sp-gradient-1", "sp-gradient-2", "sp-gradient-3", "sp-gradient-4",
  "sp-gradient-5", "sp-gradient-6", "sp-gradient-7", "sp-gradient-8"
];

const SURAHS_DATA = [
  { number: 1, name: "Al-Fatihah", translation: "The Opening", ayahs: 7 },
  { number: 2, name: "Al-Baqarah", translation: "The Cow", ayahs: 286 },
  { number: 3, name: "Al-'Imran", translation: "Family of Imran", ayahs: 200 },
  { number: 18, name: "Al-Kahf", translation: "The Cave", ayahs: 110 },
  { number: 19, name: "Maryam", translation: "Mary", ayahs: 98 },
  { number: 36, name: "Ya-Sin", translation: "Ya-Sin", ayahs: 83 },
  { number: 55, name: "Ar-Rahman", translation: "The Beneficent", ayahs: 78 },
  { number: 56, name: "Al-Waqi'a", translation: "The Inevitable", ayahs: 96 },
  { number: 67, name: "Al-Mulk", translation: "The Sovereignty", ayahs: 30 },
  { number: 73, name: "Al-Muzzammil", translation: "The Enshrouded One", ayahs: 20 },
  { number: 78, name: "An-Naba'", translation: "The Tidings", ayahs: 40 },
  { number: 87, name: "Al-A'la", translation: "The Most High", ayahs: 19 },
  { number: 89, name: "Al-Fajr", translation: "The Dawn", ayahs: 30 },
  { number: 90, name: "Al-Balad", translation: "The City", ayahs: 20 },
  { number: 91, name: "Ash-Shams", translation: "The Sun", ayahs: 15 },
  { number: 93, name: "Ad-Duha", translation: "The Morning Hours", ayahs: 11 },
  { number: 94, name: "Ash-Sharh", translation: "The Relief", ayahs: 8 },
  { number: 95, name: "At-Tin", translation: "The Fig", ayahs: 8 },
  { number: 96, name: "Al-'Alaq", translation: "The Clot", ayahs: 19 },
  { number: 97, name: "Al-Qadr", translation: "The Power", ayahs: 5 },
  { number: 99, name: "Az-Zalzalah", translation: "The Earthquake", ayahs: 8 },
  { number: 100, name: "Al-Adiyat", translation: "The Courser", ayahs: 11 },
  { number: 101, name: "Al-Qari'a", translation: "The Calamity", ayahs: 11 },
  { number: 102, name: "At-Takathur", translation: "The Rivalry", ayahs: 8 },
  { number: 103, name: "Al-Asr", translation: "The Declining Day", ayahs: 3 },
  { number: 104, name: "Al-Humazah", translation: "The Traducer", ayahs: 9 },
  { number: 105, name: "Al-Fil", translation: "The Elephant", ayahs: 5 },
  { number: 108, name: "Al-Kawthar", translation: "Abundance", ayahs: 3 },
  { number: 109, name: "Al-Kafirun", translation: "The Disbelievers", ayahs: 6 },
  { number: 110, name: "An-Nasr", translation: "Divine Support", ayahs: 3 },
  { number: 112, name: "Al-Ikhlas", translation: "Sincerity", ayahs: 4 },
  { number: 113, name: "Al-Falaq", translation: "The Daybreak", ayahs: 5 },
  { number: 114, name: "An-Nas", translation: "Mankind", ayahs: 6 },
];

const QUICK_PLAY_SURAHS = [
  { number: 1, name: "Al-Fatihah" },
  { number: 36, name: "Ya-Sin" },
  { number: 55, name: "Ar-Rahman" },
  { number: 67, name: "Al-Mulk" },
  { number: 18, name: "Al-Kahf" },
  { number: 112, name: "Al-Ikhlas" },
];

function getAudioUrl(surahNumber: number, reciterIdentifier: string): string {
  return `https://cdn.islamic.network/quran/audio-surah/128/${reciterIdentifier}/${surahNumber}.mp3`;
}

function estimateDuration(ayahs: number): { display: string; seconds: number } {
  const avgSecondsPerAyah = 12;
  const totalSeconds = ayahs * avgSecondsPerAyah;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { display: `${minutes}:${seconds.toString().padStart(2, "0")}`, seconds: totalSeconds };
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ─── SVG Icon Components ─── */
const Icons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"/></svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.28c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/></svg>
  ),
  Library: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1.5.866l11-6.5a1 1 0 0 0 0-1.732l-11-6.5zM16 19.268V4.732L24.069 12 16 19.268zM7 22a1 1 0 0 1-1-1V3a1 1 0 1 1 2 0v18a1 1 0 0 1-1 1z" transform="scale(0.85) translate(1.5, 1.5)"/></svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/></svg>
  ),
  Play: () => (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>
  ),
  Pause: () => (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>
  ),
  SkipPrev: () => (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H2.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h.6z"/></svg>
  ),
  SkipNext: () => (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-.6z"/></svg>
  ),
  Shuffle: () => (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"/><path d="m7.5 10.723.98-1.167 1.796 2.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-1.787-2.937z"/></svg>
  ),
  Repeat: () => (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/></svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1.69 2A4.582 4.582 0 0 1 8 2.023 4.583 4.583 0 0 1 11.88.817h.002a4.618 4.618 0 0 1 3.782 3.65v.003a4.543 4.543 0 0 1-1.011 3.84L9.35 14.629a1.765 1.765 0 0 1-2.093.464 1.762 1.762 0 0 1-.605-.463L1.348 8.309A4.582 4.582 0 0 1 1.689 2zm3.158.252A3.082 3.082 0 0 0 2.49 7.337l.005.005L7.8 13.664a.264.264 0 0 0 .311.069.262.262 0 0 0 .09-.069l5.312-6.33a3.043 3.043 0 0 0 .68-2.573 3.118 3.118 0 0 0-2.551-2.463 3.079 3.079 0 0 0-2.612.816l-.007.007a1.501 1.501 0 0 1-2.045 0l-.009-.008a3.082 3.082 0 0 0-2.121-.84z"/></svg>
  ),
  HeartFilled: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.21 5.855l5.916 7.05a1.128 1.128 0 0 0 1.727 0l5.916-7.05a4.228 4.228 0 0 0 .945-3.577z"/></svg>
  ),
  Volume2: () => (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.683 3.281V2.87L2.817 6.15zm8.683-.067a4.4 4.4 0 0 1 0 3.834.75.75 0 1 1-1.354-.644 2.9 2.9 0 0 0 0-2.546.75.75 0 0 1 1.354-.644z"/><path d="M11.5 1.438a.75.75 0 0 1 1.06 0 8.218 8.218 0 0 1 0 11.624.75.75 0 1 1-1.06-1.06 6.718 6.718 0 0 0 0-9.504.75.75 0 0 1 0-1.06z"/></svg>
  ),
  VolumeMute: () => (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"/><path d="M10.116.85a.75.75 0 0 0-.741.049L2.45 4.899H0v6.202h2.45l6.925 4a.75.75 0 0 0 1.125-.649V1.5a.75.75 0 0 0-.384-.65zM3.817 6.15 8.5 3.37v9.26L3.817 9.85a.75.75 0 0 0-.367-.1H1.5V6.25h1.95a.75.75 0 0 0 .367-.1z"/></svg>
  ),
  Queue: () => (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-7A2.5 2.5 0 0 1 3.5 1h9a2.5 2.5 0 0 1 0 5h-9A2.5 2.5 0 0 1 1 3.5zm2.5-1a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2h-9z"/></svg>
  ),
  ChevronLeft: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8 9.97.47a.75.75 0 0 1 1.06 0z"/></svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M4.97.47a.75.75 0 0 0 0 1.06L11.44 8l-6.47 6.47a.75.75 0 1 0 1.06 1.06L13.56 8 6.03.47a.75.75 0 0 0-1.06 0z"/></svg>
  ),
  Close: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06z"/></svg>
  ),
};

/* ─── Surah Art Placeholder ─── */
function SurahArt({ number, name, gradient, size = "normal" }: { number: number; name: string; gradient: string; size?: string; }) {
  return (
    <div className={`sp-surah-art-placeholder ${gradient}`}>
      <span className="sp-art-number">{number}</span>
      <span className="sp-art-name" style={{ fontSize: size === "small" ? "0.7rem" : "1rem" }}>{name}</span>
    </div>
  );
}

/* ─── Main Component ─── */
export default function QuranPlayerPage() {
  const [currentReciter, setCurrentReciter] = useState<Reciter>(RECITERS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Build tracks list from surahs + current reciter
  const tracks: Track[] = SURAHS_DATA.map((s, i) => {
    const est = estimateDuration(s.ayahs);
    return {
      id: s.number,
      name: `Surah ${s.name}`,
      englishName: s.name,
      translation: s.translation,
      ayahs: s.ayahs,
      reciter: currentReciter.name,
      reciterId: currentReciter.id,
      audioUrl: getAudioUrl(s.number, currentReciter.identifier),
      duration: est.display,
      durationSeconds: est.seconds,
      gradient: GRADIENTS[i % GRADIENTS.length],
    };
  });

  const filteredTracks = tracks.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.translation.toLowerCase().includes(q);
    }
    return true;
  });

  // Get greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Scroll handler
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [isRepeating, currentTrack]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const playTrack = useCallback(async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.id === track.id && currentTrack?.reciterId === track.reciterId) {
      // Toggle play/pause
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play().catch(() => {});
      }
      return;
    }

    setCurrentTrack(track);
    audio.src = track.audioUrl;
    audio.load();
    try {
      await audio.play();
    } catch {
      // User interaction required
    }
  }, [currentTrack, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const playNext = useCallback(() => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    playTrack(tracks[nextIndex]);
  }, [currentTrack, tracks, isShuffled, playTrack]);

  const playPrev = () => {
    if (!currentTrack) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audioRef.current && duration) {
      audioRef.current.currentTime = percent * duration;
    }
  };

  const seekVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(Math.round(percent * 100));
    setIsMuted(false);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isTrackPlaying = (trackId: number) => currentTrack?.id === trackId && isPlaying;

  return (
    <div className="spotify-player-page">
      <audio ref={audioRef} preload="auto" />

      <div className="sp-shell">
        {/* ═══ SIDEBAR ═══ */}
        <aside className="sp-sidebar">
          {/* Nav */}
          <nav className="sp-sidebar-nav">
            <a className="sp-sidebar-nav-item active" href="#" onClick={e => e.preventDefault()}>
              <Icons.Home />
              <span>Home</span>
            </a>
            <a className="sp-sidebar-nav-item" href="#" onClick={e => e.preventDefault()}>
              <Icons.Search />
              <span>Search</span>
            </a>
          </nav>

          {/* Library */}
          <div className="sp-sidebar-library">
            <div className="sp-library-header">
              <div className="sp-library-title">
                <Icons.Library />
                <span>Your Library</span>
              </div>
              <div className="sp-library-actions">
                <button className="sp-library-action-btn" title="Create playlist">
                  <Icons.Plus />
                </button>
              </div>
            </div>

            {/* Filter chips */}
            <div className="sp-library-filters">
              {["All", "Surahs", "Reciters"].map(f => (
                <button
                  key={f}
                  className={`sp-filter-chip${activeFilter === f ? " active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Library items */}
            <div className="sp-library-list">
              {/* Reciter section */}
              {(activeFilter === "All" || activeFilter === "Reciters") && RECITERS.map(r => (
                <div
                  key={r.id}
                  className={`sp-library-item${currentReciter.id === r.id ? " active" : ""}`}
                  onClick={() => setCurrentReciter(r)}
                >
                  <div className="sp-library-item-art circle">
                    <div className={`sp-surah-art-placeholder ${GRADIENTS[r.id % GRADIENTS.length]}`}>
                      <span className="sp-art-name" style={{ fontSize: "0.6rem" }}>{r.arabicName}</span>
                    </div>
                  </div>
                  <div className="sp-library-item-info">
                    <div className={`sp-library-item-name${currentReciter.id === r.id ? " playing" : ""}`}>{r.name}</div>
                    <div className="sp-library-item-meta">Reciter</div>
                  </div>
                </div>
              ))}

              {/* Quick Surah section */}
              {(activeFilter === "All" || activeFilter === "Surahs") && SURAHS_DATA.slice(0, 12).map((s, i) => (
                <div
                  key={s.number}
                  className={`sp-library-item${currentTrack?.id === s.number ? " active" : ""}`}
                  onClick={() => playTrack(tracks[i])}
                >
                  <div className="sp-library-item-art">
                    <SurahArt number={s.number} name={s.name} gradient={GRADIENTS[i % GRADIENTS.length]} size="small" />
                  </div>
                  <div className="sp-library-item-info">
                    <div className={`sp-library-item-name${currentTrack?.id === s.number ? " playing" : ""}`}>{s.name}</div>
                    <div className="sp-library-item-meta">{s.translation} · {s.ayahs} ayahs</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="sp-sidebar-cta">
              <h4>Discover Quran Recitations</h4>
              <p>Listen to beautiful recitations from world-renowned reciters.</p>
              <button className="sp-sidebar-cta-btn">Explore</button>
            </div>
          </div>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="sp-main" ref={mainRef}>
          {/* Top Bar */}
          <div className={`sp-topbar${scrolled ? " scrolled" : ""}`}>
            <div className="sp-topbar-left">
              <button className="sp-topbar-nav-btn" disabled>
                <Icons.ChevronLeft />
              </button>
              <button className="sp-topbar-nav-btn" disabled>
                <Icons.ChevronRight />
              </button>
            </div>
            <div className="sp-topbar-right">
              <div className="sp-search-container">
                <svg className="sp-search-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.28c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/>
                </svg>
                <input
                  className="sp-search-input"
                  type="text"
                  placeholder="What do you want to listen to?"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Hero Gradient */}
          <div className="sp-hero-gradient">
            <h1 className="sp-hero-greeting">{getGreeting()}</h1>
          </div>

          {/* Quick Play Grid */}
          <div className="sp-quickplay-grid">
            {QUICK_PLAY_SURAHS.map((s, i) => {
              const track = tracks.find(t => t.id === s.number);
              if (!track) return null;
              return (
                <div key={s.number} className="sp-quickplay-card" onClick={() => playTrack(track)}>
                  <div className="sp-quickplay-art">
                    <SurahArt number={s.number} name={s.name} gradient={GRADIENTS[i % GRADIENTS.length]} size="small" />
                  </div>
                  <span className="sp-quickplay-name">Surah {s.name}</span>
                  <button className="sp-quickplay-play" onClick={e => { e.stopPropagation(); playTrack(track); }}>
                    {isTrackPlaying(s.number) ? <Icons.Pause /> : <Icons.Play />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Popular Reciters Section */}
          <div className="sp-section">
            <div className="sp-section-header">
              <h2 className="sp-section-title">Popular Reciters</h2>
              <button className="sp-section-show-all">Show all</button>
            </div>
            <div className="sp-reciter-row">
              {RECITERS.map((r, i) => (
                <div key={r.id} className="sp-reciter-item" onClick={() => setCurrentReciter(r)}>
                  <div className="sp-reciter-avatar">
                    <div className={`sp-surah-art-placeholder ${GRADIENTS[r.id % GRADIENTS.length]}`}>
                      <span className="sp-art-name" style={{ fontSize: "0.85rem" }}>{r.arabicName}</span>
                    </div>
                  </div>
                  <span className="sp-reciter-name">{r.name}</span>
                  <span className="sp-reciter-role" style={{ fontSize: 11, color: "var(--sp-text-secondary)" }}>Reciter</span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Surahs (Card Grid) */}
          <div className="sp-section">
            <div className="sp-section-header">
              <h2 className="sp-section-title">Featured Surahs</h2>
              <button className="sp-section-show-all">Show all</button>
            </div>
            <div className="sp-card-grid">
              {filteredTracks.slice(0, 8).map(track => (
                <div key={track.id} className="sp-card" onClick={() => playTrack(track)}>
                  <div className="sp-card-art-container">
                    <SurahArt number={track.id} name={track.englishName} gradient={track.gradient} />
                    <button className="sp-card-play-btn" onClick={e => { e.stopPropagation(); playTrack(track); }}>
                      {isTrackPlaying(track.id) ? <Icons.Pause /> : <Icons.Play />}
                    </button>
                  </div>
                  <div className="sp-card-title">{track.name}</div>
                  <div className="sp-card-subtitle">{track.translation} · {track.ayahs} ayahs</div>
                </div>
              ))}
            </div>
          </div>

          {/* Short Surahs */}
          <div className="sp-section">
            <div className="sp-section-header">
              <h2 className="sp-section-title">Short Surahs for Daily Recitation</h2>
              <button className="sp-section-show-all">Show all</button>
            </div>
            <div className="sp-card-grid">
              {filteredTracks.filter(t => t.ayahs <= 20).slice(0, 8).map(track => (
                <div key={track.id} className="sp-card" onClick={() => playTrack(track)}>
                  <div className="sp-card-art-container">
                    <SurahArt number={track.id} name={track.englishName} gradient={track.gradient} />
                    <button className="sp-card-play-btn" onClick={e => { e.stopPropagation(); playTrack(track); }}>
                      {isTrackPlaying(track.id) ? <Icons.Pause /> : <Icons.Play />}
                    </button>
                  </div>
                  <div className="sp-card-title">{track.name}</div>
                  <div className="sp-card-subtitle">{track.translation} · {track.ayahs} ayahs</div>
                </div>
              ))}
            </div>
          </div>

          {/* Playlist / Track List */}
          <div className="sp-section">
            <div className="sp-playlist-hero">
              <div className="sp-playlist-cover">
                <SurahArt number={0} name="القرآن الكريم" gradient="sp-gradient-2" />
              </div>
              <div className="sp-playlist-info">
                <span className="sp-playlist-type">Playlist</span>
                <h2 className="sp-playlist-name">All Surahs</h2>
                <p className="sp-playlist-desc">Complete collection of Quran recitations by {currentReciter.name}</p>
                <div className="sp-playlist-meta">
                  <span style={{ fontWeight: 700 }}>{currentReciter.name}</span>
                  <span className="dot">•</span>
                  <span>{filteredTracks.length} surahs</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="sp-playlist-controls">
              <button
                className="sp-big-play-btn"
                onClick={() => {
                  if (currentTrack && isPlaying) {
                    togglePlay();
                  } else if (currentTrack) {
                    togglePlay();
                  } else if (filteredTracks.length > 0) {
                    playTrack(filteredTracks[0]);
                  }
                }}
              >
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </button>
              <button
                className={`sp-control-btn${isShuffled ? " active" : ""}`}
                onClick={() => setIsShuffled(!isShuffled)}
                style={{ width: 32, height: 32, position: "relative" }}
              >
                <Icons.Shuffle />
              </button>
            </div>

            {/* Track List Table Header */}
            <div className="sp-tracklist">
              <div className="sp-tracklist-header">
                <span>#</span>
                <span>Title</span>
                <span className="sp-th-album">Reciter</span>
                <span className="sp-th-duration" style={{ textAlign: "right" }}>
                  <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/><path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"/></svg>
                </span>
              </div>

              {filteredTracks.map((track, index) => {
                const playing = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    className={`sp-track-row${playing ? " playing" : ""}`}
                    onClick={() => playTrack(track)}
                  >
                    <div className="sp-track-index">
                      <span className="sp-track-number">{index + 1}</span>
                      <span className="sp-track-play-icon">
                        {playing && isPlaying ? <Icons.Pause /> : <Icons.Play />}
                      </span>
                      {playing && isPlaying && (
                        <div className="sp-track-eq">
                          <span /><span /><span /><span />
                        </div>
                      )}
                    </div>
                    <div className="sp-track-info">
                      <div className="sp-track-art">
                        <SurahArt number={track.id} name={track.englishName} gradient={track.gradient} size="small" />
                      </div>
                      <div className="sp-track-text">
                        <div className={`sp-track-name${playing ? " playing" : ""}`}>{track.name}</div>
                        <div className="sp-track-artist">{track.translation}</div>
                      </div>
                    </div>
                    <div className="sp-track-album">{track.reciter}</div>
                    <div className="sp-track-duration">{track.duration}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sp-footer-spacer" />
        </main>

        {/* ═══ BOTTOM PLAYER BAR (Desktop) ═══ */}
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
                <button className={`sp-player-like-btn${isLiked ? " liked" : ""}`} onClick={() => setIsLiked(!isLiked)}>
                  {isLiked ? <Icons.HeartFilled /> : <Icons.Heart />}
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
                className={`sp-control-btn${isShuffled ? " active" : ""}`}
                onClick={() => setIsShuffled(!isShuffled)}
                style={{ position: "relative" }}
              >
                <Icons.Shuffle />
              </button>
              <button className="sp-control-btn" onClick={playPrev}>
                <Icons.SkipPrev />
              </button>
              <button className="sp-play-btn" onClick={togglePlay}>
                {isPlaying ? <Icons.Pause /> : <span className="play-icon"><Icons.Play /></span>}
              </button>
              <button className="sp-control-btn" onClick={playNext}>
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
            <div className="sp-progress-container">
              <span className="sp-progress-time left">{formatTime(currentTime)}</span>
              <div className="sp-progress-bar-wrapper" ref={progressRef} onClick={seekTo}>
                <div className="sp-progress-bar">
                  <div className="sp-progress-fill" style={{ width: `${progressPercent}%` }}>
                    <div className="sp-progress-knob" />
                  </div>
                </div>
              </div>
              <span className="sp-progress-time right">{formatTime(duration || 0)}</span>
            </div>
          </div>

          {/* Right - Volume + Extra */}
          <div className="sp-player-right">
            <button className="sp-control-btn">
              <Icons.Queue />
            </button>
            <div className="sp-volume-group">
              <button className="sp-volume-btn" onClick={() => setIsMuted(!isMuted)}>
                {isMuted || volume === 0 ? <Icons.VolumeMute /> : <Icons.Volume2 />}
              </button>
              <div className="sp-volume-bar-wrapper" ref={volumeRef} onClick={seekVolume}>
                <div className="sp-volume-bar">
                  <div className="sp-volume-fill" style={{ width: `${isMuted ? 0 : volume}%` }}>
                    <div className="sp-volume-knob" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MOBILE MINI PLAYER ═══ */}
        <div className="sp-mobile-player" onClick={() => currentTrack && setShowNowPlaying(true)}>
          {currentTrack ? (
            <>
              <div className="sp-mobile-player-progress" style={{ width: `${progressPercent}%` }} />
              <div className="sp-mobile-player-art">
                <SurahArt number={currentTrack.id} name={currentTrack.englishName} gradient={currentTrack.gradient} size="small" />
              </div>
              <div className="sp-mobile-player-info">
                <div className="sp-mobile-player-name">{currentTrack.name}</div>
                <div className="sp-mobile-player-artist">{currentTrack.reciter}</div>
              </div>
              <div className="sp-mobile-player-controls">
                <button className={`sp-mobile-player-btn${isLiked ? " liked" : ""}`} onClick={e => { e.stopPropagation(); setIsLiked(!isLiked); }}>
                  {isLiked ? <Icons.HeartFilled /> : <Icons.Heart />}
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

        {/* ═══ MOBILE BOTTOM NAV ═══ */}
        <div className="sp-mobile-nav">
          <button className="sp-mobile-nav-item active">
            <Icons.Home />
            <span>Home</span>
          </button>
          <button className="sp-mobile-nav-item">
            <Icons.Search />
            <span>Search</span>
          </button>
          <button className="sp-mobile-nav-item">
            <Icons.Library />
            <span>Your Library</span>
          </button>
        </div>
      </div>

      {/* ═══ NOW PLAYING OVERLAY (Mobile Full-screen) ═══ */}
      <div className={`sp-now-playing-overlay${showNowPlaying ? " active" : ""}`}>
        <button className="sp-now-playing-close" onClick={() => setShowNowPlaying(false)}>
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
            <div className="sp-progress-container" style={{ maxWidth: 400, width: "100%" }}>
              <span className="sp-progress-time left">{formatTime(currentTime)}</span>
              <div className="sp-progress-bar-wrapper" onClick={seekTo}>
                <div className="sp-progress-bar">
                  <div className="sp-progress-fill" style={{ width: `${progressPercent}%` }}>
                    <div className="sp-progress-knob" style={{ opacity: 1 }} />
                  </div>
                </div>
              </div>
              <span className="sp-progress-time right">{formatTime(duration || 0)}</span>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}