'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getRecentSurahs, clearRecentSurahs, RecentSurah } from '@/lib/recentSurahs';
import './GlobalSidebar.css';

// ── Nav items shared between sidebar and mobile bottom nav ──
const NAV_LINKS = [
    { icon: 'home', label: 'Home', href: '/' },
    { icon: 'menu_book', label: 'Read Quran', href: '/read-quran/1' },
    { icon: 'ads_click', label: 'Memorize', href: '/memorize-quran' },
    { icon: 'radio', label: 'Radio', href: '/radio' },
    { icon: 'music_note', label: 'Audio', href: '/audio-quran' },
    null, // divider
    { icon: 'calculate', label: 'Prayer Times', href: '/prayer-times' },
    { icon: 'star', label: 'Duas', href: '/dua' },
    { icon: 'science', label: 'Quran & Science', href: '/quran-science' },
    null, // divider
    { icon: 'login', label: 'Login', href: '/login' },
];

// Primary tabs shown in the mobile bottom nav (max 5 for comfortably tappable targets)
const MOBILE_TABS = [
    { icon: 'home', label: 'Home', href: '/' },
    { icon: 'menu_book', label: 'Quran', href: '/read-quran/1' },
    { icon: 'ads_click', label: 'Memorize', href: '/memorize-quran' },
    { icon: 'radio', label: 'Radio', href: '/radio' },
    { icon: 'calculate', label: 'Prayer', href: '/prayer-times' },
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
        p.startsWith('/read-quran/') ||
        p.startsWith('/radio/') ||
        p.startsWith('/hizb/') ||
        p.startsWith('/manzil/') ||
        p.startsWith('/juz/') ||
        p.startsWith('/surah/') ||
        p.startsWith('/ruku/') ||
        p.startsWith('/page/')
    );
}

export default function GlobalSidebar() {
    const pathname = usePathname();
    const [dark, setDark] = useState(false);
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
                                <span className="material-symbols-outlined" style={{ color: '#11d442', fontSize: 24, display: 'block' }}>
                                    auto_stories
                                </span>
                            </div>
                            <div>
                                <p className="gsb-logo-name">Learn Quran</p>
                                <p className="gsb-logo-sub">Learning Hub</p>
                            </div>
                        </Link>
                        <button
                            className="gsb-theme-btn"
                            onClick={toggleDark}
                            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                {dark ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>
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
                                    {link.label}
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
                            <div className="gsb-profile-avatar" style={{ background: 'linear-gradient(135deg,#475569,#334155)', fontSize: 16 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'white' }}>person</span>
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p className="gsb-profile-name">Browsing Anonymously</p>
                                <p className="gsb-profile-role">Guest User</p>
                            </div>
                        </div>
                        <Link
                            href="/signup"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                width: '100%', padding: '7px 0', borderRadius: 8, textDecoration: 'none',
                                background: 'linear-gradient(135deg,#11d442,#059669)',
                                color: 'white', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em',
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star</span>
                            Subscribe Now
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
