import { TSDI } from "tsdi";
import { Go3ServiceWorker } from "./service-worker";

const tsdi: TSDI = new TSDI();

tsdi.enableComponentScanner();

const go3Worker = tsdi.get(Go3ServiceWorker);

self.addEventListener("install", (event: ExtendableEvent) => {
    event.waitUntil(go3Worker.onInstall(event));
});

self.addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(go3Worker.onFetch(event));
});

self.addEventListener("activate", (event: ExtendableEvent) => {
    event.waitUntil(go3Worker.onActivate(event));
});

self.addEventListener("push", (event: PushEvent) => {
    go3Worker.onPush(event);
});
