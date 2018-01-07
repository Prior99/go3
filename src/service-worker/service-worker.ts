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
    private ports: MessagePort[] = [];

    @bind
    public async onInstall(event: ExtendableEvent) {
        this.serviceWorker.skipWaiting();
        console.log("install")
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(urlsToCache);
    }

    @bind
    public async onActivate(event: ExtendableEvent) {
        console.log("activate")
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
        console.log("Received push", event, this.ports)
        this.ports.forEach(port => port.postMessage("push"));
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

    @bind
    public async onMessage(event: MessageEvent) {
        console.log("message on sw", event);
        this.ports.push(...event.ports);
        console.log(this.ports);
    }
}
