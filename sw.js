const CACHE = 'cave-v2';
const ASSETS = ['/', '/index.html', '/styles.css', '/db.js', '/ui.js', '/ai.js', '/scan.js', '/app.js', '/inventory.js', '/stats.js', '/alerts.js', '/manifest.json'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
