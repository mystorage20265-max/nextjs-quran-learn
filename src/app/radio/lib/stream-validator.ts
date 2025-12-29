/**
 * Stream Validator
 * Validates and monitors audio stream health
 */

export interface StreamQualityMetrics {
    bitrate: number;
    dropouts: number;
    latency: number;
    bufferHealth: number; // 0-100
    isStable: boolean;
}

export class StreamValidator {
    private audioElement: HTMLAudioElement | null = null;
    private metrics: Map<string, StreamQualityMetrics> = new Map();
    private observers: Map<string, ((metrics: StreamQualityMetrics) => void)[]> = new Map();

    /**
     * Validate stream before playback
     */
    async validateStream(streamUrl: string): Promise<boolean> {
        try {
            // Try to fetch stream headers
            const response = await fetch(streamUrl, {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000),
            });

            if (!response.ok) {
                console.warn(`Stream validation failed: ${response.status}`);
                return false;
            }

            // Check content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('audio')) {
                console.warn(`Invalid content type: ${contentType}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Stream validation error:', error);
            return false;
        }
    }

    /**
     * Monitor stream quality
     */
    monitorStream(streamUrl: string, audioElement: HTMLAudioElement): void {
        this.audioElement = audioElement;
        const metrics: StreamQualityMetrics = {
            bitrate: 0,
            dropouts: 0,
            latency: 0,
            bufferHealth: 100,
            isStable: true,
        };

        // Monitor buffer health
        const checkBuffer = () => {
            if (!this.audioElement) return;

            const buffered = this.audioElement.buffered;
            if (buffered.length > 0) {
                const currentTime = this.audioElement.currentTime;
                const bufferedEnd = buffered.end(buffered.length - 1);
                const bufferAhead = bufferedEnd - currentTime;

                metrics.bufferHealth = Math.min(100, (bufferAhead / 30) * 100); // 30s = 100%
                metrics.isStable = bufferAhead > 3; // At least 3s buffered
            }
        };

        // Monitor dropouts
        const onWaiting = () => {
            metrics.dropouts++;
            metrics.isStable = false;
        };

        const onPlaying = () => {
            metrics.isStable = true;
        };

        // Monitor errors
        const onError = () => {
            metrics.isStable = false;
            metrics.bufferHealth = 0;
        };

        audioElement.addEventListener('waiting', onWaiting);
        audioElement.addEventListener('playing', onPlaying);
        audioElement.addEventListener('error', onError);

        // Update metrics every second
        const interval = setInterval(() => {
            checkBuffer();
            this.metrics.set(streamUrl, { ...metrics });
            this.notifyObservers(streamUrl, metrics);
        }, 1000);

        // Cleanup
        audioElement.addEventListener('ended', () => {
            clearInterval(interval);
            audioElement.removeEventListener('waiting', onWaiting);
            audioElement.removeEventListener('playing', onPlaying);
            audioElement.removeEventListener('error', onError);
        }, { once: true });
    }

    /**
     * Get stream metrics
     */
    getMetrics(streamUrl: string): StreamQualityMetrics | null {
        return this.metrics.get(streamUrl) || null;
    }

    /**
     * Subscribe to metric updates
     */
    subscribe(streamUrl: string, callback: (metrics: StreamQualityMetrics) => void): () => void {
        const observers = this.observers.get(streamUrl) || [];
        observers.push(callback);
        this.observers.set(streamUrl, observers);

        // Return unsubscribe function
        return () => {
            const obs = this.observers.get(streamUrl) || [];
            const index = obs.indexOf(callback);
            if (index > -1) {
                obs.splice(index, 1);
            }
        };
    }

    private notifyObservers(streamUrl: string, metrics: StreamQualityMetrics): void {
        const observers = this.observers.get(streamUrl) || [];
        observers.forEach(callback => callback(metrics));
    }

    /**
     * Detect dead stream
     */
    isStreamDead(streamUrl: string): boolean {
        const metrics = this.metrics.get(streamUrl);
        if (!metrics) return false;

        return (
            !metrics.isStable &&
            metrics.bufferHealth === 0 &&
            metrics.dropouts > 5
        );
    }

    /**
     * Get recommended action
     */
    getRecommendedAction(streamUrl: string): 'continue' | 'reconnect' | 'skip' {
        const metrics = this.metrics.get(streamUrl);
        if (!metrics) return 'continue';

        if (this.isStreamDead(streamUrl)) {
            return 'skip';
        }

        if (!metrics.isStable && metrics.dropouts > 3) {
            return 'reconnect';
        }

        return 'continue';
    }
}

// Singleton instance
export const streamValidator = new StreamValidator();
