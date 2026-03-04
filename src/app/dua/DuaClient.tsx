'use client';

import { useState, useRef } from 'react';

const ARABIC_FONT = "'Naskh IndoPak', serif";

/* ─── Data ─────────────────────────────────────────────────────── */
const DUA_OF_THE_DAY = {
  arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
  translation: '"Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire."',
  reference: 'Al-Baqarah 2:201',
};

const SUGGESTED_TAGS = ['Morning', 'Anxiety', 'Gratitude', 'Travel', 'Sickness', 'Protection', 'Family', 'Success'];

const SOURCES = ['All', 'Quran', 'Hadith'];

const DUAS = [
  {
    id: '1',
    category: 'Morning & Evening',
    icon: 'wb_sunny',
    iconBg: '#ecfdf5',
    iconColor: '#059669',
    title: 'Morning Remembrance',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
    transliteration: 'Asbahna wa-asbahal mulku lillah, walhamdu lillah.',
    translation: 'We have reached the morning and, at this morning, dominion belongs to Allah. Praise be to Allah.',
    reference: 'Sahih Muslim',
    source: 'Hadith',
    badge: 'Morning',
  },
  {
    id: '2',
    category: 'Family & Relations',
    icon: 'family_restroom',
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    title: 'For Parents',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbi irhamhuma kama rabbayani saghira.',
    translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
    reference: 'Surah Al-Isra 17:24',
    source: 'Quran',
    badge: 'Family',
  },
  {
    id: '3',
    category: 'Protection',
    icon: 'shield',
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
    title: 'Protection from Evil',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ',
    transliteration: "Bismillahilladhi la yadurru ma'a ismihi shay'un fil-ardi wala fis-sama'i.",
    translation: 'In the name of Allah, with whose name nothing can harm on earth or in the heavens.',
    reference: 'At-Tirmidhi',
    source: 'Hadith',
    badge: 'Protection',
  },
  {
    id: '4',
    category: 'Success',
    icon: 'trophy',
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    title: 'Seeking Guidance',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى',
    transliteration: 'Allahumma inni as-alukal-huda wat-tuqa.',
    translation: 'O Allah, I ask You for guidance, righteousness, chastity and self-sufficiency.',
    reference: 'Sahih Muslim',
    source: 'Hadith',
    badge: 'Success',
  },
  {
    id: '5',
    category: 'Gratitude',
    icon: 'volunteer_activism',
    iconBg: '#fdf2f8',
    iconColor: '#db2777',
    title: 'Shukr (Gratitude)',
    arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ',
    transliteration: "Rabbi awzi'ni an ashkura ni'mataka.",
    translation: 'My Lord, enable me to be grateful for Your favor which You have bestowed upon me.',
    reference: 'Quran 27:19',
    source: 'Quran',
    badge: 'Gratitude',
  },
  {
    id: '6',
    category: 'Anxiety & Ease',
    icon: 'self_improvement',
    iconBg: '#f0fdfa',
    iconColor: '#0d9488',
    title: 'Dua for Ease',
    arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا',
    transliteration: "Allahumma la sahla illa ma ja'altahu sahlan.",
    translation: 'O Allah, there is no ease except what You make easy.',
    reference: 'Ibn Hibban',
    source: 'Hadith',
    badge: 'Anxiety',
  },
];

const PAGE_SIZE = 4;

