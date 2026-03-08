"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── API ─────────────────────────────────────────────────────────────────────
const SURAH_LIST_API = "https://api.alquran.cloud/v1/surah";
const RECITERS_API = "https://api.alquran.cloud/v1/edition?format=audio&type=versebyverse";
const SURAH_AUDIO_API = (surahNum: number, edition: string) =>
  `https://api.alquran.cloud/v1/surah/${surahNum}/${edition}`;

function formatTime(sec: number) {
  if (!isFinite(sec) || isNaN(sec)) return "--:--";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor((sec / 60) % 60).toString().padStart(2, "0");
  const h = Math.floor(sec / 3600);
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

// Arabic numeral mapping for surah numbers
const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNumeral(n: number): string {
  return String(n).split("").map(d => arabicNumerals[parseInt(d)] ?? d).join("");
}

// Meccan surahs (simplified list for badge display)
const meccanSurahs = new Set([1, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 56, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 111, 112, 113, 114]);

export default function AudioQuranPage() {
  // ── Data state ──
  const [reciters, setReciters] = useState<any[]>([]);
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedReciter, setSelectedReciter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [showAllSurahs, setShowAllSurahs] = useState(false);

  // ── Playback state ──
  const [nowPlayingSurah, setNowPlayingSurah] = useState<number | null>(null);
  const [nowPlayingAyahIndex, setNowPlayingAyahIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ayahLists, setAyahLists] = useState<any>({});
  const [perSurahError, setPerSurahError] = useState<any>({});
  const [currentTimeState, setCurrentTimeState] = useState(0);
  const [durationState, setDurationState] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [loadingSurah, setLoadingSurah] = useState<number | null>(null);

  // ── Refs ──
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // ── Load reciters + surahs ──
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [recRes, surRes] = await Promise.all([fetch(RECITERS_API), fetch(SURAH_LIST_API)]);
        if (!recRes.ok || !surRes.ok) throw new Error("Failed to fetch");
        const recJson = await recRes.json();
        const surJson = await surRes.json();
        if (cancelled) return;
        setReciters(recJson.data || []);
        setSurahs(surJson.data || []);
        if (recJson.data?.length > 0) setSelectedReciter(recJson.data[0].identifier);
      } catch {
        setGlobalError("Error loading data. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Audio element setup ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    audioRef.current = new window.Audio();
    audioRef.current.volume = volume;
    return () => { audioRef.current?.pause(); };
  }, []);

  // ── Audio event listeners ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (nowPlayingSurah == null) return;
      if (isRepeat) {
        playAyahIndex(nowPlayingSurah, nowPlayingAyahIndex ?? 0);
        return;
      }
      const ayahUrls = ayahLists[nowPlayingSurah] || [];
      const nextIndex = (nowPlayingAyahIndex ?? 0) + 1;
      if (nextIndex < ayahUrls.length) {
        playAyahIndex(nowPlayingSurah, nextIndex);
      } else {
        setIsPlaying(false);
        setNowPlayingAyahIndex(null);
        setNowPlayingSurah(null);
      }
    };
    const onError = () => {
      if (nowPlayingSurah == null) return;
      const ayahUrls = ayahLists[nowPlayingSurah] || [];
      const nextIndex = (nowPlayingAyahIndex ?? 0) + 1;
      if (nextIndex < ayahUrls.length) playAyahIndex(nowPlayingSurah, nextIndex);
      else { setIsPlaying(false); setNowPlayingAyahIndex(null); setNowPlayingSurah(null); }
    };
    const onTimeUpdate = () => setCurrentTimeState(audio.currentTime);
    const onLoadedMetadata = () => setDurationState(audio.duration);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [nowPlayingSurah, nowPlayingAyahIndex, ayahLists, isRepeat]);

  // ── Volume sync ──
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // ── Fetch ayah URLs (reciterOverride lets us fetch before state updates) ──
  const getAyahUrls = useCallback(async (surahNum: number, reciterOverride?: string) => {
    const reciter = reciterOverride ?? selectedReciter;
    if (!reciter) return [];
    if (!reciterOverride && ayahLists[surahNum]) return ayahLists[surahNum];
    try {
      const res = await fetch(SURAH_AUDIO_API(surahNum, reciter));
      if (!res.ok) throw new Error("Failed to fetch audio");
      const json = await res.json();
      const urls = json.data?.ayahs?.map((a: any) => a.audio) || [];
      setAyahLists((prev: any) => ({ ...prev, [surahNum]: urls }));
      return urls;
    } catch {
      setPerSurahError((prev: any) => ({ ...prev, [surahNum]: "Audio not available." }));
      return [];
    }
  }, [selectedReciter, ayahLists]);

  // ── Switch reciter (re-plays current surah with new voice if playing) ──
  const handleReciterChange = async (reciterId: string) => {
    setSelectedReciter(reciterId);
    setAyahLists({});
    setPerSurahError({});
    if (nowPlayingSurah == null) return;
    // Stop current audio immediately
    audioRef.current?.pause();
    setIsPlaying(false);
    setLoadingSurah(nowPlayingSurah);
    try {
      const urls = await getAyahUrls(nowPlayingSurah, reciterId);
      if (urls.length > 0) {
        // Update cache so playAyahIndex uses new URLs
        setAyahLists({ [nowPlayingSurah]: urls });
        const audio = audioRef.current!;
        audio.src = urls[0];
        playPromiseRef.current = audio.play();
        await playPromiseRef.current;
        playPromiseRef.current = null;
        setNowPlayingAyahIndex(0);
        setIsPlaying(true);
      }
    } catch { }
    finally { setLoadingSurah(null); }
  };

  // ── Safe play ──
  const playAyahIndex = async (surahNum: number, index: number) => {
    const urls = ayahLists[surahNum] || [];
    if (!urls || index < 0 || index >= urls.length) return;
    try {
      const audio = audioRef.current!;
      if (playPromiseRef.current) { try { await playPromiseRef.current; } catch { } }
      audio.pause();
      audio.src = urls[index];
      playPromiseRef.current = audio.play();
      await playPromiseRef.current;
      playPromiseRef.current = null;
      setNowPlayingSurah(surahNum);
      setNowPlayingAyahIndex(index);
      setIsPlaying(true);
    } catch (e: any) {
      playPromiseRef.current = null;
      if (e?.name === "AbortError") return;
      const next = index + 1;
      if (next < (ayahLists[surahNum] || []).length) playAyahIndex(surahNum, next);
      else setIsPlaying(false);
    }
  };

  // ── Play handlers ──
  const handlePlaySurah = async (surahNum: number) => {
    if (nowPlayingSurah === surahNum && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (nowPlayingSurah === surahNum && !isPlaying) {
      try {
        playPromiseRef.current = audioRef.current?.play() ?? null;
        await playPromiseRef.current;
        playPromiseRef.current = null;
        setIsPlaying(true);
      } catch { }
      return;
    }
    setLoadingSurah(surahNum);
    try {
      const urls = await getAyahUrls(surahNum);
      if (urls.length > 0) playAyahIndex(surahNum, 0);
      else setPerSurahError((prev: any) => ({ ...prev, [surahNum]: 'Audio unavailable for this reciter.' }));
    } finally {
      setLoadingSurah(null);
    }
  };

  const handlePause = () => { audioRef.current?.pause(); setIsPlaying(false); };
  const handleResume = async () => {
    try {
      playPromiseRef.current = audioRef.current?.play() ?? null;
      await playPromiseRef.current;
      playPromiseRef.current = null;
      setIsPlaying(true);
    } catch { }
  };
  const handleStop = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setNowPlayingAyahIndex(null);
    setNowPlayingSurah(null);
    setCurrentTimeState(0);
    setDurationState(0);
  };
  const handleNext = () => {
    if (nowPlayingSurah == null) return;
    const urls = ayahLists[nowPlayingSurah] || [];
    const next = (nowPlayingAyahIndex ?? 0) + 1;
    if (next < urls.length) playAyahIndex(nowPlayingSurah, next);
  };
  const handlePrev = () => {
    if (nowPlayingSurah == null) return;
    const prev = Math.max(0, (nowPlayingAyahIndex ?? 0) - 1);
    playAyahIndex(nowPlayingSurah, prev);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !durationState) return;
    const bar = e.currentTarget;
    const pct = (e.clientX - bar.getBoundingClientRect().left) / bar.clientWidth;
    audioRef.current.currentTime = pct * durationState;
  };

  // ── Computed ──
  const nowPlayingSurahData = surahs.find(s => s.number === nowPlayingSurah);
  const nowPlayingReciter = reciters.find(r => r.identifier === selectedReciter);
  const progressPct = durationState > 0 ? (currentTimeState / durationState) * 100 : 0;

  const filteredSurahs = surahs.filter(s => {
    const q = search.toLowerCase();
    return s.englishName.toLowerCase().includes(q) || String(s.number).includes(q);
  });
  const displayedSurahs = showAllSurahs ? filteredSurahs : filteredSurahs.slice(0, 20);

  // ── Top 5 reciters for sidebar (subset of full list) ──
  const topReciters = reciters.slice(0, 5);

  return (
    <div className={`audio-quran-root${nowPlayingSurah !== null ? ' aq-player-open' : ''}`} style={{ minHeight: "100vh", background: "var(--aq-bg)", fontFamily: "'Inter', sans-serif" }}>



      {/* ── MAIN ── */}
      <main className="aq-main" style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px", paddingBottom: nowPlayingSurah !== null ? 160 : 32 }}>
        <div className="aq-layout" style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>

          {/* ── LEFT: Hero + Table ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Hero Now Playing Banner */}
            <div style={{
              position: "relative", overflow: "hidden",
              borderRadius: 20,
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              padding: "36px 40px", marginBottom: 28,
              color: "white",
              boxShadow: "0 8px 32px rgba(245,158,11,0.25)",
            }}>
              {/* Dot-grid overlay */}
              <div style={{ position: "absolute", inset: 0, opacity: 0.08, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px", pointerEvents: "none" }} />

              <div className="aq-hero-inner" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
                {/* Info */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(209,250,229,0.7)", marginBottom: 8 }}>
                    {nowPlayingSurah ? "Now Playing" : "Ready to Play"}
                  </div>
                  {nowPlayingSurahData ? (
                    <>
                      <div style={{ fontFamily: "'Naskh IndoPak', serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>
                        {nowPlayingSurahData.name}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                        {nowPlayingSurahData.englishName}
                      </div>
                      <div style={{ color: "rgba(209,250,229,0.85)", fontSize: 14 }}>
                        Reciter: {nowPlayingReciter?.englishName || selectedReciter} • Ayah {(nowPlayingAyahIndex ?? 0) + 1} of {nowPlayingSurahData.numberOfAyahs}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: "'Naskh IndoPak', serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, marginBottom: 4 }}>سُورَةُ الفَاتِحَةِ</div>
                      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Quran Audio Player</div>
                      <div style={{ color: "rgba(209,250,229,0.85)", fontSize: 14 }}>Select a surah to begin listening</div>
                    </>
                  )}
                </div>

                {/* Visualizer + Controls */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
                  {/* Waveform */}
                  <div style={{ display: "flex", alignItems: "flex-end", height: 48, gap: 3, padding: "8px 16px", background: "rgba(0,0,0,0.12)", borderRadius: 12, backdropFilter: "blur(8px)" }}>
                    {[8, 16, 32, 22, 40, 20, 36, 12, 28, 16].map((h, i) => (
                      <div key={i} style={{
                        width: 3, borderRadius: 2, background: "rgba(255,255,255,0.65)",
                        height: isPlaying ? undefined : h,
                        animation: isPlaying ? `waveBar ${0.5 + i * 0.12}s ease-in-out infinite alternate` : undefined,
                        minHeight: isPlaying ? 4 : undefined,
                        maxHeight: isPlaying ? 40 : undefined,
                      }} />
                    ))}
                  </div>
                  {/* Playback buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      onClick={handlePrev}
                      style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>skip_previous</span>
                    </button>
                    <button
                      onClick={nowPlayingSurah ? (isPlaying ? handlePause : handleResume) : undefined}
                      style={{ width: 48, height: 48, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 30 }}>
                        {isBuffering ? "hourglass_empty" : isPlaying ? "pause" : "play_arrow"}
                      </span>
                    </button>
                    <button
                      onClick={handleNext}
                      style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>skip_next</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {globalError && (
              <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#ef4444", fontSize: 13 }}>
                {globalError}
              </div>
            )}

            {/* Mobile Reciter Selector */}
            <div className="aq-mobile-reciter" style={{ marginBottom: 16, background: "var(--aq-card)", borderRadius: 12, border: "1px solid var(--aq-border)", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span className="material-symbols-outlined" style={{ color: "#f48c25", fontSize: 18 }}>mic</span>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--aq-muted)" }}>Select Reciter</span>
              </div>
              <select
                value={selectedReciter}
                onChange={e => handleReciterChange(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--aq-border)", background: "var(--aq-input-bg)", color: "var(--aq-text)", fontSize: 13, fontWeight: 500, outline: "none" }}
              >
                {reciters.map((r: any) => (
                  <option key={r.identifier} value={r.identifier}>{r.englishName}</option>
                ))}
              </select>
            </div>

            {/* Surah Table */}
            <div style={{ background: "var(--aq-card)", borderRadius: 16, border: "1px solid var(--aq-border)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {/* Table header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--aq-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: "var(--aq-text)" }}>Quran Surah List</h3>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ padding: 8, background: "none", border: "none", cursor: "pointer", color: "var(--aq-muted)", borderRadius: 8, display: "flex" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>filter_list</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ padding: 48, textAlign: "center", color: "var(--aq-muted)" }}>
                  <div style={{ width: 36, height: 36, border: "3px solid rgba(244,140,37,0.15)", borderTopColor: "#f48c25", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
                  Loading surahs…
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--aq-thead)", color: "var(--aq-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left" }}>
                        <th style={{ padding: "14px 24px", width: 56 }}>#</th>
                        <th style={{ padding: "14px 24px" }}>Surah Name</th>
                        <th className="aq-hide-mobile" style={{ padding: "14px 24px" }}>Revelation</th>
                        <th className="aq-hide-mobile" style={{ padding: "14px 24px" }}>Verses</th>
                        <th style={{ padding: "14px 24px", textAlign: "right" }}>Listen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSurahs.map((s: any) => {
                        const isNow = nowPlayingSurah === s.number;
                        const isMeccan = meccanSurahs.has(s.number);
                        return (
                          <tr
                            key={s.number}
                            onClick={() => handlePlaySurah(s.number)}
                            style={{
                              borderTop: "1px solid var(--aq-border)",
                              cursor: "pointer",
                              background: isNow ? "rgba(244,140,37,0.06)" : "transparent",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={e => { if (!isNow) (e.currentTarget as HTMLElement).style.background = "var(--aq-hover)"; }}
                            onMouseLeave={e => { if (!isNow) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            {/* Number */}
                            <td style={{ padding: "16px 24px", color: "var(--aq-muted)", fontWeight: 500, fontSize: 13 }}>
                              {String(s.number).padStart(2, "0")}
                            </td>

                            {/* Name */}
                            <td style={{ padding: "16px 24px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--aq-input-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Naskh IndoPak', serif", fontSize: 18, color: "var(--aq-text)", flexShrink: 0 }}>
                                  {toArabicNumeral(s.number)}
                                </div>
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: isNow ? "#f48c25" : "var(--aq-text)" }}>
                                    {s.englishName}
                                    {isNow && isPlaying && (
                                      <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 1.5, height: 14 }}>
                                        {[3, 5, 3, 5].map((h, i) => (
                                          <span key={i} style={{ display: "inline-block", width: 2, background: "#f48c25", borderRadius: 1, height: h, animation: `waveBar ${0.4 + i * 0.1}s ease-in-out infinite alternate` }} />
                                        ))}
                                      </span>
                                    )}
                                    {perSurahError[s.number] && <span style={{ fontSize: 10, color: "#ef4444" }}>⚠</span>}
                                  </div>
                                  <div style={{ fontSize: 11, color: "var(--aq-muted)", marginTop: 2 }}>{s.englishNameTranslation}</div>
                                </div>
                              </div>
                            </td>

                            {/* Revelation */}
                            <td className="aq-hide-mobile" style={{ padding: "16px 24px" }}>
                              {isMeccan ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, background: "rgba(244,140,37,0.1)", color: "#f48c25", fontSize: 11, fontWeight: 600 }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>sunny</span>
                                  Meccan
                                </span>
                              ) : (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, background: "rgba(245,158,11,0.1)", color: "#d97706", fontSize: 11, fontWeight: 600 }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>mosque</span>
                                  Medinan
                                </span>
                              )}
                            </td>

                            {/* Verses */}
                            <td className="aq-hide-mobile" style={{ padding: "16px 24px", fontSize: 13, color: "var(--aq-muted)" }}>
                              {s.numberOfAyahs} Verses
                            </td>

                            {/* Play button */}
                            <td style={{ padding: "16px 24px", textAlign: "right" }}>
                              {loadingSurah === s.number ? (
                                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 }}>
                                  <div style={{ width: 20, height: 20, border: "2.5px solid rgba(244,140,37,0.2)", borderTopColor: "#f48c25", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                </div>
                              ) : (
                                <button
                                  onClick={e => { e.stopPropagation(); handlePlaySurah(s.number); }}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: isNow ? "#f48c25" : "var(--aq-muted)", display: "inline-flex", transition: "color 0.15s" }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                                    {isNow && isPlaying ? "pause_circle" : "play_circle"}
                                  </span>
                                </button>
                              )}
                              {perSurahError[s.number] && (
                                <div style={{ fontSize: 10, color: "#ef4444", marginTop: 2 }}>{perSurahError[s.number]}</div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Show all toggle */}
              <div style={{ padding: "14px 24px", background: "var(--aq-thead)", textAlign: "center", borderTop: "1px solid var(--aq-border)" }}>
                <button
                  onClick={() => setShowAllSurahs(v => !v)}
                  style={{ background: "none", border: "none", color: "#f48c25", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  {showAllSurahs ? "Show Less" : `Show all 114 Surahs`}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside id="reciters" className="aq-sidebar" style={{ width: 300, flexShrink: 0, position: "sticky", top: 80 }}>

            {/* Top Reciters */}
            <div style={{ background: "var(--aq-card)", borderRadius: 16, border: "1px solid var(--aq-border)", overflow: "hidden", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--aq-border)", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ color: "#f48c25", fontSize: 20 }}>groups</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--aq-text)" }}>Top Reciters</span>
              </div>
              <div style={{ padding: "12px 12px" }}>
                {topReciters.map((r: any, i: number) => (
                  <div
                    key={r.identifier}
                    onClick={() => handleReciterChange(r.identifier)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 10px", borderRadius: 12, cursor: "pointer",
                      background: selectedReciter === r.identifier ? "rgba(244,140,37,0.08)" : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (selectedReciter !== r.identifier) (e.currentTarget as HTMLElement).style.background = "var(--aq-hover)"; }}
                    onMouseLeave={e => { if (selectedReciter !== r.identifier) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Avatar placeholder */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: `hsl(${(i * 47 + 15) % 360}, 60%, 55%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 700, fontSize: 16,
                        border: selectedReciter === r.identifier ? "2px solid #f48c25" : "2px solid transparent",
                      }}>
                        {r.englishName.charAt(0)}
                      </div>
                      <div style={{
                        position: "absolute", bottom: -2, right: -2,
                        width: 18, height: 18, borderRadius: "50%",
                        background: i === 0 ? "#f48c25" : "#94a3b8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, color: "white", fontWeight: 700,
                        border: "2px solid var(--aq-card)",
                      }}>
                        {i + 1}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: selectedReciter === r.identifier ? "#f48c25" : "var(--aq-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.englishName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--aq-muted)" }}>{r.language?.toUpperCase()} • {r.format}</div>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#f48c25", opacity: selectedReciter === r.identifier ? 1 : 0, transition: "opacity 0.15s" }}>equalizer</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 20px", borderTop: "1px solid var(--aq-border)", textAlign: "center" }}>
                <button style={{ background: "none", border: "none", fontSize: 11, fontWeight: 700, color: "var(--aq-muted)", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}>View All Reciters</button>
              </div>
            </div>

            {/* CTA Card */}
            <div style={{ background: "rgba(244,140,37,0.08)", borderRadius: 16, border: "1px solid rgba(244,140,37,0.2)", padding: 24 }}>
              <h4 style={{ margin: "0 0 8px", fontWeight: 700, color: "#f48c25", fontSize: 15 }}>Enhance your experience</h4>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--aq-muted)", lineHeight: 1.6 }}>
                Create a profile to sync your favorite reciters and playlists across all your devices.
              </p>
              <button style={{ width: "100%", padding: "10px 0", background: "#f48c25", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(244,140,37,0.3)" }}>
                Get Started for Free
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* ── FIXED BOTTOM PLAYER ── */}
      <AnimatePresence>
        {nowPlayingSurah !== null && (
          <motion.footer
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="aq-player"
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60,
              background: "var(--aq-player-bg)",
              backdropFilter: "blur(16px)",
              borderTop: "1px solid var(--aq-border)",
              padding: "12px 32px",
              boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
            }}
          >
            <div className="aq-player-inner" style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>

              {/* Left: Track info */}
              <div className="aq-player-track" style={{ display: "flex", alignItems: "center", gap: 14, width: 240, flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: "white", fontSize: 22 }}>music_note</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--aq-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nowPlayingSurahData?.englishName || `Surah ${nowPlayingSurah}`}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--aq-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nowPlayingReciter?.englishName || selectedReciter} • Ayah {(nowPlayingAyahIndex ?? 0) + 1}
                  </div>
                </div>
                <button
                  onClick={handleStop}
                  title="Stop"
                  style={{ background: "none", border: "none", color: "var(--aq-muted)", cursor: "pointer", display: "flex", flexShrink: 0 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>

              {/* Center: Controls + seek */}
              <div className="aq-player-center" style={{ flex: 1, maxWidth: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <button
                    onClick={() => setIsShuffle(v => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: isShuffle ? "#f48c25" : "var(--aq-muted)", display: "flex" }}
                  >
                    <span className="material-symbols-outlined">shuffle</span>
                  </button>
                  <button onClick={handlePrev} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--aq-text)", display: "flex" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>skip_previous</span>
                  </button>
                  <button
                    onClick={isPlaying ? handlePause : handleResume}
                    style={{ width: 40, height: 40, borderRadius: "50%", background: "#f48c25", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(244,140,37,0.4)" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                      {isBuffering ? "hourglass_empty" : isPlaying ? "pause" : "play_arrow"}
                    </span>
                  </button>
                  <button onClick={handleNext} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--aq-text)", display: "flex" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>skip_next</span>
                  </button>
                  <button
                    onClick={() => setIsRepeat(v => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: isRepeat ? "#f48c25" : "var(--aq-muted)", display: "flex" }}
                  >
                    <span className="material-symbols-outlined">repeat</span>
                  </button>
                </div>
                {/* Seek bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--aq-muted)", fontVariantNumeric: "tabular-nums" }}>{formatTime(currentTimeState)}</span>
                  <div
                    onClick={handleProgressClick}
                    style={{ flex: 1, height: 5, background: "var(--aq-border)", borderRadius: 999, cursor: "pointer", position: "relative", overflow: "hidden" }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${progressPct}%`, background: "#f48c25", borderRadius: 999, transition: "width 0.1s" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--aq-muted)", fontVariantNumeric: "tabular-nums" }}>{formatTime(durationState)}</span>
                </div>
              </div>

              {/* Right: Volume */}
              <div className="aq-player-volume" style={{ display: "flex", alignItems: "center", gap: 12, width: 200, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setIsMuted(v => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--aq-muted)", display: "flex" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {isMuted || volume === 0 ? "volume_off" : volume < 0.4 ? "volume_down" : "volume_up"}
                  </span>
                </button>
                <input
                  type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
                  onChange={e => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                  style={{ width: 80, accentColor: "#f48c25", cursor: "pointer" }}
                />
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--aq-muted)", display: "flex" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>playlist_play</span>
                </button>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* ── CSS VARS + ANIMATIONS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        :root {
          --aq-bg: #f8f7f5;
          --aq-nav-bg: rgba(255,255,255,0.88);
          --aq-card: #ffffff;
          --aq-border: #e2e8f0;
          --aq-text: #0f172a;
          --aq-muted: #64748b;
          --aq-hover: #f8fafc;
          --aq-input-bg: #f1f5f9;
          --aq-thead: #f8fafc;
          --aq-player-bg: rgba(255,255,255,0.95);
        }
        [data-theme="dark"] {
          --aq-bg: #221910;
          --aq-nav-bg: rgba(34,25,16,0.90);
          --aq-card: #2d1f13;
          --aq-border: #3d2c1e;
          --aq-text: #f1f5f9;
          --aq-muted: #94a3b8;
          --aq-hover: #382415;
          --aq-input-bg: #3d2c1e;
          --aq-thead: #2a1c10;
          --aq-player-bg: rgba(34,25,16,0.97);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes waveBar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }

        .audio-quran-root a { color: var(--aq-muted); }
        .audio-quran-root a:hover { color: #f48c25; }
        input[type=range] { height: 4px; border-radius: 999px; }

        /* ===== MOBILE RESPONSIVE ===== */

        /* Tablet: hide sidebar, adjust table */
        @media (max-width: 1024px) {
          .aq-sidebar { display: none !important; }
          .aq-layout { gap: 0 !important; }
        }

        /* Mobile: <=768px */
        @media (max-width: 768px) {
          /* Header */
          .aq-header { padding: 0 16px !important; gap: 8px !important; }
          .aq-nav-links { display: none !important; }
          .aq-header-right { gap: 8px !important; }
          .aq-search-box { padding: 0 8px !important; height: 36px !important; }
          .aq-search-box input { width: 100px !important; font-size: 12px !important; }
          .aq-reciter-select { max-width: 120px !important; font-size: 11px !important; }
          .aq-join-btn { display: none !important; }

          /* Main padding — extra bottom only when player is open */
          .aq-main { padding: 16px 12px 24px !important; }
          .aq-player-open .aq-main { padding-bottom: 200px !important; }

          /* Hero */
          .aq-hero-inner { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }

          /* Table columns */
          .aq-hide-mobile { display: none !important; }

          /* Table cells padding */
          .audio-quran-root table th,
          .audio-quran-root table td { padding: 12px 12px !important; }

          /* Sidebar */
          .aq-sidebar { display: none !important; }

          /* Bottom Player - push above mobile nav */
          .aq-player { padding: 10px 12px !important; bottom: 68px !important; }
          .aq-player-inner { flex-direction: column !important; gap: 10px !important; }
          .aq-player-track { width: 100% !important; }
          .aq-player-center { width: 100% !important; max-width: none !important; }
          .aq-player-center > div:first-child { gap: 12px !important; }
          .aq-player-volume { display: none !important; }
        }

        /* Small mobile: <=480px */
        @media (max-width: 480px) {
          .aq-header { height: 56px !important; padding: 0 10px !important; }
          .aq-search-box input { width: 70px !important; }
          .aq-reciter-select { display: none !important; }

          .aq-main { padding: 12px 8px 24px !important; }
          .aq-player-open .aq-main { padding-bottom: 220px !important; }

          /* Table: tighter */
          .audio-quran-root table th,
          .audio-quran-root table td { padding: 10px 8px !important; }

          /* Bottom Player - minimal, above mobile nav */
          .aq-player { padding: 8px 10px !important; bottom: 68px !important; }
          .aq-player-track { gap: 10px !important; }
          .aq-player-track > div:first-child { width: 36px !important; height: 36px !important; }
        }
      `}</style>
    </div>
  );
}