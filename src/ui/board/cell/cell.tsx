import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as css from "./cell.scss";
import { Color } from "board-color";
import * as classNames from "classnames";
import { bind } from "bind-decorator";
import { inject, external } from "tsdi";
import { GamesStore, LoginStore } from "store";

export interface CellProps {
    readonly color: Color;
    readonly index: number;
    readonly onClick?: () => void;
    readonly size: number;
    readonly minimal?: boolean;
}

@external @observer
export class Cell extends React.Component<CellProps> {
    @inject private games: GamesStore;
    @inject private login: LoginStore;

    @bind private handleClick() {
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
        const errorMessage = this.games.currentGame.turnValid(this.props.index);
        return this.login.userId === this.games.currentGame.currentUser.id &&
            typeof errorMessage === "undefined";
    }

    public render() {
        const { color, size, index, minimal } = this.props;
        const tokenColorClass = classNames({
            [css.black]: color === Color.BLACK,
            [css.white]: color === Color.WHITE,
        });
        const previewColorClass = classNames(css.preview, {
            [css.black]: this.games.ownColor === Color.BLACK,
            [css.white]: this.games.ownColor === Color.WHITE,
            [css.invalid]: !this.valid,
        });
        const cellClass = classNames(css.cell, !minimal ? {
            [css.cellTop]: index < size,
            [css.cellRight]: index % size === size - 1,
            [css.cellBottom]: index > size * (size - 1),
            [css.cellLeft]: index % size === 0,
            [css.cellTopLeft]: index === 0,
            [css.cellTopRight]: index === size - 1,
            [css.cellBottomRight]: index === size * size - 1,
            [css.cellBottomLeft]: index === size * (size - 1),
        } : undefined);
        return (
            <div className={cellClass} onClick={this.handleClick}>
                { color !== Color.EMPTY && <div className={tokenColorClass} /> }
                { color === Color.EMPTY && <div className={previewColorClass} /> }
            </div>
        );
    }
}
