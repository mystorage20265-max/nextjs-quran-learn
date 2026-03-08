'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import './duas.css';

/* ─── Types ──────────────────────────────────────────────────── */
interface Category {
  id: string;
  slug: string;
  title: string;
  description?: string;
  totalDuas?: number;
  icon?: string;
  color?: string;
}

interface Dua {
  id: string;
  category: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference?: string;
  source?: string;
}

/* ─── Constants ──────────────────────────────────────────────── */
const ARABIC_FONT = "'Naskh IndoPak', serif";

const DUA_OF_THE_DAY = {
  arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
  transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina adhaban-nar',
  translation: '"Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire."',
  reference: 'Surah Al-Baqarah 2:201',
};

const SOURCES = ['All', 'Quran', 'Hadith'] as const;

/* ─── Component ──────────────────────────────────────────────── */
export default function DuaClient() {
  /* State */
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [duas, setDuas] = useState<Dua[]>([]);
  const [allDuas, setAllDuas] = useState<Dua[]>([]);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedDua, setExpandedDua] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [duasLoading, setDuasLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const duaListRef = useRef<HTMLDivElement>(null);

  /* Load favorites from localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dua-favorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, []);

  /* Save favorites */
  useEffect(() => {
    try {
      localStorage.setItem('dua-favorites', JSON.stringify([...favorites]));
    } catch { /* ignore */ }
  }, [favorites]);

  /* Fetch categories */
  useEffect(() => {
    fetch('/data/duas/categories.json')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* Fetch ALL duas on first load */
  useEffect(() => {
    if (categories.length === 0) return;
    const fetchAll = async () => {
      const all: Dua[] = [];
      for (const cat of categories) {
        try {
          const res = await fetch(`/data/duas/${cat.slug}.json`);
          const data = await res.json();
          if (data.duas) all.push(...data.duas);
        } catch { /* skip */ }
      }
      setAllDuas(all);
      setDuas(all);
    };
    fetchAll();
  }, [categories]);

  /* Fetch duas by category */
  const loadCategory = useCallback(async (slug: string | null) => {
    setActiveCategory(slug);
    setSidebarOpen(false);
    if (!slug) {
      setDuas(allDuas);
      return;
    }
    setDuasLoading(true);
    try {
      const res = await fetch(`/data/duas/${slug}.json`);
      const data = await res.json();
      setDuas(data.duas || []);
    } catch {
      setDuas([]);
    }
    setDuasLoading(false);
    if (duaListRef.current) {
      duaListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [allDuas]);

  /* Actions */
  const toggleFav = (id: string) =>
    setFavorites(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => { });
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const shareDua = (dua: Dua) => {
    const text = `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\n— ${dua.reference}`;
    if (navigator.share) navigator.share({ title: dua.title, text }).catch(() => { });
    else { navigator.clipboard.writeText(text); setCopied('share-' + dua.id); setTimeout(() => setCopied(null), 2000); }
  };

  /* Filter duas - when searching, search ALL duas globally; otherwise use category filter */
  const duasToFilter = search ? allDuas : duas;
  const filtered = duasToFilter.filter(d => {
    const q = search.toLowerCase();
    const cat = categories.find(c => c.id === d.category);
    const matchSearch = !search ||
      d.title.toLowerCase().includes(q) ||
      d.arabic.includes(search) ||
      d.transliteration.toLowerCase().includes(q) ||
      d.translation.toLowerCase().includes(q) ||
      (d.reference && d.reference.toLowerCase().includes(q)) ||
      (cat && cat.title.toLowerCase().includes(q));
    const matchSource = sourceFilter === 'All' || d.source === sourceFilter;
    const matchFav = !showFavoritesOnly || favorites.has(d.id);
    return matchSearch && matchSource && matchFav;
  });

  const activeCat = categories.find(c => c.id === activeCategory);

  return (
    <div className="duas-page">

      {/* ── Main Layout ── */}
      <div className="duas-layout">

        {/* Mobile sidebar toggle */}
        <button className="duas-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
          Categories
        </button>

        {/* ── Sidebar ── */}
        <aside className={`duas-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="duas-sidebar-header">
            <h3 className="duas-sidebar-title">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>category</span>
              Categories
            </h3>
            <span className="duas-sidebar-count">{categories.length}</span>
          </div>

          <button
            className={`duas-cat-btn ${!activeCategory ? 'active' : ''}`}
            onClick={() => loadCategory(null)}
          >
            <div className="duas-cat-icon" style={{ background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' }}>
              <span className="material-symbols-outlined">apps</span>
            </div>
            <div className="duas-cat-info">
              <span className="duas-cat-name">All Duas</span>
              <span className="duas-cat-count">{allDuas.length} duas</span>
            </div>
          </button>

          <div className="duas-sidebar-divider" />

          {loading ? (
            <div className="duas-sidebar-loading">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="duas-cat-skeleton" />
              ))}
            </div>
          ) : (
            categories.map(cat => (
              <button
                key={cat.id}
                className={`duas-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => loadCategory(cat.id)}
              >
                <div className="duas-cat-icon" style={{
                  background: `${cat.color}15`,
                  color: cat.color
                }}>
                  <span className="material-symbols-outlined">{cat.icon || 'menu_book'}</span>
                </div>
                <div className="duas-cat-info">
                  <span className="duas-cat-name">{cat.title}</span>
                  <span className="duas-cat-count">{cat.description}</span>
                </div>
                {activeCategory === cat.id && (
                  <span className="duas-cat-active-dot" style={{ background: cat.color }} />
                )}
              </button>
            ))
          )}
        </aside>

        {/* ── Content ── */}
        <main className="duas-content" ref={duaListRef}>

          {/* Search & Filters */}
          <div className="duas-toolbar">
            <div className="duas-search-wrapper">
              <span className="material-symbols-outlined duas-search-icon">search</span>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by dua name, keyword, or topic..."
                className="duas-search-input"
              />
              {search && (
                <button className="duas-search-clear" onClick={() => setSearch('')}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              )}
            </div>

            <div className="duas-filter-row">
              <div className="duas-source-filter">
                {SOURCES.map(src => (
                  <button
                    key={src}
                    className={`duas-source-btn ${sourceFilter === src ? 'active' : ''}`}
                    onClick={() => setSourceFilter(src)}
                  >
                    {src === 'Quran' && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_stories</span>}
                    {src === 'Hadith' && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>history_edu</span>}
                    {src === 'All' && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>select_all</span>}
                    {src}
                  </button>
                ))}
              </div>

              <button
                className={`duas-fav-toggle ${showFavoritesOnly ? 'active' : ''}`}
                onClick={() => setShowFavoritesOnly(f => !f)}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: 18,
                  fontVariationSettings: showFavoritesOnly ? "'FILL' 1" : "'FILL' 0"
                }}>favorite</span>
                {showFavoritesOnly ? 'Showing Favorites' : 'Favorites'}
                {favorites.size > 0 && <span className="duas-fav-count">{favorites.size}</span>}
              </button>
            </div>
          </div>

          {/* Category Title */}
          <div className="duas-content-header">
            <div>
              <h2 className="duas-content-title">
                {search ? 'Search Results' : activeCat ? activeCat.title : showFavoritesOnly ? 'Your Favorites' : 'All Supplications'}
              </h2>
              <p className="duas-content-subtitle">
                {filtered.length} {filtered.length === 1 ? 'dua' : 'duas'} found
                {search && <span> for &ldquo;{search}&rdquo;</span>}
                {(search || sourceFilter !== 'All' || showFavoritesOnly || activeCategory) && (
                  <button className="duas-clear-filters" onClick={() => {
                    setSourceFilter('All');
                    setShowFavoritesOnly(false);
                    setActiveCategory(null);
                    setDuas(allDuas);
                    setSearch('');
                  }}>
                    Clear all filters
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                  </button>
                )}
              </p>
            </div>
          </div>

          {/* Dua List */}
          {duasLoading ? (
            <div className="duas-loading-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="duas-card-skeleton">
                  <div className="skel-line skel-title" />
                  <div className="skel-line skel-arabic" />
                  <div className="skel-line skel-trans" />
                  <div className="skel-line skel-ref" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="duas-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--text-muted)', marginBottom: 16 }}>search_off</span>
              <h3>No duas found</h3>
              <p>Try a different search term or adjust your filters</p>
              <button className="duas-empty-btn" onClick={() => { setSearch(''); setSourceFilter('All'); setShowFavoritesOnly(false); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="duas-list">
              {filtered.map((dua, idx) => {
                const isExpanded = expandedDua === dua.id;
                const isFav = favorites.has(dua.id);
                const isCopied = copied === dua.id;
                const cat = categories.find(c => c.id === dua.category);
                const catColor = cat?.color || 'var(--brand-primary)';

                return (
                  <article
                    key={dua.id}
                    className={`duas-card ${isExpanded ? 'expanded' : ''}`}
                    style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}
                  >
                    {/* Card accent */}
                    <div className="duas-card-accent" style={{ background: catColor }} />

                    {/* Card Header */}
                    <div className="duas-card-header">
                      <div className="duas-card-header-left">
                        <div className="duas-card-number" style={{ background: `${catColor}18`, color: catColor }}>
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="duas-card-title">{dua.title}</h3>
                          <div className="duas-card-meta">
                            {!activeCategory && cat && (
                              <span className="duas-card-category" style={{ color: catColor }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{cat.icon}</span>
                                {cat.title}
                              </span>
                            )}
                            {dua.source && (
                              <span className="duas-card-source">{dua.source}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="duas-card-header-right">
                        <button
                          className={`duas-icon-btn ${isFav ? 'fav-active' : ''}`}
                          onClick={() => toggleFav(dua.id)}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <span className="material-symbols-outlined" style={{
                            fontSize: 20,
                            fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0",
                            color: isFav ? '#ef4444' : undefined
                          }}>favorite</span>
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <div className="duas-card-arabic-wrapper">
                      <p className="duas-card-arabic" style={{ fontFamily: ARABIC_FONT }}>
                        {dua.arabic}
                      </p>
                    </div>

                    {/* Transliteration - Always show */}
                    <p className="duas-card-transliteration">{dua.transliteration}</p>

                    {/* Translation */}
                    <div className={`duas-card-translation-wrapper ${isExpanded ? 'show' : ''}`}>
                      <p className="duas-card-translation">{dua.translation}</p>
                    </div>

                    {/* Toggle & Footer */}
                    <div className="duas-card-footer">
                      <button
                        className="duas-expand-btn"
                        onClick={() => setExpandedDua(isExpanded ? null : dua.id)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                        {isExpanded ? 'Show Less' : 'Show Translation'}
                      </button>

                      <div className="duas-card-actions">
                        {dua.reference && (
                          <span className="duas-card-ref" style={{ color: catColor, background: `${catColor}12` }}>
                            {dua.reference}
                          </span>
                        )}
                        <button
                          className="duas-icon-btn"
                          onClick={() => copyText(dua.id, `${dua.arabic}\n${dua.transliteration}\n${dua.translation}`)}
                          title="Copy dua"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: isCopied ? 'var(--status-success)' : undefined }}>
                            {isCopied ? 'check' : 'content_copy'}
                          </span>
                        </button>
                        <button
                          className="duas-icon-btn"
                          onClick={() => shareDua(dua)}
                          title="Share dua"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
