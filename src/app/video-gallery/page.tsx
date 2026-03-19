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
    youtubeId?: string;
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
    'English Lectures',
    'Urdu Lectures',
    'Live Channels',
];

const HERO_PANELS = [
    { img: '/images/video-posters/quran-recitation.png', label: 'Quran Recitation' },
    { img: '/images/video-posters/islamic-lectures.png', label: 'English Lectures' },
    { img: '/images/video-posters/islamic-history.png', label: 'Urdu Lectures' },
    { img: '/images/video-posters/mecca-live.png', label: 'Live Channels' },
];

const POPULAR_RECITATIONS: VideoItem[] = [
    { id: 'mishary', title: 'Mishary Rashid', subtitle: 'Full Quran · 114 Surahs', poster: '/images/video-posters/quran-recitation.png', badge: 'Popular', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation, Tilawah', description: 'Listen to the complete Quran recited by Sheikh Mishary Rashid Alafasy in his world-renowned melodious voice. Covers all 114 Surahs with perfect Tajweed.', youtubeId: 'suFI9vC7HB4' },
    { id: 'sudais', title: 'Abdul Rahman Al-Sudais', subtitle: 'Imam of Masjid al-Haram', poster: '/images/video-posters/islamic-lectures.png', badge: 'Featured', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation', description: 'The Imam of the Grand Mosque in Makkah, Sheikh Al-Sudais delivers a powerful and deeply moving recitation of the Holy Quran.', youtubeId: 'NI-ecVMP7Zo' },
    { id: 'shuraim', title: 'Saud Al-Shuraim', subtitle: 'Beautiful Recitation', poster: '/images/video-posters/prophet-stories.png', category: 'recitation', episodes: 114, year: '2023', genre: 'Quran, Recitation', description: 'Sheikh Saud Al-Shuraim\'s beautiful and serene recitation brings peace and tranquility to the listener.', youtubeId: 'bGUhSwaodiQ' },
    { id: 'minshawi', title: 'Muhammad Al-Minshawi', subtitle: 'Murattal Style', poster: '/images/video-posters/arabic-calligraphy.png', category: 'recitation', episodes: 60, year: '2023', genre: 'Quran, Murattal', description: 'A classic Murattal-style recitation by the legendary Sheikh Muhammad Siddiq Al-Minshawi.', youtubeId: 'F1y4Y0R4PnE' },
    { id: 'husary', title: 'Mahmoud Al-Husary', subtitle: 'Tajweed Master', poster: '/images/video-posters/islamic-history.png', badge: 'Classic', category: 'recitation', episodes: 114, year: '2022', genre: 'Quran, Tajweed', description: 'Known as the "Master of Tajweed", Sheikh Al-Husary\'s precise and clear recitation is considered a gold standard for Quran learners.', youtubeId: '3E6iTiXAY90' },
    { id: 'ajmy', title: 'Ahmad Al-Ajmy', subtitle: 'Emotional Recitation', poster: '/images/video-posters/quran-recitation.png', category: 'recitation', episodes: 80, year: '2024', genre: 'Quran, Emotional', description: 'An incredibly emotional and heartfelt recitation that moves listeners to tears. Sheikh Ahmad Al-Ajmy\'s voice carries deep spiritual weight.', youtubeId: 'C4Me582aQU8' },
    { id: 'ghamdi', title: 'Saad Al-Ghamdi', subtitle: 'Melodious Voice', poster: '/images/video-posters/islamic-lectures.png', badgeType: 'new', badge: 'New', category: 'recitation', episodes: 114, year: '2025', genre: 'Quran, Recitation', description: 'Newly uploaded! Saad Al-Ghamdi\'s melodious and soothing recitation of the entire Holy Quran.', youtubeId: 'FLmHcBzVbC0' },
    { id: 'dosari', title: 'Yasser Al-Dosari', subtitle: 'Full Quran', poster: '/images/video-posters/prophet-stories.png', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation', description: 'Experience the full Quran recited by Sheikh Yasser Al-Dosari with his distinctive and captivating voice.', youtubeId: 'PBrcXBnGBeU' },
    { id: 'maher', title: 'Maher Al-Muaiqly', subtitle: 'Imam of Masjid al-Haram', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Top Rated', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation', description: 'The current Imam of Masjid al-Haram, Sheikh Maher Al-Muaiqly\'s recitation is known for its beauty and spiritual depth.', youtubeId: '0SILdb7gS-8' },
    { id: 'basfar', title: 'Abdullah Basfar', subtitle: 'Calm & Peaceful', poster: '/images/video-posters/islamic-history.png', category: 'recitation', episodes: 114, year: '2023', genre: 'Quran, Peaceful', description: 'A calm and peaceful recitation perfect for daily listening and reflection. Sheikh Abdullah Basfar\'s gentle voice soothes the soul.', youtubeId: 'mlTEaDewo8g' },
];

const ISLAMIC_LECTURES: VideoItem[] = [
    { id: 'seerah-1', title: 'Life of Prophet Muhammad ﷺ', subtitle: 'Complete Seerah Series', poster: '/images/video-posters/prophet-stories.png', badge: 'LearnQuran', category: 'lecture', episodes: 40, year: '2024', genre: 'Seerah, Biography, History', description: 'A comprehensive 40-part series covering the complete life of Prophet Muhammad ﷺ from birth to the establishment of the Muslim Ummah.', youtubeId: 'VOUp3_9_6To' },
    { id: 'tafsir-1', title: 'Tafsir Ibn Kathir', subtitle: 'Verse by Verse Explanation', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'LearnQuran', category: 'lecture', episodes: 120, year: '2024', genre: 'Tafseer, Quran, Education', description: 'A detailed verse-by-verse explanation of the Holy Quran based on the renowned Tafsir Ibn Kathir.', youtubeId: '2bY10kZtq6w' },
    { id: 'aqeedah', title: 'Fundamentals of Aqeedah', subtitle: 'Beliefs & Faith', poster: '/images/video-posters/islamic-history.png', badge: 'LearnQuran', category: 'lecture', episodes: 24, year: '2023', genre: 'Aqeedah, Theology', description: 'Learn the core beliefs and foundations of Islamic theology in this structured course on Aqeedah.', youtubeId: 'vWfQZ_S1YfI' },
    { id: 'fiqh', title: 'Fiqh Made Easy', subtitle: 'Islamic Jurisprudence', poster: '/images/video-posters/quran-recitation.png', badge: 'LearnQuran', category: 'lecture', episodes: 36, year: '2024', genre: 'Fiqh, Law, Education', description: 'A beginner-friendly introduction to Islamic jurisprudence covering prayer, fasting, zakat, and more.', youtubeId: 'P6q3k_S_9kE' },
    { id: 'arabic-1', title: 'Learn Arabic Grammar', subtitle: 'Nahw & Sarf Basics', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'LearnQuran', category: 'lecture', episodes: 50, year: '2024', genre: 'Arabic, Language, Grammar', description: 'Master the fundamentals of Arabic grammar – Nahw and Sarf – to better understand the Quran in its original language.', youtubeId: 'MvTtT3_S-kE' },
    { id: 'hadith-1', title: '40 Hadith of Nawawi', subtitle: 'With Commentary', poster: '/images/video-posters/islamic-lectures.png', badge: 'LearnQuran', category: 'lecture', episodes: 42, year: '2023', genre: 'Hadith, Commentary', description: 'An in-depth study of the famous 40 Hadith of Imam Nawawi with detailed explanation and practical application.', youtubeId: 'OmSlsEEvKs0' },
    { id: 'history-1', title: 'Islamic Golden Age', subtitle: 'Science & Civilization', poster: '/images/video-posters/islamic-history.png', badgeType: 'new', badge: 'New Series', category: 'lecture', episodes: 18, year: '2025', genre: 'History, Science, Civilization', description: 'Explore the golden era of Islamic civilization – its contributions to science, medicine, astronomy, and philosophy.', youtubeId: 'A-N1X_S_9_k' },
    { id: 'women', title: 'Women in Islam', subtitle: 'Rights & Contributions', poster: '/images/video-posters/prophet-stories.png', category: 'lecture', episodes: 12, year: '2024', genre: 'Education, Society', description: 'A thought-provoking series highlighting the rights, roles, and remarkable contributions of women in Islamic history.', youtubeId: 'xnU9pnYT5x0' },
];

const KIDS_CONTENT: VideoItem[] = [
    { id: 'kids-arabic', title: 'Arabic Alphabet Fun', subtitle: 'Learn Letters with Animation', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 28, year: '2024', genre: 'Kids, Arabic, Education', description: 'A fun animated series teaching children the Arabic alphabet with colorful characters and catchy songs!', youtubeId: 'HeBcxdgQI3c' },
    { id: 'kids-stories', title: 'Prophets for Children', subtitle: 'Animated Stories', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 25, year: '2024', genre: 'Kids, Animation, Stories', description: 'Beautifully animated stories of the Prophets designed especially for young viewers to learn and enjoy.', youtubeId: '0RX221MYwrY' },
    { id: 'kids-duas', title: 'Daily Duas for Kids', subtitle: 'Easy to Learn', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 20, year: '2024', genre: 'Kids, Duas, Daily', description: 'Teach your kids essential daily duas with easy-to-follow animations and pronunciation guides.', youtubeId: 'OMQnYZzJnZE' },
    { id: 'kids-quran', title: 'Juz Amma for Children', subtitle: 'Short Surahs', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 37, year: '2023', genre: 'Kids, Quran, Memorization', description: 'Help your children memorize the short Surahs of Juz Amma with engaging visuals and repeat-after-me segments.', youtubeId: 'brtVQDXde-s' },
    { id: 'kids-manners', title: 'Islamic Manners', subtitle: 'Adab & Akhlaq', poster: '/images/video-posters/kids-islamic.png', badgeType: 'new', badge: 'New', category: 'kids', episodes: 15, year: '2025', genre: 'Kids, Manners, Adab', description: 'New series! Teaching children Islamic manners, good conduct, and how to be kind and respectful.', youtubeId: 'FfhyMT2k76Q' },
    { id: 'kids-nasheed', title: 'Nasheeds for Kids', subtitle: 'Fun Islamic Songs', poster: '/images/video-posters/kids-islamic.png', category: 'kids', episodes: 30, year: '2024', genre: 'Kids, Nasheed, Music', description: 'Fun and catchy nasheeds that kids will love singing along to. Perfect for car rides and playtime!', youtubeId: 'WyxekrpqcEQ' },
    { id: 'kids-pillars', title: '5 Pillars of Islam', subtitle: 'Interactive Learning', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 10, year: '2024', genre: 'Kids, Education, Pillars', description: 'An interactive series explaining the 5 pillars of Islam through fun activities and animated characters.', youtubeId: '0iXh-DFj3II' },
    { id: 'kids-ramadan', title: 'Ramadan Adventures', subtitle: 'Fasting & Charity', poster: '/images/video-posters/kids-islamic.png', category: 'kids', episodes: 12, year: '2024', genre: 'Kids, Ramadan, Charity', description: 'Join an exciting Ramadan journey learning about fasting, charity, and the spirit of the holy month.', youtubeId: 'J5AL4wdm9DU' },
];

const LIVE_CHANNELS: LiveChannel[] = [
    { id: 'makkah', title: 'Makkah Live', poster: '/images/video-posters/mecca-live.png', channelTag: 'LIVE', isLive: true, youtubeId: 'Cm1v4bteXbI' },
    { id: 'madinah', title: 'Madinah Live', poster: '/images/video-posters/madinah-live.png', channelTag: 'LIVE', isLive: true, youtubeId: '3L7Gf0BD0gc' },
    { id: 'quran-tv', title: 'Quran TV', poster: '/images/video-posters/arabic-calligraphy.png', channelTag: 'QTV', isLive: true, youtubeId: 'N5YXJ34PBxo' },
    { id: 'alehsan-tv', title: 'Al Ehsan TV', poster: '/images/video-posters/prophet-stories.png', channelTag: 'LIVE', isLive: true, youtubeId: 'ePzppodyAZg' },
    { id: 'huda-tv', title: 'Huda TV', poster: '/images/video-posters/islamic-history.png', channelTag: 'HTV', isLive: true, youtubeId: 'AHZQ-_fzwGc' },
    { id: 'iqra-tv', title: 'Iqra TV', poster: '/images/video-posters/islamic-lectures.png', channelTag: 'IQR', isLive: true, youtubeId: 'dL7FNvij_AA' },
];

const PROPHET_STORIES: VideoItem[] = [
    { id: 'adam-to-nuh', title: 'Adam to Nuh - Movie', subtitle: 'The Beginning of Humanity', poster: '/images/video-posters/prophet-stories.png', badge: 'Complete Movie', category: 'story', episodes: 7, year: '2024', genre: 'Stories, Prophets', description: 'The epic story from the creation of Adam (AS) to the Great Flood of Nuh (AS) – a complete cinematic journey of early humanity.', youtubeId: 'G4DGSc1FwvQ' },
    { id: 'ibrahim', title: 'Story of Ibrahim (AS)', subtitle: 'The Friend of Allah', poster: '/images/video-posters/quran-recitation.png', badge: 'Must Watch', category: 'story', episodes: 6, year: '2024', genre: 'Stories, Prophets', description: 'Discover the remarkable life of Prophet Ibrahim (AS) – the friend of Allah, his trials, and the building of the Kaaba.', youtubeId: '-5pJ790IoK8' },
    { id: 'yusuf', title: 'Story of Yusuf (AS)', subtitle: 'The Dream Interpreter', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Best Story', category: 'story', episodes: 8, year: '2024', genre: 'Stories, Prophets, Drama', description: 'Called "the best of stories" in the Quran. Follow Prophet Yusuf (AS) through betrayal, imprisonment, and his rise to power in Egypt.', youtubeId: 'pXti2TQpwCE' },
    { id: 'musa', title: 'Story of Musa (AS)', subtitle: 'Moses & Pharaoh', poster: '/images/video-posters/islamic-lectures.png', category: 'story', episodes: 10, year: '2024', genre: 'Stories, Prophets', description: 'The dramatic confrontation between Prophet Musa (AS) and Pharaoh – miracles, perseverance, and the liberation of the Israelites.', youtubeId: 'fIalhWnJHPA' },
    { id: 'isa', title: 'Story of Isa (AS)', subtitle: 'Jesus in Islam', poster: '/images/video-posters/prophet-stories.png', category: 'story', episodes: 5, year: '2024', genre: 'Stories, Prophets', description: 'Learn about Prophet Isa (AS) – his miraculous birth, his message, and his honored place in Islamic tradition.', youtubeId: 'EL8eAAv7QNA' },
    { id: 'muhammad', title: 'Story of Muhammad ﷺ', subtitle: 'The Last Messenger', poster: '/images/video-posters/islamic-history.png', badge: 'Essential', category: 'story', episodes: 30, year: '2024', genre: 'Seerah, Prophets, Biography', description: 'The complete life story of the final Prophet Muhammad ﷺ – from Makkah to Madinah, a journey that changed the world forever.', youtubeId: 'L973xRqg4Us' },
    { id: 'karbala', title: 'Dastan e Karbala', subtitle: 'The Epic Sacrifice', poster: '/images/video-posters/quran-recitation.png', badgeType: 'new', badge: 'Must Watch', category: 'story', episodes: 1, year: '2024', genre: 'History, Sacrifice, Islam', description: 'Experience the powerful and heart-wrenching Story of Karbala – the ultimate sacrifice of Imam Hussain (RA) and his family for the sake of Truth.', youtubeId: 'gA38BvKlMUU' },
];

const ENGLISH_LECTURES: VideoItem[] = [
    { id: 'nak-1', title: 'Guiding Loved Ones', subtitle: 'Nouman Ali Khan', poster: '/images/video-posters/prophet-stories.png', category: 'lecture-en', year: '2024', genre: 'Family, Guidance', description: 'Nouman Ali Khan discusses the reality that we cannot always guide those we love, and how to handle such situations with faith.', youtubeId: 'kp1PjNmtRis' },
    { id: 'zakir-1', title: 'Proving God\'s Existence', subtitle: 'Dr. Zakir Naik', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Scientific', category: 'lecture-en', year: '2023', genre: 'Dawah, Logic', description: 'Dr. Zakir Naik explains the best methods to prove the existence of God to an atheist using logic and science.', youtubeId: 'luJ4p7ZJv3Y' },
    { id: 'yq-1', title: 'Saved From Hellfire', subtitle: 'Dr. Yasir Qadhi', poster: '/images/video-posters/quran-recitation.png', badge: 'Essential', category: 'lecture-en', year: '2024', genre: 'Theology, Akhirah', description: 'Dr. Yasir Qadhi explains the deeds that save a believer from the fire of Hell.', youtubeId: 'OmSlsEEvKs0' },
    { id: 'os-1', title: 'Why Allah Created You', subtitle: 'Omar Suleiman', poster: '/images/video-posters/prophet-stories.png', category: 'lecture-en', year: '2024', genre: 'Purpose, Faith', description: 'Understanding your purpose in life and why Allah brought you into existence.', youtubeId: '3WEYp_v0AZk' },
    { id: 'nak-2', title: 'Miracle of Quran', subtitle: 'Nouman Ali Khan', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Viral', category: 'lecture-en', year: '2024', genre: 'Quranic Wonders', description: 'Linguistic miracles of the Quran that prove its divine origin.', youtubeId: 'lkg9BPGtcNA' },
];

const URDU_LECTURES: VideoItem[] = [
    { id: 'israr-1', title: 'Bayan ul Quran - Part 1', subtitle: 'Dr. Israr Ahmed', poster: '/images/video-posters/islamic-history.png', badge: 'Legendary', category: 'lecture-ur', year: '2024', genre: 'Tafseer, Quran', description: 'The legendary Dr. Israr Ahmed starts his comprehensive Bayan ul Quran series with deep theological insights.', youtubeId: 'ZtyG_6cEK-w' },
    { id: 'tj-1', title: 'Nakaam Log', subtitle: 'Maulana Tariq Jameel', poster: '/images/video-posters/quran-recitation.png', category: 'lecture-ur', year: '2024', genre: 'Emotional, Bayan', description: 'A heart-touching bayan by Tariq Jameel on the characteristics of failed people and how to gain success.', youtubeId: 'kCXBwf-P6SY' },
    { id: 'israr-2', title: 'Zawal e Ummat', subtitle: 'Dr. Israr Ahmed', poster: '/images/video-posters/prophet-stories.png', badge: 'Historical', category: 'lecture-ur', year: '2023', genre: 'History, Theology', description: 'Dr. Israr Ahmed analyzes the causes behind the decline of the Muslim Ummah.', youtubeId: 'j03wfNaFs3Q' },
    { id: 'tj-2', title: 'Mout ka Manzar', subtitle: 'Maulana Tariq Jameel', poster: '/images/video-posters/islamic-lectures.png', category: 'lecture-ur', year: '2024', genre: 'Social, Bayan', description: 'A powerful lecture on the reality of death and the life hereafter.', youtubeId: 'FcVsFfwMaC8' },
    { id: 'mirza-1', title: 'Gaarhi TOHEED', subtitle: 'Engr. Muhammad Ali Mirza', poster: '/images/video-posters/arabic-calligraphy.png', category: 'lecture-ur', year: '2024', genre: 'Theology', description: 'Engineer Muhammad Ali Mirza explains the core concept of Tawheed with evidence.', youtubeId: 'tKnkRBd9OQg' },
    { id: 'zulfiqar-1', title: 'Toba Kay Kalimaat', subtitle: 'Peer Zulfiqar Ahmad', poster: '/images/video-posters/islamic-history.png', category: 'lecture-ur', year: '2024', genre: 'Spirituality', description: 'Shaykh Zulfiqar Ahmad Naqshbandi discusses the power of repentance.', youtubeId: 'lmT1lZHsYe8' },
];

const FEATURED_RECITERS = [
    { id: 'mishary-r', name: 'Mishary Rashid', label: 'Quran Reciter', poster: '/images/video-posters/quran-recitation.png', youtubeId: 'X2YnP50cwNU' },
    { id: 'sudais-r', name: 'Al-Sudais', label: 'Imam · Makkah', poster: '/images/video-posters/islamic-lectures.png', youtubeId: 'PW0NcmKBLcE' },
    { id: 'shuraim-r', name: 'Al-Shuraim', label: 'Quran Reciter', poster: '/images/video-posters/prophet-stories.png', youtubeId: 'HQmm2IVsQBc' },
    { id: 'maher-r', name: 'Maher Al-Muaiqly', label: 'Imam · Makkah', poster: '/images/video-posters/arabic-calligraphy.png', youtubeId: 'qWC-iaGVweM' },
    { id: 'minshawi-r', name: 'Al-Minshawi', label: 'Murattal', poster: '/images/video-posters/islamic-history.png', youtubeId: 'KA0-5pALW5c' },
    { id: 'basit-r', name: 'Abdul Basit', label: 'Legendary Reciter', poster: '/images/video-posters/prophet-stories.png', youtubeId: 'NdpBGYdQ_lU' },
    { id: 'lohaidan-r', name: 'Al-Lohaidan', label: 'Emotional', poster: '/images/video-posters/quran-recitation.png', youtubeId: 'JrjhOma915E' },
    { id: 'abkar-r', name: 'Idris Abkar', label: 'Peaceful', poster: '/images/video-posters/islamic-lectures.png', youtubeId: 'aT6SlNqNlAA' },
    { id: 'salimi-r', name: 'Mansour Salimi', label: 'Heart Touching', poster: '/images/video-posters/arabic-calligraphy.png', youtubeId: 'AZ8MiorTDnU' },
    { id: 'kurdi-r', name: 'Raad Al-Kurdi', label: 'Melodious', poster: '/images/video-posters/islamic-history.png', youtubeId: 'MlCXPjpTVZk' },
];

const FEATURED_SCHOLARS = [
    { id: 'israr-s', name: 'Dr. Israr Ahmed', label: 'Urdu · Scholar', poster: '/images/video-posters/islamic-history.png', youtubeId: '2WAFIAfL7nM' },
    { id: 'nak-s', name: 'Nouman Ali Khan', label: 'English · Speaker', poster: '/images/video-posters/prophet-stories.png', youtubeId: 'mnFhntnp8uc' },
    { id: 'tj-s', name: 'Tariq Jameel', label: 'Urdu · Speaker', poster: '/images/video-posters/quran-recitation.png', youtubeId: 'MKD2gqVUwJw' },
    { id: 'yq-s', name: 'Yasir Qadhi', label: 'English · Scholar', poster: '/images/video-posters/arabic-calligraphy.png', youtubeId: 'jTqHL018QI8' },
    { id: 'os-s', name: 'Omar Suleiman', label: 'English · Speaker', poster: '/images/video-posters/islamic-history.png', youtubeId: '4Tzxiwv8ndg' },
    { id: 'mirza-s', name: 'Eng Muhammad Ali', label: 'Urdu · Researcher', poster: '/images/video-posters/islamic-lectures.png', youtubeId: 'cz_0xLpAGa8' },
    { id: 'zulfiqar-s', name: 'Peer Zulfiqar', label: 'Urdu · Spiritual', poster: '/images/video-posters/quran-recitation.png', youtubeId: 'LGsp9I9sVL4' },
    { id: 'zakir-s', name: 'Zakir Naik', label: 'Dawah Specialist', poster: '/images/video-posters/arabic-calligraphy.png', youtubeId: 'xnU9pnYT5x0' },
    { id: 'bilal-s', name: 'Bilal Philips', label: 'English · Scholar', poster: '/images/video-posters/prophet-stories.png', youtubeId: 'PShBTE2atOk' },
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

function YouTubeModal({ youtubeId, title, onClose }: { youtubeId: string; title: string; onClose: () => void }) {
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // High-res YouTube thumbnail URL
    const posterUrl = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 10001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)',
                animation: 'vg-fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    position: 'relative', width: '90%', maxWidth: 1000,
                    aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden',
                    boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: '#000',
                    transform: 'scale(1)',
                    animation: 'vg-modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── LOADING STATE / FACADE ── */}
                {!isIframeLoaded && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                            src={posterUrl} 
                            alt="" 
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(5px) brightness(0.5)' }} 
                        />
                        <div className="vg-loader-spinner" style={{ position: 'relative', zIndex: 2 }}>
                            <div className="vg-spinner-inner"></div>
                            <p style={{ color: 'white', marginTop: 15, fontSize: 13, opacity: 0.7, fontFamily: 'Lexend' }}>Loading Sacred Knowledge...</p>
                        </div>
                    </div>
                )}

                {/* ── Close button ── */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 20, right: 20, zIndex: 10,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%', width: 40, height: 40,
                        color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(12px)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
                </button>

                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{ border: 'none', display: 'block', opacity: isIframeLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
                    onLoad={() => setIsIframeLoaded(true)}
                    loading="eager"
                />
            </div>

            <style jsx>{`
                @keyframes vg-modalIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .vg-loader-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .vg-spinner-inner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: var(--vg-accent);
                    border-radius: 50%;
                    animation: vg-spin 1s infinite linear;
                }
                @keyframes vg-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
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
                        <button className="vg-spotlight-cta" onClick={() => playVideo('mishary-r', 'Mishary Rashid Recitation')}>Listen Now</button>
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
                            <div key={reciter.id} className="vg-reciter-card" onClick={() => playVideo(reciter.id, reciter.name)}>
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
                        <div key={scholar.id} className="vg-reciter-card" onClick={() => playVideo(scholar.id, scholar.name)}>
                            <div className="vg-reciter-avatar" style={{ border: '3px solid var(--vg-accent-glow)' }}>
                                <img src={scholar.poster} alt={scholar.name} />
                            </div>
                            <p className="vg-reciter-name">{scholar.name}</p>
                            <p className="vg-reciter-label">{scholar.label}</p>
                        </div>
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

            {/* ── Promo Banner – Sports / Quranic Sciences ── */}
            <section id="arabic-calligraphy" className="vg-section" style={{ paddingTop: 12 }}>
                <div className="vg-tabs">
                    {['Quran Sciences', 'Arabic Language', 'Fiqh', 'Hadith Sciences', 'Islamic History'].map((tab, i) => (
                        <button key={tab} id={tab === 'Islamic History' ? 'islamic-history' : undefined} className={`vg-tab ${i === 0 ? 'active' : ''}`}>{tab}</button>
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
                        <button className="vg-promo-btn" onClick={() => scrollToSection('islamic-lectures')}>
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
