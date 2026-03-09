'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './hadees.css';

/* ─── Types ─────────────────────────────────────────────────── */
interface Hadith {
  number: string;
  english: string;
  arabic: string;
  grade: string;
  chapter: string;
  urn?: number;
}

interface Collection {
  id: string;
  name: string;
  ar: string;
  description: string;
  color: string;
  icon: string;
}

/* ─── Constants ──────────────────────────────────────────────── */
const ARABIC_FONT = "'Naskh IndoPak', serif";

const COLLECTIONS: Collection[] = [
  { id: 'bukhari',   name: 'Sahih Bukhari',  ar: 'صحيح البخاري',    description: 'Most Authentic Collection',  color: '#f59e0b', icon: 'verified'       },
  { id: 'muslim',    name: 'Sahih Muslim',   ar: 'صحيح مسلم',       description: 'Second Most Authentic',      color: '#d97706', icon: 'stars'          },
  { id: 'abudawud',  name: 'Abu Dawud',      ar: 'سنن أبي داود',    description: 'Sunan Abu Dawud',            color: '#b45309', icon: 'history_edu'   },
  { id: 'tirmidhi',  name: 'Tirmidhi',       ar: 'جامع الترمذي',    description: "Jami' at-Tirmidhi",          color: '#d97706', icon: 'menu_book'      },
  { id: 'nasai',     name: "An-Nasa'i",      ar: 'سنن النسائي',     description: "Sunan an-Nasa'i",            color: '#92400e', icon: 'bookmark_star'  },
  { id: 'ibnmajah',  name: 'Ibn Majah',      ar: 'سنن ابن ماجه',    description: 'Sunan Ibn Majah',            color: '#b45309', icon: 'library_books'  },
];

const HADITH_OF_THE_DAY = {
  arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
  text: "Actions are but by intentions, and every person shall have only that which he intended. So whoever's emigration was for Allah and His Messenger, his emigration is for Allah and His Messenger; and whoever's emigration was for worldly gain or a woman to marry, his emigration is for that which he emigrated.",
  reference: 'Sahih al-Bukhari & Muslim — Hadith #1',
};

