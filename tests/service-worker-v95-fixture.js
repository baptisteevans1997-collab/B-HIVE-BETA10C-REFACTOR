/* Test-only legacy beta worker used to verify the v95-to-First-Honey upgrade. */
var LEGACY_CACHE = 'brainmap-v95-beta10c-first-flight-step3e-a-predeploy1';
var LEGACY_ASSETS = [
  '../css/app.css?v=beta10c-first-flight-step3e-a-predeploy1',
  '../js/ui-experiments.js?v=beta10c-first-flight-step3e-a-predeploy1',
  '../js/app-main.js?v=beta10c-first-flight-step3e-a-predeploy1'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(LEGACY_CACHE).then(function (cache) {
      return Promise.all(LEGACY_ASSETS.map(function (asset) {
        var url = new URL(asset, self.location.href).href;
        return cache.put(url, new Response('v95-stale:' + asset, {
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
