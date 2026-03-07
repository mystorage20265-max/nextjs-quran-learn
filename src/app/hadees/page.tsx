'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

const COLLECTIONS = [
  { id: 'nawawi40', name: "Nawawi's 40", total: 42, ar: 'الأربعون النووية', description: '40 Essential Hadiths', color: '#11d442', icon: 'bookmark_star' },
  { id: 'bukhari', name: 'Sahih Bukhari', total: 7277, ar: 'صحيح البخاري', description: 'Most Authentic Collection', color: '#f59e0b', icon: 'verified' },
  { id: 'muslim', name: 'Sahih Muslim', total: 3033, ar: 'صحيح مسلم', description: 'Second Most Authentic', color: '#0ea5e9', icon: 'stars' },
  { id: 'abudawud', name: 'Abu Dawud', total: 5274, ar: 'سنن أبي داود', description: 'Sunan Abu Dawud', color: '#8b5cf6', icon: 'history_edu' },
  { id: 'tirmidhi', name: 'Tirmidhi', total: 3956, ar: 'جامع الترمذي', description: "Jami' at-Tirmidhi", color: '#ef4444', icon: 'menu_book' },
  { id: 'ibnmajah', name: 'Ibn Majah', total: 4341, ar: 'سنن ابن ماجه', description: 'Sunan Ibn Majah', color: '#06b6d4', icon: 'library_books' },
];

const PAGE_SIZE = 10;
const BASE_CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

interface Hadith {
  hadithnumber: number;
  text: string;
}

