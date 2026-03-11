'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Home,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  BookOpen,
  X,
} from 'lucide-react';
import './page-reader.css';

// ── Constants ────────────────────────────────────────────────────
const TOTAL_PAGES = 28;

function getPageImageUrl(page: number): string {
  return `/quran-images/page-${page}.jpg`;
}

// ── Web Audio paper-rustle sound ─────────────────────────────────
function playPageFlipSound(enabled: boolean) {
  if (!enabled) return;
  try {
    const AudioCtx =
      typeof AudioContext !== 'undefined'
        ? AudioContext
        : (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const duration = 0.16;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Fast-attack, smooth-decay envelope mimicking a page rustle
      const env =
        Math.pow(Math.max(0, 1 - t * 3.2), 1.8) * (1 - Math.exp(-t * 70));
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Band-pass filter centred around paper-rustle frequency range
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 4200;
    bpf.Q.value = 0.75;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.32;

    source.connect(bpf);
    bpf.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    source.onended = () => void setTimeout(() => ctx.close(), 100);
  } catch {
    // non-critical — silent fail
  }
}

// ── Animation variants (3-D page-flip feel — RTL direction) ──────
const pageVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '-75%' : '75%',
    rotateY: dir > 0 ? -22 : 22,
    opacity: 0,
    scale: 0.93,
  }),
  center: {
    x: 0,
    rotateY: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '75%' : '-75%',
    rotateY: dir > 0 ? 22 : -22,
    opacity: 0,
    scale: 0.93,
  }),
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 290,
  damping: 30,
  mass: 0.75,
};

// ── Theme tokens ─────────────────────────────────────────────────
type Theme = 'dark' | 'light';

const themes: Record<
  Theme,
  {
    bg: string;
    text: string;
    subText: string;
    buttonBg: string;
    buttonHover: string;
    toolbarBg: string;
    toolbarBorder: string;
    imgFilter: string;
    jumpBg: string;
    jumpBorder: string;
  }
> = {
  dark: {
    bg: '#0d0d0d',
    text: '#e8dcc8',
    subText: '#a0917c',
    buttonBg: 'rgba(255,255,255,0.07)',
    buttonHover: 'rgba(255,255,255,0.14)',
    toolbarBg: 'rgba(13,13,13,0.82)',
    toolbarBorder: 'rgba(255,255,255,0.07)',
    imgFilter: 'brightness(0.87) sepia(0.1) saturate(0.95)',
    jumpBg: 'rgba(20,18,14,0.96)',
    jumpBorder: 'rgba(196,138,36,0.35)',
  },
  light: {
    bg: '#ede4cc',
    text: '#2a1a08',
    subText: '#7a6040',
    buttonBg: 'rgba(0,0,0,0.07)',
    buttonHover: 'rgba(0,0,0,0.14)',
    toolbarBg: 'rgba(237,228,204,0.88)',
    toolbarBorder: 'rgba(0,0,0,0.09)',
    imgFilter: 'brightness(1.01) sepia(0.04)',
    jumpBg: 'rgba(250,244,230,0.98)',
    jumpBorder: 'rgba(196,138,36,0.4)',
  },
};

