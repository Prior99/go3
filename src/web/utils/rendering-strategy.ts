import { RenderingStrategy } from "../../common";

interface DrawInstructions {
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    asset: HTMLImageElement;
    closedTop: boolean;
    closedBottom: boolean;
    closedLeft: boolean;
    closedRight: boolean;
}

export const strategies = new Map<RenderingStrategy, (DrawInstructions) => void>();

strategies.set(RenderingStrategy.CLASSIC, (drawInstructions: DrawInstructions) => {
    const { asset, ctx, width, height } = drawInstructions;
    ctx.drawImage(asset, 0, 0, assetWidth, assetHeight, 0, 0, width, height);
});

strategies.set(RenderingStrategy.MODERN, (drawInstructions: DrawInstructions) => {
    const { asset, ctx, width, height, closedTop, closedBottom, closedLeft, closedRight } = drawInstructions;
    let topLeftRound = true;
    let topRightRound = true;
    let bottomLeftRound = true;
    let bottomRightRound = true;
    if (closedTop) {
        topLeftRound = false;
        topRightRound = false;
    }
    if (closedBottom) {
        bottomLeftRound = false;
        bottomRightRound = false;
    }
    if (closedLeft) {
        topLeftRound = false;
        bottomLeftRound = false;
    }
    if (closedRight) {
        topRightRound = false;
        bottomRightRound = false;
    }
    if (topLeftRound) {
        ctx.drawImage(
            asset,
            0, 0,
            assetWidth / 2, assetHeight / 2,
            0, 0,
            width / 2, height / 2,
        );
    } else {
        ctx.drawImage(
            asset,
            assetWidth, 0,
            assetWidth / 2, assetHeight / 2,
            0, 0,
            width / 2, height / 2,
        );
    }
    if (topRightRound) {
        ctx.drawImage(
            asset,
            assetWidth / 2, 0,
            assetWidth / 2, assetHeight / 2,
            width / 2, 0,
            width / 2, height / 2,
        );
    } else {
        ctx.drawImage(
            asset,
            assetWidth + assetWidth / 2, 0,
            assetWidth / 2, assetHeight / 2,
            width / 2, 0,
            width / 2, height / 2,
        );
    }
    if (bottomLeftRound) {
        ctx.drawImage(
            asset,
            0, assetHeight / 2,
            assetWidth / 2, assetHeight / 2,
            0, height / 2,
            width / 2, height / 2,
        );
    } else {
        ctx.drawImage(
            asset,
            assetWidth, assetHeight / 2,
            assetWidth / 2, assetHeight / 2,
            0, height / 2,
            width / 2, height / 2,
        );
    }
    if (bottomRightRound) {
        ctx.drawImage(
            asset,
            assetWidth / 2, assetHeight / 2,
            assetWidth / 2, assetHeight / 2,
            width / 2, height / 2,
            width / 2, height / 2,
        );
    } else {
        ctx.drawImage(
            asset,
            assetWidth + assetWidth / 2, assetHeight / 2,
            assetWidth / 2, assetHeight / 2,
            width / 2, height / 2,
            width / 2, height / 2,
        );
    }
});

const assetWidth = 200;
const assetHeight = 200;

export function drawToken(strategy: RenderingStrategy, instructions: DrawInstructions) {
    if (!strategies.has(strategy)) {
        return;
    }
    // console.log(strategies.get(strategy))
    strategies.get(strategy)(instructions);
}
