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

const CACHE_NAME = 'lamisha-cache-v3';

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request);
        
        // Cache the response if it's a valid image or asset (including Firebase CORS images)
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // If network fails, try cache
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
        
        // Fallback for missing assets
        return new Response(null, { status: 404 });
      }
    })()
  );
});