/* ─── Component ──────────────────────────────────────────────── */
export default function HadeesPage() {
  const [activeCollection, setActiveCollection] = useState<Collection>(COLLECTIONS[0]);  const [hadiths, setHadiths]       = useState<Hadith[]>([]);
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');
  const [expandedArabicIds, setExpandedArabicIds] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [showLoadBar, setShowLoadBar] = useState(false);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      setLoadProgress(0);
      setShowLoadBar(true);
      progressTimerRef.current = setInterval(() => {
        setLoadProgress(p => (p < 85 ? p + Math.random() * 14 : p));
      }, 180);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setLoadProgress(100);
      const t = setTimeout(() => setShowLoadBar(false), 500);
      return () => clearTimeout(t);
    }
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current); };
  }, [loading]);

  /* Load bookmarks */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hadees-bookmarks');
      if (saved) setBookmarks(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, []);

  /* Save bookmarks */
  useEffect(() => {
    try {
      localStorage.setItem('hadees-bookmarks', JSON.stringify([...bookmarks]));
    } catch { /* ignore */ }
  }, [bookmarks]);

  /* Debounce search input → committed search */
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* Fetch from /api/hadith proxy */
  const fetchPage = useCallback(async (col: Collection, pg: number, q: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ collection: col.id, page: String(pg), limit: '20' });
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/hadith?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHadiths(data.hadiths ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load collection.';
      setError(msg);
      setHadiths([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(activeCollection, page, search);
  }, [activeCollection, page, search, fetchPage]);

  /* Actions */
  const toggleBookmark = (key: string) =>
    setBookmarks(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });

  const toggleArabicExpand = (key: string) =>
    setExpandedArabicIds(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });

  const copyHadith = (key: string, hadith: Hadith) => {
    const text = `Hadith #${hadith.number} — ${activeCollection.name}\n\n${hadith.arabic ? hadith.arabic + '\n\n' : ''}${hadith.english}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareHadith = (hadith: Hadith) => {
    const text = `Hadith #${hadith.number} — ${activeCollection.name}\n\n${hadith.arabic ? hadith.arabic + '\n\n' : ''}${hadith.english}`;
    if (navigator.share) navigator.share({ title: `Hadith #${hadith.number}`, text }).catch(() => {});
    else { navigator.clipboard.writeText(text); setCopied('share-' + hadith.number); setTimeout(() => setCopied(null), 2000); }
  };

  const changePage = (p: number) => {
    setPage(p);
    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchCollection = (col: Collection) => {
    setActiveCollection(col);
    setPage(1);
    setSearchInput('');
    setSearch('');
    setSidebarOpen(false);
  };

  /* Pagination pills */
  const paginationPages = useMemo(() => {
    const total = totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (page >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', page - 1, page, page + 1, '...', total];
  }, [page, totalPages]);

  return (
    <div className="hadees-page">
      {/* ── Loading progress bar ── */}
      {showLoadBar && (
        <div className="hadees-progress-track">
          <div
            className="hadees-progress-bar"
            style={{
              width: `${loadProgress}%`,
              opacity: loadProgress >= 100 ? 0 : 1,
              transition: loadProgress >= 100
                ? 'width 0.25s ease, opacity 0.4s ease 0.1s'
                : 'width 0.18s ease',
            }}
          />
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="hadees-layout">

        {/* Mobile sidebar toggle */}
        <button className="hadees-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
          Collections
        </button>

        {/* ── Sidebar ── */}
        <aside className={`hadees-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="hadees-sidebar-header">
            <h3 className="hadees-sidebar-title">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>library_books</span>
              Collections
            </h3>
            <span className="hadees-sidebar-count">{COLLECTIONS.length}</span>
          </div>

          <div className="hadees-sidebar-divider" />

          {COLLECTIONS.map(col => (
            <button
              key={col.id}
              className={`hadees-col-btn ${activeCollection.id === col.id ? 'active' : ''}`}
              onClick={() => switchCollection(col)}
            >
              <div className="hadees-col-icon" style={{ background: `${col.color}15`, color: col.color }}>
                <span className="material-symbols-outlined">{col.icon}</span>
              </div>
              <div className="hadees-col-info">
                <span className="hadees-col-name">{col.name}</span>
                <span className="hadees-col-arabic">{col.ar}</span>
                <span className="hadees-col-meta">{col.description}</span>
              </div>
              {activeCollection.id === col.id && (
                <span className="hadees-col-active-dot" style={{ background: col.color }} />
              )}
            </button>
          ))}

          <div className="hadees-sidebar-divider" />

          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f59e0b' }}>bookmark</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
              {bookmarks.size} bookmark{bookmarks.size !== 1 ? 's' : ''} saved
            </span>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="hadees-content" ref={contentRef}>

          {/* Search */}
          <div className="hadees-toolbar">
            <div className="hadees-search-wrapper">
              <span className="material-symbols-outlined hadees-search-icon">search</span>
              <input
                type="text"
                className="hadees-search-input"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={`Search within ${activeCollection.name}…`}
              />
              {searchInput && (
                <button className="hadees-search-clear" onClick={() => { setSearchInput(''); setSearch(''); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Header */}
          <div className="hadees-content-header">
            <div>
              <h2 className="hadees-content-title">
                {search ? 'Search Results' : activeCollection.name}
              </h2>
              <p className="hadees-content-subtitle">
                {loading
                  ? 'Loading…'
                  : search
                  ? `${total.toLocaleString()} hadith${total !== 1 ? 's' : ''} found for "${search}"`
                  : `${total.toLocaleString()} hadiths · Page ${page} of ${totalPages}`}
              </p>
            </div>

            {!search && !loading && totalPages > 1 && (
              <div className="hadees-paginator">
                <button className="hadees-pg-btn" onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
                  Prev
                </button>
                {paginationPages.map((p, i) =>
                  p === '...'
                    ? <span key={`e-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 14 }}>…</span>
                    : <button key={p} className={`hadees-pg-num ${page === p ? 'active' : ''}`} onClick={() => changePage(p as number)}>{p}</button>
                )}
                <button className="hadees-pg-btn" onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                  Next
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="hadees-error">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#ef4444' }}>error_outline</span>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 600, color: '#ef4444', fontSize: 14 }}>Failed to load collection</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{error}</p>
              </div>
              <button className="hadees-error-retry" onClick={() => fetchPage(activeCollection, page, search)}>Retry</button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="hadees-loading-list">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="hadees-card-skeleton">
                  <div className="hadees-skel-line hadees-skel-header" />
                  <div className="hadees-skel-line hadees-skel-body" />
                  <div className="hadees-skel-line hadees-skel-body" />
                  <div className="hadees-skel-line hadees-skel-body-short" />
                  <div className="hadees-skel-line hadees-skel-footer" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && hadiths.length === 0 && (
            <div className="hadees-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--text-muted)', display: 'block', marginBottom: 16 }}>search_off</span>
              <h3>No hadiths found</h3>
              <p>Try a different search term or select another collection</p>
              <button className="hadees-empty-btn" onClick={() => { setSearchInput(''); setSearch(''); }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restart_alt</span>
                Clear Search
              </button>
            </div>
          )}

          {/* Cards */}
          {!loading && hadiths.length > 0 && (
            <div className="hadees-list">
              {hadiths.map((hadith, idx) => {
                const key = `${activeCollection.id}-${hadith.number}`;
                const isBookmarked = bookmarks.has(key);
                const isCopied = copied === key;
                const isArabicLong = !!hadith.arabic && hadith.arabic.length > 100;
                const isArabicExpanded = expandedArabicIds.has(key);

                return (
                  <article
                    key={key}
                    className="hadees-card"
                    style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
                  >
                    {/* Top row: number + chapter + bookmark */}
                    <div className="hadees-card-toprow">
                      <div className="hadees-card-toprow-left">
                        <span className="hadees-card-num-label">#{hadith.number}</span>
                        {hadith.chapter && <span className="hadees-card-chapter-inline">{hadith.chapter}</span>}
                      </div>
                      <button
                        className={`hadees-icon-btn ${isBookmarked ? 'bookmark-active' : ''}`}
                        onClick={() => toggleBookmark(key)}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                      </button>
                    </div>

                    {/* Body: English + Arabic side by side */}
                    <div className="hadees-card-body">
                      <div className="hadees-card-english">
                        <p className="hadees-card-text">{hadith.english}</p>
                      </div>
                      {hadith.arabic && (
                        <div className="hadees-card-arabic-col">
                          <p
                            className={`hadees-card-arabic-text${isArabicLong && !isArabicExpanded ? ' arabic-collapsed' : ''}`}
                            style={{ fontFamily: ARABIC_FONT }}
                          >{hadith.arabic}</p>
                          {isArabicLong && !isArabicExpanded && <div className="hadees-arabic-fade" />}
                          {isArabicLong && (
                            <button className="hadees-arabic-read-more" onClick={() => toggleArabicExpand(key)}>
                              {isArabicExpanded ? 'Show less' : 'Read more'}
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{isArabicExpanded ? 'expand_less' : 'expand_more'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer: grade + reference + actions */}
                    <div className="hadees-card-footer">
                      <div className="hadees-card-footer-left">
                        {hadith.grade && (
                          <p className="hadees-card-grade">
                            Grade: <strong>{hadith.grade}</strong>
                          </p>
                        )}
                        <p className="hadees-card-ref">
                          <span>Reference</span>
                          <span className="hadees-ref-sep">:</span>
                          <span>{activeCollection.name} {hadith.number}</span>
                        </p>
                      </div>
                      <div className="hadees-card-actions">
                        <button className="hadees-action-link" onClick={() => copyHadith(key, hadith)}>
                          {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                        <span className="hadees-action-sep">|</span>
                        <button className="hadees-action-link" onClick={() => shareHadith(hadith)}>Share</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination */}
          {!loading && !search && totalPages > 1 && hadiths.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 16 }}>
              <div className="hadees-paginator">
                <button className="hadees-pg-btn" onClick={() => changePage(1)} disabled={page === 1}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>first_page</span>
                </button>
                <button className="hadees-pg-btn" onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
                  Prev
                </button>
                {paginationPages.map((p, i) =>
                  p === '...'
                    ? <span key={`b-e-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 14 }}>…</span>
                    : <button key={`b-${p}`} className={`hadees-pg-num ${page === p ? 'active' : ''}`} onClick={() => changePage(p as number)}>{p}</button>
                )}
                <button className="hadees-pg-btn" onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                  Next
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                </button>
                <button className="hadees-pg-btn" onClick={() => changePage(totalPages)} disabled={page === totalPages}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>last_page</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
