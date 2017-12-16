import * as React from "react";
import { Menu, Segment } from "semantic-ui-react";
import { observer } from "mobx-react";

import { Game } from "../../../models";
import { GamesListItem } from "./games-list-item";

export interface GamesListProps {
    readonly games: Game[];
}

@observer
export class GamesList extends React.Component<GamesListProps> {
    public render() {
        return (
            <Segment.Group>
                {
                    this.props.games
                        .filter(game => !game.over)
                        .map(game => <GamesListItem game={game} key={game.id}/>)
                }
            </Segment.Group>
        );
    }
}
