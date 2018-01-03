import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
import { Menu, Label, Modal, Header, Icon, Button } from "semantic-ui-react";
import { bind } from "decko";

import { GamesStore, LoginStore } from "../../../common-ui";

@external @observer
export class GameStatus extends React.Component {
    @inject private games: GamesStore;
    @inject private login: LoginStore;

    @observable private passRequested = false;

    @computed private get yourTurn() {
        return this.login.userId === this.games.currentGame.currentUser.id;
    }

    @bind private async handlePass() { this.passRequested = true; }
    @bind private async cancelPass() { this.passRequested = false; }
    @bind private async confirmPass() {
        this.passRequested = false;
        await this.games.pass(this.games.currentGame);
    }

    public render() {
        const { currentGame: game } = this.games;
        if (!game) {
            return null;
        }
        const { currentBoard: board } = game;
        if (!board) {
            return null;
        }
        return (
            <Menu fluid stackable>
                {
                    this.passRequested && (
                        <Modal onClose={this.cancelPass} open size="small">
                            <Header icon="question" content="Pass" />
                            <Modal.Content>
                                Are you sure you want to pass?
                            </Modal.Content>
                            <Modal.Actions>
                                <Button basic color="red" invert onClick={this.cancelPass}>
                                    <Icon name="remove" /> No
                                </Button>
                                <Button basic color="green" invert onClick={this.confirmPass}>
                                    <Icon name="check" /> Yes
                                </Button>
                            </Modal.Actions>
                        </Modal>
                    )
                }
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
