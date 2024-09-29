const cacheName = 'headache-tracker-v1';
const staticAssets = [
  './',
  './index.html',
  './css/materialize.min.css',
  './js/materialize.min.js',
  './js/main.js',
  './manifest.json',
  './img/favicon.png',
  './img/icon-192.png',
  './img/icon-512.png'
];

self.addEventListener('install', async event => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);  // Cache only static assets
  return self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== cacheName) {
            return caches.delete(key);  // Clear old caches
          }
        })
      )
    )
  );
  return self.clients.claim();
});

self.addEventListener('fetch', async event => {
  const req = event.request;
  const url = new URL(req.url);

  // Cache-first strategy for local resources
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkAndCache(req));
  }
});

// Cache-first strategy
async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  return cached || fetch(req);
}

// Network-first with cache fallback strategy for external requests
async function networkAndCache(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    await cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return cached;  // Simply return the cached version if network fails
  }
}
