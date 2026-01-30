/**
 * Settings Hook
 * Manages user preferences with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { storageService, UserPreferences } from '../utils/storageService';

interface UseSettingsReturn {
    preferences: UserPreferences;
    updatePreferences: (updates: Partial<UserPreferences>) => void;
    resetPreferences: () => void;
    isLoading: boolean;
}

export function useSettings(): UseSettingsReturn {
    const [preferences, setPreferences] = useState<UserPreferences>(
        storageService.getPreferences()
    );
    const [isLoading, setIsLoading] = useState(true);

    // Load preferences on mount
    useEffect(() => {
        const loaded = storageService.getPreferences();
        setPreferences(loaded);
        setIsLoading(false);
    }, []);

    // Update preferences
    const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
        setPreferences(prev => {
            const updated = { ...prev, ...updates };
            storageService.savePreferences(updated);
            return updated;
        });
    }, []);

    // Reset to defaults
    const resetPreferences = useCallback(() => {
        const defaults = storageService.getPreferences();
        setPreferences(defaults);
        storageService.clearAllData();
    }, []);

    return {
        preferences,
        updatePreferences,
        resetPreferences,
        isLoading,
    };
}
