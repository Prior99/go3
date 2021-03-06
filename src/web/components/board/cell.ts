import * as React from "react";
import { observable } from "mobx";
import * as classNames from "classnames";
import { inject, external, initialize } from "tsdi";
import { memoize } from "lodash-decorators";
import { bind } from "bind-decorator";
import { equals } from "ramda";

import { GamesStore, LoginStore, OwnUserStore } from "../../../common-ui";
import { Game, Color, Group, GroupStatus } from "../../../common";
import { Rendering, TokenDrawInstructions, Assets } from "../../utils";

import * as tokenInvalid from "./token-invalid.png";

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
        locked: boolean;
        hovered: boolean;
        sessionId: string;
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
    private get lastTurn() { return this.game.currentBoard.placedAt === this.index; }

    private get ownColor() { return this.game.getColorForUser(this.login.userId); }

    private get renderedColor() {
        const { color, hovered, locked, ownColor } = this;
        if (color !== Color.EMPTY) { return color; }
        if (hovered || locked) {
            return ownColor;
        }
        return Color.EMPTY;
    }

    private get col() { return this.game.currentBoard.toPos(this.index).col; }
    private get row() { return this.game.currentBoard.toPos(this.index).row; }

    private get x() { return this.col * this.width; }
    private get y() { return this.row * this.height; }

    private get animated() { return this.locked; }

    private get closedTopLeft() {
        const { game, index, color: actualColor, ownColor } = this;
        const snapColor = actualColor === Color.EMPTY ? ownColor : actualColor;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === 0 || row === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col - 1, row: row - 1 })) === snapColor;
    }

    private get closedBottomLeft() {
        const { game, index, color: actualColor, ownColor } = this;
        const snapColor = actualColor === Color.EMPTY ? ownColor : actualColor;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === 0 || row === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col - 1, row: row + 1 })) === snapColor;
    }

    private get closedTopRight() {
        const { game, index, color: actualColor, ownColor } = this;
        const snapColor = actualColor === Color.EMPTY ? ownColor : actualColor;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === game.boardSize - 1 || row === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col + 1, row: row - 1 })) === snapColor;
    }

    private get closedBottomRight() {
        const { game, index, color: actualColor, ownColor } = this;
        const snapColor = actualColor === Color.EMPTY ? ownColor : actualColor;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === game.boardSize - 1 || row === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col + 1, row: row + 1 })) === snapColor;
    }

    private get closedTop() {
        const { game, index, color: actualColor, ownColor } = this;
        const snapColor = actualColor === Color.EMPTY ? ownColor : actualColor;
        const { col, row } = game.currentBoard.toPos(index);
        if (row === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col, row: row - 1 })) === snapColor;
    }

    private get closedBottom() {
        const { game, index, color: actualColor, ownColor } = this;
        const snapColor = actualColor === Color.EMPTY ? ownColor : actualColor;
        const { col, row } = game.currentBoard.toPos(index);
        if (row === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col, row: row + 1 })) === snapColor;
    }

    private get closedLeft() {
        const { game, index, color: actualColor, ownColor } = this;
        const snapColor = actualColor === Color.EMPTY ? ownColor : actualColor;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === 0) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col - 1, row })) === snapColor;
    }

    private get closedRight() {
        const { game, index, color: actualColor, ownColor } = this;
        const snapColor = actualColor === Color.EMPTY ? ownColor : actualColor;
        const { col, row } = game.currentBoard.toPos(index);
        if (col === game.boardSize - 1) { return true; }
        return game.currentBoard.at(game.currentBoard.toIndex({ col: col + 1, row })) === snapColor;
    }

    private get instructions(): TokenDrawInstructions {
        const { index } = this;
        const { id } = this.game.currentBoard;
        return {
            width: this.width,
            height: this.height,
            ctx: this.ctx,
            color: this.renderedColor,
            lastTurn: this.lastTurn,
            status: this.status({ id, index }),
            valid: this.valid({ id, index }),
            closedTop: this.closedTop,
            closedBottom: this.closedBottom,
            closedLeft: this.closedLeft,
            closedRight: this.closedRight,
            closedTopLeft: this.closedTopLeft,
            closedTopRight: this.closedTopRight,
            closedBottomRight: this.closedBottomRight,
            closedBottomLeft: this.closedBottomLeft,
            locked: this.locked,
            hovered: this.hovered,
        };
    }

    @memoize(({ id, index }) => `${id},${index}`)
    private valid(_: { id: string, index: number }) {
        const { game, index } = this;
        const errorMessage = game.turnValid(index);
        return this.login.userId === game.currentUser.id && typeof errorMessage === "undefined";
    }

    @memoize(({ id, index }) => `${id},${index}`)
    private status(_: { id: string, index: number }) {
        if (this.color === "empty") { return GroupStatus.ALIVE; }
        return this.game.currentBoard.groupAt(this.index).status;
    }

    @bind public inside(x: number, y: number) {
        return this.x <= x && this.x + this.width >= x &&
            this.y <= y && this.y + this.width >= y;
    }

    @bind public onHoverStart() {
        if (this.color !== Color.EMPTY) { return; }
        this.hovered = true;
    }

    @bind public onHoverEnd() {
        this.hovered = false;
    }

    @bind public onClick() {
        if (this.color !== Color.EMPTY) {
            return;
        }
        if (this.locked === true) {
            this.handleConfirm();
            this.locked = false;
            this.hovered = false;
        } else {
            this.locked = true;
            this.hovered = false;
        }
    }

    @bind public onUnfocus() {
        this.locked = false;
    }

    @bind private handleConfirm() {
        this.locked = false;
        if (!this.valid) {
            return;
        }
        this.onConfirm(this.index);
    }

    @bind public draw(sessionId: string) {
        const { canvas, animated, assets, game, locked, hovered } = this;
        const { width: canvasWidth, height: canvasHeight } = canvas;
        const boardId = game.currentBoard.id;
        if (!assets.loaded || canvasWidth === 0 || canvasHeight === 0) { return; }
        const renderingParameters = { canvasWidth, canvasHeight, boardId, locked, hovered, sessionId };
        const rerenderNeeded = animated || !equals(renderingParameters, this.lastRenderingParameters);
        if (rerenderNeeded) {
            this.lastRenderingParameters = renderingParameters;
            this.actualDraw();
        }
    }

    @bind private actualDraw() {
        const { x, y, width, height, instructions, rendering, ctx } = this;
        ctx.clearRect(x, y, width, height);
        ctx.translate(x, y);
        rendering.drawToken(instructions);
        ctx.translate(-x, -y);
    }
}
