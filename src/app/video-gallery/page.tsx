'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import './video-gallery.css';
import GlobalLoader from '@/components/Loader/GlobalLoader';

import {
    VideoItem, LiveChannel,
    HERO_CATEGORIES, HERO_PANELS,
    POPULAR_RECITATIONS, ISLAMIC_LECTURES,
    KIDS_CONTENT, LIVE_CHANNELS,
    PROPHET_STORIES, ENGLISH_LECTURES,
    URDU_LECTURES, FEATURED_RECITERS,
    FEATURED_SCHOLARS, KNOWLEDGE_TRACKS
} from './videoData';
import { YouTubeModal } from './components/YouTubeModal';

/* ================================================================
   CAROUSEL COMPONENT
   ================================================================ */

function Carousel({ children, id }: { children: React.ReactNode; id: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth * 0.75;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }, []);

    return (
        <div className="vg-carousel-container">
            <button
                className="vg-carousel-arrow left"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
            >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>chevron_left</span>
            </button>
            <div className="vg-carousel" ref={scrollRef} id={id}>
                {children}
            </div>
            <button
                className="vg-carousel-arrow right"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
            >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>chevron_right</span>
            </button>
        </div>
    );
}

/* ================================================================
   POSTER CARD COMPONENT
   ================================================================ */

