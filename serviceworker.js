const CACHE_NAME = "gold-calc-pwa-v2"; // bump version for updates
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./offline.html",
  "./serviceworker.js",
  "./favicon.ico",
  "./app-icon192.png",
  "./app-icon512.png",
  "./icon512_rounded.png",
  "./icon512_maskable.png"
];

// INSTALL: cache all assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE: remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH: cache-first with network update, fallback to offline page
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Return cached immediately, but also update in background
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;

          // Clone the response: one for cache, one for browser
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        }).catch(() => cachedResponse); // ignore fetch errors

        return cachedResponse || fetchPromise;
      } else {
        // If not cached, try network
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) {
            throw new Error("Network response not OK");
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        }).catch(() => {
          // Fallback to offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("./offline.html");
          }
        });
      }
    })
  );
});
