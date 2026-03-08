'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import './Navbar.css';

/* ─── Nav data ───────────────────────────────────────────────── */
const PRIMARY_LINKS = [
  { href: '/',               label: 'Home',      icon: 'home',       badge: null         },
  { href: '/read-quran',     label: 'Read',      icon: 'menu_book',  badge: null         },
  { href: '/learn-quran',    label: 'Learn',     icon: 'school',     badge: 'New'        },
  { href: '/memorize-quran', label: 'Memorize',  icon: 'psychology', badge: null         },
  { href: '/radio',          label: 'Radio',     icon: 'radio',      badge: 'Live'       },
];

const MEGA_SECTIONS = [
  {
    title: 'Quran',
    icon: 'auto_stories',
    color: '#10b981',
    items: [
      { href: '/read-quran',        label: 'Read Quran',      icon: 'menu_book',          desc: 'Full Arabic text'       },
      { href: '/audio-quran',       label: 'Audio Quran',     icon: 'headphones',         desc: 'Stream recitations'     },
      { href: '/full-surah-reader', label: 'Surah Reader',    icon: 'chrome_reader_mode', desc: 'Immersive reading'      },
      { href: '/word-by-word',      label: 'Word by Word',    icon: 'text_fields',        desc: 'Every word explained'   },
      { href: '/tafseer',           label: 'Tafseer',         icon: 'lightbulb',          desc: 'Classical commentary'   },
    ],
  },
  {
    title: 'Learn & Memorize',
    icon: 'school',
    color: '#6ee7b7',
    items: [
      { href: '/learn-quran',    label: 'Learn Quran',  icon: 'school',                 desc: 'Structured lessons'     },
      { href: '/memorize-quran', label: 'Hifz Program', icon: 'psychology',             desc: 'Smart memorization'     },
      { href: '/courses',        label: 'Courses',      icon: 'class',                  desc: 'Topic-based learning'   },
         ],
  },
  {
    title: 'Spirituality',
    icon: 'mosque',
    color: '#34d399',
    items: [
      { href: '/duas',         label: 'Duas',            icon: 'volunteer_activism', desc: 'Supplications'          },
      { href: '/hadees',       label: 'Hadith',          icon: 'history_edu',        desc: "Prophet's sayings"      },
    ],
  },
  {
    title: 'Tools',
    icon: 'tune',
    color: '#a7f3d0',
    items: [
      { href: '/radio',        label: 'Quran Radio',   icon: 'radio',      desc: 'Live channels'          },
      { href: '/quran-player', label: 'Quran Player',  icon: 'play_circle', desc: 'Full-featured player'  },
    ],
  },
];

