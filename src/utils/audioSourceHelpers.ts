/**
 * Audio Source Helpers - Multiple fallback strategies
 * Used when Quran.com CDN is unavailable
 */

/**
 * Alternative Quranic Audio Sources
 * These are public sources that may have Quranic audio
 */
export const alternativeAudioSources = [
  {
    name: 'EveryAyah.com (Primary)',
    pattern: (_reciterDir: string, _surah: number, _verse: number) => 
      `https://everyayah.com/data/reciterDir/surah_verse.mp3`,
    reciters: {
      'AbdulBaset_Murattal_192kbps': 'AbdulBaset/Murattal',
      'AbdulBaset_Mujawwad_192kbps': 'AbdulBaset/Mujawwad',
      'Mishari_Rashid_Al_Afasy_192kbps': 'Mishari_Rashid_Al_Afasy',
    }
  },
  {
    name: 'Verses.Quran.com (Secondary)',
    pattern: (_reciterDir: string, _surah: number, _verse: number) => 
      `https://verses.quran.com/random`,
  },
  {
    name: 'Quran4All (Tertiary)',
    pattern: (_reciterDir: string, _surah: number, _verse: number) => 
      `https://quran4all.com/api/audio/surah:verse`,
  },
];

/**
 * Reciter ID to EveryAyah directory mapping
 * Used as fallback when Quran.com CDN is unavailable
 */
export const everyayahReciterMapping: Record<number, string> = {
  1: 'AbdulBaset/Mujawwad',      // AbdulBaset AbdulSamad - Mujawwad
  2: 'AbdulBaset/Murattal',       // AbdulBaset AbdulSamad - Murattal
  3: 'Abdur-Rahman_As-Sudais',    // Abdur-Rahman as-Sudais
  4: 'Abu_Bakr_al-Shatri',        // Abu Bakr al-Shatri
  5: 'Hani_ar-Rifai',             // Hani ar-Rifai
  6: 'Mahmoud_Khalil_Al-Husary',  // Mahmoud Khalil Al-Husary
  7: 'Mishari_Rashid_Al_Afasy',   // Mishari Rashid al-Afasy
  8: 'Mohamed_Siddiq_al-Minshawi_Mujawwad', // Mohamed Siddiq al-Minshawi - Mujawwad
  9: 'Mohamed_Siddiq_al-Minshawi_Murattal', // Mohamed Siddiq al-Minshawi - Murattal
  10: 'Saoud_Ash-Shuraym',        // Sa'ud ash-Shuraym
  11: 'Mohamed_al-Tablawi',       // Mohamed al-Tablawi
  12: 'Mahmoud_Khalil_Al-Husary_Muallim', // Mahmoud Khalil Al-Husary - Muallim
  13: 'Saad_al-Ghamdi',           // Saad al-Ghamdi
  14: 'Yasser_Ad-Dossary',        // Yasser Ad Dossary
};

/**
 * Get EveryAyah audio URL
 * Fallback when Quran.com CDN is unavailable
 */
export function getEveryayahUrl(reciterId: number, surah: number, verse: number): string {
  const reciterDir = everyayahReciterMapping[reciterId];
  if (!reciterDir) {
    throw new Error(`Reciter ${reciterId} not found in EveryAyah mapping`);
  }
  
  const surahPad = String(surah).padStart(3, '0');
  const versePad = String(verse).padStart(3, '0');
  
  return `https://everyayah.com/data/${reciterDir}/${surahPad}${versePad}.mp3`;
}

/**
 * Generate a test/sample audio URL
 * Used when no CDN is available for demonstration
 */
export function getSampleAudioUrl(): string {
  // Returns a public domain audio file for testing
  return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
}

/**
 * Get fallback audio (for development/testing only)
 * Creates a simple beep sound as ArrayBuffer
 */
export function generateSilentAudio(): ArrayBuffer {
  // Generate 1 second of silence as raw audio data
  // WAV header (44 bytes) + silence data
  const sampleRate = 44100;
  const channels = 1;
  const duration = 1; // 1 second
  const totalSamples = sampleRate * duration;
  const bytesPerSample = 2;
  
  // Create WAV file with silence
  const buffer = new ArrayBuffer(44 + totalSamples * bytesPerSample);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true);  // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, totalSamples * channels * bytesPerSample, true);
  
  // Fill with silence (zeros)
  for (let i = 0; i < totalSamples; i++) {
    view.setInt16(44 + i * bytesPerSample, 0, true);
  }
  
  return buffer;
}

export default {
  alternativeAudioSources,
  everyayahReciterMapping,
  getEveryayahUrl,
  getSampleAudioUrl,
  generateSilentAudio,
};
