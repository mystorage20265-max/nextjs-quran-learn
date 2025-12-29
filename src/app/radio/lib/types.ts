export interface Reciter {
    id: number;
    stationId?: string; // Unique station identifier
    originalReciterId?: number; // Original reciter ID for API calls
    name: string;
    arabicName?: string;
    style?: string;
    imageUrl?: string;
    link?: string;
}

export interface Station {
    id: string;
    title: string;
    description: string;
    image: string;
    featured?: boolean;
    type?: 'curated' | 'reciter' | 'surah' | 'juz' | 'live';
    content?: string;
    streamUrl?: string; // For live streams
    reciters?: string[]; // For station behavior
    tags?: string[];
    subtitle?: string;
}

export interface Chapter {
    id: number;
    revelation_order: number;
    revelation_place: string;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
}

export interface Juz {
    id: number;
    juz_number: number;
    verses_count: number;
    verses_range: string;
}

export interface AudioData {
    audioUrls: string[];
    surahName: string;
    surahNumber: number;
    reciterName: string;
    totalVerses: number;
    verses: Array<{
        verseKey: string;
        url: string;
        duration: number;
    }>;
}
