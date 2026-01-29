import React, { useEffect, useRef, useState } from "react";
import * as quranComApi from '@/services/quranComApi';

type Ayah = {
  number: number;
  numberInSurah?: number;
  surah?: { number: number; englishName?: string; name?: string };
  text?: string;
  translation?: string;
};

type JuzPlayerProps = {
  juz: number;
  arabicEdition?: string;
  translationEdition?: string;
  audioEdition?: string;
};

// --- AudioManager class ---
class AudioManager {
  audio: HTMLAudioElement;
  onEnded?: () => void;
  onError?: (err: any) => void;
  private retryCount = 0;
  private maxRetries = 2;
  private currentMeta?: { ayahNumber: number; url: string };
  constructor() {
    this.audio = new Audio();
    this.audio.onended = () => this.onEnded?.();
    this.audio.onerror = (e) => this.handleError(e);
  }
  async play(meta: { ayahNumber: number; url: string }) {
    if (this.currentMeta?.ayahNumber !== meta.ayahNumber) {
      this.audio.src = meta.url;
      this.audio.load();
      this.currentMeta = meta;
      this.retryCount = 0;
    }
    try {
      await this.audio.play();
    } catch (err) {
      this.onError?.(err);
    }
  }
  pause() { this.audio.pause(); }
  stop() { this.pause(); this.audio.currentTime = 0; }
  private handleError(e: any) {
    if (this.retryCount < this.maxRetries && this.currentMeta) {
      this.retryCount++;
      setTimeout(() => this.play(this.currentMeta!), 300 * this.retryCount);
    } else {
      this.onError?.(e);
    }
  }
}

// --- Main JuzPlayer component ---
export default function JuzPlayer({ juz }: JuzPlayerProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [audioMap, setAudioMap] = useState<Map<number, { ayahNumber: number; url: string }>>(new Map());
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [errorAyahs, setErrorAyahs] = useState<Set<number>>(new Set());
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);

  // Server fetch: merge Arabic + English
  useEffect(() => {
    async function fetchJuzData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch juz data with translation using Quran.com API
        const { verses } = await quranComApi.getVersesByJuz(juz, {
          translations: 131, // Sahih International
          words: false
        });

        // Map to expected format
        const merged = verses.map((verse: any) => ({
          number: verse.id,
          numberInSurah: verse.verse_number,
          surah: {
            number: verse.verse_key.split(':')[0],
            name: '', // Not needed for display
            englishName: ''
          },
          text: verse.text_uthmani,
          translation: verse.translations?.[0]?.text || ''
        }));

        setAyahs(merged);
      } catch (err) {
        setError("Failed to load Juz or translation. Try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchJuzData();
  }, [juz]);

  // Build audio map using Quran.com CDN
  useEffect(() => {
    if (ayahs.length === 0) return;

    const map = new Map();

    // Generate audio URLs using Quran.com CDN (reciter ID 7 = Alafasy)
    ayahs.forEach((ayah) => {
      const surahNum = typeof ayah.surah === 'object' ? ayah.surah.number : ayah.surah;
      const audioUrl = `https://verses.quran.com/7/${surahNum}_${ayah.numberInSurah}.mp3`;
      map.set(ayah.number, { ayahNumber: ayah.number, url: audioUrl });
    });

    setAudioMap(map);
  }, [ayahs]);

  // AudioManager setup
  useEffect(() => {
    audioManagerRef.current = new AudioManager();
    const mgr = audioManagerRef.current;
    mgr.onEnded = () => {
      if (autoplay && currentIndex !== null && currentIndex + 1 < ayahs.length) playIndex(currentIndex + 1);
      else setPlaying(false);
    };
    mgr.onError = (err) => {
      setAudioError("Audio error: " + (err?.message || "Unknown"));
      setPlaying(false);
      if (autoplay && currentIndex !== null) playIndex(currentIndex + 1);
    };
    return () => mgr.stop();
  }, [autoplay, ayahs.length, currentIndex]);

  function playIndex(idx: number) {
    const ayah = ayahs[idx];
    const meta = audioMap.get(ayah.number);
    if (!meta) {
      setErrorAyahs(prev => new Set(prev).add(ayah.number));
      setAudioError("Audio missing for ayah " + ayah.number);
      if (autoplay) playIndex(idx + 1);
      return;
    }
    setCurrentIndex(idx);
    setPlaying(true);
    setAudioError(null);
    audioManagerRef.current?.play(meta);
  }

  function togglePlayPause(idx: number) {
    if (currentIndex === idx && playing) {
      audioManagerRef.current?.pause();
      setPlaying(false);
    } else {
      playIndex(idx);
    }
  }

  function playNext() { if (currentIndex !== null && currentIndex + 1 < ayahs.length) playIndex(currentIndex + 1); }
  function playPrev() { if (currentIndex !== null && currentIndex > 0) playIndex(currentIndex - 1); }

  if (loading) return <div>Loading Juz...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      {audioError && <div style={{ color: "red" }}>{audioError}</div>}
      <div>
        <button onClick={() => currentIndex !== null ? togglePlayPause(currentIndex) : playIndex(0)}>
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={playPrev}>Prev</button>
        <button onClick={playNext}>Next</button>
        <label>
          <input type="checkbox" checked={autoplay} onChange={() => setAutoplay(v => !v)} />
          Autoplay
        </label>
      </div>
      <ol>
        {ayahs.map((a, i) => (
          <li key={a.number} style={{ marginBottom: 12 }}>
            <button onClick={() => togglePlayPause(i)} aria-label={`Play verse ${a.number}`}>
              {currentIndex === i && playing ? "Pause" : "Play"}
            </button>
            <div>
              <div><strong>Surah {a.surah?.englishName ?? a.surah?.name} - Ayah {a.numberInSurah}</strong></div>
              <div style={{ fontFamily: "scheherazade, serif", fontSize: 22 }}>{a.text}</div>
              <div style={{ color: "#444" }}>{a.translation || <span style={{ color: "orange" }}>No translation</span>}</div>
            </div>
            {errorAyahs.has(a.number) && <span title="Audio failed">⚠️</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
