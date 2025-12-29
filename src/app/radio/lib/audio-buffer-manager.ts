/**
 * Advanced Audio Buffer Manager
 * Handles intelligent buffering and gapless playback
 */

interface BufferStatus {
    loaded: number; // Percentage 0-100
    buffered: number; // Seconds buffered ahead
    isBuffering: boolean;
    downloadSpeed: number; // KB/s
}

export class AudioBufferManager {
    private audioElement: HTMLAudioElement | null = null;
    private nextTrackAudio: HTMLAudioElement | null = null;
    private bufferStatusCallbacks: ((status: BufferStatus) => void)[] = [];
    private lastProgressUpdate = 0;

    /**
     * Initialize buffer manager with audio element
     */
    initialize(audioElement: HTMLAudioElement): void {
        this.audioElement = audioElement;
        this.setupEventListeners();
    }

    /**
     * Pre-buffer next track for gapless playback
     */
    async preBufferNextTrack(url: string): Promise<void> {
        if (!this.nextTrackAudio) {
            this.nextTrackAudio = new Audio();
        }

        this.nextTrackAudio.src = url;
        this.nextTrackAudio.preload = 'auto';

        // Start loading
        this.nextTrackAudio.load();
    }

    /**
     * Switch to pre-buffered track
     */
    switchToNextTrack(): HTMLAudioElement | null {
        if (!this.nextTrackAudio) return null;

        const temp = this.audioElement;
        this.audioElement = this.nextTrackAudio;
        this.nextTrackAudio = temp;

        this.setupEventListeners();
        return this.audioElement;
    }

    /**
     * Get current buffer status
     */
    getBufferStatus(): BufferStatus {
        if (!this.audioElement) {
            return {
                loaded: 0,
                buffered: 0,
                isBuffering: false,
                downloadSpeed: 0,
            };
        }

        const buffered = this.audioElement.buffered;
        let bufferedSeconds = 0;

        if (buffered.length > 0) {
            const currentTime = this.audioElement.currentTime;
            const bufferedEnd = buffered.end(buffered.length - 1);
            bufferedSeconds = bufferedEnd - currentTime;
        }

        return {
            loaded: this.calculateLoadedPercentage(),
            buffered: bufferedSeconds,
            isBuffering: this.audioElement.readyState < 3,
            downloadSpeed: this.calculateDownloadSpeed(),
        };
    }

    /**
     * Monitor buffer and optimize
     */
    optimizeBuffer(): void {
        if (!this.audioElement) return;

        const status = this.getBufferStatus();

        // If buffer is low, pause momentarily to build up buffer
        if (status.buffered < 2 && !this.audioElement.paused) {
            console.log('Buffer low, building up...');
            // Could implement pause/resume logic here if needed
        }

        // Notify listeners
        this.notifyBufferStatus(status);
    }

    /**
     * Subscribe to buffer status updates
     */
    onBufferStatusChange(callback: (status: BufferStatus) => void): () => void {
        this.bufferStatusCallbacks.push(callback);
        return () => {
            const index = this.bufferStatusCallbacks.indexOf(callback);
            if (index > -1) {
                this.bufferStatusCallbacks.splice(index, 1);
            }
        };
    }

    private setupEventListeners(): void {
        if (!this.audioElement) return;

        this.audioElement.addEventListener('progress', () => this.optimizeBuffer());
        this.audioElement.addEventListener('waiting', () => this.optimizeBuffer());
        this.audioElement.addEventListener('canplay', () => this.optimizeBuffer());
    }

    private calculateLoadedPercentage(): number {
        if (!this.audioElement) return 0;

        const buffered = this.audioElement.buffered;
        if (buffered.length === 0) return 0;

        const duration = this.audioElement.duration;
        if (!duration || duration === Infinity) return 0;

        let bufferedTotal = 0;
        for (let i = 0; i < buffered.length; i++) {
            bufferedTotal += buffered.end(i) - buffered.start(i);
        }

        return (bufferedTotal / duration) * 100;
    }

    private calculateDownloadSpeed(): number {
        // Simplified download speed calculation
        // In a real implementation, track bytes downloaded over time
        return 0;
    }

    private notifyBufferStatus(status: BufferStatus): void {
        this.bufferStatusCallbacks.forEach(callback => callback(status));
    }

    /**
     * Clear buffer cache
     */
    clear(): void {
        if (this.audioElement) {
            this.audioElement.src = '';
            this.audioElement.load();
        }
        if (this.nextTrackAudio) {
            this.nextTrackAudio.src = '';
            this.nextTrackAudio.load();
        }
    }
}

export const audioBufferManager = new AudioBufferManager();
