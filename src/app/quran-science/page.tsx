'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// ── Topic data ────────────────────────────────────────────────────────────────
const topics = [
    {
        id: 'embryology',
        icon: 'biotech',
        title: 'Embryology',
        desc: 'Detailed stages of human development and prenatal growth from microscopic start to birth.',
        href: '/quran-science/embryology',
    },
    {
        id: 'astronomy',
        icon: 'auto_awesome',
        title: 'Astronomy',
        desc: 'The expanding universe, celestial orbits, and the cosmic origin of the heavens.',
        href: '#',
    },
    {
        id: 'oceanology',
        icon: 'waves',
        title: 'Oceanology',
        desc: 'Internal ocean waves, deep-sea darkness, and the barriers between saltwater bodies.',
        href: '#',
    },
    {
        id: 'geology',
        icon: 'terrain',
        title: 'Geology',
        desc: 'The stabilizing function of mountains as "pegs" and the tectonic secrets of the earth\'s crust.',
        href: '#',
    },
];

const footerLinks = {
    Research: ['Digital Library', 'Scientific Journals', 'Arabic Manuscripts'],
    Community: ['Academic Forum', 'Webinars', 'Contributions'],
};

export default function QuranSciencePage() {
    const [email, setEmail] = useState('');

    return (
        <div style={{ minHeight: '100vh', background: 'var(--qs-bg)', color: 'var(--qs-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden', position: 'relative' }}>

            {/* ── STICKY NAV ── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                borderBottom: '1px solid var(--qs-border)',
                background: 'var(--qs-nav-bg)',
                backdropFilter: 'blur(20px)',
            }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Logo + Nav */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-symbols-outlined" style={{ color: '#0fbd74', fontSize: 30, fontVariationSettings: "'FILL' 0, 'wght' 200" }}>auto_stories</span>
                            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--qs-text)' }}>Quran &amp; Science</span>
                        </div>
                        <nav style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
                            {[
                                { label: 'Topics', active: true },
                                { label: 'Research', href: '#' },
                                { label: 'About', href: '#' },
                            ].map(item => (
                                <a
                                    key={item.label}
                                    href={item.href ?? '#'}
                                    style={{
                                        fontSize: 13, fontWeight: 700, letterSpacing: '0.15em',
                                        textTransform: 'uppercase', textDecoration: 'none',
                                        color: item.active ? '#0fbd74' : 'var(--qs-muted)',
                                        borderBottom: item.active ? '1px solid #0fbd74' : '1px solid transparent',
                                        paddingBottom: 2, transition: 'color 0.2s',
                                    }}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Search + Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, color: 'var(--qs-muted)', fontSize: 18 }}>search</span>
                            <input
                                type="text"
                                placeholder="Search archive…"
                                style={{
                                    padding: '8px 16px 8px 36px',
                                    background: 'var(--qs-input-bg)', border: 'none', borderRadius: 999,
                                    fontSize: 13, color: 'var(--qs-text)', outline: 'none', width: 260,
                                }}
                            />
                        </div>
                        <button style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--qs-muted)' }}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>account_circle</span>
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ position: 'relative' }}>

                {/* ── HERO ── */}
                <section style={{ position: 'relative', paddingTop: '5rem', paddingBottom: '7rem', overflow: 'hidden' }}>
                    {/* Celestial SVG pattern */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='800' height='800' viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%230fbd74' stroke-width='0.5' stroke-opacity='0.2'%3E%3Ccircle cx='400' cy='400' r='350'/%3E%3Ccircle cx='400' cy='400' r='250'/%3E%3Ccircle cx='400' cy='400' r='150'/%3E%3Cline x1='400' y1='50' x2='400' y2='750'/%3E%3Cline x1='50' y1='400' x2='750' y2='400'/%3E%3Cpath d='M150 150 L650 650 M650 150 L150 650'/%3E%3C/g%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'center top', backgroundSize: '80% auto' }} />

                    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 1 }}>
                        <div style={{ maxWidth: 800 }}>
                            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                                <span style={{ color: '#0fbd74', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: 11, display: 'block', marginBottom: 20 }}>
                                    An Intellectual Exploration
                                </span>
                                <h2 style={{
                                    fontFamily: "'Newsreader', serif",
                                    fontSize: 'clamp(36px, 6vw, 72px)',
                                    fontWeight: 800, lineHeight: 1.1,
                                    marginBottom: 36, color: 'var(--qs-text)', letterSpacing: '-0.02em',
                                }}>
                                    Bridging Divine Revelation &amp;{' '}
                                    <em style={{ color: '#0fbd74', fontWeight: 400 }}>Scientific Empirical Discovery</em>
                                </h2>
                                <blockquote style={{
                                    borderLeft: '2px solid rgba(15,189,116,0.25)',
                                    paddingLeft: 32, margin: 0,
                                    fontFamily: "'Newsreader', serif",
                                    fontSize: 20, fontStyle: 'italic',
                                    color: 'var(--qs-muted)', lineHeight: 1.7, maxWidth: 600,
                                }}>
                                    "We will show them Our signs in the horizons and within themselves until it becomes clear to them that it is the truth."
                                    <span style={{ display: 'block', marginTop: 12, fontSize: 11, fontStyle: 'normal', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--qs-subtle)' }}>
                                        Surah Fussilat 41:53
                                    </span>
                                </blockquote>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── TOPIC EXPLORER ── */}
                <section style={{ padding: '5rem 0', background: 'var(--qs-section-bg)' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
                        {/* Section header */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
                            <div>
                                <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 30, fontWeight: 700, color: 'var(--qs-text)', marginBottom: 10 }}>Topic Explorer</h3>
                                <div style={{ height: 4, width: 56, background: '#0fbd74' }} />
                            </div>
                            <a href="#" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0fbd74', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                                View All Categories <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                            </a>
                        </div>

                        {/* 4 Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
                            {topics.map((t, i) => (
                                <motion.div
                                    key={t.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className="qs-topic-card"
                                    style={{ borderRadius: 20, padding: '36px 40px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                                    onClick={() => { if (t.href !== '#') window.location.href = t.href; }}
                                >
                                    {/* Icon */}
                                    <div className="qs-icon-wrap" style={{ width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, transition: 'background 0.4s', background: 'var(--qs-card-icon-bg)' }}>
                                        <span className="material-symbols-outlined qs-icon" style={{ fontSize: 28, color: '#0fbd74', transition: 'color 0.4s' }}>{t.icon}</span>
                                    </div>
                                    <h4 style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 700, color: 'var(--qs-text)', marginBottom: 10 }}>{t.title}</h4>
                                    <p style={{ fontSize: 13, color: 'var(--qs-muted)', lineHeight: 1.65, marginBottom: 20 }}>{t.desc}</p>
                                    <div className="qs-explore-cta" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0fbd74', transition: 'opacity 0.4s, transform 0.4s', opacity: 0, transform: 'translateY(6px)' }}>
                                        Start Exploration <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_right_alt</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FEATURED INSIGHT ── */}
                <section style={{ padding: '6rem 0' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#0fbd74', display: 'block', marginBottom: 8 }}>Volume 01, Issue 04</span>
                            <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 34, fontWeight: 700, color: 'var(--qs-text)' }}>Featured Insight</h3>
                        </div>

                        {/* Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            style={{
                                background: 'var(--qs-card)',
                                borderRadius: 28, border: '1px solid var(--qs-border)',
                                overflow: 'hidden', boxShadow: '0 16px 64px rgba(0,0,0,0.06)',
                                display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
                                minHeight: 580, position: 'relative',
                            }}
                        >
                            {/* Left: Scripture */}
                            <div style={{ flex: '1 1 340px', padding: 'clamp(36px,5vw,80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0fbd74', opacity: 0.7, display: 'block', marginBottom: 28 }}>Scripture Reference</span>
                                <div style={{ direction: 'rtl', fontFamily: "'Amiri', serif", fontSize: 'clamp(24px,4vw,46px)', lineHeight: 1.8, color: 'var(--qs-text)', marginBottom: 36 }}>
                                    ثُمَّ خَلَقْنَا النُّطْفَةَ عَلَقَةً فَخَلَقْنَا الْعَلَقَةَ مُضْغَةً فَخَلَقْنَا الْمُضْغَةَ عِظَامًا فَكَسَوْنَا الْعِظَامَ لَحْمًا
                                </div>
                                <div>
                                    <p style={{ fontFamily: "'Newsreader', serif", fontSize: 18, fontStyle: 'italic', color: 'var(--qs-muted)', lineHeight: 1.75, marginBottom: 16 }}>
                                        "Then We made the sperm-drop into a clinging clot, and We made the clot into a lump [of flesh], and We made [from] the lump, bones, and We covered the bones with flesh…"
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ height: 1, width: 28, background: 'rgba(15,189,116,0.4)' }} />
                                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--qs-subtle)' }}>Surah Al-Mu'minun 23:14</span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', pointerEvents: 'none' }}>
                                <div style={{ width: 1, flex: 1, background: 'var(--qs-border)' }} />
                                <div style={{ margin: '16px 0', color: '#0fbd74', background: 'var(--qs-card)', padding: 8, borderRadius: '50%', border: '1px solid var(--qs-border)' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>eco</span>
                                </div>
                                <div style={{ width: 1, flex: 1, background: 'var(--qs-border)' }} />
                            </div>

                            {/* Right: Scientific Context */}
                            <div style={{ flex: '1 1 340px', padding: 'clamp(36px,5vw,80px)', background: 'var(--qs-right-panel)', display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0fbd74', opacity: 0.7, display: 'block', marginBottom: 24 }}>Scientific Context</span>
                                <h4 style={{ fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 700, color: 'var(--qs-text)', marginBottom: 18 }}>Human Embryonic Development</h4>
                                <p style={{ fontSize: 16, color: 'var(--qs-muted)', lineHeight: 1.75, marginBottom: 32 }}>
                                    Modern embryology confirms the chronological order of development described in the Quranic text. The term <strong style={{ color: 'var(--qs-text)', fontStyle: 'italic' }}>'Alaqah'</strong> accurately describes the blastocyst's attachment to the uterine wall, while <strong style={{ color: 'var(--qs-text)', fontStyle: 'italic' }}>'Mudghah'</strong> reflects the somite stage of the embryo.
                                </p>

                                {/* Diagram */}
                                <div style={{ marginTop: 'auto', borderRadius: 16, border: '1px solid var(--qs-border)', background: 'var(--qs-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 24px' }}>
                                    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 200 }} xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="100" cy="100" fill="none" r="80" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="0.5" />
                                        <path d="M70,100 C70,60 130,60 130,100 C130,140 70,140 70,100" fill="none" stroke="#0fbd74" strokeOpacity="0.6" strokeWidth="1" />
                                        <path d="M85,100 C85,85 115,85 115,100 C115,115 85,115 85,100" fill="none" stroke="#94a3b8" strokeWidth="0.75" />
                                        {[[100, 78], [100, 122], [78, 100], [122, 100]].map(([cx, cy], i) => (
                                            <circle key={i} cx={cx} cy={cy} fill="#0fbd74" fillOpacity="0.2" r="3" stroke="#0fbd74" strokeWidth="0.5" />
                                        ))}
                                        <line stroke="#cbd5e1" strokeOpacity="0.5" strokeWidth="0.5" x1="100" x2="100" y1="20" y2="180" />
                                        <line stroke="#cbd5e1" strokeOpacity="0.5" strokeWidth="0.5" x1="20" x2="180" y1="100" y2="100" />
                                    </svg>
                                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--qs-subtle)', marginTop: 16 }}>Fig. 2.1 Embryogenesis Stage Analysis</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── ARTICLE + NEWSLETTER ── */}
                <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 6rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                            {/* Article card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                style={{ background: 'var(--qs-card)', border: '1px solid var(--qs-border)', borderRadius: 28, padding: 'clamp(28px,4vw,48px)', display: 'flex', alignItems: 'center', gap: 28 }}
                            >
                                <div style={{ width: 72, height: 72, background: 'rgba(15,189,116,0.07)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span className="material-symbols-outlined" style={{ color: '#0fbd74', fontSize: 32, fontVariationSettings: "'FILL' 0, 'wght' 200" }}>menu_book</span>
                                </div>
                                <div>
                                    <h5 style={{ fontFamily: "'Newsreader', serif", fontSize: 20, fontWeight: 700, color: 'var(--qs-text)', marginBottom: 8 }}>The Water Cycle: A Divine Balance</h5>
                                    <p style={{ fontSize: 13, color: 'var(--qs-muted)', lineHeight: 1.6, marginBottom: 16 }}>Explore the correlation between Quranic cloud formation descriptions and modern meteorology.</p>
                                    <button style={{ background: 'none', border: 'none', padding: 0, color: '#0fbd74', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        Read Full Publication <span className="material-symbols-outlined" style={{ fontSize: 14 }}>north_east</span>
                                    </button>
                                </div>
                            </motion.div>

                            {/* Newsletter */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                style={{ background: 'linear-gradient(135deg, #0fbd74, #047857, #064e3b)', borderRadius: 28, padding: 'clamp(28px,4vw,48px)', position: 'relative', overflow: 'hidden' }}
                            >
                                {/* Glow orb */}
                                <div style={{ position: 'absolute', right: -48, top: -48, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none' }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h5 style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8 }}>Weekly Insights</h5>
                                    <p style={{ fontSize: 14, color: 'rgba(209,250,229,0.8)', marginBottom: 24, lineHeight: 1.6 }}>Academic updates on science and spirituality, delivered to your inbox.</p>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            style={{ flex: 1, minWidth: 180, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 18px', fontSize: 13, color: 'white', outline: 'none' }}
                                        />
                                        <button style={{ background: 'white', color: '#064e3b', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                            Subscribe
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── FOOTER ── */}
            <footer style={{ borderTop: '1px solid var(--qs-border)', background: 'var(--qs-card)', paddingTop: 64, paddingBottom: 40 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '5fr 2fr 2fr 3fr', gap: 48, marginBottom: 64, flexWrap: 'wrap' }}>
                        {/* Brand */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                                <span className="material-symbols-outlined" style={{ color: '#0fbd74', fontSize: 28 }}>auto_stories</span>
                                <span style={{ fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: 13 }}>Quran &amp; Science Hub</span>
                            </div>
                            <p style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: 14, color: 'var(--qs-muted)', lineHeight: 1.75, maxWidth: 300, marginBottom: 24 }}>
                                "An academic bridge between classical Islamic scholarship and modern empirical observation, fostering a deeper understanding of our universe."
                            </p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {['share', 'mail'].map(icon => (
                                    <a key={icon} href="#" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--qs-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--qs-muted)', textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{icon}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Link columns */}
                        {Object.entries(footerLinks).map(([heading, links]) => (
                            <div key={heading}>
                                <h6 style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--qs-text)', marginBottom: 20 }}>{heading}</h6>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {links.map(link => (
                                        <li key={link}>
                                            <a href="#" style={{ fontSize: 13, color: 'var(--qs-muted)', textDecoration: 'none' }}>{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Back to top */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--qs-muted)' }}
                            >
                                <div style={{ width: 46, height: 46, borderRadius: '50%', border: '1px solid var(--qs-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined">expand_less</span>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Back to Top</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div style={{ paddingTop: 28, borderTop: '1px solid var(--qs-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <p style={{ fontSize: 12, color: 'var(--qs-subtle)' }}>© 2024 Quran &amp; Modern Science Hub. Dedicated to objective truth.</p>
                        <div style={{ display: 'flex', gap: 28 }}>
                            {['Privacy Protocol', 'Editorial Guidelines'].map(l => (
                                <a key={l} href="#" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--qs-subtle)', textDecoration: 'none' }}>{l}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── GLOBAL STYLES ── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        :root {
          --qs-bg: #fcfdfc;
          --qs-nav-bg: rgba(252,253,252,0.75);
          --qs-card: #ffffff;
          --qs-right-panel: rgba(248,250,252,0.5);
          --qs-section-bg: rgba(248,250,252,0.5);
          --qs-border: rgba(226,232,240,0.7);
          --qs-text: #0f172a;
          --qs-muted: #64748b;
          --qs-subtle: #94a3b8;
          --qs-input-bg: #f1f5f9;
          --qs-card-icon-bg: #ffffff;
        }

        /* Topic card glassmorphism */
        .qs-topic-card {
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.35);
          transition: box-shadow 0.45s, transform 0.45s;
        }
        .qs-topic-card:hover {
          box-shadow: 0 16px 48px rgba(0,0,0,0.08);
          transform: translateY(-4px);
        }
        .qs-topic-card:hover .qs-icon-wrap {
          background: #0fbd74 !important;
        }
        .qs-topic-card:hover .qs-icon {
          color: white !important;
        }
        .qs-topic-card:hover .qs-explore-cta {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Link hover colors */
        a:hover { color: #0fbd74; }
      `}</style>
        </div>
    );
}
