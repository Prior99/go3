import { bind } from "decko";
import { initialize, component, inject } from "tsdi";

import { routes } from "../common-ui/routing";

@component({ eager: true })
export class Go3ServiceWorker {
    private serviceWorker: ServiceWorkerGlobalScope = self as any;

    @bind
    public async onInstall(event: ExtendableEvent) {
        this.serviceWorker.skipWaiting();
    }

    @bind
    public async onActivate(event: ExtendableEvent) {
        this.serviceWorker.clients.claim();
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
        return fetch(event.request);
    }
}
