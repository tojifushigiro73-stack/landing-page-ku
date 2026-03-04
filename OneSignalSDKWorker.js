importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// PWA Caching Logic (Merged to ensure PWA + Notifications work together)
const CACHE_NAME = 'lamisha-cache-v2'; // Incremented version to force update
const ASSETS = [
    '/',
    '/index.html',
    '/style.css?v=1.7',
    '/script.js?v=2.0',
    '/apple-touch-icon.png',
    '/softcake.jpg',
    '/nastar.jpg',
    '/Havana Nestum (1).png',
    '/butter cookies (1).png',
    '/Choco chips (1).png',
    '/Cornflakes (1).png',
    '/broww.jpg',
    '/chesee_cake.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});