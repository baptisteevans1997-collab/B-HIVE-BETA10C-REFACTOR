/* Claude Brain Map — service worker · offline app shell */
var CACHE = 'brainmap-v91-beta10c-integ-hld-stage5c';
var CORE = [
  './', './index.html',
  './css/app.css', './css/beta-mobile-polish.css',
  './css/bhive-atmos.css?v=beta10c-hld03b',
  './js/bhive-data.js', './js/bhive-engine.js', './js/bhive-learning.js',
  './js/bhive-inference.js?v=beta10c-stage3', './js/bhive-experiments.js?v=beta10c-stage5c-fix2',
  './js/bhive-memory.js?v=beta10c-stage5c-fix1',
  './js/bhive-memory-use.js?v=beta10c-stage5c-fix2',
  './js/bhive-review.js?v=beta10c-stage5b',
  './js/ui-insights.js?v=beta10c-stage3', './js/ui-experiments.js?v=beta10c-stage5c-fix2',
  './js/ui-memory.js?v=beta10c-stage5b', './js/app-main.js?v=beta10c-integ-hld-stage5c', './js/pwa-register.js',
  './js/ui-blueprints.js', './js/beta-profile-data.js', './js/beta-profile.js',
  './manifest.webmanifest', './icon.svg',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png',
  './css/beta-overlays.css'
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
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
