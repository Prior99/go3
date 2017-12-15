import * as React from "react";
import { GamesStore } from "store";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Board } from "models";
import { bind } from "bind-decorator";
import * as css from "./preview-board.scss";
import { Color } from "board-color";

export interface PreviewBoardProps {
    readonly board: Board;
}

@external @observer
export class PreviewBoard extends React.Component<PreviewBoardProps> {
    private canvas: HTMLCanvasElement;

    @bind private handleCanvasRef(element: HTMLCanvasElement) {
        this.canvas = element;
        this.renderBoard();
    }

    @bind private renderBoard() {
        if (!this.canvas) {
            return;
        }
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        const ctx = this.canvas.getContext("2d");
        const { width, height } = this.canvas;
        const minDimension = Math.min(width, height);
        const { board } = this.props;
        const { size, state } = board;
        const cellSize = minDimension / size;
        ctx.fillStyle =  "rgb(208, 184, 146)";
        ctx.fillRect(0, 0, minDimension, minDimension);
        state.forEach((color, index) => {
            if (color === Color.EMPTY) {
                return;
            }
            const { col, row } = board.toPos(index);
            const x = col * cellSize;
            const y = row * cellSize;
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = color === Color.BLACK ?
                "rgb(0, 0, 0)" :
                "rgb(255, 255, 255)";
            ctx.fill();
            if (index === board.placedAt) {
                ctx.strokeStyle = "rgb(255, 60, 60)";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }

    public render() {
        const { board } = this.props;
        return (
            <canvas className={css.canvas} ref={this.handleCanvasRef} />
        );
    }
}
