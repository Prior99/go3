import * as React from "react";
import { Menu } from "semantic-ui-react";
import { Game } from "models";
import { GamesListItem } from "./games-list-item";
import { observer } from "mobx-react";

export interface GamesListProps {
    readonly games: Game[];
}

@observer
export class GamesList extends React.Component<GamesListProps> {
    public render() {
        return (
            <Menu vertical fluid borderless>
                {this.props.games.map(game => <GamesListItem game={game} key={game.id}/>)}
            </Menu>
        );
    }
}
