declare module "web-push" {
    export function setVapidDetails(url: string, publicKey: string, privateKey: string);
    export function setGCMAPIKey(key: string);

    export interface PushNotificationOptions {
        endpoint: string;
        keys?: {
            auth: string;
            p256dh: string;
        };
    }

    export function sendNotification(options: PushNotificationOptions, payload?: string);
}
