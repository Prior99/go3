import * as React from "react";
import { Menu, Segment, Header } from "semantic-ui-react";
import { observer } from "mobx-react";

import { Game } from "../../../common";
import { GamesListItem } from "./games-list-item";

export interface GamesListProps {
    readonly games: Game[];
    readonly mini?: boolean;
}

@observer
export class GamesList extends React.Component<GamesListProps> {
    public render() {
        const { mini, games } = this.props;
        return (
            <Segment.Group>
                {
                    mini && (
                        <Header as="h5" attached="top">Active Games</Header>
                    )
                }
                {
                    games
                        .filter(game => !game.over)
                        .map(game => <GamesListItem mini={mini} game={game} key={game.id}/>)
                }
            </Segment.Group>
        );
    }
}
