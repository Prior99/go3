import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as css from "./board.scss";
import { Color } from "board-color";
import { Cell } from "./cell";
import { Game } from "models";

export interface BoardProps {
    readonly game?: Game;
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

    @computed private get winningColor() {
        const { game } = this.props;
        const board = game.currentBoard;
        const scoreWhite = board.getScore(Color.WHITE);
        const scoreBlack = board.getScore(Color.BLACK);
        if (scoreWhite === scoreBlack) {
            return "Tie";
        }
        if (scoreWhite > scoreBlack) {
            return `White (${game.whiteUser.name}) wins`;
        }
        return `Black (${game.blackUser.name}) wins`;
    }

    public render() {
        const { game, minimal } = this.props;
        const { currentBoard: board, over } = game;
        const { size, state } = board;
        const style = {
            gridTemplateRows: `repeat(${size}, 1fr)`,
            gridTemplateColumns: `repeat(${size}, 1fr)`,
        };
        return (
            <div className={css.container}>
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
                {
                    over && (
                        <div className={css.over}>
                            <div className={css.gameOver}>Game Over!</div>
                            <div className={css.winningColor}>{this.winningColor}</div>
                        </div>
                    )
                }
            </div>
        );
    }
}
