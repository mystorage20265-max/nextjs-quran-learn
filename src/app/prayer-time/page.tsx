import type { Metadata } from 'next';
import type { PrayerTimesResponse } from './types';
import PrayerTimePageFunctional from './PrayerTimePageFunctional';

export const metadata: Metadata = {
  title: "Prayer Times - QuranicLearn",
  description:
    "Accurate prayer times for your location with live countdown, reminders, and Qibla direction.",
  keywords: "prayer times, salah, islamic prayer, muslim, quran, azan",
};

const DEFAULT_LAT = '21.3891';
const DEFAULT_LON = '39.8579';
const DEFAULT_LOCATION = 'Mecca, Saudi Arabia';

async function fetchInitialPrayerTimes(): Promise<PrayerTimesResponse | null> {
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${DEFAULT_LAT}&longitude=${DEFAULT_LON}&method=4&school=0`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function PrayerTimePage() {
  const prayerTimes = await fetchInitialPrayerTimes();

  return (
    <PrayerTimePageFunctional
      initialPrayerTimes={prayerTimes}
      initialError={prayerTimes ? null : 'Failed to load prayer times. Please check your connection.'}
      initialCoords={{ lat: DEFAULT_LAT, lon: DEFAULT_LON }}
      initialLocation={DEFAULT_LOCATION}
    />
  );
}