/**
 * Live Radio API Client
 * Integrates with MP3Quran.net and Islamic-API for real-time radio streams
 */

import { cacheManager } from '../cache-manager';
import { RADIO_CONFIG, buildStreamUrl, getReciterImageUrl, LiveReciter } from '../radio-config';

export interface LiveStation {
    id: string;
    name: string;
    description: string;
    streamUrl: string;
    imageUrl?: string;
    language: string;
    reciterName?: string;
    currentProgram?: string;
    listenerCount?: number;
    bitrate?: number;
    format: 'mp3' | 'aac' | 'ogg';
    isLive: true;
    tags: string[];
    style?: string;
}

interface StreamHealthStatus {
    isAlive: boolean;
    latency: number;
    lastChecked: number;
    errorCount: number;
}

class LiveRadioAPI {
    private healthCache = new Map<string, StreamHealthStatus>();
    private retryDelays = [1000, 2000, 4000]; // Exponential backoff delays

    /**
     * Fetch all live radio stations
     */
    async fetchLiveStations(): Promise<LiveStation[]> {
        // Check cache first
        const cached = await cacheManager.get<LiveStation[]>('live-stations');
        if (cached) {
            return cached;
        }

        try {
            const [mp3QuranStations, configStations] = await Promise.allSettled([
                this.fetchMP3QuranRadios(),
                this.getConfigBasedStations(),
            ]);

            const stations: LiveStation[] = [];

            // Config-based stations take priority (more reliable)
            if (configStations.status === 'fulfilled') {
                stations.push(...configStations.value);
            }

            // Add MP3Quran stations that aren't duplicates
            if (mp3QuranStations.status === 'fulfilled') {
                const existingIds = new Set(stations.map(s => s.reciterName?.toLowerCase()));
                const newStations = mp3QuranStations.value.filter(
                    s => !existingIds.has(s.reciterName?.toLowerCase())
                );
                stations.push(...newStations);
            }

            // Cache for configured TTL
            await cacheManager.set('live-stations', stations, {
                ttl: RADIO_CONFIG.cache.stationsTTL
            });

            return stations;
        } catch (error) {
            console.error('Error fetching live stations:', error);

            // Return cached data even if expired
            const staleCache = await cacheManager.get<LiveStation[]>('live-stations');
            return staleCache || this.getConfigBasedStations();
        }
    }

    /**
     * Get stations from centralized config (reliable fallback)
     * Pre-fetches audio URLs from the Quran.com API
     */
    private async getConfigBasedStations(): Promise<LiveStation[]> {
        // Fetch all audio URLs in parallel
        const stationsWithUrls = await Promise.all(
            RADIO_CONFIG.liveReciters.map(async (reciter: LiveReciter) => {
                const streamUrl = await buildStreamUrl(reciter.id);
                return {
                    id: `live-radio-${reciter.id}`,
                    name: `${reciter.name} - Live Radio`,
                    description: `24/7 Quran recitation by ${reciter.name}`,
                    streamUrl,
                    imageUrl: getReciterImageUrl(reciter.id),
                    language: 'ar',
                    reciterName: reciter.name,
                    bitrate: RADIO_CONFIG.audio.defaultBitrate,
                    format: 'mp3' as const,
                    isLive: true as const,
                    tags: ['live', 'radio', 'reciter', reciter.displayStyle.toLowerCase()],
                    style: reciter.displayStyle,
                };
            })
        );
        // Filter out any stations with empty URLs
        return stationsWithUrls.filter(s => s.streamUrl);
    }

