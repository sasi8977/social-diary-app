self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('diary-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/social.css',
        '/script.js',
        '/icons/icon-192.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
