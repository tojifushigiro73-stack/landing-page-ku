// =============================================
// OneSignal SDK Service Worker (v16)
// Menangani: Push Notifications + PWA Caching
// =============================================
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// --- PWA Caching Logic ---
const CACHE_NAME = 'lamisha-cache-v4';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/apple-touch-icon.png',
    '/softcake.jpg',
    '/nastar.jpg',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});