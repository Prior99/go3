import { component, inject, initialize } from "tsdi";

import { ColorScheme } from "../color-scheme";
import { BoardDrawInstructions } from "./draw-instructions";
import { Assets } from "../../assets";

import { BoardRenderingStrategy } from "./rendering-strategy";
import * as boardWood from "./board-wood.png";

@component
export class BoardClassic extends BoardRenderingStrategy {
    @inject private colorScheme: ColorScheme;
    @inject private assets: Assets;

    @initialize
    private async loadImages() {
        await this.assets.loadImage(boardWood);
    }

    public draw(instructions: BoardDrawInstructions) {
        if (!this.assets.loaded) { return; }
        const { ctx, width, height, boardSize } = instructions;
        const cellWidth = width / boardSize;
        const cellHeight = height / boardSize;

        ctx.drawImage(this.assets.get(boardWood), 0, 0, width, height);
        ctx.textAlign = "center";
        ctx.strokeStyle = "rgb(60, 60, 40)";
        for (let col = 0; col < boardSize; ++col) {
            const x = cellWidth * col + cellWidth / 2;
            ctx.beginPath();
            ctx.moveTo(x, cellHeight / 2);
            ctx.lineTo(x, height - cellHeight / 2);
            ctx.stroke();
            if (width > 450) {
                ctx.textBaseline = "top";
                ctx.fillText(`${boardSize - col}`, x, 5);
                ctx.textBaseline = "bottom";
                ctx.fillText(`${boardSize - col}`, x, height - 5);
            }
        }
        ctx.textBaseline = "middle";
        for (let row = 0; row < boardSize; ++row) {
            const y = cellHeight * row + cellHeight / 2;
            ctx.beginPath();
            ctx.moveTo(cellWidth / 2, y);
            ctx.lineTo(width - cellWidth / 2, y);
            ctx.stroke();
            if (width > 450) {
                ctx.textAlign = "left";
                ctx.fillText(String.fromCharCode("A".charCodeAt(0) + row), 5, y);
                ctx.textAlign = "right";
                ctx.fillText(String.fromCharCode("A".charCodeAt(0) + row), width - 5, y);
            }
        }
    }
}
