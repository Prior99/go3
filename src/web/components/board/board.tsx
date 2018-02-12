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
    @inject private assets: Assets;

    private backgroundCanvas: HTMLCanvasElement;
    private backgroundCtx: CanvasRenderingContext2D;
    private foregroundCanvas: HTMLCanvasElement;
    private foregroundCtx: CanvasRenderingContext2D;

    private lastClickedCell: Cell;
    private lastHoveredCell: Cell;

    @bind private handleMouseMove(event: React.SyntheticEvent<HTMLCanvasElement>) {
        const { offsetX: x, offsetY: y } = event.nativeEvent as MouseEvent;
        const cell = this.cellAt(x, y)
        if (this.lastHoveredCell !== cell && this.lastHoveredCell) {
            this.lastHoveredCell.onHoverEnd();
            if (this.lastClickedCell) {
                this.lastClickedCell.onUnfocus();
                delete this.lastClickedCell;
            }
        }
        this.lastHoveredCell = cell;
        cell.onHoverStart();
    }

    @bind private handleClick(event: React.SyntheticEvent<HTMLCanvasElement>) {
        const { offsetX: x, offsetY: y } = event.nativeEvent as MouseEvent;
        const cell = this.cellAt(x, y)
        if (this.lastClickedCell !== cell && this.lastClickedCell) {
            this.lastClickedCell.onUnfocus();
        }
        this.lastClickedCell = cell;
        cell.onClick();
    }

    @bind private cellAt(x: number, y: number) {
        return this.cells(this.props.game.id).find(cell => cell.inside(x, y));
    }

    @bind private handleConfirm(index: number) {
        const { onPlace } = this.props;
        if (!onPlace) {
            return;
        }
        onPlace(index);
    }

    @computed private get ownColor() { return this.props.game.getColorForUser(this.login.userId); }

    @memoize private cells(gameId: string) {
        const { game } = this.props;
        const { foregroundCanvas: canvas, handleConfirm: onConfirm } = this;
        return this.props.game.currentBoard.state.map((_, index) => new Cell({ game, index, onConfirm, canvas }));
    }

    @computed private get instructions() {
        const { backgroundCanvas: canvas, backgroundCtx: ctx } = this;
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
        if (!this.backgroundCanvas || !this.foregroundCanvas) { return; }
        const begin = Date.now();
        // Time measurement start.
        this.drawCells();
        // Time measurement stop.
        const took = Date.now() - begin;
        if (took > 1000 / 60) {
            console.warn(`Rendering took ${Date.now() - begin}ms, which is above 60Hz threshold of ${1000 / 60}ms.`);
        }
        window.requestAnimationFrame(this.renderCanvas);
    }

    @bind private resizeCanvas() {
        const { game } = this.props;
        const { boardSize } = game;

        const { clientWidth, clientHeight } = this.backgroundCanvas;
        const ratio = window.devicePixelRatio || 1;
        const width = clientWidth * ratio;
        const height = clientHeight * ratio;

        this.backgroundCanvas.width = width;
        this.backgroundCanvas.height = height;
        this.foregroundCanvas.width = width;
        this.foregroundCanvas.height = height;

        this.drawBoard();
     }

    public componentDidMount() { this.renderCanvas(); }
    public componentDidUpdate() { this.renderCanvas(); }

    @bind private initCanvas() {
        if (!this.backgroundCanvas || !this.foregroundCanvas) { return; }
        this.renderCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());
        this.resizeCanvas();
    }

    @bind private handleForegroundCanvasRef(element: HTMLCanvasElement) {
        this.foregroundCanvas = element;
        this.foregroundCtx = this.foregroundCanvas.getContext("2d");
        this.initCanvas();
    }

    @bind private handleBackgroundCanvasRef(element: HTMLCanvasElement) {
        this.backgroundCanvas = element;
        this.backgroundCtx = this.backgroundCanvas.getContext("2d");
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
                <canvas
                    onClick={this.handleClick}
                    onMouseMove={this.handleMouseMove}
                    width={0}
                    height={0}
                    className={css.foregroundCanvas}
                    ref={this.handleForegroundCanvasRef}
                />
                <canvas
                    width={0}
                    height={0}
                    className={css.backgroundCanvas}
                    ref={this.handleBackgroundCanvasRef}
                />
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
