import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import { bind } from "decko";
import { external, inject, initialize } from "tsdi";

import { Game, Color } from "../../../common";
import { Assets } from "../../utils";
import { Cell } from "./cell";
import * as css from "./board.scss";
import * as boardWood from "./board-wood.png";

export interface BoardProps {
    readonly game?: Game;
    readonly onPlace?: (index: number) => void;
    readonly minimal?: boolean;
}

@external @observer
export class Board extends React.Component<BoardProps> {
    @inject private assets: Assets;

    private canvas: HTMLCanvasElement;

    @initialize
    private async loadImages() {
        await this.assets.loadImage(boardWood);
    }

    private handleClick(index: number) {
        const { onPlace } = this.props;
        if (!onPlace) {
            return;
        }
        onPlace(index);
    }

    @computed private get winningColor() {
        const { game } = this.props;
        const board = game.currentBoard;
        const scoreWhite = board.getScore(Color.WHITE);
        const scoreBlack = board.getScore(Color.BLACK);
        if (game.tie) {
            return "Tie";
        }
        if (game.currentBoard.winningColor === Color.WHITE) {
            return `White (${game.whiteUser.name}) wins`;
        }
        return `Black (${game.blackUser.name}) wins`;
    }

    @bind private renderCanvas() {
        if (!this.assets.loaded) { return; }
        if (!this.canvas) { return; }

        const { game } = this.props;
        const { boardSize } = game;

        const { clientWidth, clientHeight } = this.canvas;
        const ratio = window.devicePixelRatio || 1;
        const width = clientWidth * ratio;
        const height = clientHeight * ratio;
        this.canvas.width = width;
        this.canvas.height = height;

        const ctx = this.canvas.getContext("2d");
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

    public componentDidMount() { this.renderCanvas(); }
    public componentDidUpdate() { this.renderCanvas(); }

    @bind private handleCanvasRef(element: HTMLCanvasElement) {
        this.canvas = element;
        this.renderCanvas();
        window.addEventListener("resize", () => this.renderCanvas());
    }

    public render() {
        const { game, minimal } = this.props;
        const { currentBoard: board, over } = game;
        const { size, state } = board;
        const style = {
            gridTemplateRows: `repeat(${size}, 1fr)`,
            gridTemplateColumns: `repeat(${size}, 1fr)`,
        };
        return (
            <div className={css.container}>
                <div className={css.board} style={style}>
                    {
                        state.map((color, index) => {
                            const handleClick = () => this.handleClick(index);
                            return (
                                <Cell
                                    minimal={minimal}
                                    game={game}
                                    key={index}
                                    index={index}
                                    onClick={handleClick}
                                />
                            );
                        })
                    }
                </div>
                <canvas className={css.canvas} ref={this.handleCanvasRef} />
                {
                    over && (
                        <div className={css.over}>
                            <div className={css.gameOver}>Game Over!</div>
                            <div className={css.winningColor}>{this.winningColor}</div>
                        </div>
                    )
                }
            </div>
        );
    }
}
