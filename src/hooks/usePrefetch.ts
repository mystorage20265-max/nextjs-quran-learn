'use client';

import { useEffect } from 'react';

/**
 * usePrefetch - A hook to pre-fetch key API data in the background
 * to ensure instant navigation to heavy pages like Hadith and Video Gallery.
 */
export const usePrefetch = () => {
  useEffect(() => {
    // Delay pre-fetching to ensure initial page load is prioritized
    const prefetchData = async () => {
      // Core App Routes & Data
      const duaSlugs = ['categories', 'rabbana', 'morning-evening', 'daily', 'salah', 'protection', 'forgiveness', 'family', 'travel', 'health', 'success', 'anxiety', 'ramadan', 'quran'];
      
      // Get last read surah to prioritize it
      let lastReadId = null;
      try {
        const saved = localStorage.getItem('quran-last-read');
        if (saved) lastReadId = JSON.parse(saved).surahId;
      } catch (e) {}

      // Popular & Strategic Surahs for pre-fetching
      // 1: Fatiha, 2: Baqarah, 18: Kahf, 36: Yasin, 67: Mulk
      const popularSurahs = [1, 2, 18, 36, 67];
      if (lastReadId && !popularSurahs.includes(lastReadId)) {
        popularSurahs.unshift(lastReadId);
      }

      const quranRoutes = [
        'https://api.quran.com/api/v4/chapters?language=en',
        ...popularSurahs.map(id => `https://api.quran.com/api/v4/verses/by_chapter/${id}?language=en&words=true&translations=131&fields=text_uthmani,text_indopak&word_fields=text_uthmani,text_imlaei,translation,transliteration&translation_fields=text,resource_name&per_page=300`)
      ];

      const routes = [
        '/api/hadith?collection=bukhari&page=1',
        '/api/duas',
        ...duaSlugs.map(s => `/data/duas/${s}.json`),
        ...quranRoutes
      ];

      // Systematic background loading of ALL surahs in a low-priority queue
      // This ensures that even if user navigates to a non-popular surah, it's likely cached.
      const allSurahIds = Array.from({ length: 114 }, (_, i) => i + 1);
      const remainingSurahs = allSurahIds.filter(id => !popularSurahs.includes(id));
      
      const backgroundRoutes = remainingSurahs.map(id => 
        `https://api.quran.com/api/v4/verses/by_chapter/${id}?language=en&words=true&translations=131&fields=text_uthmani,text_indopak&word_fields=text_uthmani,text_imlaei,translation,transliteration&translation_fields=text,resource_name&per_page=300`
      );

      // Process remaining surahs in background with even more delay to not affect actual user experience
      const processBackground = async () => {
        // Wait even longer before starting low-priority background sync
        await new Promise(r => setTimeout(r, 10000));
        
        const bgBatchSize = 1; // Load one by one to keep main thread free
        for (let i = 0; i < backgroundRoutes.length; i += bgBatchSize) {
          const batch = backgroundRoutes.slice(i, i + bgBatchSize);
          await Promise.all(batch.map(async (route) => {
            try {
              // Use low priority fetch if supported
              // @ts-ignore
              await fetch(route, { priority: 'low', cache: 'force-cache' });
            } catch (error) {}
          }));
          // Longer delay for full background loading (5 seconds between each surah)
          await new Promise(r => setTimeout(r, 5000));
        }
        console.log(`[Prefetch] Global background sync completed`);
      };

      // Start background sync after initial batches are done
      processBackground();
      
      console.log(`[Prefetch] Started background sync for ${backgroundRoutes.length} surahs`);
    };

    // Wait 8 seconds instead of 5 after mount before starting pre-fetching
    const timer = setTimeout(prefetchData, 8000);
    
    return () => clearTimeout(timer);
  }, []);
};
