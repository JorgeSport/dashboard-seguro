// service-worker.js
const CACHE_NAME = 'ventas-cache-v3';
const FILES_TO_CACHE = [
  '/dashboard-seguro/',            // importante en GitHub Pages
  '/dashboard-seguro/index.html'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fromNetwork = fetch(event.request)
        .then((netRes) =>
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, netRes.clone());
            return netRes;
          })
        )
        .catch(() => cached || caches.match('/dashboard-seguro/index.html'));

      return cached || fromNetwork;
    })
  );
});
