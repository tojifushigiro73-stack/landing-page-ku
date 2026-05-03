// Service Worker Version: 3.3 (iOS Safari Optimization)
const CACHE_NAME = 'lamisha-cache-v11';

// PENTING: Gunakan nama file PERSIS seperti di folder /public
const PRE_CACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/favicon.ico',
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

// 1. OneSignal Integration — dibungkus try-catch agar tidak crash saat offline
try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (e) {
  console.warn('[SW] OneSignal SDK not available offline, skipping.');
}

// 2. Service Worker Lifecycle - Install
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching critical assets');
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map(url => 
          fetch(new Request(url, { cache: 'reload' }))
            .then(response => {
              if (response.ok) return cache.put(url, response);
              throw new Error(`Failed to fetch ${url}`);
            })
            .catch(err => console.warn('[SW] Failed to pre-cache:', url, err))
        )
      );
    })
  );
});

// 3. Service Worker Lifecycle - Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
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
      clients.claim()
    ])
  );
});

// 4. Fetch Handler
self.addEventListener('fetch', (event) => {
  // Hanya tangani request GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Lewati request ke Firebase, OneSignal, atau API eksternal yang tidak perlu di-cache
  if (url.hostname.includes('firebaseio.com') || 
      url.hostname.includes('googleapis.com') || 
      url.hostname.includes('onesignal.com')) {
    return;
  }

  // Khusus untuk Next.js static assets (_next/static)
  // Gunakan Stale-While-Revalidate agar cepat tapi tetap terupdate
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategi: Cache First untuk gambar & aset statis lainnya
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
          // Fallback jika gambar gagal diload saat offline
          if (url.pathname.match(/\.(webp|png|jpg|jpeg)$/)) {
             return caches.match('/apple-touch-icon.png');
          }
        });
      })
    );
    return;
  }

  // Strategi: Network First untuk halaman HTML (navigation) & JS/CSS utama
  // Ini krusial untuk iOS Safari agar tidak terjebak di versi lama tapi tetap bisa offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Hanya simpan response sukses
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      })
      .catch(async (err) => {
        console.log('[SW] Fetch failed, trying cache:', url.pathname);
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        
        // Fallback untuk navigasi halaman jika offline total
        if (event.request.mode === 'navigate') {
          const mainPage = await caches.match('/');
          if (mainPage) return mainPage;
        }
        
        return new Response('Offline', { 
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({'Content-Type': 'text/plain'})
        });
      })
  );
});
