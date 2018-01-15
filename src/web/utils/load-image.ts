import { component } from "tsdi";
import { bind } from "decko";

@component
export class Assets {
    private images = new Map<string, HTMLImageElement>();
    private loading = new Map<string, ((HTMLImageElement) => void)[]>;

    public get loaded() { return loading.length === 0; }

    @bind public loadImage(url: string) {
        return new Promise<HTMLImageElement>(resolve => {
            if (!this.loading.has(url)) {
                this.loading.set(url, []);
            }
            this.loading.get(url).push(resolve);
            const img = new Image();
            img.src = url;
            img.addEventListener("load", () => {
                this.images.set(url, img);
                this.loading.get(url).forEach(callback => callback(img));
                this.loading.delete(url);
            });
        });
    }

    @bind public get(url: string) {
        return this.images.get(url);
    }
}
