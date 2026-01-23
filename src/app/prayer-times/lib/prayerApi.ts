// Prayer Times API Service
// Using Aladhan API for accurate Islamic prayer times

const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';

export interface PrayerTiming {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird: string;
    Lastthird: string;
}

export interface PrayerData {
    timings: PrayerTiming;
    date: {
        readable: string;
        timestamp: string;
        hijri: {
            date: string;
            format: string;
            day: string;
            weekday: {
                en: string;
                ar: string;
            };
            month: {
                number: number;
                en: string;
                ar: string;
            };
            year: string;
            designation: {
                abbreviated: string;
                expanded: string;
            };
            holidays: string[];
        };
        gregorian: {
            date: string;
            format: string;
            day: string;
            weekday: {
                en: string;
            };
            month: {
                number: number;
                en: string;
            };
            year: string;
            designation: {
                abbreviated: string;
                expanded: string;
            };
        };
    };
    meta: {
        latitude: number;
        longitude: number;
        timezone: string;
        method: {
            id: number;
            name: string;
        };
    };
}

export interface MonthlyPrayerData {
    code: number;
    status: string;
    data: PrayerData[];
}

export interface QiblaData {
    latitude: number;
    longitude: number;
    direction: number;
}

// Calculation Methods
export const CALCULATION_METHODS = [
    { id: 1, name: 'University of Islamic Sciences, Karachi' },
    { id: 2, name: 'Islamic Society of North America (ISNA)' },
    { id: 3, name: 'Muslim World League (MWL)' },
    { id: 4, name: 'Umm Al-Qura University, Makkah' },
    { id: 5, name: 'Egyptian General Authority of Survey' },
    { id: 7, name: 'Institute of Geophysics, University of Tehran' },
    { id: 8, name: 'Gulf Region' },
    { id: 9, name: 'Kuwait' },
    { id: 10, name: 'Qatar' },
    { id: 11, name: 'Majlis Ugama Islam Singapura, Singapore' },
    { id: 12, name: 'Union Organization islamic de France' },
    { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
    { id: 14, name: 'Spiritual Administration of Muslims of Russia' },
];

/**
 * Get prayer times for today by city name
 */
export async function getPrayerTimesByCity(
    city: string,
    country: string,
    method: number = 3 // Default to MWL
): Promise<PrayerData> {
    try {
        const response = await fetch(
            `${ALADHAN_API_BASE}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 200 || !data.data) {
            throw new Error('Failed to fetch prayer times');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching prayer times by city:', error);
        throw error;
    }
}

/**
 * Get prayer times by coordinates (latitude, longitude)
 */
export async function getPrayerTimesByCoordinates(
    latitude: number,
    longitude: number,
    method: number = 3
): Promise<PrayerData> {
    try {
        const response = await fetch(
            `${ALADHAN_API_BASE}/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 200 || !data.data) {
            throw new Error('Failed to fetch prayer times');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching prayer times by coordinates:', error);
        throw error;
    }
}

/**
 * Get monthly prayer times calendar
 */
export async function getMonthlyCalendar(
    latitude: number,
    longitude: number,
    month: number,
    year: number,
    method: number = 3
): Promise<PrayerData[]> {
    try {
        const response = await fetch(
            `${ALADHAN_API_BASE}/calendar?latitude=${latitude}&longitude=${longitude}&method=${method}&month=${month}&year=${year}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data: MonthlyPrayerData = await response.json();

        if (data.code !== 200 || !data.data) {
            throw new Error('Failed to fetch monthly calendar');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching monthly calendar:', error);
        throw error;
    }
}

/**
 * Get Qibla direction from coordinates
 */
export async function getQiblaDirection(
    latitude: number,
    longitude: number
): Promise<QiblaData> {
    try {
        const response = await fetch(
            `${ALADHAN_API_BASE}/qibla/${latitude}/${longitude}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 200 || !data.data) {
            throw new Error('Failed to fetch Qibla direction');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching Qibla direction:', error);
        throw error;
    }
}

/**
 * Get user's location using browser geolocation
 */
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        console.log('Requesting user location...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Location granted:', position.coords);
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.error('Location error:', error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

/**
 * Format time from 24h to 12h format
 */
export function formatTime12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Get current prayer and next prayer
 */
export function getCurrentAndNextPrayer(timings: PrayerTiming): {
    current: { name: string; time: string } | null;
    next: { name: string; time: string } | null;
} {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
        { name: 'Fajr', time: timings.Fajr },
        { name: 'Dhuhr', time: timings.Dhuhr },
        { name: 'Asr', time: timings.Asr },
        { name: 'Maghrib', time: timings.Maghrib },
        { name: 'Isha', time: timings.Isha },
    ];

    const prayerTimes = prayers.map((prayer) => {
        const [hours, minutes] = prayer.time.split(':');
        return {
            name: prayer.name,
            time: prayer.time,
            minutes: parseInt(hours) * 60 + parseInt(minutes),
        };
    });

    let current = null;
    let next = null;

    for (let i = 0; i < prayerTimes.length; i++) {
        if (currentTime >= prayerTimes[i].minutes) {
            current = { name: prayerTimes[i].name, time: prayerTimes[i].time };
            if (i < prayerTimes.length - 1) {
                next = { name: prayerTimes[i + 1].name, time: prayerTimes[i + 1].time };
            } else {
                // After Isha, next is tomorrow's Fajr
                next = { name: "Tomorrow's Fajr", time: prayerTimes[0].time };
            }
        }
    }

    // If before Fajr
    if (!current) {
        next = { name: prayers[0].name, time: prayers[0].time };
    }

    return { current, next };
}

/**
 * Calculate time remaining until next prayer
 */
export function getTimeUntilPrayer(prayerTime: string): string {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':');
    const prayer = new Date();
    prayer.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If prayer time has passed today, set it to tomorrow
    if (prayer < now) {
        prayer.setDate(prayer.getDate() + 1);
    }

    const diff = prayer.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hoursLeft}h ${minutesLeft}m`;
}
