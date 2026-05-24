const CACHE_NAME = "winecellar-cache-v1";
const FILES_TO_CACHE = [
  "index.html",
  "styles.css",
  "app.js",
  "db.js",
  "ui.js",
  "settings.js",
  "stats.js",
  "alerts.js",
  "shop.js",
  "scan.js",
  "pdf.js",
  "voice.js",
  "inventory.js",
  "icons/grappe192.png",
  "icons/grappe512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});