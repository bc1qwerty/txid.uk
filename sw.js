const CACHE = "txid-v3";
const PRECACHE = ["/", "/app.js", "/style.css", "/mempool.js", "/static/icons.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Network-first for API calls
  if (url.hostname.includes("mempool.space") || url.hostname.includes("upbit") || url.hostname.includes("coingecko") || url.hostname.includes("binance")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache-first for assets
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); }
    return res;
  })).catch(() => {
    if (e.request.mode === "navigate") {
      return new Response('<html><body style="background:#0d1117;color:#e8e8e8;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h1 style="color:#f7931a">txid.uk</h1><p>오프라인 상태입니다</p></div></body></html>', {
        headers: { "Content-Type": "text/html" }
      });
    }
  }));
});
