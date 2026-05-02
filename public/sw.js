// Service Worker Version: 2.4 (Enhanced Image Caching)
// 1. OneSignal Integration
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'lamisha-cache-v5';
const PRE_CACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/nastar.webp',
  '/Havana%20Nestum%20(1).webp',
  '/butter%20cookies%20(1).webp',
  '/Choco%20chips%20(1).webp',
  '/Cornflakes%20(1).webp',
  '/palm_chesee.webp',
  '/tekwan%20(1).webp',
  '/softcake.webp',
  '/chesee_cake.webp',
  '/broww.webp',
  '/hampres.webp',
  '/background%20(1).webp',
  '/apple-touch-icon.png'
];

// 2. Service Worker Lifecycle
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching critical assets');
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache strategy for images
  if (event.request.destination === 'image' || url.pathname.match(/\.(webp|png|jpg|jpeg|svg|gif)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        }).catch(() => {
          // If offline and not in cache, we could return a placeholder if needed
          return caches.match('/apple-touch-icon.png');
        });
      })
    );
    return;
  }

  // Default strategy for other assets
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(event.request);
        
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        if (event.request.mode === 'navigate') {
          return caches.match('/'); // Fallback to index for SPA
        }
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
