import { component, inject } from "tsdi";

import { ColorScheme } from "../color-scheme";
import { Color, GroupStatus } from "../../../../common";
import { Assets } from "../../assets";

import { TokenDrawInstructions } from "./draw-instructions";
import { TokenRenderingStrategy } from "./rendering-strategy";

interface RoundResult {
    topLeftRound: boolean;
    topRightRound: boolean;
    bottomLeftRound: boolean;
    bottomRightRound: boolean;
}

@component
export class TokenModern extends TokenRenderingStrategy {
    @inject private colorScheme: ColorScheme;

    private getRound(drawInstructions: TokenDrawInstructions): RoundResult {
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

    private drawLast(drawInstructions: TokenDrawInstructions) {
        const { width, height, ctx, last } = drawInstructions;
        const { topLeftRound, topRightRound, bottomLeftRound, bottomRightRound } = this.getRound(drawInstructions);

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

        ctx.strokeStyle = this.colorScheme.last;
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    private drawLining(drawInstructions: TokenDrawInstructions) {
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
        const { topLeftRound, topRightRound, bottomLeftRound, bottomRightRound } = this.getRound(drawInstructions);

        if (color === Color.EMPTY || preview) { return; }

        const border = 2;
        const radius = width / 2 - border;

        ctx.beginPath();
        ctx.moveTo(border, height / 2);
        ctx.strokeStyle = this.colorScheme.status.get(status);
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

    public draw(drawInstructions: TokenDrawInstructions) {
        const { color, last, ctx, width, height, closedTop, closedBottom, closedLeft, closedRight } = drawInstructions;
        const { topLeftRound, topRightRound, bottomLeftRound, bottomRightRound } = this.getRound(drawInstructions);

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

        this.drawLast(drawInstructions);
        this.drawLining(drawInstructions);
    }
}
