'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ── Topic data ── */
const TOPICS = [
  {
    id: 'embryology', icon: 'biotech', title: 'Embryology',
    desc: 'Detailed stages of human development and prenatal growth from microscopic start to birth.',
    verse: 'Al-Mu\'minun 23:14', href: '/quran-science/embryology', ready: true,
  },
  {
    id: 'astronomy', icon: 'auto_awesome', title: 'Astronomy',
    desc: 'The expanding universe, celestial orbits, and the cosmic origin of the heavens.',
    verse: 'Adh-Dhariyat 51:47', href: '#', ready: false,
  },
  {
    id: 'oceanology', icon: 'waves', title: 'Oceanology',
    desc: 'Internal ocean waves, deep-sea darkness, and the barriers between saltwater bodies.',
    verse: 'An-Nur 24:40', href: '#', ready: false,
  },
  {
    id: 'geology', icon: 'terrain', title: 'Geology',
    desc: 'The stabilizing function of mountains as "pegs" and the tectonic secrets of the earth\'s crust.',
    verse: 'An-Naba 78:7', href: '#', ready: false,
  },
];

const STATS = [
  { icon: 'auto_stories', value: '750+', label: 'Scientific Verses' },
  { icon: 'biotech', value: '6', label: 'Major Fields' },
  { icon: 'history', value: '1,400+', label: 'Years Ahead' },
  { icon: 'groups', value: '20+', label: 'Scholars Cited' },
];

