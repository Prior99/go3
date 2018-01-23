import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import { bind } from "decko";
import { external, inject, initialize } from "tsdi";

import { GamesStore, LoginStore, OwnUserStore } from "../../../common-ui";
import { Game, Color } from "../../../common";
import { Assets } from "../../utils";
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

    private canvas: HTMLCanvasElement;

    private handleClick(index: number) {
        const { onPlace } = this.props;
        if (!onPlace) {
            return;
        }
        onPlace(index);
    }

    @computed private get ownColor() { return this.props.game.getColorForUser(this.login.userId); }
    @computed private get cells() {
        const ctx = this.canvas.getContext("2d");
        const width = this.canvas.width / this.props.game.boardSize;
        const height = this.canvas.height / this.props.game.boardSize;
        const { game } = this.props;
        return this.props.game.currentBoard.state.map((_, index) => new Cell({
            game, index, onConfirm: this.handleClick, ctx, width, height,
        }));
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
        if (!this.canvas) { return; }

        (ctx as any).imageSmoothingEnabled = "high";

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
