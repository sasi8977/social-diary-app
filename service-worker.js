self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("diary-cache").then((cache) => {
      return cache.addAll([
        "/social-diary-app/",
        "/social-diary-app/index.html",
        "/social-diary-app/style.css",
        "/social-diary-app/script.js",
        "/social-diary-app/manifest.json",
        "/social-diary-app/icons/icon-192.png",
        "/social-diary-app/icons/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
