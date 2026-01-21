/**
 * Radio Configuration
 * Centralized configuration for radio streaming platform
 */

export const RADIO_CONFIG = {
    // API Endpoints
    apis: {
        qurancom: 'https://api.quran.com/api/v4',
        mp3quran: 'https://mp3quran.net/api/v3',
        alquran: 'https://api.alquran.cloud/v1',
        qurancdn: 'https://static.qurancdn.com',
        // This is the correct base URL that works for audio files
        audioDownload: 'https://download.quranicaudio.com/qdc',
    },

    // Stream server configuration - using Quran.com CDN instead of unreliable ports
    streamServer: {
        baseUrl: 'https://download.quranicaudio.com/qdc',
        protocol: 'https',
    },

    // Live reciters with their slug paths for reliable audio from quranicaudio.com
    // Format: {baseUrl}/{reciterSlug}/{style}/{surah}.mp3
    liveReciters: [
        { id: 7, name: 'Mishari Rashid al-Afasy', reciterSlug: 'mishari_al_afasy', style: 'murattal', displayStyle: 'Murattal' },
        { id: 1, name: 'AbdulBaset AbdulSamad (Mujawwad)', reciterSlug: 'abdulbaset_mujawwad', style: 'mujawwad', displayStyle: 'Mujawwad' },
        { id: 2, name: 'AbdulBaset AbdulSamad', reciterSlug: 'abdul_baset', style: 'murattal', displayStyle: 'Murattal' },
        { id: 3, name: 'Abdur-Rahman as-Sudais', reciterSlug: 'sudais', style: 'murattal', displayStyle: 'Murattal' },
        { id: 4, name: 'Abu Bakr al-Shatri', reciterSlug: 'abu_bakr_shatri', style: 'murattal', displayStyle: 'Murattal' },
        { id: 5, name: 'Hani ar-Rifai', reciterSlug: 'hani_ar_rafai', style: 'murattal', displayStyle: 'Murattal' },
        { id: 6, name: 'Mahmoud Khalil Al-Husary', reciterSlug: 'khalil_al_husary', style: 'murattal', displayStyle: 'Murattal' },
        { id: 9, name: 'Mohamed Siddiq al-Minshawi', reciterSlug: 'minshawi', style: 'murattal', displayStyle: 'Murattal' },
        { id: 10, name: "Sa'ud ash-Shuraym", reciterSlug: 'shuraym', style: 'murattal', displayStyle: 'Murattal' },
        { id: 11, name: 'Mohamed al-Tablawi', reciterSlug: 'tablawi', style: 'murattal', displayStyle: 'Murattal' },
        { id: 8, name: 'Mohamed Siddiq al-Minshawi (Mujawwad)', reciterSlug: 'minshawi_mujawwad', style: 'mujawwad', displayStyle: 'Mujawwad' },
        { id: 12, name: 'Maher Al Muaiqly', reciterSlug: 'maher_almuaiqly', style: 'murattal', displayStyle: 'Murattal' },
    ],

    // Cache settings
    cache: {
        stationsTTL: 5 * 60 * 1000, // 5 minutes
        recitersTTL: 30 * 60 * 1000, // 30 minutes
        chaptersTTL: 24 * 60 * 60 * 1000, // 24 hours
    },

    // Audio settings
    audio: {
        defaultBitrate: 128,
        highQualityBitrate: 192,
        preloadBuffer: 30, // seconds
        crossfadeDuration: 2000, // ms
    },

    // UI settings
    ui: {
        visualizerBars: 64,
        animationDuration: 300,
        toastDuration: 3000,
    },
} as const;

/**
 * Build audio URL for a reciter (using Quran.com API)
 * Uses the official API to get verified working audio URLs
 */
export async function buildStreamUrl(reciterId: number, surahNumber = 1): Promise<string> {
    const reciter = RADIO_CONFIG.liveReciters.find(r => r.id === reciterId);
    const actualReciterId = reciter?.id || 7; // Fallback to Mishary (ID 7)

    try {
        const response = await fetch(`${RADIO_CONFIG.apis.qurancom}/chapter_recitations/${actualReciterId}/${surahNumber}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio URL: ${response.status}`);
        }
        const data = await response.json();
        return data.audio_file?.audio_url || '';
    } catch (error) {
        console.error('Error fetching audio URL from API:', error);
        // Return empty string to indicate failure
        return '';
    }
}

/**
 * Get reciter image URL
 * Uses local generated portraits for all configured reciters (1-12), falls back to CDN for others
 */
export function getReciterImageUrl(reciterId: number, size: '200' | 'profile' = 'profile'): string {
    // Use our generated local portraits for all main reciters
    const localReciterIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (localReciterIds.includes(reciterId)) {
        return `/images/reciters/reciter-${reciterId}.png`;
    }
    // Fall back to QuranCDN for other reciters
    return `${RADIO_CONFIG.apis.qurancdn}/images/reciters/${reciterId}/${size === '200' ? '200.jpg' : 'profile.png'}`;
}

export type LiveReciter = typeof RADIO_CONFIG.liveReciters[number];

