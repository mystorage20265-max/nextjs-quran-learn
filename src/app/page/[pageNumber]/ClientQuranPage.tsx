"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TOTAL_PAGES = 604;

type Ayah = {
  number: number;
  arabic: string;
  translation?: string;
  surahNumber: number;
  numberInSurah: number;
  audioUrl?: string;
};

type ClientQuranPageProps = {
  pageNumber: number;
  translationEdition: string;
  audioEdition: string;
  ayahs: Ayah[];
};

/* ── Audio button (shared global singleton) ── */
function VerseAudioButton({ audioUrl, verseId, dark }: { audioUrl?: string; verseId: number; dark: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!(window as any)._globalVerseAudio) {
      (window as any)._globalVerseAudio = { audio: null, currentVerse: null, setPlayingStates: new Set<Function>() };
    }
    const g = (window as any)._globalVerseAudio;
    g.setPlayingStates.add(setIsPlaying);
    return () => {
      g.setPlayingStates.delete(setIsPlaying);
      if (g.currentVerse === verseId) {
        g.audio?.pause(); g.audio && (g.audio.currentTime = 0);
        g.currentVerse = null;
        g.setPlayingStates.forEach((fn: Function) => fn(false));
      }
    };
  }, [verseId]);

  const handleClick = () => {
    if (typeof window === 'undefined') return;
    const g = (window as any)._globalVerseAudio;
    if (g.currentVerse === verseId) {
      g.audio?.pause(); g.audio && (g.audio.currentTime = 0);
      g.currentVerse = null;
      g.setPlayingStates.forEach((fn: Function) => fn(false));
      return;
    }
    g.audio?.pause(); g.audio && (g.audio.currentTime = 0);
    g.setPlayingStates.forEach((fn: Function) => fn(false));
    if (!audioUrl) return;
    const audio = new window.Audio(audioUrl);
    g.audio = audio; g.currentVerse = verseId;
    setIsPlaying(true);
    audio.play();
    audio.onended = () => { g.currentVerse = null; g.setPlayingStates.forEach((fn: Function) => fn(false)); };
    audio.onerror = () => { g.currentVerse = null; g.setPlayingStates.forEach((fn: Function) => fn(false)); };
  };

  return (
    <button
      onClick={handleClick}
      disabled={!audioUrl}
      aria-label={isPlaying ? `Stop ayah ${verseId}` : `Play ayah ${verseId}`}
      style={{
        width: 38, height: 38, borderRadius: 10, border: 'none', cursor: audioUrl ? 'pointer' : 'not-allowed',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        transition: 'all 0.18s ease',
        background: isPlaying ? '#0ea5e9' : '#11d442',
        color: '#fff',
        boxShadow: isPlaying ? '0 0 12px rgba(14,165,233,0.35)' : '0 2px 8px rgba(17,212,66,0.25)',
        opacity: audioUrl ? 1 : 0.35,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        {isPlaying ? 'pause' : 'play_arrow'}
      </span>
    </button>
  );
}

function ClientQuranPage({ pageNumber, translationEdition, audioEdition, ayahs }: ClientQuranPageProps) {
  const totalPages = TOTAL_PAGES;
  const [dark, setDark] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [currentAutoVerse, setCurrentAutoVerse] = useState<number | null>(null);
  const audioQueueRef = useRef<HTMLAudioElement | null>(null);
  const stopFlag = useRef(false);

  const progressPercent = Math.round((pageNumber / totalPages) * 100);

  // Sync dark mode from <html>
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  async function handlePlaySequence() {
    setIsAutoPlaying(true);
    stopFlag.current = false;
    for (const ay of ayahs) {
      if (stopFlag.current) break;
      if (!ay.audioUrl) continue;
      setCurrentAutoVerse(ay.number);
      await new Promise<void>((resolve) => {
        if (audioQueueRef.current) { audioQueueRef.current.pause(); audioQueueRef.current = null; }
        const audio = new window.Audio(ay.audioUrl!);
        audioQueueRef.current = audio;
        audio.play();
        audio.onended = () => { audioQueueRef.current = null; resolve(); };
        audio.onerror = () => { audioQueueRef.current = null; resolve(); };
      });
    }
    setIsAutoPlaying(false);
    setCurrentAutoVerse(null);
  }

  function stopAutoPlay() {
    setIsAutoPlaying(false); setCurrentAutoVerse(null); stopFlag.current = true;
    if (audioQueueRef.current) { audioQueueRef.current.pause(); audioQueueRef.current = null; }
  }

  // Group ayahs by surah
  const surahGroups = React.useMemo(() => {
    const groups: { surahNumber: number; surahName: string; ayahs: Ayah[] }[] = [];
    for (const ay of ayahs) {
      const last = groups[groups.length - 1];
      if (last && last.surahNumber === ay.surahNumber) { last.ayahs.push(ay); }
      else { groups.push({ surahNumber: ay.surahNumber, surahName: `Surah ${ay.surahNumber}`, ayahs: [ay] }); }
    }
    return groups;
  }, [ayahs]);

  /* ── Style helpers matching homepage ── */
  const C = {
    bg: dark ? '#0d1b12' : '#ffffff',
    card: dark ? '#111f16' : '#ffffff',
    cardBorder: dark ? '#1e3a2a' : '#f1f5f9',
    text: dark ? '#e2e8e5' : '#0f172a',
    muted: '#94a3b8',
    green: '#11d442',
    greenSoft: 'rgba(17,212,66,0.08)',
    greenBorder: 'rgba(17,212,66,0.18)',
    greenGlow: '0 4px 14px rgba(17,212,66,0.3)',
    greenGlowSm: '0 2px 8px rgba(17,212,66,0.2)',
    hoverBg: dark ? '#1a2f1f' : '#f0fdf4',
    shadow: '0 1px 4px rgba(0,0,0,0.06)',
    font: "'Figtree','Lexend',sans-serif",
  };

  return (
    <>
      <style>{`
        .qp-dot{background-image:radial-gradient(circle at 2px 2px,rgba(17,212,66,0.06) 1px,transparent 0);background-size:24px 24px}
        .qp-scroll::-webkit-scrollbar{width:5px}.qp-scroll::-webkit-scrollbar-track{background:transparent}.qp-scroll::-webkit-scrollbar-thumb{background:rgba(17,212,66,0.25);border-radius:3px}
        .verse-card{transition:transform 0.18s ease,box-shadow 0.18s ease}.verse-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(17,212,66,0.12) !important}
        .page-btn{transition:all 0.15s ease}.page-btn:hover:not(:disabled){transform:scale(1.03);box-shadow:0 4px 14px rgba(17,212,66,0.25)}
        .font-arabic{font-family:'Naskh IndoPak',serif}
        @media(max-width:640px){.qp-header-inner{padding:20px 16px !important}.qp-stats{flex-direction:row;gap:12px !important}.qp-stat-divider{display:none !important}.qp-btns{flex-direction:column !important;gap:10px !important}.qp-btn{width:100% !important;min-width:0 !important}}
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg, fontFamily: C.font }}>
        <main className="qp-scroll qp-dot" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px 60px' }}>

            {/* ── Hero Header ── */}
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, boxShadow: C.shadow, marginBottom: 24, overflow: 'hidden', position: 'relative' }}>
              {/* Top green accent bar */}
              <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${C.green}, #059669, transparent)` }} />

              <div className="qp-header-inner" style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
                {/* Eyebrow badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: C.greenSoft, border: `1px solid ${C.greenBorder}`, borderRadius: 999, fontSize: 11, fontWeight: 600, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>menu_book</span>
                  Mushaf Page
                </div>

                {/* Arabic title */}
                <div className="font-arabic" style={{ fontSize: 'clamp(28px, 7vw, 42px)', color: C.green, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>
                  صفحة {pageNumber}
                </div>

                {/* English title */}
                <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 700, color: C.text, margin: '6px 0 4px', letterSpacing: '-0.02em' }}>
                  Quran Page {pageNumber}
                </h1>

                <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Section of the Holy Quran</p>

                {/* Stats row */}
                <div className="qp-stats" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginBottom: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: C.green }}>{ayahs.length}</div>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>Verses</div>
                  </div>
                  <div className="qp-stat-divider" style={{ width: 1, height: 36, background: C.cardBorder }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{pageNumber}</div>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>of {totalPages}</div>
                  </div>
                  <div className="qp-stat-divider" style={{ width: 1, height: 36, background: C.cardBorder }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{surahGroups.length}</div>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{surahGroups.length === 1 ? 'Surah' : 'Surahs'}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ maxWidth: 320, margin: '0 auto 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 500 }}>
                    <span>Progress</span>
                    <span style={{ color: C.green }}>{progressPercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: 5, borderRadius: 999, background: dark ? '#1e3a2a' : '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPercent}%`, borderRadius: 999, background: `linear-gradient(90deg, ${C.green}, #059669)`, boxShadow: '0 0 10px rgba(17,212,66,0.4)', transition: 'width 0.8s ease' }} />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="qp-btns" style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
                  <button
                    className="page-btn qp-btn"
                    onClick={() => (isAutoPlaying ? stopAutoPlay() : handlePlaySequence())}
                    style={{
                      background: isAutoPlaying ? '#ef4444' : C.green, color: '#fff', fontWeight: 700, fontSize: 14,
                      borderRadius: 12, padding: '11px 28px', border: 'none', cursor: 'pointer', minWidth: 160,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: isAutoPlaying ? '0 4px 14px rgba(239,68,68,0.3)' : C.greenGlow,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{isAutoPlaying ? 'stop' : 'play_arrow'}</span>
                    {isAutoPlaying ? 'Stop' : 'Play All'}
                  </button>
                  <Link href="/"
                    className="page-btn qp-btn"
                    style={{
                      background: dark ? '#1e3a2a' : '#f1f5f9', color: dark ? '#e2e8e5' : '#475569',
                      fontWeight: 600, fontSize: 14, borderRadius: 12, padding: '11px 28px', minWidth: 160,
                      border: `1px solid ${C.cardBorder}`, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Verse Cards ── */}
            {surahGroups.map((group) => (
              <React.Fragment key={group.surahNumber}>
                {/* Surah divider */}
                {surahGroups.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px', padding: '0 4px' }}>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.greenBorder}, transparent)` }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.green, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{group.surahName}</span>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.greenBorder}, transparent)` }} />
                  </div>
                )}

                {group.ayahs.map((ay) => {
                  const active = currentAutoVerse === ay.number;
                  return (
                    <div
                      key={ay.number}
                      className="verse-card"
                      style={{
                        background: active ? (dark ? '#1a2f1f' : '#f0fdf4') : C.card,
                        border: `1px solid ${active ? C.green : C.cardBorder}`,
                        borderRadius: 16,
                        boxShadow: active ? `0 0 20px rgba(17,212,66,0.15), ${C.shadow}` : C.shadow,
                        marginBottom: 16,
                        overflow: 'hidden',
                        transition: 'all 0.25s ease',
                      }}
                    >
                      {/* Verse header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 16px',
                        background: dark ? 'rgba(17,212,66,0.03)' : 'rgba(17,212,66,0.02)',
                        borderBottom: `1px solid ${dark ? '#1e3a2a44' : '#f1f5f9'}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {/* Verse number badge */}
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: C.greenSoft, border: `1px solid ${C.greenBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 14, color: C.green,
                          }}>
                            {ay.numberInSurah}
                          </div>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Verse {ay.numberInSurah}</span>
                            <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>#{ay.number}</span>
                          </div>
                        </div>
                        <VerseAudioButton audioUrl={ay.audioUrl} verseId={ay.number} dark={dark} />
                      </div>

                      {/* Verse content */}
                      <div style={{ padding: '20px 20px 18px' }}>
                        {/* Arabic text */}
                        <div className="font-arabic" style={{
                          fontSize: 'clamp(22px, 5vw, 28px)',
                          color: C.text, direction: 'rtl', textAlign: 'right',
                          lineHeight: 2.1, marginBottom: 16, paddingBottom: 16,
                          borderBottom: `1px solid ${dark ? '#1e3a2a44' : '#f1f5f9'}`,
                        }}>
                          {ay.arabic}
                        </div>

                        {/* Translation */}
                        {ay.translation && (
                          <div style={{
                            fontSize: 14, lineHeight: 1.75, color: C.muted,
                            borderLeft: `3px solid ${C.green}`, paddingLeft: 14,
                            direction: 'ltr', textAlign: 'left',
                          }}>
                            {ay.translation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

            {/* ── Pagination ── */}
            <div style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: 16, boxShadow: C.shadow, marginTop: 28, overflow: 'hidden',
            }}>
              {/* Progress bar top */}
              <div style={{ height: 3, background: dark ? '#1e3a2a' : '#f1f5f9' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, background: `linear-gradient(90deg, ${C.green}, #059669)`, transition: 'width 0.5s ease' }} />
              </div>

              <div style={{ padding: '18px 20px' }}>
                <div style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginBottom: 14 }}>
                  Page <span style={{ fontWeight: 700, color: C.green }}>{pageNumber}</span> of {totalPages}
                </div>

                {/* Page number pills — desktop */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                  {pageNumber > 2 && (
                    <Link href="/page/1" style={{ textDecoration: 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: C.muted, background: dark ? '#111f16' : '#f8fafc', border: `1px solid ${C.cardBorder}`, cursor: 'pointer', transition: 'all 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.green; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = C.green; }}
                        onMouseLeave={e => { e.currentTarget.style.background = dark ? '#111f16' : '#f8fafc'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.cardBorder; }}
                      >1</div>
                    </Link>
                  )}
                  {pageNumber > 3 && <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: C.muted, padding: '0 2px' }}>…</span>}
                  {[pageNumber - 1, pageNumber, pageNumber + 1].filter(p => p >= 1 && p <= totalPages).map(p => (
                    <Link key={p} href={`/page/${p}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, cursor: p === pageNumber ? 'default' : 'pointer',
                        transition: 'all 0.12s',
                        background: p === pageNumber ? C.green : (dark ? '#111f16' : '#f8fafc'),
                        color: p === pageNumber ? '#fff' : C.muted,
                        border: `1px solid ${p === pageNumber ? C.green : C.cardBorder}`,
                        boxShadow: p === pageNumber ? C.greenGlowSm : 'none',
                      }}
                        onMouseEnter={e => { if (p !== pageNumber) { e.currentTarget.style.background = C.green; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = C.green; }}}
                        onMouseLeave={e => { if (p !== pageNumber) { e.currentTarget.style.background = dark ? '#111f16' : '#f8fafc'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.cardBorder; }}}
                      >{p}</div>
                    </Link>
                  ))}
                  {pageNumber < totalPages - 2 && <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: C.muted, padding: '0 2px' }}>…</span>}
                  {pageNumber < totalPages - 1 && (
                    <Link href={`/page/${totalPages}`} style={{ textDecoration: 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: C.muted, background: dark ? '#111f16' : '#f8fafc', border: `1px solid ${C.cardBorder}`, cursor: 'pointer', transition: 'all 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.green; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = C.green; }}
                        onMouseLeave={e => { e.currentTarget.style.background = dark ? '#111f16' : '#f8fafc'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.cardBorder; }}
                      >{totalPages}</div>
                    </Link>
                  )}
                </div>

                {/* Prev / Next buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link
                    href={pageNumber > 1 ? `/page/${pageNumber - 1}` : '#'}
                    className="page-btn"
                    onClick={e => pageNumber <= 1 && e.preventDefault()}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '11px 16px', borderRadius: 12, textDecoration: 'none',
                      fontWeight: 600, fontSize: 14,
                      background: pageNumber <= 1 ? (dark ? '#111f16' : '#f8fafc') : C.greenSoft,
                      color: pageNumber <= 1 ? C.muted : C.green,
                      border: `1px solid ${pageNumber <= 1 ? C.cardBorder : C.greenBorder}`,
                      opacity: pageNumber <= 1 ? 0.5 : 1,
                      cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                    Previous
                  </Link>
                  <Link
                    href={pageNumber < totalPages ? `/page/${pageNumber + 1}` : '#'}
                    className="page-btn"
                    onClick={e => pageNumber >= totalPages && e.preventDefault()}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '11px 16px', borderRadius: 12, textDecoration: 'none',
                      fontWeight: 600, fontSize: 14,
                      background: pageNumber >= totalPages ? (dark ? '#111f16' : '#f8fafc') : C.green,
                      color: pageNumber >= totalPages ? C.muted : '#fff',
                      border: `1px solid ${pageNumber >= totalPages ? C.cardBorder : C.green}`,
                      opacity: pageNumber >= totalPages ? 0.5 : 1,
                      cursor: pageNumber >= totalPages ? 'not-allowed' : 'pointer',
                      boxShadow: pageNumber >= totalPages ? 'none' : C.greenGlow,
                    }}
                  >
                    Next
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

export default ClientQuranPage;

