import { RenderingStrategy, Color, GroupStatus } from "../../common";

const colors = {
    color: {
        [Color.WHITE]: "rgb(220, 220, 220)",
        [Color.BLACK]: "rgb(20, 20, 20)",
    },
    last: "rgb(80, 80, 255)",
    status: {
        [GroupStatus.ALIVE]: "rgb(80, 255, 80)",
        [GroupStatus.UNDECIDED]: "rgb(255, 255, 80)",
        [GroupStatus.DEAD]: "rgb(255, 80, 80)",
    },
};

interface DrawInstructions {
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    color: Color;
    closedTop: boolean;
    closedBottom: boolean;
    closedLeft: boolean;
    closedRight: boolean;
    closedTopLeft: boolean;
    closedBottomLeft: boolean;
    closedTopRight: boolean;
    closedBottomRight: boolean;
    last: boolean;
    preview: boolean;
    status: GroupStatus;
}

export const strategies = new Map<RenderingStrategy, (DrawInstructions) => void>();

strategies.set(RenderingStrategy.CLASSIC, (drawInstructions: DrawInstructions) => {
    const { color, ctx, width, height, last, preview, status } = drawInstructions;

    ctx.fillStyle = colors.color[color];
    switch (color) {
        case Color.WHITE:
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 1, 0, Math.PI * 2);
            ctx.fill();
            break;
        case Color.BLACK:
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 1, 0, Math.PI * 2);
            ctx.fill();
            break;
        default: break;
    }

    if (last) {
        ctx.strokeStyle = colors.last;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(width / 2 - 1, height / 2 - 1, width / 2 - 15, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (!preview && color !== Color.EMPTY) {
        ctx.strokeStyle = colors.status[status];
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();
    }
});

interface RoundResult {
    topLeftRound: boolean;
    topRightRound: boolean;
    bottomLeftRound: boolean;
    bottomRightRound: boolean;
}

function getRounds(drawInstructions: DrawInstructions): RoundResult {
    const { closedTop, closedBottom, closedLeft, closedRight } = drawInstructions;
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

    return {
        topLeftRound,
        topRightRound,
        bottomLeftRound,
        bottomRightRound,
    };
}

function drawLast(drawInstructions: DrawInstructions) {
    const { width, height, ctx, last } = drawInstructions;
    const { topLeftRound, topRightRound, bottomLeftRound, bottomRightRound } = getRounds(drawInstructions);

    if (!last) { return; }

    const offset = 15;
    const radius = width / 2 - offset;

    ctx.beginPath();
    ctx.moveTo(offset, height / 2);
    if (topLeftRound) {
        ctx.arc(width / 2, height / 2, radius, Math.PI, Math.PI * 1.5);
    } else {
        ctx.lineTo(offset, offset);
        ctx.lineTo(width / 2, offset);
    }
    ctx.moveTo(width / 2, offset);
    if (topRightRound) {
        ctx.arc(width / 2, height / 2, radius, Math.PI * 1.5, Math.PI * 2);
    } else {
        ctx.lineTo(width - offset, offset);
        ctx.lineTo(width - offset, height / 2);
    }
    ctx.moveTo(width - offset, height / 2);
    if (bottomRightRound) {
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 0.5);
    } else {
        ctx.lineTo(width - offset, height - offset);
        ctx.lineTo(width / 2, height - offset);
    }
    ctx.moveTo(width / 2, height - offset);
    if (bottomLeftRound) {
        ctx.arc(width / 2, height / 2, radius, Math.PI * 0.5, Math.PI);
    } else {
        ctx.lineTo(offset, height - offset);
        ctx.lineTo(offset, height / 2);
    }

    ctx.strokeStyle = colors.last;
    ctx.lineWidth = 4;
    ctx.stroke();
}

