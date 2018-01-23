import { component, inject } from "tsdi";

import { Color, GroupStatus } from "../../../../common";
import { ColorScheme } from "../color-scheme";
import { Assets } from "../../assets";

import { TokenDrawInstructions } from "./draw-instructions";
import { TokenRenderingStrategy } from "./rendering-strategy";

@component
export class TokenClassic extends TokenRenderingStrategy {
    @inject private colorScheme: ColorScheme;

    public draw(instructions: TokenDrawInstructions) {
        const { color, ctx, width, height, last, preview, status } = instructions;

        ctx.fillStyle = this.colorScheme.color[color];
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
            ctx.strokeStyle = this.colorScheme.last;
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
