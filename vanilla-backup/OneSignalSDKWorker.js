importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');


const CACHE_NAME = 'lamisha-cache-v4'; // Versi naik ke v4 sesuai permintaan user
const ASSETS = [
    '/',
    '/index.html',
    '/style.css?v=1.7',
    '/script.js?v=2.0',
    '/manifest.json',
    '/Choco%20chips%20(1).webp',
    '/Cornflakes%20(1).webp',
    '/Havana%20Nestum%20(1).webp',
    '/background%20(1).webp',
    '/broww.webp',
    '/butter%20cookies%20(1).webp',
    '/chesee_cake.webp',
    '/delivery_popup.webp',
    '/hampres.webp',
    '/nastar.webp',
    '/palm_chesee.webp',
    '/ramadhan_popup.webp',
    '/softcake.webp',
    '/tekwan%20(1).webp'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // JANGAN cache request dari Tawk.to atau OneSignal agar chat real-time & push lancar
    if (
        event.request.url.includes('tawk.to') || 
        event.request.url.includes('onesignal') || 
        event.request.method !== 'GET'
    ) {
        return; 
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});