function PosterCard({ item, onPlay }: { item: VideoItem; onPlay?: (id: string, title: string) => void }) {
    const [hovered, setHovered] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const popupWidth = 320;

    const calcPosition = useCallback(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Center popup horizontally on the card
        let left = rect.left + rect.width / 2 - popupWidth / 2;
        // Clamp to viewport edges with 12px margin
        if (left < 12) left = 12;
        if (left + popupWidth > vw - 12) left = vw - popupWidth - 12;
        // Position above the card, or below if not enough room
        let top = rect.top - 10;
        // If popup would go above viewport, position it below the card
        if (top < 60) top = rect.bottom + 10;
        setPopupPos({ top, left });
    }, []);

    const showPopup = useCallback(() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
            calcPosition();
            setHovered(true);
            requestAnimationFrame(() => setPopupVisible(true));
        }, 400);
    }, [calcPosition]);

    const hidePopup = useCallback(() => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setPopupVisible(false);
        hideTimerRef.current = setTimeout(() => setHovered(false), 250);
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, []);

    // Dismiss popup on scroll so it doesn't float away from the card
    useEffect(() => {
        if (!hovered) return;
        const onScroll = () => {
            setPopupVisible(false);
            setHovered(false);
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
        window.addEventListener('scroll', onScroll, { passive: true, capture: true });
        return () => window.removeEventListener('scroll', onScroll, true);
    }, [hovered]);

    return (
        <div
            className="vg-card"
            ref={cardRef}
            onMouseEnter={showPopup}
            onMouseLeave={hidePopup}
            onClick={() => { if (item.id && onPlay) onPlay(item.id, item.title); }}
        >
            <div className="vg-card-poster">
                <img src={item.poster} alt={item.title} loading="lazy" />
                <div className="vg-play-overlay">
                    <div className="vg-play-btn">
                        <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                </div>
                {item.badge && (
                    <span className={`vg-card-badge ${item.badgeType === 'new' ? 'new' : ''}`}>
                        {item.badge}
                    </span>
                )}
            </div>
            <p className="vg-card-title">{item.title}</p>
            {item.subtitle && <p className="vg-card-sub">{item.subtitle}</p>}

            {/* Hover Popup – rendered as portal to body with fixed positioning */}
            {hovered && popupPos && typeof document !== 'undefined' && createPortal(
                <div
                    className={`vg-hover-popup ${popupVisible ? 'visible' : ''}`}
                    style={{ top: popupPos.top, left: popupPos.left }}
                    onMouseEnter={showPopup}
                    onMouseLeave={hidePopup}
                >
                    <div className="vg-hover-popup-poster">
                        <img src={item.poster} alt={item.title} />
                    </div>
                    <div className="vg-hover-popup-body">
                        <div className="vg-hover-popup-header">
                            <h3 className="vg-hover-popup-title">{item.title}</h3>
                            <button className="vg-hover-popup-play" onClick={(e) => { e.stopPropagation(); if (item.id && onPlay) onPlay(item.id, item.title); }}>
                                <span className="material-symbols-outlined">play_arrow</span>
                            </button>
                        </div>
                        <p className="vg-hover-popup-meta">
                            {item.year && <span>{item.year}</span>}
                            {item.genre && <><span className="dot">|</span> <span>{item.genre}</span></>}
                            {item.episodes && <><span className="dot">|</span> <span>{item.episodes} Episodes</span></>}
                        </p>
                        {item.description && (
                            <p className="vg-hover-popup-desc">{item.description}</p>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

/* ================================================================
   LANDSCAPE CARD COMPONENT (Live TV)
   ================================================================ */

function LandscapeCard({ channel, onPlay }: { channel: LiveChannel; onPlay?: () => void }) {
    return (
        <div className="vg-card-landscape" onClick={onPlay}>
            <div className="vg-card-landscape-poster">
                <img src={channel.poster} alt={channel.title} loading="lazy" />
                <div className="vg-play-overlay">
                    <div className="vg-play-btn">
                        <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                </div>
                {channel.isLive && <span className="live-badge">LIVE</span>}
                <div className="channel-logo">{channel.channelTag}</div>
                <div className="vg-card-landscape-title">{channel.title}</div>
            </div>
        </div>
    );
}

/* ================================================================
   YOUTUBE PLAYER MODAL
   ================================================================ */


/* ================================================================
   SKELETON LOADER CARDS
   ================================================================ */

function SkeletonPosterCard() {
    return (
        <div className="vg-card" style={{ pointerEvents: 'none' }}>
            <div className="vg-skeleton" style={{ width: '100%', aspectRatio: '2/3' }} />
            <div className="vg-skeleton" style={{ width: '80%', height: 14, marginTop: 10 }} />
            <div className="vg-skeleton" style={{ width: '60%', height: 10, marginTop: 6 }} />
        </div>
    );
}

function SkeletonLandscapeCard() {
    return (
        <div className="vg-card-landscape" style={{ pointerEvents: 'none' }}>
            <div className="vg-skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
        </div>
    );
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function VideoGalleryPage() {
    const [loading, setLoading] = useState(true);
    const [activeHeroCat, setActiveHeroCat] = useState(0);
    const [showBackTop, setShowBackTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeYouTube, setActiveYouTube] = useState<{ id: string; title: string } | null>(null);
    const [activeTrack, setActiveTrack] = useState(0);


    // Controlled loading duration to ensure smooth font loading and premium entry
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Back to top visibility
    useEffect(() => {
        const handleScroll = () => {
            setShowBackTop(window.scrollY > 600);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const reciterScrollRef = useRef<HTMLDivElement>(null);
    const scholarScrollRef = useRef<HTMLDivElement>(null);

    const scrollRow = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
        if (!ref.current) return;
        const amt = ref.current.clientWidth * 0.8;
        ref.current.scrollBy({ left: dir === 'left' ? -amt : amt, behavior: 'smooth' });
    };

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const yOffset = -80; // Account for sticky nav
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Fine-tune with offset if needed
            window.scrollBy(0, yOffset);
        }
    };

    const handleHeroCatClick = (idx: number) => {
        setActiveHeroCat(idx);
        const sectionIds = ['popular-recitations', 'english-lectures', 'urdu-lectures', 'live-channels'];
        const targetId = sectionIds[idx];
        if (targetId) {
            const el = document.getElementById(targetId);
            if (el) {
                const yOffset = -100;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

    const filterData = <T extends { title?: string; name?: string }>(data: T[]) => {
        if (!searchQuery.trim()) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(item => 
            (item.title?.toLowerCase().includes(q)) || (item.name?.toLowerCase().includes(q))
        );
    };

    const playVideo = (id: string, title: string) => {
        // Find if it has a youtubeId, otherwise use a default or the id itself as mock
        const allItems = [...POPULAR_RECITATIONS, ...ISLAMIC_LECTURES, ...PROPHET_STORIES, ...KIDS_CONTENT, ...ENGLISH_LECTURES, ...URDU_LECTURES, ...FEATURED_RECITERS, ...FEATURED_SCHOLARS];
        const item = (allItems as any[]).find(x => x.id === id);
        const yId = item?.youtubeId || 'Cm1v4bteXbI'; // Mock Makkah Live if missing
        setActiveYouTube({ id: yId, title });
    };

    const activeHeroPanel = HERO_PANELS[Math.min(activeHeroCat, HERO_PANELS.length - 1)];

    // ── PERFORMANCE: Warm up YouTube handshake ──
    useEffect(() => {
        // Pre-connect to common YT domains
        const domains = ['https://www.youtube-nocookie.com', 'https://i.ytimg.com', 'https://googleads.g.doubleclick.net'];
        domains.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            document.head.appendChild(link);
        });
    }, []);

    return (
        <div className="vg-page">
            {/* Standardized Premium Loader is now handled by ClientWrapper */}

            {/* ── Sticky Navigation ── */}
            <nav className="vg-nav">
                <Link href="/" className="vg-nav-logo">
                    Q<span className="plus">+</span>
                </Link>

                <div className="vg-nav-links">
                    <Link href="/read-quran/1" className="vg-nav-link">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>menu_book</span>
                        Read
                    </Link>
                    <Link href="/audio-quran" className="vg-nav-link">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>headphones</span>
                        Audio
                    </Link>
                    <button className="vg-nav-link active">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>videocam</span>
                        Video
                    </button>
                    <Link href="/tafseer" className="vg-nav-link">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_stories</span>
                        Tafseer
                    </Link>
                    <Link href="/radio" className="vg-nav-link">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>radio</span>
                        Radio
                    </Link>
                    <Link href="/dua" className="vg-nav-link">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>volunteer_activism</span>
                        Duas
                    </Link>
                </div>

                <div className="vg-nav-search">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input
                        type="text"
                        placeholder="Search videos, lectures, reciters…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Link href="/" className="vg-nav-cta">
                    Home
                </Link>
            </nav>

            {/* ── Breadcrumb ── */}
            <div className="vg-breadcrumb vg-animate-in">
                <Link href="/">Home</Link>
                <span>›</span>
                <span className="current">Video Gallery</span>
            </div>

            {/* ── Hero Section ── */}
            <section className="vg-hero">
                <div className="vg-hero-content">
                    <h1 className="vg-hero-title vg-animate-in">
                        Learn<span className="accent">Quran</span>
                        <span style={{ fontSize: 28, verticalAlign: 'super', color: 'var(--vg-accent)' }}>+</span>
                    </h1>
                    <div className="vg-hero-categories vg-animate-in vg-animate-in-delay-2">
                        {HERO_CATEGORIES.map((cat, i) => (
                            <button
                                key={cat}
                                className={`vg-hero-cat ${activeHeroCat === i ? 'active' : ''}`}
                                onClick={() => handleHeroCatClick(i)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="vg-hero-panels" style={{ perspective: '1000px' }}>
                    <div className="vg-hero-panel" style={{ flex: 1.6, transformStyle: 'preserve-3d' }}>
                        <img 
                            src={activeHeroPanel.img} 
                            alt={activeHeroPanel.label} 
                            style={{ 
                                filter: 'brightness(0.9)', 
                                transform: 'skewX(4deg) scale(1.02)' 
                            }} 
                        />
                        <span className="vg-hero-panel-label" style={{ opacity: 1 }}>{activeHeroPanel.label}</span>
                    </div>
                    {HERO_PANELS.filter(p => p.label !== activeHeroPanel.label).map((panel, i) => (
                        <div className="vg-hero-panel" key={i}>
                            <img src={panel.img} alt={panel.label} />
                            <span className="vg-hero-panel-label">{panel.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Spotlight Banner (TIDAL-inspired) ── */}
            <section className="vg-spotlight vg-animate-in">
                <div className="vg-spotlight-inner">
                    <div className="vg-spotlight-text">
                        <h2 className="vg-spotlight-badge">
                            Spotlight
                            <span className="vg-spotlight-badge-icon">
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_upward</span>
                            </span>
                        </h2>
                        <p className="vg-spotlight-subtitle">Where sacred knowledge finds its voice</p>
                    </div>
                    <div className="vg-spotlight-visual">
                        <img src="/images/video-posters/islamic-lectures.png" alt="Featured Reciter" />
                    </div>
                    <div className="vg-spotlight-info">
                        <p className="vg-spotlight-desc">
                            Spotlight highlights exceptional Quran recitations and Islamic
                            lectures, handpicked by our editorial team. Featured content
                            is added to curated collections and each featured scholar
                            reaches millions of learners worldwide.
                        </p>
                        <button className="vg-spotlight-cta" onClick={() => playVideo('mishary-rashid', 'Mishary Rashid Recitation')}>Listen Now</button>
                    </div>
                </div>
            </section>

            {/* ── Popular Reciters ── */}
            <section id="popular-reciters" className="vg-section vg-animate-in vg-animate-in-delay-1">
                <div className="vg-section-header">
                    <h2 className="vg-section-title" style={{ fontWeight: 800 }}>Popular Reciters</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="vg-circle-nav-arrow" aria-label="Previous" onClick={() => scrollRow(reciterScrollRef, 'left')}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                        </button>
                        <button className="vg-circle-nav-arrow" aria-label="Next" onClick={() => scrollRow(reciterScrollRef, 'right')}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                        </button>
                    </div>
                </div>
                {!filterData(FEATURED_RECITERS).length ? null : (
                    <div className="vg-reciters-row" ref={reciterScrollRef}>
                        {filterData(FEATURED_RECITERS).map(reciter => (
                            <Link href={`/video-gallery/reciter/${reciter.id}`} key={reciter.id} className="vg-reciter-card">
                                <div className="vg-reciter-avatar">
                                    <img src={reciter.poster} alt={reciter.name} />
                                </div>
                                <p className="vg-reciter-name">{reciter.name}</p>
                                <p className="vg-reciter-label">{reciter.label}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Featured Scholars Round ── */}
            <section id="featured-scholars" className="vg-section vg-animate-in vg-animate-in-delay-1">
                <div className="vg-section-header">
                    <h2 className="vg-section-title" style={{ fontWeight: 800 }}>Featured Scholars</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="vg-circle-nav-arrow" aria-label="Previous" onClick={() => scrollRow(scholarScrollRef, 'left')}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                        </button>
                        <button className="vg-circle-nav-arrow" aria-label="Next" onClick={() => scrollRow(scholarScrollRef, 'right')}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                        </button>
                    </div>
                </div>
                <div className="vg-reciters-row" ref={scholarScrollRef}>
                    {filterData(FEATURED_SCHOLARS).map(scholar => (
                        <Link href={`/video-gallery/scholar/${scholar.id}`} key={scholar.id} className="vg-reciter-card">
                            <div className="vg-reciter-avatar" style={{ border: '3px solid var(--vg-accent-glow)' }}>
                                <img src={scholar.poster} alt={scholar.name} />
                            </div>
                            <p className="vg-reciter-name">{scholar.name}</p>
                            <p className="vg-reciter-label">{scholar.label}</p>
                        </Link>
                    ))}
                    {!filterData(FEATURED_SCHOLARS).length && <p style={{ color: 'var(--vg-text-muted)', fontSize: 13 }}>No scholars found matching your search.</p>}
                </div>
            </section>

            {/* ── Live TV Channels ── */}
            <section id="live-channels" className="vg-section vg-animate-in vg-animate-in-delay-1">
                <div className="vg-section-header">
                    <h2 className="vg-section-title">
                        <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#ef4444', verticalAlign: 'middle', marginRight: 8 }}>
                            sensors
                        </span>
                        Live Channels
                    </h2>
                    <button className="vg-section-see-all">
                        All Channels
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                    </button>
                </div>
                {loading ? (
                    <div className="vg-carousel" style={{ gap: 14 }}>
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonLandscapeCard key={i} />)}
                    </div>
                ) : (
                    <Carousel id="live-channels">
                        {filterData(LIVE_CHANNELS).map(ch => (
                            <LandscapeCard
                                key={ch.id}
                                channel={ch}
                                onPlay={ch.youtubeId ? () => setActiveYouTube({ id: ch.youtubeId!, title: ch.title }) : undefined}
                            />
                        ))}
                    </Carousel>
                )}
            </section>

            {/* ── Islamic Educational Courses ── */}
            <section id="islamic-courses" className="vg-section vg-animate-in vg-animate-in-delay-2">
                <div className="vg-section-header">
                    <h2 className="vg-section-title">Islamic Educational Courses</h2>
                    <button className="vg-section-see-all">
                        See All Courses
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                    </button>
                </div>
                <Carousel id="islamic-courses">
                    {filterData(ISLAMIC_LECTURES).map(item => <PosterCard key={item.id} item={item} onPlay={playVideo} />)}
                </Carousel>
                {!filterData(ISLAMIC_LECTURES).length && <p style={{ color: 'var(--vg-text-muted)', fontSize: 13, padding: '0 48px' }}>No courses found matching your search.</p>}
            </section>

            {/* ── English Lectures ── */}
            <section id="english-lectures" className="vg-section vg-animate-in vg-animate-in-delay-2">
                <div className="vg-section-header">
                    <h2 className="vg-section-title">Lectures (English)</h2>
                    <button className="vg-section-see-all">
                        See All
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                    </button>
                </div>
                <Carousel id="english-lectures">
                    {filterData(ENGLISH_LECTURES).map(item => <PosterCard key={item.id} item={item} onPlay={playVideo} />)}
                </Carousel>
                {!filterData(ENGLISH_LECTURES).length && <p style={{ color: 'var(--vg-text-muted)', fontSize: 13, padding: '0 48px' }}>No matches found.</p>}
            </section>

            {/* ── Urdu Lectures ── */}
            <section id="urdu-lectures" className="vg-section vg-animate-in vg-animate-in-delay-3">
                <div className="vg-section-header">
                    <h2 className="vg-section-title">Lectures (Urdu)</h2>
                    <button className="vg-section-see-all">
                        See All
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                    </button>
                </div>
                <Carousel id="urdu-lectures">
                    {filterData(URDU_LECTURES).map(item => <PosterCard key={item.id} item={item} onPlay={playVideo} />)}
                </Carousel>
                {!filterData(URDU_LECTURES).length && <p style={{ color: 'var(--vg-text-muted)', fontSize: 13, padding: '0 48px' }}>No matches found.</p>}
            </section>

            {/* ── Popular Recitations Section ── */}
            <section id="popular-recitations" className="vg-section vg-animate-in vg-animate-in-delay-4">
                <div className="vg-section-header">
                    <h2 className="vg-section-title">Full Quran Recitations</h2>
                    <button className="vg-section-see-all">
                        See All
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                    </button>
                </div>
                <Carousel id="popular-recitations">
                    {filterData(POPULAR_RECITATIONS).map(item => <PosterCard key={item.id} item={item} onPlay={playVideo} />)}
                </Carousel>
                {!filterData(POPULAR_RECITATIONS).length && <p style={{ color: 'var(--vg-text-muted)', fontSize: 13, padding: '0 48px' }}>No matches found.</p>}
            </section>

            {/* ── Promo Banner – Quran Audio ── */}
            <div className="vg-promo vg-animate-in vg-animate-in-delay-3" style={{ marginTop: 24, marginBottom: 24 }}>
                <div className="vg-promo-text">
                    <h3 className="vg-promo-title">
                        Listen to the<br />Quran anytime
                    </h3>
                    <p className="vg-promo-desc">
                        Explore hundreds of beautiful recitations from world-renowned reciters.
                        Listen to the complete Quran with translations and tafseer, available 24/7.
                    </p>
                    <Link href="/audio-quran" className="vg-promo-btn">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>headphones</span>
                        Explore Audio Quran
                    </Link>
                </div>
                <div className="vg-promo-visual">
                    <img src="/images/video-posters/quran-recitation.png" alt="Audio Quran" />
                </div>
            </div>

            {/* ── Stories of the Prophets ── */}
            <section className="vg-section">
                <div className="vg-section-header">
                    <h2 className="vg-section-title">Stories of the Prophets</h2>
                    <button className="vg-section-see-all">
                        See All
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                    </button>
                </div>
                {loading ? (
                    <div className="vg-carousel" style={{ gap: 14 }}>
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonPosterCard key={i} />)}
                    </div>
                ) : (
                    <Carousel id="prophet-stories">
                        {filterData(PROPHET_STORIES).map(item => <PosterCard key={item.id} item={item} onPlay={playVideo} />)}
                    </Carousel>
                )}
            </section>

            {/* ── Quran Sciences & Courses Promo ── */}
            <section id="arabic-calligraphy" className="vg-section" style={{ paddingTop: 12 }}>
                <div className="vg-tabs">
                    {KNOWLEDGE_TRACKS.map((track, i) => (
                        <button 
                            key={track.title} 
                            className={`vg-tab ${activeTrack === i ? 'active' : ''}`}
                            onClick={() => setActiveTrack(i)}
                        >
                            {track.title}
                        </button>
                    ))}
                </div>
                <div className="vg-promo" style={{ margin: 0 }}>
                    <div className="vg-promo-text">
                        <h3 className="vg-promo-title">
                            {KNOWLEDGE_TRACKS[activeTrack].title}
                        </h3>
                        <p className="vg-promo-desc">
                            {KNOWLEDGE_TRACKS[activeTrack].desc}
                        </p>
                        <button className="vg-promo-btn" onClick={() => scrollToSection('islamic-courses')}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>school</span>
                            Explore Courses
                        </button>
                    </div>
                    <div className="vg-promo-visual">
                        <img 
                            key={activeTrack}
                            src={KNOWLEDGE_TRACKS[activeTrack].img} 
                            alt={KNOWLEDGE_TRACKS[activeTrack].title} 
                            style={{ animation: 'vg-fadeIn 0.5s ease' }}
                        />
                    </div>
                </div>
            </section>

            {/* ── Kids Content ── */}
            <section className="vg-kids-section">
                <div className="vg-kids-header">
                    <span className="material-symbols-outlined vg-kids-icon">child_care</span>
                    <h2 className="vg-kids-title">Kids Corner</h2>
                </div>
                <p className="vg-kids-desc">
                    Fun, educational Islamic content designed for children. Animated stories,
                    interactive alphabet learning, daily duas, and nasheeds – all in a safe,
                    ad-free environment!
                </p>
                {loading ? (
                    <div className="vg-carousel" style={{ gap: 14 }}>
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonPosterCard key={i} />)}
                    </div>
                ) : (
                    <Carousel id="kids-content">
                        {filterData(KIDS_CONTENT).map(item => <PosterCard key={item.id} item={item} onPlay={playVideo} />)}
                    </Carousel>
                )}
            </section>


            {/* ── Sticky Bottom CTA Bar ── */}
            <div className="vg-bottom-bar">
                <span className="vg-bottom-bar-text">
                    <span className="highlight">Free</span> Islamic education — videos, recitations & more
                </span>
                <Link href="/read-quran/1" className="vg-bottom-bar-btn">
                    Start Learning
                </Link>
            </div>

            {/* ── Back to Top ── */}
            <button
                className={`vg-back-to-top ${showBackTop ? 'visible' : ''}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
            >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>keyboard_arrow_up</span>
            </button>

            {/* ── YouTube Player Modal ── */}
            {activeYouTube && (
                <YouTubeModal
                    youtubeId={activeYouTube.id}
                    title={activeYouTube.title}
                    onClose={() => setActiveYouTube(null)}
                />
            )}
        </div>
    );
}
