import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as css from "./board.scss";
import { Color } from "board-color";
import { Cell } from "./cell";

export interface BoardProps {
    readonly size: number;
    readonly state: Color[];
}

export class Board extends React.Component<BoardProps> {
    public render() {
        const { size, state } = this.props;
        const style = {
            gridTemplateRows: `repeat(${size}, 1fr)`,
            gridTemplateColumns: `repeat(${size}, 1fr)`,
        };
        return (
            <div className={css.board} style={style}>
                {
                    state.map((color, index) => <Cell color={color} key={index} index={index} />)
                }
            </div>
        );
    }
}
