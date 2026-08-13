/* PFT Education Hub — offline support
 *
 * Strategy: NETWORK FIRST, falling back to cache.
 *
 * This is deliberate. A clinical reference must not serve a stale
 * threshold to someone standing at a workstation. When the device has
 * a connection, it always fetches the current file. The cache exists
 * only so the hub still opens when there is no signal.
 *
 * Consequence: after you publish an update, staff get it the next time
 * they open the hub while online. No version number to bump, nothing
 * to clear.
 */

var CACHE = 'pft-hub-v1';

var CORE = [
  './',
  './index.html',
  './site.css',
  './site.js',
  './quiz.js',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(CORE).catch(function () { /* partial cache is fine */ });
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) { return caches.delete(k); }
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') { return; }
  if (new URL(req.url).origin !== location.origin) { return; }

  e.respondWith(
    fetch(req)
      .then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./index.html');
        });
      })
  );
});
