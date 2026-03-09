importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// PWA Caching Logic
const CACHE_NAME = 'lamisha-cache-v5';
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
    // Only cache GET requests and skip onesignal/external requests
    if (event.request.method !== 'GET' || event.request.url.includes('onesignal')) return;
    
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});