import * as React from "react";
import { GamesStore } from "store";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Menu } from "semantic-ui-react";
import { Board } from "models";
import { PreviewBoard } from "ui";
import * as css from "./history-entry.scss";
import { Color } from "board-color";

export interface HistoryEntryProps {
    readonly board: Board;
}

@external @observer
export class HistoryEntry extends React.Component<HistoryEntryProps> {
    public render() {
        const { board } = this.props;
        const { col, row } = board.toPos(board.placedAt);
        return (
            <Menu.Item>
                <p>{board.created.toLocaleString()}</p>
                <div className={css.flexContainer}>
                    <div className={css.boardContainer}>
                        <PreviewBoard board={board} />
                    </div>
                    <div className={css.textContainer}>
                        <p><b>Turn:</b> {board.turn}</p>
                        <p><b>Placed at:</b> {col} / {row}</p>
                        <p><b>Score white:</b> {board.getScore(Color.WHITE)}</p>
                        <p><b>Score black:</b> {board.getScore(Color.BLACK)}</p>
                    </div>
                </div>
            </Menu.Item>
        );
    }
}
