'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import './video-gallery.css';

// ── Types ──
interface Playlist {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    videoCount: number;
    publishedAt: string;
}

interface ChannelInfo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    subscriberCount: string;
}

type SortMode = 'a-z' | 'newest' | 'most-videos';

// ── Helpers ──
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
}

export default function VideoGalleryPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [channel, setChannel] = useState<ChannelInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sort, setSort] = useState<SortMode>('newest');
    const [search, setSearch] = useState('');

    // ── Fetch ──
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('/api/youtube-playlists?channelId=UCNdUFOtzSx3FS71pHkQLxhQ');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                if (cancelled) return;
                setPlaylists(data.playlists || []);
                setChannel(data.channel || null);
            } catch {
                if (!cancelled) setError('Failed to load videos. Please refresh.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    // ── Sort & Filter ──
    const displayed = useMemo(() => {
        let list = [...playlists];

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
            );
        }

        // Sort
        switch (sort) {
            case 'a-z':
                list.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'newest':
                list.sort(
                    (a, b) =>
                        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
                );
                break;
            case 'most-videos':
                list.sort((a, b) => b.videoCount - a.videoCount);
                break;
        }

        return list;
    }, [playlists, sort, search]);

    return (
        <div className="vg-root">
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 48px' }}>
                {/* ── Breadcrumb ── */}
                <nav className="vg-breadcrumb">
                    <Link href="/">Home</Link>
                    <span className="vg-breadcrumb-sep">›</span>
                    <span style={{ color: 'var(--vg-text)', fontWeight: 600 }}>Video Gallery</span>
                </nav>

                {/* ── Channel Header ── */}
                <div className="vg-channel-header">
                    <div className="vg-channel-inner">
                        {channel?.thumbnail && (
                            <img
                                src={channel.thumbnail}
                                alt={channel.title}
                                className="vg-channel-avatar"
                            />
                        )}
                        <div className="vg-channel-info">
                            <h1 className="vg-channel-name">
                                {loading ? 'Loading...' : channel?.title || 'Video Gallery'}
                            </h1>
                            <div className="vg-channel-meta">
                                {channel?.subscriberCount && (
                                    <span className="vg-sub-badge">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                            group
                                        </span>
                                        {channel.subscriberCount} Subscribers
                                    </span>
                                )}
                                <span>{playlists.length} Playlists</span>
                            </div>
                            {channel?.description && (
                                <p className="vg-channel-desc">{channel.description}</p>
                            )}
                        </div>
                    </div>
                    {/* Decorative icon */}
                    <span
                        className="material-symbols-outlined"
                        style={{
                            position: 'absolute',
                            top: -10,
                            right: -20,
                            fontSize: 120,
                            color: 'white',
                            opacity: 0.06,
                            lineHeight: 1,
                            pointerEvents: 'none',
                        }}
                    >
                        play_circle
                    </span>
                </div>

                {/* ── Toolbar ── */}
                <div className="vg-toolbar">
                    <div className="vg-sort-group">
                        {([
                            { key: 'a-z', label: 'A–Z', icon: 'sort_by_alpha' },
                            { key: 'newest', label: 'Newest', icon: 'schedule' },
                            { key: 'most-videos', label: 'Most Videos', icon: 'video_library' },
                        ] as { key: SortMode; label: string; icon: string }[]).map((s) => (
                            <button
                                key={s.key}
                                className={`vg-sort-btn${sort === s.key ? ' active' : ''}`}
                                onClick={() => setSort(s.key)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                    {s.icon}
                                </span>
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="vg-search-wrap">
                        <span className="material-symbols-outlined vg-search-icon">search</span>
                        <input
                            type="text"
                            className="vg-search-input"
                            placeholder="Search playlists…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── Results count ── */}
                {!loading && (
                    <p className="vg-result-count" style={{ marginBottom: 16 }}>
                        Showing <strong style={{ color: '#f59e0b' }}>{displayed.length}</strong> playlists
                        {search.trim() && (
                            <>
                                {' '}for &ldquo;<span style={{ color: '#f59e0b' }}>{search}</span>&rdquo;
                            </>
                        )}
                    </p>
                )}

                {/* ── Error ── */}
                {error && (
                    <div
                        style={{
                            padding: '14px 18px',
                            marginBottom: 20,
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 12,
                            color: '#ef4444',
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            error
                        </span>
                        {error}
                    </div>
                )}

                {/* ── Grid ── */}
                {loading ? (
                    <div className="vg-grid">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="vg-skeleton-card">
                                <div className="vg-skeleton-thumb" style={{ animationDelay: `${i * 0.1}s` }} />
                                <div className="vg-skeleton-body">
                                    <div className="vg-skeleton-line w70" style={{ animationDelay: `${i * 0.1 + 0.1}s` }} />
                                    <div className="vg-skeleton-line w50" style={{ animationDelay: `${i * 0.1 + 0.2}s` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="vg-empty">
                        <div className="vg-empty-icon">
                            <span className="material-symbols-outlined" style={{ fontSize: 48 }}>
                                video_library
                            </span>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--vg-text)', marginBottom: 4 }}>
                            No playlists found
                        </p>
                        <p style={{ fontSize: 13 }}>
                            {search.trim()
                                ? 'Try a different search term.'
                                : 'No video playlists are available right now.'}
                        </p>
                    </div>
                ) : (
                    <div className="vg-grid">
                        {displayed.map((playlist) => (
                            <a
                                key={playlist.id}
                                href={`https://www.youtube.com/playlist?list=${playlist.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vg-card"
                            >
                                {/* Thumbnail */}
                                <div className="vg-thumb">
                                    <img
                                        src={playlist.thumbnail}
                                        alt={playlist.title}
                                        className="vg-thumb-img"
                                        loading="lazy"
                                    />
                                    {/* Video count badge */}
                                    <div className="vg-count-badge">
                                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                                            playlist_play
                                        </span>
                                        {playlist.videoCount} videos
                                    </div>
                                    {/* Play overlay */}
                                    <div className="vg-play-overlay">
                                        <div className="vg-play-icon">
                                            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                                                play_arrow
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Body */}
                                <div className="vg-card-body">
                                    <h3 className="vg-card-title">{playlist.title}</h3>
                                    <div className="vg-card-meta">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                            schedule
                                        </span>
                                        Last video · {timeAgo(playlist.publishedAt)}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
