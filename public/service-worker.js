// service-worker.js

const CACHE_NAME = 'grocery-list-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.chunk.css',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/manifest.json',
  '/favicon.ico',
  '/App.js',
  '/App.css',
  '/index.js',
  '/index.css',
  '/package.json',
  // Add other assets your app uses
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
