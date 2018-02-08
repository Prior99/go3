import * as React from "react";
import { observable } from "mobx";
import * as classNames from "classnames";
import { inject, external, initialize } from "tsdi";
import { bind } from "decko";
import { equals } from "ramda";

import { GamesStore, LoginStore, OwnUserStore } from "../../../common-ui";
import { Game, Color, Group } from "../../../common";
import { Rendering, TokenDrawInstructions, Assets } from "../../utils";

import * as tokenInvalid from "./token-invalid.png";
import { memoize } from "decko/dist/decko";

export interface CellProps {
    readonly game: Game;
    readonly index: number;
    readonly onConfirm: (index: number) => void;
    readonly canvas: HTMLCanvasElement;
}

@external
export class Cell {
    @inject private login: LoginStore;
    @inject private ownUser: OwnUserStore;
    @inject private rendering: Rendering;
    @inject private assets: Assets;

    private game: Game;
    private index: number;
    private onConfirm: (index: number) => void;
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private lastRenderingParameters: {
        canvasWidth: number;
        canvasHeight: number;
        boardId: string;
    };

    private locked = false;
    private hovered = false;

    constructor(props: CellProps) {
        this.game = props.game;
        this.index = props.index;
        this.onConfirm = props.onConfirm;
        this.canvas = props.canvas;
        this.ctx = props.canvas.getContext("2d");
    }

    private get width() { return Math.round(this.canvas.width / this.game.boardSize); }
    private get height() { return Math.round(this.canvas.height / this.game.boardSize); }

    private get color() { return this.game.currentBoard.at(this.index); }
    private get isLastTurn() { return this.game.currentBoard.placedAt === this.index; }

    @memoize
    private valid(boardId: string) {
        const { game, index } = this;
        const errorMessage = game.turnValid(index);
        return this.login.userId === game.currentUser.id && typeof errorMessage === "undefined";
    }

    private get ownColor() { return this.game.getColorForUser(this.login.userId); }

    private get renderedColor() {
        const { color, hovered, locked, ownColor } = this;
        if (color !== Color.EMPTY) { return color; }
        if (hovered || locked) {
            return ownColor;
        }
        return Color.EMPTY;
    }

    @memoize
    private groupStatus(boardId: string) {
        return this.game.currentBoard.groupAt(this.index).status;
    }

    private get x() { return this.game.currentBoard.toPos(this.index).col * this.width; }
    private get y() { return this.game.currentBoard.toPos(this.index).row * this.height; }

    private get instructions(): TokenDrawInstructions {
        const { width, height, ctx, renderedColor, isLastTurn, color, ownColor, locked, hovered, game } = this;
        return {
            width,
            height,
            ctx: this.ctx,
            color: renderedColor,
            last: isLastTurn,
            preview: color === Color.EMPTY && (locked || hovered),
            status: this.groupStatus(game.currentBoard.id),
            valid: this.valid(game.currentBoard.id),
            closedTop: color === Color.EMPTY ? this.closedTop(ownColor) : this.closedTop(color),
            closedBottom: color === Color.EMPTY ? this.closedBottom(ownColor) : this.closedBottom(color),
            closedLeft: color === Color.EMPTY ? this.closedLeft(ownColor) : this.closedLeft(color),
            closedRight: color === Color.EMPTY ? this.closedRight(ownColor) : this.closedRight(color),
            closedTopLeft: color === Color.EMPTY ? this.closedTopLeft(ownColor) : this.closedTopLeft(color),
            closedTopRight: color === Color.EMPTY ? this.closedTopRight(ownColor) : this.closedTopRight(color),
            closedBottomRight: color === Color.EMPTY ? this.closedBottomRight(ownColor) : this.closedBottomRight(color),
            closedBottomLeft: color === Color.EMPTY ? this.closedBottomLeft(ownColor) : this.closedBottomLeft(color),
        };
    }

    private get animated() { return this.locked; }

    @bind private closedTopLeft(color: Color) {
        const { game, index } = this;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === 0 || row === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col - 1, row: row - 1 })) === color;
    }

    @bind private closedBottomLeft(color: Color) {
        const { game, index } = this;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === 0 || row === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col - 1, row: row + 1 })) === color;
    }

    @bind private closedTopRight(color: Color) {
        const { game, index } = this;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === game.boardSize - 1 || row === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col + 1, row: row - 1 })) === color;
    }

    @bind private closedBottomRight(color: Color) {
        const { game, index } = this;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === game.boardSize - 1 || row === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col + 1, row: row + 1 })) === color;
    }

    @bind private closedTop(color: Color) {
        const { game, index } = this;
        const { col, row } = game.currentBoard.toPos(index);
        if (row === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col, row: row - 1 })) === color;
    }

    @bind private closedBottom(color: Color) {
        const { game, index } = this;
        const { col, row } = game.currentBoard.toPos(index);
        if (row === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col, row: row + 1 })) === color;
    }

    @bind private closedLeft(color: Color) {
        const { game, index } = this;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col - 1, row })) === color;
    }

    @bind private closedRight(color: Color) {
        const { game, index } = this;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col + 1, row })) === color;
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
        if (!this.valid) {
            return;
        }
        this.onConfirm(this.index);
    }

    @bind public draw() {
        const { canvas, animated, assets, game } = this;
        const { width: canvasWidth, height: canvasHeight } = canvas;
        const boardId = game.currentBoard.id;
        if (!assets.loaded || canvasWidth === 0 || canvasHeight === 0) { return; }
        if (animated) {
            this.actualDraw();
            return;
        }
        const renderingParameters = { canvasWidth, canvasHeight, boardId };
        const rerenderNeeded = !equals(renderingParameters, this.lastRenderingParameters);
        if (rerenderNeeded) {
            this.lastRenderingParameters = renderingParameters;
            this.actualDraw();
        }
    }

    @bind public actualDraw() {
        const { x, y, width, height, instructions, rendering, ctx } = this;
        ctx.clearRect(x, y, width, height);
        ctx.translate(x, y);
        rendering.drawToken(instructions);
        ctx.translate(-x, -y);
    }
}