function drawLining(drawInstructions: DrawInstructions) {
    const {
        width,
        height,
        ctx,
        color,
        closedRight,
        closedTop,
        closedLeft,
        closedBottom,
        closedTopRight,
        closedTopLeft,
        closedBottomLeft,
        closedBottomRight,
        preview,
        status,
    } = drawInstructions;
    const { topLeftRound, topRightRound, bottomLeftRound, bottomRightRound } = getRounds(drawInstructions);

    if (color === Color.EMPTY || preview) { return; }

    const border = 2;
    const radius = width / 2 - border;

    ctx.beginPath();
    ctx.moveTo(border, height / 2);
    ctx.strokeStyle = colors.status[status];
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 4;

    if (topLeftRound) {
        ctx.arc(width / 2, height / 2, radius, Math.PI, Math.PI * 1.5);
    } else {
        if (!closedLeft) { ctx.lineTo(border, 0); }
        ctx.moveTo(0, border);
        if (!closedTop) { ctx.lineTo(width / 2, border); }
        ctx.moveTo(width / 2, border);
    }
    ctx.moveTo(width / 2, border);
    if (topRightRound) {
        ctx.arc(width / 2, height / 2, radius, Math.PI * 1.5, Math.PI * 2);
    } else {
        if (!closedTop) { ctx.lineTo(width, border); }
        ctx.moveTo(width - border, 0);
        if (!closedRight) { ctx.lineTo(width - border, height / 2); }
        ctx.moveTo(width - border, height / 2);
    }
    ctx.moveTo(width - border, height / 2);
    if (bottomRightRound) {
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 0.5);
    } else {
        if (!closedRight) { ctx.lineTo(width - border, height); }
        ctx.moveTo(width, height - border);
        if (!closedBottom) { ctx.lineTo(width / 2, height - border); }
        ctx.moveTo(width / 2, height - border);
    }
    ctx.moveTo(width / 2, height - border);
    if (bottomLeftRound) {
        ctx.arc(width / 2, height / 2, radius, Math.PI * 0.5, Math.PI);
    } else {
        if (!closedBottom) { ctx.lineTo(0, height - border); }
        ctx.moveTo(border, height);
        if (!closedLeft) { ctx.lineTo(border, height / 2); }
        ctx.moveTo(border, height / 2);
    }

    ctx.lineWidth = 4;
    ctx.stroke();

    if (!topLeftRound && !closedTopLeft) {
        ctx.fillRect(0, 0, 4, 4);
    }
    if (!topRightRound && !closedTopRight) {
        ctx.fillRect(width - 4, 0, 4, 4);
    }
    if (!bottomRightRound && !closedBottomRight) {
        ctx.fillRect(width - 4, height - 4, 4, 4);
    }
    if (!bottomLeftRound && !closedBottomLeft) {
        ctx.fillRect(0, height - 4, 4, 4);
    }
}

strategies.set(RenderingStrategy.MODERN, (drawInstructions: DrawInstructions) => {
    const { color, last, ctx, width, height, closedTop, closedBottom, closedLeft, closedRight } = drawInstructions;
    const { topLeftRound, topRightRound, bottomLeftRound, bottomRightRound } = getRounds(drawInstructions);

    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    if (topLeftRound) {
        ctx.moveTo(width / 2, height / 2);
        ctx.arc(width / 2, height / 2, width / 2, Math.PI, Math.PI * 1.5);
    } else {
        ctx.rect(0, 0, width / 2, height / 2);
    }
    ctx.moveTo(width / 2, 0);
    if (topRightRound) {
        ctx.moveTo(width / 2, height / 2);
        ctx.arc(width / 2, height / 2, width / 2, Math.PI * 1.5, Math.PI * 2);
    } else {
        ctx.rect(width / 2, 0, width / 2, height / 2);
    }
    ctx.moveTo(width - 0, height / 2);
    if (bottomRightRound) {
        ctx.moveTo(width / 2, height / 2);
        ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 0.5);
    } else {
        ctx.rect(width / 2, height / 2, width / 2, height / 2);
    }
    ctx.moveTo(width / 2, height - 0);
    if (bottomLeftRound) {
        ctx.moveTo(width / 2, height / 2);
        ctx.arc(width / 2, height / 2, width / 2, Math.PI * 0.5, Math.PI);
    } else {
        ctx.rect(0, height / 2, width / 2, height / 2);
    }

    switch (color) {
        case Color.WHITE:
            ctx.fillStyle = "rgb(220, 220, 220)";
            ctx.fill();
            break;
        case Color.BLACK:
            ctx.fillStyle = "rgb(20, 20, 20)";
            ctx.fill();
            break;
        default: break;
    }

    drawLast(drawInstructions);
    drawLining(drawInstructions);
});

export function drawToken(strategy: RenderingStrategy, instructions: DrawInstructions) {
    if (!strategies.has(strategy)) {
        return;
    }
    strategies.get(strategy)(instructions);
}
