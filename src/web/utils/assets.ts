import { component } from "tsdi";
import { bindAll } from "lodash-decorators";
import * as downscale from "downscale";

function getKey(url: string, width?: number, height?: number) {
    if (typeof width !== "undefined" && typeof height !== "undefined") {
        return `${width}__${height}__${url}`;
    }
    return url;
}

@component
@bindAll()
export class Assets {
    private images = new Map<string, HTMLImageElement>();
    private loading = new Map<string, ((HTMLImageElement) => void)[]>();
    private scaling = new Map<string, ((HTMLImageElement) => void)[]>();

    public get loaded() { return this.loading.size === 0; }

    public loadImage(url: string, width?: number, height?: number) {
        if (typeof width === "undefined" || typeof height === "undefined") {
            return this.downloadImage(url);
        }
        return new Promise<HTMLImageElement>(async resolve => {
            const key = getKey(url, width, height);
            if (this.images.has(key)) {
                return resolve(this.images.get(key));
            }
            if (!this.scaling.has(key)) {
                this.scaling.set(key, []);
                const original = await this.downloadImage(url);
                const scaled = await downscale(original, width, height, { imageType: "png" });
                const scaledImg = new Image();
                scaledImg.addEventListener("load", () => {
                    this.images.set(key, scaledImg);
                    this.scaling.get(key).forEach(callback => callback(scaledImg));
                    this.scaling.delete(key);
                });
                scaledImg.src = scaled;
            }
            this.scaling.get(key).push(resolve);
        });
    }

    private downloadImage(url: string) {
        return new Promise<HTMLImageElement>(resolve => {
            if (this.images.has(url)) {
                return resolve(this.images.get(url));
            }
            if (!this.loading.has(url)) {
                this.loading.set(url, []);
                const img = new Image();
                img.addEventListener("load", () => {
                    this.images.set(url, img);
                    this.loading.get(url).forEach(callback => callback(img));
                    this.loading.delete(url);
                });
                img.src = url;
            }
            this.loading.get(url).push(resolve);
        });
    }

    public get(url: string, width?: number, height?: number) {
        return this.images.get(getKey(url, width, height));
    }
}
