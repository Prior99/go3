import * as React from "react";
import { List } from "semantic-ui-react";
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
            <List>
                {this.props.games.map(game => <GamesListItem game={game} key={game.id}/>)}
            </List>
        );
    }
}
