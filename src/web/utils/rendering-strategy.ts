import { RenderingStrategy } from "../../common";

export enum Asset {
    BLACK = "black",
    WHITE = "white",
    LAST = "last",
}

interface DrawInstructions {
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    asset: Asset;
    closedTop: boolean;
    closedBottom: boolean;
    closedLeft: boolean;
    closedRight: boolean;
}

export const strategies = new Map<RenderingStrategy, (DrawInstructions) => void>();

strategies.set(RenderingStrategy.CLASSIC, (drawInstructions: DrawInstructions) => {
    const { asset, ctx, width, height } = drawInstructions;

    switch (asset) {
        case Asset.WHITE:
            ctx.fillStyle = "rgb(220, 220, 220)";
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 1, 0, Math.PI * 2);
            ctx.fill();
            break;
        case Asset.BLACK:
            ctx.fillStyle = "rgb(20, 20, 20)";
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 1, 0, Math.PI * 2);
            ctx.fill();
            break;
        case Asset.LAST:
            ctx.strokeStyle = "rgb(255, 80, 0)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
            break;
        default: break;
    }
});

strategies.set(RenderingStrategy.MODERN, (drawInstructions: DrawInstructions) => {
    const { asset, ctx, width, height, closedTop, closedBottom, closedLeft, closedRight } = drawInstructions;

    const assetWidth = width;
    const assetHeight = height;

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
    const border = asset === Asset.LAST ? 2 : 0;
    const radius = width / 2 - border;
    const stroke = asset === Asset.LAST;

    ctx.beginPath();
    ctx.moveTo(border, height / 2);
    if (topLeftRound) {
        if (!stroke) { ctx.moveTo(width / 2, height / 2); }
        ctx.arc(width / 2, height / 2, radius, Math.PI, Math.PI * 1.5);
    } else {
        if (stroke) {
            ctx.lineTo(border, border);
            ctx.lineTo(width / 2, border);
        } else {
            ctx.rect(0, 0, width / 2, height / 2);
        }
    }
    ctx.moveTo(width / 2, border);
    if (topRightRound) {
        if (!stroke) { ctx.moveTo(width / 2, height / 2); }
        ctx.arc(width / 2, height / 2, radius, Math.PI * 1.5, Math.PI * 2);
    } else {
        if (stroke) {
            ctx.lineTo(width - border, border);
            ctx.lineTo(width - border, height / 2);
        } else {
            ctx.rect(width / 2, 0, width / 2, height / 2);
        }
    }
    ctx.moveTo(width - border, height / 2);
    if (bottomRightRound) {
        if (!stroke) { ctx.moveTo(width / 2, height / 2); }
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 0.5);
    } else {
        if (stroke) {
            ctx.lineTo(width - border, height - border);
            ctx.lineTo(width / 2, height - border);
        } else {
            ctx.rect(width / 2, height / 2, width / 2, height / 2);
        }
    }
    ctx.moveTo(width / 2, height - border);
    if (bottomLeftRound) {
        if (!stroke) { ctx.moveTo(width / 2, height / 2); }
        ctx.arc(width / 2, height / 2, radius, Math.PI * 0.5, Math.PI);
    } else {
        if (stroke) {
            ctx.lineTo(border, height - border);
            ctx.lineTo(border, height / 2);
        } else {
            ctx.rect(0, height / 2, width / 2, height / 2);
        }
    }

    switch (asset) {
        case Asset.WHITE:
            ctx.fillStyle = "rgb(220, 220, 220)";
            ctx.fill();
            break;
        case Asset.BLACK:
            ctx.fillStyle = "rgb(20, 20, 20)";
            ctx.fill();
            break;
        case Asset.LAST:
            ctx.strokeStyle = "rgb(255, 80, 0)";
            ctx.lineWidth = 4;
            ctx.stroke();
            break;
        default: break;
    }
});

export function drawToken(strategy: RenderingStrategy, instructions: DrawInstructions) {
    if (!strategies.has(strategy)) {
        return;
    }
    // console.log(strategies.get(strategy))
    strategies.get(strategy)(instructions);
}
