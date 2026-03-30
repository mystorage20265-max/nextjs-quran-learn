'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getRecentSurahs, clearRecentSurahs, RecentSurah } from '@/lib/recentSurahs';
import './GlobalSidebar.css';

// ── Nav items shared between sidebar and mobile bottom nav ──
const NAV_LINKS: (null | { icon: string; label: string; sub?: string; href: string })[] = [
    // ── Main ──
    { icon: 'dashboard', label: 'Dashboard', sub: 'Overview & stats', href: '/' },
    { icon: 'menu_book', label: 'Read Quran', sub: '114 Surahs', href: '/read-quran/1' },
    { icon: 'headphones', label: 'Quran Player', sub: 'Listen & recite', href: '/quran-player' },
    null, // divider
    // ── Learn ──
    { icon: 'psychology', label: 'Memorize', sub: 'Hifz program', href: '/memorize-quran' },
    { icon: 'book_2', label: 'Tafseer', sub: 'Verse explanations', href: '/tafseer' },
    null, // divider
    // ── Explore ──
    { icon: 'volunteer_activism', label: 'Duas', sub: 'Daily supplications', href: '/dua' },
    { icon: 'format_quote', label: 'Hadees', sub: "Prophet's sayings ﷺ", href: '/hadees' },
    null, // divider
    // ── Account ──
    { icon: 'login', label: 'Sign In', sub: 'Sync your progress', href: '/login' },
];

// Primary tabs shown in the mobile bottom nav (max 5 for comfortably tappable targets)
const MOBILE_TABS = [
    { icon: 'dashboard', label: 'Home', href: '/' },
    { icon: 'menu_book', label: 'Quran', href: '/read-quran/1' },
    { icon: 'psychology', label: 'Memorize', href: '/memorize-quran' },
    { icon: 'headphones', label: 'Player', href: '/quran-player' },
    { icon: 'volunteer_activism', label: 'Duas', href: '/dua' },
];

