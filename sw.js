const CACHE_NAME = "pokdex-offline-v230";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("pokdex-offline-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", event => {
 const request = event.request; if (request.method !== "GET") return;
 const url = new URL(request.url);
 if (request.mode === "navigate") {
  event.respondWith((async () => { const cache = await caches.open(CACHE_NAME); try { const fresh = await fetch(request); if (fresh && fresh.ok) await cache.put("./index.html", fresh.clone()); return fresh; } catch (e) { return (await cache.match(request)) || (await cache.match("./index.html")) || Response.error(); } })()); return;
 }
 event.respondWith((async () => {
  const cache = await caches.open(CACHE_NAME); const cached = await cache.match(request); if (cached) return cached;
  try { const response = await fetch(request); if (response && (response.ok || response.type === "opaque")) { try { await cache.put(request, response.clone()); } catch (e) {} } return response; } catch (e) { return cached || Response.error(); }
 })());
});
