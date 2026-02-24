'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
    { icon: 'home', label: 'Home', href: '/' },
    { icon: 'menu_book', label: 'Read Quran', href: '/read-quran/1' },
    { icon: 'ads_click', label: 'Memorize', href: '/memorize-quran' },
    { icon: 'radio', label: 'Quran Radio', href: '/radio' },
    { icon: 'music_note', label: 'Audio Quran', href: '/audio-quran' },
    null, // divider
    { icon: 'calculate', label: 'Prayer Times', href: '/prayer-times' },
    { icon: 'star', label: 'Duas', href: '/dua' },
    { icon: 'science', label: 'Quran & Science', href: '/quran-science' },
    null, // divider
    { icon: 'login', label: 'Login', href: '/login' },
];


export default function GlobalSidebar() {
    const pathname = usePathname();
    const [dark, setDark] = useState(false);
    const [recent, setRecent] = useState<{ num: number; name: string }[]>([]);

    useEffect(() => {
        setDark(document.documentElement.classList.contains('dark'));
        const saved = localStorage.getItem('recentSurahs');
        if (saved) {
            try { setRecent(JSON.parse(saved).slice(0, 5)); } catch { }
        }
        // Keep dark state in sync with external toggles
        const obs = new MutationObserver(() =>
            setDark(document.documentElement.classList.contains('dark'))
        );
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    const p = pathname ?? '';
    // Hide on full-screen pages
    const isExcluded =
        p.startsWith('/read-quran/') ||
        p.startsWith('/radio/') ||
        p.startsWith('/hizb/') ||
        p.startsWith('/manzil/') ||
        p.startsWith('/juz/') ||
        p.startsWith('/surah/') ||
        p.startsWith('/ruku/') ||
        p.startsWith('/page/');

    if (isExcluded) return null;

    const toggleDark = () => {
        const html = document.documentElement;
        const next = !dark;
        next ? html.classList.add('dark') : html.classList.remove('dark');
        setDark(next);
    };

    const isActive = (href: string) => {
        if (href === '/') return p === '/';
        return p.startsWith(href.split('?')[0]);
    };

    return (
        <>
            <style>{`
        .gsb-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          text-decoration: none; font-weight: 500; font-size: 13.5px;
          color: #64748b; transition: background 0.15s, color 0.15s;
          margin: 1px 0;
        }
        .gsb-link:hover { background: rgba(17,212,66,0.08); color: #11d442; }
        .gsb-link.active { background: rgba(17,212,66,0.12); color: #11d442; font-weight: 600; }
        .dark .gsb-link { color: #94a3b8; }
        .dark .gsb-link:hover { background: rgba(17,212,66,0.08); color: #11d442; }
        .dark .gsb-link.active { background: rgba(17,212,66,0.14); color: #11d442; }
        .gsb-root::-webkit-scrollbar { width: 4px; }
        .gsb-root::-webkit-scrollbar-thumb { background: rgba(17,212,66,0.2); border-radius: 2px; }
        .gsb-root::-webkit-scrollbar-track { background: transparent; }
      `}</style>

            <aside
                className="gsb-root"
                style={{
                    width: 240,
                    flexShrink: 0,
                    background: dark ? '#111f16' : 'white',
                    borderRight: `1px solid ${dark ? '#1e3a2a' : '#e2e8f0'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px 0',
                    overflowY: 'auto',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    zIndex: 40,
                }}
            >
                <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Logo + dark toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <div style={{ background: 'rgba(17,212,66,0.15)', borderRadius: 10, padding: 7 }}>
                                <span className="material-symbols-outlined" style={{ color: '#11d442', fontSize: 24, display: 'block' }}>auto_stories</span>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, lineHeight: 1, color: dark ? '#e2e8e5' : '#0f172a' }}>Learn Quran</p>
                                <p style={{ margin: 0, color: '#11d442', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Learning Hub</p>
                            </div>
                        </Link>
                        <button
                            onClick={toggleDark}
                            style={{ background: dark ? '#1e3a2a' : '#f1f5f9', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', color: dark ? '#11d442' : '#64748b' }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{dark ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                    </div>

                    {/* Nav */}
                    <nav style={{ display: 'flex', flexDirection: 'column' }}>
                        {NAV_LINKS.map((link, i) =>
                            link === null ? (
                                <div key={`div-${i}`} style={{ margin: '8px 0', borderTop: `1px solid ${dark ? '#1e3a2a' : '#f1f5f9'}` }} />
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`gsb-link${isActive(link.href) ? ' active' : ''}`}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{link.icon}</span>
                                    {link.label}
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Recently Visited */}
                    {recent.length > 0 && (
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#11d442', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 4px' }}>
                                Recently Visited
                            </p>
                            {recent.map(s => (
                                <Link
                                    key={s.num}
                                    href={`/read-quran/${s.num}`}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = dark ? '#1e3a2a' : '#f8fafc'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                >
                                    <span style={{ width: 26, height: 26, background: 'rgba(17,212,66,0.12)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#11d442', flexShrink: 0 }}>
                                        {s.num}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: dark ? '#e2e8e5' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div style={{ padding: '12px 12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, background: dark ? '#1e3a2a' : '#f8fafc', border: `1px solid ${dark ? '#2d4f38' : '#e2e8f0'}` }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#11d442,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>A</div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: dark ? '#e2e8e5' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ahmed Khalid</p>
                            <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>Premium Member</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