export default function QuranPageReader() {
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [theme, setTheme] = useState<Theme>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUI, setShowUI] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPageJump, setShowPageJump] = useState(false);
  const [jumpValue, setJumpValue] = useState('');
  const [topInput, setTopInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const uiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const jumpInputRef = useRef<HTMLInputElement>(null);

  const t = themes[theme];
  const progress = ((currentPage - 1) / (TOTAL_PAGES - 1)) * 100;

  // ── Auto-hide UI after 4 s inactivity ──────────────────────────
  const resetUiTimer = useCallback(() => {
    setShowUI(true);
    if (uiTimer.current) clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => {
      if (!showPageJump) setShowUI(false);
    }, 4000);
  }, [showPageJump]);

  useEffect(() => {
    resetUiTimer();
    return () => {
      if (uiTimer.current) clearTimeout(uiTimer.current);
    };
  }, [resetUiTimer]);

  // Dismiss keyboard hint after 5 s
  useEffect(() => {
    hintTimer.current = setTimeout(() => setShowHint(false), 5000);
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  // ── Navigate ────────────────────────────────────────────────────
  const navigateTo = useCallback(
    (newPage: number, dir: 1 | -1) => {
      if (isFlipping || newPage < 1 || newPage > TOTAL_PAGES) return;
      setIsFlipping(true);
      setDirection(dir);
      setImageLoaded(false);
      setImageError(false);
      setCurrentPage(newPage);
      playPageFlipSound(soundEnabled);
      setTimeout(() => setIsFlipping(false), 600);
      resetUiTimer();
    },
    [isFlipping, soundEnabled, resetUiTimer]
  );

  const goNext = useCallback(
    () => navigateTo(currentPage + 1, 1),
    [currentPage, navigateTo]
  );
  const goPrev = useCallback(
    () => navigateTo(currentPage - 1, -1),
    [currentPage, navigateTo]
  );

  // ── Keyboard navigation ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // RTL: ArrowLeft = next page, ArrowRight = previous page
      if (e.key === 'ArrowLeft') goNext();
      else if (e.key === 'ArrowRight') goPrev();
      else if (e.key === 'Escape') {
        setShowPageJump(false);
        setJumpValue('');
      } else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      resetUiTimer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goNext, goPrev]);

  // ── Preload first page eagerly + adjacent pages ─────────────────
  useEffect(() => {
    // Eagerly preload page 1 on mount for instant first render
    const firstImg = new window.Image();
    firstImg.src = getPageImageUrl(1);
    // Also preload page 2
    const secondImg = new window.Image();
    secondImg.src = getPageImageUrl(2);
  }, []);

  useEffect(() => {
    [currentPage - 1, currentPage + 1]
      .filter((p) => p >= 1 && p <= TOTAL_PAGES)
      .forEach((p) => {
        const img = new window.Image();
        img.src = getPageImageUrl(p);
      });
  }, [currentPage]);

  // ── Swipe gestures ───────────────────────────────────────────────
  // RTL Quran convention: swipe RIGHT → next page, swipe LEFT → previous page
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goPrev,
    onSwipedRight: goNext,
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 40,
  });

  // ── Fullscreen ───────────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Page jump handler ────────────────────────────────────────────
  const handleJump = useCallback(() => {
    const n = parseInt(jumpValue, 10);
    if (!isNaN(n) && n >= 1 && n <= TOTAL_PAGES) {
      navigateTo(n, n > currentPage ? 1 : -1);
      setShowPageJump(false);
      setJumpValue('');
    }
  }, [jumpValue, currentPage, navigateTo]);

  // Focus jump input when it opens
  useEffect(() => {
    if (showPageJump) {
      setTimeout(() => jumpInputRef.current?.focus(), 60);
    }
  }, [showPageJump]);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={`qpr-root ${theme}`}
      style={{ background: t.bg, color: t.text }}
      onMouseMove={resetUiTimer}
      onClick={resetUiTimer}
    >
      {/* ── TOP TOOLBAR ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showUI && (
          <motion.header
            key="toolbar"
            className="qpr-toolbar"
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -72, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              background: t.toolbarBg,
              borderColor: t.toolbarBorder,
              color: t.text,
            }}
          >
            {/* Left side: Back home */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <Link href="/" aria-label="Back to home">
                <button
                  className="qpr-icon-btn"
                  style={{ background: t.buttonBg, color: t.text }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = t.buttonHover)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = t.buttonBg)
                  }
                >
                  <Home size={16} />
                </button>
              </Link>
            </div>

            {/* Center: Title */}
            {/* Center: Title + inline page picker */}
            <div className="qpr-toolbar-center" style={{ flexDirection: 'column', gap: 3, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <BookOpen size={12} style={{ opacity: 0.55 }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.55, textTransform: 'uppercase' as const }}>
                  Mushaf Reader
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  style={{ background: 'none', border: 'none', cursor: currentPage > 1 ? 'pointer' : 'default', color: t.text, padding: '0 2px', fontSize: 18, lineHeight: 1, opacity: currentPage > 1 ? 0.85 : 0.25, fontWeight: 300 }}
                >‹</button>
                <input
                  type="number"
                  min={1}
                  max={TOTAL_PAGES}
                  value={topInput}
                  placeholder={String(currentPage)}
                  onChange={(e) => setTopInput(e.target.value)}
                  onFocus={(e) => { e.stopPropagation(); setTopInput(String(currentPage)); }}
                  onBlur={() => {
                    const n = parseInt(topInput, 10);
                    if (!isNaN(n) && n >= 1 && n <= TOTAL_PAGES) navigateTo(n, n > currentPage ? 1 : -1);
                    setTopInput('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const n = parseInt(topInput, 10);
                      if (!isNaN(n) && n >= 1 && n <= TOTAL_PAGES) navigateTo(n, n > currentPage ? 1 : -1);
                      setTopInput('');
                      (e.target as HTMLInputElement).blur();
                    }
                    if (e.key === 'Escape') { setTopInput(''); (e.target as HTMLInputElement).blur(); }
                  }}
                  style={{
                    width: 46, textAlign: 'center',
                    background: t.buttonBg,
                    border: `1px solid ${t.toolbarBorder}`,
                    borderRadius: 6, color: t.text,
                    fontSize: 13, fontWeight: 700,
                    padding: '3px 4px', outline: 'none',
                  }}
                />
                <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 500, whiteSpace: 'nowrap' }}>/ {TOTAL_PAGES}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  disabled={currentPage >= TOTAL_PAGES}
                  aria-label="Next page"
                  style={{ background: 'none', border: 'none', cursor: currentPage < TOTAL_PAGES ? 'pointer' : 'default', color: t.text, padding: '0 2px', fontSize: 18, lineHeight: 1, opacity: currentPage < TOTAL_PAGES ? 0.85 : 0.25, fontWeight: 300 }}
                >›</button>
              </div>
            </div>

            {/* Right side: controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flex: 1,
                justifyContent: 'flex-end',
              }}
            >
              {/* Sound toggle */}
              <button
                className="qpr-icon-btn"
                style={{ background: t.buttonBg, color: t.text }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSoundEnabled((v) => !v);
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = t.buttonHover)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = t.buttonBg)
                }
                title={soundEnabled ? 'Mute page sound' : 'Enable page sound'}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Theme toggle */}
              <button
                className="qpr-icon-btn"
                style={{ background: t.buttonBg, color: t.text }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme((v) => (v === 'dark' ? 'light' : 'dark'));
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = t.buttonHover)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = t.buttonBg)
                }
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Fullscreen toggle */}
              <button
                className="qpr-icon-btn"
                style={{ background: t.buttonBg, color: t.text }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = t.buttonHover)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = t.buttonBg)
                }
                title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── PAGE STAGE ──────────────────────────────────────────── */}
      <div className="qpr-stage" {...swipeHandlers}>
        {/* Left nav button — RTL: left = NEXT page */}
        <AnimatePresence>
          {showUI && (
            <motion.button
              key="nav-left"
              className="qpr-nav-btn left"
              style={{
                background: t.buttonBg,
                color: t.text,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: currentPage < TOTAL_PAGES ? 1 : 0.25, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              disabled={currentPage >= TOTAL_PAGES}
              aria-label="Next page"
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = t.buttonHover)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = t.buttonBg)
              }
            >
              <ChevronLeft size={22} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Animated page card ─────────────────────────────── */}
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            className="qpr-page-card"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
          >
            {/* Skeleton while loading */}
            {!imageLoaded && !imageError && (
              <div className="qpr-skeleton">
                <div
                  className="qpr-skeleton-inner"
                  style={{
                    background:
                      theme === 'dark'
                        ? 'linear-gradient(90deg,rgba(60,50,35,0.5) 25%,rgba(90,75,50,0.65) 50%,rgba(60,50,35,0.5) 75%)'
                        : 'linear-gradient(90deg,rgba(200,185,155,0.5) 25%,rgba(220,205,175,0.65) 50%,rgba(200,185,155,0.5) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'qpr-shimmer 1.5s infinite linear',
                  }}
                />
              </div>
            )}

            {/* Error state */}
            {imageError && (
              <div
                className="qpr-error"
                style={{
                  color: t.subText,
                  background: t.buttonBg,
                  border: `1px solid ${t.toolbarBorder}`,
                }}
              >
                <BookOpen size={40} style={{ opacity: 0.4 }} />
                <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                  Page {currentPage} could not load
                </p>
                <p style={{ fontSize: 13, margin: 0, opacity: 0.7 }}>
                  Check your internet connection and try again
                </p>
                <button
                  onClick={() => {
                    setImageError(false);
                    setImageLoaded(false);
                  }}
                  style={{
                    marginTop: 8,
                    padding: '6px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#c4932e',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Actual Quran page image */}
            {!imageError && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={getPageImageUrl(currentPage)}
                alt={`Quran page ${currentPage}`}
                className="qpr-page-img"
                style={{
                  filter: t.imgFilter,
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.35s ease',
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                draggable={false}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Corner flip hints */}
        <div className="qpr-corner-hint-left">
          <div className="qpr-corner-triangle-left" />
        </div>
        <div className="qpr-corner-hint-right">
          <div className="qpr-corner-triangle-right" />
        </div>

        {/* Right nav button — RTL: right = PREVIOUS page */}
        <AnimatePresence>
          {showUI && (
            <motion.button
              key="nav-right"
              className="qpr-nav-btn right"
              style={{ background: t.buttonBg, color: t.text }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: currentPage > 1 ? 1 : 0.25, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = t.buttonHover)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = t.buttonBg)
              }
            >
              <ChevronRight size={22} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Keyboard hint */}
        <AnimatePresence>
          {showHint && showUI && (
            <motion.div
              key="hint"
              className="qpr-hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.45, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              style={{ color: t.subText }}
            >
              ← → arrow keys · swipe to turn pages · F for fullscreen
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM BAR ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            key="bottom"
            className="qpr-bottom"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              background: t.toolbarBg,
              borderColor: t.toolbarBorder,
            }}
          >
            {/* Progress bar */}
            <div className="qpr-progress-track" style={{ background: t.buttonBg }}>
              <div
                className="qpr-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="qpr-bottom-info">
              {/* Page label */}
              <span className="qpr-juz-badge">المصحف</span>

              {/* Page counter — click to open jump */}
              <button
                className="qpr-page-counter"
                style={{ color: t.subText, background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPageJump((v) => !v);
                  setJumpValue(String(currentPage));
                }}
                title="Click to jump to a specific page"
              >
                Page {currentPage} / {TOTAL_PAGES}
              </button>

              {/* spacer to balance juz badge */}
              <span style={{ width: 56, flexShrink: 0 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE JUMP POPOVER ────────────────────────────────────── */}
      <AnimatePresence>
        {showPageJump && (
          <motion.div
            key="page-jump"
            style={{
              position: 'absolute',
              bottom: 64,
              left: '50%',
              zIndex: 60,
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div
              className="qpr-jump-form"
              style={{
                background: t.jumpBg,
                borderColor: t.jumpBorder,
                color: t.text,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <span style={{ fontSize: 13, opacity: 0.7, whiteSpace: 'nowrap' }}>
                Go to page
              </span>
              <input
                ref={jumpInputRef}
                className="qpr-jump-input"
                style={{ color: t.text }}
                type="number"
                min={1}
                max={TOTAL_PAGES}
                value={jumpValue}
                onChange={(e) => setJumpValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJump();
                  if (e.key === 'Escape') {
                    setShowPageJump(false);
                    setJumpValue('');
                  }
                }}
                placeholder="1–604"
              />
              <button className="qpr-jump-btn" onClick={handleJump}>
                Go
              </button>
              <button
                className="qpr-icon-btn"
                style={{ background: 'transparent', color: t.subText, width: 28, height: 28 }}
                onClick={() => {
                  setShowPageJump(false);
                  setJumpValue('');
                }}
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
