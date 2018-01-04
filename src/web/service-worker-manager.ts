import { component, initialize, inject } from "tsdi";

import { publicKey, urlB64ToUint8Array } from "../vapid-keys";
import { LoginStore } from "../common-ui";
import { Tokens } from "../common";

@component({ eager: true })
export class ServiceWorkerManager {
    @inject private loginStore: LoginStore;
    @inject private tokens: Tokens;

    private pushSubscription: PushSubscription;

    public get hasSubscription() { return Boolean(this.pushSubscription); }

    public async updateSubscription() {
        if (!this.loginStore.loggedIn) {
            return;
        }
        await this.tokens.updatePushEndpoint(this.loginStore.authToken, this.pushSubscription.endpoint);
    }

    @initialize
    private async register() {
        if (!navigator || !navigator.serviceWorker) {
            return;
        }
        const registration = await navigator.serviceWorker.register("/dist/service-worker.js");
        this.pushSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(publicKey),
        });
        this.updateSubscription();
    }
}
