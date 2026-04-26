// Service Worker Version: 2.2 (Robust Fetch & OneSignal)
// 1. OneSignal Integration
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// 2. Service Worker Lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 3. Fetch Handler (Robust with Fallback)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for caching
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache and network fails, return a basic offline response for documents
        if (event.request.mode === 'navigate') {
          return new Response('Anda sedang offline. Silakan cek koneksi internet Anda.', {
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        
        // For other assets, we must return something valid or just fail gracefully
        // Note: Returning null or undefined here causes the "Failed to convert value to Response" error.
        return new Response(null, { status: 404 });
      })
  );
});
