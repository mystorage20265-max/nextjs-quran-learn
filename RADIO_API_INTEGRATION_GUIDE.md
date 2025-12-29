# Radio API - Complete Integration Guide

## Quick Start

### 1. Fetch All Reciters
```typescript
// Get all available reciters
const reciters = await fetch('/api/radio/reciters').then(r => r.json());

// Response:
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "AbdulBaset AbdulSamad",
      "arabicName": "عبد الباسط عبد الصمد",
      "style": "Mujawwad",
      "imageUrl": "https://...",
      "fullName": "AbdulBaset AbdulSamad (Mujawwad)"
    },
    // ... 13 more reciters
  ],
  "cache": "HIT",
  "count": 14
}
```

### 2. Get Audio URLs for a Surah
```typescript
// Get all verses for Surah Al-Fatiha (1) by reciter 2
const audioUrls = await fetch(
  '/api/radio/audio?reciterId=2&surahNumber=1'
).then(r => r.json());

// Response:
{
  "status": "success",
  "surah": {
    "number": 1,
    "name": "Al-Fatiha",
    "arabicName": "الفاتحة",
    "versesCount": 7
  },
  "reciter": {
    "id": 2,
    "name": "AbdulBaset AbdulSamad - Murattal",
    "availableQualities": ["128k", "192k", "320k"]
  },
  "audio": {
    "totalVerses": 7,
    "verses": [
      {
        "verseKey": "1:1",
        "url": "/api/radio/audio-stream?reciterId=2&verseKey=1:1",
        "duration": 6.5
      },
      // ... 6 more verses
    ]
  }
}
```

### 3. Stream Audio Verse
```typescript
// Stream a single verse
const audio = new Audio(
  '/api/radio/audio-stream?reciterId=2&verseKey=1:1'
);
audio.play();
```

### 4. Get Streaming Metadata
```typescript
// Get ready-to-stream metadata with all URLs
const proxy = await fetch(
  '/api/radio/audio-proxy?reciterId=2&surahNumber=1'
).then(r => r.json());

// Use proxy.audio.verses array to build playlist
```

---

## Advanced Usage

### Filter by Verse Range
```typescript
// Get only verses 1-7 from Surah Al-Fatiha
const verses = await fetch(
  '/api/radio/audio?reciterId=2&surahNumber=1&verseStart=1&verseEnd=7'
).then(r => r.json());
```

### Select Audio Quality
```typescript
// Request specific quality (if available for reciter)
const quality = await fetch(
  '/api/radio/audio?reciterId=1&surahNumber=1&quality=320k'
).then(r => r.json());
```

### Stream Multiple Verses
```typescript
// Create a playlist from audio URLs
async function streamSurah(reciterId, surahNumber) {
  const data = await fetch(
    `/api/radio/audio?reciterId=${reciterId}&surahNumber=${surahNumber}`
  ).then(r => r.json());

  return data.audio.verses.map(verse => ({
    verseKey: verse.verseKey,
    url: verse.url,
    duration: verse.duration
  }));
}

// Usage
const playlist = await streamSurah(2, 1);
console.log(playlist);
// [
//   { verseKey: '1:1', url: '/api/radio/audio-stream?...', duration: 6.5 },
//   { verseKey: '1:2', url: '/api/radio/audio-stream?...', duration: 7.2 },
//   ...
// ]
```

---

## React Component Example

