import * as React from "react";
import { Menu } from "semantic-ui-react";
import { Game } from "models";
import { observer } from "mobx-react";
import { formatBoardSize } from "board-sizes";
import { Color } from "board-color";
import { UsersStore } from "../../../store";
import { external, inject } from "tsdi";
import { computed } from "mobx/lib/mobx";
import { History } from "history";
import { routeGame } from "routing";
import { bind } from "bind-decorator";

export interface GamesListItemProps {
    readonly game: Game;
}

@observer @external
export class GamesListItem extends React.Component<GamesListItemProps> {
    @inject private users: UsersStore;
    @inject private browserHistory: History;

    private getUserByColor(color: Color) {
        const userId = this.props.game.participants.find(participant => participant.color === color).user.id;
        const user = this.users.byId(userId);
        return user ? user.name : "Loading";
    }

    @computed private get blackUser() { return this.getUserByColor(Color.BLACK); }
    @computed private get whiteUser() { return this.getUserByColor(Color.WHITE); }

    @bind private handleClick() {
        this.browserHistory.push(routeGame.path(this.props.game.id));
    }

    public render() {
        const { boardSize } = this.props.game;
        return (
            <Menu.Item onClick={this.handleClick}>
                <p>{this.blackUser} <b>vs</b> {this.whiteUser} on a {formatBoardSize(boardSize)} board</p>
            </Menu.Item>
        );
    }
}
