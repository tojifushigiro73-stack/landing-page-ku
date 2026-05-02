// Service Worker Version: 3.2 (Full Offline Fix)
// 1. OneSignal Integration — dibungkus try-catch agar tidak crash saat offline
try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (e) {
  console.warn('[SW] OneSignal SDK not available offline, skipping.');
}

const CACHE_NAME = 'lamisha-cache-v10';

// PENTING: Gunakan nama file PERSIS seperti di folder /public
const PRE_CACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/nastar.webp',
  '/broww.webp',
  '/softcake.webp',
  '/chesee_cake.webp',
  '/hampres.webp',
  '/palm_chesee.webp',
  '/Havana Nestum (1).webp',
  '/butter cookies (1).webp',
  '/Choco chips (1).webp',
  '/Cornflakes (1).webp',
  '/tekwan (1).webp',
  '/background (1).webp',
];

// 2. Service Worker Lifecycle - Install
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching critical assets');
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map(url => cache.add(url).catch(err => {
          console.warn('[SW] Failed to cache:', url, err);
        }))
      );
    })
  );
});

// 3. Service Worker Lifecycle - Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Hapus cache lama
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        )
      ),
      // Ambil kendali atas semua tab yang terbuka segera
      clients.claim()
    ])
  );
});

// 4. Fetch Handler
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Lewati request ke Firebase, OneSignal, atau API eksternal yang tidak perlu di-cache
  if (url.hostname.includes('firebaseio.com') || 
      url.hostname.includes('googleapis.com') || 
      url.hostname.includes('onesignal.com') ||
      url.pathname.startsWith('/_next/webpack')) {
    return;
  }

  // Strategi: Cache First untuk gambar & aset statis
  if (event.request.destination === 'image' || 
      url.pathname.match(/\.(webp|png|jpg|jpeg|svg|gif|ico|woff2?|ttf|otf)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return networkResponse;
        }).catch(() => {
          if (url.pathname.match(/\.(webp|png|jpg|jpeg)$/)) {
             return caches.match('/apple-touch-icon.png');
          }
        });
      })
    );
    return;
  }

  // Strategi: Network First untuk halaman, JS, & CSS
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        
        return new Response('Offline', { 
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({'Content-Type': 'text/plain'})
        });
      })
  );
});
