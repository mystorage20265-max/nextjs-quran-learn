import type { AudioFile } from './loaders';
import type { Station } from './types';

export type PlaylistTrack = {
  surahId: number;
  reciterId: number;
  url: string;
  title?: string;
  reciterName?: string;
};

// Legacy support or extended config
export type StationConfig = Station & {
  surahs?: number[] | 'all';
};

export type Playlist = PlaylistTrack[];

export function buildPlaylist(
  station: Station | StationConfig,
  audioFiles: AudioFile[]
): Playlist {
  const playlist: Playlist = [];
  const surahs = (station as StationConfig).surahs || 'all';

  if (surahs === 'all') {
    // Use all available audio files
    return audioFiles.map(file => ({
      surahId: file.surahId,
      reciterId: file.reciterId,
      url: file.url,
      title: file.surahName
    }));
  }

  // If specific surahs are listed
  if (Array.isArray(surahs)) {
    for (const surahId of surahs) {
      // Find matching audio file for this surah
      // We assume audioFiles are already filtered for the correct reciter by the loader
      const audio = audioFiles.find((file) => file.surahId === surahId);

      if (audio) {
        playlist.push({
          surahId,
          reciterId: audio.reciterId,
          url: audio.url,
          title: audio.surahName
        });
      }
    }
  }

  return playlist;
}
