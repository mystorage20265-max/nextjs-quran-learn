"use client";

import React, { useEffect, useRef, useState } from "react";
import "./juz-header.css";

type Ayah = {
  number: number;
  numberInSurah?: number;
  surah?: { number: number; englishName?: string; name?: string };
  text?: string;
  translation?: string;
};

// Helper: group ayahs by surah
function groupAyahsBySurah(ayahs: Ayah[]) {
  const groups: { surah: Ayah["surah"]; ayahs: Ayah[] }[] = [];
  let currentSurah: Ayah["surah"] | null = null;
  let currentAyahs: Ayah[] = [];
  for (const ayah of ayahs) {
    if (!currentSurah || ayah.surah?.number !== currentSurah.number) {
      if (currentSurah) groups.push({ surah: currentSurah, ayahs: currentAyahs });
      currentSurah = ayah.surah;
      currentAyahs = [ayah];
    } else {
      currentAyahs.push(ayah);
    }
  }
  if (currentSurah) groups.push({ surah: currentSurah, ayahs: currentAyahs });
  return groups;
}

export default function JuzViewerClient({ ayahs, juz }: { ayahs: Ayah[]; juz: number }) {
  // Navigation handlers for Juz navigation
  const handleGoToPreviousJuz = () => {
    if (juz > 1) {
      window.location.href = `/juz/${juz - 1}`;
    }
  };

  const handleGoToNextJuz = () => {
    if (juz < 30) {
      window.location.href = `/juz/${juz + 1}`;
    }
  };
  // --- State for audio and autoplay ---
  const [currentIndex, setCurrentIndex] = useState<number | null>(null); // current ayah index
  const [playing, setPlaying] = useState(false); // is audio playing
  const [autoplay, setAutoplay] = useState(false); // autoplay enabled
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioMap, setAudioMap] = useState<Map<number, string>>(new Map()); // ayah.number -> audio URL
  const [userGestureHint, setUserGestureHint] = useState(false); // show hint if browser blocks autoplay
  const audioRef = useRef<HTMLAudioElement | null>(null);


  // --- Build audioMap (ayah.number -> audio URL) on mount ---
  useEffect(() => {
    const map = new Map<number, string>();
    ayahs.forEach(a => {
      // AlQuran.cloud audio endpoint
      map.set(a.number, `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${a.number}.mp3`);
    });
    setAudioMap(map);
  }, [ayahs]);

  // --- Setup shared HTMLAudioElement ---
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // --- Handle audio end event for autoplay ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      console.log("Audio ended", currentIndex);
      if (autoplay && currentIndex !== null && currentIndex < ayahs.length - 1) {
        // Find next ayah with audio
        let next = currentIndex + 1;
        while (next < ayahs.length && !audioMap.get(ayahs[next].number)) next++;
        if (next < ayahs.length) {
          console.log("Autoplay: playing next index", next);
          playIndex(next);
        } else {
          setPlaying(false);
        }
      } else {
        setPlaying(false);
      }
    };
    audio.addEventListener("ended", onEnded);
    return () => { audio.removeEventListener("ended", onEnded); };
  }, [autoplay, currentIndex, ayahs, audioMap]);

  // --- Play/Pause logic ---
  async function playIndex(idx: number) {
    const a = ayahs[idx];
    if (!a) return;
    const audioUrl = audioMap.get(a.number);
    if (!audioRef.current || !audioUrl) {
      setAudioError("Audio missing for this ayah");
      if (autoplay) {
        // Skip to next if autoplay
        let next = idx + 1;
        while (next < ayahs.length && !audioMap.get(ayahs[next].number)) next++;
        if (next < ayahs.length) playIndex(next);
      }
      return;
    }
    audioRef.current.src = audioUrl;
    try {
      await audioRef.current.play();
      setCurrentIndex(idx);
      setPlaying(true);
      setAudioError(null);
      setUserGestureHint(false);
      console.log("Playing ayah", idx);
    } catch (e) {
      setPlaying(false);
      setUserGestureHint(true);
      setAudioError("Audio playback failed. Click Play to enable audio.");
      console.error("Autoplay failed (user interaction required)", e);
    }
  }

  function togglePlayPause(idx: number) {
    if (currentIndex === idx && playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      playIndex(idx);
    }
  }

  function playNext() { if (currentIndex !== null && currentIndex + 1 < ayahs.length) playIndex(currentIndex + 1); }
  function playPrev() { if (currentIndex !== null && currentIndex > 0) playIndex(currentIndex - 1); }

  // --- Autoplay button logic ---
  function handleAutoplayClick() {
    setAutoplay(v => {
      const next = !v;
      if (next) {
        // Start from first ayah if not already playing
        if (currentIndex === null || !playing) {
          playIndex(currentIndex !== null ? currentIndex : 0);
        }
      } else {
        // Stop audio playback immediately when autoplay is turned off
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setPlaying(false);
      }
      return next;
    });
  }

  // UI: group ayahs by surah for surah headers
  const surahGroups = groupAyahsBySurah(ayahs);

  // Pagination logic
  const pageSize = 50;
  const totalAyahs = ayahs.length;
  const totalPages = Math.ceil(totalAyahs / pageSize);
  const [page, setPage] = useState(1);
  const pagedAyahs = ayahs.slice((page - 1) * pageSize, page * pageSize);
  const pagedSurahGroups = groupAyahsBySurah(pagedAyahs);

  // Dark mode detection (same as homepage)
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Design system matching homepage
  const S = {
    shell: { display: 'flex', flexDirection: 'column' as const, flex: 1, minHeight: '100vh', background: dark ? '#0d1b12' : '#f6f8f6', fontFamily: "'Figtree','Lexend',sans-serif" },
    card: { background: dark ? '#111f16' : 'white', border: `1px solid ${dark ? '#1e3a2a' : '#f1f5f9'}`, borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
    text: { color: dark ? '#e2e8e5' : '#0f172a' },
    muted: { color: '#94a3b8' },
  };

  // Header UI matching homepage design
  return (
    <div style={S.shell}>
      <style>{`
        .juz-scroll::-webkit-scrollbar{width:5px}.juz-scroll::-webkit-scrollbar-track{background:transparent}.juz-scroll::-webkit-scrollbar-thumb{background:rgba(17,212,66,0.25);border-radius:3px}
        .font-arabic{font-family:'Noto Sans Arabic','KFGQPC Uthmanic Script HAFS',serif}
        .verse-card{transition:transform 0.18s ease,box-shadow 0.18s ease}.verse-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(17,212,66,0.12)}
        .juz-dot{background-image:radial-gradient(circle at 2px 2px,rgba(17,212,66,0.06) 1px,transparent 0);background-size:24px 24px}
        .filter-btn{padding:6px 14px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.15s}
        @media(max-width:640px){
          .juz-content{padding:16px 16px 60px !important}
          .juz-header-inner{padding:12px 16px !important}
        }
        @media(min-width:640px){
          .juz-content{padding:20px 24px 60px !important}
          .juz-header-inner{padding:12px 24px !important}
        }
      `}</style>

      <main className="juz-scroll juz-dot" style={{ flex: 1, overflowY: 'auto', minHeight: 0, background: dark ? '#0d1b12' : '#f6f8f6' }}>
        {/* Sticky Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 10, background: dark ? 'rgba(13,27,18,0.9)' : 'rgba(246,248,246,0.88)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${dark ? 'rgba(30,58,42,0.6)' : 'rgba(226,232,240,0.6)'}` }}>
          <div className="juz-header-inner" style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, ...S.text }}>Juz {juz} of 30</h1>
              <p style={{ margin: '2px 0 0 0', fontSize: 12, ...S.muted }}>Section of the Holy Quran</p>
            </div>
            <a href="/quran" style={{ background: '#11d442', color: 'white', borderRadius: 12, padding: '9px 14px', fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(17,212,66,0.3)', textDecoration: 'none', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              <span className="hp-qs-hide" style={{ display: 'none' }}>Back</span>
            </a>
          </div>
        </header>

        <div className="juz-content" style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* ── STATS BAR ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
            <div style={{ ...S.card, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#11d442' }}>{totalAyahs}</span>
              <span style={{ fontSize: 11, ...S.muted, fontWeight: 500 }}>Total Verses</span>
            </div>
            <div style={{ ...S.card, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#11d442' }}>{totalPages}</span>
              <span style={{ fontSize: 11, ...S.muted, fontWeight: 500 }}>Total Pages</span>
            </div>
          </div>

          {/* ── JUZ INFO CARD ── */}
          <div style={{ ...S.card, padding: 18, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#11d442', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Juz Information</span>
              <span className="material-symbols-outlined" style={{ color: '#cbd5e1', fontSize: 18 }}>info</span>
            </div>
            <h3 className="font-arabic" style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 18, ...S.text, textAlign: 'right', direction: 'rtl' }}>{juz} جُزْء</h3>
            <p style={{ margin: '0 0 12px', fontSize: 13, ...S.muted }}>From Surah <strong>{surahGroups[0]?.surah?.englishName}</strong> (Ayah {surahGroups[0]?.ayahs[0]?.numberInSurah}) to Surah <strong>{surahGroups[surahGroups.length-1]?.surah?.englishName}</strong></p>
            <p className="font-arabic" style={{ margin: 0, fontSize: 12, ...S.muted, textAlign: 'right', direction: 'rtl' }}>{surahGroups[0]?.surah?.name} إلى {surahGroups[surahGroups.length-1]?.surah?.name}</p>
          </div>

          {/* ── AUTOPLAY CONTROL ── */}
          <div style={{ marginBottom: 24 }}>
            <button
              style={{ width: '100%', background: autoplay ? '#dc2626' : '#11d442', color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 12, padding: '12px 16px', border: 0, cursor: 'pointer', boxShadow: '0 4px 14px rgba(17,212,66,0.3)', transition: 'all 0.2s' }}
              onClick={handleAutoplayClick}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }}>{autoplay ? 'stop_circle' : 'play_circle'}</span>
              {autoplay ? 'Stop Autoplay' : 'Start Autoplay'}
            </button>
            {userGestureHint && (
              <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#f59e0b', ...S.muted }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>info</span>
                Click Play to enable audio (browser policy)
              </p>
            )}
          </div>

          {/* ── VERSES LIST ── */}
          {pagedAyahs.map((ayah, idx) => (
            <div key={ayah.number} className="verse-card" style={{
              ...S.card,
              padding: '16px 14px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}>
              {/* Verse number and play button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48, gap: 6, flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(17,212,66,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#11d442', fontSize: 12 }}>
                  {ayah.numberInSurah}
                </div>
                <button
                  onClick={() => togglePlayPause((page - 1) * pageSize + idx)}
                  style={{ width: 36, height: 36, border: 0, borderRadius: 8, background: '#11d442', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  aria-label={playing && currentIndex === (page - 1) * pageSize + idx ? 'Pause' : 'Play'}
                >
                  {playing && currentIndex === (page - 1) * pageSize + idx ? (
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>pause</span>
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
                  )}
                </button>
              </div>
              {/* Arabic text and translation */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-arabic" style={{ fontSize: '1.5rem', color: dark ? '#e2e8e5' : '#0f172a', marginBottom: 8, textAlign: 'right', direction: 'rtl', lineHeight: 1.8 }}>{ayah.text}</div>
                <div style={{ fontSize: '0.95rem', color: '#94a3b8', textAlign: 'left', direction: 'ltr', borderLeft: '3px solid #11d442', paddingLeft: 12, lineHeight: 1.6 }}>{ayah.translation}</div>
              </div>
            </div>
          ))}

          {/* ── PAGINATION ── */}
          <div style={{ ...S.card, borderRadius: 12, padding: '16px', margin: '24px auto 0 auto', maxWidth: 600, textAlign: 'center' }}>
            <div style={{ fontSize: 13, ...S.muted, marginBottom: 12 }}>
              Verses {(page-1)*pageSize+1} – {Math.min(page*pageSize, totalAyahs)} of {totalAyahs} | Page {page}/{totalPages}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <button
                style={{ background: page === 1 ? '#cbd5e1' : '#11d442', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '8px 16px', border: 0, cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: page === 1 ? 0.5 : 1 }}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>arrow_back</span>
                Previous
              </button>
              <span style={{ fontWeight: 600, fontSize: 13, ...S.text, minWidth: 80 }}>Page {page}/{totalPages}</span>
              <button
                style={{ background: page === totalPages ? '#cbd5e1' : '#11d442', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '8px 16px', border: 0, cursor: page === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: page === totalPages ? 0.5 : 1 }}
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginLeft: 4 }}>arrow_forward</span>
              </button>
            </div>

            {/* Juz Navigation */}
            {page === totalPages && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${dark ? '#1e3a2a' : '#f1f5f9'}` }}>
                <p style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 600, ...S.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Navigate Juz</p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                  <button
                    style={{ background: juz === 1 ? '#cbd5e1' : '#11d442', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '8px 14px', border: 0, cursor: juz === 1 ? 'not-allowed' : 'pointer', opacity: juz === 1 ? 0.5 : 1 }}
                    onClick={handleGoToPreviousJuz}
                    disabled={juz === 1}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>arrow_back</span>
                    Prev Juz
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 13, ...S.text, minWidth: 70, textAlign: 'center' }}>Juz {juz}/30</span>
                  <button
                    style={{ background: juz === 30 ? '#cbd5e1' : '#11d442', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '8px 14px', border: 0, cursor: juz === 30 ? 'not-allowed' : 'pointer', opacity: juz === 30 ? 0.5 : 1 }}
                    onClick={handleGoToNextJuz}
                    disabled={juz === 30}
                  >
                    Next Juz
                    <span className="material-symbols-outlined" style={{ fontSize: 16, marginLeft: 4 }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
