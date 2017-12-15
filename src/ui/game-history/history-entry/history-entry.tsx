import * as React from "react";
import { GamesStore } from "store";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Menu } from "semantic-ui-react";
import { Board } from "models";
import { PreviewBoard } from "ui";
import * as css from "./history-entry.scss";

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
                <div className={css.flexContainer}>
                    <div className={css.boardContainer}>
                        <PreviewBoard board={board} />
                    </div>
                    <div className={css.textContainer}>
                        <p><b>Turn:</b> {board.turn}</p>
                        <p><b>Placed at:</b> {col} / {row}</p>
                        <p><b>Prisoners white:</b> {board.prisonersWhite}</p>
                        <p><b>Prisoners black:</b> {board.prisonersBlack}</p>
                        <p><b>Date:</b> {board.created}</p>
                    </div>
                </div>
            </Menu.Item>
        );
    }
}