import { bindAll } from "lodash-decorators";
import { initialize, component, inject } from "tsdi";

import { routes, routeGame, routeGames } from "../common-ui/routing";

@component({ eager: true })
@bindAll()
export class Go3ServiceWorker {
    private serviceWorker: ServiceWorkerGlobalScope = self as any;

    public async onInstall(event: ExtendableEvent) {
        this.serviceWorker.skipWaiting();
    }

    public async onActivate(event: ExtendableEvent) {
        this.serviceWorker.clients.claim();
    }

    public async onPush(event: PushEvent) {
        const clients = await this.serviceWorker.clients.matchAll();
        if (clients.length === 0) {
            return;
        }
        clients.forEach((client, index) => index !== 0 && client.postMessage("push"));
        clients[0].postMessage("notify");
        return;
    }

    public async onFetch(event: FetchEvent) {
        return fetch(event.request);
    }

    public async onNotificationClick(event: any) {
        const gameId = event.notification.data || event.notification.tag;
        event.notification.close();
        if (gameId) {
            const url = routeGame.path(gameId);
            const clients = await this.serviceWorker.clients.matchAll();
            const clientOnUrl: any = clients.find(client =>
                client.url.substr(client.url.length - url.length, client.url.length) === url,
            );
            if (clientOnUrl && typeof clientOnUrl.focus === "function") {
                clientOnUrl.focus();
            } else {
                await this.serviceWorker.clients.openWindow(url);
            }
        } else {
            await this.serviceWorker.clients.openWindow(routeGames.path());
        }
    }
}
