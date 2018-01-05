import { autobind } from "decko";
import { initialize, component, inject } from "tsdi";

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

@component({ eager: true }) @autobind
class ServiceWorker {
    private serviceWorker: ServiceWorkerGlobalScope = self;

    private async onInstall(event: ExtensableEvent) {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(urlsToCache);
    }

    private async onActivate(event: ExtendableEvent) {
        this.serviceWorker.clients.claim();
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => {
            if (key !== CACHE_NAME) {
                return caches.delete(key);
            }
        }));
    }

    private async onPush(event: PushEvent) {
    
    }

    private async onFetch(event: FetchEvent) {
        const cacheEntry = await caches.match(event.request);
        if (cacheEntry) {
            return cacheEntry;
        }
        return fetch(event.request);
    }

    @initialize
    private init() {
        this.serviceWorker.addEventListener("install", (event: ExtendableEvent) => {
            event.waitUntil(this.onInstall(event));
        });

        this.serviceWorker.addEventListener("fetch", (event: FetchEvent) => {
            event.respondWith(this.onFetch(event));
        });

        this.serviceWorker.addEventListener("activate", (event: ExtendableEvent) => {
            event.waitUntil(this.onActivate(event));
        });

        this.serviceWorker.addEventListener("push", (event: PushEvent) => {
            this.onPush(event);
        });
    }
}
