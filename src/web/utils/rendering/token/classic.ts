import { component, inject, initialize } from "tsdi";

import { Color, GroupStatus } from "../../../../common";
import { ColorScheme } from "../color-scheme";
import { Assets } from "../../assets";

import { TokenDrawInstructions } from "./draw-instructions";
import { TokenRenderingStrategy } from "./rendering-strategy";
import * as tokenInvalid from "./token-invalid.png";

@component
export class TokenClassic extends TokenRenderingStrategy {
    @inject private colorScheme: ColorScheme;
    @inject private assets: Assets;

    @initialize
    private async loadImages() {
        await this.assets.loadImage(tokenInvalid);
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

    public draw(instructions: TokenDrawInstructions) {
        if (!this.assets.loaded) { return; }
        const { color, ctx, width, height, lastTurn, status, valid, hovered, locked } = instructions;
        const opacity = this.opacity(instructions);
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
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, width / 2 - 1, 0, Math.PI * 2);
                ctx.fill();
                break;
            default: break;
        }

        if (lastTurn) {
            ctx.strokeStyle = this.colorScheme.last.string();
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(width / 2 - 1, height / 2 - 1, width / 2 - 15, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (!hovered && !locked && color !== Color.EMPTY) {
            ctx.strokeStyle = this.colorScheme.status.get(status).fade(1 - opacity).string();
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}
