'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchReciters, fetchStations, fetchAudio } from './lib/api';
import { liveRadioAPI, LiveStation } from './lib/api/live-radio-api';
import { Station, Reciter } from './lib/types';
import EqualizerPanel, { EqualizerSettings } from './components/EqualizerPanel';
import './styles/radio-redesign.css';

type PlayingSource = {
  type: 'live' | 'reciter' | 'station';
  id: string | number;
  name: string;
  image?: string;
  style?: string;
} | null;

type TabId = 'home' | 'live' | 'reciters' | 'curated';

function formatTime(sec: number): string {
  if (!isFinite(sec) || isNaN(sec)) return '--:--';
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const SIDEBAR_NAV: { id: string; label: string; icon: string }[] = [
  { id: 'home',      label: 'Home',        icon: 'home'         },
  { id: 'live',      label: 'Live Radio',  icon: 'radio'        },
  { id: 'reciters',  label: 'Reciters',    icon: 'mic'          },
  { id: 'curated',   label: 'Curated',     icon: 'auto_stories' },
  { id: 'favorites', label: 'Favourites',  icon: 'favorite'     },
];

export default function AdvancedRadioPage() {
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Data state
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [curatedStations, setCuratedStations] = useState<Station[]>([]);
  const [liveStations, setLiveStations] = useState<LiveStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [playingSource, setPlayingSource] = useState<PlayingSource>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(0.8);

  // UI state
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [equalizerNodes, setEqualizerNodes] = useState<BiquadFilterNode[]>([]);
  const [equalizerSettings, setEqualizerSettings] = useState<EqualizerSettings>({
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    preset: 'flat',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isDark, setIsDark] = useState(false);
  const [currentTimeState, setCurrentTimeState] = useState(0);
  const [durationState, setDurationState] = useState(0);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [recitersData, stationsData, liveStationsData] = await Promise.all([
          fetchReciters(),
          fetchStations(),
          liveRadioAPI.fetchLiveStations(),
        ]);
        setReciters(recitersData || []);
        setCuratedStations((stationsData.curatedStations as Station[]) || []);
        setLiveStations(liveStationsData.slice(0, 18));
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load radio data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Dark mode sync
  useEffect(() => {
    const checkDark = () => setIsDark(
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark'
    );
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    checkDark();
    return () => observer.disconnect();
  }, []);

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      const frequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
      const nodes = frequencies.map(freq => {
        const filter = audioContextRef.current!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });
      source.connect(nodes[0]);
      for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
      nodes[nodes.length - 1].connect(analyser);
      analyser.connect(audioContextRef.current.destination);
      analyserRef.current = analyser;
      setEqualizerNodes(nodes);
    } catch (err) {
      console.error('Error initializing audio context:', err);
    }
  }, []);

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Equalizer
  useEffect(() => {
    if (equalizerNodes.length > 0) {
      equalizerSettings.bands.forEach((value, index) => {
        if (equalizerNodes[index]) equalizerNodes[index].gain.value = value;
      });
    }
  }, [equalizerSettings, equalizerNodes]);

  // Safe play/pause
  const safePlay = async () => {
    if (!audioRef.current) return;
    try {
      playPromiseRef.current = audioRef.current.play();
      await playPromiseRef.current;
      playPromiseRef.current = null;
    } catch (err: unknown) {
      playPromiseRef.current = null;
      if (err instanceof Error && err.name === 'AbortError') return;
      throw err;
    }
  };

  const safePause = async () => {
    if (!audioRef.current) return;
    if (playPromiseRef.current) {
      try { await playPromiseRef.current; } catch { }
      playPromiseRef.current = null;
    }
    audioRef.current.pause();
  };

  // Play handlers
  const handleLiveStationPlay = async (station: LiveStation) => {
    if (!audioRef.current) return;
    try {
      setError(null);
      if (playingSource?.id === station.id && isPlaying) {
        await safePause(); setIsPaused(true); setIsPlaying(false); return;
      }
      if (playingSource?.id === station.id && isPaused) {
        await safePlay(); setIsPaused(false); setIsPlaying(true); return;
      }
      audioRef.current.src = station.streamUrl;
      setPlayingSource({ type: 'live', id: station.id, name: station.reciterName || station.name, image: station.imageUrl, style: station.style });
      await safePlay();
      setIsPlaying(true); setIsPaused(false);
    } catch (err) {
      console.error('Error playing live station:', err);
      setError('Failed to play live station. Please try another.');
      setIsPlaying(false);
    }
  };

  const handleReciterPlay = async (reciter: Reciter) => {
    if (!audioRef.current) return;
    try {
      setError(null);
      if (playingSource?.id === reciter.id && isPlaying) {
        await safePause(); setIsPaused(true); setIsPlaying(false); return;
      }
      if (playingSource?.id === reciter.id && isPaused) {
        await safePlay(); setIsPaused(false); setIsPlaying(true); return;
      }
      const reciterId = reciter.originalReciterId || reciter.id;
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      const audioData = await fetchAudio(reciterId, randomSurah);
      if (audioData.audioUrls && audioData.audioUrls[0]) {
        audioRef.current.src = audioData.audioUrls[0];
        setPlayingSource({ type: 'reciter', id: reciter.id, name: reciter.name, image: reciter.imageUrl, style: reciter.style });
        await safePlay();
        setIsPlaying(true); setIsPaused(false);
      }
    } catch (err) {
      console.error('Error playing reciter:', err);
      setError('Failed to load audio. Please try another reciter.');
      setIsPlaying(false);
    }
  };

  const handleStationPlay = async (station: Station) => {
    if (!audioRef.current) return;
    try {
      setError(null);
      if (playingSource?.id === station.id && isPlaying) {
        await safePause(); setIsPaused(true); setIsPlaying(false); return;
      }
      if (playingSource?.id === station.id && isPaused) {
        await safePlay(); setIsPaused(false); setIsPlaying(true); return;
      }
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      const audioData = await fetchAudio(7, randomSurah);
      if (audioData.audioUrls && audioData.audioUrls[0]) {
        audioRef.current.src = audioData.audioUrls[0];
        setPlayingSource({ type: 'station', id: station.id, name: station.title, image: station.image, style: station.description });
        await safePlay();
        setIsPlaying(true); setIsPaused(false);
      }
    } catch (err) {
      console.error('Error playing station:', err);
      setError('Failed to load audio.');
      setIsPlaying(false);
    }
  };

  const handleStop = async () => {
    await safePause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlayingSource(null); setIsPlaying(false); setIsPaused(false);
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await safePause();
    } else if (isPaused && playingSource) {
      await safePlay();
    } else if (!playingSource && liveStations.length > 0) {
      await handleLiveStationPlay(liveStations[0]);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !durationState || playingSource?.type === 'live') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * durationState;
  };

  const handleAudioPlay = () => { initializeAudioContext(); setIsPlaying(true); setIsPaused(false); };
  const handleAudioPause = () => { setIsPlaying(false); setIsPaused(true); };

  // Filtered data
  const filteredReciters = reciters.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLiveStations = liveStations.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.reciterName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCurated = curatedStations.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Helper: is this card playing?
  const isCardPlaying = (id: string | number) => playingSource?.id === id && isPlaying;
  const isCardActive = (id: string | number) => playingSource?.id === id;

  // Computed values
  const isLive = playingSource?.type === 'live';
  const progressPct = durationState > 0 ? (currentTimeState / durationState) * 100 : 0;
  const heroImage = playingSource?.image || liveStations[0]?.imageUrl || '';
  const heroTitle = playingSource?.name || 'Quran Radio';
  const heroSub = playingSource?.style || liveStations[0]?.description || 'Live Spiritual Broadcasting';

  return (
    <div className={`nr-root${isDark ? ' nr-dark' : ''}`}>
      {/* Hidden Audio */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onEnded={handleStop}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onError={() => setIsBuffering(false)}
        onTimeUpdate={() => setCurrentTimeState(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDurationState(audioRef.current?.duration || 0)}
        preload="auto"
      />

      {/* Equalizer Modal */}
      <EqualizerPanel
        settings={equalizerSettings}
        onSettingsChange={setEqualizerSettings}
        isOpen={showEqualizer}
        onClose={() => setShowEqualizer(false)}
        equalizerNodes={equalizerNodes}
      />

      {/* ── Sidebar ── */}
      <aside className="nr-sidebar">
        <div className="nr-sidebar-logo">
          <div className="nr-logo-icon">
            <span className="material-icons-round" style={{ fontSize: 24 }}>radio</span>
          </div>
          <div>
            <p className="nr-logo-title">Quran Radio</p>
            <p className="nr-logo-sub">Live &amp; Streaming</p>
          </div>
        </div>

        <nav className="nr-sidebar-nav">
          {SIDEBAR_NAV.map(item => (
            <button
              key={item.id}
              className={`nr-nav-item${activeTab === item.id ? ' nr-nav-active' : ''}`}
              onClick={() => { if (item.id !== 'favorites') setActiveTab(item.id as TabId); }}
            >
              <span className="material-icons-round" style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="nr-sidebar-charity">
          <div className="nr-charity-widget">
            <p className="nr-charity-label">Community</p>
            <p className="nr-charity-title">Support Quran learning worldwide</p>
            <div className="nr-charity-progress">
              <div className="nr-charity-fill" style={{ width: '68%' }} />
            </div>
            <button className="nr-charity-btn">Donate Now</button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="nr-main-wrap">
        {/* Header */}
        <header className="nr-header">
          <div className="nr-search-bar">
            <span className="material-icons-round" style={{ fontSize: 20, flexShrink: 0 }}>search</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search stations, reciters…"
            />
          </div>
          <div className="nr-header-actions">
            <button className="nr-icon-btn" title="Equalizer" onClick={() => setShowEqualizer(true)}>
              <span className="material-icons-round" style={{ fontSize: 20 }}>equalizer</span>
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="nr-scroll-area">
          {loading ? (
            <div className="nr-loading">
              <div className="nr-spinner" />
              <p style={{ color: 'var(--nr-text-muted)', fontSize: 14, margin: 0 }}>Loading stations…</p>
            </div>
          ) : (
            <>
              {/* Error banner */}
              {error && (
                <div style={{ marginBottom: 18, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="material-icons-round" style={{ fontSize: 20 }}>error_outline</span>
                  <span style={{ fontSize: 14, flex: 1 }}>{error}</span>
                  <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex' }}>
                    <span className="material-icons-round" style={{ fontSize: 18 }}>close</span>
                  </button>
                </div>
              )}

              {/* ── Hero section ── */}
              <section className="nr-hero-section">
                <div className="nr-hero-bg" style={heroImage ? { backgroundImage: `url(${heroImage})` } : {}}>
                  <div className="nr-hero-overlay" />
                  <div className="nr-hero-content">
                    <div className="nr-hero-bottom-row">
                      <div className="nr-hero-info-group">
                        <div className="nr-hero-cover">
                          {heroImage ? (
                            <img src={heroImage} alt={heroTitle} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="material-icons-round" style={{ fontSize: 48, color: 'rgba(255,255,255,0.4)' }}>radio</span>
                            </div>
                          )}
                        </div>
                        <div>
                          {isPlaying && (
                            <div className="nr-live-badge">
                              <span className="nr-live-dot" />
                              {isLive ? 'Live Broadcasting' : 'Now Playing'}
                            </div>
                          )}
                          <h2 className="nr-hero-title">{heroTitle}</h2>
                          <p className="nr-hero-sub">{heroSub}</p>
                        </div>
                      </div>
                      <div className="nr-hero-btns">
                        <button className="nr-glass-btn" title="Share">
                          <span className="material-icons-round">share</span>
                        </button>
                        {playingSource && (
                          <button className="nr-glass-btn" onClick={handleStop} title="Stop">
                            <span className="material-icons-round">stop_circle</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Controls card ── */}
              <div className="nr-controls-card">
                {/* Progress */}
                <div className="nr-progress-section">
                  <div className="nr-progress-bar-container" onClick={handleProgressClick}>
                    <div className="nr-progress-bar-fill" style={{ width: `${isLive ? 100 : progressPct}%` }}>
                      {!isLive && <div className="nr-progress-thumb" />}
                    </div>
                  </div>
                  <div className="nr-progress-times">
                    <span style={{ color: isLive ? 'var(--nr-primary)' : 'var(--nr-text-muted)', fontWeight: isLive ? 700 : 500 }}>
                      {isLive ? '• LIVE' : formatTime(currentTimeState)}
                    </span>
                    <span>{isLive ? '∞' : formatTime(durationState)}</span>
                  </div>
                </div>

                {/* Playback */}
                <div className="nr-playback-row">
                  <div className="nr-playback-left">
                    <button className="nr-ctrl-btn" title="Shuffle">
                      <span className="material-icons-round">shuffle</span>
                    </button>
                  </div>
                  <div className="nr-playback-center">
                    <button className="nr-ctrl-btn nr-ctrl-btn--nav" title="Previous">
                      <span className="material-icons-round" style={{ fontSize: 28 }}>skip_previous</span>
                    </button>
                    <button className="nr-play-btn" onClick={handlePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
                      {isBuffering ? (
                        <div className="nr-spinner nr-spinner-sm" style={{ border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                      ) : isPlaying ? (
                        <span className="material-icons-round mat-icon">pause</span>
                      ) : (
                        <span className="material-icons-round mat-icon">play_arrow</span>
                      )}
                    </button>
                    <button className="nr-ctrl-btn nr-ctrl-btn--nav" title="Next">
                      <span className="material-icons-round" style={{ fontSize: 28 }}>skip_next</span>
                    </button>
                  </div>
                  <div className="nr-playback-right">
                    <div className="nr-wave-bars">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`nr-wave-bar${isPlaying ? ' nr-wave-active' : ''}`} />
                      ))}
                    </div>
                    <button className="nr-ctrl-btn" title="Repeat">
                      <span className="material-icons-round">repeat</span>
                    </button>
                  </div>
                </div>

                {/* Volume + EQ */}
                <div className="nr-volume-row">
                  <span className="material-icons-round nr-vol-icon">
                    {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                  </span>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="nr-volume-slider"
                  />
                  <button className="nr-icon-btn" onClick={() => setShowEqualizer(true)} title="Equalizer" style={{ flexShrink: 0 }}>
                    <span className="material-icons-round" style={{ fontSize: 18 }}>equalizer</span>
                  </button>
                </div>
              </div>

              {/* ── Home: 2-column grid ── */}
              {activeTab === 'home' ? (
                <div className="nr-bottom-grid">
                  {/* Featured Stations */}
                  <div>
                    <div className="nr-section-header">
                      <h3 className="nr-section-title">Featured Stations</h3>
                      <button className="nr-view-all-btn" onClick={() => setActiveTab('live')}>View All →</button>
                    </div>
                    <div className="nr-station-list">
                      {filteredLiveStations.slice(0, 4).map(station => (
                        <div
                          key={station.id}
                          className={`nr-station-item${isCardActive(station.id) ? ' nr-playing' : ''}`}
                          onClick={() => handleLiveStationPlay(station)}
                        >
                          <div className="nr-station-item-left">
                            <div className="nr-station-icon">
                              {station.imageUrl
                                ? <img src={station.imageUrl} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                : <span className="material-icons-round" style={{ fontSize: 22 }}>radio</span>
                              }
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p className="nr-station-name">{station.reciterName || station.name}</p>
                              <p className="nr-station-desc">{station.description || station.style || 'Live Radio'}</p>
                            </div>
                          </div>
                          <div className="nr-station-action">
                            {isBuffering && isCardActive(station.id)
                              ? <div className="nr-spinner nr-spinner-sm" />
                              : isCardPlaying(station.id)
                              ? <span className="material-icons-round" style={{ fontSize: 18 }}>pause</span>
                              : <span className="material-icons-round" style={{ fontSize: 18 }}>play_arrow</span>
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Reciters 2x2 */}
                  <div>
                    <div className="nr-section-header">
                      <h3 className="nr-section-title">Top Reciters</h3>
                      <button className="nr-view-all-btn" onClick={() => setActiveTab('reciters')}>View All →</button>
                    </div>
                    <div className="nr-reciters-grid">
                      {filteredReciters.slice(0, 4).map(reciter => (
                        <div
                          key={reciter.id}
                          className={`nr-reciter-card${isCardActive(reciter.id) ? ' nr-playing' : ''}`}
                          onClick={() => handleReciterPlay(reciter)}
                        >
                          <div className="nr-reciter-avatar-wrap">
                            <img
                              src={reciter.imageUrl || ''}
                              alt={reciter.name}
                              onError={e => {
                                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='40' fill='%23064e3b'/%3E%3Ctext x='40' y='52' text-anchor='middle' fill='%2334d399' font-size='36'%3E%F0%9F%8E%99%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <p className="nr-reciter-name">{reciter.name}</p>
                          <p className="nr-reciter-origin">{reciter.style || 'Reciter'}</p>
                          <span className="nr-reciter-badge">
                            {isCardPlaying(reciter.id) ? '♪ Playing' : 'Listen'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── All items section ── */
                <div className="nr-all-section">
                  <h3 className="nr-all-title">
                    {activeTab === 'live'
                      ? `Live Stations (${filteredLiveStations.length})`
                      : activeTab === 'reciters'
                      ? `All Reciters (${filteredReciters.length})`
                      : `Curated Stations (${filteredCurated.length})`}
                  </h3>

                  {/* Live stations portrait grid */}
                  {activeTab === 'live' && (
                    <div className="nr-all-grid">
                      {filteredLiveStations.map(station => (
                        <div
                          key={station.id}
                          className="nr-portrait-card"
                          style={isCardActive(station.id) ? { boxShadow: '0 0 0 3px #10b981, 0 16px 40px rgba(16,185,129,0.25)' } : {}}
                          onClick={() => handleLiveStationPlay(station)}
                        >
                          {station.imageUrl ? (
                            <img className="nr-portrait-img" src={station.imageUrl} alt={station.name} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #064e3b, #065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="material-icons-round" style={{ fontSize: 64, color: 'rgba(255,255,255,0.15)' }}>radio</span>
                            </div>
                          )}
                          <div className={`nr-portrait-gradient${isCardActive(station.id) ? ' nr-portrait-gradient--active' : ''}`} />
                          {isCardActive(station.id) && <div className="nr-now-playing-tag">Now Playing</div>}
                          <div className="nr-portrait-overlay-btn">
                            <div className="nr-portrait-play-circle">
                              {isBuffering && isCardActive(station.id)
                                ? <div className="nr-spinner" style={{ border: '4px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981' }} />
                                : isCardPlaying(station.id)
                                ? <span className="material-icons-round" style={{ fontSize: 38, color: '#10b981' }}>pause</span>
                                : <span className="material-icons-round" style={{ fontSize: 42, color: isCardActive(station.id) ? '#10b981' : '#0f172a', marginLeft: 4 }}>play_arrow</span>
                              }
                            </div>
                          </div>
                          <div className="nr-portrait-info">
                            <div className="nr-portrait-badge">
                              <span className="nr-portrait-live-dot" />
                              {isCardPlaying(station.id) ? 'Broadcasting' : 'Active Now'}
                            </div>
                            <h3 style={{ color: 'white', fontWeight: 700, fontSize: 17, margin: '0 0 4px', lineHeight: 1.3 }}>{station.reciterName || station.name}</h3>
                            <p style={{ color: 'rgba(110,231,183,0.7)', fontSize: 12, margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{station.description}</p>
                            <div style={{ display: 'flex', gap: 10, color: 'rgba(110,231,183,0.6)', fontSize: 11, fontWeight: 500 }}>
                              <span>{station.bitrate || 128}kbps</span><span>MP3</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reciters portrait grid */}
                  {activeTab === 'reciters' && (
                    <div className="nr-all-grid">
                      {filteredReciters.map(reciter => (
                        <div
                          key={reciter.id}
                          className="nr-portrait-card"
                          style={isCardActive(reciter.id) ? { boxShadow: '0 0 0 3px #10b981, 0 16px 40px rgba(16,185,129,0.25)' } : {}}
                          onClick={() => handleReciterPlay(reciter)}
                        >
                          <img
                            className="nr-portrait-img"
                            src={reciter.imageUrl || ''}
                            alt={reciter.name}
                            onError={e => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23064e3b'/%3E%3Ctext x='150' y='215' text-anchor='middle' fill='%2334d399' font-size='100'%3E%F0%9F%8E%99%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <div className={`nr-portrait-gradient${isCardActive(reciter.id) ? ' nr-portrait-gradient--active' : ''}`} />
                          {isCardActive(reciter.id) && <div className="nr-now-playing-tag">Now Playing</div>}
                          <div className="nr-portrait-overlay-btn">
                            <div className="nr-portrait-play-circle">
                              {isBuffering && isCardActive(reciter.id)
                                ? <div className="nr-spinner" style={{ border: '4px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981' }} />
                                : isCardPlaying(reciter.id)
                                ? <span className="material-icons-round" style={{ fontSize: 38, color: '#10b981' }}>pause</span>
                                : <span className="material-icons-round" style={{ fontSize: 42, color: isCardActive(reciter.id) ? '#10b981' : '#0f172a', marginLeft: 4 }}>play_arrow</span>
                              }
                            </div>
                          </div>
                          <div className="nr-portrait-info">
                            <div className="nr-portrait-badge">
                              <span className="nr-portrait-live-dot" />
                              {isCardPlaying(reciter.id) ? 'Playing' : 'Available'}
                            </div>
                            <h3 style={{ color: 'white', fontWeight: 700, fontSize: 17, margin: '0 0 4px', lineHeight: 1.3 }}>{reciter.name}</h3>
                            <p style={{ color: 'rgba(110,231,183,0.7)', fontSize: 12, margin: 0 }}>{reciter.style || 'Classical Recitation'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Curated grid */}
                  {activeTab === 'curated' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                      {filteredCurated.map(station => (
                        <div
                          key={station.id}
                          className={`nr-curated-card${isCardActive(station.id) ? ' nr-playing' : ''}`}
                          onClick={() => handleStationPlay(station)}
                        >
                          <div className="nr-curated-thumb">
                            {station.image && <img src={station.image} alt={station.title} />}
                            <div className="nr-curated-overlay">
                              <div className="nr-portrait-play-circle" style={{ width: 52, height: 52 }}>
                                {isCardPlaying(station.id)
                                  ? <span className="material-icons-round" style={{ fontSize: 30, color: '#10b981' }}>pause</span>
                                  : <span className="material-icons-round" style={{ fontSize: 32, color: '#0f172a', marginLeft: 3 }}>play_arrow</span>
                                }
                              </div>
                            </div>
                          </div>
                          <div className="nr-curated-info">
                            <p className="nr-curated-title">{station.title}</p>
                            <p className="nr-curated-desc">{station.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile mini player ── */}
      {playingSource && (
        <div className="nr-mobile-player">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', background: 'var(--nr-primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {playingSource.image
                ? <img src={playingSource.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span className="material-icons-round" style={{ color: 'white', fontSize: 22 }}>radio</span>
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--nr-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{playingSource.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--nr-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{playingSource.style || 'Quran Radio'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handlePlayPause}
              style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--nr-primary)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {isBuffering
                ? <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'nrSpin 0.85s linear infinite' }} />
                : isPlaying
                ? <span className="material-icons-round" style={{ fontSize: 22 }}>pause</span>
                : <span className="material-icons-round" style={{ fontSize: 22 }}>play_arrow</span>
              }
            </button>
            <button
              onClick={handleStop}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'none', border: 'none', color: 'var(--nr-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <span className="material-icons-round" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
        .nr-portrait-card:hover .nr-portrait-overlay-btn { opacity: 1 !important; }
        .nr-portrait-card:hover .nr-portrait-img { transform: scale(1.08); }
        .nr-portrait-card:hover { transform: translateY(-6px) !important; }
        @media (max-width: 768px) { .nr-portrait-card:hover { transform: none !important; } }
      `}</style>
    </div>
  );
}
