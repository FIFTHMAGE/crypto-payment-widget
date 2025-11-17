/** Service Worker for Offline Support */
const CACHE_NAME = 'payment-widget-v1';
const urlsToCache = ['/', '/index.html', '/assets/main.js', '/assets/main.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

