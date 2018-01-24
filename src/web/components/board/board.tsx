import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import { bind, memoize } from "decko";
import { external, inject, initialize } from "tsdi";

import { GamesStore, LoginStore, OwnUserStore } from "../../../common-ui";
import { Game, Color } from "../../../common";
import { Assets, Rendering } from "../../utils";
import { Cell } from "./cell";
import * as css from "./board.scss";

export interface BoardProps {
    readonly game?: Game;
    readonly onPlace?: (index: number) => void;
    readonly minimal?: boolean;
}

@external @observer
export class Board extends React.Component<BoardProps> {
    @inject private login: LoginStore;
    @inject private ownUser: OwnUserStore;
    @inject private rendering: Rendering;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private handleClick(index: number) {
        const { onPlace } = this.props;
        if (!onPlace) {
            return;
        }
        onPlace(index);
    }

    @computed private get ownColor() { return this.props.game.getColorForUser(this.login.userId); }

    @memoize private cells(gameId: string) {
        const { game } = this.props;
        const { canvas, handleClick: onConfirm } = this;
        return this.props.game.currentBoard.state.map((_, index) => new Cell({ game, index, onConfirm, canvas }));
    }

    @computed private get instructions() {
        const { canvas, ctx } = this;
        return {
            ctx,
            width: canvas.width,
            height: canvas.height,
            boardSize: this.props.game.boardSize,
        };
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

    private drawBoard() {
        this.rendering.drawBoard(this.instructions);
    }

    private drawCells() {
        this.cells(this.props.game.id).forEach(cell => cell.draw());
    }

    @bind private renderCanvas() {
        if (!this.canvas) { return; }
        const begin = Date.now();
        // Time measurement start.
        this.drawBoard();
        this.drawCells();
        // Time measurement stop.
        const took = Date.now() - begin;
        if (took > 1000 / 60) {
            console.warn(`Rendering took ${Date.now() - begin}ms, which is above 60Hz threshold of ${1000 / 60}ms.`);
        }
        window.requestAnimationFrame(this.renderCanvas);
    }

    @bind private initCanvas() {
        this.ctx.imageSmoothingEnabled = true;
        const { game } = this.props;
        const { boardSize } = game;

        const { clientWidth, clientHeight } = this.canvas;
        const ratio = window.devicePixelRatio || 1;
        const width = clientWidth * ratio;
        const height = clientHeight * ratio;
        this.canvas.width = width;
        this.canvas.height = height;
     }

    public componentDidMount() { this.renderCanvas(); }
    public componentDidUpdate() { this.renderCanvas(); }

    @bind private handleCanvasRef(element: HTMLCanvasElement) {
        this.canvas = element;
        this.ctx = this.canvas.getContext("2d");
        this.renderCanvas();
        window.addEventListener("resize", () => this.initCanvas());
        this.initCanvas();
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