export default function QuranSciencePage() {
  const [dark, setDark] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const G = '#11d442';
  const C = {
    bg: dark ? '#0d1b12' : '#ffffff',
    card: dark ? '#111f16' : '#ffffff',
    cardBorder: dark ? '#1e3a2a' : '#f1f5f9',
    text: dark ? '#e2e8e5' : '#0f172a',
    muted: '#94a3b8',
    sub: dark ? '#64748b' : '#64748b',
    green: G,
    greenSoft: 'rgba(17,212,66,0.08)',
    greenBorder: 'rgba(17,212,66,0.18)',
    greenGlow: '0 4px 14px rgba(17,212,66,0.3)',
    shadow: '0 1px 4px rgba(0,0,0,0.06)',
    font: "'Figtree','Lexend',sans-serif",
    surface: dark ? '#0f2317' : '#f8fafc',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font }}>
      <style>{`
        .qs-dot{background-image:radial-gradient(circle at 2px 2px,rgba(17,212,66,0.06) 1px,transparent 0);background-size:24px 24px}
        .qs-card{transition:transform 0.25s ease,box-shadow 0.25s ease}.qs-card:hover{transform:translateY(-5px);box-shadow:0 12px 36px rgba(17,212,66,0.12) !important}
        .qs-icon-float{animation:qs-float 3s ease-in-out infinite}.qs-icon-float-d{animation:qs-float 3s ease-in-out 0.3s infinite}
        @keyframes qs-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .font-arabic{font-family:'Naskh IndoPak',serif}
        @media(max-width:768px){.qs-hero-flex{flex-direction:column !important;text-align:center !important}.qs-stats-grid{grid-template-columns:repeat(2,1fr) !important}.qs-topics-grid{grid-template-columns:1fr !important}.qs-insight-flex{flex-direction:column !important}.qs-insight-divider{display:none !important}.qs-cta-row{flex-direction:column !important}}
        @media(max-width:480px){.qs-stats-grid{grid-template-columns:1fr !important}}
      `}</style>

      <main className="qs-dot" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 72px' }}>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 20,
            boxShadow: C.shadow, overflow: 'hidden', marginBottom: 28, position: 'relative',
          }}
        >
          {/* Top accent */}
          <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${G}, #059669, transparent)` }} />

          <div style={{ padding: 'clamp(24px,5vw,40px)' }}>
            {/* Eyebrow badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: C.greenSoft, border: `1px solid ${C.greenBorder}`, borderRadius: 999, fontSize: 11, fontWeight: 600, color: G, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>science</span>
              Quran &amp; Modern Science
            </div>

            <div className="qs-hero-flex" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              {/* Left text */}
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em' }}>
                  Bridging Revelation &amp;{' '}
                  <span style={{ color: G }}>Scientific Discovery</span>
                </h1>
                <p style={{ fontSize: 15, color: C.sub, lineHeight: 1.7, marginBottom: 20, maxWidth: 480 }}>
                  Explore the remarkable alignment between Quranic verses revealed over 1,400 years ago
                  and the findings of modern science across multiple disciplines.
                </p>

                {/* Quote */}
                <div style={{ borderLeft: `3px solid ${G}`, paddingLeft: 16, marginBottom: 24 }}>
                  <p className="font-arabic" style={{ fontSize: 18, color: C.text, direction: 'rtl', textAlign: 'right', lineHeight: 2, marginBottom: 6 }}>
                    سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ
                  </p>
                  <p style={{ fontSize: 13, fontStyle: 'italic', color: C.muted, lineHeight: 1.6, marginBottom: 4 }}>
                    "We will show them Our signs in the horizons and within themselves until it becomes clear that it is the truth."
                  </p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: G, letterSpacing: '0.08em' }}>Surah Fussilat 41:53</span>
                </div>

                {/* CTA */}
                <div className="qs-cta-row" style={{ display: 'flex', gap: 12 }}>
                  <Link href="/quran-science/embryology" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px',
                    background: G, color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 12,
                    textDecoration: 'none', boxShadow: C.greenGlow, transition: 'transform 0.15s',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>explore</span>
                    Start Exploring
                  </Link>
                  <Link href="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px',
                    background: dark ? '#1e3a2a' : '#f1f5f9', color: dark ? '#e2e8e5' : '#475569',
                    fontWeight: 600, fontSize: 14, borderRadius: 12, textDecoration: 'none',
                    border: `1px solid ${C.cardBorder}`, transition: 'transform 0.15s',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                    Home
                  </Link>
                </div>
              </div>

              {/* Right decorative icon */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="qs-icon-float" style={{
                  width: 120, height: 120, borderRadius: 24,
                  background: `linear-gradient(135deg, rgba(17,212,66,0.12), rgba(5,150,105,0.08))`,
                  border: `1px solid ${C.greenBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 56, color: G, opacity: 0.7 }}>auto_stories</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Bar ── */}
        <div className="qs-stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28,
        }}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              style={{
                background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14,
                padding: '16px 14px', textAlign: 'center', boxShadow: C.shadow,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: G, marginBottom: 6, display: 'block' }}>{s.icon}</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Section: Topic Explorer ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, padding: '0 4px' }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.greenBorder}, transparent)` }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: G, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>category</span>
              Topic Explorer
            </span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.greenBorder}, transparent)` }} />
          </div>

          <div className="qs-topics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {TOPICS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.45 }}
              >
                <Link
                  href={t.href}
                  onClick={e => !t.ready && e.preventDefault()}
                  className="qs-card"
                  style={{
                    display: 'block', textDecoration: 'none',
                    background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16,
                    boxShadow: C.shadow, overflow: 'hidden', position: 'relative',
                    opacity: t.ready ? 1 : 0.65, cursor: t.ready ? 'pointer' : 'default',
                  }}
                >
                  {/* Top color bar */}
                  <div style={{ height: 3, background: t.ready ? `linear-gradient(90deg, ${G}, #059669)` : (dark ? '#1e3a2a' : '#e2e8f0') }} />

                  <div style={{ padding: '20px 20px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {/* Icon */}
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: t.ready ? C.greenSoft : (dark ? '#1a2a1f' : '#f8fafc'),
                        border: `1px solid ${t.ready ? C.greenBorder : C.cardBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24, color: t.ready ? G : C.muted }}>{t.icon}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{t.title}</h3>
                          {!t.ready && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: dark ? '#1e3a2a' : '#f1f5f9', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Soon</span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, margin: '0 0 10px' }}>{t.desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: t.ready ? G : C.muted, fontWeight: 600 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>book</span>
                          {t.verse}
                          {t.ready && <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 'auto' }}>arrow_forward</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Featured Insight ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{
            background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18,
            boxShadow: C.shadow, overflow: 'hidden', marginBottom: 28,
          }}
        >
          {/* Header bar */}
          <div style={{
            padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10,
            background: dark ? 'rgba(17,212,66,0.03)' : 'rgba(17,212,66,0.02)',
            borderBottom: `1px solid ${C.cardBorder}`,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.greenSoft, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: G }}>lightbulb</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Featured Insight</div>
              <div style={{ fontSize: 11, color: C.muted }}>Embryology in the Quran</div>
            </div>
          </div>

          <div className="qs-insight-flex" style={{ display: 'flex' }}>
            {/* Left: Scripture */}
            <div style={{ flex: 1, padding: 'clamp(20px,4vw,36px)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 16 }}>Scripture Reference</span>
              <div className="font-arabic" style={{
                direction: 'rtl', fontSize: 'clamp(20px,3.5vw,30px)', lineHeight: 2,
                color: C.text, marginBottom: 20, paddingBottom: 16,
                borderBottom: `1px solid ${dark ? '#1e3a2a44' : '#f1f5f9'}`,
              }}>
                ثُمَّ خَلَقْنَا النُّطْفَةَ عَلَقَةً فَخَلَقْنَا الْعَلَقَةَ مُضْغَةً فَخَلَقْنَا الْمُضْغَةَ عِظَامًا فَكَسَوْنَا الْعِظَامَ لَحْمًا
              </div>
              <p style={{ fontSize: 14, fontStyle: 'italic', color: C.muted, lineHeight: 1.75, marginBottom: 12 }}>
                "Then We made the sperm-drop into a clinging clot, and We made the clot into a lump of flesh, and We made from the lump, bones, and We covered the bones with flesh…"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ height: 1, width: 24, background: `rgba(17,212,66,0.3)` }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: G }}>Surah Al-Mu'minun 23:14</span>
              </div>
            </div>

            {/* Divider */}
            <div className="qs-insight-divider" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 0' }}>
              <div style={{ width: 1, flex: 1, background: C.cardBorder }} />
              <div style={{ margin: '10px 0', width: 32, height: 32, borderRadius: '50%', background: C.greenSoft, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: G }}>eco</span>
              </div>
              <div style={{ width: 1, flex: 1, background: C.cardBorder }} />
            </div>

            {/* Right: Science */}
            <div style={{ flex: 1, padding: 'clamp(20px,4vw,36px)', background: C.surface }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 16 }}>Scientific Context</span>
              <h4 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 12 }}>Human Embryonic Development</h4>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 20 }}>
                Modern embryology confirms the chronological order described in the Quranic text. The term <strong style={{ color: C.text }}>'Alaqah'</strong> accurately describes the blastocyst's attachment to the uterine wall, while <strong style={{ color: C.text }}>'Mudghah'</strong> reflects the somite stage.
              </p>

              {/* Mini diagram */}
              <div style={{ borderRadius: 12, border: `1px solid ${C.cardBorder}`, background: C.card, padding: '24px 16px', textAlign: 'center' }}>
                <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 160 }} xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" fill="none" r="80" stroke={dark ? '#1e3a2a' : '#e2e8f0'} strokeDasharray="4 4" strokeWidth="0.5" />
                  <path d="M70,100 C70,60 130,60 130,100 C130,140 70,140 70,100" fill="none" stroke={G} strokeOpacity="0.6" strokeWidth="1" />
                  <path d="M85,100 C85,85 115,85 115,100 C115,115 85,115 85,100" fill="none" stroke={C.muted} strokeWidth="0.75" />
                  {([[100, 78], [100, 122], [78, 100], [122, 100]] as [number, number][]).map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} fill={G} fillOpacity="0.2" r="3" stroke={G} strokeWidth="0.5" />
                  ))}
                </svg>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginTop: 10 }}>Embryogenesis Stage Analysis</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Article + Newsletter ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
          {/* Article card */}
          <motion.div
            initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.45 }}
            className="qs-card"
            style={{
              background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16,
              boxShadow: C.shadow, padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: C.greenSoft, border: `1px solid ${C.greenBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: G, fontSize: 26 }}>water_drop</span>
            </div>
            <div>
              <h5 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>The Water Cycle: A Divine Balance</h5>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 8 }}>Quranic cloud formation descriptions and modern meteorology.</p>
              <span style={{ fontSize: 12, fontWeight: 700, color: G, display: 'flex', alignItems: 'center', gap: 4 }}>
                Read More <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
              </span>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.45 }}
            style={{
              background: `linear-gradient(135deg, ${G}, #059669, #047857)`,
              borderRadius: 16, padding: '22px 20px', position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Glow orb */}
            <div style={{ position: 'absolute', right: -40, top: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(28px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h5 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Weekly Insights</h5>
              <p style={{ fontSize: 13, color: 'rgba(209,250,229,0.85)', marginBottom: 16, lineHeight: 1.5 }}>
                Receive curated research on science &amp; scripture.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    flex: 1, minWidth: 160, background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.22)', borderRadius: 10,
                    padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none',
                  }}
                />
                <button style={{
                  background: '#fff', color: '#047857', border: 'none', borderRadius: 10,
                  padding: '10px 20px', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em',
                  textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Back to top ── */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              background: C.greenSoft, border: `1px solid ${C.greenBorder}`, borderRadius: 12,
              padding: '10px 24px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: G, transition: 'transform 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_less</span>
            Back to Top
          </button>
        </div>

      </main>
    </div>
  );
}
