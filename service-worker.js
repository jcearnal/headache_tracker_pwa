const cacheName = 'headache-tracker-v8';
const staticAssets = [
  './',
  './index.html',
  './css/materialize.min.css',
  './css/styles.css',
  './js/materialize.min.js',
  './js/main.js',
  './manifest.json',
  './img/favicon.png',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/logo.png',
  './img/logo_small.png',
  './fonts/pacifico-regular.ttf',
  './fonts/menu_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg',
  './fonts/send_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg',
  './fonts/chevron_left_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg',
  './fonts/chevron_right_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg',
  './offline.html'
];

// Install Event: Cache all static assets
self.addEventListener('install', async (event) => {
  console.log('[Service Worker] Install event triggered.');
  event.waitUntil(
    caches.open(cacheName).then(async (cache) => {
      try {
        await cache.addAll(staticAssets);
        console.log('[Service Worker] All assets cached successfully.');
      } catch (error) {
        console.error('[Service Worker] Error caching assets:', error);
      }
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate Event: Clear old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event triggered.');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== cacheName) {
            console.log(`[Service Worker] Deleting old cache: ${key}`);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // Control all pages immediately
  console.log('[Service Worker] Activation complete.');
});

// Fetch Event: Cache-first strategy for local assets, network-first for external
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  console.log(`[Service Worker] Fetching: ${req.url}`);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkAndCache(req));
  }
});

// Cache-First Strategy: Serve from cache, fall back to network
async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) {
    console.log(`[Service Worker] Serving from cache: ${req.url}`);
    return cached;
  }

  console.log(`[Service Worker] Fetching from network: ${req.url}`);
  try {
    const response = await fetch(req);
    if (response.ok) {
      await cache.put(req, response.clone()); // Cache the new response
    }
    return response;
  } catch (error) {
    console.error(`[Service Worker] Network fetch failed: ${req.url}`, error);
    return offlineFallbackResponse(req);
  }
}

// Network-and-Cache Strategy: Fetch from network, fall back to cache
async function networkAndCache(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    await cache.put(req, fresh.clone()); // Cache the fresh response
    console.log(`[Service Worker] Fetched and cached: ${req.url}`);
    return fresh;
  } catch (error) {
    console.warn(`[Service Worker] Network failed, serving from cache: ${req.url}`);
    return offlineFallbackResponse(req);
  }
}

// Fallback response for offline mode
async function offlineFallbackResponse(req) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(req);

  if (cachedResponse) {
    console.log(`[Service Worker] Serving fallback from cache: ${req.url}`);
    return cachedResponse;
  } else if (req.headers.get('accept').includes('text/html')) {
    console.warn(`[Service Worker] No fallback available, serving offline page.`);
    return await cache.match('./offline.html') || new Response('Offline: Page not available', { status: 503 });
  } else {
    console.warn(`[Service Worker] No cached version available for: ${req.url}`);
    return new Response('Offline: Resource not available', { status: 503 });
  }
}
