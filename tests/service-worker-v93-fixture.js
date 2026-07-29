/* Test-only legacy beta worker used to verify the v93-to-Step-3D upgrade. */
var LEGACY_CACHE = 'brainmap-v93-beta10c-unlock-reveal1';
var LEGACY_ASSETS = [
  '../css/app.css',
  '../js/ui-experiments.js?v=beta10c-stage5c-fix2',
  '../js/app-main.js?v=beta10c-integ-hld-stage5c'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(LEGACY_CACHE).then(function (cache) {
      return Promise.all(LEGACY_ASSETS.map(function (asset) {
        var url = new URL(asset, self.location.href).href;
        return cache.put(url, new Response('v93-stale:' + asset, {
          headers: {'Content-Type': 'text/plain'}
        }));
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(caches.match(event.request).then(function (hit) {
    return hit || fetch(event.request);
  }));
});
