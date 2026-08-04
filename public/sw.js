// Simple cache-first service worker for PWA support
const CACHE_NAME = 'cashai-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/manifest.json',
  '/app_icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('Pre-cache warning during install:', err);
      });
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
