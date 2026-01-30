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
}

export const RECITERS: Reciter[] = [
    { id: 7, name: 'Mishary Rashid Alafasy', arabicName: 'مشاري بن راشد العفاسي', slug: 'ar.alafasy', style: 'Murattal' },
    { id: 2, name: 'Abdul Basit', arabicName: 'عبد الباسط عبد الصمد', slug: 'ar.abdulbasitmurattal', style: 'Murattal' },
    { id: 3, name: 'Abdur-Rahman as-Sudais', arabicName: 'عبد الرحمن السديس', slug: 'ar.abdurrahmaansudais', style: 'Murattal' },
    { id: 13, name: 'Saad Al-Ghamdi', arabicName: 'سعد الغامدي', slug: 'ar.saadalghamadi', style: 'Murattal' },
    { id: 12, name: 'Maher Al-Muaiqly', arabicName: 'ماهر المعيقلي', slug: 'ar.mahermuaiqly', style: 'Murattal' },
];

const AUDIO_CDN_BASE = 'https://verses.quran.com';

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
     * Get audio URL for a specific verse
     * @param chapterId Chapter number (1-114)
     * @param verseNumber Verse number
     * @param reciter Optional reciter override
     * @returns Audio URL
     */
    getVerseAudioUrl(chapterId: number, verseNumber: number, reciter?: Reciter): string {
        const activeReciter = reciter || this.currentReciter;
        const verseKey = `${chapterId}:${verseNumber}`;
        const cacheKey = `${activeReciter.slug}_${verseKey}`;

        // Check cache
        if (this.audioCache.has(cacheKey)) {
            return this.audioCache.get(cacheKey)!;
        }

        // Generate URL: https://verses.quran.com/{reciter-slug}/{chapter}:{verse}.mp3
        const audioUrl = `${AUDIO_CDN_BASE}/${activeReciter.slug}/${verseKey}.mp3`;

        // Cache the URL
        this.audioCache.set(cacheKey, audioUrl);

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
