// Service Worker Version: 2.1 (OneSignal Integrated)
// 1. OneSignal Integration
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// 2. Service Worker Lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 3. Fetch Handler (Fixing No-Op Warning)
// Even a simple fetch passthrough with a catch block is no longer considered a "no-op"
// and satisfies PWA installability requirements.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});
