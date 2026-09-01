/* Service worker для офлайна.
   Стратегия: stale-while-revalidate для своих файлов, сеть — резерв.
   Ассеты Vite имеют хэш в имени, поэтому кэш можно держать долго,
   а обновлённый index.html подтянет новые файлы при следующем запуске. */

const CACHE = "nur-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request, { ignoreSearch: true });

      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => null);

      if (cached) {
        network; // обновим кэш в фоне
        return cached;
      }

      const fresh = await network;
      if (fresh) return fresh;

      if (request.mode === "navigate") {
        const fallback = (await cache.match("./index.html")) || (await cache.match("./"));
        if (fallback) return fallback;
      }
      return Response.error();
    })()
  );
});
