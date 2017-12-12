import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as css from "./cell.scss";
import { Color } from "board-color";
import * as classNames from "classnames";

export interface CellProps {
    readonly color: Color;
    readonly index: number;
}

export class Cell extends React.Component<CellProps> {
    public render() {
        return (
            <div className={css.cell} />
        );
    }
}
