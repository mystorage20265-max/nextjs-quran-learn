'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import './video-gallery.css';
import GlobalLoader from '@/components/Loader/GlobalLoader';

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
    description?: string;
    year?: string;
    genre?: string;
}

interface LiveChannel {
    id: string;
    title: string;
    poster: string;
    channelTag: string;
    isLive: boolean;
    schedule?: string;
    youtubeId?: string;
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
    { id: 'mishary', title: 'Mishary Rashid', subtitle: 'Full Quran · 114 Surahs', poster: '/images/video-posters/quran-recitation.png', badge: 'Popular', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation, Tilawah', description: 'Listen to the complete Quran recited by Sheikh Mishary Rashid Alafasy in his world-renowned melodious voice. Covers all 114 Surahs with perfect Tajweed.' },
    { id: 'sudais', title: 'Abdul Rahman Al-Sudais', subtitle: 'Imam of Masjid al-Haram', poster: '/images/video-posters/islamic-lectures.png', badge: 'Featured', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation', description: 'The Imam of the Grand Mosque in Makkah, Sheikh Al-Sudais delivers a powerful and deeply moving recitation of the Holy Quran.' },
    { id: 'shuraim', title: 'Saud Al-Shuraim', subtitle: 'Beautiful Recitation', poster: '/images/video-posters/prophet-stories.png', category: 'recitation', episodes: 114, year: '2023', genre: 'Quran, Recitation', description: 'Sheikh Saud Al-Shuraim\'s beautiful and serene recitation brings peace and tranquility to the listener.' },
    { id: 'minshawi', title: 'Muhammad Al-Minshawi', subtitle: 'Murattal Style', poster: '/images/video-posters/arabic-calligraphy.png', category: 'recitation', episodes: 60, year: '2023', genre: 'Quran, Murattal', description: 'A classic Murattal-style recitation by the legendary Sheikh Muhammad Siddiq Al-Minshawi.' },
    { id: 'husary', title: 'Mahmoud Al-Husary', subtitle: 'Tajweed Master', poster: '/images/video-posters/islamic-history.png', badge: 'Classic', category: 'recitation', episodes: 114, year: '2022', genre: 'Quran, Tajweed', description: 'Known as the "Master of Tajweed", Sheikh Al-Husary\'s precise and clear recitation is considered a gold standard for Quran learners.' },
    { id: 'ajmy', title: 'Ahmad Al-Ajmy', subtitle: 'Emotional Recitation', poster: '/images/video-posters/quran-recitation.png', category: 'recitation', episodes: 80, year: '2024', genre: 'Quran, Emotional', description: 'An incredibly emotional and heartfelt recitation that moves listeners to tears. Sheikh Ahmad Al-Ajmy\'s voice carries deep spiritual weight.' },
    { id: 'ghamdi', title: 'Saad Al-Ghamdi', subtitle: 'Melodious Voice', poster: '/images/video-posters/islamic-lectures.png', badgeType: 'new', badge: 'New', category: 'recitation', episodes: 114, year: '2025', genre: 'Quran, Recitation', description: 'Newly uploaded! Saad Al-Ghamdi\'s melodious and soothing recitation of the entire Holy Quran.' },
    { id: 'dosari', title: 'Yasser Al-Dosari', subtitle: 'Full Quran', poster: '/images/video-posters/prophet-stories.png', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation', description: 'Experience the full Quran recited by Sheikh Yasser Al-Dosari with his distinctive and captivating voice.' },
    { id: 'maher', title: 'Maher Al-Muaiqly', subtitle: 'Imam of Masjid al-Haram', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Top Rated', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation', description: 'The current Imam of Masjid al-Haram, Sheikh Maher Al-Muaiqly\'s recitation is known for its beauty and spiritual depth.' },
    { id: 'basfar', title: 'Abdullah Basfar', subtitle: 'Calm & Peaceful', poster: '/images/video-posters/islamic-history.png', category: 'recitation', episodes: 114, year: '2023', genre: 'Quran, Peaceful', description: 'A calm and peaceful recitation perfect for daily listening and reflection. Sheikh Abdullah Basfar\'s gentle voice soothes the soul.' },
];

const ISLAMIC_LECTURES: VideoItem[] = [
    { id: 'seerah-1', title: 'Life of Prophet Muhammad ﷺ', subtitle: 'Complete Seerah Series', poster: '/images/video-posters/prophet-stories.png', badge: 'QuranicLearn', category: 'lecture', episodes: 40, year: '2024', genre: 'Seerah, Biography, History', description: 'A comprehensive 40-part series covering the complete life of Prophet Muhammad ﷺ from birth to the establishment of the Muslim Ummah.' },
    { id: 'tafsir-1', title: 'Tafsir Ibn Kathir', subtitle: 'Verse by Verse Explanation', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'QuranicLearn', category: 'lecture', episodes: 120, year: '2024', genre: 'Tafseer, Quran, Education', description: 'A detailed verse-by-verse explanation of the Holy Quran based on the renowned Tafsir Ibn Kathir.' },
    { id: 'aqeedah', title: 'Fundamentals of Aqeedah', subtitle: 'Beliefs & Faith', poster: '/images/video-posters/islamic-history.png', badge: 'QuranicLearn', category: 'lecture', episodes: 24, year: '2023', genre: 'Aqeedah, Theology', description: 'Learn the core beliefs and foundations of Islamic theology in this structured course on Aqeedah.' },
    { id: 'fiqh', title: 'Fiqh Made Easy', subtitle: 'Islamic Jurisprudence', poster: '/images/video-posters/quran-recitation.png', badge: 'QuranicLearn', category: 'lecture', episodes: 36, year: '2024', genre: 'Fiqh, Law, Education', description: 'A beginner-friendly introduction to Islamic jurisprudence covering prayer, fasting, zakat, and more.' },
    { id: 'arabic-1', title: 'Learn Arabic Grammar', subtitle: 'Nahw & Sarf Basics', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'QuranicLearn', category: 'lecture', episodes: 50, year: '2024', genre: 'Arabic, Language, Grammar', description: 'Master the fundamentals of Arabic grammar – Nahw and Sarf – to better understand the Quran in its original language.' },
    { id: 'hadith-1', title: '40 Hadith of Nawawi', subtitle: 'With Commentary', poster: '/images/video-posters/islamic-lectures.png', badge: 'QuranicLearn', category: 'lecture', episodes: 42, year: '2023', genre: 'Hadith, Commentary', description: 'An in-depth study of the famous 40 Hadith of Imam Nawawi with detailed explanation and practical application.' },
    { id: 'history-1', title: 'Islamic Golden Age', subtitle: 'Science & Civilization', poster: '/images/video-posters/islamic-history.png', badgeType: 'new', badge: 'New Series', category: 'lecture', episodes: 18, year: '2025', genre: 'History, Science, Civilization', description: 'Explore the golden era of Islamic civilization – its contributions to science, medicine, astronomy, and philosophy.' },
    { id: 'women', title: 'Women in Islam', subtitle: 'Rights & Contributions', poster: '/images/video-posters/prophet-stories.png', category: 'lecture', episodes: 12, year: '2024', genre: 'Education, Society', description: 'A thought-provoking series highlighting the rights, roles, and remarkable contributions of women in Islamic history.' },
];

const KIDS_CONTENT: VideoItem[] = [
    { id: 'kids-arabic', title: 'Arabic Alphabet Fun', subtitle: 'Learn Letters with Animation', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 28, year: '2024', genre: 'Kids, Arabic, Education', description: 'A fun animated series teaching children the Arabic alphabet with colorful characters and catchy songs!' },
    { id: 'kids-stories', title: 'Prophets for Children', subtitle: 'Animated Stories', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 25, year: '2024', genre: 'Kids, Animation, Stories', description: 'Beautifully animated stories of the Prophets designed especially for young viewers to learn and enjoy.' },
    { id: 'kids-duas', title: 'Daily Duas for Kids', subtitle: 'Easy to Learn', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 20, year: '2024', genre: 'Kids, Duas, Daily', description: 'Teach your kids essential daily duas with easy-to-follow animations and pronunciation guides.' },
    { id: 'kids-quran', title: 'Juz Amma for Children', subtitle: 'Short Surahs', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 37, year: '2023', genre: 'Kids, Quran, Memorization', description: 'Help your children memorize the short Surahs of Juz Amma with engaging visuals and repeat-after-me segments.' },
    { id: 'kids-manners', title: 'Islamic Manners', subtitle: 'Adab & Akhlaq', poster: '/images/video-posters/kids-islamic.png', badgeType: 'new', badge: 'New', category: 'kids', episodes: 15, year: '2025', genre: 'Kids, Manners, Adab', description: 'New series! Teaching children Islamic manners, good conduct, and how to be kind and respectful.' },
    { id: 'kids-nasheed', title: 'Nasheeds for Kids', subtitle: 'Fun Islamic Songs', poster: '/images/video-posters/kids-islamic.png', category: 'kids', episodes: 30, year: '2024', genre: 'Kids, Nasheed, Music', description: 'Fun and catchy nasheeds that kids will love singing along to. Perfect for car rides and playtime!' },
    { id: 'kids-pillars', title: '5 Pillars of Islam', subtitle: 'Interactive Learning', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 10, year: '2024', genre: 'Kids, Education, Pillars', description: 'An interactive series explaining the 5 pillars of Islam through fun activities and animated characters.' },
    { id: 'kids-ramadan', title: 'Ramadan Adventures', subtitle: 'Fasting & Charity', poster: '/images/video-posters/kids-islamic.png', category: 'kids', episodes: 12, year: '2024', genre: 'Kids, Ramadan, Charity', description: 'Join an exciting Ramadan journey learning about fasting, charity, and the spirit of the holy month.' },
];

const LIVE_CHANNELS: LiveChannel[] = [
    { id: 'makkah', title: 'Makkah Live', poster: '/images/video-posters/mecca-live.png', channelTag: 'LIVE', isLive: true, youtubeId: 'Cm1v4bteXbI' },
    { id: 'madinah', title: 'Madinah Live', poster: '/images/video-posters/madinah-live.png', channelTag: 'LIVE', isLive: true, youtubeId: '3L7Gf0BD0gc' },
    { id: 'quran-tv', title: 'Quran TV', poster: '/images/video-posters/arabic-calligraphy.png', channelTag: 'QTV', isLive: true },
    { id: 'peace-tv', title: 'Peace TV', poster: '/images/video-posters/prophet-stories.png', channelTag: 'PTV', isLive: true, schedule: 'Live Now' },
    { id: 'huda-tv', title: 'Huda TV', poster: '/images/video-posters/islamic-history.png', channelTag: 'HTV', isLive: true },
    { id: 'iqra-tv', title: 'Iqra TV', poster: '/images/video-posters/islamic-lectures.png', channelTag: 'IQR', isLive: false, schedule: 'Starts 07:30' },
];

const PROPHET_STORIES: VideoItem[] = [
    { id: 'adam', title: 'Story of Adam (AS)', subtitle: 'The First Human', poster: '/images/video-posters/prophet-stories.png', category: 'story', episodes: 3, year: '2024', genre: 'Stories, Prophets', description: 'The story of Prophet Adam (AS) – the first human and the first prophet. Learn about creation, the Garden, and the beginning of humanity.' },
    { id: 'nuh', title: 'Story of Nuh (AS)', subtitle: 'Noah & The Great Flood', poster: '/images/video-posters/islamic-history.png', category: 'story', episodes: 4, year: '2024', genre: 'Stories, Prophets', description: 'The epic story of Prophet Nuh (AS) and the great flood. A tale of patience, perseverance, and unwavering faith.' },
    { id: 'ibrahim', title: 'Story of Ibrahim (AS)', subtitle: 'The Friend of Allah', poster: '/images/video-posters/quran-recitation.png', badge: 'Must Watch', category: 'story', episodes: 6, year: '2024', genre: 'Stories, Prophets', description: 'Discover the remarkable life of Prophet Ibrahim (AS) – the friend of Allah, his trials, and the building of the Kaaba.' },
    { id: 'yusuf', title: 'Story of Yusuf (AS)', subtitle: 'The Dream Interpreter', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Best Story', category: 'story', episodes: 8, year: '2024', genre: 'Stories, Prophets, Drama', description: 'Called "the best of stories" in the Quran. Follow Prophet Yusuf (AS) through betrayal, imprisonment, and his rise to power in Egypt.' },
    { id: 'musa', title: 'Story of Musa (AS)', subtitle: 'Moses & Pharaoh', poster: '/images/video-posters/islamic-lectures.png', category: 'story', episodes: 10, year: '2024', genre: 'Stories, Prophets', description: 'The dramatic confrontation between Prophet Musa (AS) and Pharaoh – miracles, perseverance, and the liberation of the Israelites.' },
    { id: 'isa', title: 'Story of Isa (AS)', subtitle: 'Jesus in Islam', poster: '/images/video-posters/prophet-stories.png', category: 'story', episodes: 5, year: '2024', genre: 'Stories, Prophets', description: 'Learn about Prophet Isa (AS) – his miraculous birth, his message, and his honored place in Islamic tradition.' },
    { id: 'muhammad', title: 'Story of Muhammad ﷺ', subtitle: 'The Last Messenger', poster: '/images/video-posters/islamic-history.png', badge: 'Essential', category: 'story', episodes: 30, year: '2024', genre: 'Seerah, Prophets, Biography', description: 'The complete life story of the final Prophet Muhammad ﷺ – from Makkah to Madinah, a journey that changed the world forever.' },
    { id: 'companions', title: 'Stories of Companions', subtitle: 'Sahaba RA', poster: '/images/video-posters/quran-recitation.png', badgeType: 'new', badge: 'New', category: 'story', episodes: 20, year: '2025', genre: 'Stories, Sahaba, History', description: 'Newly released! Inspiring stories of the companions of Prophet Muhammad ﷺ – their sacrifices, bravery, and devotion.' },
];

const FEATURED_RECITERS = [
    { id: 'mishary-r', name: 'Mishary Rashid', label: 'Quran Reciter', poster: '/images/video-posters/quran-recitation.png' },
    { id: 'sudais-r', name: 'Al-Sudais', label: 'Imam · Makkah', poster: '/images/video-posters/islamic-lectures.png' },
    { id: 'shuraim-r', name: 'Al-Shuraim', label: 'Quran Reciter', poster: '/images/video-posters/prophet-stories.png' },
    { id: 'minshawi-r', name: 'Al-Minshawi', label: 'Murattal Style', poster: '/images/video-posters/arabic-calligraphy.png' },
    { id: 'husary-r', name: 'Al-Husary', label: 'Tajweed Master', poster: '/images/video-posters/islamic-history.png' },
    { id: 'ajmy-r', name: 'Ahmad Al-Ajmy', label: 'Emotional', poster: '/images/video-posters/quran-recitation.png' },
    { id: 'ghamdi-r', name: 'Saad Al-Ghamdi', label: 'Melodious', poster: '/images/video-posters/islamic-lectures.png' },
    { id: 'dosari-r', name: 'Al-Dosari', label: 'Quran Reciter', poster: '/images/video-posters/prophet-stories.png' },
    { id: 'maher-r', name: 'Maher Al-Muaiqly', label: 'Imam · Makkah', poster: '/images/video-posters/arabic-calligraphy.png' },
    { id: 'basfar-r', name: 'Abdullah Basfar', label: 'Peaceful', poster: '/images/video-posters/islamic-history.png' },
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
                            <button className="vg-hover-popup-play">
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

function YouTubeModal({ youtubeId, title, onClose }: { youtubeId: string; title: string; onClose: () => void }) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 10001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                animation: 'vg-fadeIn 0.25s ease',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    position: 'relative', width: '90%', maxWidth: 900,
                    aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: -44, right: 0, zIndex: 2,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%', width: 36, height: 36,
                        color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </button>
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{ border: 'none', display: 'block' }}
                />
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
    const [activeYouTube, setActiveYouTube] = useState<{ id: string; title: string } | null>(null);

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

    return (
        <div className="vg-page">
            {/* ── Standardized Premium Loader ── */}
            <GlobalLoader loading={loading} />

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
                        <button className="vg-spotlight-cta">Listen Now</button>
                    </div>
                </div>
            </section>

            {/* ── Popular Reciters (Circular Row — Amazon/TIDAL-style) ── */}
            <section className="vg-section vg-animate-in vg-animate-in-delay-1">
                <div className="vg-section-header">
                    <h2 className="vg-section-title" style={{ fontWeight: 800 }}>Popular Reciters</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="vg-circle-nav-arrow" aria-label="Previous">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                        </button>
                        <button className="vg-circle-nav-arrow" aria-label="Next">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                        </button>
                        <button className="vg-see-all-btn">SEE ALL</button>
                    </div>
                </div>
                {loading ? (
                    <div className="vg-reciters-row">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="vg-reciter-card" style={{ pointerEvents: 'none' }}>
                                <div className="vg-skeleton vg-reciter-avatar" />
                                <div className="vg-skeleton" style={{ width: '70%', height: 12, marginTop: 12, borderRadius: 6 }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="vg-reciters-row">
                        {FEATURED_RECITERS.map(reciter => (
                            <div key={reciter.id} className="vg-reciter-card">
                                <div className="vg-reciter-avatar">
                                    <img src={reciter.poster} alt={reciter.name} />
                                </div>
                                <p className="vg-reciter-name">{reciter.name}</p>
                                <p className="vg-reciter-label">{reciter.label}</p>
                            </div>
                        ))}
                    </div>
                )}
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
                        {LIVE_CHANNELS.map(ch => (
                            <LandscapeCard
                                key={ch.id}
                                channel={ch}
                                onPlay={ch.youtubeId ? () => setActiveYouTube({ id: ch.youtubeId!, title: ch.title }) : undefined}
                            />
                        ))}
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
