import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Menu } from "semantic-ui-react";

import { Board, Color, formatPosition } from "../../../../common";
import { GamesStore } from "../../../../common-ui";
import { PreviewBoard, Infos, InfoName, InfoValue } from "../..";
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
                <p>{board.created.toLocaleString()}</p>
                <div className={css.flexContainer}>
                    <div className={css.boardContainer}>
                        <PreviewBoard board={board} />
                    </div>
                    <div className={css.textContainer}>
                        <Infos>
                            <InfoName>Turn:</InfoName>
                            <InfoValue>{board.turn}</InfoValue>
                            <InfoName>Placed at:</InfoName>
                            <InfoValue>{formatPosition(board.toPos(board.placedAt), board.size)}</InfoValue>
                            <InfoName>Score White:</InfoName>
                            <InfoValue>{board.getScore(Color.WHITE)}</InfoValue>
                            <InfoName>Score Black:</InfoName>
                            <InfoValue>{board.getScore(Color.BLACK)}</InfoValue>
                        </Infos>
                    </div>
                </div>
            </Menu.Item>
        );
    }
}
