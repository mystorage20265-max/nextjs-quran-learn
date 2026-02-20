'use client';

import { useState } from 'react';

const CATEGORIES = [
  { slug: 'morning-evening', label: 'Morning & Evening', count: 24, icon: 'wb_twilight', iconColor: '#f97316', grad: 'linear-gradient(135deg,#fff7ed,#fed7aa)' },
  { slug: 'success', label: 'For Success', count: 18, icon: 'trending_up', iconColor: '#10b981', grad: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)' },
  { slug: 'forgiveness', label: 'Forgiveness', count: 12, icon: 'volunteer_activism', iconColor: '#3b82f6', grad: 'linear-gradient(135deg,#eff6ff,#bfdbfe)' },
  { slug: 'health', label: 'Health', count: 15, icon: 'favorite', iconColor: '#ef4444', grad: 'linear-gradient(135deg,#fef2f2,#fecaca)' },
  { slug: 'family', label: 'For Family', count: 20, icon: 'groups', iconColor: '#a855f7', grad: 'linear-gradient(135deg,#faf5ff,#e9d5ff)' },
];

const DUAS = [
  { id: '1', badge: 'Morning', badgeBg: 'rgba(249,115,22,0.12)', badgeColor: '#ea580c', accentColor: '#f97316', title: 'Protection from Evil', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', transliteration: 'Bismillahilladhi la yadurru...', reference: 'Abu Dawud 5088' },
  { id: '2', badge: 'Patience', badgeBg: 'rgba(59,130,246,0.12)', badgeColor: '#2563eb', accentColor: '#3b82f6', title: 'Dua for Ease', arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا', transliteration: 'Allahumma la sahla...', reference: 'Ibn Hibban' },
  { id: '3', badge: 'Gratitude', badgeBg: 'rgba(139,92,246,0.12)', badgeColor: '#7c3aed', accentColor: '#8b5cf6', title: 'Shukr (Gratitude)', arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ', transliteration: "Rabbi awzi'ni an ashkura...", reference: 'Quran 27:19' },
  { id: '4', badge: 'Guidance', badgeBg: 'rgba(239,68,68,0.12)', badgeColor: '#dc2626', accentColor: '#ef4444', title: 'Dua for Guidance', arabic: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي', transliteration: 'Allahumma ihdini...', reference: 'Muslim 2725' },
  { id: '5', badge: 'Parents', badgeBg: 'rgba(245,158,11,0.12)', badgeColor: '#b45309', accentColor: '#f59e0b', title: 'For Parents', arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', transliteration: "Rabbi irhamhuma kama...", reference: 'Quran 17:24' },
  { id: '6', badge: 'Success', badgeBg: 'rgba(16,185,129,0.12)', badgeColor: '#059669', accentColor: '#10b981', title: 'Opening of Affairs', arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', transliteration: 'Ya Hayyu Ya Qayyumu...', reference: 'At-Tirmidhi 3524' },
];

const HISTORY = [
  { title: 'After Salah Duas', time: '2 hours ago', icon: 'schedule' },
  { title: 'Sleeping Etiquette', time: 'Yesterday', icon: 'bedtime' },
  { title: 'Morning Adhkar', time: '3 days ago', icon: 'wb_sunny' },
];

export default function DuaClient() {
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['2']));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleFav = (id: string) => setFavorites(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleExp = (id: string) => setExpanded(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const filtered = DUAS.filter(d =>
    !search ||
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.badge.toLowerCase().includes(search.toLowerCase()) ||
    d.arabic.includes(search)
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', 'Lexend', sans-serif" }}>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '40px 40px 80px', minWidth: 0 }}>

        {/* ── Top Header ── */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 640 }}>
            <span className="material-icons-outlined" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 22, pointerEvents: 'none' }}>search</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search duas by name, category, or keyword…"
              style={{ width: '100%', padding: '15px 20px 15px 54px', background: '#fff', border: '2px solid #e2e8f0', borderRadius: 22, fontSize: 15, color: '#1e293b', outline: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 22, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 20px rgba(16,185,129,0.35)', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(16,185,129,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(16,185,129,0.35)'; }}
          >
            <span className="material-icons-outlined" style={{ fontSize: 22 }}>play_circle</span>
            Quick Start
          </button>
        </header>

        {/* ── Hero Banner ── */}
        <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#10b981 0%,#059669 50%,#064e3b 100%)', borderRadius: 32, padding: '48px 56px', color: '#fff', marginBottom: 52 }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: -40, bottom: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none' }} />
          {/* Subtle grid pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 540 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20, border: '1px solid rgba(255,255,255,0.25)' }}>
                <span className="material-icons-outlined" style={{ fontSize: 14 }}>auto_awesome</span>
                Daily Dua
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 800, marginBottom: 18, lineHeight: 1.2 }}>
                Dua for Increasing Knowledge
              </h2>
              <p style={{ fontFamily: "'Amiri', serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', lineHeight: 2, textAlign: 'right', direction: 'rtl', marginBottom: 14, textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                رَّبِّ زِدْنِي عِلْمًا
              </p>
              <p style={{ opacity: 0.88, marginBottom: 8, fontSize: 14, letterSpacing: '0.3px' }}>
                <em>Rabbi zidni 'ilma</em>
              </p>
              <p style={{ opacity: 0.75, marginBottom: 32, fontSize: 15, lineHeight: 1.7 }}>
                My Lord, increase me in knowledge.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', background: '#fff', color: '#059669', border: 'none', borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0fdf4'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                >
                  <span className="material-icons-outlined" style={{ fontSize: 20 }}>play_arrow</span>
                  Listen
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: 'pointer', backdropFilter: 'blur(10px)', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
                >
                  <span className="material-icons-outlined" style={{ fontSize: 20 }}>share</span>
                  Share
                </button>
              </div>
            </div>

            {/* Decorative circle */}
            <div style={{ width: 200, height: 200, background: 'rgba(255,255,255,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
              <div style={{ width: 160, height: 160, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span className="material-icons-outlined" style={{ fontSize: 72, color: 'rgba(255,255,255,0.9)' }}>auto_awesome</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
          {[
            { icon: 'collections_bookmark', label: 'Total Duas', value: '200+', color: '#10b981' },
            { icon: 'category', label: 'Categories', value: '12', color: '#3b82f6' },
            { icon: 'favorite', label: 'Saved', value: favorites.size.toString(), color: '#ef4444' },
            { icon: 'translate', label: 'Languages', value: '3', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ flex: '1 1 160px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-icons-outlined" style={{ color: s.color, fontSize: 24 }}>{s.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Categories ── */}
        <section style={{ marginBottom: 52 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Dua Categories</h3>
            <a href="#" style={{ color: '#10b981', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <span className="material-icons-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 16 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.slug}
                style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 24, padding: '26px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = '0 16px 36px rgba(0,0,0,0.12)';
                  el.style.borderColor = cat.iconColor;
                  (el.querySelector('.cat-icon') as HTMLElement).style.transform = 'scale(1.15)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = '';
                  el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  el.style.borderColor = '#e2e8f0';
                  (el.querySelector('.cat-icon') as HTMLElement).style.transform = '';
                }}
              >
                <div className="cat-icon" style={{ width: 60, height: 60, margin: '0 auto 16px', background: cat.grad, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.25s', boxShadow: `0 4px 12px ${cat.iconColor}30` }}>
                  <span className="material-icons-outlined" style={{ color: cat.iconColor, fontSize: 30 }}>{cat.icon}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 5px', color: '#0f172a' }}>{cat.label}</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{cat.count} Supplications</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Popular Duas ── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Popular Duas</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filtered.map(dua => {
              const isExp = expanded.has(dua.id);
              const isFav = favorites.has(dua.id);
              return (
                <div key={dua.id}
                  style={{ background: '#fff', borderRadius: 28, border: '1.5px solid #e2e8f0', padding: '28px 26px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)';
                    el.style.transform = 'translateY(-3px)';
                    el.style.borderColor = dua.accentColor + '60';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                    el.style.transform = '';
                    el.style.borderColor = '#e2e8f0';
                  }}
                >
                  {/* Left accent bar */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg, ${dua.accentColor}, ${dua.accentColor}40)`, borderRadius: '28px 0 0 28px' }} />

                  {/* Badge + Fav */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ background: dua.badgeBg, color: dua.badgeColor, padding: '5px 14px', borderRadius: 100, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      {dua.badge}
                    </span>
                    <button onClick={() => toggleFav(dua.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isFav ? '#ef4444' : '#cbd5e1', transition: 'all 0.2s', padding: 4, borderRadius: 8 }}>
                      <span className="material-icons-outlined" style={{ fontSize: 22 }}>{isFav ? 'favorite' : 'favorite_border'}</span>
                    </button>
                  </div>

                  {/* Title */}
                  <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', margin: '0 0 16px' }}>{dua.title}</h4>

                  {/* Arabic */}
                  <p style={{ fontFamily: "'Amiri', serif", fontSize: '1.6rem', textAlign: 'right', direction: 'rtl', lineHeight: 2, color: '#1e293b', margin: '0 0 12px', fontWeight: 400 }}>
                    {dua.arabic}
                  </p>

                  {/* Expanded content */}
                  {isExp && (
                    <div style={{ marginBottom: 12, padding: '14px 16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 6, fontStyle: 'italic', lineHeight: 1.7 }}>{dua.transliteration}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-icons-outlined" style={{ fontSize: 13 }}>menu_book</span>
                        {dua.reference}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => toggleExp(dua.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: dua.accentColor, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', padding: 0, transition: 'gap 0.15s' }}>
                      {isExp ? 'Show Less' : 'Read More'}
                      <span className="material-icons-outlined" style={{ fontSize: 18 }}>{isExp ? 'expand_less' : 'chevron_right'}</span>
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ width: 38, height: 38, borderRadius: '50%', background: `${dua.accentColor}12`, border: `1.5px solid ${dua.accentColor}30`, color: dua.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = dua.accentColor; b.style.color = '#fff'; }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `${dua.accentColor}12`; b.style.color = dua.accentColor; }}
                      >
                        <span className="material-icons-outlined" style={{ fontSize: 18 }}>play_arrow</span>
                      </button>
                      <button style={{ width: 38, height: 38, borderRadius: '50%', background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#1e293b'; b.style.color = '#fff'; b.style.borderColor = '#1e293b'; }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#f1f5f9'; b.style.color = '#64748b'; b.style.borderColor = '#e2e8f0'; }}
                      >
                        <span className="material-icons-outlined" style={{ fontSize: 16 }}>content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 52, display: 'flex', justifyContent: 'center' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 36px', background: '#fff', border: '2px solid #e2e8f0', borderRadius: 22, fontWeight: 700, fontSize: 15, color: '#475569', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#10b981'; b.style.color = '#10b981'; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#e2e8f0'; b.style.color = '#475569'; }}
            >
              Load More Supplications
              <span className="material-icons-outlined" style={{ fontSize: 22 }}>expand_more</span>
            </button>
          </div>
        </section>
      </main>

      {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="dua-sidebar" style={{ width: 300, flexShrink: 0, padding: '40px 24px', borderLeft: '1.5px solid #e2e8f0', background: '#fff', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

        {/* Saved count pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>My Workspace</p>
          <span style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', padding: '3px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
            {favorites.size} Saved
          </span>
        </div>

        {/* Saved duas preview */}
        {favorites.size > 0 && (
          <div style={{ marginBottom: 32, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: '16px 20px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#065f46', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-icons-outlined" style={{ fontSize: 16, color: '#10b981' }}>favorite</span>
              Saved Duas
            </p>
            {DUAS.filter(d => favorites.has(d.id)).map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #bbf7d020' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.accentColor, flexShrink: 0 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, flex: 1 }}>{d.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent History */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 20 }}>Recent History</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HISTORY.map(h => (
              <div key={h.title} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '10px 12px', borderRadius: 16, transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-icons-outlined" style={{ color: '#94a3b8', fontSize: 20 }}>{h.icon}</span>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0, color: '#0f172a' }}>{h.title}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{h.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Etiquette card */}
        <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #bbf7d0', borderRadius: 24, padding: '24px 22px' }}>
          <h5 style={{ color: '#065f46', fontWeight: 800, margin: '0 0 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons-outlined" style={{ fontSize: 20, color: '#10b981' }}>tips_and_updates</span>
            Dua Etiquette
          </h5>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
            {[
              { tip: 'Face the Qiblah if possible.', icon: 'explore' },
              { tip: 'Raise your hands at chest level.', icon: 'front_hand' },
              { tip: 'Start by praising Allah (SWT).', icon: 'volunteer_activism' },
              { tip: 'Send blessings upon the Prophet ﷺ.', icon: 'star' },
            ].map(e => (
              <li key={e.tip} style={{ display: 'flex', gap: 10, fontSize: 12.5, color: 'rgba(6,78,59,0.85)', lineHeight: 1.6, alignItems: 'flex-start' }}>
                <span className="material-icons-outlined" style={{ fontSize: 16, color: '#10b981', flexShrink: 0, marginTop: 1 }}>{e.icon}</span>
                {e.tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Daily reminder */}
        <div style={{ marginTop: 24, background: 'linear-gradient(135deg,#1e293b,#0f172a)', borderRadius: 24, padding: '24px 22px', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px' }}>Reminder</p>
          <p style={{ fontFamily: "'Amiri', serif", fontSize: '1.2rem', direction: 'rtl', textAlign: 'right', lineHeight: 2, color: '#f0fdf4', margin: '0 0 8px' }}>
            وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ
          </p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            "And when My servants ask about Me — I am near." — Quran 2:186
          </p>
        </div>
      </aside>

      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .dua-sidebar { display: none !important; }
                @media (min-width: 1280px) { .dua-sidebar { display: block !important; } }
                * { box-sizing: border-box; }
            `}</style>
    </div>
  );
}
