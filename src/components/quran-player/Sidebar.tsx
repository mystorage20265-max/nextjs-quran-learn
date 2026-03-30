import React, { Dispatch, SetStateAction } from "react";
import { Track, Reciter, RECITERS, SURAHS_DATA, GRADIENTS } from "@/data/quran-player-data";
import { Icons } from "./PlayerIcons";
import { SurahArt } from "./SurahArt";

interface SidebarProps {
  mobileView: 'home' | 'search' | 'library';
  setMobileView: (v: 'home' | 'search' | 'library') => void;
  setShowSearchView: Dispatch<SetStateAction<boolean>>;
  selectedReciterPlaylist: Reciter | null;
  setSelectedReciterPlaylist: (r: Reciter | null) => void;
  setSearchQuery: (q: string) => void;
  setShowCreatePlaylist: (v: boolean) => void;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  currentReciter: Reciter;
  currentTrack: Track | null;
  openReciterPlaylist: (r: Reciter) => void;
  playTrack: (t: Track) => void;
  mainRef: React.RefObject<HTMLDivElement | null>;
  tracks: Track[];
  likedTracksData: Track[];
}

export function Sidebar({
  mobileView, setMobileView, setShowSearchView,
  selectedReciterPlaylist, setSelectedReciterPlaylist, setSearchQuery,
  setShowCreatePlaylist, activeFilter, setActiveFilter,
  currentReciter, currentTrack, openReciterPlaylist,
  playTrack, mainRef, tracks, likedTracksData
}: SidebarProps) {

  return (
    <aside className="sp-sidebar">
      {/* Nav */}
      <nav className="sp-sidebar-nav">
        <button
          className={`sp-sidebar-nav-item${!selectedReciterPlaylist && mobileView === 'home' ? ' active' : ''}`}
          onClick={() => { setSelectedReciterPlaylist(null); setMobileView('home'); setSearchQuery(''); }}
          title="Home"
        >
          <Icons.Home />
          <span>Home</span>
        </button>
        <button
          className={`sp-sidebar-nav-item${mobileView === 'search' ? ' active' : ''}`}
          onClick={() => { setMobileView('search'); setShowSearchView(v => !v); }}
          title="Search"
        >
          <Icons.Search />
          <span>Search</span>
        </button>
      </nav>

      {/* Library */}
      <div className="sp-sidebar-library">
        <div className="sp-library-header">
          <div className="sp-library-title">
            <Icons.Library />
            <span>Your Library</span>
          </div>
          <div className="sp-library-actions">
            <button
              className="sp-library-action-btn"
              title="Create playlist"
              aria-label="Create playlist"
              onClick={() => setShowCreatePlaylist(true)}
            >
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
          
          {/* Liked Tracks Area (if liked tracks exist) */}
          {(activeFilter === "All" || activeFilter === "Surahs") && likedTracksData.length > 0 && (
            <div
              className={`sp-library-item`}
              onClick={() => playTrack(likedTracksData[0])} // Just play first liked for now
            >
              <div className="sp-library-item-art" style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.HeartFilled />
              </div>
              <div className="sp-library-item-info">
                <div className={`sp-library-item-name`}>Liked Tracks</div>
                <div className="sp-library-item-meta">{likedTracksData.length} saved</div>
              </div>
            </div>
          )}

          {/* Reciter section */}
          {(activeFilter === "All" || activeFilter === "Reciters") && RECITERS.map(r => (
            <div
              key={r.id}
              className={`sp-library-item${currentReciter.id === r.id ? " active" : ""}`}
              onClick={() => openReciterPlaylist(r)}
            >
              <div className="sp-library-item-art circle">
                <img src={r.image} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
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


      </div>
    </aside>
  );
}
