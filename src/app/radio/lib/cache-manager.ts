/**
 * Advanced Cache Manager
 * Handles intelligent caching with IndexedDB and localStorage
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
    key: string;
}

interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    storage?: 'localStorage' | 'indexedDB' | 'memory';
}

class CacheManager {
    private memoryCache = new Map<string, CacheEntry<any>>();
    private maxMemorySize = 50; // Maximum items in memory cache

    /**
     * Get data from cache
     */
    async get<T>(key: string): Promise<T | null> {
        // Try memory cache first
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && !this.isExpired(memoryEntry)) {
            return memoryEntry.data as T;
        }

        // Try localStorage
        const localEntry = this.getFromLocalStorage<T>(key);
        if (localEntry && !this.isExpired(localEntry)) {
            // Promote to memory cache
            this.setInMemory(key, localEntry.data, localEntry.ttl);
            return localEntry.data;
        }

        // Try IndexedDB
        const idbEntry = await this.getFromIndexedDB<T>(key);
        if (idbEntry && !this.isExpired(idbEntry)) {
            // Promote to memory cache
            this.setInMemory(key, idbEntry.data, idbEntry.ttl);
            return idbEntry.data;
        }

        return null;
    }

    /**
     * Set data in cache
     */
    async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
        const ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl,
            key,
        };

        // Always set in memory
        this.setInMemory(key, data, ttl);

        // Set in localStorage for small data
        if (options.storage === 'localStorage' || this.isSmallData(data)) {
            this.setInLocalStorage(key, entry);
        }

        // Set in IndexedDB for large data
        if (options.storage === 'indexedDB' || !this.isSmallData(data)) {
            await this.setInIndexedDB(key, entry);
        }
    }

    /**
     * Clear cache by key or pattern
     */
    async clear(keyOrPattern?: string): Promise<void> {
        if (!keyOrPattern) {
            // Clear all
            this.memoryCache.clear();
            localStorage.clear();
            await this.clearIndexedDB();
            return;
        }

        // Clear specific key or pattern
        const isPattern = keyOrPattern.includes('*');

        if (isPattern) {
            const regex = new RegExp(keyOrPattern.replace('*', '.*'));

            // Clear from memory
            for (const key of this.memoryCache.keys()) {
                if (regex.test(key)) {
                    this.memoryCache.delete(key);
                }
            }

            // Clear from localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && regex.test(key)) {
                    localStorage.removeItem(key);
                }
            }

            // Clear from IndexedDB
            await this.clearIndexedDBByPattern(regex);
        } else {
            this.memoryCache.delete(keyOrPattern);
            localStorage.removeItem(keyOrPattern);
            await this.deleteFromIndexedDB(keyOrPattern);
        }
    }

    /**
     * Clean up expired entries
     */
    async cleanup(): Promise<void> {
        // Clean memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
            if (this.isExpired(entry)) {
                this.memoryCache.delete(key);
            }
        }

        // Clean localStorage - only process valid cache entries
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key) {
                try {
                    const entry = this.getFromLocalStorage(key);
                    if (entry && this.isExpired(entry)) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    // Skip non-cache items
                    continue;
                }
            }
        }

        // Clean IndexedDB
        await this.cleanupIndexedDB();
    }

    private isExpired<T>(entry: CacheEntry<T>): boolean {
        return Date.now() - entry.timestamp > entry.ttl;
    }

    private isSmallData(data: any): boolean {
        const size = JSON.stringify(data).length;
        return size < 5000; // Less than 5KB
    }

    private setInMemory<T>(key: string, data: T, ttl: number): void {
        // LRU eviction if cache is full
        if (this.memoryCache.size >= this.maxMemorySize) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
        }

        this.memoryCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
            key,
        });
    }

    private getFromLocalStorage<T>(key: string): CacheEntry<T> | null {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const parsed = JSON.parse(item);

            // Validate it's a cache entry with required fields
            if (typeof parsed === 'object' && parsed !== null &&
                'data' in parsed && 'timestamp' in parsed && 'ttl' in parsed) {
                return parsed as CacheEntry<T>;
            }

            return null; // Not a cache entry
        } catch (error) {
            // Invalid JSON - skip it
            return null;
        }
    }

    private setInLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
        try {
            localStorage.setItem(key, JSON.stringify(entry));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    }

    private async getFromIndexedDB<T>(key: string): Promise<CacheEntry<T> | null> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['cache'], 'readonly');
                const store = transaction.objectStore('cache');
                const request = store.get(key);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error reading from IndexedDB:', error);
            return null;
        }
    }

    private async setInIndexedDB<T>(key: string, entry: CacheEntry<T>): Promise<void> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.put(entry);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error writing to IndexedDB:', error);
        }
    }

    private async deleteFromIndexedDB(key: string): Promise<void> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.delete(key);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting from IndexedDB:', error);
        }
    }

    private async clearIndexedDB(): Promise<void> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error clearing IndexedDB:', error);
        }
    }

    private async clearIndexedDBByPattern(regex: RegExp): Promise<void> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.openCursor();

                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest).result;
                    if (cursor) {
                        if (regex.test(cursor.value.key)) {
                            cursor.delete();
                        }
                        cursor.continue();
                    } else {
                        resolve();
                    }
                };

                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error clearing IndexedDB by pattern:', error);
        }
    }

    private async cleanupIndexedDB(): Promise<void> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.openCursor();

                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest).result;
                    if (cursor) {
                        if (this.isExpired(cursor.value)) {
                            cursor.delete();
                        }
                        cursor.continue();
                    } else {
                        resolve();
                    }
                };

                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error cleaning up IndexedDB:', error);
        }
    }

    private async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('QuranRadioCache', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('cache')) {
                    db.createObjectStore('cache', { keyPath: 'key' });
                }
            };
        });
    }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        cacheManager.cleanup();
    }, 5 * 60 * 1000);
}
