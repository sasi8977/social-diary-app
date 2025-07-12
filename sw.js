const CACHE_NAME = 'diary-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/offline.html',
  '/images/offline.png',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
  'https://unpkg.com/swiper/swiper-bundle.min.js',
  'https://unpkg.com/swiper/swiper-bundle.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// Install event – cache all necessary files
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })))
        .catch(err => console.log('Cache addAll failed:', err));
    })
  );
});

// Activate event – clean old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
});

// Fetch event – serve cached content or fetch with fallback
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return caches.match('/offline.html'); // Fallback for non-navigation requests
      });
    })
  );
});
