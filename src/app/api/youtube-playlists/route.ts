import { NextRequest, NextResponse } from 'next/server';

// ── Hardcoded fallback data (works without an API key) ─────────────────────
const FALLBACK_PLAYLISTS = [
    {
        id: 'PLutdSTmJ7bAKe3AUqrPOJ2GwnMF3TKNP3',
        title: 'Quran Recitation - Full Surah',
        description: 'Beautiful Quran recitation of complete Surahs with HD visuals.',
        thumbnail: 'https://i.ytimg.com/vi/1lJVnPCN3TQ/hqdefault.jpg',
        videoCount: 114,
        publishedAt: '2020-01-15T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bALa0Pjnsg1n5xE1GNMk5vS2',
        title: 'Learn Tajweed Rules',
        description: 'Step-by-step Tajweed lessons for beginners and intermediate learners.',
        thumbnail: 'https://i.ytimg.com/vi/9uYcKJHezv4/hqdefault.jpg',
        videoCount: 45,
        publishedAt: '2021-03-20T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bAKIe7dQQ-HM7r0v-hAP9s8e',
        title: 'Stories of the Prophets',
        description: 'Animated stories of the Prophets mentioned in the Quran.',
        thumbnail: 'https://i.ytimg.com/vi/DLj-nMwQcAo/hqdefault.jpg',
        videoCount: 32,
        publishedAt: '2019-06-10T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bAJ2UkGO8t6P8SJfVj8RFCP8',
        title: 'Quran Translation - Word by Word',
        description: 'Understanding the meaning of Quran through word by word translation.',
        thumbnail: 'https://i.ytimg.com/vi/iq4V4y5X-1k/hqdefault.jpg',
        videoCount: 60,
        publishedAt: '2022-08-05T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bAK9eDsNG6t8M7eL_c1hHbOx',
        title: 'Surah Memorization Series',
        description: 'Memorize the Quran with repeated recitations and visual aids.',
        thumbnail: 'https://i.ytimg.com/vi/mBtKXGHxkzE/hqdefault.jpg',
        videoCount: 30,
        publishedAt: '2023-01-12T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bAIJM8h8v0kX1B0eSAUmV5vr',
        title: 'Islamic Reminders',
        description: 'Short powerful Islamic reminders to strengthen your faith.',
        thumbnail: 'https://i.ytimg.com/vi/OkTfp3d9a3Q/hqdefault.jpg',
        videoCount: 88,
        publishedAt: '2021-11-03T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bALDaRN1sJn3bE9gT7n9E8a9',
        title: 'Friday Khutbah Collection',
        description: 'Weekly Friday khutbahs on various Islamic topics.',
        thumbnail: 'https://i.ytimg.com/vi/eSYdpV3nYSw/hqdefault.jpg',
        videoCount: 120,
        publishedAt: '2018-09-14T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bALWYOecb3mXLcFqZ-gXg9oP',
        title: 'Ramadan Special Series',
        description: 'Special lectures and recitations for the blessed month of Ramadan.',
        thumbnail: 'https://i.ytimg.com/vi/qs7f4uN2mWs/hqdefault.jpg',
        videoCount: 30,
        publishedAt: '2024-03-10T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bAJWnhPfJg_yBxcLGlG6tR5K',
        title: 'Tafsir - Quran Explanation',
        description: 'Detailed explanation (Tafsir) of Quran verses and Surahs.',
        thumbnail: 'https://i.ytimg.com/vi/JMcZGOhCOI0/hqdefault.jpg',
        videoCount: 75,
        publishedAt: '2020-07-22T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bAJYYt9_4kGNfBqT_aaJ8a3s',
        title: 'Arabic Language Basics',
        description: 'Learn Arabic to better understand the Quran – beginner friendly.',
        thumbnail: 'https://i.ytimg.com/vi/M6aR2a8K6lA/hqdefault.jpg',
        videoCount: 25,
        publishedAt: '2023-05-18T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bAIxnDGJ_4S8D9cI7h_qs2pD',
        title: 'Dua & Supplication Guide',
        description: 'Learn important Duas from the Quran and Sunnah with meaning.',
        thumbnail: 'https://i.ytimg.com/vi/pBjVrT6KKbE/hqdefault.jpg',
        videoCount: 40,
        publishedAt: '2022-02-28T00:00:00Z',
    },
    {
        id: 'PLutdSTmJ7bAL_5Wh3-2T_K5H6sD6j5q4r',
        title: 'Islamic History & Civilization',
        description: 'Explore the rich history and achievements of Islamic civilization.',
        thumbnail: 'https://i.ytimg.com/vi/Ro3hFnq_VGQ/hqdefault.jpg',
        videoCount: 22,
        publishedAt: '2021-09-01T00:00:00Z',
    },
];

