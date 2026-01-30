/**
 * Audio Service
 * Manages audio playback, reciter selection, and audio URL generation
 */

export interface Reciter {
    id: number;
    name: string;
    arabicName: string;
    style: string;
    slug: string;
    cdnPath: string; // Path on everyayah.com
}

export const RECITERS: Reciter[] = [
    {
        id: 7,
        name: 'Mishary Rashid Alafasy',
        arabicName: 'مشاري بن راشد العفاسي',
        slug: 'ar.alafasy',
        style: 'Murattal',
        cdnPath: 'Alafasy_128kbps'
    },
    {
        id: 2,
        name: 'Abdul Basit',
        arabicName: 'عبد الباسط عبد الصمد',
        slug: 'ar.abdulbasitmurattal',
        style: 'Murattal',
        cdnPath: 'Abdul_Basit_Murattal_192kbps'
    },
    {
        id: 3,
        name: 'Abdur-Rahman as-Sudais',
        arabicName: 'عبد الرحمن السديس',
        slug: 'ar.abdurrahmaansudais',
        style: 'Murattal',
        cdnPath: 'Abdurrahmaan_As-Sudais_192kbps'
    },
    {
        id: 13,
        name: 'Saad Al-Ghamdi',
        arabicName: 'سعد الغامدي',
        slug: 'ar.saadalghamadi',
        style: 'Murattal',
        cdnPath: 'Ghamadi_40kbps'
    },
    {
        id: 12,
        name: 'Maher Al-Muaiqly',
        arabicName: 'ماهر المعيقلي',
        slug: 'ar.mahermuaiqly',
        style: 'Murattal',
        cdnPath: 'MaherAlMuaiqly128kbps'
    },
];

const AUDIO_CDN_BASE = 'https://everyayah.com/data';

class AudioService {
    private currentReciter: Reciter = RECITERS[0];
    private audioCache = new Map<string, string>();

    /**
     * Get current reciter
     */
    getCurrentReciter(): Reciter {
        return this.currentReciter;
    }

    /**
     * Set current reciter
     */
    setReciter(reciter: Reciter): void {
        this.currentReciter = reciter;
    }

    /**
     * Format verse number for audio filename (e.g., 1:1 -> 001001)
     */
    private formatVerseNumber(chapterId: number, verseNumber: number): string {
        const chapterStr = chapterId.toString().padStart(3, '0');
        const verseStr = verseNumber.toString().padStart(3, '0');
        return `${chapterStr}${verseStr}`;
    }

    /**
     * Get audio URL for a specific verse
     * @param chapterId Chapter number (1-114)
     * @param verseNumber Verse number
     * @param reciter Optional reciter override
     * @returns Audio URL
     */
    getVerseAudioUrl(chapterId: number, verseNumber: number, reciter?: Reciter): string {
        const activeReciter = reciter || this.currentReciter;
        const verseKey = `${chapterId}:${verseNumber}`;
        const cacheKey = `${activeReciter.cdnPath}_${verseKey}`;

        // Check cache
        if (this.audioCache.has(cacheKey)) {
            return this.audioCache.get(cacheKey)!;
        }

        // Generate URL: https://everyayah.com/data/{reciter-path}/{chapter-verse}.mp3
        // Example: https://everyayah.com/data/Alafasy_128kbps/001001.mp3
        const formattedNumber = this.formatVerseNumber(chapterId, verseNumber);
        const audioUrl = `${AUDIO_CDN_BASE}/${activeReciter.cdnPath}/${formattedNumber}.mp3`;

        // Cache the URL
        this.audioCache.set(cacheKey, audioUrl);

        console.log('Generated audio URL:', audioUrl);
        return audioUrl;
    }

    /**
     * Get audio URL by verse key (e.g., "2:255")
     */
    getAudioUrlByVerseKey(verseKey: string, reciter?: Reciter): string {
        const [chapterStr, verseStr] = verseKey.split(':');
        const chapterId = parseInt(chapterStr);
        const verseNumber = parseInt(verseStr);
        return this.getVerseAudioUrl(chapterId, verseNumber, reciter);
    }

    /**
     * Get audio URLs for multiple verses
     */
    getChapterAudioUrls(chapterId: number, verseCount: number, reciter?: Reciter): string[] {
        const urls: string[] = [];
        for (let i = 1; i <= verseCount; i++) {
            urls.push(this.getVerseAudioUrl(chapterId, i, reciter));
        }
        return urls;
    }

    /**
     * Preload audio for a verse
     */
    async preloadAudio(chapterId: number, verseNumber: number): Promise<void> {
        const url = this.getVerseAudioUrl(chapterId, verseNumber);

        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = url;
            await audio.load();
        } catch (error) {
            console.error('Failed to preload audio:', error);
        }
    }

    /**
     * Clear audio cache
     */
    clearCache(): void {
        this.audioCache.clear();
    }

    /**
     * Get cache size
     */
    getCacheSize(): number {
        return this.audioCache.size;
    }
}

// Export singleton instance
export const audioService = new AudioService();
