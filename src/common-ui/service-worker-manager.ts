import { component, initialize, inject } from "tsdi";
import { bind } from "decko";

import { publicKey, urlB64ToUint8Array } from "../vapid-keys";
import { LoginStore } from ".";
import { Tokens } from "../common";
import { GamesStore } from "./";

@component({ name: "ServiceWorkerManager", eager: true })
export class ServiceWorkerManager {
    @inject("LoginStore") private loginStore: LoginStore;
    @inject private tokens: Tokens;
    @inject private games: GamesStore;

    private channel = new MessageChannel();
    private pushSubscription: PushSubscription;
    private registration: ServiceWorkerRegistration;

    public get hasSubscription() { return Boolean(this.pushSubscription); }

    public async updateSubscription() {
        if (!this.loginStore.loggedIn) {
            return;
        }
        await this.tokens.updatePushEndpoint(this.loginStore.authToken, this.pushSubscription.endpoint);
        // await this.games.disableAutoRefresh();
    }

    @bind
    private async onPush(event: MessageEvent) {
        this.registration.showNotification("Test");
        console.log("Received message", event)
    }

    @initialize
    private async register() {
        this.channel.port1.addEventListener("message", this.onPush);
        this.channel.port2.addEventListener("message", this.onPush);
        if (!window.navigator || !window.navigator.serviceWorker) {
            return;
        }
        try {
            this.registration = await window.navigator.serviceWorker.register("/service-worker.js", {
                scope: "/",
            });
        }
        catch (err) {
            console.error("Unable to register service worker.", err);
            return;
        }
        if (!this.registration.active) {
            console.error("Serviceworker was not active after registering.");
            return;
        }
        try {
            this.pushSubscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlB64ToUint8Array(publicKey),
            });
            this.updateSubscription();
        } catch (err) {
            console.error("Unable to subscribe to push service.", err);
            return;
        }
        // window.navigator.serviceWorker.addEventListener("message", this.onPush);
        console.log("hello")
        this.registration.active.addEventListener("push", event => console.log("add event push", event));
        this.registration.active.addEventListener("message", event => console.log("add event message", event));
        this.registration.active.postMessage("hello", [this.channel.port1]);
    }
}
