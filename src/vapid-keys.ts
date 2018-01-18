import { isBrowser } from "./common/utils";
import { error } from "winston";

declare var GO3_PUSH_PUBLIC_KEY: string;

// Taken and adapted from: https://github.com/GoogleChromeLabs/web-push-codelab/blob/master/app/scripts/main.js
export function urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

export const publicKey = isBrowser() ? GO3_PUSH_PUBLIC_KEY : process.env["GO3_PUSH_PUBLIC_KEY"];
export const privateKey = isBrowser() ? undefined : process.env["GO3_PUSH_KEY"];

if (isBrowser()) {
    if (!publicKey) {
        console.error("Public key for push API not defined.");
        console.error("Was the environmentvariable GO3_PUSH_PUBLIC_KEY defined when executing webpack?");
    }
} else {
    if (!publicKey) {
        error("Public key for push API not defined.");
        error("Was the environmentvariable GO3_PUSH_PUBLIC_KEY defined when starting the server?");
    }
    if (!privateKey) {
        error("Private key for push API not defined.");
        error("Was the environmentvariable GO3_PUSH_KEY defined when starting the server?");
    }
}
