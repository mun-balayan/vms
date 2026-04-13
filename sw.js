// VMS Service Worker — always up-to-date on every open
// ─────────────────────────────────────────────────────
// HOW UPDATES WORK:
//   1. User opens the site → browser fetches this sw.js from network
//   2. If sw.js changed → new SW installs in background
//   3. skipWaiting() activates it immediately (no waiting for tabs to close)
//   4. clients.claim() takes over all open tabs right away
//   5. New SW posts a RELOAD message → every open tab refreshes once
//   6. User sees the latest version without doing anything

const CACHE = 'vms-v23'; // ← bump this whenever you deploy new files

const SHELL = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './utils.js',
  './logo.png',
];

// ── INSTALL ──────────────────────────────────────────
// Pre-cache the full app shell so it works offline immediately.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting()) // activate right away, don't wait
  );
});

// ── ACTIVATE ─────────────────────────────────────────
// Wipe old caches, claim all open tabs, then tell every
// tab to reload so it instantly picks up fresh files.
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => {
        clients.forEach(client => {
          // Tell each open tab: new version is active, please reload
          client.postMessage({ type: 'SW_UPDATED' });
        });
      })
  );
});

// ── FETCH ─────────────────────────────────────────────
// Network-first for all same-origin GET requests:
//   Try network → cache fresh copy → serve it.
//   If offline → fall back to cache.
// Third-party requests (Firebase, Fonts, CDN) pass through untouched.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── MESSAGE HANDLER ───────────────────────────────────
// Lets the page trigger skipWaiting manually if you ever
// want to add an "Update available" banner.
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
