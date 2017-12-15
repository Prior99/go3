import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as css from "./board.scss";
import { Color } from "board-color";
import { Cell } from "./cell";

export interface BoardProps {
    readonly size: number;
    readonly state: Color[];
    readonly onPlace?: (index: number) => void;
    readonly minimal?: boolean;
}

export class Board extends React.Component<BoardProps> {
    private handleClick(index: number) {
        const { onPlace } = this.props;
        if (!onPlace) {
            return;
        }
        onPlace(index);
    }

    public render() {
        const { size, state, minimal } = this.props;
        const style = {
            gridTemplateRows: `repeat(${size}, 1fr)`,
            gridTemplateColumns: `repeat(${size}, 1fr)`,
        };
        return (
            <div className={css.board} style={style}>
                {
                    state.map((color, index) => {
                        const handleClick = () => this.handleClick(index);
                        return (
                            <Cell
                                minimal={minimal}
                                color={color}
                                key={index}
                                index={index}
                                onClick={handleClick}
                                size={size}
                            />
                        );
                    })
                }
            </div>
        );
    }
}
