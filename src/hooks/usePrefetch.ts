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
      const duaSlugs = ['categories', 'rabbana', 'morning-evening', 'daily', 'salah', 'protection', 'forgiveness', 'family', 'travel', 'health', 'success', 'anxiety', 'ramadan', 'quran'];
      const routes = [
        '/api/hadith?collection=bukhari&page=1',
        '/api/duas',
        ...duaSlugs.map(s => `/data/duas/${s}.json`)
      ];

      for (const route of routes) {
        try {
          // Use priority: 'low' if supported by the browser fetch API
          // @ts-ignore - priority is relatively new and might not be in types
          await fetch(route, { priority: 'low' });
          console.log(`[Prefetch] Success: ${route}`);
        } catch (error) {
          console.warn(`[Prefetch] Failed: ${route}`, error);
        }
      }
    };

    // Wait 3 seconds after mount before pre-fetching
    const timer = setTimeout(prefetchData, 3000);
    
    return () => clearTimeout(timer);
  }, []);
};
