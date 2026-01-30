/**
 * Tafsir Service
 * Fetches and manages tafsir (Quran commentary) data from Quran.com API
 */

export interface TafsirSource {
    id: number;
    name: string;
    arabicName?: string;
    languageName: string;
    slug: string;
}

export interface TafsirText {
    id: number;
    verseKey: string;
    text: string;
    resourceId: number;
    resourceName: string;
    languageName: string;
}

// Available Tafsir sources from Quran.com
export const TAFSIR_SOURCES: TafsirSource[] = [
    {
        id: 169,
        name: 'Tafsir Ibn Kathir',
        languageName: 'English',
        slug: 'en-tafisr-ibn-kathir',
    },
    {
        id: 168,
        name: 'Maarif-ul-Quran',
        languageName: 'English',
        slug: 'en-tafsir-maarif-ul-quran',
    },
    {
        id: 93,
        name: 'Tafheem-ul-Quran - Abul Ala Maududi',
        languageName: 'English',
        slug: 'en-tafseer-tafheem-ul-quran',
    },
];

export const DEFAULT_TAFSIR = TAFSIR_SOURCES[0];

class TafsirService {
    private cache: Map<string, TafsirText> = new Map();
    private currentSource: TafsirSource = DEFAULT_TAFSIR;

    setSource(source: TafsirSource) {
        this.currentSource = source;
    }

    getCurrentSource(): TafsirSource {
        return this.currentSource;
    }

    /**
     * Fetch tafsir for a specific verse
     */
    async fetchTafsir(verseKey: string): Promise<TafsirText | null> {
        const cacheKey = `${this.currentSource.id}:${verseKey}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        try {
            const response = await fetch(
                `https://api.quran.com/api/v4/quran/tafsirs/${this.currentSource.id}?verse_key=${verseKey}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch tafsir: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.tafsirs && data.tafsirs.length > 0) {
                const tafsir = data.tafsirs[0];
                const tafsirText: TafsirText = {
                    id: tafsir.id,
                    verseKey: tafsir.verse_key,
                    text: tafsir.text,
                    resourceId: tafsir.resource_id,
                    resourceName: tafsir.resource_name,
                    languageName: tafsir.language_name,
                };

                this.cache.set(cacheKey, tafsirText);
                return tafsirText;
            }

            return null;
        } catch (error) {
            console.error('Error fetching tafsir:', error);
            return null;
        }
    }

    /**
     * Fetch tafsir for multiple verses
     */
    async fetchTafsirBulk(verseKeys: string[]): Promise<Map<string, TafsirText>> {
        const results = new Map<string, TafsirText>();

        // Fetch in parallel
        const promises = verseKeys.map(async (verseKey) => {
            const tafsir = await this.fetchTafsir(verseKey);
            if (tafsir) {
                results.set(verseKey, tafsir);
            }
        });

        await Promise.all(promises);
        return results;
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    getCacheSize(): number {
        return this.cache.size;
    }
}

export const tafsirService = new TafsirService();
