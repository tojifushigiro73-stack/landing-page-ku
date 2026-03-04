const CACHE_NAME = 'lamisha-cache-v4';
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
    '/tekwan (1).png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keys) => {
        return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    }));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
