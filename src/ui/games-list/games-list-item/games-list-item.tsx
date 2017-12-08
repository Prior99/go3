import * as React from "react";
import { Menu } from "semantic-ui-react";
import { Game } from "models";
import { observer } from "mobx-react";
import { formatBoardSize } from "board-sizes";
import { Color } from "board-color";
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
    @inject private browserHistory: History;

    @bind private handleClick() {
        this.browserHistory.push(routeGame.path(this.props.game.id));
    }

    public render() {
        const { boardSize } = this.props.game;
        return (
            <Menu.Item onClick={this.handleClick}>
                <p>{this.props.game.description}</p>
            </Menu.Item>
        );
    }
}
