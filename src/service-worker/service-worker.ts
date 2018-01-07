import { bind } from "decko";
import { initialize, component, inject } from "tsdi";

import { routes } from "../common-ui/routing";

const CACHE_NAME = "go3-v2";

const urlsToCache = [
    "/",
    "//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css",
    "/main.css",
    "/bundle.js",
    "/service-worker.js",
    "/config.js",
    ...(routes.map(route => route.path())),
];

@component({ eager: true })
export class Go3ServiceWorker {
    private serviceWorker: ServiceWorkerGlobalScope = self as any;

    @bind
    public async onInstall(event: ExtendableEvent) {
        this.serviceWorker.skipWaiting();
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(urlsToCache);
    }

    @bind
    public async onActivate(event: ExtendableEvent) {
        this.serviceWorker.clients.claim();
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => {
            if (key !== CACHE_NAME) {
                return caches.delete(key);
            }
        }));
    }

    @bind
    public async onPush(event: PushEvent) {
        const clients = await this.serviceWorker.clients.matchAll();
        if (clients.length === 0) {
            return;
        }
        clients.forEach((client, index) => index !== 0 && client.postMessage("push"));
        clients[0].postMessage("notify");
        return;
    }

    @bind
    public async onFetch(event: FetchEvent) {
        const cacheEntry = await caches.match(event.request);
        if (cacheEntry) {
            return cacheEntry;
        }
        return fetch(event.request);
    }
}