const CHANNEL_INFO = {
    id: 'UCNdUFOtzSx3FS71pHkQLxhQ',
    title: 'FreeQuranEducation',
    description: 'Free Quran Education provides Islamic educational videos including Quran recitations, lectures, and learning materials.',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_ke_VxDJG0aLQKVfJxYLDLJuPjVKqeK1w_VuK-a=s176-c-k-c0x00ffffff-no-rj',
    subscriberCount: '2.55M',
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId') || 'UCNdUFOtzSx3FS71pHkQLxhQ';
    const pageToken = searchParams.get('pageToken') || '';
    const apiKey = process.env.YOUTUBE_API_KEY;

    // ── If no API key, return fallback data ──
    if (!apiKey) {
        return NextResponse.json(
            {
                channel: CHANNEL_INFO,
                playlists: FALLBACK_PLAYLISTS,
                nextPageToken: null,
                totalResults: FALLBACK_PLAYLISTS.length,
            },
            {
                headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
            }
        );
    }

    // ── Fetch from YouTube Data API v3 ──
    try {
        // Fetch channel info
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
        const channelRes = await fetch(channelUrl, { next: { revalidate: 3600 } });
        const channelData = await channelRes.json();

        const ch = channelData.items?.[0];
        const channelInfo = ch
            ? {
                id: ch.id,
                title: ch.snippet.title,
                description: ch.snippet.description,
                thumbnail: ch.snippet.thumbnails?.medium?.url || ch.snippet.thumbnails?.default?.url,
                subscriberCount: formatSubscribers(ch.statistics.subscriberCount),
            }
            : CHANNEL_INFO;

        // Fetch playlists
        let playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=24&key=${apiKey}`;
        if (pageToken) playlistUrl += `&pageToken=${pageToken}`;

        const playlistRes = await fetch(playlistUrl, { next: { revalidate: 3600 } });
        const playlistData = await playlistRes.json();

        if (!playlistData.items || playlistData.items.length === 0) {
            return NextResponse.json(
                { channel: channelInfo, playlists: FALLBACK_PLAYLISTS, nextPageToken: null, totalResults: FALLBACK_PLAYLISTS.length },
                { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' } }
            );
        }

        const playlists = playlistData.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail:
                item.snippet.thumbnails?.maxres?.url ||
                item.snippet.thumbnails?.high?.url ||
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.default?.url,
            videoCount: item.contentDetails?.itemCount || 0,
            publishedAt: item.snippet.publishedAt,
        }));

        return NextResponse.json(
            {
                channel: channelInfo,
                playlists,
                nextPageToken: playlistData.nextPageToken || null,
                totalResults: playlistData.pageInfo?.totalResults || playlists.length,
            },
            {
                headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
            }
        );
    } catch (error) {
        console.error('YouTube API error:', error);
        return NextResponse.json(
            { channel: CHANNEL_INFO, playlists: FALLBACK_PLAYLISTS, nextPageToken: null, totalResults: FALLBACK_PLAYLISTS.length },
            { status: 200, headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' } }
        );
    }
}

function formatSubscribers(count: string): string {
    const num = parseInt(count, 10);
    if (isNaN(num)) return count;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return String(num);
}
