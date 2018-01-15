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

    @computed private get valid() {
        const { game, index } = this.props;
        const errorMessage = game.turnValid(index);
        return this.login.userId === game.currentUser.id && typeof errorMessage === "undefined";
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

        const { hovered, locked, valid, color, ownColor, isLastTurn } = this;
        const { game, index } = this.props;

        ctx.clearRect(0, 0, width, height);
        switch (color) {
            case Color.BLACK:
                ctx.drawImage(this.assets.get(tokenBlack), 0, 0, 200, 200, 0, 0, width, height);
                break;
            case Color.WHITE:
                ctx.drawImage(this.assets.get(tokenWhite), 0, 0, 200, 200, 0, 0, width, height);
                break;
            default:
                if (!hovered && !locked) { break; }
                if (!valid) {
                    ctx.drawImage(this.assets.get(tokenInvalid), 0, 0, 200, 200, 0, 0, width, height);
                }
                else if (ownColor === Color.BLACK) {
                    ctx.drawImage(this.assets.get(tokenBlack), 0, 0, 200, 200, 0, 0, width, height);
                }
                else if (ownColor === Color.WHITE) {
                    ctx.drawImage(this.assets.get(tokenWhite), 0, 0, 200, 200, 0, 0, width, height);
                }
                break;
        }
        if (isLastTurn) {
            ctx.drawImage(this.assets.get(tokenLast), 0, 0, 200, 200, 0, 0, width, height);
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