export default function HadeesPage() {
  const [dark, setDark] = useState(false);
  const [activeCollection, setActiveCollection] = useState(COLLECTIONS[0]);
  const [allHadiths, setAllHadiths] = useState<Hadith[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [featuredHadith, setFeaturedHadith] = useState<Hadith | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Detect dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Fetch the Hadith of the Day (Nawawi 40, day-based)
  useEffect(() => {
    const dayIndex = (new Date().getDate() % 40) + 1;
    setFeaturedLoading(true);
    fetch(`${BASE_CDN}/eng-nawawi40/hadiths/${dayIndex}.min.json`)
      .then(r => r.json())
      .then(data => {
        setFeaturedHadith({ hadithnumber: data.hadithnumber, text: data.text });
      })
      .catch(() => {
        setFeaturedHadith({ hadithnumber: 1, text: 'On the authority of Umar ibn al-Khattab, who said: I heard the Messenger of Allah say: Actions are but by intentions, and every person shall have only that which he intended.' });
      })
      .finally(() => setFeaturedLoading(false));
  }, []);

  // Fetch the entire collection once, then paginate client-side
  const fetchCollection = useCallback(async (collection: typeof COLLECTIONS[0]) => {
    setLoading(true);
    setError('');
    setAllHadiths([]);
    setPage(1);
    setSearchQuery('');
    try {
      const res = await fetch(`${BASE_CDN}/eng-${collection.id}.min.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: Hadith[] = (data.hadiths ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((h: any) => ({ hadithnumber: Number(h.hadithnumber), text: String(h.text ?? h.body ?? '').trim() }))
        .filter((h: Hadith) => h.text.length > 0);
      setAllHadiths(list);
    } catch {
      setError('Failed to load collection. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollection(activeCollection);
  }, [activeCollection, fetchCollection]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(allHadiths.length / PAGE_SIZE)), [allHadiths]);

  const displayedHadiths = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allHadiths.slice(start, start + PAGE_SIZE);
  }, [allHadiths, page]);

  const filteredHadiths = useMemo(() => {
    if (!searchQuery.trim()) return displayedHadiths;
    const q = searchQuery.toLowerCase();
    return allHadiths.filter(h =>
      h.text.toLowerCase().includes(q) || String(h.hadithnumber) === searchQuery.trim()
    );
  }, [allHadiths, displayedHadiths, searchQuery]);

  const handleCopy = (hadith: Hadith) => {
    const text = `Hadith #${hadith.hadithnumber} — ${activeCollection.name}\n\n${hadith.text}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(hadith.hadithnumber);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const S = {
    shell: { display: 'flex' as const, flexDirection: 'column' as const, minHeight: '100vh', background: dark ? '#0d1b12' : '#f8fafc', fontFamily: "'Figtree','Lexend',sans-serif" },
    card: { background: dark ? '#111f16' : 'white', border: `1px solid ${dark ? '#1e3a2a' : '#e2e8f0'}`, borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
    text: { color: dark ? '#e2e8e5' : '#0f172a' },
    muted: { color: dark ? '#64748b' : '#94a3b8' },
  };

  return (
    <div style={S.shell}>
      <style>{`
        .h-scroll::-webkit-scrollbar{height:4px}.h-scroll::-webkit-scrollbar-track{background:transparent}.h-scroll::-webkit-scrollbar-thumb{background:rgba(17,212,66,0.3);border-radius:3px}
        .hadith-card{transition:transform 0.18s ease,box-shadow 0.18s ease}.hadith-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.1)!important}
        .col-tab{transition:all 0.15s ease}
        .pg-btn{transition:all 0.15s ease}
        .pg-btn:hover{transform:scale(1.05)}
        .copy-btn{transition:all 0.15s}.copy-btn:hover{background:rgba(17,212,66,0.15)!important}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .shimmer{background:linear-gradient(90deg,${dark ? '#1e3a2a' : '#f1f5f9'} 25%,${dark ? '#2a4a30' : '#e9f5ee'} 50%,${dark ? '#1e3a2a' : '#f1f5f9'} 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
        .font-arabic{font-family:'Noto Naskh Arabic','Traditional Arabic',serif}
        .hp-dot{background-image:radial-gradient(circle at 2px 2px,rgba(17,212,66,0.06) 1px,transparent 0);background-size:24px 24px}
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background: dark ? 'rgba(13,27,18,0.97)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${dark ? '#1e3a2a55' : '#e2e8f088'}`,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: dark ? '#1e3a2a' : '#f1f5f9', color: dark ? '#11d442' : '#64748b', textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, ...S.text }}>Hadees Collection</h1>
            <p style={{ margin: 0, fontSize: 11, ...S.muted }}>Authentic Prophetic Narrations</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, background: 'rgba(17,212,66,0.12)', color: '#11d442', padding: '4px 10px', borderRadius: 20 }}>
              {activeCollection.name}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '24px 20px 60px' }}>

        {/* ── Hero Banner ── */}
        <section style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #065f46 0%, #064e3b 50%, #022c22 100%)',
          padding: '36px 32px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div className="hp-dot" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(17,212,66,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(5,150,105,0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(17,212,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#11d442' }}>format_quote</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.6)' }}>Explore</p>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'white' }}>Hadees Collection</h2>
              </div>
            </div>
            <p className="font-arabic" dir="rtl" style={{ margin: '0 0 8px', fontSize: 20, color: 'rgba(255,255,255,0.9)', textAlign: 'right', lineHeight: 1.8 }}>
              وَمَا يَنطِقُ عَنِ الْهَوَىٰ ‎·‎ إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 12.5, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
              "He does not speak from his own desire. It is only a revelation revealed." — An-Najm 53:3-4
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              {[
                { label: '6 Collections', icon: 'library_books' },
                { label: '20,000+ Hadiths', icon: 'format_quote' },
                { label: 'Authentic Narrations', icon: 'verified' },
              ].map(b => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '6px 12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#11d442' }}>{b.icon}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Hadith of the Day ── */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 16, ...S.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#f59e0b' }}>wb_sunny</span>
            Hadith of the Day
          </h2>
          {featuredLoading ? (
            <div className="shimmer" style={{ borderRadius: 18, height: 160 }} />
          ) : featuredHadith ? (
            <div style={{
              borderRadius: 18,
              background: 'linear-gradient(135deg, #11d44218, #05966918)',
              border: '1px solid rgba(17,212,66,0.25)',
              padding: '24px 28px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', top: -10, right: -10, fontSize: 100, color: 'rgba(17,212,66,0.06)', lineHeight: 1 }}>format_quote</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(17,212,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#11d442' }}>{featuredHadith.hadithnumber}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: '#11d442' }}>Nawawi's 40 · Hadith #{featuredHadith.hadithnumber}</span>
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 14.5, lineHeight: 1.85, ...S.text, fontStyle: 'italic' }}>
                  "{featuredHadith.text.length > 400 ? featuredHadith.text.slice(0, 400) + '…' : featuredHadith.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 8 }}>
                  <span style={{ fontSize: 11, ...S.muted }}>— Nawawi's 40 Hadith Collection</span>
                  <button
                    onClick={() => handleCopy(featuredHadith)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(17,212,66,0.12)', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 11.5, color: '#11d442', cursor: 'pointer', fontWeight: 600 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{copiedId === featuredHadith.hadithnumber ? 'check' : 'content_copy'}</span>
                    {copiedId === featuredHadith.hadithnumber ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* ── Collection Selector ── */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 16, ...S.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#0ea5e9' }}>library_books</span>
            Browse Collections
          </h2>
          <div className="h-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {COLLECTIONS.map(col => (
              <button
                key={col.id}
                className="col-tab"
                onClick={() => setActiveCollection(col)}
                style={{
                  flexShrink: 0,
                  background: activeCollection.id === col.id
                    ? `linear-gradient(135deg, ${col.color}22, ${col.color}12)`
                    : dark ? '#111f16' : 'white',
                  border: `2px solid ${activeCollection.id === col.id ? col.color : dark ? '#1e3a2a' : '#e2e8f0'}`,
                  borderRadius: 14,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  minWidth: 150,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: activeCollection.id === col.id ? col.color : '#94a3b8' }}>{col.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: activeCollection.id === col.id ? col.color : dark ? '#e2e8e5' : '#334155' }}>{col.name}</span>
                </div>
                <p className="font-arabic" dir="rtl" style={{ margin: '0 0 4px', fontSize: 13, color: dark ? '#94a3b8' : '#64748b', textAlign: 'right' as const }}>{col.ar}</p>
                <p style={{ margin: '0 0 4px', fontSize: 10.5, color: '#94a3b8' }}>{col.description}</p>
                <span style={{ fontSize: 10, fontWeight: 700, color: activeCollection.id === col.id ? col.color : '#94a3b8' }}>
                  {col.total.toLocaleString()} hadiths
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Search within page ── */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18, pointerEvents: 'none' }}>search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search within ${activeCollection.name}…`}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: 12,
                border: `1px solid ${dark ? '#1e3a2a' : '#e2e8f0'}`,
                background: dark ? '#111f16' : 'white',
                fontSize: 13,
                color: dark ? '#e2e8e5' : '#334155',
                outline: 'none',
                boxSizing: 'border-box' as const,
                transition: 'box-shadow 0.15s',
              }}
              onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${activeCollection.color}44`}
              onBlur={e => e.target.style.boxShadow = 'none'}
            />
          </div>
          <div style={{ ...S.card, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: activeCollection.color }}>format_list_numbered</span>
            <span style={{ fontSize: 12, fontWeight: 600, ...S.text }}>
              Page {page} / {totalPages}
            </span>
          </div>
        </div>

        {/* ── Error State ── */}
        {error && (
          <div style={{ ...S.card, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, borderColor: '#fca5a5' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#ef4444' }}>error_outline</span>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#ef4444', fontSize: 14 }}>Failed to load hadiths</p>
              <p style={{ margin: 0, fontSize: 12, ...S.muted }}>{error}</p>
            </div>
            <button
              onClick={() => fetchCollection(activeCollection)}
              style={{ marginLeft: 'auto', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Hadith Cards ── */}
        <section style={{ marginBottom: 32 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shimmer" style={{ borderRadius: 16, height: 140 }} />
              ))}
            </div>
          ) : filteredHadiths.length === 0 && !error ? (
            <div style={{ ...S.card, padding: '48px 24px', textAlign: 'center' as const }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#cbd5e1', display: 'block', marginBottom: 12 }}>search_off</span>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, ...S.text }}>No hadiths found</p>
              <p style={{ margin: '6px 0 0', fontSize: 13, ...S.muted }}>Try a different search term</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredHadiths.map((hadith) => (
                <div
                  key={hadith.hadithnumber}
                  className="hadith-card"
                  style={{
                    ...S.card,
                    padding: '22px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                    borderLeft: `4px solid ${activeCollection.color}`,
                  }}
                >
                  {/* Decorative quote mark */}
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', right: 16, top: 10, fontSize: 64,
                    color: dark ? `${activeCollection.color}08` : `${activeCollection.color}10`,
                    lineHeight: 1, pointerEvents: 'none',
                  }}>format_quote</span>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Card header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: `${activeCollection.color}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: activeCollection.color }}>
                            {hadith.hadithnumber}
                          </span>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: activeCollection.color }}>
                            {activeCollection.name}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, ...S.muted }}>
                            Hadith #{hadith.hadithnumber}
                          </p>
                        </div>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(hadith)}
                        title="Copy hadith"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          background: copiedId === hadith.hadithnumber ? 'rgba(17,212,66,0.12)' : dark ? '#1e3a2a' : '#f8fafc',
                          border: `1px solid ${copiedId === hadith.hadithnumber ? '#11d442' : dark ? '#2a4a30' : '#e2e8f0'}`,
                          borderRadius: 8, padding: '5px 10px',
                          fontSize: 11, color: copiedId === hadith.hadithnumber ? '#11d442' : '#94a3b8',
                          cursor: 'pointer', fontWeight: 600, flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                          {copiedId === hadith.hadithnumber ? 'check' : 'content_copy'}
                        </span>
                        {copiedId === hadith.hadithnumber ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Hadith text */}
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: 1.9,
                      ...S.text,
                      fontStyle: 'italic',
                    }}>
                      "{hadith.text}"
                    </p>

                    {/* Footer */}
                    <div style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: `1px solid ${dark ? '#1e3a2a' : '#f1f5f9'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' as const,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#94a3b8' }}>auto_stories</span>
                        <span style={{ fontSize: 11.5, ...S.muted, fontStyle: 'normal' }}>
                          Source: <strong style={{ color: activeCollection.color }}>{activeCollection.name}</strong>
                        </span>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
                        letterSpacing: '0.1em',
                        background: `${activeCollection.color}14`,
                        color: activeCollection.color,
                        padding: '3px 8px', borderRadius: 20,
                      }}>
                        Authentic
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Pagination ── */}
        {!loading && !searchQuery && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
            <button
              className="pg-btn"
              onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 1}
              style={{
                ...S.card,
                padding: '8px 14px', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, ...S.text,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>first_page</span>
            </button>
            <button
              className="pg-btn"
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 1}
              style={{
                ...S.card,
                padding: '8px 14px', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, fontWeight: 600, ...S.text,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
              Prev
            </button>

            {/* Page number pills */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button
                  key={p}
                  className="pg-btn"
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: 'none',
                    background: page === p ? activeCollection.color : dark ? '#111f16' : 'white',
                    color: page === p ? 'white' : dark ? '#94a3b8' : '#64748b',
                    boxShadow: page === p ? `0 4px 12px ${activeCollection.color}44` : '0 1px 4px rgba(0,0,0,0.06)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              className="pg-btn"
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === totalPages}
              style={{
                ...S.card,
                padding: '8px 14px', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, fontWeight: 600, ...S.text,
              }}
            >
              Next
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
            <button
              className="pg-btn"
              onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === totalPages}
              style={{
                ...S.card,
                padding: '8px 14px', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, ...S.text,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>last_page</span>
            </button>
          </div>
        )}

        {/* ── Footer Info Section ── */}
        <section style={{
          borderRadius: 18,
          background: dark ? 'linear-gradient(135deg,#0a1f10,#0d2618)' : 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
          border: `1px solid ${dark ? 'rgba(17,212,66,0.15)' : 'rgba(17,212,66,0.2)'}`,
          padding: '24px 28px',
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' as const,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(17,212,66,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#11d442' }}>verified_user</span>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: dark ? '#f1f5f9' : '#0f172a' }}>
              Authentic Narrations Only
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: dark ? '#64748b' : '#475569', lineHeight: 1.6 }}>
              All hadiths are sourced from the most trusted collections. Data provided by the open-source Hadith API (fawazahmed0).
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/read-quran/1" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#11d442', color: 'white', borderRadius: 10, padding: '8px 16px', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, boxShadow: '0 4px 12px rgba(17,212,66,0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>menu_book</span>
              Read Quran
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
