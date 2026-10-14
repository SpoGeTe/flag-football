// Offline-Speicher: erst Netz (für Updates), sonst gespeicherte Version.
const CACHE = 'flag-playbook-v1';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(DATEIEN.map((d) => c.add(d).catch(() => null)))));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.url.includes('youtube')) return;
  e.respondWith(
    fetch(e.request)
      .then((antwort) => {
        if (antwort.ok) { const kopie = antwort.clone(); caches.open(CACHE).then((c) => c.put(e.request, kopie)); }
        return antwort;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || Response.error()))
  );
});