/* ─── Component ─────────────────────────────────────────────── */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isScrolled, setIsScrolled]         = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [megaOpen, setMegaOpen]             = useState(false);
  const [activeSection, setActiveSection]   = useState(0);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [query, setQuery]                   = useState('');
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { resolvedTheme, toggleTheme }      = useTheme();

  const pathname  = usePathname();
  const megaRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeMega = useCallback(() => setMegaOpen(false), []);

  /* scroll */
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 16);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close mega on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) closeMega();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeMega]);

  /* focus search input when opened */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  /* lock body scroll when mobile drawer open */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  /* close everything on route change */
  useEffect(() => {
    setIsMenuOpen(false);
    closeMega();
    setSearchOpen(false);
    setQuery('');
  }, [pathname, closeMega]);

  /* quick search */
  const allSearchItems = MEGA_SECTIONS.flatMap(s => s.items);
  const suggestions = query.trim().length >= 1
    ? allSearchItems.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.desc.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <>
      <nav className={`nb-root ${isScrolled ? 'nb-scrolled' : ''}`}>

        {/* Reading progress bar */}
        <div className="nb-progress" style={{ transform: `scaleX(${scrollProgress / 100})` }} />

        <div className="nb-inner">

          {/* ── Logo ── */}
          <Link href="/" className="nb-logo" aria-label="QuranicLearn home">
            <div className="nb-logo-glow" />
            <Image src="/logo-v4.png" alt="QuranicLearn" width={110} height={110} className="nb-logo-img" priority />
            <div className="nb-logo-badge">
              <span className="nb-logo-badge-dot" />
              بسم الله
            </div>
          </Link>

          {/* ── Desktop primary links ── */}
          <div className="nb-links">
            {PRIMARY_LINKS.map(link => {
              const active = !!pathname && (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)));
              return (
                <Link key={link.href} href={link.href} className={`nb-link ${active ? 'nb-link-active' : ''}`}>
                  <span className="material-symbols-outlined nb-link-icon">{link.icon}</span>
                  <span className="nb-link-label">{link.label}</span>
                  {link.badge && (
                    <span className={`nb-badge nb-badge-${link.badge === 'Live' ? 'live' : 'new'}`}>
                      {link.badge === 'Live' && <span className="nb-badge-dot" />}
                      {link.badge}
                    </span>
                  )}
                  {active && <motion.span layoutId="nb-pill" className="nb-active-pill" />}
                </Link>
              );
            })}

            {/* ── Explore mega menu ── */}
            <div className="nb-mega-wrap" ref={megaRef}>
              <button
                className={`nb-link nb-explore-btn ${megaOpen ? 'nb-link-active' : ''}`}
                onClick={() => setMegaOpen(v => !v)}
                aria-expanded={megaOpen}
              >
                <span className="material-symbols-outlined nb-link-icon">explore</span>
                <span className="nb-link-label">Explore</span>
                <motion.span
                  className="material-symbols-outlined nb-chevron"
                  animate={{ rotate: megaOpen ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                >
                  expand_more
                </motion.span>
              </button>

              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    className="nb-mega"
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="nb-mega-accent" />

                    {/* Section tabs */}
                    <div className="nb-mega-tabs">
                      {MEGA_SECTIONS.map((section, idx) => (
                        <button
                          key={section.title}
                          className={`nb-mega-tab ${activeSection === idx ? 'nb-mega-tab-active' : ''}`}
                          onMouseEnter={() => setActiveSection(idx)}
                          onClick={() => setActiveSection(idx)}
                          style={{ '--tab-color': section.color } as React.CSSProperties}
                        >
                          <span className="material-symbols-outlined nb-mega-tab-icon">{section.icon}</span>
                          <span>{section.title}</span>
                          <span className="material-symbols-outlined nb-mega-tab-arrow">arrow_forward_ios</span>
                        </button>
                      ))}
                    </div>

                    {/* Items grid */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSection}
                        className="nb-mega-grid"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.16 }}
                      >
                        {MEGA_SECTIONS[activeSection].items.map(item => {
                          const isActive = !!pathname && (pathname === item.href || pathname.startsWith(item.href + '/'));
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`nb-mega-item ${isActive ? 'nb-mega-item-active' : ''}`}
                              onClick={closeMega}
                            >
                              <div className="nb-mega-item-icon">
                                <span className="material-symbols-outlined">{item.icon}</span>
                              </div>
                              <div className="nb-mega-item-text">
                                <span className="nb-mega-item-label">{item.label}</span>
                                <span className="nb-mega-item-desc">{item.desc}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Desktop right zone ── */}
          <div className="nb-right">

            {/* Search */}
            <div className={`nb-search-wrap ${searchOpen ? 'nb-search-open' : ''}`}>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    className="nb-search-box"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="material-symbols-outlined nb-search-glass">search</span>
                    <input
                      ref={searchRef}
                      type="text"
                      className="nb-search-input"
                      placeholder="Search pages…"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); }
                        if (e.key === 'Enter' && suggestions.length > 0) window.location.href = suggestions[0].href;
                      }}
                    />
                    {query && (
                      <button className="nb-search-clear" onClick={() => setQuery('')} aria-label="Clear">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                      </button>
                    )}
                    <AnimatePresence>
                      {suggestions.length > 0 && (
                        <motion.div
                          className="nb-suggestions"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                        >
                          {suggestions.map(s => (
                            <Link key={s.href} href={s.href} className="nb-suggestion-item"
                              onClick={() => { setSearchOpen(false); setQuery(''); }}>
                              <span className="material-symbols-outlined nb-suggestion-icon">{s.icon}</span>
                              <div>
                                <span className="nb-suggestion-label">{s.label}</span>
                                <span className="nb-suggestion-desc">{s.desc}</span>
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                className={`nb-icon-btn ${searchOpen ? 'nb-icon-btn-active' : ''}`}
                onClick={() => { setSearchOpen(v => !v); if (searchOpen) setQuery(''); }}
                aria-label="Toggle search"
              >
                <span className="material-symbols-outlined">{searchOpen ? 'close' : 'search'}</span>
              </button>
            </div>

            {/* Theme */}
            <button className="nb-icon-btn nb-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={resolvedTheme}
                  className="material-symbols-outlined"
                  initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25 }}
                >
                  {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
                </motion.span>
              </AnimatePresence>
            </button>

            <div className="nb-divider" />

            <Link href="/login"  className="nb-btn-ghost">
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>login</span>
              Login
            </Link>
            <Link href="/signup" className="nb-btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>person_add</span>
              Join Free
            </Link>
          </div>

          {/* ── Mobile controls (visible only on small screens) ── */}
          <div className="nb-mobile-controls">
            <button className="nb-icon-btn" onClick={() => setSearchOpen(v => !v)} aria-label="Search">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="nb-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <span className="material-symbols-outlined">
                {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              className={`nb-hamburger ${isMenuOpen ? 'nb-hamburger-open' : ''}`}
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span className="nb-ham-line" />
              <span className="nb-ham-line" />
              <span className="nb-ham-line" />
            </button>
          </div>
        </div>

        {/* Mobile search bar (slides out below navbar) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="nb-mobile-search"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="nb-mobile-search-inner">
                <span className="material-symbols-outlined nb-search-glass">search</span>
                <input
                  type="text"
                  className="nb-search-input"
                  placeholder="Search duas, surahs, features…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                />
                {query && (
                  <button className="nb-search-clear" onClick={() => setQuery('')}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  </button>
                )}
              </div>
              {suggestions.length > 0 && (
                <div className="nb-suggestions nb-mobile-suggestions">
                  {suggestions.map(s => (
                    <Link key={s.href} href={s.href} className="nb-suggestion-item"
                      onClick={() => { setSearchOpen(false); setQuery(''); }}>
                      <span className="material-symbols-outlined nb-suggestion-icon">{s.icon}</span>
                      <div>
                        <span className="nb-suggestion-label">{s.label}</span>
                        <span className="nb-suggestion-desc">{s.desc}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══ Mobile drawer ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="nb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              className="nb-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240, mass: 0.8 }}
            >
              {/* Header */}
              <div className="nb-drawer-header">
                <Image src="/logo-v4.png" alt="QuranicLearn" width={80} height={80} className="nb-logo-img" priority />
                <button className="nb-icon-btn" onClick={() => setIsMenuOpen(false)} aria-label="Close">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="nb-drawer-body">
                <div className="nb-drawer-section">
                  <p className="nb-drawer-label">Navigation</p>
                  {PRIMARY_LINKS.map(link => {
                    const active = !!pathname && (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`nb-drawer-link ${active ? 'nb-drawer-link-active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="material-symbols-outlined nb-drawer-link-icon">{link.icon}</span>
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className={`nb-badge nb-badge-${link.badge === 'Live' ? 'live' : 'new'} nb-badge-sm`}>
                            {link.badge === 'Live' && <span className="nb-badge-dot" />}
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="nb-drawer-divider" />

                {/* Accordion sections */}
                {MEGA_SECTIONS.map(section => (
                  <div key={section.title} className="nb-drawer-accordion">
                    <button
                      className="nb-drawer-acc-trigger"
                      onClick={() => setMobileExpanded(mobileExpanded === section.title ? null : section.title)}
                      style={{ '--acc-color': section.color } as React.CSSProperties}
                    >
                      <span className="material-symbols-outlined nb-drawer-link-icon">{section.icon}</span>
                      <span>{section.title}</span>
                      <motion.span
                        className="material-symbols-outlined nb-drawer-acc-arrow"
                        animate={{ rotate: mobileExpanded === section.title ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        expand_more
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {mobileExpanded === section.title && (
                        <motion.div
                          className="nb-drawer-acc-body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                        >
                          {section.items.map(item => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="nb-drawer-sub-link"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <span className="material-symbols-outlined nb-drawer-sub-icon">{item.icon}</span>
                              <div>
                                <span className="nb-drawer-sub-label">{item.label}</span>
                                <span className="nb-drawer-sub-desc">{item.desc}</span>
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="nb-drawer-footer">
                <Link href="/login"  className="nb-drawer-auth nb-drawer-login" onClick={() => setIsMenuOpen(false)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                  Login
                </Link>
                <Link href="/signup" className="nb-drawer-auth nb-drawer-join"  onClick={() => setIsMenuOpen(false)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
                  Join Free
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}