// QuranLearn Service Worker
// Provides offline support, caching, and notifications

const CACHE_NAME = 'quranlearn-v2';
const STATIC_CACHE = 'quranlearn-static-v2';
const API_CACHE = 'quranlearn-api-v2';
const AUDIO_CACHE = 'quranlearn-audio-v2';

// Files to cache immediately on install
const STATIC_FILES = [
  '/',
  '/read-quran',
];

// API endpoints to cache
const API_PATTERNS = [
  'api.quran.com',
  'api.alquran.cloud',
  'api.qurancdn.com',
];

// Audio CDN patterns
const AUDIO_PATTERNS = [
  'everyayah.com',
  'cdn.islamic.network',
  'verses.quran.com',
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES).catch(() => {
          console.log('[SW] Some static files failed to cache');
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('quranlearn-') &&
            !name.includes('-v2'))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Handle API requests - Stale While Revalidate
  if (API_PATTERNS.some(pattern => url.hostname.includes(pattern))) {
    event.respondWith(staleWhileRevalidate(event.request, API_CACHE));
    return;
  }

  // Handle Audio requests - Cache First (audio files are large, prioritize cache)
  if (AUDIO_PATTERNS.some(pattern => url.hostname.includes(pattern))) {
    event.respondWith(cacheFirst(event.request, AUDIO_CACHE));
    return;
  }

  // Handle Next.js static files and pages - Network First
  if (url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/read-quran') ||
    url.pathname === '/') {
    event.respondWith(networkFirst(event.request, STATIC_CACHE));
    return;
  }
});

// Cache First strategy (for audio)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Audio unavailable offline', { status: 503 });
  }
}

// Network First strategy (for pages)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate strategy (for API)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response(JSON.stringify({ error: 'Offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Show notification (for prayer times)
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }

  // Pre-cache a surah for offline reading
  if (event.data.type === 'CACHE_SURAH') {
    const { surahId } = event.data;
    preCacheSurah(surahId);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Pre-cache a specific surah
async function preCacheSurah(surahId) {
  console.log('[SW] Pre-caching surah:', surahId);
  const apiCache = await caches.open(API_CACHE);

  const urls = [
    `https://api.quran.com/api/v4/chapters/${surahId}?language=en`,
    `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,en.sahih`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        apiCache.put(url, response);
      }
    } catch (error) {
      console.log('[SW] Failed to pre-cache:', url);
    }
  }
}
