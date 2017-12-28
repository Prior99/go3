import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as classNames from "classnames";
import { inject, external } from "tsdi";
import { bind } from "bind-decorator";

import { GamesStore, LoginStore } from "../../../../common-ui";
import { Game, Color } from "../../../../common";
import * as css from "./cell.scss";

export interface CellProps {
    readonly game: Game;
    readonly index: number;
    readonly onClick?: () => void;
    readonly minimal?: boolean;
}

@external @observer
export class Cell extends React.Component<CellProps> {
    @inject private login: LoginStore;

    @observable private locked = false;

    @bind private handleClick() {
        if (this.locked === true) {
            this.handleConfirm();
        } else {
            this.locked = true;
        }
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

    @computed private get valid() {
        const { game, index } = this.props;
        const errorMessage = game.turnValid(index);
        return this.login.userId === game.currentUser.id && typeof errorMessage === "undefined";
    }

    public render() {
        const { game, index, minimal } = this.props;
        const { boardSize } = game;
        const color = game.currentBoard.at(index);
        const ownColor = game.getColorForUser(this.login.userId);
        const tokenColorClass = classNames({
            [css.black]: color === Color.BLACK,
            [css.white]: color === Color.WHITE,
        });
        const previewColorClass = classNames({
            [css.black]: ownColor === Color.BLACK,
            [css.white]: ownColor === Color.WHITE,
            [css.invalid]: !this.valid,
            [css.preview]: !this.locked,
            [css.locked]: this.locked,
        });
        const cellClass = classNames(css.cell, !minimal ? {
            [css.cellTop]: index < boardSize,
            [css.cellRight]: index % boardSize === boardSize - 1,
            [css.cellBottom]: index > boardSize * (boardSize - 1),
            [css.cellLeft]: index % boardSize === 0,
            [css.cellTopLeft]: index === 0,
            [css.cellTopRight]: index === boardSize - 1,
            [css.cellBottomRight]: index === boardSize * boardSize - 1,
            [css.cellBottomLeft]: index === boardSize * (boardSize - 1),
        } : undefined);
        return (
            <div className={cellClass} onClick={this.handleClick} onMouseLeave={this.handleCancel}>
                { color !== Color.EMPTY && <div className={tokenColorClass} /> }
                { color === Color.EMPTY && <div className={previewColorClass} /> }
            </div>
        );
    }
}
