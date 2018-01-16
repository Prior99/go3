import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as classNames from "classnames";
import { inject, external, initialize } from "tsdi";
import { bind } from "decko";

import { GamesStore, LoginStore } from "../../../../common-ui";
import { Game, Color } from "../../../../common";
import * as css from "./cell.scss";
import { Assets } from "../../../utils";

import { drawToken } from "./draw-token";
import * as tokenBlack from "./token-black.png";
import * as tokenWhite from "./token-white.png";
import * as tokenInvalid from "./token-invalid.png";
import * as tokenLast from "./token-last.png";

export interface CellProps {
    readonly game: Game;
    readonly index: number;
    readonly onClick?: () => void;
    readonly minimal?: boolean;
}

@external @observer
export class Cell extends React.Component<CellProps> {
    @inject private login: LoginStore;
    @inject private assets: Assets;

    @observable private locked = false;
    @observable private tokenBlack: HTMLImageElement;
    @observable private tokenWhite: HTMLImageElement;
    @observable private hovered = false;

    private canvas: HTMLCanvasElement;

    @computed private get color() { return this.props.game.currentBoard.at(this.props.index); }
    @computed private get ownColor() { return this.props.game.getColorForUser(this.login.userId); }
    @computed private get isLastTurn() { return this.props.game.currentBoard.placedAt === this.props.index; }

    @bind private closedTop(color: Color) {
        const { game, index } = this.props;
        const { col, row } = game.currentBoard.toPos(index);
        if (row === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col, row: row - 1 })) === color;
    }

    @bind private closedBottom(color: Color) {
        const { game, index } = this.props;
        const { col, row } = game.currentBoard.toPos(index);
        if (row === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col, row: row + 1 })) === color;
    }

    @bind private closedLeft(color: Color) {
        const { game, index } = this.props;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col - 1, row })) === color;
    }

    @bind private closedRight(color: Color) {
        const { game, index } = this.props;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col + 1, row })) === color;
    }

    @computed private get valid() {
        const { game, index } = this.props;
        const errorMessage = game.turnValid(index);
        return this.login.userId === game.currentUser.id && typeof errorMessage === "undefined";
    }

    @computed private get asset() {
        const { color, hovered, locked, ownColor } = this;
        if (color === Color.BLACK) { return this.assets.get(tokenBlack); }
        if (color === Color.WHITE) { return this.assets.get(tokenWhite); }
        if (hovered || locked) {
            if (ownColor === Color.BLACK) { return this.assets.get(tokenBlack); }
            if (ownColor === Color.WHITE) { return this.assets.get(tokenWhite); }
        }
    }

    @initialize
    private async loadImages() {
        await this.assets.loadImage(tokenBlack);
        await this.assets.loadImage(tokenWhite);
        await this.assets.loadImage(tokenInvalid);
        await this.assets.loadImage(tokenLast);
    }

    @bind private handleCanvasRef(element: HTMLCanvasElement) {
        this.canvas = element;
        this.renderCanvas();
        window.addEventListener("resize", () => this.renderCanvas());
    }

    @bind private handleClick() {
        if (this.color !== Color.EMPTY) {
            return;
        }
        if (this.locked === true) {
            this.handleConfirm();
        } else {
            this.locked = true;
        }
    }

    @bind private handleEnter() {
        this.hovered = true;
    }

    @bind private handleLeave() {
        this.hovered = false;
        this.handleCancel();
    }

    @bind private handleCancel() {
        this.locked = false;
    }

    @bind private handleConfirm() {
        this.locked = false;
        const { onClick } = this.props;
        if (!onClick) {
            return;
        }
        if (!this.valid) {
            return;
        }
        onClick();
    }

    public componentDidMount() { this.renderCanvas(); }
    public componentDidUpdate() { this.renderCanvas(); }

    @bind private renderCanvas() {
        if (!this.assets.loaded) { return; }
        if (!this.canvas) { return; }

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        const { width, height } = this.canvas;
        const ctx = this.canvas.getContext("2d");

        const { color, ownColor, valid, isLastTurn, asset, hovered, locked } = this;
        const { game, index } = this.props;

        ctx.clearRect(0, 0, width, height);
        if (color === Color.EMPTY && !valid && (hovered || locked)) {
            ctx.drawImage(this.assets.get(tokenInvalid), 0, 0, 200, 200, 0, 0, width, height);
            return;
        }
        if (!asset) { return; }

        const colors = {
            closedTop: color === Color.EMPTY ? this.closedTop(ownColor) : this.closedTop(color),
            closedBottom: color === Color.EMPTY ? this.closedBottom(ownColor) : this.closedBottom(color),
            closedLeft: color === Color.EMPTY ? this.closedLeft(ownColor) : this.closedLeft(color),
            closedRight: color === Color.EMPTY ? this.closedRight(ownColor) : this.closedRight(color),
        };

        const instructions = {
            width,
            height,
            ctx,
            asset,
            ...colors,
        };
        drawToken("modern", instructions);

        if (isLastTurn) {
            drawToken("modern", { ... instructions, asset: this.assets.get(tokenLast) });
        }
    }

    public render() {
        const { hovered, locked, color } = this;
        const classes = classNames({
            [css.preview]: color === Color.EMPTY && hovered && !locked,
            [css.locked]: locked,
        });
        return (
            <div
                className={classes}
                onClick={this.handleClick}
                onMouseEnter={this.handleEnter}
                onMouseLeave={this.handleLeave}
            >
                <canvas className={css.canvas} ref={this.handleCanvasRef} />
            </div>
        );
    }
}
