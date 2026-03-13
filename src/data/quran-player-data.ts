export interface Track {
  id: number;
  name: string;
  englishName: string;
  translation: string;
  ayahs: number;
  reciter: string;
  reciterId: number;
  audioUrl: string;
  duration: string;
  durationSeconds: number;
  gradient: string;
}

export interface Reciter {
  id: number;
  name: string;
  arabicName: string;
  identifier: string;
  server: string; // mp3quran.net CDN path
  image: string;  // AI-generated cover art
}

export const RECITERS: Reciter[] = [
  { id: 1, name: "Mishary Rashid Alafasy", arabicName: "مشاري العفاسي", identifier: "ar.alafasy", server: "https://server8.mp3quran.net/afs", image: "/images/reciters/alafasy.png" },
  { id: 2, name: "Abdul Basit", arabicName: "عبد الباسط", identifier: "ar.abdulbasitmurattal", server: "https://server7.mp3quran.net/basit", image: "/images/reciters/abdulbasit.png" },
  { id: 3, name: "AbdulRahman Al-Sudais", arabicName: "عبد الرحمن السديس", identifier: "ar.abdurrahmaansudais", server: "https://server11.mp3quran.net/sds", image: "/images/reciters/sudais.png" },
  { id: 5, name: "Maher Al-Muaiqly", arabicName: "ماهر المعيقلي", identifier: "ar.maaboralmueaqly", server: "https://server12.mp3quran.net/maher", image: "/images/reciters/maher.png" },
  { id: 6, name: "Saad Al-Ghamdi", arabicName: "سعد الغامدي", identifier: "ar.saaboralghamdi", server: "https://server7.mp3quran.net/s_gmd", image: "/images/reciters/ghamdi.png" },
  { id: 7, name: "Ahmad Al-Ajmi", arabicName: "أحمد العجمي", identifier: "ar.ahmedajamy", server: "https://server8.mp3quran.net/ajm", image: "/images/reciters/ajmi.png" },
];

export const GRADIENTS = [
  "sp-gradient-1", "sp-gradient-2", "sp-gradient-3", "sp-gradient-4",
  "sp-gradient-5", "sp-gradient-6", "sp-gradient-7", "sp-gradient-8"
];

export const RICH_GRADIENTS = [
  "linear-gradient(135deg, #0d7377 0%, #14a085 50%, #0b5345 100%)",
  "linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #1a252f 100%)",
  "linear-gradient(135deg, #8e44ad 0%, #c0392b 50%, #6c3483 100%)",
  "linear-gradient(135deg, #16a085 0%, #f4d03f 50%, #1abc9c 100%)",
  "linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #922b21 100%)",
  "linear-gradient(135deg, #2980b9 0%, #6dd5fa 50%, #1a5276 100%)",
  "linear-gradient(135deg, #8e44ad 0%, #3498db 50%, #6c3483 100%)",
  "linear-gradient(135deg, #d4a373 0%, #bc6c25 50%, #a0522d 100%)",
  "linear-gradient(135deg, #1d8348 0%, #239b56 50%, #145a32 100%)",
  "linear-gradient(135deg, #6c3483 0%, #a569bd 50%, #512e5f 100%)",
  "linear-gradient(135deg, #1a5276 0%, #2e86c1 50%, #154360 100%)",
  "linear-gradient(135deg, #b03a2e 0%, #e74c3c 50%, #78281f 100%)",
];

export const SURAHS_DATA = [
  { number: 1, name: "Al-Fatihah", translation: "The Opening", ayahs: 7 },
  { number: 2, name: "Al-Baqarah", translation: "The Cow", ayahs: 286 },
  { number: 3, name: "Al-'Imran", translation: "Family of Imran", ayahs: 200 },
  { number: 18, name: "Al-Kahf", translation: "The Cave", ayahs: 110 },
  { number: 19, name: "Maryam", translation: "Mary", ayahs: 98 },
  { number: 36, name: "Ya-Sin", translation: "Ya-Sin", ayahs: 83 },
  { number: 55, name: "Ar-Rahman", translation: "The Beneficent", ayahs: 78 },
  { number: 56, name: "Al-Waqi'a", translation: "The Inevitable", ayahs: 96 },
  { number: 67, name: "Al-Mulk", translation: "The Sovereignty", ayahs: 30 },
  { number: 73, name: "Al-Muzzammil", translation: "The Enshrouded One", ayahs: 20 },
  { number: 78, name: "An-Naba'", translation: "The Tidings", ayahs: 40 },
  { number: 87, name: "Al-A'la", translation: "The Most High", ayahs: 19 },
  { number: 89, name: "Al-Fajr", translation: "The Dawn", ayahs: 30 },
  { number: 90, name: "Al-Balad", translation: "The City", ayahs: 20 },
  { number: 91, name: "Ash-Shams", translation: "The Sun", ayahs: 15 },
  { number: 93, name: "Ad-Duha", translation: "The Morning Hours", ayahs: 11 },
  { number: 94, name: "Ash-Sharh", translation: "The Relief", ayahs: 8 },
  { number: 95, name: "At-Tin", translation: "The Fig", ayahs: 8 },
  { number: 96, name: "Al-'Alaq", translation: "The Clot", ayahs: 19 },
  { number: 97, name: "Al-Qadr", translation: "The Power", ayahs: 5 },
  { number: 99, name: "Az-Zalzalah", translation: "The Earthquake", ayahs: 8 },
  { number: 100, name: "Al-Adiyat", translation: "The Courser", ayahs: 11 },
  { number: 101, name: "Al-Qari'a", translation: "The Calamity", ayahs: 11 },
  { number: 102, name: "At-Takathur", translation: "The Rivalry", ayahs: 8 },
  { number: 103, name: "Al-Asr", translation: "The Declining Day", ayahs: 3 },
  { number: 104, name: "Al-Humazah", translation: "The Traducer", ayahs: 9 },
  { number: 105, name: "Al-Fil", translation: "The Elephant", ayahs: 5 },
  { number: 108, name: "Al-Kawthar", translation: "Abundance", ayahs: 3 },
  { number: 109, name: "Al-Kafirun", translation: "The Disbelievers", ayahs: 6 },
  { number: 110, name: "An-Nasr", translation: "Divine Support", ayahs: 3 },
  { number: 112, name: "Al-Ikhlas", translation: "Sincerity", ayahs: 4 },
  { number: 113, name: "Al-Falaq", translation: "The Daybreak", ayahs: 5 },
  { number: 114, name: "An-Nas", translation: "Mankind", ayahs: 6 },
];

export const QUICK_PLAY_SURAHS = [
  { number: 1, name: "Al-Fatihah" },
  { number: 36, name: "Ya-Sin" },
  { number: 55, name: "Ar-Rahman" },
  { number: 67, name: "Al-Mulk" },
  { number: 18, name: "Al-Kahf" },
  { number: 112, name: "Al-Ikhlas" },
];

export function getAudioUrl(surahNumber: number, reciterServer: string): string {
  const paddedNumber = surahNumber.toString().padStart(3, "0");
  return `${reciterServer}/${paddedNumber}.mp3`;
}

export function estimateDuration(ayahs: number): { display: string; seconds: number } {
  const avgSecondsPerAyah = 12;
  const totalSeconds = ayahs * avgSecondsPerAyah;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { display: `${minutes}:${seconds.toString().padStart(2, "0")}`, seconds: totalSeconds };
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
