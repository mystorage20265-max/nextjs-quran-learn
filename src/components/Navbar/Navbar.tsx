'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import './Navbar.css';

/* ─── Nav data ─────────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: 'Quran',
    icon: 'auto_stories',
    items: [
      { href: '/read-quran',        label: 'Read Quran',      icon: 'menu_book',          desc: 'Full Arabic text'       },
      { href: '/audio-quran',       label: 'Audio Quran',     icon: 'headphones',         desc: 'Stream recitations'     },
      { href: '/full-surah-reader', label: 'Surah Reader',    icon: 'chrome_reader_mode', desc: 'Immersive reading'      },
      { href: '/read-quran/1?mode=word-by-word', label: 'Word by Word', icon: 'text_fields', desc: 'Every word explained' },
      { href: '/tafseer',           label: 'Tafseer',         icon: 'lightbulb',          desc: 'Classical commentary'   },
    ],
  },
  {
    label: 'Learn & Memorize',
    icon: 'school',
    items: [
      { href: '/learn-quran',    label: 'Learn Quran',  icon: 'school',      desc: 'Structured lessons'  },
      { href: '/memorize-quran', label: 'Hifz Program', icon: 'psychology',  desc: 'Smart memorization'  },
      { href: '/courses',        label: 'Courses',      icon: 'class',       desc: 'Topic-based learning' },
    ],
  },
  {
    label: 'Spirituality',
    icon: 'mosque',
    items: [
      { href: '/dua',    label: 'Duas',   icon: 'volunteer_activism', desc: 'Supplications'      },
      { href: '/hadees', label: 'Hadith', icon: 'history_edu',        desc: "Prophet's sayings"  },
    ],
  },
  {
    label: 'Tools',
    icon: 'tune',
    items: [
      { href: '/radio',        label: 'Quran Radio',  icon: 'radio',       desc: 'Live channels'         },
      { href: '/quran-player', label: 'Quran Player', icon: 'play_circle', desc: 'Full-featured player'  },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

/* ─── Component ─────────────────────────────────────────────── */
export default function Navbar() {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState('');
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname    = usePathname();
  const searchRef   = useRef<HTMLInputElement>(null);
  const { resolvedTheme, toggleTheme } = useTheme();

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* body scroll lock */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* close on route change */
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setQuery('');
  }, [pathname]);

  /* focus search */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  const suggestions = query.trim().length >= 1
    ? ALL_ITEMS.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.desc.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <nav className={`qcnav ${isScrolled ? 'qcnav--scrolled' : ''}`} data-global-navbar>

        <div className="qcnav__inner">

          {/* Logo */}
          <Link href="/" className="qcnav__logo" aria-label="Learn Quran App home">
            <span className="qcnav__logo-text">Learn Quran App</span>
          </Link>

          {/* Right controls */}
          <div className="qcnav__controls">

            {/* Search */}
            <div className={`qcnav__search-wrap ${searchOpen ? 'qcnav__search-wrap--open' : ''}`}>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    className="qcnav__search-box"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="material-symbols-outlined qcnav__search-glass">search</span>
                    <input
                      ref={searchRef}
                      type="text"
                      className="qcnav__search-input"
                      placeholder="Search pages…"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); }
                        if (e.key === 'Enter' && suggestions.length > 0) window.location.href = suggestions[0].href;
                      }}
                    />
                    {query && (
                      <button className="qcnav__search-clear" onClick={() => setQuery('')} aria-label="Clear">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                      </button>
                    )}
                    <AnimatePresence>
                      {suggestions.length > 0 && (
                        <motion.div
                          className="qcnav__suggestions"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                        >
                          {suggestions.map(s => (
                            <Link
                              key={s.href}
                              href={s.href}
                              className="qcnav__suggestion"
                              onClick={() => { setSearchOpen(false); setQuery(''); }}
                            >
                              <span className="material-symbols-outlined qcnav__suggestion-icon">{s.icon}</span>
                              <div>
                                <span className="qcnav__suggestion-label">{s.label}</span>
                                <span className="qcnav__suggestion-desc">{s.desc}</span>
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
                className={`qcnav__ctrl-btn ${searchOpen ? 'qcnav__ctrl-btn--active' : ''}`}
                onClick={() => { setSearchOpen(v => !v); if (searchOpen) setQuery(''); }}
                aria-label="Search"
              >
                <span className="material-symbols-outlined qcnav__ctrl-btn-icon">search</span>
                <span className="qcnav__ctrl-btn-label">Search</span>
              </button>
            </div>

            {/* Theme */}
            <button className="qcnav__ctrl-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={resolvedTheme}
                  className="material-symbols-outlined qcnav__ctrl-btn-icon"
                  initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22 }}
                >
                  {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
                </motion.span>
              </AnimatePresence>
              <span className="qcnav__ctrl-btn-label">
                {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Menu */}
            <button
              className={`qcnav__ctrl-btn qcnav__menu-btn ${menuOpen ? 'qcnav__ctrl-btn--active' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className="material-symbols-outlined qcnav__ctrl-btn-icon">
                {menuOpen ? 'close' : 'menu'}
              </span>
              <span className="qcnav__ctrl-btn-label">{menuOpen ? 'Close' : 'Menu'}</span>
            </button>

          </div>
        </div>
      </nav>

      {/* ── Menu panel ──────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="qcnav__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              className="qcnav__panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220, mass: 0.85 }}
            >
              {/* Panel header */}
              <div className="qcnav__panel-header">
                <span className="qcnav__logo-text">Learn Quran App</span>
                <button className="qcnav__close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Sections */}
              <div className="qcnav__panel-body">
                {NAV_SECTIONS.map(section => (
                  <div key={section.label} className="qcnav__section">
                    {/* Section toggle */}
                    <button
                      className={`qcnav__section-toggle ${expanded === section.label ? 'qcnav__section-toggle--open' : ''}`}
                      onClick={() => setExpanded(expanded === section.label ? null : section.label)}
                    >
                      <span className="material-symbols-outlined qcnav__section-icon">{section.icon}</span>
                      <span className="qcnav__section-label">{section.label}</span>
                      <motion.span
                        className="material-symbols-outlined qcnav__section-arrow"
                        animate={{ rotate: expanded === section.label ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        expand_more
                      </motion.span>
                    </button>

                    {/* Section items */}
                    <AnimatePresence initial={false}>
                      {expanded === section.label && (
                        <motion.div
                          className="qcnav__section-items"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                        >
                          {section.items.map(item => {
                            const active = !!pathname && (pathname === item.href || pathname.startsWith(item.href + '/'));
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`qcnav__item ${active ? 'qcnav__item--active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                              >
                                <span className="material-symbols-outlined qcnav__item-icon">{item.icon}</span>
                                <div className="qcnav__item-text">
                                  <span className="qcnav__item-label">{item.label}</span>
                                  <span className="qcnav__item-desc">{item.desc}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Panel footer */}
              <div className="qcnav__panel-footer">
                <Link href="/login"  className="qcnav__auth-btn qcnav__auth-btn--ghost" onClick={() => setMenuOpen(false)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                  Login
                </Link>
                <Link href="/signup" className="qcnav__auth-btn qcnav__auth-btn--primary" onClick={() => setMenuOpen(false)}>
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
