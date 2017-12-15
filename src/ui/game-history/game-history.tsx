import * as React from "react";
import { GamesStore } from "store";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Menu } from "semantic-ui-react";
import { HistoryEntry } from "./history-entry";
import { computed } from "mobx";

@external @observer
export class GameHistory extends React.Component {
    @inject private games: GamesStore;

    @computed private get boards() {
        return this.games.currentGame.boards.reverse().filter(board => board.turn !== 0);
    }

    public render() {
        if (!this.games.currentGame || !this.games.currentGame.boards) {
            return null; // tslint:disable-line
        }
        return (
            <Menu vertical fluid>
            {
                this.boards.map(board => <HistoryEntry board={board} key={board.id}/>)
            }
            </Menu>
        );
    }
}
