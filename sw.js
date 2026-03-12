// VMS Service Worker — caches the app shell for offline loading
const CACHE = 'vms-v6';  // ← bump this number every time you upload a new index.html
const ASSETS = [
  './',
  './index.html',
];

// Install: cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache first for app shell, network first for everything else
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only handle same-origin requests (the HTML)
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const network = fetch(e.request).then(res => {
          // Update cache with fresh copy
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => cached); // fallback to cache if offline
        // Return cache immediately if available, otherwise wait for network
        return cached || network;
      })
    );
  }
  // Let Firebase, Google Fonts, and all other requests pass through normally
});
