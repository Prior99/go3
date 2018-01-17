declare module "downscale" {
    export interface Options {
        imageType: "jpeg" | "png" | "webp";
        quality: number;
        returnBlob: boolean;
        returnCanvas: boolean;
        sourceX: number;
        sourceY: number;
    }

    export default function downscale(
        source: HTMLImageElement,
        width: number,
        height: number,
        options?: Options,
    ): Promise<string>;
}
