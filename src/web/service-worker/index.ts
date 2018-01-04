import { routes } from "../../common-ui/routing";

const CACHE_NAME = "go3-v2";

const urlsToCache = [
    "/",
    "//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css",
    "/dist/main.css",
    "/dist/bundle.js",
    "/dist/service-worker.js",
    "/config.js",
    ...(routes.map(route => route.path())),
];

self.addEventListener("install", (event: ExtendableEvent) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(urlsToCache);
    })());
});

self.addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith((async () => {
        const cacheEntry = await caches.match(event.request);
        if (cacheEntry) {
            return cacheEntry;
        }
        return fetch(event.request);

    })());
});

self.addEventListener("message", (event: MessageEvent) => {
    console.log(event);
});

self.addEventListener("activate", (event: ExtendableEvent) => {
    event.waitUntil((async () => {
        (self as any).clients.claim();
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => {
            if (key !== CACHE_NAME) {
                return caches.delete(key);
            }
        }));
    })());
});
