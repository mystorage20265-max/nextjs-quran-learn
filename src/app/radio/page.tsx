'use client';

/**
 * Advanced Quran Radio Platform
 * Premium UI with glassmorphism, real-time visualizations, and professional design
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchReciters, fetchStations, fetchAudio } from './lib/api';
import { liveRadioAPI, LiveStation } from './lib/api/live-radio-api';
import { Station, Reciter } from './lib/types';
import EqualizerPanel, { EqualizerSettings } from './components/EqualizerPanel';
import './styles/radio.css';

// Type for playing source
type PlayingSource = {
  type: 'live' | 'reciter' | 'station';
  id: string | number;
  name: string;
  image?: string;
  style?: string;
} | null;

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  }
};

export default function AdvancedRadioPage() {
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
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

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();

      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;

      // Create 10-band equalizer
      const frequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
      const nodes = frequencies.map(freq => {
        const filter = audioContextRef.current!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });

      // Connect nodes in chain
      source.connect(nodes[0]);
      for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].connect(nodes[i + 1]);
      }
      nodes[nodes.length - 1].connect(analyser);
      analyser.connect(audioContextRef.current.destination);

      analyserRef.current = analyser;
      setEqualizerNodes(nodes);
    } catch (err) {
      console.error('Error initializing audio context:', err);
    }
  }, []);

  // Visualizer animation
  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) return;
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient color
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth;
      }
    };

    draw();
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      drawVisualizer();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, drawVisualizer]);

  // Volume change handler
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Apply equalizer settings
  useEffect(() => {
    if (equalizerNodes.length > 0) {
      equalizerSettings.bands.forEach((value, index) => {
        if (equalizerNodes[index]) {
          equalizerNodes[index].gain.value = value;
        }
      });
    }
  }, [equalizerSettings, equalizerNodes]);

  // Safe play helper that handles the AbortError race condition
  const safePlay = async () => {
    if (!audioRef.current) return;
    try {
      playPromiseRef.current = audioRef.current.play();
      await playPromiseRef.current;
      playPromiseRef.current = null;
    } catch (err: unknown) {
      playPromiseRef.current = null;
      // AbortError is expected when pause() is called during play() - ignore it
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      throw err;
    }
  };

  // Safe pause helper that waits for pending play to complete
  const safePause = async () => {
    if (!audioRef.current) return;
    // Wait for any pending play promise to resolve before pausing
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // Ignore errors from the pending play
      }
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
        await safePause();
        setIsPaused(true);
        setIsPlaying(false);
        return;
      }

      if (playingSource?.id === station.id && isPaused) {
        await safePlay();
        setIsPaused(false);
        setIsPlaying(true);
        return;
      }

      audioRef.current.src = station.streamUrl;
      setPlayingSource({
        type: 'live',
        id: station.id,
        name: station.reciterName || station.name,
        image: station.imageUrl,
        style: station.style,
      });

      await safePlay();
      setIsPlaying(true);
      setIsPaused(false);
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
        await safePause();
        setIsPaused(true);
        setIsPlaying(false);
        return;
      }

      if (playingSource?.id === reciter.id && isPaused) {
        await safePlay();
        setIsPaused(false);
        setIsPlaying(true);
        return;
      }

      const reciterId = reciter.originalReciterId || reciter.id;
      // Random surah from 1-114 (all 114 surahs of the Quran)
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      const audioData = await fetchAudio(reciterId, randomSurah);

      if (audioData.audioUrls && audioData.audioUrls[0]) {
        audioRef.current.src = audioData.audioUrls[0];
        setPlayingSource({
          type: 'reciter',
          id: reciter.id,
          name: reciter.name,
          image: reciter.imageUrl,
          style: reciter.style,
        });

        await safePlay();
        setIsPlaying(true);
        setIsPaused(false);
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
        await safePause();
        setIsPaused(true);
        setIsPlaying(false);
        return;
      }

      if (playingSource?.id === station.id && isPaused) {
        await safePlay();
        setIsPaused(false);
        setIsPlaying(true);
        return;
      }

      // Random surah from 1-114 for curated stations
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      const audioData = await fetchAudio(7, randomSurah); // Default to Mishary for curated
      if (audioData.audioUrls && audioData.audioUrls[0]) {
        audioRef.current.src = audioData.audioUrls[0];
        setPlayingSource({
          type: 'station',
          id: station.id,
          name: station.title,
          image: station.image,
          style: station.description,
        });

        await safePlay();
        setIsPlaying(true);
        setIsPaused(false);
      }
    } catch (err) {
      console.error('Error playing station:', err);
      setError('Failed to load audio.');
      setIsPlaying(false);
    }
  };

  const handleStop = async () => {
    await safePause();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setPlayingSource(null);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleAudioPlay = () => {
    initializeAudioContext();
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
    setIsPaused(true);
  };

  // Filter by search
  const filteredReciters = reciters.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLiveStations = liveStations.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.reciterName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCurated = curatedStations.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="radio-page">
      {/* Hidden Audio Element */}
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

      {/* Premium Header */}
      <header className="radio-header">
        <div className="radio-header-inner">
          {/* Logo */}
          <div className="radio-logo">
            <div className="radio-logo-icon">
              <span>📻</span>
            </div>
            <div className="radio-logo-text">
              <h1>Quran Radio</h1>
              <p>Live Streaming Platform</p>
            </div>
          </div>

          {/* Search */}
          <div className="radio-search">
            <div style={{ position: 'relative' }}>
              <svg
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#9ca3af',
                  pointerEvents: 'none'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search reciters, stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="radio-search-input"
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEqualizer(true)}
              className="control-btn"
              title="Equalizer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 pb-32">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center py-6"
        >
          <div className="radio-tabs">
            {[
              { id: 'live', label: '🔴 Live Radio', count: filteredLiveStations.length },
              { id: 'reciters', label: '🎙️ Reciters', count: filteredReciters.length },
              { id: 'curated', label: '⭐ Curated', count: filteredCurated.length },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`radio-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
                <span className="radio-tab-count">{tab.count}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
            />
            <p className="text-gray-400">Loading stations...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Live Stations Tab */}
            {activeTab === 'live' && (
              <motion.div
                key="live"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeInUp}
              >
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Live Radio Stations</h2>
                    <p className="section-subtitle">24/7 continuous Quran recitation from around the world</p>
                  </div>
                  <div className="section-badge">
                    <div className="status-dot" />
                    <span>{filteredLiveStations.length} Live Now</span>
                  </div>
                </div>

                <motion.div
                  className="station-grid"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredLiveStations.map((station) => (
                    <motion.div
                      key={station.id}
                      variants={cardVariant}
                      onClick={() => handleLiveStationPlay(station)}
                      className={`station-card ${playingSource?.id === station.id && isPlaying ? 'playing' : ''}`}
                    >
                      <div className="station-card-image">
                        {station.imageUrl && (
                          <img
                            src={station.imageUrl}
                            alt={station.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="live-badge">
                          <div className="live-badge-dot" />
                          LIVE
                        </div>
                        {station.style && (
                          <div className="style-badge">{station.style}</div>
                        )}
                        <div className="station-card-overlay">
                          <div className="play-button">
                            {playingSource?.id === station.id && isBuffering ? (
                              <div className="buffering-spinner" />
                            ) : playingSource?.id === station.id && isPlaying ? (
                              <div className="music-bars">
                                <div className="music-bar" />
                                <div className="music-bar" />
                                <div className="music-bar" />
                              </div>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="station-card-content">
                        <h3 className="station-card-title">{station.reciterName || station.name}</h3>
                        <p className="station-card-subtitle">{station.description}</p>
                        <div className="station-card-meta">
                          <span>{station.bitrate}kbps • MP3</span>
                          <div className="station-card-status">
                            <div className="status-dot" />
                            Active
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Reciters Tab */}
            {activeTab === 'reciters' && (
              <motion.div
                key="reciters"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeInUp}
              >
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Quran Reciters</h2>
                    <p className="section-subtitle">Listen to the world's most renowned reciters</p>
                  </div>
                </div>

                <motion.div
                  className="reciter-grid"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredReciters.map((reciter) => (
                    <motion.div
                      key={reciter.id}
                      variants={cardVariant}
                      onClick={() => handleReciterPlay(reciter)}
                      className={`reciter-card ${playingSource?.id === reciter.id && isPlaying ? 'playing' : ''}`}
                    >
                      <div className="reciter-avatar">
                        <img
                          src={reciter.imageUrl}
                          alt={reciter.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="30">🎙️</text></svg>';
                          }}
                        />
                        <div className="reciter-avatar-overlay">
                          <div className="reciter-play-btn">
                            {playingSource?.id === reciter.id && isBuffering ? (
                              <div className="buffering-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                            ) : playingSource?.id === reciter.id && isPlaying ? (
                              <div className="music-bars" style={{ transform: 'scale(0.6)' }}>
                                <div className="music-bar" />
                                <div className="music-bar" />
                                <div className="music-bar" />
                              </div>
                            ) : (
                              <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="#1e293b">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                      <h3 className="reciter-name">{reciter.name}</h3>
                      <p className="reciter-style">{reciter.style}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Curated Tab */}
            {activeTab === 'curated' && (
              <motion.div
                key="curated"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeInUp}
              >
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Curated Stations</h2>
                    <p className="section-subtitle">Hand-picked collections for the best experience</p>
                  </div>
                </div>

                <motion.div
                  className="station-grid"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredCurated.map((station) => (
                    <motion.div
                      key={station.id}
                      variants={cardVariant}
                      onClick={() => handleStationPlay(station)}
                      className={`station-card ${playingSource?.id === station.id && isPlaying ? 'playing' : ''}`}
                    >
                      <div className="station-card-image" style={{ aspectRatio: '16/9' }}>
                        {station.image && (
                          <img src={station.image} alt={station.title} />
                        )}
                        <div className="station-card-overlay">
                          <div className="play-button">
                            {playingSource?.id === station.id && isBuffering ? (
                              <div className="buffering-spinner" />
                            ) : playingSource?.id === station.id && isPlaying ? (
                              <div className="music-bars">
                                <div className="music-bar" />
                                <div className="music-bar" />
                                <div className="music-bar" />
                              </div>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="station-card-content">
                        <h3 className="station-card-title">{station.title}</h3>
                        <p className="station-card-subtitle">{station.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Now Playing Bar */}
      <AnimatePresence>
        {playingSource && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="now-playing-bar"
          >
            {/* Visualizer Canvas */}
            <canvas
              ref={canvasRef}
              width={1200}
              height={80}
              className="now-playing-visualizer"
            />

            <div className="now-playing-content">
              {/* Album Art */}
              <div className={`now-playing-album ${isPlaying ? 'playing' : ''}`}>
                {playingSource.image ? (
                  <img src={playingSource.image} alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📻</div>
                )}
              </div>

              {/* Track Info */}
              <div className="now-playing-info">
                <h4 className="now-playing-title">{playingSource.name}</h4>
                <p className="now-playing-subtitle">{playingSource.style || 'Quran Radio'}</p>
              </div>

              {/* Controls */}
              <div className="now-playing-controls">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={async () => {
                    if (isPlaying) {
                      await safePause();
                    } else {
                      await safePlay();
                    }
                  }}
                  className="control-btn primary"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleStop}
                  className="control-btn"
                  title="Stop"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                </motion.button>
              </div>

              {/* Volume */}
              <div className="volume-control">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
