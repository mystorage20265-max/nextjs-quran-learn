'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import './video-gallery.css';

/* ================================================================
   DATA – Islamic educational video content
   ================================================================ */

interface VideoItem {
    id: string;
    title: string;
    subtitle?: string;
    poster: string;
    badge?: string;
    badgeType?: 'default' | 'new';
    category: string;
    duration?: string;
    episodes?: number;
}

interface LiveChannel {
    id: string;
    title: string;
    poster: string;
    channelTag: string;
    isLive: boolean;
    schedule?: string;
}

const HERO_CATEGORIES = [
    'Quran Recitation',
    'Islamic Lectures',
    'Prophet Stories',
    'Live Channels',
];

const HERO_PANELS = [
    { img: '/images/video-posters/quran-recitation.png', label: 'Quran Recitation' },
    { img: '/images/video-posters/islamic-lectures.png', label: 'Islamic Lectures' },
    { img: '/images/video-posters/prophet-stories.png', label: 'Prophet Stories' },
];

const POPULAR_RECITATIONS: VideoItem[] = [
    { id: 'mishary', title: 'Mishary Rashid', subtitle: 'Full Quran · 114 Surahs', poster: '/images/video-posters/quran-recitation.png', badge: 'Popular', category: 'recitation', episodes: 114 },
    { id: 'sudais', title: 'Abdul Rahman Al-Sudais', subtitle: 'Imam of Masjid al-Haram', poster: '/images/video-posters/islamic-lectures.png', badge: 'Featured', category: 'recitation', episodes: 114 },
    { id: 'shuraim', title: 'Saud Al-Shuraim', subtitle: 'Beautiful Recitation', poster: '/images/video-posters/prophet-stories.png', category: 'recitation', episodes: 114 },
    { id: 'minshawi', title: 'Muhammad Al-Minshawi', subtitle: 'Murattal Style', poster: '/images/video-posters/arabic-calligraphy.png', category: 'recitation', episodes: 60 },
    { id: 'husary', title: 'Mahmoud Al-Husary', subtitle: 'Tajweed Master', poster: '/images/video-posters/islamic-history.png', badge: 'Classic', category: 'recitation', episodes: 114 },
    { id: 'ajmy', title: 'Ahmad Al-Ajmy', subtitle: 'Emotional Recitation', poster: '/images/video-posters/quran-recitation.png', category: 'recitation', episodes: 80 },
    { id: 'ghamdi', title: 'Saad Al-Ghamdi', subtitle: 'Melodious Voice', poster: '/images/video-posters/islamic-lectures.png', badgeType: 'new', badge: 'New', category: 'recitation', episodes: 114 },
    { id: 'dosari', title: 'Yasser Al-Dosari', subtitle: 'Full Quran', poster: '/images/video-posters/prophet-stories.png', category: 'recitation', episodes: 114 },
    { id: 'maher', title: 'Maher Al-Muaiqly', subtitle: 'Imam of Masjid al-Haram', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Top Rated', category: 'recitation', episodes: 114 },
    { id: 'basfar', title: 'Abdullah Basfar', subtitle: 'Calm & Peaceful', poster: '/images/video-posters/islamic-history.png', category: 'recitation', episodes: 114 },
];

const ISLAMIC_LECTURES: VideoItem[] = [
    { id: 'seerah-1', title: 'Life of Prophet Muhammad ﷺ', subtitle: 'Complete Seerah Series', poster: '/images/video-posters/prophet-stories.png', badge: 'QuranicLearn', category: 'lecture', episodes: 40 },
    { id: 'tafsir-1', title: 'Tafsir Ibn Kathir', subtitle: 'Verse by Verse Explanation', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'QuranicLearn', category: 'lecture', episodes: 120 },
    { id: 'aqeedah', title: 'Fundamentals of Aqeedah', subtitle: 'Beliefs & Faith', poster: '/images/video-posters/islamic-history.png', badge: 'QuranicLearn', category: 'lecture', episodes: 24 },
    { id: 'fiqh', title: 'Fiqh Made Easy', subtitle: 'Islamic Jurisprudence', poster: '/images/video-posters/quran-recitation.png', badge: 'QuranicLearn', category: 'lecture', episodes: 36 },
    { id: 'arabic-1', title: 'Learn Arabic Grammar', subtitle: 'Nahw & Sarf Basics', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'QuranicLearn', category: 'lecture', episodes: 50 },
    { id: 'hadith-1', title: '40 Hadith of Nawawi', subtitle: 'With Commentary', poster: '/images/video-posters/islamic-lectures.png', badge: 'QuranicLearn', category: 'lecture', episodes: 42 },
    { id: 'history-1', title: 'Islamic Golden Age', subtitle: 'Science & Civilization', poster: '/images/video-posters/islamic-history.png', badgeType: 'new', badge: 'New Series', category: 'lecture', episodes: 18 },
    { id: 'women', title: 'Women in Islam', subtitle: 'Rights & Contributions', poster: '/images/video-posters/prophet-stories.png', category: 'lecture', episodes: 12 },
];

const KIDS_CONTENT: VideoItem[] = [
    { id: 'kids-arabic', title: 'Arabic Alphabet Fun', subtitle: 'Learn Letters with Animation', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 28 },
    { id: 'kids-stories', title: 'Prophets for Children', subtitle: 'Animated Stories', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 25 },
    { id: 'kids-duas', title: 'Daily Duas for Kids', subtitle: 'Easy to Learn', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 20 },
    { id: 'kids-quran', title: 'Juz Amma for Children', subtitle: 'Short Surahs', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 37 },
    { id: 'kids-manners', title: 'Islamic Manners', subtitle: 'Adab & Akhlaq', poster: '/images/video-posters/kids-islamic.png', badgeType: 'new', badge: 'New', category: 'kids', episodes: 15 },
    { id: 'kids-nasheed', title: 'Nasheeds for Kids', subtitle: 'Fun Islamic Songs', poster: '/images/video-posters/kids-islamic.png', category: 'kids', episodes: 30 },
    { id: 'kids-pillars', title: '5 Pillars of Islam', subtitle: 'Interactive Learning', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 10 },
    { id: 'kids-ramadan', title: 'Ramadan Adventures', subtitle: 'Fasting & Charity', poster: '/images/video-posters/kids-islamic.png', category: 'kids', episodes: 12 },
];

const LIVE_CHANNELS: LiveChannel[] = [
    { id: 'makkah', title: 'Makkah Live', poster: '/images/video-posters/islamic-lectures.png', channelTag: 'LIVE', isLive: true },
    { id: 'madinah', title: 'Madinah Live', poster: '/images/video-posters/quran-recitation.png', channelTag: 'LIVE', isLive: true },
    { id: 'quran-tv', title: 'Quran TV', poster: '/images/video-posters/arabic-calligraphy.png', channelTag: 'QTV', isLive: true },
    { id: 'peace-tv', title: 'Peace TV', poster: '/images/video-posters/prophet-stories.png', channelTag: 'PTV', isLive: true, schedule: 'Live Now' },
    { id: 'huda-tv', title: 'Huda TV', poster: '/images/video-posters/islamic-history.png', channelTag: 'HTV', isLive: true },
    { id: 'iqra-tv', title: 'Iqra TV', poster: '/images/video-posters/islamic-lectures.png', channelTag: 'IQR', isLive: false, schedule: 'Starts 07:30' },
];

const PROPHET_STORIES: VideoItem[] = [
    { id: 'adam', title: 'Story of Adam (AS)', subtitle: 'The First Human', poster: '/images/video-posters/prophet-stories.png', category: 'story', episodes: 3 },
    { id: 'nuh', title: 'Story of Nuh (AS)', subtitle: 'Noah & The Great Flood', poster: '/images/video-posters/islamic-history.png', category: 'story', episodes: 4 },
    { id: 'ibrahim', title: 'Story of Ibrahim (AS)', subtitle: 'The Friend of Allah', poster: '/images/video-posters/quran-recitation.png', badge: 'Must Watch', category: 'story', episodes: 6 },
    { id: 'yusuf', title: 'Story of Yusuf (AS)', subtitle: 'The Dream Interpreter', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Best Story', category: 'story', episodes: 8 },
    { id: 'musa', title: 'Story of Musa (AS)', subtitle: 'Moses & Pharaoh', poster: '/images/video-posters/islamic-lectures.png', category: 'story', episodes: 10 },
    { id: 'isa', title: 'Story of Isa (AS)', subtitle: 'Jesus in Islam', poster: '/images/video-posters/prophet-stories.png', category: 'story', episodes: 5 },
    { id: 'muhammad', title: 'Story of Muhammad ﷺ', subtitle: 'The Last Messenger', poster: '/images/video-posters/islamic-history.png', badge: 'Essential', category: 'story', episodes: 30 },
    { id: 'companions', title: 'Stories of Companions', subtitle: 'Sahaba RA', poster: '/images/video-posters/quran-recitation.png', badgeType: 'new', badge: 'New', category: 'story', episodes: 20 },
];

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

function PosterCard({ item }: { item: VideoItem }) {
    return (
        <div className="vg-card">
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
        </div>
    );
}

/* ================================================================
   LANDSCAPE CARD COMPONENT (Live TV)
   ================================================================ */

function LandscapeCard({ channel }: { channel: LiveChannel }) {
    return (
        <div className="vg-card-landscape">
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

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1800);
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

    return (
        <div className="vg-page">
            {/* ── Loading Screen ── */}
            <div className={`vg-loader ${!loading ? 'hidden' : ''}`}>
                <div className="vg-loader-logo">
                    Quranic<span style={{ color: '#fff' }}>Learn</span>
                    <span style={{ fontSize: 20, verticalAlign: 'super' }}>+</span>
                </div>
                <div className="vg-loader-bar">
                    <div className="vg-loader-bar-fill" />
                </div>
            </div>

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
                        Quranic<span className="accent">Learn</span>
                        <span style={{ fontSize: 28, verticalAlign: 'super', color: 'var(--vg-accent)' }}>+</span>
                    </h1>
                    <div className="vg-hero-categories vg-animate-in vg-animate-in-delay-2">
                        {HERO_CATEGORIES.map((cat, i) => (
                            <button
                                key={cat}
                                className={`vg-hero-cat ${activeHeroCat === i ? 'active' : ''}`}
                                onClick={() => setActiveHeroCat(i)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="vg-hero-panels">
                    {HERO_PANELS.map((panel, i) => (
                        <div className="vg-hero-panel" key={i}>
                            <img src={panel.img} alt={panel.label} />
                            <span className="vg-hero-panel-label">{panel.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Live TV Channels ── */}
            <section className="vg-section vg-animate-in vg-animate-in-delay-1">
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
                        {LIVE_CHANNELS.map(ch => <LandscapeCard key={ch.id} channel={ch} />)}
                    </Carousel>
                )}
            </section>

            {/* ── Popular Recitations ── */}
            <section className="vg-section vg-animate-in vg-animate-in-delay-2">
                <div className="vg-section-header">
                    <h2 className="vg-section-title">Popular Recitations</h2>
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
                    <Carousel id="popular-recitations">
                        {POPULAR_RECITATIONS.map(item => <PosterCard key={item.id} item={item} />)}
                    </Carousel>
                )}
            </section>

            {/* ── Islamic Lectures ── */}
            <section className="vg-section vg-animate-in vg-animate-in-delay-3">
                <div className="vg-section-header">
                    <h2 className="vg-section-title">Islamic Lectures & Courses</h2>
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
                    <Carousel id="islamic-lectures">
                        {ISLAMIC_LECTURES.map(item => <PosterCard key={item.id} item={item} />)}
                    </Carousel>
                )}
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
                        {PROPHET_STORIES.map(item => <PosterCard key={item.id} item={item} />)}
                    </Carousel>
                )}
            </section>

            {/* ── Promo Banner – Sports / Quranic Sciences ── */}
            <section className="vg-section" style={{ paddingTop: 12 }}>
                <div className="vg-tabs">
                    {['Quran Sciences', 'Arabic Language', 'Fiqh', 'Hadith Sciences', 'Islamic History'].map((tab, i) => (
                        <button key={tab} className={`vg-tab ${i === 0 ? 'active' : ''}`}>{tab}</button>
                    ))}
                </div>
                <div className="vg-promo" style={{ margin: 0 }}>
                    <div className="vg-promo-text">
                        <h3 className="vg-promo-title">
                            Quran Sciences
                        </h3>
                        <p className="vg-promo-desc">
                            Dive deep into the sciences of the Quran – from Tajweed rules and
                            Makharij al-Huruf to the occasions of revelation (Asbab an-Nuzul).
                            Learn from certified scholars and enhance your understanding of the
                            divine text.
                        </p>
                        <button className="vg-promo-btn">
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>school</span>
                            Explore Courses
                        </button>
                    </div>
                    <div className="vg-promo-visual">
                        <img src="/images/video-posters/arabic-calligraphy.png" alt="Quran Sciences" />
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
                        {KIDS_CONTENT.map(item => <PosterCard key={item.id} item={item} />)}
                    </Carousel>
                )}
            </section>

            {/* ── Footer ── */}
            <footer className="vg-footer">
                <div className="vg-footer-grid">
                    <div>
                        <h4 className="vg-footer-col-title">Explore</h4>
                        <Link href="/read-quran/1" className="vg-footer-link">Read Quran</Link>
                        <Link href="/audio-quran" className="vg-footer-link">Audio Quran</Link>
                        <Link href="/video-gallery" className="vg-footer-link">Video Gallery</Link>
                        <Link href="/tafseer" className="vg-footer-link">Tafseer</Link>
                        <Link href="/memorize-quran" className="vg-footer-link">Memorize Quran</Link>
                    </div>
                    <div>
                        <h4 className="vg-footer-col-title">Learn</h4>
                        <Link href="/radio" className="vg-footer-link">Quran Radio</Link>
                        <Link href="/hadees" className="vg-footer-link">Hadees</Link>
                        <Link href="/dua" className="vg-footer-link">Daily Duas</Link>
                        <Link href="/learn-quran" className="vg-footer-link">Learn Quran</Link>
                        <Link href="/tajweed" className="vg-footer-link">Tajweed</Link>
                    </div>
                    <div>
                        <h4 className="vg-footer-col-title">Categories</h4>
                        <span className="vg-footer-link" style={{ cursor: 'pointer' }}>Quran Recitation</span>
                        <span className="vg-footer-link" style={{ cursor: 'pointer' }}>Islamic Lectures</span>
                        <span className="vg-footer-link" style={{ cursor: 'pointer' }}>Prophet Stories</span>
                        <span className="vg-footer-link" style={{ cursor: 'pointer' }}>Kids Content</span>
                        <span className="vg-footer-link" style={{ cursor: 'pointer' }}>Live Channels</span>
                    </div>
                    <div>
                        <h4 className="vg-footer-col-title">Connect</h4>
                        <span className="vg-footer-link" style={{ cursor: 'pointer' }}>About Us</span>
                        <span className="vg-footer-link" style={{ cursor: 'pointer' }}>Contact</span>
                        <span className="vg-footer-link" style={{ cursor: 'pointer' }}>Privacy Policy</span>
                        <span className="vg-footer-link" style={{ cursor: 'pointer' }}>Terms of Service</span>
                    </div>
                </div>

                <div className="vg-footer-bottom">
                    <span className="vg-footer-copyright">
                        © 2024 QuranicLearn. All rights reserved. Free Quran education for everyone.
                    </span>
                    <div className="vg-footer-socials">
                        <span className="vg-footer-social" title="YouTube">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_circle</span>
                        </span>
                        <span className="vg-footer-social" title="Twitter / X">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tag</span>
                        </span>
                        <span className="vg-footer-social" title="Instagram">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span>
                        </span>
                        <span className="vg-footer-social" title="Telegram">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                        </span>
                    </div>
                </div>
            </footer>

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
        </div>
    );
}
