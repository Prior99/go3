import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as classNames from "classnames";
import { inject, external, initialize } from "tsdi";
import { bind } from "decko";

import { GamesStore, LoginStore, OwnUserStore } from "../../../../common-ui";
import { Game, Color, Group } from "../../../../common";
import * as css from "./cell.scss";
import { Assets, drawToken } from "../../../utils";

import * as tokenInvalid from "./token-invalid.png";

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
    @inject private ownUser: OwnUserStore;

    @observable private locked = false;
    @observable private tokenBlack: HTMLImageElement;
    @observable private tokenWhite: HTMLImageElement;
    @observable private hovered = false;

    private canvas: HTMLCanvasElement;

    constructor(props: CellProps) {
        super(props);
        window.addEventListener("resize", this.initCanvas);
    }

    @computed private get color() { return this.props.game.currentBoard.at(this.props.index); }
    @computed private get ownColor() { return this.props.game.getColorForUser(this.login.userId); }
    @computed private get isLastTurn() { return this.props.game.currentBoard.placedAt === this.props.index; }

    @bind private closedTopLeft(color: Color) {
        const { game, index } = this.props;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === 0 || row === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col - 1, row: row - 1 })) === color;
    }

    @bind private closedBottomLeft(color: Color) {
        const { game, index } = this.props;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === 0 || row === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col - 1, row: row + 1 })) === color;
    }

    @bind private closedTopRight(color: Color) {
        const { game, index } = this.props;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === game.boardSize - 1 || row === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col + 1, row: row - 1 })) === color;
    }

    @bind private closedBottomRight(color: Color) {
        const { game, index } = this.props;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === game.boardSize - 1 || row === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col + 1, row: row + 1 })) === color;
    }

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

    @computed private get renderedColor() {
        const { color, hovered, locked, ownColor } = this;
        if (color !== Color.EMPTY) { return color; }
        if (hovered || locked) {
            return ownColor;
        }
        return Color.EMPTY;
    }

    @computed private get group(): Group {
        return this.props.game.currentBoard.groupAt(this.props.index);
    }

    @bind private async initCanvas() {
        if (!this.canvas) {
            return;
        }
        const ratio = window.devicePixelRatio || 1;
        const { clientWidth, clientHeight } = this.canvas;
        const width = clientWidth * ratio;
        const height = clientHeight * ratio;

        await this.assets.loadImage(tokenInvalid, width, height);

        this.canvas.width = width;
        this.canvas.height = height;

        this.renderCanvas();
    }

    @bind private handleCanvasRef(element: HTMLCanvasElement) {
        this.canvas = element;
        this.initCanvas();
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

        const { width, height } = this.canvas;
        const ctx = this.canvas.getContext("2d");

        (ctx as any).imageSmoothingEnabled = "high";

        const { color, ownColor, valid, isLastTurn, renderedColor, hovered, locked, group } = this;
        const { game, index } = this.props;

        ctx.clearRect(0, 0, width, height);
        if (color === Color.EMPTY && !valid && (hovered || locked)) {
            ctx.drawImage(this.assets.get(tokenInvalid, width, height), 0, 0, width, height, 0, 0, width, height);
            return;
        }

        const colors = {
            closedTop: color === Color.EMPTY ? this.closedTop(ownColor) : this.closedTop(color),
            closedBottom: color === Color.EMPTY ? this.closedBottom(ownColor) : this.closedBottom(color),
            closedLeft: color === Color.EMPTY ? this.closedLeft(ownColor) : this.closedLeft(color),
            closedRight: color === Color.EMPTY ? this.closedRight(ownColor) : this.closedRight(color),
            closedTopLeft: color === Color.EMPTY ? this.closedTopLeft(ownColor) : this.closedTopLeft(color),
            closedTopRight: color === Color.EMPTY ? this.closedTopRight(ownColor) : this.closedTopRight(color),
            closedBottomRight: color === Color.EMPTY ? this.closedBottomRight(ownColor) : this.closedBottomRight(color),
            closedBottomLeft: color === Color.EMPTY ? this.closedBottomLeft(ownColor) : this.closedBottomLeft(color),
        };

        const instructions = {
            width,
            height,
            ctx,
            color: renderedColor,
            last: false,
            ...colors,
            preview: color === Color.EMPTY && (locked || hovered),
            status: group.status,
        };
        drawToken(this.ownUser.user.renderingStrategy, instructions);

        if (isLastTurn) {
            drawToken(this.ownUser.user.renderingStrategy, { ...instructions, last: true });
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