### Radio Player Component
```typescript
import React, { useState, useEffect } from 'react';

interface AudioVerse {
  verseKey: string;
  url: string;
  duration: number;
}

interface SurahAudio {
  surah: {
    number: number;
    name: string;
    arabicName: string;
  };
  audio: {
    verses: AudioVerse[];
  };
}

export function RadioPlayer() {
  const [reciters, setReciters] = useState<any[]>([]);
  const [selectedReciter, setSelectedReciter] = useState(2);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [audioData, setAudioData] = useState<SurahAudio | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Fetch reciters on mount
  useEffect(() => {
    fetch('/api/radio/reciters')
      .then(r => r.json())
      .then(data => setReciters(data.data))
      .catch(err => console.error('Failed to fetch reciters:', err));
  }, []);

  // Fetch audio data when reciter or surah changes
  useEffect(() => {
    fetch(
      `/api/radio/audio?reciterId=${selectedReciter}&surahNumber=${selectedSurah}`
    )
      .then(r => r.json())
      .then(data => {
        setAudioData(data);
        setCurrentVerseIndex(0);
      })
      .catch(err => console.error('Failed to fetch audio:', err));
  }, [selectedReciter, selectedSurah]);

  if (!audioData) return <div>Loading...</div>;

  const currentVerse = audioData.audio.verses[currentVerseIndex];

  return (
    <div className="radio-player">
      <div className="controls">
        <select value={selectedReciter} onChange={e => setSelectedReciter(Number(e.target.value))}>
          {reciters.map(r => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <select value={selectedSurah} onChange={e => setSelectedSurah(Number(e.target.value))}>
          {Array.from({ length: 114 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Surah {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="player">
        <audio
          ref={audioRef}
          src={currentVerse?.url}
          onEnded={() => {
            if (currentVerseIndex < audioData.audio.verses.length - 1) {
              setCurrentVerseIndex(currentVerseIndex + 1);
            }
          }}
          controls
        />

        <div className="info">
          <h3>{audioData.surah.name} - Verse {currentVerse?.verseKey}</h3>
          <p>{currentVerseIndex + 1} of {audioData.audio.verses.length}</p>
        </div>

        <button onClick={() => audioRef.current?.play()}>Play</button>
        <button onClick={() => audioRef.current?.pause()}>Pause</button>
        <button 
          onClick={() => setCurrentVerseIndex(Math.max(0, currentVerseIndex - 1))}
          disabled={currentVerseIndex === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentVerseIndex(Math.min(audioData.audio.verses.length - 1, currentVerseIndex + 1))}
          disabled={currentVerseIndex === audioData.audio.verses.length - 1}
        >
          Next
        </button>
      </div>

      <div className="playlist">
        {audioData.audio.verses.map((verse, index) => (
          <div
            key={verse.verseKey}
            onClick={() => setCurrentVerseIndex(index)}
            className={index === currentVerseIndex ? 'active' : ''}
          >
            {verse.verseKey}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Error Handling

### Handle API Errors Gracefully
```typescript
async function getAudioSafely(reciterId: number, surahNumber: number) {
  try {
    const response = await fetch(
      `/api/radio/audio?reciterId=${reciterId}&surahNumber=${surahNumber}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(data.message || 'Unknown error');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch audio:', error);
    
    // Show user-friendly error
    return {
      error: true,
      message: 'Failed to load audio. Please try again.'
    };
  }
}
```

---

## Performance Optimization

### Caching Strategy
```typescript
// Use browser caching for audio streams
const cacheFirstFetch = async (url: string) => {
  const cacheStorage = await caches.open('radio-cache-v1');
  
  // Check cache first
  let response = await cacheStorage.match(url);
  
  if (!response) {
    // Fetch from network
    response = await fetch(url);
    
    // Cache successful response
    if (response.ok) {
      cacheStorage.put(url, response.clone());
    }
  }
  
  return response;
};

// Usage
const audioUrl = '/api/radio/audio-stream?reciterId=2&verseKey=1:1';
const response = await cacheFirstFetch(audioUrl);
const arrayBuffer = await response.arrayBuffer();
```

### Preload Next Verse
```typescript
// Preload next verse while current one is playing
function preloadNextVerse(currentVerseUrl: string, nextVerseUrl: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = nextVerseUrl;
  document.head.appendChild(link);
}
```

---

## Integration with Quran App

### Add to Existing App
```typescript
// In your radio page component
import { fetchReciters, fetchAudio } from '@/app/radio/lib/api';

export default function RadioPage() {
  const [reciters, setReciters] = useState([]);
  
  useEffect(() => {
    fetchReciters().then(setReciters);
  }, []);

  const handleReciterSelect = async (reciterId: number) => {
    const audioData = await fetchAudio(reciterId, 1);
    // Use audioData to play audio
  };

  return (
    <div>
      {/* Radio UI here */}
    </div>
  );
}
```

---

## API Response Codes

| Code | Meaning | Solution |
|---|---|---|
| 200 | Success | Use data from response |
| 400 | Invalid parameters | Check reciter ID (1-14), surah number (1-114) |
| 404 | Resource not found | Verify verse key format (surah:verse) |
| 500 | Server error | Try again, check server logs |
| 503 | All CDN sources failed | Service temporarily unavailable, retry later |

---

## Performance Metrics

### Expected Response Times
- **Reciters**: 30-95ms (cached) / 1.4-1.6s (first load)
- **Audio**: 80-200ms
- **Audio Stream**: 50-100ms (cached) / 200-400ms (first load)

### Cache Headers
All responses include cache headers:
```
Cache-Control: public, s-maxage=3600, stale-while-revalidate=7200
```

This means:
- Cached for 1 hour on CDN
- Can serve stale data for 2 hours while revalidating
- Your app can cache indefinitely

---

## Troubleshooting

### Audio Not Playing
1. Check browser console for CORS errors
2. Verify audio element has correct audio MIME type: `audio/mpeg`
3. Check network tab to see if audio-stream returns 200 OK
4. Try different reciter/surah combination

### Slow Performance
1. Check if responses show `X-Cache: HIT` header
2. Verify no network throttling in browser dev tools
3. Check server logs for CDN failures
4. Try again - first load is slower, subsequent loads are instant

### 503 Service Unavailable
1. All CDN sources are temporarily down
2. Check your internet connection
3. Wait a few seconds and retry
4. Check Quran.com API status

---

## Advanced Features

### Stream Full Juz
```typescript
async function streamFullJuz(juzNumber: number, reciterId: number) {
  const surahList = await getSurahsInJuz(juzNumber);
  
  const allVerses: AudioVerse[] = [];
  
  for (const surah of surahList) {
    const data = await fetch(
      `/api/radio/audio?reciterId=${reciterId}&surahNumber=${surah.number}`
    ).then(r => r.json());
    
    allVerses.push(...data.audio.verses);
  }
  
  return allVerses;
}
```

### Dynamic Quality Selection
```typescript
async function selectBestQuality(reciterId: number) {
  const reciters = await fetch('/api/radio/reciters').then(r => r.json());
  const reciter = reciters.data.find(r => r.id === reciterId);
  
  const bandwidth = navigator.connection?.effectiveType;
  
  if (bandwidth === '4g') {
    return '320k';
  } else if (bandwidth === '3g') {
    return '192k';
  } else {
    return '128k';
  }
}
```

---

## Support & Documentation

For complete API reference, see `RADIO_BACKEND_ENHANCEMENT.md`

All endpoints are fully typed with TypeScript - check the response types for complete field documentation.

