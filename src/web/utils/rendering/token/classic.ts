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

    public draw(instructions: TokenDrawInstructions) {
        if (!this.assets.loaded) { return; }
        const { color, ctx, width, height, last, preview, status, valid } = instructions;
        if (preview && !valid) {
            ctx.drawImage(this.assets.get(tokenInvalid, width, height), 0, 0, width, height, 0, 0, width, height);
            return;
        }

        ctx.fillStyle = this.colorScheme.color.get(color).toString();
        switch (color) {
            case Color.WHITE:
            case Color.BLACK:
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, width / 2 - 1, 0, Math.PI * 2);
                ctx.fill();
                break;
            default: break;
        }

        if (last) {
            ctx.strokeStyle = this.colorScheme.last.string();
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(width / 2 - 1, height / 2 - 1, width / 2 - 15, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (!preview && color !== Color.EMPTY) {
            ctx.strokeStyle = this.colorScheme.status[status];
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}
