/* Claude Brain Map — service worker · offline app shell */
var CACHE = 'brainmap-v88-beta10c-refactor-fix5';
var CORE = [
  './', './index.html',
  './css/app.css', './css/beta-mobile-polish.css',
  './js/bhive-data.js', './js/app-main.js', './js/pwa-register.js',
  './js/ui-blueprints.js', './js/beta-profile-data.js', './js/beta-profile.js',
  './manifest.webmanifest', './icon.svg',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png',
  './js/bhive-engine.js', './css/beta-overlays.css'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      if (k !== CACHE) return caches.delete(k);
    }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
