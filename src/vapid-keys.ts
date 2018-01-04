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

export const publicKey = "BPFYs2UAvISg3gPmcRHnZMSxOMvwjm6fPl_wgD2hnpYvaJEO54M-4ymsE5mA9zGrVxT0wcpD-M2S-xj04UQUe3I";
export const privateKey = process.env["GO3_PUSH_KEY"];
