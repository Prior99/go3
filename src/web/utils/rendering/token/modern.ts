import { component, inject, initialize } from "tsdi";

import { ColorScheme } from "../color-scheme";
import { Color, GroupStatus, Token } from "../../../../common";
import { Assets } from "../../assets";

import { TokenDrawInstructions } from "./draw-instructions";
import { TokenRenderingStrategy } from "./rendering-strategy";
import * as tokenInvalid from "./token-invalid.png";

interface RoundResult {
    topLeftRound: boolean;
    topRightRound: boolean;
    bottomLeftRound: boolean;
    bottomRightRound: boolean;
}

@component
export class TokenModern extends TokenRenderingStrategy {
    @inject private colorScheme: ColorScheme;
    @inject private assets: Assets;

    @initialize
    private async loadImages() {
        await this.assets.loadImage(tokenInvalid);
    }

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
        const { width, height, ctx, lastTurn } = drawInstructions;
        const { topLeftRound, topRightRound, bottomLeftRound, bottomRightRound } = this.getRound(drawInstructions);

        if (!lastTurn) { return; }

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

        ctx.strokeStyle = this.colorScheme.last.string();
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    private opacity(instructions: TokenDrawInstructions) {
        const { hovered, locked } = instructions;
        if (locked) {
            return Math.sin(Math.PI * 2 * (Date.now() % 1000) / 1000) / 2 + 0.5;
        }
        if (hovered) {
            return 0.5;
        }
        return 1;
    }

    public draw(drawInstructions: TokenDrawInstructions) {
        if (!this.assets.loaded) { return; }

        const {
            color,
            ctx,
            width,
            height,
            closedTop,
            closedBottom,
            closedLeft,
            closedRight,
            hovered,
            valid,
        } = drawInstructions;
        const opacity = this.opacity(drawInstructions);
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

        if (hovered && !valid) {
            ctx.globalAlpha = 0.5;
            ctx.drawImage(this.assets.get(tokenInvalid), 0, 0, width, height);
            ctx.globalAlpha = 1;
            return;
        }

        switch (color) {
            case Color.WHITE:
            case Color.BLACK:
                ctx.fillStyle = this.colorScheme.color.get(color).fade(1 - opacity).string();
                ctx.fill();
                break;
            default: break;
        }

        this.drawLast(drawInstructions);
    }
}
