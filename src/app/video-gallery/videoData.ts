
export interface VideoItem {
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

export interface LiveChannel {
    id: string;
    title: string;
    poster: string;
    channelTag: string;
    isLive: boolean;
    schedule?: string;
    youtubeId?: string;
}

export const HERO_CATEGORIES = [
    'Quran Recitation',
    'English Lectures',
    'Urdu Lectures',
    'Live Channels',
];

export const HERO_PANELS = [
    { img: '/images/video-posters/quran-recitation.png', label: 'Quran Recitation' },
    { img: '/images/video-posters/islamic-lectures.png', label: 'English Lectures' },
    { img: '/images/video-posters/islamic-history.png', label: 'Urdu Lectures' },
    { img: '/images/video-posters/mecca-live.png', label: 'Live Channels' },
];

export const POPULAR_RECITATIONS: VideoItem[] = [
    { id: 'mishary', title: 'Mishary Rashid', subtitle: 'Full Quran · 114 Surahs', poster: '/images/video-posters/quran-recitation.png', badge: 'Popular', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation, Tilawah', description: 'Listen to the complete Quran recited by Sheikh Mishary Rashid Alafasy in his world-renowned melodious voice.', youtubeId: 'suFI9vC7HB4' },
    { id: 'sudais', title: 'Abdul Rahman Al-Sudais', subtitle: 'Imam of Masjid al-Haram', poster: '/images/video-posters/islamic-lectures.png', badge: 'Featured', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation', description: 'The Imam of the Grand Mosque in Makkah, Sheikh Al-Sudais delivers a powerful recitation.', youtubeId: 'NI-ecVMP7Zo' },
    { id: 'shuraim', title: 'Saud Al-Shuraim', subtitle: 'Beautiful Recitation', poster: '/images/video-posters/prophet-stories.png', category: 'recitation', episodes: 114, year: '2023', genre: 'Quran, Recitation', description: 'Sheikh Saud Al-Shuraim\'s beautiful and serene recitation brings peace.', youtubeId: 'bGUhSwaodiQ' },
    { id: 'minshawi', title: 'Muhammad Al-Minshawi', subtitle: 'Murattal Style', poster: '/images/video-posters/arabic-calligraphy.png', category: 'recitation', episodes: 60, year: '2023', genre: 'Quran, Murattal', description: 'A classic Murattal-style recitation by the legendary Sheikh Muhammad Siddiq Al-Minshawi.', youtubeId: 'F1y4Y0R4PnE' },
    { id: 'husary', title: 'Mahmoud Al-Husary', subtitle: 'Tajweed Master', poster: '/images/video-posters/islamic-history.png', badge: 'Classic', category: 'recitation', episodes: 114, year: '2022', genre: 'Quran, Tajweed', description: 'Known as the "Master of Tajweed", Sheikh Al-Husary\'s precise and clear recitation.', youtubeId: '3E6iTiXAY90' },
    { id: 'ajmy', title: 'Ahmad Al-Ajmy', subtitle: 'Emotional Recitation', poster: '/images/video-posters/quran-recitation.png', category: 'recitation', episodes: 80, year: '2024', genre: 'Quran, Emotional', description: 'An incredibly emotional and heartfelt recitation that moves listeners.', youtubeId: 'C4Me582aQU8' },
    { id: 'ghamdi', title: 'Saad Al-Ghamdi', subtitle: 'Melodious Voice', poster: '/images/video-posters/islamic-lectures.png', badgeType: 'new', badge: 'New', category: 'recitation', episodes: 114, year: '2025', genre: 'Quran, Recitation', description: 'Saad Al-Ghamdi\'s melodious and soothing recitation.', youtubeId: 'FLmHcBzVbC0' },
    { id: 'dosari', title: 'Yasser Al-Dosari', subtitle: 'Full Quran', poster: '/images/video-posters/prophet-stories.png', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation', description: 'Experience the full Quran recited by Sheikh Yasser Al-Dosari.', youtubeId: 'PBrcXBnGBeU' },
    { id: 'maher', title: 'Maher Al-Muaiqly', subtitle: 'Imam of Masjid al-Haram', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Top Rated', category: 'recitation', episodes: 114, year: '2024', genre: 'Quran, Recitation', description: 'Sheikh Maher Al-Muaiqly\'s recitation is known for its beauty and spiritual depth.', youtubeId: '0SILdb7gS-8' },
    { id: 'basfar', title: 'Abdullah Basfar', subtitle: 'Calm & Peaceful', poster: '/images/video-posters/islamic-history.png', category: 'recitation', episodes: 114, year: '2023', genre: 'Quran, Peaceful', description: 'A calm and peaceful recitation perfect for daily listening.', youtubeId: 'mlTEaDewo8g' },
];

export const ISLAMIC_LECTURES: VideoItem[] = [
    { id: 'seerah-1', title: 'Life of Prophet Muhammad ﷺ', subtitle: 'Complete Seerah Series', poster: '/images/video-posters/prophet-stories.png', badge: 'LearnQuran', category: 'lecture', episodes: 40, year: '2024', genre: 'Seerah, Biography, History', description: 'A comprehensive series covering the life of Prophet Muhammad ﷺ.', youtubeId: 'VOUp3_9_6To' },
    { id: 'tafsir-1', title: 'Tafsir Ibn Kathir', subtitle: 'Verse by Verse Explanation', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'LearnQuran', category: 'lecture', episodes: 120, year: '2024', genre: 'Tafseer, Quran, Education', description: 'Detailed verse-by-verse explanation based on the renowned Tafsir Ibn Kathir.', youtubeId: '2bY10kZtq6w' },
    { id: 'aqeedah', title: 'Fundamentals of Aqeedah', subtitle: 'Beliefs & Faith', poster: '/images/video-posters/islamic-history.png', badge: 'LearnQuran', category: 'lecture', episodes: 24, year: '2023', genre: 'Aqeedah, Theology', description: 'Learn the core beliefs and foundations of Islamic theology.', youtubeId: 'vWfQZ_S1YfI' },
    { id: 'fiqh', title: 'Fiqh Made Easy', subtitle: 'Islamic Jurisprudence', poster: '/images/video-posters/quran-recitation.png', badge: 'LearnQuran', category: 'lecture', episodes: 36, year: '2024', genre: 'Fiqh, Law, Education', description: 'A beginner-friendly introduction to Islamic jurisprudence.', youtubeId: 'P6q3k_S_9kE' },
    { id: 'arabic-1', title: 'Learn Arabic Grammar', subtitle: 'Nahw & Sarf Basics', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'LearnQuran', category: 'lecture', episodes: 50, year: '2024', genre: 'Arabic, Language, Grammar', description: 'Master the fundamentals of Arabic grammar – Nahw and Sarf.', youtubeId: 'MvTtT3_S-kE' },
    { id: 'hadith-1', title: '40 Hadith of Nawawi', subtitle: 'With Commentary', poster: '/images/video-posters/islamic-lectures.png', badge: 'LearnQuran', category: 'lecture', episodes: 42, year: '2023', genre: 'Hadith, Commentary', description: 'An in-depth study of the famous 40 Hadith of Imam Nawawi.', youtubeId: 'OmSlsEEvKs0' },
    { id: 'history-1', title: 'Islamic Golden Age', subtitle: 'Science & Civilization', poster: '/images/video-posters/islamic-history.png', badgeType: 'new', badge: 'New Series', category: 'lecture', episodes: 18, year: '2025', genre: 'History, Science, Civilization', description: 'Explore the golden era of Islamic civilization.', youtubeId: 'A-N1X_S_9_k' },
    { id: 'women', title: 'Women in Islam', subtitle: 'Rights & Contributions', poster: '/images/video-posters/prophet-stories.png', category: 'lecture', episodes: 12, year: '2024', genre: 'Education, Society', description: 'A thought-provoking series highlighting the rights and roles of women in Islamic history.', youtubeId: 'xnU9pnYT5x0' },
];

export const KIDS_CONTENT: VideoItem[] = [
    { id: 'kids-arabic', title: 'Arabic Alphabet Fun', subtitle: 'Learn Letters with Animation', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 28, year: '2024', genre: 'Kids, Arabic, Education', description: 'A fun animated series teaching children the Arabic alphabet.', youtubeId: 'HeBcxdgQI3c' },
    { id: 'kids-stories', title: 'Prophets for Children', subtitle: 'Animated Stories', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 25, year: '2024', genre: 'Kids, Animation, Stories', description: 'Beautifully animated stories of the Prophets designed for young viewers.', youtubeId: '0RX221MYwrY' },
    { id: 'kids-duas', title: 'Daily Duas for Kids', subtitle: 'Easy to Learn', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 20, year: '2024', genre: 'Kids, Duas, Daily', description: 'Teach your kids essential daily duas with animations.', youtubeId: 'OMQnYZzJnZE' },
    { id: 'kids-quran', title: 'Juz Amma for Children', subtitle: 'Short Surahs', poster: '/images/video-posters/kids-islamic.png', badge: 'Kids', category: 'kids', episodes: 37, year: '2023', genre: 'Kids, Quran, Memorization', description: 'Help your children memorize the short Surahs of Juz Amma.', youtubeId: 'brtVQDXde-s' },
];

export const LIVE_CHANNELS: LiveChannel[] = [
    { id: 'makkah', title: 'Makkah Live', poster: '/images/video-posters/mecca-live.png', channelTag: 'LIVE', isLive: true, youtubeId: 'Cm1v4bteXbI' },
    { id: 'madinah', title: 'Madinah Live', poster: '/images/video-posters/madinah-live.png', channelTag: 'LIVE', isLive: true, youtubeId: '3L7Gf0BD0gc' },
    { id: 'quran-tv', title: 'Quran TV', poster: '/images/video-posters/arabic-calligraphy.png', channelTag: 'QTV', isLive: true, youtubeId: 'N5YXJ34PBxo' },
    { id: 'alehsan-tv', title: 'Al Ehsan TV', poster: '/images/video-posters/prophet-stories.png', channelTag: 'LIVE', isLive: true, youtubeId: 'ePzppodyAZg' },
    { id: 'huda-tv', title: 'Huda TV', poster: '/images/video-posters/islamic-history.png', channelTag: 'HTV', isLive: true, youtubeId: 'AHZQ-_fzwGc' },
    { id: 'iqra-tv', title: 'Iqra TV', poster: '/images/video-posters/islamic-lectures.png', channelTag: 'IQR', isLive: true, youtubeId: 'dL7FNvij_AA' },
];

export const PROPHET_STORIES: VideoItem[] = [
    { id: 'adam-to-nuh', title: 'Adam to Nuh - Movie', subtitle: 'The Beginning of Humanity', poster: '/images/video-posters/prophet-stories.png', badge: 'Complete Movie', category: 'story', episodes: 7, year: '2024', genre: 'Stories, Prophets', youtubeId: 'G4DGSc1FwvQ' },
    { id: 'ibrahim', title: 'Story of Ibrahim (AS)', subtitle: 'The Friend of Allah', poster: '/images/video-posters/quran-recitation.png', badge: 'Must Watch', category: 'story', episodes: 6, year: '2024', genre: 'Stories, Prophets', youtubeId: '-5pJ790IoK8' },
    { id: 'yusuf', title: 'Story of Yusuf (AS)', subtitle: 'The Dream Interpreter', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Best Story', category: 'story', episodes: 8, year: '2024', genre: 'Stories, Prophets, Drama', youtubeId: 'pXti2TQpwCE' },
];

export const ENGLISH_LECTURES: VideoItem[] = [
    { id: 'nak-1', title: 'Guiding Loved Ones', subtitle: 'Nouman Ali Khan', poster: '/images/video-posters/prophet-stories.png', category: 'lecture-en', year: '2024', genre: 'Family, Guidance', youtubeId: 'kp1PjNmtRis' },
    { id: 'zakir-1', title: 'Proving God\'s Existence', subtitle: 'Dr. Zakir Naik', poster: '/images/video-posters/arabic-calligraphy.png', badge: 'Scientific', category: 'lecture-en', year: '2023', genre: 'Dawah, Logic', youtubeId: 'luJ4p7ZJv3Y' },
    { id: 'yq-1', title: 'Saved From Hellfire', subtitle: 'Dr. Yasir Qadhi', poster: '/images/video-posters/quran-recitation.png', badge: 'Essential', category: 'lecture-en', year: '2024', genre: 'Theology, Akhirah', youtubeId: 'OmSlsEEvKs0' },
];

export const URDU_LECTURES: VideoItem[] = [
    { id: 'israr-1', title: 'Bayan ul Quran - Part 1', subtitle: 'Dr. Israr Ahmed', poster: '/images/video-posters/islamic-history.png', badge: 'Legendary', category: 'lecture-ur', year: '2024', genre: 'Tafseer, Quran', youtubeId: 'ZtyG_6cEK-w' },
    { id: 'tj-1', title: 'Nakaam Log', subtitle: 'Maulana Tariq Jameel', poster: '/images/video-posters/quran-recitation.png', category: 'lecture-ur', year: '2024', genre: 'Emotional, Bayan', youtubeId: 'kCXBwf-P6SY' },
];

export const FEATURED_RECITERS = [
    { id: 'mishary-rashid', name: 'Mishary Rashid', label: 'Quran Reciter', poster: '/images/video-posters/quran-recitation.png', youtubeId: 'X2YnP50cwNU' },
    { id: 'abdul-rahman-al-sudais', name: 'Al-Sudais', label: 'Imam · Makkah', poster: '/images/video-posters/islamic-lectures.png', youtubeId: 'PW0NcmKBLcE' },
    { id: 'saud-al-shuraim', name: 'Al-Shuraim', label: 'Quran Reciter', poster: '/images/video-posters/prophet-stories.png', youtubeId: 'HQmm2IVsQBc' },
    { id: 'maher-al-muaiqly', name: 'Maher Al-Muaiqly', label: 'Imam · Makkah', poster: '/images/video-posters/arabic-calligraphy.png', youtubeId: 'qWC-iaGVweM' },
    { id: 'muhammad-al-minshawi', name: 'Al-Minshawi', label: 'Murattal', poster: '/images/video-posters/islamic-history.png', youtubeId: 'KA0-5pALW5c' },
    { id: 'abdul-basit', name: 'Abdul Basit', label: 'Legendary Reciter', poster: '/images/video-posters/prophet-stories.png', youtubeId: 'NdpBGYdQ_lU' },
    { id: 'muhammad-al-lohaidan', name: 'Al-Lohaidan', label: 'Emotional', poster: '/images/video-posters/quran-recitation.png', youtubeId: 'JrjhOma915E' },
    { id: 'idris-abkar', name: 'Idris Abkar', label: 'Peaceful', poster: '/images/video-posters/islamic-lectures.png', youtubeId: 'aT6SlNqNlAA' },
    { id: 'mansour-salimi', name: 'Mansour Salimi', label: 'Heart Touching', poster: '/images/video-posters/arabic-calligraphy.png', youtubeId: 'AZ8MiorTDnU' },
    { id: 'raad-al-kurdi', name: 'Raad Al-Kurdi', label: 'Melodious', poster: '/images/video-posters/islamic-history.png', youtubeId: 'MlCXPjpTVZk' },
];

export const FEATURED_SCHOLARS = [
    { id: 'dr-israr-ahmed', name: 'Dr. Israr Ahmed', label: 'Urdu · Scholar', poster: '/images/video-posters/islamic-history.png', youtubeId: '2WAFIAfL7nM' },
    { id: 'nouman-ali-khan', name: 'Nouman Ali Khan', label: 'English · Speaker', poster: '/images/video-posters/prophet-stories.png', youtubeId: 'mnFhntnp8uc' },
    { id: 'tariq-jameel', name: 'Tariq Jameel', label: 'Urdu · Speaker', poster: '/images/video-posters/quran-recitation.png', youtubeId: 'MKD2gqVUwJw' },
    { id: 'yasir-qadhi', name: 'Yasir Qadhi', label: 'English · Scholar', poster: '/images/video-posters/arabic-calligraphy.png', youtubeId: 'jTqHL018QI8' },
    { id: 'omar-suleiman', name: 'Omar Suleiman', label: 'English · Speaker', poster: '/images/video-posters/islamic-history.png', youtubeId: '4Tzxiwv8ndg' },
    { id: 'engineer-muhammad-ali-mirza', name: 'Eng Muhammad Ali', label: 'Urdu · Researcher', poster: '/images/video-posters/islamic-lectures.png', youtubeId: 'cz_0xLpAGa8' },
    { id: 'peer-zulfiqar-ahmed', name: 'Peer Zulfiqar', label: 'Urdu · Spiritual', poster: '/images/video-posters/quran-recitation.png', youtubeId: 'LGsp9I9sVL4' },
    { id: 'zakir-naik', name: 'Zakir Naik', label: 'Dawah Specialist', poster: '/images/video-posters/arabic-calligraphy.png', youtubeId: 'xnU9pnYT5x0' },
    { id: 'bilal-philips', name: 'Bilal Philips', label: 'English · Scholar', poster: '/images/video-posters/prophet-stories.png', youtubeId: 'PShBTE2atOk' },
];

// Expanded Videos Map
export const RECITER_VIDEOS: Record<string, VideoItem[]> = {
    'mishary-rashid': [
        { id: 'm1', title: 'Surah Al-Fatiha', youtubeId: 'UDvh63xHVa0', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm2', title: 'Surah Al-Baqara', youtubeId: '8x_URBJW5Dk', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm3', title: 'Surah Al-Imran', youtubeId: 'mNqoSW_5SmA', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm4', title: 'Surah An-Nisa', youtubeId: 'fMo163Ya3SY', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm5', title: 'Surah Al-Ma\'ida', youtubeId: '9zqVkeoAP7U', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm6', title: 'Surah Al-An\'am', youtubeId: 'liK3RH8f8QA', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm7', title: 'Surah Al-A\'raf', youtubeId: '_JFNbs6IUgU', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm8', title: 'Surah Al-Anfal', youtubeId: '3fDDtUnvta8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm9', title: 'Surah At-Tawbah', youtubeId: 'QJVuFqXxLo4', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm10', title: 'Surah Yunus', youtubeId: 'GcA0hs9Ornk', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm11', title: 'Surah Hud', youtubeId: 'Cs24aEm0q3o', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm12', title: 'Surah Yusuf', youtubeId: 'oTRSrJM0WAM', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm13', title: 'Surah Ar-Ra\'d', youtubeId: 'gfAdREN1SL8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm14', title: 'Surah Ibrahim', youtubeId: 'vH2AhmUSQ74', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm15', title: 'Surah Al-Hijr', youtubeId: 'zevi4w8cv_0', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm16', title: 'Surah An-Nahl', youtubeId: 'jw_MvrLWJ6A', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm17', title: 'Surah Al-Isra', youtubeId: 'OJccFa-kVfM', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm18', title: 'Surah Al-Kahf', youtubeId: 'ozHal4UUXl0', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm19', title: 'Surah Maryam', youtubeId: 'huSrUH-spDw', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm20', title: 'Surah Ta-Ha', youtubeId: 'pn7pwU7U-kk', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm21', title: 'Surah Al-Anbiya', youtubeId: 'NUIKzCabZfA', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm22', title: 'Surah Al-Hajj', youtubeId: 'aXtz3-4EOds', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm23', title: 'Surah Al-Mu\'minun', youtubeId: 'D1RL-lQZuqQ', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm24', title: 'Surah An-Nur', youtubeId: 'vzfITR_YabY', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm25', title: 'Surah Al-Furqan', youtubeId: 'mNbAc2ebg7A', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm26', title: 'Surah Ash-Shu\'ara', youtubeId: '4ZaPUeVM0tM', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm27', title: 'Surah An-Naml', youtubeId: 'LcKpQPK9QrE', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm28', title: 'Surah Al-Qasas', youtubeId: 'YJOFzpK4XTE', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm29', title: 'Surah Al-Ankabut', youtubeId: 'z9fD6P4yhOs', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm30', title: 'Surah Ar-Rum', youtubeId: 'pXhar6aJmaY', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm31', title: 'Surah Luqman', youtubeId: 'ND5QWd7MB70', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm32', title: 'Surah As-Sajda', youtubeId: 'NQ6hyyjlq7c', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm33', title: 'Surah Al-Ahzab', youtubeId: 'vybruxcWZTs', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm34', title: 'Surah Saba', youtubeId: 'atLcGsBXqdE', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm35', title: 'Surah Fatir', youtubeId: 'DQKIBzLkkzc', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm36', title: 'Surah Ya-Sin', youtubeId: 'Q9xYG8PLxeg', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm37', title: 'Surah As-Saffat', youtubeId: 'Al0b4T3uqro', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm38', title: 'Surah Sad', youtubeId: 'ZA4o73IpYFw', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm39', title: 'Surah Az-Zumar', youtubeId: 'HpiZrGTPGjw', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm40', title: 'Surah Ghafir', youtubeId: 'fQfksWKINk4', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm41', title: 'Surah Fussilat', youtubeId: 'Vx7EKm90hSA', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm42', title: 'Surah Ash-Shura', youtubeId: 'Q8Q16INbLe8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm43', title: 'Surah Az-Zukhruf', youtubeId: 'K-DYuUuN61U', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm44', title: 'Surah Ad-Dukhan', youtubeId: 'QvLqDAECum8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm45', title: 'Surah Al-Jathiya', youtubeId: 'u7ZQCWzGTh8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm46', title: 'Surah Al-Ahqaf', youtubeId: 'FRbqhz12L9o', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm47', title: 'Surah Muhammad', youtubeId: 'yD7gNwi4esQ', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm48', title: 'Surah Al-Fath', youtubeId: 'On9rhT1Iw0U', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm49', title: 'Surah Al-Hujurat', youtubeId: 'viHOv8Hspis', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm50', title: 'Surah Qaf', youtubeId: 'um7O7iuvXzY', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm51', title: 'Surah Az-Dhariyat', youtubeId: 'kRrkXBdPLDQ', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm52', title: 'Surah At-Tur', youtubeId: '5SI5NAEbhbo', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm53', title: 'Surah An-Najm', youtubeId: '6eIPNa1VZyU', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm54', title: 'Surah Al-Qamar', youtubeId: 'C7tPyQVWh5Q', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm55', title: 'Surah Ar-Rahman', youtubeId: 'q--zAOMtQE4', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm56', title: 'Surah Al-Waqi\'a', youtubeId: 'pRxe3IDhzWI', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm57', title: 'Surah Al-Hadid', youtubeId: 'amUiwxHQ8Iw', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm58', title: 'Surah Al-Mujadila', youtubeId: 'GaDJ8-BKqr0', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm59', title: 'Surah Al-Hashr', youtubeId: 'cbwec9puSug', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm60', title: 'Surah Al-Mumtahina', youtubeId: 'gKB7TJ7_vNo', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm61', title: 'Surah As-Saff', youtubeId: '2ermATsCofM', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm62', title: 'Surah Al-Jumu\'a', youtubeId: 'kNS_xapmyWo', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm63', title: 'Surah Al-Munafiqun', youtubeId: 'hcfHY0vPxXU', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm64', title: 'Surah At-Taghabun', youtubeId: 'ILfO_61wxqU', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm65', title: 'Surah At-Talaq', youtubeId: 'RO3JGHqieN0', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm66', title: 'Surah At-Tahrim', youtubeId: 'eog2u7jigzo', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm67', title: 'Surah Al-Mulk', youtubeId: '9WyZl9FxREY', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm68', title: 'Surah Al-Qalam', youtubeId: 'otudaLjZBuY', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm69', title: 'Surah Al-Haqqa', youtubeId: 'FtsmJMz8AYw', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm70', title: 'Surah Al-Ma\'arij', youtubeId: 'ai30YF3AGb4', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm71', title: 'Surah Nuh', youtubeId: 'O61XEc4fBkY', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm72', title: 'Surah Al-Jinn', youtubeId: 'VhFW2th-iIo', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm73', title: 'Surah Al-Muzzammil', youtubeId: 'wawkeiueSBk', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm74', title: 'Surah Al-Muddathir', youtubeId: 'Nhl0AZQaa_g', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm75', title: 'Surah Al-Qiyama', youtubeId: '6evCVJmerJs', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm76', title: 'Surah Al-Insan', youtubeId: 'QOUp0GmgCQg', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm77', title: 'Surah Al-Mursalat', youtubeId: 'Uc0XgRE7718', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm78', title: 'Surah An-Naba', youtubeId: 'uPI5vmuI8WY', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm79', title: 'Surah An-Nazi\'at', youtubeId: 'oyahCibEdVE', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm80', title: 'Surah \'Abasa', youtubeId: 'K7H5DG5-6no', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm81', title: 'Surah At-Takwir', youtubeId: '2l5gZctbgcE', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm82', title: 'Surah Al-Infitar', youtubeId: 'Y2NEO3LDec8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm83', title: 'Surah Al-Mutaffifin', youtubeId: '3bVJMONwoAw', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm84', title: 'Surah Al-Inshiqaq', youtubeId: 'cd4HW9rJLpI', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm85', title: 'Surah Al-Buruj', youtubeId: 'UZvJebrIQfk', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm86', title: 'Surah At-Tariq', youtubeId: 'LLXn-kE-598', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm87', title: 'Surah Al-A\'la', youtubeId: '67gs-vCBaYI', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm88', title: 'Surah Al-Ghashiya', youtubeId: 'vfoom6l6L4w', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm89', title: 'Surah Al-Fajr', youtubeId: '72XHGhLre_8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm90', title: 'Surah Al-Balad', youtubeId: 'PlXaz9onniw', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm91', title: 'Surah Ash-Shams', youtubeId: 'fIYk6ioKPDM', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm92', title: 'Surah Al-Layl', youtubeId: '_pMLBImgEvk', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm93', title: 'Surah Ad-Duha', youtubeId: 'r3wCitqDxF8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm94', title: 'Surah Ash-Sharh', youtubeId: '59snlUGtDmQ', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm95', title: 'Surah At-Tin', youtubeId: 'tHy1k14w9xk', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm96', title: 'Surah Al-\'Alaq', youtubeId: 'JZ_yfEoJf6M', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm97', title: 'Surah Al-Qadr', youtubeId: 'VLDvWxqUK7A', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm98', title: 'Surah Al-Bayyina', youtubeId: 'U-1bn6IisXg', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm99', title: 'Surah Az-Zalzalah', youtubeId: 'AwCQfhh_Sh8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm100', title: 'Surah Al-\'Adiyat', youtubeId: 'YaOZS4ZoRY8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm101', title: 'Surah Al-Qari\'a', youtubeId: 'gmdTyUr4DzA', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm102', title: 'Surah At-Takathur', youtubeId: 'mkOwo41gkp8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm103', title: 'Surah Al-\'Asr', youtubeId: '-I2RkWeQvuo', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm104', title: 'Surah Al-Humazah', youtubeId: 'rnST2MaCjrY', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm105', title: 'Surah Al-Fil', youtubeId: '4C3FZjkIKKo', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm106', title: 'Surah Quraysh', youtubeId: 'wktEC7Jp5CU', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm107', title: 'Surah Al-Ma\'un', youtubeId: 'l8VF5p4oPDE', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm108', title: 'Surah Al-Kawthar', youtubeId: 'gguAmbBNhJQ', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm109', title: 'Surah Al-Kafirun', youtubeId: '4CvUCt_7t9Y', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm110', title: 'Surah An-Nasr', youtubeId: 'MVE1Mozt23w', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm111', title: 'Surah Al-Masad', youtubeId: 'M3dBqRX32fI', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm112', title: 'Surah Al-Ikhlas', youtubeId: 'fyub76Z1YW8', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm113', title: 'Surah Al-Falaq', youtubeId: 'MaOepE0iVP0', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
        { id: 'm114', title: 'Surah An-Nas', youtubeId: '5UTXy190B-I', category: 'recitation', poster: '/images/video-posters/quran-recitation.png' },
    ],
    'abdul-rahman-al-sudais': [
        { id: 's1', title: 'Full Quran Recitation', youtubeId: 'NI-ecVMP7Zo', category: 'recitation', poster: '/images/video-posters/islamic-lectures.png' },
        { id: 's2', title: 'Dua from Makkah', youtubeId: 'PW0NcmKBLcE', category: 'recitation', poster: '/images/video-posters/islamic-lectures.png' },
        { id: 's3', title: 'Surah Al-Fatiha', youtubeId: 'NI-ecVMP7Zo', category: 'recitation', poster: '/images/video-posters/islamic-lectures.png' },
        { id: 's4', title: 'Taraweeh 2024', youtubeId: 'Cm1v4bteXbI', category: 'recitation', poster: '/images/video-posters/islamic-lectures.png' },
    ],
    'saud-al-shuraim': [
        { id: 'sh1', title: 'Surah Al-Baqarah', youtubeId: 'bGUhSwaodiQ', category: 'recitation', poster: '/images/video-posters/prophet-stories.png' },
        { id: 'sh2', title: 'Surah Al-Imran', youtubeId: 'HQmm2IVsQBc', category: 'recitation', poster: '/images/video-posters/prophet-stories.png' },
    ],
};

export const SCHOLAR_VIDEOS: Record<string, VideoItem[]> = {
    'dr-israr-ahmed': [
        { id: 'is1', title: 'Bayan ul Quran - Part 1', youtubeId: 'ZtyG_6cEK-w', category: 'lecture', poster: '/images/video-posters/islamic-history.png' },
        { id: 'is2', title: 'Zawal e Ummat', youtubeId: 'j03wfNaFs3Q', category: 'lecture', poster: '/images/video-posters/islamic-history.png' },
        { id: 'is3', title: 'Reality of Life', youtubeId: '2WAFIAfL7nM', category: 'lecture', poster: '/images/video-posters/islamic-history.png' },
    ],
    'nouman-ali-khan': [
        { id: 'nak1', title: 'Guiding Loved Ones', youtubeId: 'kp1PjNmtRis', category: 'lecture', poster: '/images/video-posters/prophet-stories.png' },
        { id: 'nak2', title: 'Miracle of Quran', youtubeId: 'lkg9BPGtcNA', category: 'lecture', poster: '/images/video-posters/prophet-stories.png' },
        { id: 'nak3', title: 'Focus in Prayer', youtubeId: 'mnFhntnp8uc', category: 'lecture', poster: '/images/video-posters/prophet-stories.png' },
    ],
};

export const KNOWLEDGE_TRACKS = [
    { title: 'Quran Sciences', desc: 'Dive deep into the sciences of the Quran – from Tajweed rules and Makharij al-Huruf to the occasions of revelation.', img: '/images/video-posters/arabic-calligraphy.png' },
    { title: 'Arabic Language', desc: 'Master the foundation of the divine text with comprehensive Nahw and Sarf courses.', img: '/images/video-posters/islamic-lectures.png' },
    { title: 'Fiqh', desc: 'Understand the practical application of Islamic law in daily life, covering Salah, Zakat, fasting.', img: '/images/video-posters/prophet-stories.png' },
    { title: 'Hadith Sciences', desc: 'Explore the preservation and authenticity of the sayings of the Prophet ﷺ.', img: '/images/video-posters/islamic-history.png' },
    { title: 'Islamic History', desc: 'From the Seerah of the Prophet ﷺ to the Golden Age and beyond – discover the rich legacy of Islam.', img: '/images/video-posters/quran-recitation.png' },
];

export function getReciterById(id: string) {
    return FEATURED_RECITERS.find(r => r.id === id);
}

export function getScholarById(id: string) {
    return FEATURED_SCHOLARS.find(s => s.id === id);
}

export function getReciterVideos(id: string) {
    return RECITER_VIDEOS[id] || [];
}

export function getScholarVideos(id: string) {
    return SCHOLAR_VIDEOS[id] || [];
}
