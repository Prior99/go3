import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import { bindAll, memoize } from "lodash-decorators";
import { external, inject, initialize } from "tsdi";
import * as Uuid from "uuid";
import { Dimmer, Loader } from "semantic-ui-react";

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

function transformDPR(x: number) {
    const ratio = window.devicePixelRatio || 1;
    return x * ratio;
}

@external @observer
@bindAll()
export class Board extends React.Component<BoardProps> {
    @inject private login: LoginStore;
    @inject private ownUser: OwnUserStore;
    @inject private rendering: Rendering;
    @inject private assets: Assets;

    private backgroundCanvas: HTMLCanvasElement;
    private backgroundCtx: CanvasRenderingContext2D;
    private foregroundCanvas: HTMLCanvasElement;
    private foregroundCtx: CanvasRenderingContext2D;

    private sessionId = Uuid.v4();

    private lastClickedCell: Cell;
    private lastHoveredCell: Cell;

    private renderLoopActive = false;

    @observable private loaded = false;

    private handleMouseMove(event: React.SyntheticEvent<HTMLCanvasElement>) {
        const { offsetX: x, offsetY: y } = event.nativeEvent as MouseEvent;
        const cell = this.cellAt(x, y);
        if (!cell) { return; }
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

    private handleClick(event: React.SyntheticEvent<HTMLCanvasElement>) {
        const { offsetX: x, offsetY: y } = event.nativeEvent as MouseEvent;
        const cell = this.cellAt(x, y);
        if (!cell) { return; }
        if (this.lastClickedCell !== cell && this.lastClickedCell) {
            this.lastClickedCell.onUnfocus();
        }
        this.lastClickedCell = cell;
        cell.onClick();
    }

    private cellAt(x: number, y: number) {
        return this.cells(this.props.game.id).find(cell => cell.inside(transformDPR(x), transformDPR(y)));
    }

    private handleConfirm(index: number) {
        const { onPlace } = this.props;
        if (!onPlace) {
            return;
        }
        onPlace(index);
    }

    @computed private get ownColor() { return this.props.game.getColorForUser(this.login.userId); }

    @memoize(sessionId => sessionId)
    private cells(sessionId: string) {
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
        this.cells(this.sessionId).forEach(cell => cell.draw(this.sessionId));
    }

    private renderCanvas() {
        const begin = Date.now();
        if (this.backgroundCanvas && this.foregroundCanvas && this.assets.loaded) {
            this.drawCells();
            this.loaded = true;
        }
        const took = Date.now() - begin;
        if (took > 1000 / 60) {
            console.warn(`Rendering took ${Date.now() - begin}ms, which is above 60Hz threshold of ${1000 / 60}ms.`);
        }
        window.requestAnimationFrame(this.renderCanvas);
    }

    private resizeCanvas() {
        const { game } = this.props;
        const { boardSize } = game;

        const { clientWidth, clientHeight } = this.backgroundCanvas;
        const width = transformDPR(clientWidth);
        const height = transformDPR(clientHeight);

        this.backgroundCanvas.width = width;
        this.backgroundCanvas.height = height;
        this.foregroundCanvas.width = width;
        this.foregroundCanvas.height = height;

        this.drawBoard();
     }

    public componentDidMount() {
        this.sessionId = Uuid.v4();
    }

    public componentWillReceiveProps() {
        this.sessionId = Uuid.v4();
        this.loaded = false;
    }

    public componentDidUpdate(oldProps: BoardProps) {
        if (oldProps.game.id !== this.props.game.id) {
            this.drawBoard();
            return;
        }
    }

    public componentWillUnmount() {
        this.backgroundCanvas = undefined;
        this.foregroundCanvas = undefined;
        this.foregroundCtx = undefined;
        this.backgroundCtx = undefined;
        this.renderLoopActive = false;
    }

    private initCanvas() {
        if (!this.backgroundCanvas || !this.foregroundCanvas) { return; }
        if (this.renderLoopActive) { return; }
        this.renderLoopActive = true;
        window.addEventListener("resize", () => this.resizeCanvas());
        this.resizeCanvas();
        this.renderCanvas();
    }

    private handleForegroundCanvasRef(element: HTMLCanvasElement) {
        if (!element) {
            delete this.foregroundCanvas;
            delete this.foregroundCtx;
            return;
        }
        this.foregroundCanvas = element;
        this.foregroundCtx = this.foregroundCanvas.getContext("2d");
        this.initCanvas();
    }

    private handleBackgroundCanvasRef(element: HTMLCanvasElement) {
        if (!element) {
            delete this.backgroundCanvas;
            delete this.backgroundCtx;
            return;
        }
        this.backgroundCanvas = element;
        this.backgroundCtx = this.backgroundCanvas.getContext("2d");
        this.initCanvas();
    }

    public render() {
        const { loaded } = this;
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
                    style={{ opacity: loaded ? 1 : 0 }}
                    onClick={this.handleClick}
                    onMouseMove={this.handleMouseMove}
                    width={0}
                    height={0}
                    className={css.foregroundCanvas}
                    ref={this.handleForegroundCanvasRef}
                />
                <canvas
                    style={{ opacity: loaded ? 1 : 0 }}
                    width={0}
                    height={0}
                    className={css.backgroundCanvas}
                    ref={this.handleBackgroundCanvasRef}
                />
                {
                    !loaded && (
                        <Dimmer active>
                            <Loader>Loading</Loader>
                        </Dimmer>
                    )
                }
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
