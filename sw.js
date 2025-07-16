const CACHE_NAME = 'social-diary-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/signup.html',
  '/style.css',
  '/script.js',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.5/main.min.css',
  'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.5/main.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
  'https://cdn.jsdelivr.net/npm/i18next@21.9.2/dist/umd/i18next.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://unpkg.com/swiper@8/swiper-bundle.min.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js',
  '/languages/en.json',
  '/languages/es.json',
  '/languages/zh.json',
  '/languages/hi.json'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            return response;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('Offline content not available.', { status: 503 });
          });
      })
  );
});

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Social Diary', body: 'New notification!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    })
  );
});

// Notification Click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Sync Event for Offline Entries
self.addEventListener('sync', event => {
  if (event.tag === 'sync-entries') {
    event.waitUntil(syncOfflineEntries());
  }
});

async function syncOfflineEntries() {
  const dbRequest = indexedDB.open('SocialDiaryDB', 1);
  dbRequest.onupgradeneeded = e => {
    e.target.result.createObjectStore('entries', { keyPath: 'id' });
  };
  dbRequest.onsuccess = async e => {
    const db = e.target.result;
    const tx = db.transaction(['entries'], 'readwrite');
    const store = tx.objectStore('entries');
    const offlineEntries = await new Promise(resolve => {
      store.getAll().onsuccess = evt => resolve(evt.target.result);
    });
    for (const entry of offlineEntries) {
      try {
        // Note: Firebase client SDKs can't be used in Service Worker
        // Assume a fetch to a backend endpoint for syncing
        await fetch('/api/sync-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        store.delete(entry.id);
      } catch (e) {
        console.warn('Sync failed:', e);
      }
    }
  };
}
