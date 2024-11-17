const cacheName = 'headache-tracker-v10';
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
  './fonts/trash_can_icon.svg',
  './offline.html',
  'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js', // Firebase app
  'https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js' // Firebase database
];

// Install Event
self.addEventListener('install', async (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(cacheName).then(async (cache) => {
      try {
        await cache.addAll(staticAssets);
        console.log('[Service Worker] Static assets cached.');
      } catch (error) {
        console.error('[Service Worker] Caching failed:', error);
      }
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
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
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Firebase Realtime Database Requests
  if (url.origin === "https://tracker-24eae-default-rtdb.firebaseio.com") {
    console.log(`[Service Worker] Bypassing cache for Firebase request: ${req.url}`);
    event.respondWith(fetch(req));
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkAndCache(req));
  }
});

// Cache-First Strategy
async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  if (cached) {
    console.log(`[Service Worker] Serving from cache: ${req.url}`);
    return cached;
  }

  try {
    const response = await fetch(req);
    await cache.put(req, response.clone());
    console.log(`[Service Worker] Fetched and cached: ${req.url}`);
    return response;
  } catch (error) {
    console.error(`[Service Worker] Fetch failed, serving offline fallback: ${req.url}`);
    return offlineFallbackResponse(req);
  }
}

// Network-and-Cache Strategy
async function networkAndCache(req) {
  const cache = await caches.open(cacheName);

  try {
    const fresh = await fetch(req);
    await cache.put(req, fresh.clone());
    console.log(`[Service Worker] Fetched and cached: ${req.url}`);
    return fresh;
  } catch (error) {
    console.warn(`[Service Worker] Network failed, serving from cache: ${req.url}`);
    return offlineFallbackResponse(req);
  }
}

// Offline Fallback
async function offlineFallbackResponse(req) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(req);

  if (cachedResponse) {
    console.log(`[Service Worker] Serving fallback from cache: ${req.url}`);
    return cachedResponse;
  } else if (req.headers.get('accept').includes('text/html')) {
    console.warn('[Service Worker] Serving offline page.');
    return cache.match('./offline.html') || new Response('Offline: Page not available', { status: 503 });
  } else {
    console.warn('[Service Worker] No fallback available for request.');
    return new Response('Offline: Resource not available', { status: 503 });
  }
}