/** Human-readable relative time label */
function relativeTime(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/** Pages where neither sidebar nor mobile nav should appear */
function useIsExcluded(pathname: string): boolean {
    const p = pathname ?? '';
    return (
        p.startsWith('/radio/') ||
        p.startsWith('/hizb/') ||
        p.startsWith('/manzil/') ||
        p.startsWith('/juz/') ||
        p.startsWith('/surah/') ||
        p.startsWith('/ruku/')
    );
}

export default function GlobalSidebar() {
    const pathname = usePathname();
    const [dark, setDark] = useState(false);
    const [colorTheme, setColorTheme] = useState<'green' | 'amber'>('green');
    const [recent, setRecent] = useState<RecentSurah[]>([]);

    const loadRecent = () => setRecent(getRecentSurahs());

    useEffect(() => {
        loadRecent();

        // Sync dark mode state
        setDark(document.documentElement.classList.contains('dark'));
        const darkObs = new MutationObserver(() =>
            setDark(document.documentElement.classList.contains('dark'))
        );
        darkObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Sync color theme state
        const storedTheme = localStorage.getItem('color-theme') as 'green' | 'amber' | null;
        if (storedTheme) {
            setColorTheme(storedTheme);
            document.documentElement.setAttribute('data-color-theme', storedTheme);
        } else {
            document.documentElement.setAttribute('data-color-theme', 'green');
        }

        // Same-tab recent updates
        window.addEventListener('recentSurahsUpdated', loadRecent);
        // Cross-tab recent updates
        window.addEventListener('storage', loadRecent);

        return () => {
            darkObs.disconnect();
            window.removeEventListener('recentSurahsUpdated', loadRecent);
            window.removeEventListener('storage', loadRecent);
        };
    }, []);

    const isExcluded = useIsExcluded(pathname ?? '');
    if (isExcluded) return null;

    const toggleDark = () => {
        const html = document.documentElement;
        const next = !dark;
        next ? html.classList.add('dark') : html.classList.remove('dark');
        setDark(next);
    };

    const toggleColorTheme = (e: React.MouseEvent) => {
        e.preventDefault();
        const nextTheme = colorTheme === 'green' ? 'amber' : 'green';
        setColorTheme(nextTheme);
        document.documentElement.setAttribute('data-color-theme', nextTheme);
        localStorage.setItem('color-theme', nextTheme);
    };

    const isActive = (href: string) => {
        const p = pathname ?? '';
        if (href === '/') return p === '/';
        return p.startsWith(href.split('?')[0]);
    };

    return (
        <>
            {/* ════════════════════════════════════════
                DESKTOP / TABLET SIDEBAR  (≥ 768px)
                Visibility controlled by globals.css
                .gsb-root { display: none }
                @media (min-width: 768px) { display: flex }
                ════════════════════════════════════════ */}
            <aside className="gsb-root" aria-label="Main navigation sidebar">
                <div className="gsb-inner">
                    {/* Logo + dark toggle */}
                    <div className="gsb-logo-row">
                        <Link href="/" className="gsb-logo-link" aria-label="Go to homepage">
                            <div className="gsb-logo-icon">
                                <span className="material-symbols-outlined" style={{ color: 'var(--brand-primary)', fontSize: 24, display: 'block' }}>
                                    auto_stories
                                </span>
                            </div>
                            <div>
                                <p className="gsb-logo-name">Learn Quran</p>
                                <p className="gsb-logo-sub">Learning Hub</p>
                            </div>
                        </Link>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                className="gsb-theme-btn"
                                onClick={toggleColorTheme}
                                title={colorTheme === 'green' ? 'Switch to Amber theme' : 'Switch to Green theme'}
                                aria-label="Toggle Color Theme"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--brand-primary)' }}>
                                    palette
                                </span>
                            </button>
                            <button
                                className="gsb-theme-btn"
                                onClick={(e) => { e.preventDefault(); toggleDark(); }}
                                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                                title="Toggle Dark Mode"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                    {dark ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Nav links */}
                    <nav className="gsb-nav" aria-label="Sidebar navigation">
                        {NAV_LINKS.map((link, i) =>
                            link === null ? (
                                <hr key={`div-${i}`} className="gsb-divider" />
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`gsb-link${isActive(link.href) ? ' active' : ''}`}
                                    aria-current={isActive(link.href) ? 'page' : undefined}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                                        {link.icon}
                                    </span>
                                    <div className="gsb-link-text">
                                        <span className="gsb-link-label">{link.label}</span>
                                        {link.sub && <span className="gsb-link-sub">{link.sub}</span>}
                                    </div>
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Recently Visited — sidebar only */}
                    {recent.length > 0 && (
                        <div className="gsb-recent-section">
                            <div className="gsb-recent-header">
                                <p className="gsb-recent-label">
                                    <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>
                                        history
                                    </span>
                                    Recently Visited
                                </p>
                                <button
                                    className="gsb-clear-btn"
                                    onClick={clearRecentSurahs}
                                    aria-label="Clear recently visited history"
                                    title="Clear history"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete_sweep</span>
                                    Clear
                                </button>
                            </div>
                            {recent.map(s => (
                                <Link
                                    key={s.num}
                                    href={`/read-quran/${s.num}`}
                                    className="gsb-recent-link"
                                    title={`${s.name} — ${relativeTime(s.timestamp)}`}
                                >
                                    <span className="gsb-recent-num">{s.num}</span>
                                    <div className="gsb-recent-info">
                                        <span className="gsb-recent-name">{s.name}</span>
                                        {s.ar && <span className="gsb-recent-ar">{s.ar}</span>}
                                    </div>
                                    <span className="gsb-recent-time">{relativeTime(s.timestamp)}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="gsb-profile-wrap">
                    <div className="gsb-profile-card" style={{ flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="gsb-profile-avatar" style={{ background: 'linear-gradient(135deg,var(--brand-primary),var(--brand-primary-hover))', fontSize: 16 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'white' }}>person</span>
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p className="gsb-profile-name">Assalamu Alaikum</p>
                                <p className="gsb-profile-role">Sign in to save progress</p>
                            </div>
                        </div>
                        <Link
                            href="/signup"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                width: '100%', padding: '7px 0', borderRadius: 8, textDecoration: 'none',
                                background: 'linear-gradient(135deg,var(--brand-primary),var(--brand-primary-hover))',
                                color: 'white', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em',
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_add</span>
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </aside>

            {/* ════════════════════════════════════════
                MOBILE BOTTOM NAV  (< 768px)
                Visibility controlled by globals.css
                .gsb-mobile-nav { display: flex }
                @media (min-width: 768px) { display: none }
                ════════════════════════════════════════ */}
            <nav
                className="gsb-mobile-nav"
                aria-label="Mobile bottom navigation"
            >
                {MOBILE_TABS.map(tab => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`gsb-mob-item${isActive(tab.href) ? ' active' : ''}`}
                        aria-current={isActive(tab.href) ? 'page' : undefined}
                        aria-label={tab.label}
                    >
                        <span className="gsb-mob-icon">
                            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                                {tab.icon}
                            </span>
                        </span>
                        <span>{tab.label}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
}