/* ─── Component ────────────────────────────────────────────────── */
export default function DuaClient() {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['2']));
  const [copied, setCopied] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const filterRef = useRef<HTMLDivElement>(null);

  const toggleFav = (id: string) =>
    setFavorites(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const copyArabic = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => { });
    setCopied(id); setTimeout(() => setCopied(null), 1800);
  };

  const shareText = (dua: typeof DUAS[0]) => {
    const text = `${dua.arabic}\n\n${dua.translation}\n\n— ${dua.reference}`;
    if (navigator.share) navigator.share({ title: dua.title, text }).catch(() => { });
    else { navigator.clipboard.writeText(text); setCopied('share'); setTimeout(() => setCopied(null), 1800); }
  };

  const filtered = DUAS.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !search || d.title.toLowerCase().includes(q) || d.arabic.includes(search) || d.badge.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchTag = !activeTag || d.badge === activeTag || d.category.toLowerCase().includes(activeTag.toLowerCase());
    const matchSource = sourceFilter === 'All' || d.source === sourceFilter;
    return matchSearch && matchTag && matchSource;
  });

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <>
      <style>{`
        .dua-page { min-height: 100vh; background: #f6f8f6; font-family: 'Figtree', 'Lexend', sans-serif; color: #0f172a; }
        .islamic-pattern { background-image: radial-gradient(circle at 2px 2px, rgba(17,212,66,0.05) 1px, transparent 0); background-size: 24px 24px; }
        .dua-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: all 0.25s; cursor: pointer; }
        .dua-card:hover { border-color: #11d442; background: rgba(17,212,66,0.015); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(17,212,66,0.1); }
        .dua-card-list { border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px 28px; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: all 0.25s; cursor: pointer; }
        .dua-card-list:hover { border-color: #11d442; box-shadow: 0 8px 24px rgba(17,212,66,0.08); }
        .dua-tag-btn { padding: 6px 16px; border: 1px solid #e2e8f0; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.18s; background: white; color: #475569; white-space: nowrap; }
        .dua-tag-btn:hover, .dua-tag-btn.active { background: rgba(17,212,66,0.1); color: #059669; border-color: rgba(17,212,66,0.3); }
        .dua-action-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: #f8fafc; border: 1px solid transparent; color: #64748b; cursor: pointer; transition: all 0.18s; }
        .dua-action-btn:hover { background: rgba(17,212,66,0.08); color: #11d442; border-color: rgba(17,212,66,0.2); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .fav-btn { background: none; border: none; cursor: pointer; transition: color 0.18s; padding: 4px; }
        .view-btn { padding: 8px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.18s; display: flex; align-items: center; justify-content: center; }
        .view-btn.active { background: #f1f5f9; color: #0f172a; }
        .view-btn:not(.active) { background: transparent; color: #94a3b8; }
        .view-btn:hover { background: #f1f5f9; color: #0f172a; }
      `}</style>

      <div className="dua-page">

        {/* ── Hero Search Area ── */}
        <div className="islamic-pattern" style={{ background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(226,232,240,0.5)', padding: '48px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Title */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, color: '#0f172a' }}>Dua Explorer</h2>
              <p style={{ margin: 0, color: '#64748b' }}>Discover and learn daily supplications for every occasion</p>
            </div>

            {/* Search + filter row */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 24, pointerEvents: 'none', transition: 'color 0.15s' }}>search</span>
                <input
                  type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder='Search by Dua name, category, or keyword (e.g., "patience")'
                  style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '18px 20px 18px 56px', fontSize: 15, color: '#0f172a', outline: 'none', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.18s', fontFamily: 'inherit' }}
                  onFocus={e => { e.target.style.borderColor = '#11d442'; e.target.style.boxShadow = '0 0 0 4px rgba(17,212,66,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                />
              </div>
              {/* Filter dropdown */}
              <div ref={filterRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowFilter(f => !f)}
                  style={{ height: 60, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: `1px solid ${showFilter ? '#11d442' : '#e2e8f0'}`, borderRadius: 16, color: showFilter ? '#11d442' : '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.18s' }}>
                  <span className="material-symbols-outlined">tune</span>
                  <span>Filters</span>
                </button>
                {showFilter && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 280, background: 'white', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', zIndex: 100, padding: '20px 0' }}>
                    <div style={{ padding: '0 20px 16px' }}>
                      <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8' }}>Filter by Source</p>
                      {SOURCES.map(src => (
                        <label key={src} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10 }}>
                          <input type="radio" name="source" checked={sourceFilter === src} onChange={() => { setSourceFilter(src); setPage(1); }}
                            style={{ accentColor: '#11d442', width: 16, height: 16 }} />
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#475569' }}>{src}</span>
                        </label>
                      ))}
                    </div>
                    <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
                    <div style={{ padding: '16px 20px 0' }}>
                      <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8' }}>Quick Tags</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {SUGGESTED_TAGS.map(tag => (
                          <button key={tag} className={`dua-tag-btn ${activeTag === tag ? 'active' : ''}`}
                            onClick={() => { setActiveTag(t => t === tag ? '' : tag); setPage(1); setShowFilter(false); }}>
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested tags row */}
            <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', padding: '2px 0' }}>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>Suggested:</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {SUGGESTED_TAGS.map(tag => (
                  <button key={tag} className={`dua-tag-btn ${activeTag === tag ? 'active' : ''}`}
                    onClick={() => { setActiveTag(t => t === tag ? '' : tag); setPage(1); }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="islamic-pattern" style={{ minHeight: '100%' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

            {/* ── Dua of the Day Banner (hidden while searching) ── */}
            {!search && !activeTag && (
              <div style={{
                marginBottom: 56, background: 'linear-gradient(135deg,#059669 0%,#11d442 100%)',
                borderRadius: 24, padding: '48px', color: 'white', position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(17,212,66,0.2)',
              }}>
                {/* Decorative icon */}
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', right: -20, top: -20, fontSize: 240,
                  color: 'rgba(255,255,255,0.06)', pointerEvents: 'none', lineHeight: 1,
                }}>auto_awesome</span>
                {/* Glow blob */}
                <div style={{ position: 'absolute', right: -60, bottom: -60, width: 280, height: 280, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 16px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 28 }}>
                    Dua of the Day
                  </span>
                  <p style={{ fontFamily: ARABIC_FONT, fontSize: 'clamp(1.6rem,4vw,2.6rem)', lineHeight: 1.9, textAlign: 'right', direction: 'rtl', margin: '0 0 24px', textShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
                    {DUA_OF_THE_DAY.arabic}
                  </p>
                  <p style={{ fontSize: 17, fontStyle: 'italic', opacity: 0.95, borderLeft: '4px solid rgba(255,255,255,0.35)', paddingLeft: 20, margin: '0 0 28px', lineHeight: 1.65, maxWidth: 700 }}>
                    {DUA_OF_THE_DAY.translation}
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 28px', background: 'white', color: '#059669', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(0,0,0,0.12)', transition: 'all 0.18s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>play_circle</span>
                      Listen Now
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`${DUA_OF_THE_DAY.arabic}\n\n${DUA_OF_THE_DAY.translation}\n\n— ${DUA_OF_THE_DAY.reference}`); setCopied('dotd'); setTimeout(() => setCopied(null), 1800); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', backdropFilter: 'blur(8px)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{copied === 'dotd' ? 'check' : 'share'}</span>
                      {copied === 'dotd' ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── All Supplications header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 20, marginBottom: 32 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>All Supplications</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                  {filtered.length > 0 ? `Showing ${visible.length} of ${filtered.length} duas` : 'No duas found'}
                  {(activeTag || sourceFilter !== 'All') && (
                    <button onClick={() => { setActiveTag(''); setSourceFilter('All'); }} style={{ background: 'none', border: 'none', color: '#11d442', fontWeight: 600, fontSize: 12, cursor: 'pointer', marginLeft: 8, fontFamily: 'inherit', padding: 0 }}>
                      Clear filters ✕
                    </button>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>grid_view</span>
                </button>
                <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>view_list</span>
                </button>
              </div>
            </div>

            {/* ── Dua Grid / List ── */}
            {visible.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: '#94a3b8' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>search_off</span>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>No duas matched your search</p>
                <p style={{ fontSize: 14 }}>Try a different keyword or clear your filters</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 48 }}>
                {visible.map(dua => (
                  <DuaCard key={dua.id} dua={dua} favorites={favorites} copied={copied} onToggleFav={toggleFav} onCopy={copyArabic} onShare={shareText} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
                {visible.map(dua => (
                  <DuaListRow key={dua.id} dua={dua} favorites={favorites} copied={copied} onToggleFav={toggleFav} onCopy={copyArabic} onShare={shareText} />
                ))}
              </div>
            )}

            {/* ── Load More / Info ── */}
            <div style={{ textAlign: 'center', paddingBottom: 32 }}>
              {hasMore && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 40px', background: '#11d442', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(17,212,66,0.25)', transition: 'all 0.18s', marginBottom: 16 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#059669'; (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#11d442'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
                  Load More Duas
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
              )}
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.02em' }}>
                Showing {visible.length} of {filtered.length} duas in the collection
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '36px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(17,212,66,0.15)', padding: 6, borderRadius: 8 }}>
                <span className="material-symbols-outlined" style={{ color: '#11d442', fontSize: 18, lineHeight: 1 }}>auto_stories</span>
              </div>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Nur Quran</span>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>© 2024 Nur Quran Learning Hub. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Privacy Policy', 'Terms of Service'].map(l => (
                <a key={l} href="#" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#11d442'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}>{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */
type DuaItem = typeof DUAS[0];
interface DuaCardProps {
  dua: DuaItem;
  favorites: Set<string>;
  copied: string | null;
  onToggleFav: (id: string) => void;
  onCopy: (id: string, text: string) => void;
  onShare: (dua: DuaItem) => void;
}

function DuaCard({ dua, favorites, copied, onToggleFav, onCopy, onShare }: DuaCardProps) {
  const isFav = favorites.has(dua.id);
  const wasCopied = copied === dua.id;
  return (
    <div className="dua-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: dua.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ color: dua.iconColor, fontSize: 24 }}>{dua.icon}</span>
          </div>
          <div>
            <h3 style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{dua.title}</h3>
            <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>{dua.category}</p>
          </div>
        </div>
        <button className="fav-btn" onClick={() => onToggleFav(dua.id)} style={{ color: isFav ? '#ef4444' : '#cbd5e1' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>
      </div>

      {/* Arabic */}
      <p style={{ fontFamily: ARABIC_FONT, fontSize: 22, textAlign: 'right', direction: 'rtl', lineHeight: 1.9, color: '#1e293b', margin: '0 0 28px', fontWeight: 400 }}>
        {dua.arabic}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dua-action-btn" title="Play Audio">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>volume_up</span>
          </button>
          <button className="dua-action-btn" title={wasCopied ? 'Copied!' : 'Copy Text'} onClick={() => onCopy(dua.id, dua.arabic)}
            style={{ color: wasCopied ? '#11d442' : undefined }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{wasCopied ? 'check' : 'content_copy'}</span>
          </button>
          <button className="dua-action-btn" title="Share" onClick={() => onShare(dua)}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>share</span>
          </button>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#11d442', background: 'rgba(17,212,66,0.1)', padding: '6px 14px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {dua.reference}
        </span>
      </div>
    </div>
  );
}

function DuaListRow({ dua, favorites, copied, onToggleFav, onCopy }: DuaCardProps) {
  const isFav = favorites.has(dua.id);
  const wasCopied = copied === dua.id;
  return (
    <div className="dua-card-list" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: dua.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ color: dua.iconColor, fontSize: 22 }}>{dua.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 2 }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{dua.title}</h3>
          <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{dua.category}</span>
        </div>
        <p style={{ margin: 0, fontFamily: ARABIC_FONT, fontSize: 18, direction: 'rtl', color: '#334155', lineHeight: 1.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {dua.arabic}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#11d442', background: 'rgba(17,212,66,0.1)', padding: '5px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dua.reference}</span>
        <button className="dua-action-btn" onClick={() => onCopy(dua.id, dua.arabic)} title="Copy">
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: wasCopied ? '#11d442' : undefined }}>{wasCopied ? 'check' : 'content_copy'}</span>
        </button>
        <button className="fav-btn" onClick={() => onToggleFav(dua.id)} style={{ color: isFav ? '#ef4444' : '#cbd5e1', display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>
      </div>
    </div>
  );
}
