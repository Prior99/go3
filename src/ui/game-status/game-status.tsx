import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { GamesStore, LoginStore } from "store";
import { Menu, Label } from "semantic-ui-react";

@external @observer
export class GameStatus extends React.Component {
    @inject private games: GamesStore;
    @inject private login: LoginStore;

    @computed private get yourTurn() {
        return this.login.userId === this.games.currentGame.currentUser.id;
    }

    public render() {
        const { currentGame: game } = this.games;
        if (!game) {
            return null; // tslint:disable-line
        }
        const { currentBoard: board } = game;
        if (!board) {
            return null; // tslint:disable-line
        }
        return (
            <Menu fluid>
                <Menu.Item>
                    Prisoners Black
                    <Label>{board.prisonersBlack}</Label>
                </Menu.Item>
                <Menu.Item>
                    Prisoners White
                    <Label>{board.prisonersWhite}</Label>
                </Menu.Item>
                <Menu.Item disabled={!this.yourTurn}>
                    {
                        this.yourTurn ?
                            "It's your turn" :
                            "it's your opponent's turn"
                    }
                    <Label color="teal">#{board.turn}</Label>
                </Menu.Item>
            </Menu>
        );
    }
}
