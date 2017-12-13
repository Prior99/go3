import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as css from "./cell.scss";
import { Color } from "board-color";
import * as classNames from "classnames";
import { bind } from "bind-decorator";

export interface CellProps {
    readonly color: Color;
    readonly index: number;
    readonly onClick?: () => void;
}

export class Cell extends React.Component<CellProps> {
    @bind private handleClick() {
        const { onClick } = this.props;
        if (!onClick) {
            return;
        }
        onClick();
    }

    public render() {
        const { color } = this.props;
        return (
            <div className={css.cell} onClick={this.handleClick}>
                {
                    color === Color.BLACK ? <div className={css.black} /> :
                    color === Color.WHITE ? <div className={css.white} /> :
                    null // tslint:disable-line
                }
            </div>
        );
    }
}
