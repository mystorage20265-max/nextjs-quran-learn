"use client";
import React from "react";
import Navbar from '../../../components/Navbar/Navbar';

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

function VerseAudioButton({ audioUrl, verseId }: { audioUrl?: string; verseId: number }) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!(window as any)._globalVerseAudio) {
      (window as any)._globalVerseAudio = {
        audio: null,
        currentVerse: null,
        setPlayingStates: new Set<Function>(),
      };
    }
    const globalAudio = (window as any)._globalVerseAudio;
    globalAudio.setPlayingStates.add(setIsPlaying);
    return () => {
      globalAudio.setPlayingStates.delete(setIsPlaying);
      if (globalAudio.currentVerse === verseId) {
        if (globalAudio.audio) {
          globalAudio.audio.pause();
          globalAudio.audio.currentTime = 0;
        }
        globalAudio.currentVerse = null;
        globalAudio.setPlayingStates.forEach((fn: Function) => fn(false));
      }
    };
  }, [verseId]);

  const handleClick = () => {
    if (typeof window === 'undefined') return;
    const globalAudio = (window as any)._globalVerseAudio;
    if (globalAudio.currentVerse === verseId) {
      if (globalAudio.audio) {
        globalAudio.audio.pause();
        globalAudio.audio.currentTime = 0;
      }
      globalAudio.currentVerse = null;
      globalAudio.setPlayingStates.forEach((fn: Function) => fn(false));
      return;
    }
    if (globalAudio.audio) {
      globalAudio.audio.pause();
      globalAudio.audio.currentTime = 0;
    }
    globalAudio.setPlayingStates.forEach((fn: Function) => fn(false));
    if (!audioUrl) return;
    const audio = new window.Audio(audioUrl);
    globalAudio.audio = audio;
    globalAudio.currentVerse = verseId;
    setIsPlaying(true);
    audio.play();
    audio.onended = () => {
      globalAudio.currentVerse = null;
      globalAudio.setPlayingStates.forEach((fn: Function) => fn(false));
    };
    audio.onerror = () => {
      globalAudio.currentVerse = null;
      globalAudio.setPlayingStates.forEach((fn: Function) => fn(false));
    };
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-0 flex items-center justify-center
        text-lg cursor-pointer transition-all duration-200
        ${!audioUrl ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
        ${isPlaying
          ? 'bg-[var(--accent-teal)] text-[var(--text-inverse)] shadow-[0_0_16px_rgba(45,212,191,0.3)]'
          : 'bg-[var(--brand-primary)] text-[var(--text-inverse)] shadow-[0_2px_8px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.3)]'
        }
      `}
      aria-label={isPlaying ? `Stop ayah ${verseId}` : `Play ayah ${verseId}`}
      title={isPlaying ? `Stop ayah ${verseId}` : `Play ayah ${verseId}`}
      aria-pressed={isPlaying}
      disabled={!audioUrl}
    >
      {isPlaying ? '⏸' : '▶'}
    </button>
  );
}

function ClientQuranPage({ pageNumber, translationEdition, audioEdition, ayahs }: ClientQuranPageProps) {
  const totalPages = TOTAL_PAGES;
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(false);
  const [currentAutoVerse, setCurrentAutoVerse] = React.useState<number | null>(null);
  const audioQueueRef = React.useRef<HTMLAudioElement | null>(null);
  const stopFlag = React.useRef(false);

  const progressPercent = Math.round((pageNumber / totalPages) * 100);

  async function handlePlaySequence() {
    setIsAutoPlaying(true);
    stopFlag.current = false;
    for (const ay of ayahs) {
      if (stopFlag.current) break;
      if (!ay.audioUrl) continue;
      setCurrentAutoVerse(ay.number);
      await new Promise<void>((resolve) => {
        if (audioQueueRef.current) {
          audioQueueRef.current.pause();
          audioQueueRef.current = null;
        }
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
    setIsAutoPlaying(false);
    setCurrentAutoVerse(null);
    stopFlag.current = true;
    if (audioQueueRef.current) {
      audioQueueRef.current.pause();
      audioQueueRef.current = null;
    }
  }

  // Group ayahs by surah for section dividers
  const surahGroups = React.useMemo(() => {
    const groups: { surahNumber: number; surahName: string; ayahs: Ayah[] }[] = [];
    for (const ay of ayahs) {
      const last = groups[groups.length - 1];
      if (last && last.surahNumber === ay.surahNumber) {
        last.ayahs.push(ay);
      } else {
        groups.push({ surahNumber: ay.surahNumber, surahName: `Surah ${ay.surahNumber}`, ayahs: [ay] });
      }
    }
    return groups;
  }, [ayahs]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-12 pt-2">
        <div className="max-w-3xl mx-auto px-3 sm:px-5 md:px-6">

          {/* Hero Header */}
          <header className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-6 sm:mb-8"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%23f59e0b' stroke-width='1'/%3E%3C/svg%3E")`,
              }}
            />
            {/* Top gradient accent */}
            <div className="h-1 sm:h-1.5 w-full"
              style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--accent-teal), var(--brand-primary))' }}
            />

            <div className="relative z-10 text-center py-8 sm:py-10 px-4 sm:px-8">
              {/* Arabic title */}
              <div className="arabic-text text-3xl sm:text-4xl md:text-5xl mb-1"
                style={{ color: 'var(--brand-primary)', fontWeight: 700 }}
              >
                صفحة {pageNumber}
              </div>

              {/* English title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2 mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Quran Page {pageNumber}
              </h1>

              <p className="text-sm sm:text-base mb-6"
                style={{ color: 'var(--text-muted)' }}
              >
                Section of the Holy Quran
              </p>

              {/* Stats row */}
              <div className="flex justify-center items-center gap-6 sm:gap-10 mb-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                    {ayahs.length}
                  </div>
                  <div className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>Verses</div>
                </div>
                <div className="w-px h-10 sm:h-12" style={{ background: 'var(--border-default)' }} />
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--accent-teal)' }}>
                    {pageNumber}
                  </div>
                  <div className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>of {totalPages}</div>
                </div>
                <div className="w-px h-10 sm:h-12" style={{ background: 'var(--border-default)' }} />
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {surahGroups.length}
                  </div>
                  <div className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                    {surahGroups.length === 1 ? 'Surah' : 'Surahs'}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto mb-6">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, var(--brand-primary), var(--accent-teal))',
                    }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => (isAutoPlaying ? stopAutoPlay() : handlePlaySequence())}
                  className={`
                    flex items-center justify-center gap-2 font-semibold text-sm sm:text-base
                    rounded-xl px-5 sm:px-7 py-3 border-0 cursor-pointer
                    transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]
                    min-w-[140px] sm:min-w-[170px]
                  `}
                  style={{
                    background: isAutoPlaying
                      ? 'var(--status-error)'
                      : 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover))',
                    color: 'var(--text-inverse)',
                    boxShadow: isAutoPlaying
                      ? '0 4px 16px rgba(248,113,113,0.3)'
                      : '0 4px 16px rgba(245,158,11,0.3)',
                  }}
                  aria-label={isAutoPlaying ? 'Stop Auto-Play' : 'Auto-Play Page'}
                >
                  {isAutoPlaying ? (
                    <><span className="text-lg">⏹</span> Stop</>
                  ) : (
                    <><span className="text-lg">▶</span> Play All</>
                  )}
                </button>

                <button
                  onClick={() => window.location.href = '/quran'}
                  className="
                    flex items-center justify-center gap-2 font-semibold text-sm sm:text-base
                    rounded-xl px-5 sm:px-7 py-3 cursor-pointer
                    transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]
                    min-w-[140px] sm:min-w-[170px]
                  "
                  style={{
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1.5px solid var(--border-strong)',
                  }}
                  aria-label="Back to Quran"
                >
                  ← Back to Quran
                </button>
              </div>
            </div>
          </header>

          {/* Verse Cards */}
          <section className="space-y-4 sm:space-y-5">
            {surahGroups.map((group) => (
              <React.Fragment key={group.surahNumber}>
                {/* Surah divider (only if multiple surahs on page) */}
                {surahGroups.length > 1 && (
                  <div className="ornamental-divider text-xs sm:text-sm font-semibold my-4 sm:my-6 px-2"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    {group.surahName}
                  </div>
                )}

                {group.ayahs.map((ay) => {
                  const isHighlighted = currentAutoVerse === ay.number;
                  return (
                    <article
                      key={ay.number}
                      className={`
                        relative rounded-xl sm:rounded-2xl overflow-hidden
                        transition-all duration-300
                        ${isHighlighted ? 'scale-[1.01] ring-2' : 'hover:-translate-y-0.5'}
                      `}
                      style={{
                        background: 'var(--bg-card)',
                        border: `1px solid ${isHighlighted ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                        boxShadow: isHighlighted ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                        ...(isHighlighted ? { '--tw-ring-color': 'var(--brand-primary-soft)' } as React.CSSProperties : {}),
                      }}
                    >
                      {/* Verse header bar */}
                      <div
                        className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5"
                        style={{
                          background: 'var(--bg-surface)',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Verse number badge */}
                          <span
                            className="
                              inline-flex items-center justify-center
                              w-8 h-8 sm:w-9 sm:h-9 rounded-lg
                              text-xs sm:text-sm font-bold
                            "
                            style={{
                              background: 'var(--brand-primary-soft)',
                              color: 'var(--brand-primary)',
                              border: '1px solid var(--brand-primary)',
                              borderColor: 'rgba(245,158,11,0.2)',
                            }}
                          >
                            {ay.numberInSurah}
                          </span>
                          <span className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                            Verse {ay.numberInSurah}
                          </span>
                        </div>
                        <VerseAudioButton audioUrl={ay.audioUrl} verseId={ay.number} />
                      </div>

                      {/* Verse content */}
                      <div className="px-4 sm:px-6 py-4 sm:py-6">
                        {/* Arabic text */}
                        <div
                          className="arabic-text text-2xl sm:text-3xl md:text-[2rem] leading-[2.2] mb-4 sm:mb-5 pb-4 sm:pb-5"
                          style={{
                            color: 'var(--text-arabic)',
                            borderBottom: '1px solid var(--border-subtle)',
                          }}
                        >
                          {ay.arabic}
                        </div>

                        {/* Translation */}
                        {ay.translation && (
                          <div
                            className="text-sm sm:text-base leading-relaxed pl-3 sm:pl-4"
                            style={{
                              color: 'var(--text-secondary)',
                              borderLeft: '3px solid var(--brand-primary)',
                              direction: 'ltr',
                              textAlign: 'left',
                            }}
                          >
                            {ay.translation}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </React.Fragment>
            ))}
          </section>

          {/* Pagination */}
          <nav className="mt-8 sm:mt-10 rounded-xl sm:rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-md)',
            }}
            aria-label="Page navigation"
          >
            {/* Mini progress bar */}
            <div className="h-1 w-full" style={{ background: 'var(--bg-surface)' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, var(--brand-primary), var(--accent-teal))',
                }}
              />
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-center text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Page <span className="font-bold" style={{ color: 'var(--brand-primary)' }}>{pageNumber}</span> of {totalPages}
              </div>

              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <button
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 font-semibold
                    text-sm sm:text-base rounded-xl py-2.5 sm:py-3 border-0
                    transition-all duration-200
                    ${pageNumber === 1
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                    }
                  `}
                  style={{
                    background: pageNumber === 1 ? 'var(--bg-surface)' : 'var(--brand-primary-soft)',
                    color: pageNumber === 1 ? 'var(--text-disabled)' : 'var(--brand-primary)',
                    border: `1.5px solid ${pageNumber === 1 ? 'var(--border-subtle)' : 'rgba(245,158,11,0.2)'}`,
                  }}
                  disabled={pageNumber === 1}
                  onClick={() => pageNumber > 1 && (window.location.href = `/page/${pageNumber - 1}`)}
                >
                  ← <span className="hidden xs:inline">Previous</span>
                </button>

                {/* Quick page jump buttons */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {pageNumber > 2 && (
                    <button
                      onClick={() => window.location.href = '/page/1'}
                      className="w-9 h-9 rounded-lg text-xs font-medium border-0 cursor-pointer transition-all duration-150 hover:scale-105"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                    >1</button>
                  )}
                  {pageNumber > 3 && (
                    <span className="text-xs px-1" style={{ color: 'var(--text-disabled)' }}>…</span>
                  )}
                  {[pageNumber - 1, pageNumber, pageNumber + 1].filter(p => p >= 1 && p <= totalPages).map(p => (
                    <button
                      key={p}
                      onClick={() => p !== pageNumber && (window.location.href = `/page/${p}`)}
                      className={`
                        w-9 h-9 rounded-lg text-xs font-bold border-0 transition-all duration-150
                        ${p === pageNumber ? '' : 'cursor-pointer hover:scale-105'}
                      `}
                      style={{
                        background: p === pageNumber
                          ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover))'
                          : 'var(--bg-surface)',
                        color: p === pageNumber ? 'var(--text-inverse)' : 'var(--text-muted)',
                        boxShadow: p === pageNumber ? '0 2px 8px rgba(245,158,11,0.3)' : 'none',
                      }}
                    >{p}</button>
                  ))}
                  {pageNumber < totalPages - 2 && (
                    <span className="text-xs px-1" style={{ color: 'var(--text-disabled)' }}>…</span>
                  )}
                  {pageNumber < totalPages - 1 && (
                    <button
                      onClick={() => window.location.href = `/page/${totalPages}`}
                      className="w-9 h-9 rounded-lg text-xs font-medium border-0 cursor-pointer transition-all duration-150 hover:scale-105"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                    >{totalPages}</button>
                  )}
                </div>

                <button
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 font-semibold
                    text-sm sm:text-base rounded-xl py-2.5 sm:py-3 border-0
                    transition-all duration-200
                    ${pageNumber === totalPages
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                    }
                  `}
                  style={{
                    background: pageNumber === totalPages ? 'var(--bg-surface)' : 'var(--brand-primary-soft)',
                    color: pageNumber === totalPages ? 'var(--text-disabled)' : 'var(--brand-primary)',
                    border: `1.5px solid ${pageNumber === totalPages ? 'var(--border-subtle)' : 'rgba(245,158,11,0.2)'}`,
                  }}
                  disabled={pageNumber === totalPages}
                  onClick={() => pageNumber < totalPages && (window.location.href = `/page/${pageNumber + 1}`)}
                >
                  <span className="hidden xs:inline">Next</span> →
                </button>
              </div>
            </div>
          </nav>

        </div>
      </main>
    </>
  );
}

export default ClientQuranPage;

