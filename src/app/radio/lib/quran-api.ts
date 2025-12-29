import { Reciter, Station } from './types';

const API_BASE_URL = 'https://api.quran.com/api/v4';

export interface QuranApiResponse<T> {
    recitations?: any[];
    chapters?: T[];
}

// Map specific curations of reciters to "Stations"
const CURATED_STATIONS: Partial<Station>[] = [
    {
        id: 'mishary-rashid-alafasy',
        title: 'Mishary Rashid Alafasy',
        description: 'Emotional and clear recitation',
        image: 'https://static.qurancdn.com/images/reciters/7/profile.png',
    },
    {
        id: 'abdulbaset-abdulsamad',
        title: 'AbdulBaset AbdulSamad',
        description: 'Mujawwad style, timeless',
        image: 'https://static.qurancdn.com/images/reciters/1/profile.png',
    },
    {
        id: 'maher-al-muaiqly',
        title: 'Maher Al Muaiqly',
        description: 'Imam of Masjid Al-Haram',
        image: 'https://static.qurancdn.com/images/reciters/12/profile.png',
    },
    {
        id: 'saud-al-shuraim',
        title: 'Saud Al-Shuraim',
        description: 'Powerful and fast paced',
        image: 'https://static.qurancdn.com/images/reciters/19/profile.png',
    }
];

import stationsData from '../data/stations.json';

export async function fetchQuranReciters(): Promise<Reciter[]> {
    try {
        // Use local stations data which has correct image URLs and IDs
        return stationsData.map((s: any, index: number) => ({
            id: index + 1000, // Use high offset to ensure uniqueness
            stationId: s.id, // Unique station ID string
            originalReciterId: parseInt(s.reciters[0], 10), // Keep original for audio fetching
            name: s.title,
            style: s.subtitle,
            imageUrl: s.imageUrl,
            relativePath: s.id
        }));
    } catch (error) {
        console.error('Error fetching reciters:', error);
        return [];
    }
}

export async function fetchQuranStations(): Promise<Station[]> {
    // Return curated list
    return CURATED_STATIONS.map(s => ({
        id: s.id!,
        title: s.title!,
        description: s.description!,
        image: s.image!,
        featured: true,
        type: 'curated'
    }));
}

export async function getAudioUrl(reciterId: number, chapterId: number): Promise<string> {
    try {
        const response = await fetch(`${API_BASE_URL}/chapter_recitations/${reciterId}/${chapterId}`);
        if (!response.ok) throw new Error('Failed to fetch audio url');

        const data = await response.json();
        return data.audio_file.audio_url;
    } catch (error) {
        console.error('Error getting audio URL:', error);
        // Fallback or rethrow
        throw error;
    }
}

// Fetch Chapters needed for mapping
export async function fetchQuranChapters() {
    try {
        const response = await fetch(`${API_BASE_URL}/chapters`, {
            next: { revalidate: 86400 }
        });

        if (!response.ok) throw new Error('Failed to fetch chapters');

        const data = await response.json();
        return data.chapters || [];
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return [];
    }
}

export function mapReciterToStation(reciter: Reciter): Station {
    return {
        id: reciter.id.toString(),
        title: reciter.name,
        description: reciter.style || 'Murattal',
        // Use reciter.imageUrl if available, else standard CDN pattern
        image: reciter.imageUrl || `https://static.qurancdn.com/images/reciters/${reciter.id}/profile.png`,
        featured: false,
        type: 'reciter',
        content: 'all',
    };
}
