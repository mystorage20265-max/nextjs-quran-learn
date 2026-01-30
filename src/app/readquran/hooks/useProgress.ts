/**
 * Progress Tracking Hook
 * Tracks reading progress, streaks, and time spent
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService, ReadingProgress } from '../utils/storageService';

interface UseProgressReturn {
    progress: ReadingProgress;
    markAsRead: (verseKey: string) => void;
    isVerseRead: (verseKey: string) => boolean;
    totalVersesRead: number;
    readingStreak: number;
    totalTimeSpent: number;
    formattedReadingTime: string;
}

export function useProgress(): UseProgressReturn {
    const [progress, setProgress] = useState<ReadingProgress>(
        storageService.getProgress()
    );
    const timeTracker = useRef<number>(0);
    const lastUpdate = useRef<number>(Date.now());

    // Load progress on mount
    useEffect(() => {
        const loaded = storageService.getProgress();
        setProgress(loaded);
    }, []);

    // Track time spent
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = (now - lastUpdate.current) / 1000; // seconds

            if (elapsed > 0 && elapsed < 10) { // Only count if reasonable interval
                timeTracker.current += elapsed;

                // Save every 30 seconds
                if (timeTracker.current >= 30) {
                    storageService.addReadingTime(timeTracker.current);
                    setProgress(storageService.getProgress());
                    timeTracker.current = 0;
                }
            }

            lastUpdate.current = now;
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Mark verse as read
    const markAsRead = useCallback((verseKey: string) => {
        storageService.markVerseAsRead(verseKey);
        setProgress(storageService.getProgress());
    }, []);

    // Check if verse is read
    const isVerseRead = useCallback((verseKey: string) => {
        return progress.versesRead.has(verseKey);
    }, [progress]);

    // Format reading time
    const formattedReadingTime = useCallback(() => {
        const totalSeconds = progress.totalTimeSpent;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }, [progress.totalTimeSpent])();

    return {
        progress,
        markAsRead,
        isVerseRead,
        totalVersesRead: progress.versesRead.size,
        readingStreak: progress.readingStreak,
        totalTimeSpent: progress.totalTimeSpent,
        formattedReadingTime,
    };
}
