'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { fetchReciters, fetchStations, fetchAudio } from './lib/api';
import { liveRadioAPI, LiveStation } from './lib/api/live-radio-api';
import { Station, Reciter } from './lib/types';
import EqualizerPanel, { EqualizerSettings } from './components/EqualizerPanel';

type PlayingSource = {
  type: 'live' | 'reciter' | 'station';
  id: string | number;
  name: string;
  image?: string;
  style?: string;
} | null;

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
  const [activeTab, setActiveTab] = useState<'live' | 'reciters' | 'curated'>('live');
  const [isDark, setIsDark] = useState(false);

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
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDark(document.documentElement.classList.contains('dark'));
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDark ? '#0d1b12' : '#f8faf7',
        color: isDark ? '#f1f5f9' : '#0f172a',
        fontFamily: "'Inter', sans-serif",
        backgroundImage: isDark 
          ? "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30-15-30z' fill='%2310b981' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\")"
          : "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30-15-30z' fill='%2310b981' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        transition: 'background 0.3s, color 0.3s',
      }}
    >
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

      {/* MAIN */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(24px, 6vw, 48px) clamp(12px, 4vw, 24px)', paddingBottom: 160 }}>
        {/* Hero Header */}
        <div style={{ marginBottom: 48, position: 'relative' }}>
          <div style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)',
            borderRadius: 32,
            padding: '40px 32px',
            border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.15)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(16,185,129,0.1), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{
                  display: 'inline-block', padding: '6px 14px',
                  background: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
                  color: isDark ? '#34d399' : '#059669',
                  fontSize: 11, fontWeight: 700, borderRadius: 999,
                  textTransform: 'uppercase', letterSpacing: '0.1em', border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.25)'
                }}>
                  🎙️ Live Streaming
                </span>
              </div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(32px,6vw,48px)', fontWeight: 800, margin: '16px 0 12px', color: isDark ? '#ecfdf5' : '#065f46', letterSpacing: '-0.02em' }}>
                World Renowned Reciters
              </h1>
              <p style={{ color: isDark ? '#cbd5e1' : '#581c87', fontSize: 17, maxWidth: 600, margin: '0 0 2px', lineHeight: 1.6 }}>
                Experience 24/7 Quranic broadcasts from the world's most beautiful and inspiring voices.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
          {([
            { id: 'live', label: '🔴 Live Radio', count: filteredLiveStations.length },
            { id: 'reciters', label: '🎙️ Reciters', count: filteredReciters.length },
            { id: 'curated', label: '⭐ Curated', count: filteredCurated.length },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px', borderRadius: 12,
                border: 'none',
                background: activeTab === tab.id
                  ? '#10b981'
                  : isDark ? '#1a2f1f' : '#f0fdf4',
                color: activeTab === tab.id ? 'white' : isDark ? '#6b7280' : '#374151',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = isDark ? '#2d4f38' : '#ecfdf5';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = isDark ? '#1a2f1f' : '#f0fdf4';
                }
              }}
            >
              {tab.label}
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : isDark ? '#374151' : '#d1fae5',
                color: activeTab === tab.id ? 'white' : isDark ? '#9ca3af' : '#065f46',
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <span className="material-icons-round" style={{ fontSize: 20 }}>error_outline</span>
              <span style={{ fontSize: 14, flex: 1 }}>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex' }}>
                <span className="material-icons-round" style={{ fontSize: 18 }}>close</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
            <div style={{ width: 48, height: 48, border: '4px solid rgba(16,185,129,0.15)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Loading stations...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* LIVE TAB */}
            {activeTab === 'live' && (
              <motion.div key="live" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 24,
                }}>
                  {filteredLiveStations.map((station, i) => (
                    <motion.div
                      key={station.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      onClick={() => handleLiveStationPlay(station)}
                      className="reciter-portrait-card"
                      style={{
                        position: 'relative',
                        borderRadius: 28,
                        overflow: 'hidden',
                        aspectRatio: '3/4',
                        cursor: 'pointer',
                        background: '#0f172a',
                        boxShadow: isCardActive(station.id)
                          ? '0 0 0 3px #10b981, 0 24px 48px rgba(16,185,129,0.25)'
                          : isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
                        transform: 'translateY(0)',
                        transition: 'box-shadow 0.3s, transform 0.3s',
                      }}
                    >
                      {/* Background Image */}
                      {station.imageUrl ? (
                        <img
                          src={station.imageUrl}
                          alt={station.name}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, transition: 'transform 0.6s' }}
                          className="card-img"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #064e3b, #065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-icons-round" style={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }}>radio</span>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: isCardActive(station.id)
                          ? 'linear-gradient(to top, #10b981 0%, rgba(16,185,129,0.6) 50%, transparent 100%)'
                          : 'linear-gradient(to top, #065f46 0%, rgba(6,95,70,0.6) 50%, transparent 100%)',
                      }} />
                      {/* Now Playing badge */}
                      {isCardActive(station.id) && (
                        <div style={{ position: 'absolute', top: 16, right: 16, background: '#10b981', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Now Playing
                        </div>
                      )}
                      {/* Play Overlay */}
                      <div className="play-overlay-btn" style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: isCardActive(station.id) ? 1 : 0,
                        transition: 'opacity 0.25s',
                      }}>
                        <div style={{
                          width: 72, height: 72, borderRadius: '50%',
                          background: isCardActive(station.id) ? 'white' : 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}>
                          {isBuffering && isCardActive(station.id) ? (
                            <div style={{ width: 28, height: 28, border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          ) : isCardPlaying(station.id) ? (
                            <span className="material-icons-round" style={{ fontSize: 40, color: '#10b981' }}>pause</span>
                          ) : (
                            <span className="material-icons-round" style={{ fontSize: 44, color: isCardActive(station.id) ? '#10b981' : 'white', marginLeft: 4 }}>play_arrow</span>
                          )}
                        </div>
                      </div>
                      {/* Card Bottom Info */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block', animation: isCardPlaying(station.id) ? 'ping 1.5s ease-in-out infinite' : 'pulse 2s ease-in-out infinite' }} />
                          <span style={{ color: '#6ee7b7', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {isCardPlaying(station.id) ? 'Broadcasting' : 'Active Now'}
                          </span>
                        </div>
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: 'white', margin: '0 0 4px', lineHeight: 1.3 }}>
                          {station.reciterName || station.name}
                        </h3>
                        <p style={{ color: 'rgba(110,231,183,0.7)', fontSize: 12, margin: '0 0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {station.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(110,231,183,0.6)', fontSize: 11, fontWeight: 500 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-icons-round" style={{ fontSize: 14 }}>settings_input_antenna</span>
                            {station.bitrate || 128}kbps
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-icons-round" style={{ fontSize: 14 }}>audiotrack</span>
                            MP3
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* RECITERS TAB */}
            {activeTab === 'reciters' && (
              <motion.div key="reciters" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 24,
                }}>
                  {filteredReciters.map((reciter, i) => (
                    <motion.div
                      key={reciter.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                      onClick={() => handleReciterPlay(reciter)}
                      className="reciter-portrait-card"
                      style={{
                        position: 'relative',
                        borderRadius: 28,
                        overflow: 'hidden',
                        aspectRatio: '3/4',
                        cursor: 'pointer',
                        background: '#0f172a',
                        boxShadow: isCardActive(reciter.id)
                          ? '0 0 0 3px #10b981, 0 24px 48px rgba(16,185,129,0.25)'
                          : isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
                        transition: 'box-shadow 0.3s, transform 0.3s',
                      }}
                    >
                      {/* Image */}
                      <img
                        src={reciter.imageUrl}
                        alt={reciter.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'transform 0.6s' }}
                        className="card-img"
                        onError={e => {
                          (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23064e3b"/><text x="50" y="60" text-anchor="middle" fill="%2334d399" font-size="40">🎙</text></svg>`;
                        }}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: isCardActive(reciter.id)
                          ? 'linear-gradient(to top, #10b981 0%, rgba(16,185,129,0.6) 50%, transparent 100%)'
                          : 'linear-gradient(to top, #065f46 0%, rgba(6,95,70,0.6) 50%, transparent 100%)',
                      }} />
                      {isCardActive(reciter.id) && (
                        <div style={{ position: 'absolute', top: 16, right: 16, background: '#10b981', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Now Playing
                        </div>
                      )}
                      <div className="play-overlay-btn" style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: isCardActive(reciter.id) ? 1 : 0, transition: 'opacity 0.25s',
                      }}>
                        <div style={{
                          width: 68, height: 68, borderRadius: '50%',
                          background: isCardActive(reciter.id) ? 'white' : 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}>
                          {isBuffering && isCardActive(reciter.id) ? (
                            <div style={{ width: 26, height: 26, border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          ) : isCardPlaying(reciter.id) ? (
                            <span className="material-icons-round" style={{ fontSize: 38, color: '#10b981' }}>pause</span>
                          ) : (
                            <span className="material-icons-round" style={{ fontSize: 42, color: isCardActive(reciter.id) ? '#10b981' : 'white', marginLeft: 4 }}>play_arrow</span>
                          )}
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 18px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
                          <span style={{ color: '#6ee7b7', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {isCardPlaying(reciter.id) ? 'Playing' : 'Available'}
                          </span>
                        </div>
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: 'white', margin: '0 0 4px', lineHeight: 1.3 }}>
                          {reciter.name}
                        </h3>
                        <p style={{ color: 'rgba(110,231,183,0.7)', fontSize: 12, margin: 0 }}>
                          {reciter.style || 'Classical Recitation'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CURATED TAB */}
            {activeTab === 'curated' && (
              <motion.div key="curated" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 24,
                }}>
                  {filteredCurated.map((station, i) => (
                    <motion.div
                      key={station.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      onClick={() => handleStationPlay(station)}
                      className="reciter-portrait-card"
                      style={{
                        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                        background: isDark ? '#0f172a' : 'white',
                        border: isCardActive(station.id) ? '2px solid #10b981' : `2px solid ${isDark ? '#1a2f1f' : '#e2e8f0'}`,
                        boxShadow: isCardActive(station.id) ? '0 8px 32px rgba(16,185,129,0.25)' : isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                        {station.image && (
                          <img src={station.image} alt={station.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="card-img" />
                        )}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.25s' }} className="play-overlay-btn">
                          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isCardPlaying(station.id) ? (
                              <span className="material-icons-round" style={{ color: 'white', fontSize: 30 }}>pause</span>
                            ) : (
                              <span className="material-icons-round" style={{ color: 'white', fontSize: 32, marginLeft: 3 }}>play_arrow</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: 15, color: isDark ? 'white' : '#0f172a', margin: '0 0 4px' }}>{station.title}</h3>
                        <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 13, margin: 0 }}>{station.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* FOOTER PLAYER BAR */}
      <AnimatePresence>
        {playingSource && (
          <motion.footer
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
              padding: '12px 16px',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              maxWidth: 1280, margin: '0 auto',
              background: isDark ? 'rgba(13,27,18,0.95)' : 'rgba(248,250,247,0.95)',
              backdropFilter: 'blur(16px)',
              border: isDark ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(16,185,129,0.1)',
              borderRadius: 24,
              boxShadow: isDark ? '0 -4px 32px rgba(0,0,0,0.3)' : '0 -4px 20px rgba(0,0,0,0.06)',
              padding: '14px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
              pointerEvents: 'auto', flexWrap: 'wrap',
            }}>
              {/* Left: Now Playing Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: '0 0 auto' }}>
                <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 14, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {playingSource?.image ? (
                    <img src={playingSource.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-icons-round" style={{ color: 'white', fontSize: 28 }}>radio</span>
                    </div>
                  )}
                  {/* Sound wave animation overlay */}
                  {isPlaying && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      {[3, 4, 2, 4].map((h, i) => (
                        <div key={i} style={{
                          width: 3, background: 'white', borderRadius: 2,
                          height: h * 4,
                          animation: `playerBar${i} ${0.8 + i * 0.2}s ease-in-out infinite alternate`,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                    Now Playing
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? 'white' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200, fontFamily: "'Outfit', sans-serif" }}>
                    {playingSource.name}
                  </div>
                  <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {playingSource.style || 'Quran Radio'}
                  </div>
                </div>
              </div>

              {/* Center: Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: '1 1 auto', maxWidth: 440 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {/* Prev */}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#10b981'} onMouseLeave={e => e.currentTarget.style.color = isDark ? '#64748b' : '#94a3b8'}>
                    <span className="material-icons-round">skip_previous</span>
                  </button>
                  {/* Play / Pause */}
                  <button
                    onClick={async () => { if (isPlaying) { await safePause(); } else { await safePlay(); } }}
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: '#10b981',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      color: 'white',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.08)';
                      e.currentTarget.style.boxShadow = '0 6px 28px rgba(16,185,129,0.5)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.4)';
                    }}
                  >
                    {isBuffering ? (
                      <div style={{ width: 22, height: 22, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    ) : isPlaying ? (
                      <span className="material-icons-round" style={{ fontSize: 28 }}>pause</span>
                    ) : (
                      <span className="material-icons-round" style={{ fontSize: 28 }}>play_arrow</span>
                    )}
                  </button>
                  {/* Next */}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#10b981'} onMouseLeave={e => e.currentTarget.style.color = isDark ? '#64748b' : '#94a3b8'}>
                    <span className="material-icons-round">skip_next</span>
                  </button>
                  {/* Stop */}
                  <button
                    onClick={handleStop}
                    title="Stop"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8', display: 'flex', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color = isDark ? '#64748b' : '#94a3b8'}
                  >
                    <span className="material-icons-round">stop_circle</span>
                  </button>
                </div>
              </div>

              {/* Right: Volume + EQ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '0 0 auto' }}>
                {/* Volume */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-icons-round" style={{ color: '#10b981', fontSize: 20 }}>
                    {volume === 0 ? 'volume_off' : volume < 0.4 ? 'volume_down' : 'volume_up'}
                  </span>
                  <input
                    type="range" min="0" max="1" step="0.01" value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    style={{ width: 80, accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>
                {/* EQ button */}
                <div style={{ width: 1, height: 24, background: isDark ? 'rgba(16,185,129,0.2)' : '#e2e8f0' }} />
                <button
                  onClick={() => setShowEqualizer(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                  onMouseLeave={e => e.currentTarget.style.color = isDark ? '#64748b' : '#94a3b8'}
                  title="Equalizer"
                >
                  <span className="material-icons-round" style={{ fontSize: 20 }}>equalizer</span>
                </button>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');

        .reciter-portrait-card:hover .play-overlay-btn { opacity: 1 !important; }
        .reciter-portrait-card:hover .card-img { transform: scale(1.08); }
        .reciter-portrait-card:hover { transform: translateY(-6px) !important; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes ping {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; transform: scale(1.5); }
        }
        @keyframes playerBar0 { from { height: 6px; } to { height: 14px; } }
        @keyframes playerBar1 { from { height: 10px; } to { height: 18px; } }
        @keyframes playerBar2 { from { height: 4px; } to { height: 10px; } }
        @keyframes playerBar3 { from { height: 12px; } to { height: 18px; } }

        input[type=range] { height: 4px; border-radius: 999px; }
        input[type=range]::-webkit-slider-thumb { width: 14px; height: 14px; }
        
        @media (max-width: 768px) {
          .reciter-portrait-card:hover { transform: none !important; }
          nav { padding: 0 !important; }
        }
        
        @media (max-width: 640px) {
          main { padding-left: 12px !important; padding-right: 12px !important; }
        }
      `}</style>
    </div>
  );
}
