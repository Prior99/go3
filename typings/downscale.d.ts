export interface DownscaleOptions {
    imageType: "jpeg" | "png" | "webp";
    quality: number;
    returnBlob: boolean;
    returnCanvas: boolean;
    sourceX: number;
    sourceY: number;
}

declare function downscale(
    source: HTMLImageElement,
    width: number,
    height: number,
    options?: DownscaleOptions,
): Promise<string>;

export = downscale;
