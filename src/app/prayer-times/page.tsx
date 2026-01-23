'use client';

import { useState, useEffect } from 'react';
import {
    getPrayerTimesByCity,
    getPrayerTimesByCoordinates,
    getUserLocation,
    formatTime12Hour,
    getCurrentAndNextPrayer,
    CALCULATION_METHODS,
    type PrayerData,
} from './lib/prayerApi';
import AnalogClock from './components/AnalogClock';
import './prayer-times.css';

// Get precise time until prayer in HH:MM:SS format
function getPreciseTimeUntilPrayer(prayerTime: string): string {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':');
    const prayer = new Date();
    prayer.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (prayer < now) {
        prayer.setDate(prayer.getDate() + 1);
    }

    const diff = prayer.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
}

export default function PrayerTimesPage() {
    const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

    const [city, setCity] = useState('Bengaluru');
    const [country, setCountry] = useState('India');
    const [calculationMethod, setCalculationMethod] = useState(3);
    const [showSettings, setShowSettings] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userLocation, setUserLocation] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (locationPermission === 'granted' || locationPermission === 'denied') {
            loadPrayerTimes();
        }
    }, [city, country, calculationMethod, locationPermission]);

    async function requestLocationAndLoadPrayerTimes() {
        try {
            setLoading(true);
            setError(null);

            console.log('Requesting location permission...');
            const location = await getUserLocation();
            console.log('Location received:', location);

            setLocationPermission('granted');
            const data = await getPrayerTimesByCoordinates(location.latitude, location.longitude, calculationMethod);
            console.log('Prayer times loaded:', data);

            // Set location display
            const locationStr = `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`;
            setUserLocation(locationStr);

            setPrayerData(data);
        } catch (err: any) {
            console.error('Location request failed:', err);
            setLocationPermission('denied');

            // Provide more specific error messages
            let errorMessage = 'Location permission denied. Using default location.';
            if (err?.code === 1) {
                errorMessage = 'Location permission denied. Using default location.';
            } else if (err?.code === 2) {
                errorMessage = 'Location unavailable. Using default location.';
            } else if (err?.code === 3) {
                errorMessage = 'Location request timeout. Using default location.';
            }
            setError(errorMessage);

            // Fallback to default city
            try {
                const data = await getPrayerTimesByCity(city, country, calculationMethod);
                setPrayerData(data);
            } catch (cityErr) {
                setError('Failed to load prayer times');
            }
        } finally {
            setLoading(false);
        }
    }

    async function loadPrayerTimes() {
        try {
            setLoading(true);
            setError(null);

            if (locationPermission === 'granted') {
                try {
                    const location = await getUserLocation();
                    const data = await getPrayerTimesByCoordinates(location.latitude, location.longitude, calculationMethod);

                    // Set location from coordinates
                    const locationStr = `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`;
                    setUserLocation(locationStr);

                    setPrayerData(data);
                    return;
                } catch (err) {
                    console.error('Failed to get location:', err);
                }
            }

            // Use city if location not available
            const data = await getPrayerTimesByCity(city, country, calculationMethod);
            setUserLocation(`${city}, ${country}`);
            setPrayerData(data);
        } catch (err) {
            setError('Failed to load prayer times');
        } finally {
            setLoading(false);
        }
    }

    // Show location permission request screen initially
    if (locationPermission === 'prompt') {
        return (
            <div className="prayer-times-page">
                <div className="prayer-times-container">
                    <div className="location-prompt">
                        <div className="location-prompt-icon">📍</div>
                        <h2 className="location-prompt-title">Allow Location Access</h2>
                        <p className="location-prompt-description">
                            We need your location to provide accurate prayer times for your area.
                            Your location data is only used for this purpose and is not stored.
                        </p>
                        <button
                            onClick={requestLocationAndLoadPrayerTimes}
                            className="location-prompt-button"
                        >
                            Enable Location
                        </button>
                        <button
                            onClick={() => {
                                setLocationPermission('denied');
                                loadPrayerTimes();
                            }}
                            className="location-prompt-button-secondary"
                        >
                            Use Default Location ({city}, {country})
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="prayer-times-page">
                <div className="prayer-times-container">
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '4px solid rgba(245, 158, 11, 0.3)',
                            borderTop: '4px solid #f59e0b',
                            borderRadius: '50%',
                            margin: '0 auto 24px',
                            animation: 'spin 1s linear infinite',
                        }} />
                        <p>Loading prayer times...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !prayerData) {
        return (
            <div className="prayer-times-page">
                <div className="prayer-times-container">
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <p style={{ color: '#f59e0b', marginBottom: '24px' }}>{error || 'Failed to load'}</p>
                        <button
                            onClick={loadPrayerTimes}
                            style={{ padding: '12px 24px', background: '#f59e0b', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { current, next } = getCurrentAndNextPrayer(prayerData.timings);
    const allPrayers = [
        { name: 'FAJR', time: prayerData.timings.Fajr },
        { name: 'SUNRISE', time: prayerData.timings.Sunrise },
        { name: 'DHUHR', time: prayerData.timings.Dhuhr },
        { name: 'ASR', time: prayerData.timings.Asr },
        { name: 'MAGRIB', time: prayerData.timings.Maghrib },
        { name: 'ISHA', time: prayerData.timings.Isha },
    ];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const progressPercent = (currentMinutes / (24 * 60)) * 100;

    return (
        <div className="prayer-times-page">
            <div className="prayer-times-container">
                <div className="enhanced-prayer-display">
                    {/* Date Header */}
                    <div className="date-header">
                        <div className="gregorian-date">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} - {prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year}
                        </div>
                        {userLocation && (
                            <div className="location-display">
                                <span className="location-icon">📍</span>
                                <span className="location-text">{userLocation}</span>
                            </div>
                        )}
                    </div>

                    <div className="content-wrapper">
                        {/* Clock */}
                        <div className="clock-section">
                            <AnalogClock />
                        </div>

                        {/* Countdown */}
                        {next && (
                            <>
                                <div className="countdown-section">
                                    <div className="countdown-label">
                                        {next.name.toUpperCase()} AFTER : <span className="countdown-time">{getPreciseTimeUntilPrayer(next.time)}</span>
                                    </div>
                                </div>

                                <div className="progress-container">
                                    <div className="progress-bar" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                                </div>
                            </>
                        )}

                        {/* Prayer Times */}
                        <div className="prayers-list">
                            {allPrayers.map((prayer) => (
                                <div key={prayer.name} className="prayer-list-item">
                                    <div className="prayer-name">{prayer.name}</div>
                                    <div className="prayer-time">{formatTime12Hour(prayer.time)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="footer">Powered by Learn Quran App  </div>
                </div>
            </div>

            {/* Settings */}
            <button className="settings-toggle-btn" onClick={() => setShowSettings(!showSettings)}>⚙️</button>

            <div className={`settings-panel ${showSettings ? 'open' : ''}`}>
                <div className="settings-header">
                    <h3 className="settings-title">Settings</h3>
                    <button className="settings-close" onClick={() => setShowSettings(false)}>×</button>
                </div>

                <div className="settings-section">
                    <label className="settings-label">City</label>
                    <input type="text" className="settings-input" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div className="settings-section">
                    <label className="settings-label">Country</label>
                    <input type="text" className="settings-input" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>

                <div className="settings-section">
                    <label className="settings-label">Method</label>
                    <select className="settings-select" value={calculationMethod} onChange={(e) => setCalculationMethod(parseInt(e.target.value))}>
                        {CALCULATION_METHODS.map((method) => (
                            <option key={method.id} value={method.id}>{method.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={loadPrayerTimes}
                    style={{ width: '100%', padding: '14px', background: '#f59e0b', border: 'none', borderRadius: '8px', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '24px' }}
                >
                    Apply Changes
                </button>
            </div>

            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
