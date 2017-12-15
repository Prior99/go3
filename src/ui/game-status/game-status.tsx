import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { GamesStore, LoginStore } from "store";
import { Menu, Label } from "semantic-ui-react";
import { bind } from "bind-decorator";

@external @observer
export class GameStatus extends React.Component {
    @inject private games: GamesStore;
    @inject private login: LoginStore;

    @computed private get yourTurn() {
        return this.login.userId === this.games.currentGame.currentUser.id;
    }

    @bind
    private async handlePass() {
        await this.games.pass(this.games.currentGame);
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
            <Menu fluid stackable>
                <Menu.Item disabled>
                    Black
                    <Label>{board.prisonersBlack}</Label>
                </Menu.Item>
                <Menu.Item disabled>
                    White
                    <Label>{board.prisonersWhite}</Label>
                </Menu.Item>
                <Menu.Item disabled>
                    {
                        this.yourTurn ?
                            "Yours" :
                            "Opponent's"
                    }
                    <Label color="teal">#{board.turn}</Label>
                </Menu.Item>
                <Menu.Item
                    onClick={this.yourTurn && !game.over ? this.handlePass : undefined}
                    disabled={!this.yourTurn || game.over}
                >
                    Pass
                    <Label color={game.consecutivePasses > 0 ? "red" : undefined}>
                        {game.consecutivePasses}
                    </Label>
                </Menu.Item>
            </Menu>
        );
    }
}
