"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import "./quranfy-player.css";
import "./player-controls-fix.css";

import { 
  Track, Reciter, RECITERS, SURAHS_DATA, GRADIENTS, QUICK_PLAY_SURAHS,
  estimateDuration, getAudioUrl 
} from "@/data/quran-player-data";
import { Icons } from "@/components/quran-player/PlayerIcons";
import { SurahArt } from "@/components/quran-player/SurahArt";

import { useLikedTracks } from "@/hooks/useLikedTracks";
import { useQueue } from "@/hooks/useQueue";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

import { Sidebar } from "@/components/quran-player/Sidebar";
import { BottomPlayerBar } from "@/components/quran-player/BottomPlayerBar";
import { MobilePlayer } from "@/components/quran-player/MobilePlayer";
import { QueuePanel } from "@/components/quran-player/QueuePanel";

export default function QuranPlayerPage() {
  const [currentReciter, setCurrentReciter] = useState<Reciter>(RECITERS[0]);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showSearchView, setShowSearchView] = useState(false);
  const [mobileView, setMobileView] = useState<'home'|'search'|'library'>('home');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReciterPlaylist, setSelectedReciterPlaylist] = useState<Reciter | null>(null);
  const [greeting, setGreeting] = useState("Welcome");

  const mainRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { likedTracks, isLiked, toggleLike } = useLikedTracks();
  
  // Memoized initial tracks for current reciter
  const tracks: Track[] = useMemo(() => SURAHS_DATA.map((s, i) => {
    const est = estimateDuration(s.ayahs);
    return {
      id: s.number,
      name: `Surah ${s.name}`,
      englishName: s.name,
      translation: s.translation,
      ayahs: s.ayahs,
      reciter: currentReciter.name,
      reciterId: currentReciter.id,
      audioUrl: getAudioUrl(s.number, currentReciter.server),
      duration: est.display,
      durationSeconds: est.seconds,
      gradient: GRADIENTS[i % GRADIENTS.length],
    };
  }), [currentReciter]);

  const {
    tracks: queueTracks,
    setTracks,
    currentTrack,
    setCurrentTrack,
    isShuffled,
    setIsShuffled,
    isRepeating,
    setIsRepeating,
    getNextTrack,
    getPrevTrack,
    getQueueList
  } = useQueue(tracks);

  // Sync tracks to queue when reciter changes
  useEffect(() => {
    setTracks(tracks);
  }, [tracks, setTracks]);

  const {
    isPlaying, duration, volume, isMuted, isLoading, audioError,
    togglePlay, playUrl, setVolume, setIsMuted, setAudioError
  } = useAudioPlayer(audioRef);

  const handlePlayTrack = async (track: Track) => {
    if (currentTrack?.id === track.id && currentTrack?.reciterId === track.reciterId) {
      togglePlay();
      return;
    }
    setCurrentTrack(track);
    await playUrl(track.audioUrl);
  };

  const playNext = useCallback(async () => {
    const next = getNextTrack();
    if (next) handlePlayTrack(next);
  }, [getNextTrack, handlePlayTrack]);

  const playPrev = useCallback(async () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prev = getPrevTrack();
    if (prev) handlePlayTrack(prev);
  }, [getPrevTrack, audioRef]);

  // Expose playNext and PlayPrev for the native audio 'ended' event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [isRepeating, playNext, audioRef]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      else if (e.code === 'ArrowRight') { if (audioRef.current) audioRef.current.currentTime = Math.min(duration || 0, audioRef.current.currentTime + 10); }
      else if (e.code === 'ArrowLeft') { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10); }
      else if (e.key.toLowerCase() === 'm') setIsMuted(p => !p);
      else if (e.key.toLowerCase() === 'n') playNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, playNext, duration, setIsMuted, audioRef]);

  // Derived state
  const likedTracksData = tracks.filter(t => isLiked(t.id));
  const filteredTracks = tracks.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.translation.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const openReciterPlaylist = (reciter: Reciter) => {
    setSelectedReciterPlaylist(reciter);
    setCurrentReciter(reciter);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  };

  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    };
    update();
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const getTotalDuration = (trackList: Track[]) => {
    const MathFloor = Math.floor;
    const totalSec = trackList.reduce((acc, t) => acc + t.durationSeconds, 0);
    const hours = MathFloor(totalSec / 3600);
    const mins = MathFloor((totalSec % 3600) / 60);
    if (hours > 0) return `about ${hours} hr ${mins} min`;
    return `about ${mins} min`;
  };

  const isTrackPlaying = (trackId: number) => currentTrack?.id === trackId && isPlaying;

  return (
    <div className="quranfy-player-page">
      <audio ref={audioRef} preload="auto" />

      {/* Audio Error Toast */}
      {audioError && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: '#e74c3c', color: '#fff', padding: '10px 24px', borderRadius: 8,
          fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 10, maxWidth: '90vw'
        }}>
          <span>⚠️ {audioError}</span>
          <button onClick={() => setAudioError(null)} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
            borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12
          }}>✕</button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && currentTrack && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(29, 185, 84, 0.9)', color: '#fff', padding: '8px 20px',
          borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9998,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#fff' }} />
          Loading audio...
        </div>
      )}

      <div className="sp-shell">
        <Sidebar 
          mobileView={mobileView} setMobileView={setMobileView} setShowSearchView={setShowSearchView}
          selectedReciterPlaylist={selectedReciterPlaylist} setSelectedReciterPlaylist={setSelectedReciterPlaylist}
          setSearchQuery={setSearchQuery} setShowCreatePlaylist={setShowCreatePlaylist}
          activeFilter={activeFilter} setActiveFilter={setActiveFilter}
          currentReciter={currentReciter} currentTrack={currentTrack}
          openReciterPlaylist={openReciterPlaylist} playTrack={handlePlayTrack}
          mainRef={mainRef} tracks={tracks} likedTracksData={likedTracksData}
        />

        <main className="sp-main" ref={mainRef}>
          {/* Top Bar */}
          <div className={`sp-topbar${scrolled ? " scrolled" : ""}`}>
            <div className="sp-topbar-left">
              <button
                className="sp-topbar-nav-btn"
                disabled={!selectedReciterPlaylist}
                onClick={() => setSelectedReciterPlaylist(null)}
              >
                <Icons.ChevronLeft />
              </button>
              <button className="sp-topbar-nav-btn" disabled>
                <Icons.ChevronRight />
              </button>
            </div>
            <div className="sp-topbar-right">
              <div className="sp-search-container">
                <Icons.Search />
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

          {/* VIEW ROUTING based on state */}
          {mobileView === 'search' && window.innerWidth < 768 ? (
            <div style={{ padding: '80px 24px 24px' }}>
              <h2 className="sp-section-title" style={{ marginBottom: 16 }}>Search Surahs</h2>
              <div className="sp-search-container" style={{ display: 'flex', position: 'relative', background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, marginBottom: 24 }}>
                <Icons.Search />
                <input
                  className="sp-search-input"
                  type="text"
                  placeholder="Search Any..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: 8, outline: 'none', width: '100%' }}
                />
              </div>
              <div className="sp-card-grid">
                {filteredTracks.map(track => (
                  <div key={track.id} className="sp-card" onClick={() => handlePlayTrack(track)}>
                    <div className="sp-card-art-container">
                      <SurahArt number={track.id} name={track.englishName} gradient={track.gradient} />
                      <button className="sp-card-play-btn" onClick={e => { e.stopPropagation(); handlePlayTrack(track); }}>
                        {isTrackPlaying(track.id) ? <Icons.Pause /> : <Icons.Play />}
                      </button>
                    </div>
                    <div className="sp-card-title">{track.name}</div>
                    <div className="sp-card-subtitle">{track.translation}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedReciterPlaylist ? (() => {
            const plReciter = selectedReciterPlaylist;
            const plTracks = SURAHS_DATA.map((s, i) => {
              const est = estimateDuration(s.ayahs);
              return {
                id: s.number,
                name: `Surah ${s.name}`,
                englishName: s.name,
                translation: s.translation,
                ayahs: s.ayahs,
                reciter: plReciter.name,
                reciterId: plReciter.id,
                audioUrl: getAudioUrl(s.number, plReciter.server),
                duration: est.display,
                durationSeconds: est.seconds,
                gradient: GRADIENTS[i % GRADIENTS.length],
              };
            });
            const plFiltered = searchQuery
              ? plTracks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.translation.toLowerCase().includes(searchQuery.toLowerCase()))
              : plTracks;
            const totalDur = getTotalDuration(plFiltered);
            const gradientClass = GRADIENTS[plReciter.id % GRADIENTS.length];
            const gradientBgMap: Record<string, string> = {
              'sp-gradient-1': 'rgba(30, 130, 76, 0.6)',
              'sp-gradient-2': 'rgba(22, 115, 166, 0.6)',
              'sp-gradient-3': 'rgba(142, 68, 173, 0.6)',
              'sp-gradient-4': 'rgba(192, 57, 43, 0.6)',
              'sp-gradient-5': 'rgba(39, 60, 117, 0.6)',
              'sp-gradient-6': 'rgba(30, 130, 76, 0.5)',
              'sp-gradient-7': 'rgba(211, 84, 0, 0.6)',
              'sp-gradient-8': 'rgba(44, 62, 80, 0.6)',
            };
            const heroBg = gradientBgMap[gradientClass] || 'rgba(30, 130, 76, 0.6)';

            return (
              <>
                <div className="sp-rp-hero" style={{ background: `linear-gradient(180deg, ${heroBg} 0%, rgba(18,18,18,1) 100%)` }}>
                  <div className="sp-rp-hero-inner">
                    <div className="sp-rp-cover">
                      <img src={plReciter.image} alt={plReciter.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    </div>
                    <div className="sp-rp-info">
                      <span className="sp-rp-type">Playlist</span>
                      <h1 className="sp-rp-title">{plReciter.name}</h1>
                      <p className="sp-rp-desc">
                        Complete Quran recitation by {plReciter.name}. Listen to all 114 surahs with beautiful tilawah.
                      </p>
                      <div className="sp-rp-meta">
                        <div className="sp-rp-meta-avatar">
                          <img src={plReciter.image} alt={plReciter.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        </div>
                        <span className="sp-rp-meta-name">{plReciter.name}</span>
                        <span className="sp-rp-meta-dot">•</span>
                        <span className="sp-rp-meta-count">{plFiltered.length} surahs, {totalDur}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sp-rp-controls">
                  <button
                    className="sp-big-play-btn"
                    onClick={() => {
                      if (currentTrack && currentTrack.reciterId === plReciter.id && isPlaying) {
                        togglePlay();
                      } else if (plFiltered.length > 0) {
                        handlePlayTrack(plFiltered[0]);
                      }
                    }}
                  >
                    {(isPlaying && currentTrack?.reciterId === plReciter.id) ? <Icons.Pause /> : <Icons.Play />}
                  </button>
                  <button
                    className={`sp-control-btn${isShuffled ? " active" : ""}`}
                    onClick={() => setIsShuffled(!isShuffled)}
                    style={{ width: 32, height: 32 }}
                  >
                    <Icons.Shuffle />
                  </button>
                </div>

                <div className="sp-tracklist" style={{ padding: '0 24px 24px' }}>
                  <div className="sp-tracklist-header">
                    <span>#</span>
                    <span>Title</span>
                    <span className="sp-th-album">Ayahs</span>
                    <span className="sp-th-duration" style={{ textAlign: 'right' }}>
                      <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/><path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"/></svg>
                    </span>
                  </div>

                  {plFiltered.map((track, index) => {
                    const playing = currentTrack?.id === track.id && currentTrack?.reciterId === track.reciterId;
                    return (
                      <div
                        key={track.id}
                        className={`sp-track-row${playing ? " playing" : ""}`}
                        onClick={() => {
                          if(currentReciter.id !== plReciter.id) setCurrentReciter(plReciter);
                          handlePlayTrack(track);
                        }}
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
                        <div className="sp-track-album">{track.ayahs} ayahs</div>
                        <div className="sp-track-duration">{track.duration}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="sp-footer-spacer" />
              </>
            );
          })() : (
            <>
              {/* Hero Gradient */}
              <div className="sp-hero-gradient">
                <h1 className="sp-hero-greeting">{greeting}</h1>
              </div>

              {/* Quick Play Grid */}
              <div className="sp-quickplay-grid">
                {QUICK_PLAY_SURAHS.map((s, i) => {
                  const track = tracks.find(t => t.id === s.number);
                  if (!track) return null;
                  return (
                    <div key={s.number} className="sp-quickplay-card" onClick={() => handlePlayTrack(track)}>
                      <div className="sp-quickplay-art">
                        <SurahArt number={s.number} name={s.name} gradient={GRADIENTS[i % GRADIENTS.length]} size="small" />
                      </div>
                      <span className="sp-quickplay-name">Surah {s.name}</span>
                      <button className="sp-quickplay-play" onClick={e => { e.stopPropagation(); handlePlayTrack(track); }}>
                        {isTrackPlaying(s.number) ? <Icons.Pause /> : <Icons.Play />}
                      </button>
                    </div>
                  );
                })}
                {likedTracksData.length > 0 && (
                  <div className="sp-quickplay-card" onClick={() => handlePlayTrack(likedTracksData[0])}>
                    <div className="sp-quickplay-art" style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.HeartFilled />
                    </div>
                    <span className="sp-quickplay-name">Liked Tracks</span>
                    <button className="sp-quickplay-play" onClick={e => { e.stopPropagation(); handlePlayTrack(likedTracksData[0]); }}>
                       <Icons.Play />
                    </button>
                  </div>
                )}
              </div>

              {/* Popular Reciters Section */}
              <div className="sp-section">
                <div className="sp-section-header">
                  <h2 className="sp-section-title">Popular Reciters</h2>
                  <button className="sp-section-show-all" onClick={() => toggleSection('reciters')}>{ expandedSections.has('reciters') ? 'Show less' : 'Show all' }</button>
                </div>
                <div className="sp-reciter-row" style={expandedSections.has('reciters') ? { flexWrap: 'wrap' } : {}}>
                  {RECITERS.slice(0, expandedSections.has('reciters') ? 99 : 6).map((r) => (
                    <div key={r.id} className="sp-reciter-item" onClick={() => openReciterPlaylist(r)}>
                      <div className="sp-reciter-avatar">
                        <img src={r.image} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
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
                  <button className="sp-section-show-all" onClick={() => toggleSection('featured')}>{ expandedSections.has('featured') ? 'Show less' : 'Show all' }</button>
                </div>
                <div className="sp-card-grid">
                  {(expandedSections.has('featured') ? filteredTracks : filteredTracks.slice(0, 8)).map(track => (
                    <div key={track.id} className="sp-card" onClick={() => handlePlayTrack(track)}>
                      <div className="sp-card-art-container">
                        <SurahArt number={track.id} name={track.englishName} gradient={track.gradient} />
                        <button className="sp-card-play-btn" onClick={e => { e.stopPropagation(); handlePlayTrack(track); }}>
                          {isTrackPlaying(track.id) ? <Icons.Pause /> : <Icons.Play />}
                        </button>
                      </div>
                      <div className="sp-card-title">{track.name}</div>
                      <div className="sp-card-subtitle">{track.translation} · {track.ayahs} ayahs</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sp-footer-spacer" />
            </>
          )}

        </main>

        <BottomPlayerBar 
          audioRef={audioRef}
          currentTrack={currentTrack}
          isPlaying={isPlaying} togglePlay={togglePlay} playNext={playNext} playPrev={playPrev}
          isShuffled={isShuffled} setIsShuffled={setIsShuffled}
          isRepeating={isRepeating} setIsRepeating={setIsRepeating}
          volume={volume} setVolume={setVolume}
          isMuted={isMuted} setIsMuted={setIsMuted}
          showQueue={showQueue} setShowQueue={setShowQueue}
          isLiked={isLiked} toggleLike={toggleLike}
          setShowNowPlaying={setShowNowPlaying}
          duration={duration}
        />

        <MobilePlayer 
          audioRef={audioRef}
          currentTrack={currentTrack}
          isPlaying={isPlaying} togglePlay={togglePlay} playNext={playNext} playPrev={playPrev}
          isShuffled={isShuffled} setIsShuffled={setIsShuffled}
          isRepeating={isRepeating} setIsRepeating={setIsRepeating}
          volume={volume} setVolume={setVolume}
          isMuted={isMuted} setIsMuted={setIsMuted}
          isLiked={isLiked} toggleLike={toggleLike}
          showNowPlaying={showNowPlaying} setShowNowPlaying={setShowNowPlaying}
          duration={duration}
        />
        
        {/* Mobile Nav hidden, already inside shell */}
        <div className="sp-mobile-nav">
          <button className={`sp-mobile-nav-item ${mobileView === 'home' ? 'active' : ''}`} onClick={() => { setMobileView('home'); setSelectedReciterPlaylist(null); setSearchQuery(''); }}>
             <Icons.Home /><span>Home</span>
          </button>
          <button className={`sp-mobile-nav-item ${mobileView === 'search' ? 'active' : ''}`} onClick={() => { setMobileView('search'); setShowSearchView(v=>!v); }}>
             <Icons.Search /><span>Search</span>
          </button>
          <button className={`sp-mobile-nav-item ${mobileView === 'library' ? 'active' : ''}`} onClick={() => { setMobileView('library'); setSelectedReciterPlaylist(null); setSearchQuery(''); }}>
             <Icons.Library /><span>Library</span>
          </button>
        </div>

      </div>

      <QueuePanel 
        showQueue={showQueue} setShowQueue={setShowQueue}
        currentTrack={currentTrack} queueList={getQueueList(30)}
        playTrack={handlePlayTrack}
      />

      {/* CREATE PLAYLIST MODAL TEMPORARY DISABLED/DUMMY TOAST */}
      {showCreatePlaylist && (
        <div className="sp-modal-backdrop" onClick={() => setShowCreatePlaylist(false)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <button className="sp-modal-close" onClick={() => setShowCreatePlaylist(false)} aria-label="Close"><Icons.Close /></button>
            <h2 className="sp-modal-title">Create playlist</h2>
            <p className="sp-modal-desc">Coming soon! Custom playlists are currently in development.</p>
            <div className="sp-modal-actions">
              <button className="sp-modal-btn cancel" onClick={() => setShowCreatePlaylist(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}