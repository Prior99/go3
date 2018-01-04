import { component, initialize, inject } from "tsdi";

@component({ eager: true })
export class ServiceWorkerManager {
    private channel = new MessageChannel();

    @initialize
    private async register() {
        this.channel.port1.addEventListener("message", (message: MessageEvent) => {

        });
        if (!navigator || !navigator.serviceWorker) {
            return;
        }
        const registration = await navigator.serviceWorker.register("/dist/service-worker.js");
        console.log(registration)
        navigator.serviceWorker.controller.postMessage("setup", [this.channel.port2]);
    }

}