    /**
     * Fetch radios from MP3Quran.net
     */
    private async fetchMP3QuranRadios(): Promise<LiveStation[]> {
        try {
            const response = await this.fetchWithRetry(`${RADIO_CONFIG.apis.mp3quran}/radios`);
            const data = await response.json();

            if (!data.radios || !Array.isArray(data.radios)) {
                return [];
            }

            return data.radios.map((radio: any, index: number) => ({
                id: `mp3quran-${radio.id || index}`,
                name: radio.name || `Radio ${index + 1}`,
                description: radio.description || 'Live Quran Radio',
                streamUrl: radio.url || radio.stream_url,
                imageUrl: radio.image_url || `${RADIO_CONFIG.apis.qurancdn}/images/radio-default.png`,
                language: radio.language || 'ar',
                reciterName: radio.reciter,
                bitrate: radio.bitrate || RADIO_CONFIG.audio.defaultBitrate,
                format: 'mp3' as const,
                isLive: true as const,
                tags: ['live', 'radio', 'quran'],
            }));
        } catch (error) {
            console.error('Error fetching MP3Quran radios:', error);
            return [];
        }
    }

    /**
     * Get metadata for a specific station
     */
    async getStationMetadata(stationId: string): Promise<LiveStation | null> {
        const stations = await this.fetchLiveStations();
        return stations.find(s => s.id === stationId) || null;
    }

    /**
     * Get stream URL with fallback support
     * Tries the primary surah (Al-Fatiha), then falls back to other popular surahs
     */
    async getStreamUrlWithFallback(reciterId: number): Promise<string> {
        // Try different surahs as fallback: 1 (Al-Fatiha), 36 (Ya-Sin), 55 (Ar-Rahman), 67 (Al-Mulk)
        const fallbackSurahs = [1, 36, 55, 67];

        for (const surahNumber of fallbackSurahs) {
            try {
                const url = await buildStreamUrl(reciterId, surahNumber);
                if (url) {
                    const isValid = await this.validateStream(url);
                    if (isValid) return url;
                }
            } catch (error) {
                console.warn(`Surah ${surahNumber} failed for reciter ${reciterId}`);
            }
        }
        // Return primary URL as last resort
        return await buildStreamUrl(reciterId, 1);
    }

    /**
     * Check stream health
     */
    async checkStreamHealth(streamUrl: string): Promise<StreamHealthStatus> {
        // Check cache first
        const cached = this.healthCache.get(streamUrl);
        if (cached && Date.now() - cached.lastChecked < 60000) {
            return cached;
        }

        const startTime = Date.now();
        let isAlive = false;
        let errorCount = cached?.errorCount || 0;

        try {
            const response = await fetch(streamUrl, {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000),
            });

            isAlive = response.ok;
            if (!isAlive) errorCount++;
        } catch (error) {
            isAlive = false;
            errorCount++;
        }

        const status: StreamHealthStatus = {
            isAlive,
            latency: Date.now() - startTime,
            lastChecked: Date.now(),
            errorCount,
        };

        this.healthCache.set(streamUrl, status);
        return status;
    }

    /**
     * Validate stream before playing
     */
    async validateStream(streamUrl: string): Promise<boolean> {
        const health = await this.checkStreamHealth(streamUrl);
        return health.isAlive && health.errorCount < 3;
    }

    /**
     * Fetch with retry logic
     */
    private async fetchWithRetry(
        url: string,
        options?: RequestInit,
        retryCount = 0
    ): Promise<Response> {
        try {
            const response = await fetch(url, {
                ...options,
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok && retryCount < this.retryDelays.length) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response;
        } catch (error) {
            if (retryCount < this.retryDelays.length) {
                await this.delay(this.retryDelays[retryCount]);
                return this.fetchWithRetry(url, options, retryCount + 1);
            }
            throw error;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get stream statistics
     */
    async getStreamStats(): Promise<{
        totalStations: number;
        aliveStations: number;
        averageLatency: number;
    }> {
        const stations = await this.fetchLiveStations();
        const healthChecks = await Promise.all(
            stations.map(s => this.checkStreamHealth(s.streamUrl))
        );

        const aliveStations = healthChecks.filter(h => h.isAlive).length;
        const averageLatency = healthChecks.reduce((sum, h) => sum + h.latency, 0) / healthChecks.length;

        return {
            totalStations: stations.length,
            aliveStations,
            averageLatency,
        };
    }
}

// Singleton instance
export const liveRadioAPI = new LiveRadioAPI();
